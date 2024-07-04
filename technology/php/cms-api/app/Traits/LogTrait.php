<?php

namespace App\Traits;

use App\Model\{PortalUser, Location, User,HubspotWorkFlows,Log};
use App\Enums\{Logs, RequestAction, PortalAction, UserAction, Roles};
use Auth;

trait LogTrait
{
    /**
     * @param Log $log
     * @return String
     */

    protected function formatPortalAction($action)
    {
        $str = '';
        switch ($action) {
            case PortalAction::UPDATED:
                $str = 'updated';
                break;
            case PortalAction::DELETED:
                $str = 'deleted';
                break;
            case PortalAction::ROLE_UPDATED:
                $str = 'updated role';
                break;
            case PortalAction::CREATED:
                $str = 'created';
                break;
            case PortalAction::CREATED:
                $str = 'created';
                break;
            default:
                break;
        }
        return $str;
    }

    /**
     * @param Number $role_id
     * @return String
     */

    protected function formatRoleString($role_id)
    {
        $str = 'XXX';
        switch ($role_id) {
            case 'superadmin':
                $str = 'SuperAdmin';
                break;
            case 'admin':
                $str = 'Admin';
                break;
            case 'administrative':
                $str = 'Administrative';
                break;
            case 'manager':
                $str = 'Manager';
                break;
            case 'salesperson':
            default:
                $str = 'Salesperson';
                break;
        }
        return $str;
    }

    /**
     * @param Number $location_id
     * @return String
     */

    protected function formatLocationString($location_id)
    {
        $str = 'XXX';
        $location = Location::find($location_id);
        if ($location)
        {
            $str = $location->name;
        }
        return $str;
    }

    /**
     * @param Log $log
     * @return String
     */

