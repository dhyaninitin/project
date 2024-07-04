<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ MarriageServices };
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class MservicesService extends AbstractService
{

    /**
     * get marriage service list user based
     *
     * @return array
     */

    public function getMarriageList($filters = array())
    {
        $cms_user = Auth::user();
        $result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';
        $query = MarriageServices::select('*')->where('archive','=','0');
        if($search_value) { 
            $search_value_arr = explode(' ', $search_value); 
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE(`marriage_date`,''), ' ', COALESCE(`ceremony_address`, ''), ' ', COALESCE(`email`, ''), ' ', COALESCE(`ceremony_people_count`, ''), ' ', COALESCE(`groom_full_name`, ''), ' ', COALESCE(`created_at`, ''), ' ',COALESCE(`updated_at`, ''), ' ') like '%{$value}%'");
            }
        }

        $query = $query->where('user_id', $cms_user->id);
        $num_results_filtered = $query->count();
        if ($order_by) {
            switch ($order_by) {
                default:
                    $query = $query->orderBy($order_by, $order_dir);
                    break;
            }
        } else {
            $query = $query->orderBy('id', 'asc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $dealers = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($dealers, $num_results_filtered, $per_page, $page);
        //$result->setPath(route('vmodels.index'));

        return $result;
    }

     /**
     * get marriage info
     *
     * @param String $id
     * @return array
     */

    public function getmarriage($id)
    {
        $result = MarriageServices::find($id);
        return $result;
    }
    /**
     * Add Marriage Service 
     *
     * @param Array $data
     * @return array
     */

    public function addMarriage($data)
    {
        $cms_user = Auth::user();
        $marriageService = MarriageServices::create($data);
        return $marriageService;
    }
     /**
     * Edit Marriage Service 
     *
     * @param Array $data
     * @return array
     */

    public function editmarriage($id){
        $Marriage = MarriageServices::where('id', $id)->first();
        return $Marriage;
    }
     /**
     * update Marriage Service 
     *
     * @param Array $data
     * @param String $marriage_service_id
     * @return array
     */
    public function updateMarriage($marriage_service_id, $data)
    { 
        $cms_user = Auth::user(); 
        $marriage = MarriageServices::find($marriage_service_id);
        $marriage->update($data); 
        return $marriage;
    }
  /**
     * delete marriage
     *
     * @param Array $data
     * @param String
     * @return array
     */

    public function deleteMarriage($id)
    {
        $cms_user = Auth::user();
        $marriage = MarriageServices::where('id', $id)->update(['archive'=>1]);
        if($marriage){
            return true;
        }

    }
}
