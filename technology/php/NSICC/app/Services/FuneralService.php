<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ FuneralServices, User };
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class FuneralService extends AbstractService
{

    /**
     * get Funeral service list user based
     *
     * @return array
     */

    public function getFuneralList($filters = array())
    {
        
        $cms_user = Auth::user();
        $result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';
        $approve_status = isset($filters['approve_sts']) ? $filters['approve_sts']: '';
        $query = FuneralServices::select('*')->where('archive','=','0');
        if($search_value) { 
            $search_value_arr = explode(' ', $search_value); 
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE(`deceased_name`,''), ' ', COALESCE(`dob`, ''), ' ',COALESCE(`dod`, ''), ' ',COALESCE(`approved_sts`, ''), ' ') like '%{$value}%'");
            }
        }
        /*********** Check Approve status******* */
        if($approve_status)
        {
            $query = $query->where('approved_sts', $approve_status);

        }
       /*********** User role check ******* */
        if($cms_user->role_id==1 || $cms_user->role_id==2)
        {
        }
        else{
            $query = $query->where('user_id', $cms_user->id);
        }
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
     * get Funeral info
     *
     * @param String $funeral_id
     * @return array
     */

    public function getfuneral($funeral_id)
    {
        $result = FuneralServices::find($funeral_id);
        return $result;
    }
    /**
     * Add funeral Service 
     *
     * @param Array $data
     * @return array
     */

    public function addfuneral($insert)
    {
        
       
        $users = User::where('email', $insert['email'])->first();
        
            $cmsusers = new User;
            $cmsusers->fname = $insert['deceased_name'];
            $cmsusers->email = $insert['email'];
            $cmsusers->password = Hash::make($insert['password']);
            $cmsusers->contact_number = $insert['contact'];
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
        if($insert['payment_type']==1)
        {
            //Payment Type=Pay now ,payment function
        }
        else{
        }
        $funeral = FuneralServices::create($insert);
        return $funeral;
    }


     /**
     * update Funeral Service 
     *
     * @param Array $data
     * @param String $funeral_id
     * @return array
     */
    public function updatefuneral($funeral_id, $data)
    { 
        $cms_user = Auth::user(); 
        $funeral = FuneralServices::find($funeral_id);
        $funeral->update($data); 
        return $funeral;
    }
    
  /**
     * delete Funeral
     *
     * @param Array $data
     * @param String
     * @return array
     */

    public function deleteFuneral($id)
    {
        $cms_user = Auth::user();
        $funeral = FuneralServices::where('id', $id)->update(['archive'=>1]);
        if($funeral){
            return true;
        }
    }
    
     /**
     * update Funeral Service status 
     *
     * @param Array $data
     * @param String $funeral_id
     * @return array
     */
    public function updatefuneralstatus($funeral_id, $data)
    { 
        $cms_user = Auth::user(); 
        $data['approved_sts'] = $data['approve_sts'];
        $data['approve_by_user'] = $cms_user->id;
        $funeral = FuneralServices::find($funeral_id);
        $funeral->update($data); 
        return $funeral;
    }
}
