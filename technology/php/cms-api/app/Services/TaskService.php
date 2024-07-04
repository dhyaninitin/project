<?php

namespace App\Services;

use App\Model\{Task,PortalUser,Log};
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Auth;
use Illuminate\Database\Eloquent\Builder;
use App\Enums\{Roles, Logs, PortalAction, TargetTypes};
use App\Traits\{PortalTraits};


class TaskService extends AbstractService
{
    use PortalTraits;
    
    public function getList($filters){
        $user = Auth::user();
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $isTaskDone = isset($filters['show_completed']) ? $filters['show_completed'] : null;
        $search_value = isset($filters['search']) ? $filters['search'] : '';
        $offset = ($page - 1) * $per_page;
        $db_name = getenv('DB_DATABASE');
        $second_db = getenv('DB_DATABASE');

        $query = Task::select('task.*','portal_users.first_name','portal_users.last_name');
        $query->join("{$db_name}.portal_users", 'task.task_owner', '=', "{$db_name}.portal_users.id");
        $query->where(function ($query) use($db_name,$user) {
            $query->where("{$db_name}.task.task_owner",$user->id);
            $query->orWhere("{$db_name}.task.created_by",$user->id);
        });

        if ($search_value) {
            $search_value_arr = explode(' ', $search_value);
            foreach ($search_value_arr as $value) {
                $query->Where("{$db_name}.task.title", 'like', '%'.($value).'%');
            }
        }

        if($isTaskDone){
            $query->where("{$db_name}.task.task_status", 1);
        } else {
            $query->where("{$db_name}.task.task_status", 0);
        }

        if ($order_by) {
            if($order_by == 'task_owner'){
                $query = $query->orderBy("{$second_db}.portal_users.first_name", $order_dir); 
            }else{
                $query = $query->orderBy("{$db_name}.task.".$order_by, $order_dir);
            }
            
        } else {
            $query = $query->orderBy("{$db_name}.task.created_at", 'asc');
        }
        
        $num_results_filtered = $query->count();
        $data = $query->offset($offset)->limit($per_page)->get();
        $count = $offset;
        $result = new LengthAwarePaginator($data, $num_results_filtered, $per_page, $page);
        $result->setPath(route('task.index'));
        return $result;
    }

