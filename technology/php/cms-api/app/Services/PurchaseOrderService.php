<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ PurchaseOrder, Quote, Vendor, PortalUser, WholeSaleQuote };
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class PurchaseOrderService extends AbstractService
{
   /**
     * get purchaseOrder list
     *
     * @return array
     */

    public function getList($filters = array())
    {
        $portal_user = Auth::user();
        $result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $perPage = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $orderBy = isset($filters['order_by']) ? $filters['order_by']: null;
        $orderDir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $perPage;

        $search = isset($filters['search']) ? $filters['search']: '';    
        $searchValue = str_replace(['"', '`', '\''], ' ', $search);
        $query = DB::table('purchase_order');
        $query->leftJoin("portal_users", "purchase_order.request_approval_from", "=", "portal_users.id");
        $query->leftJoin("vendors", "purchase_order.vendor_id", "=", "vendors.id");
        $query->leftJoin("quotes", "purchase_order.quote_id", "=", "quotes.id");
        $query->leftJoin("wholesale_quote", "purchase_order.wholesale_id", "=", "wholesale_quote.id");
        if($searchValue) { 
            $searchValueArray = explode(' ', $searchValue); 
            
            foreach ($searchValueArray as $value) { 
                $query->whereRaw("concat(purchase_order.quote_id) like '%{$value}%'");
                $query->whereRaw("concat(purchase_order.wholesale_id) like '%{$value}%'"); 
                $query->orWhereRaw("concat(purchase_order.vendor_contact_id) like '%{$value}%'"); 
                $query->orWhereRaw("concat(purchase_order.description) like '%{$value}%'"); 
                $query->orWhereRaw("concat(purchase_order.amount) like '%{$value}%'");  
                $query->orWhereRaw("concat(purchase_order.approved) like '%{$value}%'"); 
                $query->orWhereRaw("concat(purchase_order.payment_date) like '%{$value}%'"); 
                $query->orWhereRaw("concat(purchase_order.category) like '%{$value}%'");  
                $query->orWhereRaw("concat(portal_users.first_name) like '%{$value}%'");
                $query->orWhereRaw("concat(vendors.name) like '%{$value}%'");
                $query->orWhereRaw("concat(quotes.stock_no) like '%{$value}%'");
            }
             
        }
        $query->select( 'purchase_order.*', 'portal_users.first_name as request_approval_name', 'vendors.name as vendor_name', 'quotes.stock_no as stock_no','wholesale_quote.wholesale_stock_no as wholesale_stock_no');       
        $numberResultsFiltered = $query->count(); 
        if ($orderBy) {
            switch ($orderBy) {
                default:
                    $query = $query->orderBy($orderBy, $orderDir);
                    break;
            }
        } else {
            $query = $query->orderBy('id', 'desc');
        }

        $query = $query->offset($offset)->limit($perPage);

        $purchaseOrders = $query->get();
        $count = $offset; 
        $result = new LengthAwarePaginator($purchaseOrders, $numberResultsFiltered, $perPage, $page);
        $result->setPath(route('purchaseorders.index'));

        return $result;
    }

    public function getListByQuoteId($filters = array())
    {
        $portal_user = Auth::user();
        $result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10; 
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $quote_id = isset($filters['quote_id']) ? $filters['quote_id']: null;
        $wholesale_quote_id = isset($filters['wholesale_id']) ? $filters['wholesale_id']: null;
        $search_value = isset($filters['search']) ? $filters['search']: ''; 
        $offset = ($page - 1) * $per_page;
 
        $quotes_nulled = PurchaseOrder::select('id')->where('quote_id', null)->where('wholesale_id', null)->get()->toArray(); 

        $purchaseOrderArrayNull = [];
        foreach( $quotes_nulled as $key => $value){ 
            $purchaseOrderArrayNull[] =  $value['id'];  
        } 
        
        $payload = [];
        if($quote_id != 'undefined'){
            $payload = array("column_name" => 'quote_id',"id" => $quote_id );
        }else if($wholesale_quote_id != 'undefined'){
            $payload = array("column_name" => 'wholesale_id',"id" => $wholesale_quote_id );
        }

        if(!empty($payload)){
            $quotesid_arr_merge = $this->getPurchaseOrdersByid($payload,$purchaseOrderArrayNull,$filters);
            
            $query = PurchaseOrder::whereIn('id', $quotesid_arr_merge);   
            if($search_value) { 
                $search_value_arr = explode(' ', $search_value); 
                foreach ($search_value_arr as $value) {
                    $query->whereRaw("concat(COALESCE(`id`,''), ' ', COALESCE(`description`, ''), ' ') like '%{$value}%'");
                }
            } 

            $num_results_filtered = $query->count();   
            if ($order_by) {
                switch ($order_by) {
                    default:
                        $query = $query->orderBy($order_by, $order_dir);
                        break;
                }
            } else {
                $query = $query->orderBy('id', 'desc');
            } 
            $query = $query->offset($offset)->limit($per_page);

            if($quote_id != null && $offset == 0 && !$search_value) {
                $specificRecord = PurchaseOrder::select("*")->where("quote_id", $quote_id);
                $purchaseOrders = $specificRecord->union($query)->get();
            } else {
                $purchaseOrders = $query->get();
            }

            $allData = [];
            foreach( $purchaseOrders as $key => $value){
                $vendor = Vendor::select('name')->where('id', $value->vendor_id)->get()->toarray();
                if( $vendor &&  $vendor != '' && count($vendor) > 0 ){ 
                    $value->vendor_name = $vendor[0]['name'];    
                }   
                $portalUser = PortalUser::select('first_name')->where('id', $value->request_approval_from)->get()->toarray();
                if( $portalUser &&  $portalUser != '' && count($portalUser) > 0 ){ 
                    $value->request_approval_name = $portalUser[0]['first_name']; 
                }  
                $quote = Quote::select('stock_no')->where('id', $value->quote_id)->get()->toarray();
                if( $quote &&  $quote != '' && count($quote) > 0 ){ 
                    $value->stock_no = $quote[0]['stock_no']; 
                }  
                $allData[] = $value;  
            }  
            $count = $offset;
            $result = new LengthAwarePaginator($allData, $num_results_filtered, $per_page, $page);
            $result->setPath(route('purchaseorders.index'));

            return $result;
        }else{
            return false;
        }
    }


    public function getPurchaseOrdersByid($payload,$purchaseOrderArrayNull,$filters){
        $quotesid_arr = [];
        $quotesid_arr_merge = [];
        $pOrders = PurchaseOrder::select('id')->where($payload['column_name'], $payload['id'])->get()->toArray();
        if(isset($filters[$payload['column_name']]) &&  count($pOrders) > 0 ){ 
            foreach( $pOrders as $key => $value){ 
                $quotesid_arr[] =  $value['id']; 
                $quotesid_arr_merge = array_merge($quotesid_arr, $purchaseOrderArrayNull);
            }
        } else if( isset($filters[$payload['column_name']]) || !isset($filters[$payload['column_name']]) || count($pOrders) == 0 ){  
            $quotesid_arr_merge =  $purchaseOrderArrayNull;
        }
        return $quotesid_arr_merge;
    }

    /**
     * get purchaseOrder all
     *
     * @return array
     */

    public function getAll($filter)
    {
        $f_vendor = isset($filter['purchaseorderby']) ? $filter['purchaseorderby']: null; 
        $query = PurchaseOrder::select('*');        
        if ($f_vendor) {
            $query = $query->where('id', $f_vendor);
        }
        $num_results_filtered = $query->count();   
        $makes = $query->get(); 
        
        foreach( $makes as $key => $value){            
            $vendor = Vendor::select('name')->where('id', $value->vendor_id)->get()->toarray();
            if( $vendor &&  $vendor != '' && count($vendor) > 0 ){ 
                $value->vendor_name = $vendor[0]['name'];    
            }   
            $portalUser = PortalUser::select('first_name')->where('id', $value->request_approval_from)->get()->toarray();
            if( $portalUser &&  $portalUser != '' && count($portalUser) > 0 ){ 
                $value->request_approval_name = $portalUser[0]['first_name']; 
            } 
            $quote = Quote::select('stock_no')->where('id', $value->quote_id)->get()->toarray();
            if( $quote &&  $quote != '' && count($quote) > 0 ){ 
                $value->stock_no = $quote[0]['stock_no']; 
            }
        }  
        return $makes;
    }

    /**
     * get purchaseOrder item
     *
     * @param Number $p_id      
     * @return array
    */
    public function getVendorPortaluserQuoteData($p_id)
    { 
        $data = PurchaseOrder::find($p_id);
     
        $vendor = Vendor::select('name')->where('id', $data->vendor_id)->get()->toarray();
        if( $vendor &&  $vendor != '' && count($vendor) > 0 ){ 
            $data->vendor_name = $vendor[0]['name'];    
        }   
        $portalUser = PortalUser::select('first_name')->where('id', $data->request_approval_from)->get()->toarray();
        if( $portalUser &&  $portalUser != '' && count($portalUser) > 0 ){ 
            $data->request_approval_name = $portalUser[0]['first_name']; 
        }   
        $quote = Quote::select('stock_no')->where('id', $data->quote_id)->get()->toarray();
        if( $quote &&  $quote != '' && count($quote) > 0 ){ 
            $data->stock_no = $quote[0]['stock_no']; 
        } 
        return $data;
    }
    public function get($p_id)
    { 
        $data = $this->getVendorPortaluserQuoteData($p_id);
        return $data;
    }

    /**
     * create purchaseOrder item
     *
     * @param Array $data
     * @return array
     */

    public function create($data)
    {
        
        $data = PurchaseOrder::create($data); 
        $data = $this->getVendorPortaluserQuoteData($data->id);
        return $data;
    }

    /**
     * update purchaseOrder item
     *
     * @param Data $data
     * @return array
     */

    public function update($purchaseOrder_id, $data)
    {
        $purchaseOrder = PurchaseOrder::find($purchaseOrder_id); 
        $purchaseOrder->update($data); 
        $purchaseOrder = $this->getVendorPortaluserQuoteData($purchaseOrder_id);
        return $purchaseOrder;
    }

    /**
     * delete purchaseOrder item
     *
     * @param Number $purchaseOrder_id
     * @param String
     * @return array
     */

    public function delete($purchaseOrder_id)
    {
        $purchaseOrder = PurchaseOrder::find($purchaseOrder_id);
        if ($purchaseOrder) {
            $result = $purchaseOrder->delete();
        } else {
            $result = false;
        }
        return $result;
    }

    function getpurchase_order_chart($st,$ed,$sors){
        $sd = date('Y-m-d', strtotime("$st"));
        $ed = date('Y-m-d', strtotime("$ed"));
        // $source = \explode(',',$sors);
        
        $query = PurchaseOrder::select(DB::raw('DATE(payment_date) as date'), DB::raw('count(*) as count'));
        $get_purchase_order_chart = $query->whereBetween('payment_date', [$sd, $ed])->groupBy('date')->get()->toarray();
        
        return $get_purchase_order_chart;

    }
}
