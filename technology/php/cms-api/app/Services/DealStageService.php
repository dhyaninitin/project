<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use App\Model\{DealStage };
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use App\Enums\{Roles};
use Auth;


class DealStageService extends AbstractService
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

        $search_value = isset($filters['search']) ? $filters['search']: '';

        $query = DealStage::select("*");

        if($search_value) {
            
            $search_value_arr = explode(' ', $search_value);
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE(`label`,''), ' ', COALESCE(`pipeline_name`,''), ' ') like '%{$value}%'");
            }
        }
        
        $num_results_filtered = $query->count();
        if ($order_by) {
            $query = $query->orderBy($order_by, $order_dir);
        } else {
            $query = $query->orderBy('order', 'asc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $portal_users = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($portal_users, $num_results_filtered, $per_page, $page);
        $result->setPath(route('dealstages.index'));

        return $result;
    }

    /**
     * get all models
     * 
     * @return array
     */

    public function getAll()
    { 
        return DealStage::where('active', true)->orderBy('order', 'asc')->get();
    }
}