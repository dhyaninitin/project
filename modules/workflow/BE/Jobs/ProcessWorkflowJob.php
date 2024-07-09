<?php

namespace App\Jobs;

use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use App\Model\HubspotWorkFlows;

class ProcessWorkflowJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $data;
    public $tries = 5;
    public $retryAfter = 3600; //one hour
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        try {
            if ($this->data["event"] == "object-created") {
                app('App\Http\Controllers\WorkflowController')->getAllWorkflows($this->data['objectIds']);
            } else if ($this->data["event"] == "object-updated") {
                $workflows = HubspotWorkflows::whereIn('id',$this->data['workflowIds'])->get();
                app('App\Http\Controllers\WorkflowController')->getAndStartWorkflow($workflows, $this->data['objectIds']);
            } else if ($this->data["event"] == "workflow-activation") {
                $workflow = HubspotWorkflows::find($this->data['workflowId']);
                app('App\Http\Controllers\WorkflowController')->enqueueObjectEnrollment($workflow);
            }
        } catch (\Throwable $th) {

            if ($this->attempts() == 1) {
                $this->release(5 * 60);
            } else if ($this->attempts() == 2) {
                $this->release(15 * 60);
            } else if ($this->attempts() == 3) {
                $this->release(60 * 60);
            } else if ($this->attempts() == 4) {
                $this->release(60 * 60);
            } else if ($this->attempts() == 5) {
                $this->release(60 * 60);
            }

            throw $th;
        }
    }
}
