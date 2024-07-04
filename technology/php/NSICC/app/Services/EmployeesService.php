<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ Employees,User };
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class EmployeesService extends AbstractService
{

    public function getList($filters = array()){

       
        $cms_user = Auth::user();
    
        $result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';
        $query = Employees::select('*')->where('archive','=','0');
        if($search_value) { 
            $search_value_arr = explode(' ', $search_value); 
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE(`fullname`,''), ' ', COALESCE(`email`, ''), ' ',COALESCE(`contact_number`, ''), ' ') like '%{$value}%'");
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
            $query = $query->orderBy('id', 'asc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $dealers = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($dealers, $num_results_filtered, $per_page, $page);
        //$result->setPath(route('Users.index'));
        return $result;

    }
   
    public function addEmployee($insert)
    {
        
        $cmsusers = Auth::user();
        if(isset($insert['user_id']))
        {
        $insert['user_id']=$insert['user_id'];

        }
        else{
        $insert['user_id']=$cmsusers->id;
        }
        $employee = Employees::create($insert);
        return $employee;
    }
    
    public function getEmployee($id)
    {
        $getemployee = Employees::select('*')->where('id', $id)->where('archive', 0)->first();
        return $getemployee;
    }

    public function showemployee($id){
        $Employee = Employees::where('id', $id)->first();
        return $Employee;
    }

    public function deleteEmployee($id)
    {
        $Employee = Employees::where('id', $id)->update(['archive'=>1]);
        if($Employee){
            return true;
        }
    }

    public function update($updateid, $data)
    {
        $Employee = Employees::find($updateid);
        $Employee->update($data);
        return $Employee;
    }



}
