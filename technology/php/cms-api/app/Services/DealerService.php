<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ Dealer };
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class DealerService extends AbstractService
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
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $perPage = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $orderBy = isset($filters['order_by']) ? $filters['order_by']: null;
        $orderDir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $dealerId = isset($filters['dealer_id']) ? $filters['dealer_id']: null;
        $offset = ($page - 1) * $perPage;

        $searchValue = isset($filters['search']) ? $filters['search']: '';
        $query = Dealer::select('dealers.*');
        $query->leftJoin("dealer_contacts", "dealer_contacts.dealer_id", "=", "dealers.id")->distinct();
       
        if($searchValue) {
            
            $searchValueArray = explode(' ', $searchValue);
            foreach ($searchValueArray as $value) {
                $query->whereRaw("CONCAT( COALESCE(`dealers`.`name`, ''),' ',
                    COALESCE(`dealers`.`street`, ''), ' ',
                    COALESCE(`dealers`.`city`, ''), ' ',
                    COALESCE(`dealers`.`state`, ''), ' ',
                    COALESCE(`dealers`.`zip_code`, ''), ' ',
                    COALESCE(`dealers`.`phone`, ''), ' ',
                    COALESCE(`dealers`.`website`, ''),' ',
                    COALESCE(`dealer_contacts`.`email`, '')) 
                    like '%{$value}%'");
            }
        }

        if ($orderBy) {
            switch ($orderBy) {
                default:
                    $query = $query->orderBy(`dealers`.$orderBy, $orderDir);
                    break;
            }
        } else {
            $query = $query->orderBy(`dealers`.`name`, 'desc');
        }
        $query = $query->offset($offset)->limit($perPage);
        $dealers = null;

        if($dealerId != null && $offset == 0) {
            $specificRecord = Dealer::select('*')->where('id', $dealerId);
            $dealers = $specificRecord->union($query)->get();
        } else {
            $dealers = $query->get();
        }
        $numberResultsFiltered = $dealers->count();
        $count = $offset;

        $result = new LengthAwarePaginator($dealers, $numberResultsFiltered, $perPage, $page);
        $result->setPath(route('dealers.index'));

        return $result;
    }

    /**
     * get dealer all
     *
     * @return array
     */

    public function getAll($filter)
    {
        $f_dealer = isset($filter['dealer']) ? $filter['dealer']: null;

        $query = Dealer::select('*');

        if ($f_dealer)
        {
            $query = $query->where('name', $f_dealer);
        }
        
        $makes = $query->get();
        return $makes;
    }

    /**
     * get dealer item
     *
     * @param Number $dealer_id
     * @return array
     */

    public function get($dealer_id)
    {
        $data = Dealer::find($dealer_id);
        return $data;
    }

    /**
     * create dealer item
     *
     * @param Array $data
     * @return array
     */

    public function create($data)
    {
        $data = Dealer::create($data);
        return $data;
    }

    /**
     * update dealer item
     *
     * @param Data $data
     * @return array
     */

    public function update($dealer_id, $data)
    {
        $dealer = Dealer::find($dealer_id);
        $dealer->update($data);

        return $dealer;
    }

    /**
     * delete dealer item
     *
     * @param Number $dealer_id
     * @param String
     * @return array
     */

    public function delete($dealer_id)
    {
        $dealer = Dealer::find($dealer_id);
        if ($dealer) {
            $result = $dealer->delete();
        } else {
            $result = false;
        }
        return $result;
    }
}
