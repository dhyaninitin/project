<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use App\Model\{WholeSaleQuote, PortalUser, PurchaseOrder, Quote, User };
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use App\Enums\{Roles};
use Auth;


class WholeSaleQuoteService extends AbstractService
{

    public function __construct()
    {
    }

    /**
     * get quote list
     *
     * @param Array $filters
     * @return array
     */

    public function getList($filters)
    {
        $portal_user = Auth::user();
        $result = [];
        $db_result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();
        $sale_start_date = isset($filter['sale_start_date']) ? $filter['sale_start_date']: null;
        $sale_end_date = isset($filter['sale_end_date']) ? $filter['sale_end_date']: null;
        $year = isset($filter['year']) ? $filter['year']: null;
        $make = isset($filter['make']) ? $filter['make']: null;
        $model = isset($filter['model']) ? $filter['model']: null;
        $salesperson = isset($filter['salesperson']) ? $filter['salesperson']: null;
        $newcarsalesperson = isset($filter['newcarsalesperson']) ? $filter['newcarsalesperson']: null;

        $search_value = isset($filters['search']) ? $filters['search']: '';
        $final = isset($filter['final']) ? $filter['final']: '';

        $query = WholeSaleQuote::select("*");

        if($search_value) {
            
            $search_value_arr = explode(' ', $search_value);
            foreach ($search_value_arr as $value) {
                $res = preg_replace('/[^A-Za-z0-9\-]/', '', $value);
                $query->whereRaw("concat(COALESCE(`id`,''), ' ', COALESCE(`client_name`,''), ' ', COALESCE(`wholesale_stock_no`, ''), ' ', COALESCE(`year`, ''), ' ', COALESCE(`make`, ''), ' ', COALESCE(`zip`, ''), ' ' ) like '%{$res}%'");
            }
        }

        if ($portal_user->hasRole(Roles::Concierge)) { 
            $query->where('wholesale_sale_id', $portal_user->id)->orWhere('newcar_sale_id', $portal_user->id);
        }

        if($year)
        {
            $query = $query->where('year', $year);
        }

        if($make )
        {
            $query = $query->where('make', $make);
        }

        if($model)
        {
            $query = $query->where('model', $model);
        }

        if ($salesperson)
        {
            if($salesperson != "-1") {
                if(!in_array('0', $salesperson)) {
                    $query = $query->whereIn('wholesale_sale_id', $salesperson);
                    if(in_array('-1', $salesperson)) {
                        $query = $query->orWhereNull('wholesale_sale_id');
                    }
                }
            } else {
                $query = $query->orWhereNull('wholesale_sale_id');
            }
        }

        if ($newcarsalesperson)
        {
            if($newcarsalesperson != "-1") {
                if(!in_array('0', $newcarsalesperson)) {
                    $query = $query->whereIn('newcar_sale_id', $newcarsalesperson);
                    if(in_array('-1', $newcarsalesperson)) {
                        $query = $query->orWhereNull('newcar_sale_id');
                    }
                }
            } else {
                $query = $query->orWhereNull('newcar_sale_id');
            }
        }

        if ($sale_start_date)
        {   
            if(date('Y-m-d', strtotime($sale_start_date)) == date('Y-m-d', strtotime($sale_end_date))) {
                $sale_start_date = date('Y-m-d', strtotime($sale_start_date));
                $query->whereDate('sale_date', $sale_start_date);
            } else {
                $sale_start_date = date('Y-m-d', strtotime($sale_start_date. '+1 day'));
                $sale_end_date = date('Y-m-d', strtotime($sale_end_date.'+1 day'));
                $query->whereBetween('sale_date', [$sale_start_date, $sale_end_date]);
            }  
        }

        if($final == '1' || $final == '0') {
            if($final) {
                $query = $query->where('mark_as_final', 1);
            } else {
                $query = $query->where('mark_as_final', 0);
            }
        }

        $num_results_filtered = $query->count();
        if ($order_by) {
            $query = $query->orderBy($order_by, $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $portal_users = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($portal_users, $num_results_filtered, $per_page, $page);
        $result->setPath(route('wholesalequotes.all'));

        return $result;
    }

    /**
     * get quote item
     *
     * @param Number $quote_id
     * @return array
     */

    public function get($wholeesaquote_id)
    {    
        $portal_user = Auth::user();
        $prevPOrders = PurchaseOrder::select('id')->where('wholesale_id', '=', $wholeesaquote_id)->get()->toArray();

        $pIDs = [];
        foreach($prevPOrders as $key => $value){
            $pIDs[] =  $value['id'];
        }

        $request = WholeSaleQuote::find($wholeesaquote_id);

        if(count($pIDs) > 0){
            $request->purchase_order_ids = $pIDs; 
        }else{
            $request->purchase_order_ids = [];
        }

        // if(count( $request->request()->get()->toArray() ) > 0 ){
        //     $request->user_id = $request->request()->get()->first()->user_id; 
        // }else{
        //     $request->user_id = null;
        // }
        
        if ($portal_user->hasRole(Roles::Concierge)) { 
            if($request->wholesale_sale_id != $portal_user->id && $request->newcar_sale_id != $portal_user->id) {
                return [];
            }
        }
        return $request;
    }

    /**
     * delete quote item
     *
     * @param Number $quote_id
     * @param String
     * @return array
     */

    public function delete($quote_id)
    {
        $quote = WholeSaleQuote::find($quote_id);
        if ($quote) {
            $result = $quote->delete();
        } else {
            $result = false;
        }
        return $result;
    }

    /**
     * create quote item
     *
     * @param Data $data
     * @return array
     */

    public function create($data)
    { 
        $portal_user = Auth::user();
        $result = false; 
        $purchaseOrderIds = $data['purchase_order_ids'];
        unset($data['purchase_order_ids']); 
        try {
            if ($portal_user->hasRole(Roles::Concierge)) { 
                return $result;
            }
            $result = WholeSaleQuote::create($data);
            $wholesaleQuoteId = $result->id;

            foreach($purchaseOrderIds as $key => $id){
                $purchaseOrder = PurchaseOrder::find($id);
                $purchaseOrder->wholesale_id = $wholesaleQuoteId;
                $purchaseOrder->save();
            }

            $result->purchase_order_ids = $purchaseOrderIds;     
        } catch (\Exception $e) { 
        } 
        return $result;
    }

    /**
     * update quote item
     *
     * @param Data $data
     * @return array
     */

    public function update($wholesale_id, $data)
    { 

        $portal_user = Auth::user();
        $quote = false;
        $purchase_ids = $data['purchase_order_ids'];
        unset($data['purchase_order_ids']);
        try {
           
            if ($portal_user->hasRole(Roles::Concierge)) { 
                return $quote;
            }
            
            $quote = WholeSaleQuote::find($wholesale_id);
            $quote->update($data);
            
            $prevPOrders = PurchaseOrder::where('wholesale_id', '=', $wholesale_id)->get();
            foreach($prevPOrders as $key => $value){
                $value->quote_id = null;
                $value->wholesale_id = null;
                $value->save();                
            }
            foreach($purchase_ids as $key => $id){
                $pOrder = PurchaseOrder::find($id);
                $pOrder->wholesale_id = $wholesale_id;
                $pOrder->save();
            }

            $quote->purchase_order_ids = $purchase_ids;    
        } catch (\Exception $e)
        {
        }

        return $quote;
    }

    /**
     * get quotes list by user_id
     *
     * @param Data $data
     * @return array
     */

    public function getQuoteList($filters)
    {   
        $result = [];
        $db_result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';
        $search_user = isset($filters['user_id']) ? $filters['user_id'] : '';
        $search_wholesale = isset($filters['wholesale_quote_id']) ? $filters['wholesale_quote_id'] : '';
        
        $query = Quote::select("*"); 
        if($search_value) { 
            $search_value_arr = explode(' ', $search_value);
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(stock_no, ' ') like '%{$value}%'");   
            }
        } 
        $quotesIds = [];
        if( $search_user ){ 
            if($search_user !== 'null'){
                $requests = User::find($search_user)->requests()->get();
                $requestArr = []; 
                foreach ($requests as $request) {
                    $requestArr[] = $request->id; 
                }
                $allQuotes = Quote::whereIn("request_id", $requestArr)->pluck("id")->toArray();  
                $wholeSaleQuote = WholeSaleQuote::whereIn('quote_id', $allQuotes)->pluck("quote_id")->toArray();  
                $quotesIds = array_diff($allQuotes,$wholeSaleQuote); 
                if($search_wholesale ){
                    $wholeSaleQuote = WholeSaleQuote::where('id', $search_wholesale)->whereIn('quote_id', $allQuotes)->pluck("quote_id")->toArray(); 
                    if($wholeSaleQuote != '' && count($wholeSaleQuote) > 0){ 
                        $quotesIds[] = $wholeSaleQuote[0]; 
                    }
                }      
                sort($quotesIds);
                $query = $query->whereIn("id", $quotesIds); 
            } 
        }  
        $num_results_filtered = $query->count();
        if ($order_by) {
            $query = $query->orderBy($order_by, $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $portal_users = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($portal_users, $num_results_filtered, $per_page, $page);
        $result->setPath(route('wholesalequotes.getbyquote'));

        return $result;
    }
    public function getQuoteByid($filters)
    {   
         
        $result = [];
        $db_result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'asc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';
        $search_user = isset($filters['user_id']) ? $filters['user_id'] : '';
        $search_quote_id = isset($filters['quote_id']) ? $filters['quote_id'] : '';
        
        $query = WholeSaleQuote::where('newCarAllowance', 'like', '%'.'"quote_id":'.$search_quote_id.','.'%');
         
        if($query->count() == 0){
          $query = WholeSaleQuote::where("quote_id",$search_quote_id ); 
        }

        $num_results_filtered = $query->count();
        if ($order_by) {
            $query = $query->orderBy($order_by, $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'asc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $wholesale_quotes = $query->get();
        $count = $offset;
        // dd($portal_users);
        $result = new LengthAwarePaginator($wholesale_quotes, $num_results_filtered, $per_page, $page);
        $result->setPath(route('wholesalequotes.getbyquote'));

        return $result;
    }

    public function getQuotesByUserId($user_id,$filters)
    {   
         
        $result = [];
        $db_result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'asc';
        $offset = ($page - 1) * $per_page;
        
        $query = WholeSaleQuote::where("user_id",$user_id ); 
         
        $num_results_filtered = $query->count();
        if ($order_by) {
            $query = $query->orderBy($order_by, $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'asc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $wholesale_quotes = $query->get();
        $count = $offset;
        // dd($portal_users);
        $result = new LengthAwarePaginator($wholesale_quotes, $num_results_filtered, $per_page, $page);
        $result->setPath(route('wholesalequote.alluser_quotes',$user_id));

        return $result;
    }

    public function getwholeSaler_chart($filters){
        $portal_user = Auth::user();
        $result = [];
        $db_result = [];
        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();

        $start_d = isset($filter['start_date']) ? $filter['start_date']: null;
        $end_d = isset($filter['end_date']) ? $filter['end_date']: null;
        $source = isset($filter['source']) ? $filter['source']: null;
        $contact_owner = isset($filter['contact_owner']) ? $filter['contact_owner']: null;

            $startDate = date('Y-m-d', strtotime(" $start_d "));  $endDate = date('Y-m-d', strtotime(" $end_d "));
            $db_second = getenv('DB_DATABASE_SECOND');
            $query = WholeSaleQuote::select(DB::raw('DATE(sale_date) as date'), DB::raw('count(*) as count'));
            $query->join("{$db_second}.user", 'wholesale_quote.user_id', '=', "{$db_second}.user.id");
            
            if($start_d && $end_d)
            {
                $query->whereBetween('sale_date', [$startDate, $endDate]);
            }

            if(!is_null($source)){
                $source = array_map('intval', explode(',', $source));
                if(!in_array('0', $source)){
                    $query->whereIn('user.source', $source); 
                }
            }

            if(!is_null($contact_owner)){
               $contact_owner = array_map('intval',explode(',', $contact_owner));
               if(!in_array('0', $contact_owner)){
                $query->whereIn('wholesale_quote.newcar_sale_id', $contact_owner);
               }
            }
            
            return $query->groupBy('date')->get()->toarray();
    }

    public function getrevenue_wholesale($st,$ed,$sors,$contact_owner){
        $sd = date('Y-m-d', strtotime("$st"));
        $ed = date('Y-m-d', strtotime("$ed"));
        $source = \explode(',',$sors);
        $db_second = getenv('DB_DATABASE_SECOND');
        $db = getenv('DB_DATABASE');
        $query = WholeSaleQuote::select('*','wholesale_quote.id as wholesale_id')->join("{$db_second}.user", 'wholesale_quote.user_id', '=', "{$db_second}.user.id");
        $query->whereBetween('sale_date', [$sd, $ed]);

            if($sors != 0 && $sors!=null && $contact_owner!= 0 && $contact_owner!=null)
            {
                $source = \explode(',',$sors); $contact_owner = \explode(',',$contact_owner);
                $getwhole_saler_chart = $query->whereIn('user.source', $source);
                    $filtered_portal_users_email = PortalUser::whereIn('id', $contact_owner)->pluck('email');
                    $query->whereIn("{$db}.wholesale_quote.newcar_sale_id", $filtered_portal_users_email);
                    $getwhole_saler_chart = $query->get();
            }else{
                if($sors != 0 && $sors!=null)
                {
                    $source = \explode(',',$sors);
                    $getwhole_saler_chart = $query->whereIn('user.source', $source)->get();
                }else if(!empty($contact_owner)&& $contact_owner!=null){
                    $contact_owner = \explode(',',$contact_owner);
                    // $filtered_portal_users_email = PortalUser::whereIn('id', $contact_owner)->pluck('email');
                    $query->whereIn("{$db}.wholesale_quote.newcar_sale_id", $contact_owner);
                    $getwhole_saler_chart = $query->get();
                }else{
                    $getwhole_saler_chart = $query->whereBetween('sale_date', [$sd, $ed])->get();
                }
            }    
        return $getwhole_saler_chart;

    }

    public function getwholesale_contactowner($st,$ed,$sors)
    {
        $sd = date('Y-m-d', strtotime("$st"));
        $ed = date('Y-m-d', strtotime("$ed"));
        $source = \explode(',',$sors);
        $db_second = getenv('DB_DATABASE_SECOND');
        $db = getenv('DB_DATABASE');

        \DB::statement("SET SQL_MODE=''");
        $query = WholeSaleQuote::select('portal_users.email as contact_owner_email','portal_users.id as portal_user_id', 'portal_users.first_name as first_name', 'portal_users.last_name as last_name','portal_users.email as email')
        ->join("{$db_second}.user", 'wholesale_quote.user_id', '=', "{$db_second}.user.id");
        $query->join('portal_users','portal_users.id','=',"{$db}.wholesale_quote.newcar_sale_id");

        if($sors != 0 && $sors!=null){
            $source = \explode(',',$sors);
            $getwhole_saler_chart = $query->whereBetween('sale_date', [$sd, $ed])
            ->whereIn('user.source', $source)->groupBy("{$db}.wholesale_quote.newcar_sale_id")
            ->get();
        }else{
            $getwhole_saler_chart = $query->whereBetween('sale_date', [$sd, $ed])
            ->groupBy("{$db}.wholesale_quote.newcar_sale_id")
            ->get();
        }
               
        return $getwhole_saler_chart;
    } 

    public function getRequestedYears() {
        $query = WholeSaleQuote::select('wholesale_quote.year as year');
        $result = $query->groupBy("year")->orderby("year",'Asc')->get();
        return $result;
    }

    public function getRequestedMake() {
        $portal_user = Auth::user(); 
        $query = WholeSaleQuote::select('wholesale_quote.make as make');
        $result = $query->groupBy("make")->orderby("make",'Asc')->get();
        return $result;
    }

    public function getRequestedModel() {
        $portal_user = Auth::user(); 
        $query = WholeSaleQuote::select('wholesale_quote.model as model');
        $result = $query->groupBy("model")->orderby("model",'Asc')->get();
        return $result;
    }

    public function getRequestedSalespersons() {
        $portal_user = Auth::user(); 
        $query = WholeSaleQuote::select('wholesale_quote.wholesale_sale_id as salesperson');
        $contact_owner = $query->groupBy("salesperson")->orderby("salesperson",'Asc')->get()->pluck("salesperson");
        $result = PortalUser::select('id','email','first_name','last_name')->whereIn('id', $contact_owner)->get();
        return $result;
    }

    public function getRequestedNewCarSalespersons() {
        $portal_user = Auth::user(); 
        $query = WholeSaleQuote::select('wholesale_quote.newcar_sale_id as newcarsalesperson');
        $contact_owner = $query->groupBy("newcarsalesperson")->orderby("newcarsalesperson",'Asc')->get()->pluck("newcarsalesperson");
        $result = PortalUser::select('id','email','first_name','last_name')->whereIn('id', $contact_owner)->get();
        return $result;
    }
}
