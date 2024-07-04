<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use App\Model\{ MInventory };
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class MInventoryService extends AbstractService
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

        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();
        $f_dealer = isset($filter['dealer']) ? $filter['dealer']: null;
        $f_year = isset($filter['year']) ? $filter['year']: null;
        $f_make = isset($filter['make']) ? $filter['make']: null;
        $f_model = isset($filter['model']) ? $filter['model']: null;
        $f_tirm = isset($filter['trim']) ? $filter['trim']: null;

        /**
         * Apply Search and Filter logic
         */
        $query = MInventory::selectRaw('*, m_inventories.id as id')
            ->join("m_makes", "m_inventories.m_make_id", "=", "m_makes.id")
            ->join("m_models", "m_inventories.m_model_id", "=", "m_models.id")
            ->join("m_dealers", "m_inventories.m_dealer_id", "=", "m_dealers.id");

        if ($f_dealer)
        {
            $query->where('m_dealers.id', $f_dealer);
        }
        if ($f_make)
        {
            $query->where('m_makes.id', $f_make);
        }
        if ($f_model)
        {
            $query->where('m_models.id', $f_model);
        }
        if ($f_tirm)
        {
            $query->where('m_inventories.id', $f_tirm);
        }
        if ($f_year)
        {
            $query->where('m_inventories.year', $f_year);
        }

        if($search_value) {
            $search_value_arr = explode(' ', $search_value);
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(m_dealers.name, ' ', m_inventories.desc, ' ', m_inventories.year, ' ', m_makes.name, ' ', m_inventories.year) like '%{$value}%'");
            }
        }
        
        $num_results_filtered = $query->count();
        if ($order_by) {
            switch ($order_by) {
                case 'make':
                    $query = $query->orderBy('m_makes.name', $order_dir);
                    break;
                case 'model':
                    $query = $query->orderBy('m_models.name', $order_dir);
                    break;
                case 'dealer':
                    $query = $query->orderBy('m_dealers.name', $order_dir);
                    break;
                default:
                    $query = $query->orderBy('m_inventories.'.$order_by, $order_dir);
                    break;
            }
        } else {
            $query = $query->orderBy('m_inventories.created_at', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $inventories = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($inventories, $num_results_filtered, $per_page, $page);
        $result->setPath(route('minventories.index'));

        return $result;
    }

    /**
     * get all invetories
     * 
     * @param array $filter
     * @return array
     */

    public function getAll($filter)
    {
        $f_model = isset($filter['model']) ? $filter['model']: null;

        $query = MInventory::with('model');
        if ($f_model)
        {
            $query = $query->whereHas('model', function (Builder $in_query) use($f_model) {
                $in_query->where('id', $f_model);
            });
        }
        
        $inventories = $query->get();
        return $inventories;
    }

    
    /**
     * create or update inventory
     *
     * @return array
     */

    public function updateOrCreate($data, $dealer_id, $is_new = true)
    {
        foreach ($data as $key => $item) {
            MInventory::updateOrCreate(
                array(
                    'vin' => $item->VIN
                ),
                array(
                    'm_dealer_id'=> $dealer_id,
                    'inventory_id'=> $item->ID,
                    'invoice'=> isset( $item->Invoice ) ? $item->Invoice : null,
                    'is_new'=> isset( $item->IsNew ) ? $item->IsNew : $is_new,
                    'msrp'=> isset( $item->MSRP ) ? $item->MSRP : null,
                    'm_make_id'=> isset( $item->MakeID ) ? $item->MakeID : null,
                    'm_model_id'=> isset( $item->ModelID ) ? $item->ModelID : null,
                    'model_number'=> isset( $item->ModelNumber ) ? $item->ModelNumber : null,
                    'mscode'=> isset( $item->MsCode ) ? $item->MsCode : null,
                    'shipping'=> isset( $item->Shipping ) ? $item->Shipping : null,
                    'desc'=> isset( $item->ShortDescription ) ? $item->ShortDescription : null,
                    'weight'=> isset( $item->Weight ) ? $item->Weight : null,
                    'year'=> $item->Year,
                    'year_display'=> $item->YearDisplay,
                    'base_msrp'=> isset( $item->BaseMSRPAmount ) ? $item->BaseMSRPAmount : null,
                    'current_mileage'=> isset( $item->CurrentMileage ) ? $item->CurrentMileage : null,
                    'exterior_color'=> isset( $item->ExteriorColor ) ? $item->ExteriorColor : null,
                    'interior_color'=> isset( $item->InteriorColor ) ? $item->InteriorColor : null,
                    'lot_age'=> isset( $item->LotAge ) ? $item->LotAge : null,
                    'price'=> isset( $item->PreferredPrice ) ? $item->PreferredPrice : null,
                    'stock_no'=> $item->StockNo,
                    'vin'=> $item->VIN,
                )
            );
        }
        return true;
    }

    /**
     * get inventory item
     *
     * @param Number $inventory_id
     * @return array
     */

    public function get($inventory_id)
    {
        $data = MInventory::find($inventory_id);
        return $data;
    }
}
