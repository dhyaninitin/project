<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{Phonelimit,User};
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class PhoneLimitService extends AbstractService
{
    /**
     * get phonelimit all
     *
     * @return array
     */

    public function getAll($filter)
    {
        $result = [];
        $page  = isset($filter['page']) ? $filter['page'] : 1;
        $per_page = isset($filter['per_page']) ? $filter['per_page'] : 10;
        $order_by = isset($filter['order_by']) ? $filter['order_by']: null;
        $order_dir = isset($filter['order_dir']) ? $filter['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;
        $query = Phonelimit::query();
        
        //Filter related to search key
        if(isset($filter['search'])){
            $search_value = isset($filter['search']) ? $filter['search']: null;
            $query->where("phone", "LIKE", "%$search_value%");
        }
        $num_results_filtered = $query->count();
        //Filter related to sort selection
        if(isset($filter['order_by'])) { 
            $order_dir = $filter['order_dir'] ? $filter['order_dir'] : 'desc';
            $query = $query->orderBy($filter['order_by'], $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);
        $phonelimit = $query->get();

        //Map blocked contact with contacts
        $phoneLimitArray = $query->get()->pluck('phone')->toarray();
        $users = User::select('id as contact_id', 'phone')->whereIn('phone',$phoneLimitArray)->get()->toarray();
    
        if(count($users) > 0) {
            $phonelimit = $phonelimit->map(function($record) use($users) {
                foreach ($users as $user) {
                    if($user['phone'] == $record->phone) {
                        $record['contact_id'] = $user['contact_id'];
                        return $record;
                    } else {
                        $record['contact_id'] = null;
                    }
                }
                return $record;
            });
        }

        $count = $offset;
        $result = new LengthAwarePaginator($phonelimit, $num_results_filtered, $per_page, $page);
        $result->setPath(route('quotes.index'));

        return $result;
        //return Phonelimit::all();
    }

    /**
     * get phonelimit item
     *
     * @param Number $contact_id
     * @return array
     */

    public function get($phonelimit_id)
    {
        $data = Phonelimit::find($phonelimit_id);
        return $data;
    }

    /**
     * create phonelimit item
     *
     * @param Number $target_id
     * @param Array $data
     * @return array
     */

    public function create( $data)
    {
        $result = Phonelimit::create( $data  ); 
     
        return $result;
    }

    /**
     * update phonelimit item
     *
     * @param Data $data
     * @return array
     */

    public function update($phonelimit_id,$data)
    { 
       
        $phonelimit = Phonelimit::find($phonelimit_id); 
        $phonelimit->update($data);  
        return $phonelimit;
    } 
    /**
     * delete phonelimit item
     *
     * @param Number $phonelimit_id
     * @param String
     * @return array
     */

    public function delete($request)
    {
        Phonelimit::destroy($request['ids']);
        return true;
    }
}
