<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{Vendor,Contact};
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class ContactService extends AbstractService
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
        $target_id  = isset($filters['target_id']) ? $filters['target_id'] : null;
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';

        $query = Contact::select('*');

        if ($target_id)
        {
            $query->where('target_id', $target_id);
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

        $contacts = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($contacts, $num_results_filtered, $per_page, $page);
        $result->setPath(route('contacts.index'));

        return $result;
    }

    /**
     * get contact all
     *
     * @return array
     */

    public function getAll($filter)
    {
        return Contact::all();
    }

    /**
     * get contact contact item
     *
     * @param Number $contact_id
     * @return array
     */

    public function get($contact_id)
    {
        $data = Contact::find($contact_id);
        return $data;
    }

    /**
     * create contact item
     *
     * @param Number $target_id
     * @param Array $data
     * @return array
     */

    public function create( $data)
    {
        $result = Contact::create( $data  ); 
     
        return $result;
    }

    /**
     * update contact item
     *
     * @param Data $data
     * @return array
     */

    public function update($contact_id,$data)
    { 
       
        $contact = Contact::find($contact_id); 
        $contact->update($data);  
        return $contact;
    } 
    /**
     * delete contact item
     *
     * @param Number $contact_id
     * @param String
     * @return array
     */

    public function delete($contact_id)
    {
        $contact = Contact::find($contact_id);
        if ($contact) {
            $result = $contact->delete();
        } else {
            $result = false;
        }
        return $result;
    }
}
