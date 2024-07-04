<?php

namespace App\Services;

use App\Model\{CarsDirectRequest};
use Illuminate\Support\Facades\DB;
use App\Http\Resources\CarsDirectRequestCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;  
use Illuminate\Support\Collection;

class CarsDirectRequestService extends AbstractService
{ 
    /**
     * get cdr list
     *
     * @param Array $filters
     * @return array
     */ 

    public function getList($filters) {
        // echo 'hiii'; die;
        $portal_user = Auth::user();
        $result = [];
        $db_result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $offset = ($page - 1) * $per_page;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: 'created_at';
        $search_value = isset($filters['search']) ? $filters['search']: ''; 
        $query = CarsDirectRequest::select('*');  
 
		if($search_value) { 
            $search_value_arr = explode(' ', $search_value);  
            foreach ($search_value_arr as $key => $value) { 
                $query->whereRaw("concat(COALESCE(`first_name`,''), ' ', COALESCE(`last_name`, ''), ' ', COALESCE(`year`, ''), ' ', COALESCE(`make`, ''), ' ', COALESCE(`model`,''), ' ', COALESCE(`trim`,''), ' ', COALESCE(`source`,''), ' ' ) like '%{$value}%'"); 
            } 
        }  
       
		$num_results_filtered = $query->count();  
        $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc'; 
        
        if (isset($filters['order_by'])) { 
            $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
            $query = $query->orderBy($filters['order_by'], $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        } 
        $query = $query->offset($offset)->limit($per_page); 
		$carsDirectRequests = $query->get();  
        // dd($carsDirectRequests);
        $count = $offset;
        
        $result = new LengthAwarePaginator($carsDirectRequests, $num_results_filtered, $per_page, $page);
      
        $result->setPath(route('carsdirectrequests.index'));
        return $result;
    }

    /**
     * get CarsDirectRequest info
     *
     * @param String $cdr_id
     * @return array
     */

    public function get($cdr_id)
    {
        $data = CarsDirectRequest::find($cdr_id);
        return $data; 
    }
  
}
