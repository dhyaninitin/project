<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ VBrand };
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class VBrandService extends AbstractService
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

        $query = VBrand::whereRaw('1=1');

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
        $result->setPath(route('vbrands.index'));

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

        $query = VBrand::selectRaw('*');

        if ($f_year)
        {
            $query = $query->whereHas('models', function (Builder $query) use($f_year){
                $query->where('year', $f_year);
            });
        }
        
        $brands = $query->get();
        return $brands;
    }

    /**
     * get all vbrands by year
     * 
     * @param number $year
     * @return array
     */

    public function getAllByYear($year)
    {
        $brands = $this->apiService->getBrandsByYear($year);   
        return $brands;
    }
}
