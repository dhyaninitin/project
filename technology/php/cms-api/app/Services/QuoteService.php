<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use App\Model\{Quote, PortalUser, PurchaseOrder, VehicleRequest};
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use App\Enums\{Roles};
use Auth;


class QuoteService extends AbstractService
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
        $quote_id = isset($filters['quote_id']) ? $filters['quote_id']: null;
        $offset = ($page - 1) * $per_page;

        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();
        $contract_start_date = isset($filter['contract_start_date']) ? $filter['contract_start_date']: null;
        $contract_end_date = isset($filter['contract_end_date']) ? $filter['contract_end_date']: null;
        $delivery_start_date = isset($filter['delivery_start_date']) ? $filter['delivery_start_date']: null;
        $delivery_end_date = isset($filter['delivery_end_date']) ? $filter['delivery_end_date']: null;
        $year = isset($filter['year']) ? $filter['year']: null;
        $make = isset($filter['make']) ? $filter['make']: null;
        $model = isset($filter['model']) ? $filter['model']: null;
        $salesperson = isset($filter['salesperson']) ? $filter['salesperson']: null;
        $search_value = isset($filters['search']) ? $filters['search']: '';
        $final = isset($filter['final']) ? $filter['final']: '';
        
        $query = Quote::select("quotes.*","wholesale_quote.sale_date");
        
        if($search_value) {
            $search_value_arr = explode(' ', $search_value);
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(quotes.first_name, ' ', quotes.last_name, ' ', quotes.year, ' ', quotes.make, ' ', quotes.model, ' ', quotes.stock_no, ' ', quotes.request_id, ' ') like '%{$value}%'");
            }
        }

        if ($portal_user->hasRole(Roles::Concierge)) { 
            $query->where('quotes.portal_user_id', $portal_user->id);
        }

        if($year)
        {
            $query = $query->where('quotes.year', $year);
        }

        if($make )
        {
            $query = $query->where('quotes.make', $make);
        }

        if($model)
        {
            $query = $query->where('quotes.model', $model);
        }

        if ($salesperson)
        {
            if($salesperson != "-1") {
                if(!in_array('0', $salesperson)) {
                    $query = $query->whereIn('quotes.portal_user_id', $salesperson);
                    if(in_array('-1', $salesperson)) {
                        $query = $query->orWhereNull('quotes.portal_user_id');
                    }
                }
            } else {
                $query = $query->orWhereNull('quotes.portal_user_id');
            }
        }

        if ($contract_start_date)
        {   
            if(date('Y-m-d', strtotime($contract_start_date)) == date('Y-m-d', strtotime($contract_end_date))) {
                $contract_start_date = date('Y-m-d', strtotime($contract_start_date));
                $query->whereDate('quotes.contract_date', $contract_start_date);
            } else {
                $contract_start_date = date('Y-m-d', strtotime($contract_start_date. '+1 day'));
                $contract_end_date = date('Y-m-d', strtotime($contract_end_date.'+1 day'));
                $query->whereBetween('quotes.contract_date', [$contract_start_date, $contract_end_date]);
            }  
        }

        if ($delivery_start_date)
        {   
            if(date('Y-m-d', strtotime($delivery_start_date)) == date('Y-m-d', strtotime($delivery_end_date))) {
                $delivery_start_date = date('Y-m-d', strtotime($delivery_start_date));
                $query->whereDate('quotes.delivery_date', $delivery_start_date);
            } else {
                $delivery_start_date = date('Y-m-d', strtotime($delivery_start_date. '+1 day'));
                $delivery_end_date = date('Y-m-d', strtotime($delivery_end_date.'+1 day'));
                $query->whereBetween('quotes.delivery_date', [$delivery_start_date, $delivery_end_date]);
            }  
        }

        if($final == '0' || $final == '1') {
            if($final) {
                $query = $query->where('quotes.mark_as_final', 1);
            } else {
                $query = $query->where('quotes.mark_as_final', 0);
            }
        }

        $query->leftJoin("wholesale_quote", "quote_id", "=", "quotes.id");
        $num_results_filtered = $query->count();
        if ($order_by) {
            $query = $query->orderBy("quotes.{$order_by}", $order_dir);
        } else {
            $query = $query->orderBy('quotes.created_at', 'desc');
        }
        
        $query = $query->offset($offset)->limit($per_page);

        $portal_users = null;
        if($quote_id != null && $offset == 0) {
            $specificRecord = Quote::select("quotes.*","wholesale_quote.sale_date")->leftJoin("wholesale_quote", "quote_id", "=", "quotes.id")->where("quotes.id", $quote_id);
            $portal_users = $specificRecord->union($query)->get();
        } else {
            $portal_users = $query->get();
        }


        // $portal_users = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($portal_users, $num_results_filtered, $per_page, $page);
        $result->setPath(route('quotes.index'));

        return $result;
    }

    /**
     * get quote item
     *
     * @param Number $quote_id
     * @return array
     */

    public function get($quote_id)
    {
        $portal_user = Auth::user();
        $prevPOrders = PurchaseOrder::select('id')->where('quote_id', '=', $quote_id)->get()->toArray();
        
        $pIDs = [];
        foreach($prevPOrders as $key => $value){
            $pIDs[] =  $value['id'];
        }   
        $request = Quote::find($quote_id);
        if(count($pIDs) > 0){
            $request->purchase_order_ids = $pIDs; 
        }else{
            $request->purchase_order_ids = [];
        } 
        if(count( $request->request()->get()->toArray() ) > 0 ){
            $request->user_id = $request->request()->get()->first()->user_id; 
        }else{
            $request->user_id = null;
        } 
        if ($portal_user->hasRole(Roles::Concierge)) { 
            if($request->portal_user_id != $portal_user->id) {
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
        $quote = Quote::find($quote_id);
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

    public function create($request_id, $data)
    {
        $portal_user = Auth::user();
        $result = false;
        $quote = array_merge(array(
            'request_id' => $request_id,
        ), $data);
        $purchase_ids = $quote['purchase_order_ids'];
        unset($quote['purchase_order_ids']);
        unset($quote['total_purchase_order']); 
        if($quote['dealer_contact_id'] === 0){
            $quote['dealer_contact_id'] = null;
        }
        try { 
            if ($portal_user->hasRole(Roles::Concierge)) { 
                return $result;
            }
            $result = Quote::create($quote); 
            $quote_id = $result->id;
            foreach($purchase_ids as $key => $id){
                $pOrder = PurchaseOrder::find($id);
                $pOrder->quote_id = $quote_id;
                $pOrder->save();
            } 
            $result->purchase_order_ids = $purchase_ids; 
        } catch (\Exception $e) {
            return response()->json(['error' => $e], 400);
        }
        
        return $result;
    }

    /**
     * update quote item
     *
     * @param Data $data
     * @return array
     */

    public function update($quote_id, $data)
    {
        $portal_user = Auth::user();
        $quote = false; 
        $purchase_ids = $data['purchase_order_ids'];
        unset($data['purchase_order_ids']);
        unset($data['total_purchase_order']);
        try {
            if ($portal_user->hasRole(Roles::Concierge)) { 
                return $quote;
            }
            $quote = Quote::find($quote_id); 
            $quote->update($data); 
            $prevPOrders = PurchaseOrder::where('quote_id', '=', $quote_id)->get(); 
            foreach($prevPOrders as $key => $value){
               $value->quote_id = null;
               $value->wholesale_id = null;
               $value->save();                
            }   
            foreach($purchase_ids as $key => $id){
                $pOrder = PurchaseOrder::find($id);
                $pOrder->quote_id = $quote_id;
                $pOrder->save();
            }  
            $quote->purchase_order_ids = $purchase_ids; 
        } catch (\Exception $e)
        {
        }

        return $quote;
    }

    function getquotes_chart($filters){

        $portal_user = Auth::user();
        $result = [];
        $db_result = [];
        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();

        $start_d = isset($filter['start_date']) ? $filter['start_date']: null;
        $end_d = isset($filter['end_date']) ? $filter['end_date']: null;
        $source = isset($filter['source']) ? $filter['source']: null;
        $contact_owner = isset($filter['contact_owner']) ? $filter['contact_owner']: null;

        $startDate = date('Y-m-d', strtotime("$start_d")); $endDate = date('Y-m-d', strtotime(" $end_d "));
        $db_second = getenv('DB_DATABASE_SECOND');
        $query = Quote::select(DB::raw('DATE(contract_date) as date'), DB::raw('count(*) as count'));
        $query->join("{$db_second}.vehicle_requests", 'quotes.request_id', '=', "{$db_second}.vehicle_requests.id");

            if($start_d && $end_d)
            {
                $query->whereBetween('quotes.contract_date', [$startDate, $endDate]);
            }

            if(!is_null($source)){
                $source = array_map('intval', explode(',', $source));
                if(!in_array('0', $source)){
                    $query->whereIn('vehicle_requests.source_utm', $source); 
                }
            }

            if(!is_null($contact_owner)){   
                $contact_owner = array_map('intval',explode(',', $contact_owner));
                if(!in_array('0', $contact_owner)){
                    $query->whereIn('quotes.portal_user_id', $contact_owner);
                }
            }

         return $query->groupBy('date')->get()->toarray();
    }

    function getquotes_revenue($st,$ed,$source,$contact_owner){
        $sd = date('Y-m-d', strtotime("$st"));
        $ed = date('Y-m-d', strtotime("$ed"));
        $db_second = getenv('DB_DATABASE_SECOND');
        $db_first = getenv('DB_DATABASE');

        \DB::statement("SET SQL_MODE=''");
        $query = Quote::select('*','quotes.id as quotes_id');
        $query->join("{$db_second}.vehicle_requests", 'quotes.request_id', '=', "{$db_second}.vehicle_requests.id");
        $query->join("{$db_second}.user","{$db_second}.vehicle_requests.user_id",'=',"{$db_second}.user.id");
        $query->whereBetween("{$db_first}.quotes.contract_date", [$sd, $ed]); 
        
        if($source != 0 && $source != null && $contact_owner != 0 && $contact_owner != null){
            $source = \explode(',',$source);
            $contact_owner = \explode(',',$contact_owner);
            $qut_chart = $query->whereIn('vehicle_requests.source_utm', $source); 
            $query->whereIn("{$db_first}.quotes.portal_user_id", $contact_owner);
            $qut_chart = $query->get();
        }else{
            if($source != 0 && $source != null)
            {
                $source = \explode(',',$source);
                $qut_chart = $query->whereIn('vehicle_requests.source_utm', $source)->get();
            }else if(!empty($contact_owner) && $contact_owner != null){
                $contact_owner = \explode(',',$contact_owner);  
                $query->whereIn("{$db_first}.quotes.portal_user_id", $contact_owner);
                $qut_chart = $query->get();
            }else{
                $qut_chart = $query->get();
            }
        }
        
        return $qut_chart;
    }

    public function getquotes_contactowner($st,$ed,$source)
    {
        $sd = date('Y-m-d', strtotime("$st"));
        $ed = date('Y-m-d', strtotime("$ed"));
        $db_second = getenv('DB_DATABASE_SECOND');
        \DB::statement("SET SQL_MODE=''");
        $query = Quote::select('quotes.id as quotes_id','quotes.portal_user_id','quotes.contract_date')
        ->join("{$db_second}.vehicle_requests", 'quotes.request_id', '=', "{$db_second}.vehicle_requests.id");
        // $query->join("{$db_second}.user","{$db_second}.vehicle_requests.user_id",'=',"{$db_second}.user.id");

        if($source != 0 && $source!=null){
            $source = \explode(',',$source);
            $qut_chart = $query->whereBetween('contract_date', [$sd, $ed])
            ->whereIn('vehicle_requests.source_utm', $source)->groupBy("portal_user_id");
        }else{
            $qut_chart = $query->whereBetween('contract_date', [$sd, $ed])->groupBy("portal_user_id");
        }
        $contact_owner = $qut_chart->get()->pluck("portal_user_id");
        
        $filtered_portal_users_email = PortalUser::select('id','email','first_name','last_name')->whereIn('id', $contact_owner)->get();
        return $filtered_portal_users_email;
    }

    public function getRequestedYears() {
        $portal_user = Auth::user(); 
        $query = Quote::select('quotes.year as year');
        $result = $query->groupBy("year")->orderby("year",'Asc')->get();
        return $result;
    }

    public function getRequestedMake() {
        $portal_user = Auth::user(); 
        $query = Quote::select('quotes.make as make');
        $result = $query->groupBy("make")->orderby("make",'Asc')->get();
        return $result;
    }

    public function getRequestedModel() {
        $portal_user = Auth::user(); 
        $query = Quote::select('quotes.model as model');
        $result = $query->groupBy("model")->orderby("model",'Asc')->get();
        return $result;
    }

    public function getRequestedSalespersons() {
        $portal_user = Auth::user(); 
        $query = Quote::select('quotes.portal_user_id as salesperson');
        $contact_owner = $query->groupBy("salesperson")->orderby("salesperson",'Asc')->get()->pluck("salesperson");
        $result = PortalUser::select('id','email','first_name','last_name')->whereIn('id', $contact_owner)->get();
        return $result;
    }
}
