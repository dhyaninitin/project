<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ Vendor };
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class VendorService extends AbstractService
{
   /**
     * get vendor list
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
        $vendorId = isset($filters['vendor_id']) ? $filters['vendor_id']: null;
        $offset = ($page - 1) * $perPage;

        $searchValue = isset($filters['search']) ? $filters['search']: '';

        $query = Vendor::select('vendors.*');
        $query->leftJoin("contacts", "contacts.target_id", "=", "vendors.id")->distinct();

        if($searchValue) {
            $searchValueArray = explode(' ', $searchValue);
            foreach ($searchValueArray as $value) {
                $query->whereRaw("CONCAT( COALESCE(`vendors`.`name`, ''),' ',
                    COALESCE(`vendors`.`street_address`, ''), ' ',
                    COALESCE(`vendors`.`city`, ''), ' ',
                    COALESCE(`vendors`.`state`, ''), ' ',
                    COALESCE(`vendors`.`zip`, ''), ' ',
                    COALESCE(`vendors`.`phone`, ''), ' ',
                    COALESCE(`vendors`.`website`, '') , ' ',
                    COALESCE(`contacts`.`email`, '') ) 
                    like '%{$value}%'");
            }
        }
       

        if ($orderBy) {
            switch ($orderBy) {
                default:
                    $query = $query->orderBy(`vendors`.$orderBy, $orderDir);
                    break;
            }
        } else {
            $query = $query->orderBy(`vendors`.`name`, 'desc');
        }
        $query = $query->offset($offset)->limit($perPage);
        $vendors = null;

        if($vendorId != null && $offset == 0) {
            $specificRecord = Vendor::select('*')->where('id', $vendorId);
            $vendors = $specificRecord->union($query)->get();
        } else {
            $vendors = $query->get();
        }
        $numberResultsFiltered = $vendors->count();
        $count = $offset;

        $result = new LengthAwarePaginator($vendors, $numberResultsFiltered, $perPage, $page);
        $result->setPath(route('vendors.index'));

        return $result;
    }

    /**
     * get vendor all
     *
     * @return array
     */

    public function getAll($filter)
    {
        $f_vendor = isset($filter['vendor']) ? $filter['vendor']: null; 
        $query = Vendor::select('*'); 
        if ($f_vendor) {
            $query = $query->where('name', $f_vendor);
        }
        
        $makes = $query->get();
        return $makes;
    }

    /**
     * get vendor item
     *
     * @param Number $vendor_id
     * @return array
    */

    public function get($vendor_id)
    {
        $data = Vendor::find($vendor_id);
        return $data;
    }

    /**
     * create vendor item
     *
     * @param Array $data
     * @return array
     */

    public function create($data)
    {
        $data = Vendor::create($data);
        return $data;
    }

    /**
     * update vendor item
     *
     * @param Data $data
     * @return array
     */

    public function update($vendor_id, $data)
    {
        $vendor = Vendor::find($vendor_id);
        $vendor->update($data);

        return $vendor;
    }

    /**
     * delete vendor item
     *
     * @param Number $vendor_id
     * @param String
     * @return array
     */

    public function delete($vendor_id)
    {
        $vendor = Vendor::find($vendor_id);
        if ($vendor) {
            $result = $vendor->delete();
        } else {
            $result = false;
        }
        return $result;
    }
}
