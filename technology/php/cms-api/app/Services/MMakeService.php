<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ MMake };
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class MMakeService extends AbstractService
{

    /**
     * get make list
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

        $query = MMake::whereRaw('1=1');

        $num_results_filtered = $query->count();
        if ($order_by) {
            switch ($order_by) {
                default:
                    $query = $query->orderBy($order_by, $order_dir);
                    break;
            }
        } else {
            $query = $query->orderBy('name', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $dealers = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($dealers, $num_results_filtered, $per_page, $page);
        $result->setPath(route('mmakes.index'));

        return $result;
    }

    /**
     * get all makes
     * 
     * @param array $filter
     * @return array
     */

    public function getAll($filter)
    {
        $f_dealer = isset($filter['dealer']) ? $filter['dealer']: null;

        $query = MMake::selectRaw('*');
        
        $makes = $query->get();
        return $makes;
    }

    /**
     * create or update make
     *
     * @return array
     */

    public function updateOrCreate($data, $is_new = true)
    {
        foreach ($data as $key => $item) {
            MMake::updateOrCreate(
                array(
                    'id' => $item->ID
                ),
                array(
                    'id' => $item->ID,
                    'is_domestic' => $item->IsDomestic,
                    'name' => $item->Name,
                    'captive' => json_encode($item->Captive),
                    'is_new' => $is_new,
                )
            );
        }
        return true;
    }
}
