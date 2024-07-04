<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ MatrimonialServices, User };
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class MatrimonialService extends AbstractService
{

    /**
     * get matrimonial service list user based
     *
     * @return array
     */

    public function getmatrimonialList($filters = array())
    {
        
        $cms_user = Auth::user();
    
        $result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';
        $query = MatrimonialServices::select('*')->where('archive','=','0');
        if($search_value) { 
            $search_value_arr = explode(' ', $search_value); 
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE(`full_name`,''), ' ', COALESCE(`age`, ''), ' ',COALESCE(`gender`, ''), ' ') like '%{$value}%'");
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
     * get matrimonial info
     *
     * @param String $matrimonial_id
     * @return array
     */

    public function getmatrimonial($id)
    {
        $result = MatrimonialServices::find($id);
        return $result;
    }
    /**
     * Add matrimonial Service 
     *
     * @param Array $data
     * @return array
     */

    public function addmatrimonial($insert)
    {
        
       
        $users = User::where('email', $insert['email'])->first();
        
            $cmsusers = new User;
            $cmsusers->fname = $insert['full_name'];
            $cmsusers->email = $insert['email'];
            $cmsusers->password = Hash::make($insert['password']);
            $cmsusers->contact_number = $insert['home_contact_number'];
            $cmsusers->role_id = $insert['role_id'];
            $cmsusers->is_website_user = 1;
            $cmsusers->permissions = "";
            $cmsusers->active = 1;
            $cmsusers->save();
        
    if(isset($insert['user_id']))
       {
            $insert['user_id']=$insert['user_id'];

        }
        else{
            $insert['user_id']=$cmsusers->id;
        }
        $matrimonial = MatrimonialServices::create($insert);
        return $matrimonial;
    }


     /**
     * update Matrimonial Service 
     *
     * @param Array $data
     * @param String $Matrimonial_service_id
     * @return array
     */
    public function updatematrimonial($Matrimonial_service_id, $data)
    { 
        $cms_user = Auth::user(); 
        $matrimonial = MatrimonialServices::find($Matrimonial_service_id);
        $matrimonial->update($data); 
        return $matrimonial;
    }
  /**
     * delete Matrimonial
     *
     * @param Array $data
     * @param String
     * @return array
     */

    public function deletematrimonial($id)
    {
        $cms_user = Auth::user();
        $matrimonial = MatrimonialServices::where('id', $id)->update(['archive'=>1]);
        if($matrimonial){
            return true;
        }

    }
}
