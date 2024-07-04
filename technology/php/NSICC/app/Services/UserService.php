<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ User };
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class UserService extends AbstractService
{
    /**
     * get nsicc user list
     *
     * @param Array $search
     * @return array
     */
    public function getList($search)
    {
        $user = Auth::user();
        $result = [];
        $db_result = [];
        $page  = isset($search['page']) ? $search['page'] : 1;
        $per_page = isset($search['per_page']) ? $search['per_page'] : 10;
        $offset = ($page - 1) * $per_page;
        $search_value = isset($search['search']) ? $search['search']: ''; 

        $query = User::select('*')->where('archive', 0);
            if($search_value) { 
                $search_value_arr = explode(' ', $search_value); 
                foreach ($search_value_arr as $value) {
                    $query->whereRaw("concat(COALESCE(`fname`,''), ' ', COALESCE(`lname`, ''), ' ', COALESCE(`email`, ''), ' ', COALESCE(`contact_number`, ''), ' ', COALESCE(`birthdate`, ''), ' ', COALESCE(`created_at`, ''), ' ',COALESCE(`updated_at`, ''), ' ') like '%{$value}%'");
                }
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
        $result->setPath(route('Users.index'));
        return $result;
    }

    /**
     * Create Users
     *
     * @return array
     */
    function create($insert)
    {
        $users = User::where('email', $insert['email'])->first();
        if (!$users)
        {
            $users = new User;
        }
        $insert['user_password'] = \bcrypt($insert['user_password']);

        $users->fname = $insert['first_name'];
        $users->lname = $insert['last_name'];
        $users->email = $insert['email'];
        $users->password = $insert['user_password'];
        $users->contact_number = $insert['contact_number'];
        $users->birthdate = date('Y-m-d',strtotime($insert['birth_date']));
        $users->role_id = $insert['role_id'];
        $users->is_website_user = 1;
        $users->permissions = $insert['user_permissions'];
        $users->active = 1;
        $users->save();
        return $users;

    }

    public function get($userid){
        $user = User::find($userid);
        return $user;
    }

    public function update($updateid,$update_data)
    {
        $nsicc_user = User::find($updateid);

        if (isset($update_data['user_password']) && !empty($update_data['user_password']))
        {
            $password = \bcrypt($update_data['user_password']);
        }else{
            $password = $nsicc_user->password;
        }

        $data = array(
            "fname"=> $update_data['first_name'],
            "lname"=> $update_data['last_name'],
            "email"=> $update_data['email'],
            "contact_number"=> $update_data['contact_number'],
            "birthdate"=> date('Y-m-d',strtotime($update_data['birth_date'])),
            "role_id"=> $update_data['role_id'],
            "permissions"=> $update_data['user_permissions'],
            "password" =>$password,
        );
        $nsicc_user->update($data);
        return $nsicc_user;
        
    }

    function delete($deleteid)
    {
        $deleteid = User::where('id', $deleteid)->update(['archive'=>1]);
        if($deleteid){
            return true;
        }

    }

}
