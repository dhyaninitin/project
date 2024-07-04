<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ Dealer, DealerContact };
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class DealerContactService extends AbstractService
{
   /**
     * get dealer list
     *
     * @return array
     */

    public function getList($filters = array())
    {
        $portal_user = Auth::user();
        $result = [];
        $dealer_id  = isset($filters['dealer_id']) ? $filters['dealer_id'] : null;
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';

        $query = DealerContact::select('*');

        if ($dealer_id)
        {
            $query->where('dealer_id', $dealer_id);
        }

        if($search_value) {
            
            $search_value_arr = explode(' ', $search_value);
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE(`name`,''), ' ', COALESCE(`title`,''), ' ', COALESCE(`email`,''), ' ', COALESCE(`phone`,'')) like '%{$value}%'");
            }
        }

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
        $result->setPath(route('dealer-contacts.index'));

        return $result;
    }

    /**
     * get dealer all
     *
     * @return array
     */

    public function getAll($filter)
    {
        return DealerContact::all();
    }

    /**
     * get dealer contact item
     *
     * @param Number $contact_id
     * @return array
     */

    public function get($contact_id)
    {
        $data = DealerContact::find($contact_id);
        return $data;
    }

    /**
     * create dealer contact item
     *
     * @param Number $dealer_id
     * @param Array $data
     * @return array
     */

    public function create($dealer_id, $data)
    {
        $result = Dealer::find($dealer_id)->contacts()->create(
            $data
        );
        return $result;
    }

    /**
     * update dealer contact item
     *
     * @param Data $data
     * @return array
     */

    public function update($contact_id, $data)
    {
        $dealer = DealerContact::find($contact_id);
        $dealer->update($data);

        return $dealer;
    }

    /**
     * delete dealer contact item
     *
     * @param Number $contact_id
     * @param String
     * @return array
     */

    public function delete($contact_id)
    {
        $dealer = DealerContact::find($contact_id);
        if ($dealer) {
            $result = $dealer->delete();
        } else {
            $result = false;
        }
        return $result;
    }
}
