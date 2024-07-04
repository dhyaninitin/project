<?php

namespace Tests\Feature;

use Illuminate\Http\Request;
use Tests\TestCase;
use App\Model\{HubspotWorkflows, User, WorkflowHistory, WorkflowSmsTemplates, EmailTemplates, PortalUser};
use App\Actions\WorkflowAction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class WorkflowTest extends TestCase
{
    // use RefreshDatabase;

    protected $triggers;
    protected $actions;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();

        User::unsetEventDispatcher();
        WorkflowSmsTemplates::unsetEventDispatcher();
        EmailTemplates::unsetEventDispatcher();

        Artisan::call('db:generate-from-sql-schema');

        app('queue')->setDefaultDriver('sync');

        $workflowSmsTemplate = new WorkflowSmsTemplates;
        $workflowSmsTemplate->sms_title = 'test';
        $workflowSmsTemplate->added_by = null;
        $workflowSmsTemplate->message = json_encode(["{first_name} test template"]);
        $workflowSmsTemplate->save();

        $emailTemplate = new EmailTemplates;
        $emailTemplate->title = 'test title';
        $emailTemplate->subject = 'test subject';
        $emailTemplate->body = 'test body';
        $emailTemplate->added_by = null;
        $emailTemplate->save();

        PortalUser::create([
            'first_name' => 'Test',
            'last_name' => 'Test',
            'email' => 'test123@m.carblip.com',
            'password' => bcrypt('testuser')
        ]);


        $this->triggers = include "TriggersData.php";
        $this->actions = include "ActionsData.php";
    }
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function testWith3UsersAndActionWithEmail()
    {
        $users = factory(User::class, 3)->create();

        $actions = $this->actions['marketing-email'];

        $workflow = HubspotWorkflows::create([
            'wf_name' => 'Test Workflow',
            'type' => 1,
            'triggers' => json_encode($this->triggers['contacts-lastname-Test']),
            'actions' => json_encode($actions),
            'is_active' => 0,
            'workflow_execute_time' => 0,
            'is_activation' => 1,
            'enrollment_count' => 1,
            'activation_updated_at' => now()
        ]);

        app('App\Http\Controllers\WorkflowController')->getAndStartWorkflow([$workflow]);

        foreach ($actions as $action) {
            foreach ($users as $user) {
                $this->assertDatabaseHas('workflow_event_history', [
                    'workflow_id' => $workflow->id,
                    'user_id' => $user->id,
                    'event_master_id' => $action['event_master_id'],
                    'action_uuid' => ($action['event_master_id'] == 101) ? null : $action['id']
                ]);
            }
        }

        $noOfTriggerAction = count($users);
        $noOfEventsShouldBe = $noOfTriggerAction + (count($users) * count($actions));

        $workflowEventHistory = WorkflowHistory::where('workflow_id', $workflow->id)->get();
        $this->assertCount($noOfEventsShouldBe, $workflowEventHistory);
    }

    public function testWith10UsersAndActionsWithSMSTwiceUpdateDirectEmail()
    {
        $users = factory(User::class, 10)->create();

        $actions = $this->actions['sms-twice-update-demail'];

        $workflow = HubspotWorkflows::create([
            'wf_name' => 'Test Workflow',
            'type' => 1,
            'triggers' => json_encode($this->triggers['contacts-lastname-Test']),
            'actions' => json_encode($actions),
            'is_active' => 0,
            'workflow_execute_time' => 0,
            'is_activation' => 1,
            'enrollment_count' => 1,
            'activation_updated_at' => now()
        ]);

        app('App\Http\Controllers\WorkflowController')->getAndStartWorkflow([$workflow]);

        foreach ($actions as $action) {
            foreach ($users as $user) {
                $this->assertDatabaseHas('workflow_event_history', [
                    'workflow_id' => $workflow->id,
                    'user_id' => $user->id,
                    'event_master_id' => $action['event_master_id'],
                    'action_uuid' => ($action['event_master_id'] == 101) ? null : $action['id']
                ]);
            }
        }

        $noOfTriggerAction = count($users);
        $noOfEventsShouldBe = $noOfTriggerAction + (count($users) * count($actions));

        $workflowEventHistory = WorkflowHistory::where('workflow_id', $workflow->id)->get();
        $this->assertCount($noOfEventsShouldBe, $workflowEventHistory);
    }

    public function testWith10UsersAndActionsWithMarketingEmailDelaySMSDelayDirectEmail()
    {
        $users = factory(User::class, 10)->create();

        $actions = $this->actions['delay-memail-delay-sms-delay-email'];

        $workflow = HubspotWorkflows::create([
            'wf_name' => 'Test Workflow',
            'type' => 1,
            'triggers' => json_encode($this->triggers['contacts-lastname-Test']),
            'actions' => json_encode($actions),
            'is_active' => 0,
            'workflow_execute_time' => 0,
            'is_activation' => 1,
            'enrollment_count' => 1,
            'activation_updated_at' => now()
        ]);

        app('App\Http\Controllers\WorkflowController')->getAndStartWorkflow([$workflow]);

        $isAllDelaysCompleted = false;
        while (!$isAllDelaysCompleted) {
            $delays = WorkflowHistory::where('workflow_id', $workflow->id)->where('event_master_id', 102)->where('is_open', 0)->get();
            if (count($delays) > 0) {
                foreach ($delays as $key => $delay) {
                    $inputs = array(
                        'userId' => $delay->user_id,
                        'workflowId' => $delay->workflow_id,
                        'sequenceId' => $delay->sequence_id,
                        'actionUUID' => $delay->action_uuid,
                        'enrollment' => $delay->enrollment,
                    );
                    app('App\Http\Controllers\WorkflowController')->delayActionCallback(new Request($inputs));
                }
            } else {
                $isAllDelaysCompleted = true;
            }
        }

        foreach ($actions as $action) {
            foreach ($users as $user) {
                $this->assertDatabaseHas('workflow_event_history', [
                    'workflow_id' => $workflow->id,
                    'user_id' => $user->id,
                    'event_master_id' => $action['event_master_id'],
                    'action_uuid' => ($action['event_master_id'] == 101) ? null : $action['id']
                ]);
            }
        }

        $noOfTriggerAction = count($users);
        $noOfEventsShouldBe = $noOfTriggerAction + (count($users) * count($actions));

        $workflowEventHistory = WorkflowHistory::where('workflow_id', $workflow->id)->get();
        $this->assertCount($noOfEventsShouldBe, $workflowEventHistory);
    }

    public function testWith11UsersAndActionsMarketingEmailDelaySMSDelayDirectEmailBranch()
    {
        $users = factory(User::class, 10)->create();
        $userForBranchTest = User::create([
            'first_name' => 'Branch Test',
            'last_name' => 'Test',
            'email_address' => 'xyztestemail@mailinator.com',
            'phone' => '+11752628728',
            'contact_owner_email' => 'test123@m.carblip.com',
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        ]);


        $actions = $this->actions['branch-delay-memail-sms-demail-update'];

        $workflow = HubspotWorkflows::create([
            'wf_name' => 'Test Workflow',
            'type' => 1,
            'triggers' => json_encode($this->triggers['contacts-lastname-Test']),
            'actions' => json_encode($actions),
            'is_active' => 0,
            'workflow_execute_time' => 0,
            'is_activation' => 1,
            'enrollment_count' => 1,
            'activation_updated_at' => now()
        ]);

        app('App\Http\Controllers\WorkflowController')->getAndStartWorkflow([$workflow]);

        $isAllDelaysCompleted = false;
        while (!$isAllDelaysCompleted) {
            $delays = WorkflowHistory::where('workflow_id', $workflow->id)->where('event_master_id', 102)->where('is_open', 0)->get();
            if (count($delays) > 0) {
                foreach ($delays as $key => $delay) {
                    $inputs = array(
                        'userId' => $delay->user_id,
                        'workflowId' => $delay->workflow_id,
                        'sequenceId' => $delay->sequence_id,
                        'actionUUID' => $delay->action_uuid,
                        'enrollment' => $delay->enrollment,
                    );
                    app('App\Http\Controllers\WorkflowController')->delayActionCallback(new Request($inputs));
                }
            } else {
                $isAllDelaysCompleted = true;
            }
        }

        $noOfEventsShouldBe = 0;

        //assertion check for branch if condition
        foreach ($actions[3]['ifbranchdata'] as $action) {
            if ($action['event_master_id'] != 103) { // Branch Action
                $this->assertDatabaseHas('workflow_event_history', [
                    'workflow_id' => $workflow->id,
                    'user_id' => $userForBranchTest->id,
                    'event_master_id' => $action['event_master_id'],
                    'action_uuid' => ($action['event_master_id'] == 101) ? null : $action['id']
                ]);
                $noOfEventsShouldBe++;
            }
        }

        // assertion check for branch then condition
        foreach ($actions[3]['thenbranchdata'] as $action) {
            if ($action['event_master_id'] != 103) { // Branch Action
                foreach ($users as $user) {
                    $this->assertDatabaseHas('workflow_event_history', [
                        'workflow_id' => $workflow->id,
                        'user_id' => $user->id,
                        'event_master_id' => $action['event_master_id'],
                        'action_uuid' => ($action['event_master_id'] == 101) ? null : $action['id']
                    ]);
                    $noOfEventsShouldBe++;
                }
            }
        }

        //assertion check before branch
        $users->push($userForBranchTest);
        foreach ($actions as $action) {
            if ($action['event_master_id'] != 103) { // Branch Action
                foreach ($users as $user) {
                    $this->assertDatabaseHas('workflow_event_history', [
                        'workflow_id' => $workflow->id,
                        'user_id' => $user->id,
                        'event_master_id' => $action['event_master_id'],
                        'action_uuid' => ($action['event_master_id'] == 101) ? null : $action['id']
                    ]);
                    $noOfEventsShouldBe++;
                }
            }
        }

        $noOfTriggerAction = count($users);
        $noOfEventsShouldBe = $noOfTriggerAction + $noOfEventsShouldBe; //should be 77
        $workflowEventHistory = WorkflowHistory::where('workflow_id', $workflow->id)->get();
        $this->assertCount($noOfEventsShouldBe, $workflowEventHistory);
    }
}