    protected function formatMessage($log)
    {
        $current_user = Auth::user();
        $portal_user_id = $log->portal_user_id;
        $custom_data = json_decode($log->content, true);
        if ($custom_data == null) {
            return $log->content;
        }

        $target = $log->target;
        $action = $this->formatPortalAction($log->action);
        $flagText = '';
        switch ($log->category) {
            case Logs::Request:
                $source_utm = null;
                $target_id = 'N/A';
                if ($target)
                {
                    $source_utm = $target->source_utm;
                    $target_id = $target->id;
                } else if($log->action == PortalAction::DELETED)
                {
                    $target_id = $custom_data['id'];
                }

                $portal_user = PortalUser::find($portal_user_id);
                if ($portal_user)
                {
                    $portal_user_name = $portal_user->full_name;
                } else {
                    $portal_user_name = $log->portal_user_name;
                }
                $message = "<b>{$portal_user_name}</b> {$action} Request #{$target_id}.";

                break;
            case Logs::Portal:
                $portal_user = PortalUser::find($portal_user_id);
                $portal_user_name = $log->portal_user_name;
                $target_full_name = 'XXX';
                if ($target)
                {
                    $target_full_name = $target->full_name;
                } else if (isset($custom_data['name'])){
                    $target_full_name = $custom_data['name'];
                }
                if ($portal_user)
                {
                    $portal_user_name = $portal_user->full_name;
                }

                // format custom message
                $custom_message = [];
                if ($log->action == PortalAction::UPDATED)
                {
                    if (isset($custom_data) && count($custom_data))
                    {
                        foreach ($custom_data as $key => $value) {

                            switch ($key) {
                                case 'first_name':
                                    $firstname = $value;
                                    $custom_message[] = " first name was {$action} to <b>{$firstname}</b>";
                                    break;
                                 case 'last_name':
                                    $lasttname = $value;
                                    $custom_message[] = " Last name was {$action} to <b>{$lasttname}</b>";
                                    break;
                                 case 'promo_code':
                                    $promocode = $value;
                                    $custom_message[] = " Promocode was {$action} to <b>{$promocode}</b>";
                                    break;
                                case 'location_id':
                                    $location = $this->formatLocationString($value);
                                    $custom_message[] = " Location  was {$action} to <b>{$location}</b>";
                                    break;
                                case 'password':
                                    $location = $this->formatLocationString($value);
                                    $custom_message[] = " password  was {$action} to";
                                    break;
                                case 'role_id':
                                    $role_str = $this->formatRoleString($value);
                                    $custom_message[] = " to <b>{$role_str}</b> Permission Level";
                                    break;
                                case 'roundrobin':
                                    if ($value)
                                    {
                                        $custom_message[] = " with <b>RoundRobin</b> enabled";
                                    } else {
                                        $custom_message[] = " with <b>RoundRobin</b> disabled";
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
                elseif ($log->action == 'login'){

                    if (isset($custom_data) && count($custom_data))
                    {
                        foreach ($custom_data as $key => $value) {

                            switch ($key) {
                                case 'name':
                                    $flagText = 'login';
                                    $name = $value;
                                    $msg = " <b>{$name}</b> was logged in ";

                                    if(isset($custom_data['source'])) {
                                        $msg = " <b>{$name}</b> was logged in {$custom_data['source']}";
                                    }
                                    $custom_message[] = $msg;
                                    break;

                                default:
                                    break;
                            }
                        }
                    }
                }
                $custom_message = implode(',', $custom_message);
                if($flagText == 'login'){
                    $message = "{$custom_message} at ";
                }
                else{
                    $message = "{$target_full_name} {$action} by <b>{$portal_user_name}<b/>";
                }
                break;
            case Logs::User:
                $portal_user = PortalUser::find($portal_user_id);
                $portal_user_name = $log->portal_user_name;
                $target_full_name = 'XXX';
                if ($target)
                {
                    $target_full_name = $target->full_name;
                } else if (isset($custom_data['name'])){
                    $target_full_name = $custom_data['name'];
                }
                if ($portal_user)
                {
                    $portal_user_name = $portal_user->full_name;
                } 

                // format custom message
                $custom_message = [];
                if ($log->action == UserAction::UPDATED || $log->action == UserAction::TOGGLED)
                {
                    if (isset($custom_data) && count($custom_data))
                    {
                        foreach ($custom_data as $key => $value) {
                            switch ($key) {
                                case 'email':
                                    $email = $value;
                                    $custom_message[] = " with Email <b>{$value}</b>";
                                    break;
                                case 'phone':
                                    $custom_message[] = " with Phone Number <b>{$value}</b>";
                                    break;
                                case 'contact_owner':
                                    $custom_message[] = " with Contact Owner <b>{$value}</b>";
                                    break;
                                case 'is_active':
                                    if ($value)
                                    {
                                        $action = 'activated';
                                    } else {
                                        $action = 'deactivated';
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
                elseif ($log->action == 'login'){

                    if (isset($custom_data) && count($custom_data))
                    {
                        foreach ($custom_data as $key => $value) {

                            switch ($key) {
                                case 'name':
                                    $flagText = 'login';
                                    $name = $value;
                                    $msg = " <b>{$name}</b> was logged in ";

                                    if(isset($custom_data['source'])) {
                                        $msg = " <b>{$name}</b> was logged in by {$custom_data['source']}";
                                    }
                                    $custom_message[] = $msg;
                                    break;

                                default:
                                    break;
                            }
                        }
                    }
                }
                elseif ($log->action == 'register'){

                    if (isset($custom_data) && count($custom_data))
                    {

                        foreach ($custom_data as $key => $value) {

                            switch ($key) {
                                case 'name':
                                    $flagText = 'register';
                                    $name = $value;
                                    $msg = "A user <b>{$name}</b> was created by";

                                    if(isset($custom_data['source'])) {
                                        $msg = "A user <b>{$name}</b> was created by <b>{$custom_data['source']}</b>";
                                    }
                                    $custom_message[] = $msg;
                                    break;

                                default:
                                    break;
                            }
                        }
                    }
                }
                elseif ($log->action == 'request') {
                    if (isset($custom_data) && count($custom_data)) {
                        $flagText = 'request';
                        $custom_message[] = $custom_data['vehical_details']['year'].", ".$custom_data['vehical_details']['make'].", ".$custom_data['vehical_details']['model'].", ".$custom_data['vehical_details']['trim'];
                        // $custom_message[] = "<b>vehical</b> ".$custom_data['vehical_details']['make'].", ".$custom_data['vehical_details']['model'].", ".$custom_data['vehical_details']['year'].", ".$custom_data['vehical_details']['trim'];
                    }
                }

                $custom_message = implode(',', $custom_message);
                if($flagText == 'login'){
                    $message = "{$custom_message} at ";
                }elseif($flagText == 'register'){
                     $message = "{$custom_message} at ";
                }
                elseif($flagText == 'request'){
                    if(empty($log->portal_user_id)){
                        $message = "A request was created by <b>{$custom_data['source']}</b> for a {$custom_message}.";
                        // $message = "<b>{$target_full_name}</b> was {$flagText} on <b>{$custom_data['source']}</b> for {$custom_message}.";
                    }
                    else {
                        $message = "A request was created by <b>{$custom_data['source']}</b> for a {$custom_message}.";
                        // $message = "<b>{$portal_user_name}</b> was create a {$flagText} on <b>{$custom_data['source']}</b> for {$custom_message}.";
                    }
                }
                else{
                    $message = "<b>{$target_full_name}</b> was <b>{$action}</b>{$custom_message} by <b>{$portal_user_name}<b/>";
                }

                break;
            case Logs::Workflow:
                $getType =  gettype(json_decode($log->content));

                if($getType == 'object'){
                   $content = json_decode($log->content);
                   $contact = User::find($content->userid);
                   $firstName = '<b>DELETED</b>'; $lastName = '<b>USER</b>';
                    if($contact){
                        $firstName = $contact->first_name;
                        $lastName = $contact->last_name;
                    }
                   if($content->actionId != '101'){
                    $actionname = $this->formatActionName($content->actionId);
                   }else{
                    $actionname= '';
                   }
                   $workflowName = $content->workflow_name ?? null;
                   if(isset($content->failed)){
                    $message = "<b>{$workflowName}</b> workflow {$actionname} {$content->type} was failed for ".$contact->email_address;
                   }else{
                    if($log->action == 'created' && $content->actionId == '102' ){
                        $message = "<b>{$workflowName}</b> workflow {$actionname} {$content->type} has create successfully for ".$firstName." ".$lastName;
                      }else{
                        $actionStatus = "has run successfully";
                        if (isset($content->delay_status)) {
                            if($content->delay_status == 2) {
                                $actionStatus = "has been cancelled";
                            } else if($content->delay_status == 3) {
                                $actionStatus = "has failed";
                            }
                        }else if (isset($content->webhook_status) && $content->actionId == '110') {
                            if($content->webhook_status == 2) {
                                $actionStatus = "has been cancelled";
                            } else if($content->webhook_status == 3) {
                                $actionStatus = "has failed";
                            } else if($content->webhook_status == 1) {
                                $actionStatus = "has completed";
                            }
                        }
                        $message = "<b>{$workflowName}</b> workflow {$actionname} {$content->type} {$actionStatus} for ".$firstName." ".$lastName;
                      }
                   }
                }else{
                    $message = $log->content;
                }

                break;
            case Logs::Task:
                return $log->content;
                break;
            default:
                break;
        }

        return $message;
    }

    protected function formatActionName($actionid)
    {
        switch ($actionid) {
            case 101:
                $actionNmme = 'Trigger';
                break;
            case 102:
                $actionNmme = 'Delay';
                break;
            case 103:
                $actionNmme = 'Branch';
                break;
            case 104:
                $actionNmme = 'Send Marketing/Transactional Email';
                break;
            case 105:
                $actionNmme = 'Send SMS';
                break;
            case 106:
                $actionNmme = 'Update Property';
                break;
            case 107:
                $actionNmme = 'Send Direct Email';
                break;
            case 109:
                $actionNmme = 'Create Deal';
                break;
            case 110:
                $actionNmme = 'Send Webhook';
                break;
            default:
                $actionNmme = 'unknown';
                break;
        }
        return $actionNmme;
    }

    function formatRoleIds($role_id)
    {
        $str = 'XXX';
        switch ($role_id) {
            case 1:
                $str = 'SuperAdmin';
                break;
            case 2:
                $str = 'Admin';
                break;
            case 3:
                $str = 'Administrative';
                break;
            case 4:
                $str = 'Manager';
                break;
            case 5:
                $str = "Salesperson";
                break;
            case 6:
                $str = "Concierge";
                break;
            default:
                $str = 'Salesperson';
                break;
        }
        return $str;
    }



    public function getTaskLogsById($taskID){
        $category = Logs::Task;
        $query = Log::select('content','created_at','portal_user_name')->where('category', $category);
        $query->where('target_type', 'App\Model\Task');
        $query->where('target_id', $taskID);
        return $query->get();
    }

}
