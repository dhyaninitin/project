<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ MasterEvent,EventSharewith,User,EventParticipants };
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class EventService extends AbstractService
{
    public function store($data,$userid)
    {
        $data = Arr::add($data, 'created_by_user_id' , $userid);
        $create = MasterEvent::create($data);
        if($create){
            EventSharewith::create(['event_id'=>$create->id,'share_id'=>$data['event_share_with']]);
            return $this->show($create->id);
        }
    }

    public function show($event_id)
    {
        $query = MasterEvent::leftJoin('event_share_with','master_events.id', '=', 'event_share_with.event_id');
        $query->where('master_events.id',$event_id);
        $query->select('master_events.*','event_share_with.share_id AS share_with');
         return $query->first();
    }

    public function getlist($search)
    {
        $user = Auth::user();
        $result = [];
        $db_result = [];
        $page  = isset($search['page']) ? $search['page'] : 1;
        $per_page = isset($search['per_page']) ? $search['per_page'] : 10;
        $offset = ($page - 1) * $per_page;
        $search_value = isset($search['search']) ? $search['search']: ''; 

        $query = MasterEvent::select('master_events.*','event_share_with.share_id AS share_with');
        
            if($search_value) { 
                $search_value_arr = explode(' ', $search_value); 
                foreach ($search_value_arr as $value) {
                    $query->whereRaw("concat(COALESCE(`event_title`,''), ' ', COALESCE(`event_organizer`, ''), ' ', COALESCE(`contact_number`, ''), ' ', COALESCE(`email`, ''), ' ', COALESCE(`event_date`, ''), ' ',COALESCE(`event_start_time`, ''), ' ',COALESCE(`event_end_time`, ''), ' ',COALESCE(`event_type`, ''), ' ',COALESCE(`event_cost`, ''), ' ',COALESCE(`recurring_type`, ''), COALESCE(`created_at`, ''), ' ',COALESCE(`modifed_at`, ''), ' ') like '%{$value}%'");
                }
            } 
        $num_results_filtered = $query->count();
            if (isset($filters['order_by'])) {
                $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
                $query = $query->orderBy($filters['order_by'], $order_dir);
            } else {
                $query = $query->orderBy('created_at', 'desc');
            }

        $query->leftJoin('event_share_with','master_events.id', '=', 'event_share_with.event_id');
        $query->where('master_events.archive', 0);
        $query = $query->offset($offset)->limit($per_page);
        $users = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($users, $num_results_filtered, $per_page, $page);
        $result->setPath(route('events.getlist'));
        return $result;

    }

    public function delete($delete_id)
    {
        $DelEvent = MasterEvent::find($delete_id);
        $Eventsharewith =EventSharewith::where('event_id',$delete_id);
        $deldata = array(
            "archive" => 1
        );
        $DelEvent->update($deldata);
        $Eventsharewith->update($deldata);
        return $DelEvent;
    }

    public function update($data,$update_id)
    {
        $UpEvent = MasterEvent::find($update_id);
        $updateEvent = $UpEvent->update($data);
        if($updateEvent)
        {
            $sharewith = array("share_id"=>$data['event_share_with']);
            $Eventsharewith = EventSharewith::where('event_id',$update_id);
            $Eventsharewith->update($sharewith);
        }
        return $this->show($update_id);
    }

    public function storeParticipants($data)
    {
        $event_id = $data['event_id'];
        $participants = $data['data'];
        $check_email = $participants[0]['email'];
        $find_user = User::where('email', $check_email)->first();
        if($find_user){
            unset($participants['0']);
        }
        if($this->Add_participants($participants,$event_id)){
            return $this->showparticipants($event_id);
        }else{
            return false;
        }
        
    }

    public function Add_participants($participants,$event_id)
    {
        try {
            for ($i=0; $i <count($participants) ; $i++) { 
                $savevalue = array(
                    "full_name"=>$participants[$i]['full_name'],
                    "email"=>$participants[$i]['email'],
                    "contact_number"=>$participants[$i]['contact_number'],
                    "gender"=>$participants[$i]['gender'],
                    "age"=>$participants[$i]['age'],
                    "event_reg_id"=>$event_id
                 );
                 EventParticipants::create($savevalue);
            }
            return true;
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function showparticipants($event_id)
    {
        return EventParticipants::select('*')->where(['event_reg_id'=> $event_id,'archive'=> 0])->get();
    }

    public function updateParticipants($data,$update_id)
    {
        $Upparticipants = EventParticipants::find($update_id);
        $updatevalue = array(
            "full_name"=>$data['full_name'],
            "email"=>$data['email'],
            "contact_number"=>$data['contact_number'],
            "gender"=>$data['gender'],
            "age"=>$data['age']
         );
        $Upparticipants->update($updatevalue);
        return $Upparticipants;
    }


    public function deleteParticipants($participant_id)
    {
        $Delparticipants = EventParticipants::find($participant_id);
        $deldata = array(
            "archive" => 1
        );
        $Delparticipants->update($deldata);
        return $Delparticipants;
    }
   
}
