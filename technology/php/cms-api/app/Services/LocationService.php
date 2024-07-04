<?php

namespace App\Services;

use App\Model\Location;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\LocationCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class LocationService extends AbstractService
{
    /**
     * get location list
     *
     * @param Array $filters
     * @return array
     */


    public function getList($filters)
    {
        $result = [];
        $db_result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $offset = ($page - 1) * $per_page;

        $query = Location::whereRaw('1=1');

        if(!empty($filters['search'])) {
            $searchValue = $filters['search'];
            $query = $query->where( function($wquery) use($searchValue) {
                $wquery->Where('name', 'like', '%'.strtolower($searchValue).'%')
                    ->orWhere('street_address', 'like', '%'.strtolower($searchValue).'%')
                    ->orWhere('city', 'like', '%'.strtolower($searchValue).'%')
                    ->orWhere('state', 'like', '%'.strtolower($searchValue).'%')
                    ->orWhere('created_at', 'like', '%'.strtolower($searchValue).'%')
                    ->orWhere('updated_at', 'like', '%'.strtolower($searchValue).'%');
            });
        }
        $num_results_filtered = $query->count();
        if (isset($filters['order_by'])) {
            $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
            $query = $query->orderBy($filters['order_by'], $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $users = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($users, $num_results_filtered, $per_page, $page);
        $result->setPath(route('users.index'));
        return $result;
    }

    /**
     * get location info
     *
     * @param String $location_id
     * @return array
     */

    public function get($location_id)
    {
        $result = Location::find($location_id);
        return $result;
    }

    /**
     * create locatioin
     *
     * @param Array $data
     * @return array
     */

    public function create($data)
    {
        $result = Location::create($data);
        return $result;
    }

    /**
     * update location
     *
     * @param Array $data
     * @param String $location_id
     * @return array
     */

    public function update($location_id, $data)
    {
        $location = Location::find($location_id);
        $location->update($data);
        return $location;
    }

    /**
     * delete location
     *
     * @param Array $data
     * @param String
     * @return array
     */

    public function delete($location_id)
    {
        $location = Location::find($location_id);
        if ($location) {
            try {
                $result = $location->delete();
            } catch (\Exception $e)
            {
                $result = false;
            }
        } else {
            $result = false;
        }
        return $result;
    }
}
