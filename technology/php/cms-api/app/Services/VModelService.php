<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ VModel };
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class VModelService extends AbstractService
{

    /**
     * @var ApiService
     */
    protected $apiService;

    public function __construct(ApiService $apiService)
    {
        $this->apiService = $apiService;
    }

    /**
     * get vbrand list
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

        $query = VModel::whereRaw('1=1');

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
        $result->setPath(route('vmodels.index'));

        return $result;
    }

    /**
     * get all vbrands
     * 
     * @param array $filter
     * @return array
     */

    public function getAll($filter)
    {
        $f_year = isset($filter['year']) ? $filter['year']: null;
        $f_brand_id = isset($filter['brand_id']) ? $filter['brand_id']: null;

        $query = VModel::selectRaw('*');

        if ($f_year)
        {
            $query = $query->where('year', $f_year);
        }

        if ($f_brand_id)
        {
            $query = $query->where('brand_id', $f_brand_id);
        }
        
        $models = $query->get();
        return $models;
    }

    /**
     * get all vmodels by brand and year
     * 
     * @param array $param
     * @return array
     */

    public function getAllByYear($param)
    {
        $models = $this->apiService->getModelByBrandYear($param);
        return $models;
    }
}
