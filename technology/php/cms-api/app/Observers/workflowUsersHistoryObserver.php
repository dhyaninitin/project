<?php

namespace App\Observers;
use App\Model\{WorkflowHistory, Log,HubspotWorkFlows,User};
use App\Enums\{Logs, UserAction, TargetTypes,PortalAction};

class workflowUsersHistoryObserver
{
    /**
     * Handle the = workflow history "created" event.
     *
     * @param  \App\WorkflowHistory  $WorkflowHistory
     * @return void
     */
    public function created(WorkflowHistory $WorkflowHistory)
    {
        if($WorkflowHistory->event_master_id == '101'){
            $type = 'Trigger';
            $actionId = 101;
        }else{
            $type = 'Action';
            $actionId = $WorkflowHistory->event_master_id;
        }

        $getWorkflowName = HubspotWorkFlows::Find($WorkflowHistory->workflow_id);
        $contentArray = [
            "userid"=> $WorkflowHistory->user_id,
            "type"=> $type,
            "actionId"=> $actionId,
            "workflow_name" => $getWorkflowName->wf_name,
        ];
        
            Log::create(array(
                'category'      => Logs::Workflow,
                'action'        => PortalAction::CREATED,
                'target_id'     => $WorkflowHistory->workflow_id,
                'target_type'   => TargetTypes::Workflow,
                'content'       => json_encode($contentArray),
            ));
    }

    /**
     * Handle the = workflow history "updated" event.
     *
     * @param  \App\=WorkflowHistory  $WorkflowHistory
     * @return void
     */
    public function updated(WorkflowHistory $WorkflowHistory)
    {
        // Update
    }

    /**
     * Handle the = workflow history "deleted" event.
     *
     * @param  \App\=WorkflowHistory  $=WorkflowHistory
     * @return void
     */
    public function deleted(WorkflowHistory $WorkflowHistory)
    {
        //
    }

    /**
     * Handle the = workflow history "restored" event.
     *
     * @param  \App\=WorkflowHistory  $=WorkflowHistory
     * @return void
     */
    public function restored(WorkflowHistory $WorkflowHistory)
    {
        //
    }

    /**
     * Handle the = workflow history "force deleted" event.
     *
     * @param  \App\=WorkflowHistory  $=WorkflowHistory
     * @return void
     */
    public function forceDeleted(WorkflowHistory $WorkflowHistory)
    {
        //
    }
}
