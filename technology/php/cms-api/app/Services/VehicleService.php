<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ Vehicle };
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class VehicleService extends AbstractService
{

    /**
     * get vehicl list
     *
     * @return array
     */

    public function getList($filters = array())
    {
        $portal_user = Auth::user();
        $result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';

        $query = Vehicle::whereRaw('1=1');

        $num_results_filtered = $query->count();
        if ($order_by) {
            switch ($order_by) {
                default:
                    $query = $query->orderBy($order_by, $order_dir);
                    break;
            }
        } else {
            $query = $query->orderBy('id', 'asc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $dealers = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($dealers, $num_results_filtered, $per_page, $page);
        $result->setPath(route('vmodels.index'));

        return $result;
    }

    /**
     * get all vehicls
     * 
     * @param array $filter
     * @return array
     */

    public function getAll($filter)
    {
        $f_model_id = isset($filter['model_id']) ? $filter['model_id']: null;

        $query = Vehicle::selectRaw('*');

        if ($f_model_id)
        {
            $query = $query->where('model_id', $f_model_id);
        }
        
        $vehicles = $query->get();
        return $vehicles;
    }
}
