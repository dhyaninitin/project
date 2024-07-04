<?php

namespace App\Observers;
use App\Model\{WorkflowSetting,Log,PortalUser};
use App\Enums\{Logs, PortalAction, TargetTypes, SourceUtm};
use Auth;

class WorkflowSettingObserver
{
    /**
     * Handle the workflow setting "created" event.
     *
     * @param  \App\WorkflowSetting  $workflowSetting
     * @return void
     */
    public function created(WorkflowSetting $workflowSetting)
    {
        $portalUser = Auth::user();
        $data = $workflowSetting->getAttributes();
        $portalUsers = implode(', ', $this->getPortalUserDetails(json_decode($data['portal_users'])));
        $fullName = $portalUser->first_name.' '.$portalUser->last_name;
        $msg = "Enrolled objects limit was set to <b>{$data['enrollment_number']}</b> and users <b>{$portalUsers}</b> added for workflow verification";
        Log::create(array(
            'category'         => Logs::Portal,
            'action'           => PortalAction::CREATED,
            'target_id'        => $workflowSetting->id,
            'target_type'      => TargetTypes::WorkflowSetting,
            'portal_user_id'   => $portalUser->id,
            'portal_user_name' => $fullName,
            'content'          => $msg,
        ));
    }

    /**
     * Handle the workflow setting "updated" event.
     *
     * @param  \App\WorkflowSetting  $workflowSetting
     * @return void
     */
    public function updated(WorkflowSetting $workflowSetting)
    {
        $portalUser = Auth::user();
        $oldData = collect($workflowSetting->getOriginal());
        $newData = collect($workflowSetting->getAttributes());
        $diff = $newData->diff($oldData);
        $fullName = $portalUser->first_name.' '.$portalUser->last_name;
        $msg = "";
        if(isset($diff->toArray()['enrollment_number'])){
            $msg .= "Enrolled objects limit was <b>updated</b> from {$oldData['enrollment_number']} to <b>{$newData['enrollment_number']}</b>,";
        }

        $oldPortalUserArray = json_decode($oldData['portal_users']);
        $newPortalUserArray = json_decode($newData['portal_users']);
        $addedElements = array_diff($newPortalUserArray, $oldPortalUserArray);
        $removedElements = array_diff($oldPortalUserArray, $newPortalUserArray);

        if(!empty($addedElements) && count($addedElements) > 0) {
            $removePortalUserName = implode(', ', $this->getPortalUserDetails($addedElements));
            $msg .= " User <b>{$removePortalUserName} </b> added for workflow verification</b>,";
        }

        if(!empty($removedElements) && count($removedElements) > 0) {
            $removePortalUserName = implode(', ', $this->getPortalUserDetails($removedElements));
            $msg .= " User <b>{$removePortalUserName} </b> removed from workflow verification</b>,";
        }
        $msg = substr(trim($msg), 0, -1);
        $msg .= " by <b>{$fullName}</b>";
        Log::create(array(
            'category'         => Logs::Portal,
            'action'           => PortalAction::UPDATED,
            'target_id'        => $workflowSetting->id,
            'target_type'      => TargetTypes::WorkflowSetting,
            'portal_user_id'   => $portalUser->id,
            'portal_user_name' => $fullName ,
            'content'          => $msg,
        ));
    }

    /**
     * Handle the workflow setting "deleted" event.
     *
     * @param  \App\WorkflowSetting  $workflowSetting
     * @return void
     */
    public function deleted(WorkflowSetting $workflowSetting)
    {
        //
    }

    /**
     * Handle the workflow setting "restored" event.
     *
     * @param  \App\WorkflowSetting  $workflowSetting
     * @return void
     */
    public function restored(WorkflowSetting $workflowSetting)
    {
        //
    }

    /**
     * Handle the workflow setting "force deleted" event.
     *
     * @param  \App\WorkflowSetting  $workflowSetting
     * @return void
     */
    public function forceDeleted(WorkflowSetting $workflowSetting)
    {
        //
    }

    public function getPortalUserDetails($portalUserId){
        $getPortalUser = PortalUser::select('first_name','last_name')->whereIn('id',$portalUserId)->get();
        $fullNames = $getPortalUser->map(function ($user) {
            return $user->first_name . ' ' . $user->last_name;
        });
        return $fullNames->toArray();
    }
}