    public function getTaskOwners($filters){
        $user = Auth::user();
        $result = [];
        $db_result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        
        $search_value = isset($filters['search']) ? $filters['search'] : '';
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $portalUserId = isset($filters['owner_id']) ? $filters['owner_id']: 0;
        $offset = ($page - 1) * $per_page;
        // filters
        $filter = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();
       
        $query = PortalUser::select('id','first_name','last_name');
        $db_name = getenv('DB_DATABASE_SECOND');
        $second_name = getenv('DB_DATABASE');
        
        if ($search_value) {
            $search_value_arr = explode(' ', $search_value);
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE(`first_name`,''), ' ', COALESCE(`last_name`, ''), ' ',COALESCE(`email`, ''), ' ') like '%{$value}%'");
            }
        }

        if ($order_by) {
            $query = $query->orderBy($order_by, $order_dir);
        } else {
            $query = $query->orderBy("created_at", 'asc');
        }

        $num_results_filtered = $query->count();
        $query = $query->offset($offset)->limit(($per_page-1));

        $portal_users = null;
        if($portalUserId != 0) {
            $specificRecord = PortalUser::select('id','first_name','last_name')->where("id", $portalUserId);
            $portal_users = $specificRecord->union($query)->get();
        }else{
            $specificRecord = PortalUser::select('id','first_name','last_name')->where("id", $user->id);
            $portal_users = $specificRecord->union($query)->get();
        }
        
        $count = $offset;
        $result = new LengthAwarePaginator($portal_users, $num_results_filtered, $per_page, $page);
        $result->setPath(route('tasks.getTaskOwners'));
        return $result;
    }

    public function store($data,$id){
        $user = Auth::user();
        $store = new Task;
        $store->title = $data['title'];
        $store->task_status = 0;
        $store->task_owner = $id;
        $store->created_by = $id;
        $store->save();

        $msg = "<b>".$data['title']."</b> task was <b>created</b> on portal by <b>{$user->full_name}</b> on";
        Log::create(array(
            'category'      => Logs::Task,
            'action'        => PortalAction::CREATED,
            'target_id'     => $store->id,
            'target_type'   => TargetTypes::Task,
            'portal_user_id'   => $user->id,
            'portal_user_name' => $user->full_name,
            'content'       => $msg,
        ));
        return $store;
    }

    public function update($data,$taskId){
        $portal_user = Auth::user();
        $upateSmsStatus = Task::find($taskId);
            $logArray = array(
                'category'      => Logs::Task,
                'action'        => PortalAction::UPDATED,
                'target_id'     => $taskId,
                'target_type'   => TargetTypes::Task,
                'portal_user_id'   => $portal_user->id,
                'portal_user_name' => $portal_user->full_name,
            );

            if(!empty($data['due_date'])){
                $data['due_date'] = date('Y-m-d', strtotime($data['due_date']));
            }
            $this->createUpdateLogs($upateSmsStatus,$data,'PortalTasks',$logArray);
            
        // $newDueDate = null;
        // if(!empty($upateSmsStatus->due_date)){
        //     $newDueDate = date('Y-m-d', strtotime($upateSmsStatus->due_date));
        // }

        // $msg = "";
        // if(isset($data['task_status'])) {
        //     $upateSmsStatus->update($data);
        //     if($data['task_status'] == 0) {
        //         $msg .= "<b>".$upateSmsStatus->title."</b> task was marked as incomplete by ".$portal_user->full_name;
        //     } else {
        //         $msg .= "<b>".$upateSmsStatus->title."</b> task was marked as completed by ".$portal_user->full_name;
        //     }
        // }else{
        //     $old_Data_array = [];
        //     $new_Data_array = [];

        //     if (isset($data['description'])) {
        //         $new_Data_array['description'] = $data['description'];
        //         $old_Data_array['description'] = $upateSmsStatus->description;
        //     }

        //     if (isset($data['task_owner'])) {
        //         $new_Data_array['task_owner'] = $data['task_owner'];
        //         $old_Data_array['task_owner'] = $upateSmsStatus->task_owner;
        //     }

        //     if (isset($data['title'])) {
        //         $new_Data_array['title'] = $data['title'];
        //         $old_Data_array['title'] = $upateSmsStatus->title;
        //     }

        //     if (isset($data['title'])) {
        //         $new_Data_array['title'] = $data['title'];
        //         $old_Data_array['title'] = $upateSmsStatus->title;
        //     }

        //     if (isset($data['due_date'])) {
        //         $new_Data_array['due_date'] = $dueDate;
        //         $old_Data_array['due_date'] = $newDueDate;
        //     }

        //     $old_data = collect($old_Data_array);
            $upateSmsStatus->update($data);
        //     if($upateSmsStatus){
        //         $new_data = collect($new_Data_array);
        //         $diff = $new_data->diff($old_data);

        //         // print_r($diff);
        //         // die();

        //         if (isset($diff->toArray()['description'])) {
        //             $description = $diff->toArray()['description'];
        //             if(!empty($old_data['description'])){
        //                 $msg .= "<b>".$old_data['title']."</b> task description was updated from <b>{$old_data['description']}</b> to <b>{$description}</b>, ";
        //             }else{
        //                 $msg .= "<b>".$old_data['title']."</b> task description was updated to <b>{$description}</b>, ";
        //             }
        //         }
    
        //         if (isset($diff->toArray()['title'])) {
        //             $title = $diff->toArray()['title'];
        //             $msg .= "Task title was updated from <b>{$old_data['title']}</b> to <b>{$title}</b>, ";
        //         }
    
        //         if (isset($diff->toArray()['due_date'])) {
        //             $due_date = date('Y-m-d', strtotime($diff->toArray()['due_date']));
        //             if(!empty($old_data['due_date'])){
        //                 $msg .= "<b>".$old_data['title']."</b> task due date was updated from <b>".date('Y-m-d', strtotime($old_data['due_date']))."</b> to <b>{$due_date}</b>, ";
        //             }
        //             else{
        //                 $msg .= "<b>".$old_data['title']."</b> task due date was updated to <b>{$due_date}</b>, ";
        //             }
        //         }
    
        //         if (isset($diff->toArray()['task_owner'])) {
        //             $task_owner = $diff->toArray()['task_owner'];
        //             $res = $this->getPortalUsers($task_owner,$old_data['task_owner']);
        //             $newTaskOwner = $this->array_flatten($res->where('id', $task_owner)->toarray());
        //             $oldTaskOwner = $this->array_flatten($res->where('id', $old_data['task_owner'])->toarray());
        //             $msg .= "<b>".$old_data['title']."</b> task owner was updated from <b>".$oldTaskOwner[1].' '.$oldTaskOwner[2]."</b> to <b>".$newTaskOwner[1].' '.$newTaskOwner[2]."</b>, ";
        //         }
        //         $msg = substr(trim($msg), 0, -1);
        //         $msg .= " by <b>{$portal_user->full_name}</b>";      
        //     }
        // }

        // echo $msg;
        // die();

            // Log::create(array(
            //     'category'      => Logs::Task,
            //     'action'        => PortalAction::UPDATED,
            //     'target_id'     => $taskId,
            //     'target_type'   => TargetTypes::Task,
            //     'portal_user_id'   => $portal_user->id,
            //     'portal_user_name' => $portal_user->full_name,
            //     'content'       => $msg
            // ));
        
            $db_name = getenv('DB_DATABASE');
            $query = Task::select('task.*','portal_users.first_name','portal_users.last_name');
            $query->join("{$db_name}.portal_users", 'task.task_owner', '=', "{$db_name}.portal_users.id");
            return $query->where("{$db_name}.task.id",$taskId)->get();
    } 


    public function getPortalUsers($newId,$oldId){
        return PortalUser::select('id','first_name','last_name')->whereIn('id',[$newId,$oldId])->get();
    }


    function array_flatten($array) { 
        if (!is_array($array)) { 
          return FALSE; 
        } 
        $result = array(); 
        foreach ($array as $key => $value) { 
          if (is_array($value)) { 
            $result = array_merge($result, array_flatten($value)); 
          } 
          else { 
            $result[$key] = $value; 
          } 
        } 
        return $result; 
      } 
}
