<?php

namespace App\Http\Controllers;
use App\Jobs\ProcessWorkflowJob;
use Illuminate\Http\Request;
use App\Services\ {WorkflowService,LogService, ApiService,VehicleRequestService};
use App\Http\Resources\ {HubspottypeCollection, WorkflowResource, WorkflowCollection, PortalDealStageCollection,LogResource,WorkflowPropertyCollection, WorkflowEnrollmentHistoryCollection, PortalUserDetailsCollection, WorkflowSettingResource,
WorkflowEnrollmentCollection, WorkflowEnrollmentContactCollection, ContactEngagedWorkflowCollection};
use App\Traits\{WorkFlowTrait, PortalTraits};
use Exception;
use Carbon\Carbon;
use App\Enums\{Logs,TargetTypes};
use App\Jobs\{sendDirectEmail, SendWebhookJob};
use SendGrid\Mail\Mail;

class WorkflowController extends Controller {
    use WorkFlowTrait;
    use PortalTraits;

            /**
     * @var LogService
     */
    protected $logService;
    protected $workflowService;
    protected $apiService;
    protected $guzelclient;
    protected $vehicleRequestService;
    protected $actionId;
    protected $lastActionId;

    public function __construct( WorkflowService $workflowService,LogService $logService, ApiService $apiService, VehicleRequestService $vehicleRequestService ) {
        $this->workflowService = $workflowService;
        $this->logService = $logService;
        $this->apiService = $apiService;
        $this->guzelclient = new \GuzzleHttp\Client();
        $this->vehicleRequestService = $vehicleRequestService;
        $this->actionId = [];
        $this->lastActionId = null;
    }

    // Workflow Property

    public function getAllPropertyDetails( Request $request ) {
        $result = $this->workflowService->getTableColumns();
        $tableCoulumnCount = count(array_merge($result['users'],$result['vehicle_requests'],$result['portal_users']));
        $workflowPropertyCount = $this->workflowService->workflowProprty(true);

        if($workflowPropertyCount != $tableCoulumnCount){
            $this->workflowService->storeWorkflowProperty($result['users'],1);
            $this->workflowService->storeWorkflowProperty($result['vehicle_requests'],2);
            $this->workflowService->storeWorkflowProperty($result['portal_users'],3);
        }

        $workflowProperty = $this->workflowService->workflowProprty(false);

        return response()->json( [
            'error'=>false,
            'statusCode'=>200,
            'message' => '',
            'data'=> new WorkflowPropertyCollection( $workflowProperty )
        ] );
    }



    public function getPropertyValue( Request $request ) {
        $request = $request->all();
        $typeResult = $this->typeformate( $request[ 'table_id' ] );
        if ( $request[ 'field_name' ] == 'state' || $request[ 'field_name' ] == 'city' || $request[ 'field_name' ] == 'street_address' || $request[ 'field_name' ] == 'zip' ) {
            $result = $this->workflowService->getpropertyValue( $typeResult, $request );
            return response()->json( [
                'error'=>false,
                'statusCode'=>200,
                'message' => '',
                'data'=> $this->propertyValueCollection( $result, $request[ 'field_name' ] )
            ] );
        }
    }

    public function updateWorkflow( Request $request ) {
        $request = $request->all();
        $resultt = $this->workflowService->updateWorkflow( $request );
        return response()->json( [
            'error'=>false,
            'statusCode'=>200,
            'message' => 'Workflow updated successfully',
            'data'=> [],
        ] );
    }

    // Workflow APi

    public function workflowList( Request $request ) {
        $request = $request->all();
        $results = $this->workflowService->getWorkFlowList( $request );
        return new WorkflowCollection( $results );
    }

    public function showWorkFlowById( Request $request, $requestId ) {
        $result = $this->workflowService->show( $requestId );
        return new WorkflowCollection( $result );
    }

    public function getWorkflowType( Request $request ) {
        $getallType = $this->workflowService->gettypelist();
        return new HubspottypeCollection( $getallType );
    }

    public function storeWorkflow( Request $request ) {
        $request = $request->all();
        $resultt = $this->workflowService->create( $request );
        return response()->json( [
            'error'=>false,
            'statusCode'=>200,
            'message' => 'Workflow created successfully',
            'data'=> new WorkflowResource( $resultt ),
        ] );

    }

    public function getWorkflowLogs(Request $request){
        $filter = $request->all();
        $result = $this->logService->getLogsList(Logs::Workflow, $filter, TargetTypes::Workflow);
        return LogResource::collection($result);
    }

    public function getWorkflowLogsById(Request $request,$id){
        $filter = $request->all();
        $result = $this->logService->getWorkflowByCategoryId(Logs::Workflow, $filter,$id);
        return LogResource::collection($result);
    }

    public function updateWorkflowStatus( Request $request ) {
        $request = $request->all();
        $workflow = $this->workflowService->updateWorkflowStatus( $request );
        if(($request['activation_for'] == 1) && ($request['is_active'] == 0)){ // triger workflow if it's update for all records.
            $data = ['event' => 'workflow-activation', 'workflowId' => $workflow->id];
            ProcessWorkflowJob::dispatch($data);
        }
        return new WorkflowResource( $workflow );
    }

    public function enqueueObjectEnrollment($workflow) {
        $triggerData = json_decode($workflow->triggers);
        if ($triggerData) {
            $index = 0;
            do {
                $triggerResultData = $this->workflowService->createTriggerQuery($triggerData,
                    $workflow->is_activation,
                    $workflow->activation_updated_at,
                    null,
                    $index);
                $triggerResult = $triggerResultData['result'];
                foreach ($triggerResult as $object) {
                    $data = [
                        'event' => 'object-updated',
                        'workflowIds' => [$workflow->id],
                        'objectIds' => [$object->id]
                    ];
                    ProcessWorkflowJob::dispatch($data);
                }
                $index++;
            } while (count($triggerResultData['result']) >= 1000);
        }
    }

    public function deleteWorkflow( $workflowId ) {
        $this->workflowService->deleteWorkflow($workflowId);
        return response()->json( [
            'error' => false,
            'statusCode'=> 200,
            'message' => 'Workflow deleted successfully',
            'data' => [],
        ] );
    }

    public function getAllMailTemplates( Request $request ) {
        $filters = $request->all();
        $sg = new \SendGrid(config('services.sendgrid.api_key'));
        $page  = isset( $filters[ 'page' ] ) ? $filters[ 'page' ] : 1;
        $perPage = isset( $filters[ 'per_page' ] ) ? $filters[ 'per_page' ] : 20;
        $templateId = isset( $filters[ 'id' ] ) ? $filters[ 'id' ] : Null;
        $pageToken = isset( $filters[ 'page_token' ] ) ? $filters[ 'page_token' ] : Null;

        $getTemplatesList = [];
        $payload = [
            'page_size' => $perPage,
            'generations' => 'legacy,dynamic',
            'page_token' => $pageToken
        ];

        try {
            $response = $sg->client->templates()->get(null, $payload);
            if ($response->statusCode() >= 200 && $response->statusCode() < 300) {
                $data = json_decode($response->body());
                $getTemplatesList = $data->result;
                $totalRecords = $data->_metadata->count;
                $meta = [
                    'total' => $totalRecords,
                    'count' => count($getTemplatesList),
                    'last_page' => count($getTemplatesList) != 0 ? (round($totalRecords / $perPage)-1) : 0,
                    'next_page_token' => isset($data->_metadata->next) ? $this->getSubstringBetween($data->_metadata->next, "page_token=", "&generations") : null,
                    'prev_page_token' => isset($data->_metadata->prev) ? $this->getSubstringBetween($data->_metadata->prev, "page_token=", "&generations") : null,
                ];

                return response()->json( [
                    'error'=>false,
                    'statusCode'=>200,
                    'message' => '',
                    'data'=> $this->mailTemplateCollection( $getTemplatesList ),
                    'meta' => $meta
                ] );
            }

        } catch (Exception $ex) {
            if (app()->bound('sentry')) {
                app('sentry')->captureException($ex);
            }

        }

        return response()->json( [
            'error'=>true,
            'statusCode'=>500,
            'message' => 'server error',
            'data'=> null,
        ] );
    }

    public function getSubstringBetween($string, $start, $end) {
        $startPos = strpos($string, $start);
        if ($startPos === false) {
            return false;
        }

        $endPos = strpos($string, $end, $startPos + strlen($start));
        if ($endPos === false) {
            return false;
        }

        return substr($string, $startPos + strlen($start), $endPos - $startPos - strlen($start));
    }

    public function updateWorkflowSchedule(Request $request) {
        $request = $request->all();
        $results = $this->workflowService->updateWorkflowSchedule($request);
        return new WorkflowResource( $results );
    }


    // Run Workflow
    // Get all active workflow and pass to getAndStartWorkflow function
    public function getAllWorkflows($objectIds = null) {
        $workFlows = $this->workflowService->getAllWorkflows();
        if (!empty($workFlows) || !$workFlows->isEmpty() ) {
            $this->getAndStartWorkflow($workFlows, $objectIds);
        }
    }

    // Check the workflow scheduling setting
    public function getAndStartWorkflow($workFlows, $objectIds = null, $enrollment = null)
    {
        if(!empty($workFlows) || !$workFlows->isEmpty() ){
            foreach ($workFlows as $value) {
                // There is an option to only run a workflow in specific time like
                // Ex:This workflow should run at Monday from 8:00AM to 10:00AM
                if ($value->workflow_execute_time == 1) {
                    $schedule_time = json_decode($value->schedule_time, true);

                    $current_day = Carbon::now()->format("w"); //get current Day
                    $current_time = date('H:i:s', strtotime(Carbon::now())); //get current Time

                    $schedule_day = explode(",", $schedule_time[0]['day']);
                    $schedule_start_time = $schedule_time[0]['startTime'];
                    $schedule_end_time = $schedule_time[0]['endTime'];

                    if (in_array($current_day, $schedule_day)) {
                        $time = Carbon::parse($current_time); // assume this is the time you want to check
                        $startTime = Carbon::parse($schedule_start_time);
                        $endTime = Carbon::parse($schedule_end_time);

                        if ($time->between($startTime, $endTime)) {
                            $this->callTriggerQuery($value, $objectIds, $enrollment);
                        }
                    }
                } else {
                    $this->callTriggerQuery($value, $objectIds, $enrollment);
                }
            }
        }else{
            return false;
        }
    }

    // Create and get result according to trigger and pass to workflow action
    private function callTriggerQuery($value, $objectIds = null, $enrollment = null){
        $triggerData = json_decode($value->triggers);
        if(!$enrollment){
            $enrollment = $value->enrollment_count;
        }
        if ($triggerData) {
            $triggerResultData = $this->workflowService->createTriggerQuery($triggerData, $value->is_activation, $value->activation_updated_at, $objectIds);
            $triggerResult = $triggerResultData['result'];
            if ($triggerResult) {
                try {
                    $this->workflowService->createTriggerHistory( $value->id, $value->wf_name, $triggerResult, 0, null, 101, $enrollment, $triggerResultData['database_id'], $triggerData);
                    $this->workflowActions(json_decode($value->actions), $triggerResult, $value->id, $value->type, $triggerData, $triggerResultData['database_id'], $enrollment);
                } catch (\Exception $e) {
                    app('sentry')->captureException($e);
                    $errorarray = array('type' => '505', 'info' => 'createTriggerHistory & RunActions', 'message' => $e->getMessage(), 'line' => $e->getLine());
                    $this->errorlogs($errorarray);
                }
            }
        }
    }

    // get trigger result and start the action run by one according to sequence id
    public function workflowActions( $actionsData, $triggerResult, $workFlowId, $workflowType, $triggerData, $tableResult, $enrollment ) {
        // get all primary id form data for check the users
        $primaryId = $this->getIds($triggerResult, $tableResult);
        foreach ( $actionsData as $actions ) {
            $triggerResult;
            switch ( $actions->actionName ) {
                case 'Send Marketing/Transactional Email':
                $lastRecord = $this->workflowService->getActionLastRecord( $primaryId, $workFlowId, $enrollment );
                if ( empty( $lastRecord ) ) {
                    try {
                        $getResult = $this->workflowService->verifyActionRunOrNot($workFlowId, $triggerResult, $actions->id, $actions->event_master_id,$enrollment,$tableResult);
                        if($getResult){
                            $getActionResult = $this->emailAction( $actions->email, $getResult,$workflowType, $triggerData);
                            if(!empty($getActionResult)){
                                // This function for check and create logs and workflow action history
                                $this->workflowService->createActionHistory( $workFlowId, $getActionResult, $actions->seq_id, $actions->id, $actions->event_master_id, $enrollment, $tableResult, $actions );
                            }
                        }
                    } catch ( \Exception $e ) {
                        app('sentry')->captureException($e);
                        $errorarray = array( 'type'=>'505','info'=>'Send Marketing/Transactional Email','message'=>$e->getMessage(),'line'=>$e->getLine() );
                        $this->errorlogs($errorarray);
                    }
                }
                break;

                case 'Branch':
                $lastRecord = $this->workflowService->getActionLastRecord( $primaryId, $workFlowId, $enrollment);
                if ( empty( $lastRecord ) ) {
                    $branchResult = $this->branchAction( $actions->groupValues, $triggerResult );
                    $triggerResult = $branchResult;
                    if (!empty($actions->ifbranchdata) && count($actions->ifbranchdata) > 0 && !empty($branchResult['ifBranchData']) && count($branchResult['ifBranchData']) > 0) {
                        $triggerResult =  $this->workflowActions( $actions->ifbranchdata, $branchResult['ifBranchData'], $workFlowId, $workflowType, $triggerData, $tableResult, $enrollment );
                    }

                    if (!empty($actions->thenbranchdata) && count($actions->thenbranchdata) > 0 && !empty($branchResult['thanBranchData']) && count($branchResult['thanBranchData']) > 0) {
                        $triggerResult =  $this->workflowActions( $actions->thenbranchdata, $branchResult['thanBranchData'], $workFlowId, $workflowType, $triggerData,$tableResult, $enrollment );
                    }
                }

                break;

                case 'Delay':
                $lastRecord = $this->workflowService->getActionLastRecord( $primaryId, $workFlowId, $enrollment);
                $schedule = array();
                if ( empty( $lastRecord ) ) {
                    if ( $actions->delay->value == 'Delay for a set amount of time' ) {
                        $triggerResult = $triggerResult;
                        $date_utc = new \DateTime( 'now', new \DateTimeZone( 'UTC' ) );
                        $schedule[ 'days' ] = $actions->days;
                        $schedule[ 'hours' ] = $actions->hours;
                        $schedule[ 'minutes' ] = $actions->minutes;
                        $schedule[ 'seconds' ] = $actions->seconds;
                        $schedule[ 'year' ] = $this->convertDate( $date_utc->format( 'Y-m-d H:i:s' ), '0', 'year' );
                        $schedule[ 'month' ] = $this->convertDate( $date_utc->format( 'Y-m-d H:i:s' ), '0', 'month' );
                        $schedule[ 'workflow_id' ] = $workFlowId;
                        $schedule[ 'seq_id' ] = $actions->seq_id;
                        $schedule[ 'action_uuid' ] = $actions->id;
                        $schedule[ 'enrollment' ] = $enrollment;

                        try {
                            $getResult = $this->workflowService->verifyActionRunOrNot($workFlowId, $triggerResult, $actions->id, $actions->event_master_id, $enrollment, $tableResult);
                            if ($getResult) {
                                $schedule['user_data'] = $getResult;
                                $delayResult = $this->scheduleNextWorkflowTrigger($schedule);
                                if (!empty($delayResult)) {
                                    $this->workflowService->createActionHistory($workFlowId, $delayResult, $actions->seq_id, $actions->id, $actions->event_master_id, $enrollment, $tableResult, $actions);
                                }
                            }
                        } catch (\Exception $e) {
                            app('sentry')->captureException($e);
                            $errorarray = array('type' => '505', 'info' => 'Delay Action', 'message' => $e->getMessage(), 'line' => $e->getLine());
                            $this->errorlogs($errorarray);
                        }
                    } else {
                    }
                }
                break;

                case 'Send SMS':
                    $lastRecord = $this->workflowService->getActionLastRecord( $primaryId, $workFlowId, $enrollment);
                    if ( empty( $lastRecord ) ) {
                        try {
                            $getResult = $this->workflowService->verifyActionRunOrNot($workFlowId, $triggerResult, $actions->id, $actions->event_master_id,$enrollment,$tableResult);
                            if($getResult){
                                $getsmsTemplate = $this->workflowService->getSmsTemplatedByid( $actions->smspayload->id );
                                $getSmsResult = $this->sendSmsAction( $getResult, json_decode( $getsmsTemplate[ 0 ][ 'message' ] ), $actions->send_sms_from );
                                if(!empty($getSmsResult)){
                                    $this->workflowService->createActionHistory( $workFlowId, $getResult, $actions->seq_id, $actions->id, $actions->event_master_id, $enrollment, $tableResult, $actions );
                                }
                            }
                        } catch ( \Exception $e ) {
                            app('sentry')->captureException($e);
                            $errorarray = array( 'type'=>'505','info'=>'Send SMS Action','message'=>$e->getMessage(),'line'=>$e->getLine() );
                            $this->errorlogs($errorarray);
                        }
                    }
                break;

                case 'Enrollment':

                    $lastRecord = $this->workflowService->getActionLastRecord( $primaryId, $workFlowId, $enrollment);
                    if ( empty( $lastRecord ) ) {
                        try {
                            $triggerResult = $this->findEnrollmentAndGetDetails($actions,$triggerResult,$multiConditionValue= null);
                                if(count($actions->multivalue) > 0 ){
                                    foreach ($actions->multivalue as $multiActions){
                                        if($multiActions->conditionname == "AND"){
                                            $triggerResult = $this->findEnrollmentAndGetDetails($multiActions,$triggerResult,$multiConditionValue='AND');
                                        }

                                        if($multiActions->conditionname == "OR"){
                                            $triggerResult = $this->findEnrollmentAndGetDetails($multiActions,$triggerResult,$multiConditionValue= 'OR');
                                        }
                                    }


                                }

                           $getHistoryUsers = $this->workflowService->createActionHistory( $workFlowId, $triggerResult, $actions->seq_id, $actions->id, '106',$enrollment, $tableResult, $actions );
                           if($getHistoryUsers){
                                $getNewDetails = $this->getAllUserIds($triggerResult);
                                $getUnenrollUsers = collect($triggerOldValue)->WhereNotIn('id',$getNewDetails)->all();
                                $this->workflowService->createActionHistory( $workFlowId, $getUnenrollUsers, $actions->seq_id, $actions->id, '106', 1, $tableResult, $actions );
                           }
                        } catch ( \Exception $e ) {
                            app('sentry')->captureException($e);
                            $errorarray = array( 'type'=>'505','info'=>'Send SMS Action','message'=>$e->getMessage(),'line'=>$e->getLine() );
                            $this->errorlogs($errorarray);
                        }
                    }


                    $triggerResult = $this->findEnrollmentAndGetDetails($actions,$triggerResult,$multiConditionValue= null);
                    if(count($actions->multivalue) > 0 ){
                        foreach ($actions->multivalue as $multiActions){
                            if($multiActions->conditionname == "AND"){
                                $triggerResult = $this->findEnrollmentAndGetDetails($multiActions,$triggerResult,$multiConditionValue='AND');
                            }

                            if($multiActions->conditionname == "OR"){
                                $triggerResult = $this->findEnrollmentAndGetDetails($multiActions,$triggerResult,$multiConditionValue= 'OR');
                            }
                        }

                        $getNewDetails = $this->getAllUserIds($triggerResult);
                        $getUnenrollUsers = collect($triggerOldValue)->WhereNotIn('id',$getNewDetails)->all();
                    }
                break;

                case 'Update Property':
                    $lastRecord = $this->workflowService->getActionLastRecord( $primaryId, $workFlowId, $enrollment);
                    if ( empty( $lastRecord ) ) {
                        $getResult = $this->workflowService->verifyActionRunOrNot($workFlowId, $triggerResult, $actions->id, $actions->event_master_id, $enrollment,$tableResult);
                        if($getResult){
                            $userIdIfDealTriggerNotExist = $this->getDealIdsIfNotExistInTrigger($triggerResult);
                            foreach($actions->property as $property){
                                $updatePropertyTableResult = [$property->tableid];
                                $getIds = $this->getPropertyUpdateIds($triggerResult, $updatePropertyTableResult, $tableResult);
                                $updatedResult = $this->workflowService->updatePropertyActionValues($actions->property, $getIds, $userIdIfDealTriggerNotExist);
                                if ($updatedResult) {
                                    $this->workflowService->createActionHistory($workFlowId, $triggerResult, $actions->seq_id, $actions->id, $actions->event_master_id, $enrollment, $tableResult, $actions);
                                }
                            }
                            $getObjectIds = $this->getObjectIds($triggerResult, $tableResult);
                            print_r($getObjectIds);
                            $data = ['event' => 'object-created', 'objectIds' => $getObjectIds];
                            ProcessWorkflowJob::dispatch($data);
                        }
                    }

                    $triggerResult = $triggerResult;
                break;

                case 'Send Direct Email':
                    $lastRecord = $this->workflowService->getActionLastRecord( $primaryId, $workFlowId, $enrollment);
                    if ( empty( $lastRecord ) ) {
                        $getResult = $this->workflowService->verifyActionRunOrNot($workFlowId, $triggerResult, $actions->id, $actions->event_master_id, $enrollment,$tableResult);
                        if($getResult){
                            $getIds = $this->getIds( $getResult, $tableResult );
                            $getEmailTemplate = $this->workflowService->getEmailTemplateById( $actions->email->id );
                            $this->sendDirectEmail($getResult, $getEmailTemplate[0], $tableResult, $workFlowId, $actions->seq_id, $actions->id, $actions->event_master_id, $enrollment, $actions);
                        }
                    }
                    $triggerResult = $triggerResult;
                break;
                case 'Create Deal':
                    $lastRecord = $this->workflowService->getActionLastRecord( $primaryId, $workFlowId, $enrollment);
                    if ( empty( $lastRecord ) ) {
                        $getResult = $this->workflowService->verifyActionRunOrNot($workFlowId, $triggerResult, $actions->id, $actions->event_master_id,$enrollment,$tableResult = ['5']);
                        if($getResult){
                            $dealsResult = $this->createDeals($triggerResult,$actions);
                            if($dealsResult){
                                try{
                                    $this->workflowService->createActionHistory( $workFlowId, $dealsResult, $actions->seq_id, $actions->id, $actions->event_master_id, $enrollment, $tableResult = ['5'], $actions );
                                    $getObjectIds = $this->getObjectIds($dealsResult, $tableResult);
                                    $data = ['event' => 'object-created', 'objectIds' => $getObjectIds];
                                    ProcessWorkflowJob::dispatch($data);
                                }catch (\Exception $e) {
                                    return false;
                                }
                            }
                        }
                    }


                break;

                case 'Send a Webhook':
                    $lastRecord = $this->workflowService->getActionLastRecord( $primaryId, $workFlowId, $enrollment);
                    if ( empty( $lastRecord ) ) {
                        $getResult = $this->workflowService->verifyActionRunOrNot($workFlowId, $triggerResult, $actions->id, $actions->event_master_id,$enrollment,$tableResult);
                        if($getResult){
                            $this->workflowService->createActionHistory( $workFlowId, $triggerResult, $actions->seq_id, $actions->id, $actions->event_master_id, $enrollment, $tableResult, $actions );
                            $this->sendWebhookAction($triggerResult,$actions,$workFlowId,$tableResult,$enrollment);
                        }
                    }
                break;

                default:
                break;
            }
        }
    }

    public function createDeals($workflowResult, $actionData ){
        $result = [];
        foreach ($workflowResult as $key => $value) {
            $contactOwner = '';
            if($this->createDealAssignTo($actionData->dealsPayload->assignTo) == 'Specific User'){
                $portalUserDetais = $this->getPortalUserDetails($actionData->dealsPayload->userDetails->email);
                $contactOwner = $actionData->dealsPayload->userDetails->email;
            }else{
                $portalUserDetais = $this->getPortalUserDetails($value->contact_owner_email);
                $contactOwner = $value->contact_owner_email;
            }
                $trimValue = !empty($actionData->dealsPayload->trim) ? $actionData->dealsPayload->trim->id : Null;

                if(!empty($portalUserDetais)){
                    $payload = [];
                    $payload['vehicle_id'] = $trimValue;
                    $payload['user_id'] = $value->id;
                    $payload['user_email'] = $value->email_address;
                    $payload['user_name'] = $value->first_name.' '.$value->last_name;
                    $payload['first_name'] = $value->first_name;
                    $payload['contact_owner'] = $contactOwner;
                    $payload['existing_contact_owner'] = $value->contact_owner_email;
                    $payload['deal_stage'] = $actionData->dealsPayload->dealStage;
                    $payload['portal_user_name'] = $portalUserDetais['name'];
                    $payload['portal_user_id'] = $portalUserDetais['id'];
                    $payload['is_complete'] = true;
                    $payload['create_request_on_hubspot'] = $portalUserDetais['concierge_user'];
                    $payload['source_utm'] = 3;
                    $payload['make'] = $actionData->dealsPayload->make;
                    $payload['model'] = $actionData->dealsPayload->model;
                    $payload['trim'] = $actionData->dealsPayload->trim;
                    $payload['year'] = $actionData->dealsPayload->year;
                    $payload['portal_deal_stage'] = $actionData->dealsPayload->portalDealStage;
                    $getDealsDetails = $this->vehicleRequestService->workflowCreateDealAction($payload);
                    if(!empty($getDealsDetails)){
                        $value->deal_id = $getDealsDetails->id;
                        array_push($result, $value);
                    }
                }
        }
        return $result;
    }

    public function sendDirectEmail($triggerResult,$templateDetails, $tableResult, $workFlowId, $actionSequenceId, $actionUUID, $eventMasterId, $enrollment, $actions){
        $matches= array();
        preg_match_all("/\\{(.*?)\\}/", $templateDetails['body'], $matches);
        $request = [];
        $request['body'] = $matches[0];
        $request['template_message'] = $templateDetails['body'];
        $request['subject'] = $templateDetails['subject'];
        $request['user_details'] = $triggerResult;
        $request['table_result'] = $tableResult;
        $request['workflow_id'] = $workFlowId;
        $request['sequence_id'] = $actionSequenceId;
        $request['action_uuid'] = $actionUUID;
        $request['event_master_id'] = $eventMasterId;
        $request['enrollment'] = $enrollment;
        $request['actions'] = $actions;
        sendDirectEmail::dispatch($request);
        return true;
    }


    public function findEnrollmentAndGetDetails($actions,$triggerResult,$multiConditionValue){
        $property_value =  $actions->property->value;
        $conditionValue = explode(',', $actions->conditionvalue);

        if($actions->condition->value == 'Equals'){
            if(empty($multiConditionValue) || $multiConditionValue == 'AND'){
                $triggerResult = collect($triggerResult)->WhereIn($property_value,$conditionValue)->all();
            }else{
                $triggerResult = $triggerResult;
            }
        }

        if($actions->condition->value == 'Does not equal'){
            if(empty($multiConditionValue) || $multiConditionValue == 'AND' ){
                $triggerResult = collect($triggerResult)->WhereNotIn($property_value,$conditionValue)->all();
            }else{
                $triggerResult = $triggerResult;
            }
        }


        // known is not blank
        if ( $actions->condition->value == 'known' ) {
            if(empty($queryCondition) || $multiConditionValue == 'AND'){
                $triggerResult = Arr::where($triggerResult, function ($value, $key) use($property_value) {
                    return $value[$property_value] != '';
                });
            }else{
                $triggerResult = $triggerResult;
            }
        }

        // unknown is blank
        if ( $actions->condition->value == 'unknown' ) {
            if(empty($queryCondition) || $multiConditionValue == 'AND' ){
                $triggerResult = Arr::where($triggerResult, function ($value, $key) use($property_value) {
                    return $value[$property_value] == '';
                });
            }else{
                 $triggerResult = $triggerResult;
            }
        }
        return $triggerResult;
    }

        // Update this function for multiple value check

    public function branchAction($branchData, $userResult){
        $result = collect($branchData)->map(function ($groupValue) use( $userResult) {
            $groupResult = collect($groupValue)->map(function ($value) use( $userResult) {
                    $conditionValue = $value->conditionvalue;
                    $tableColumnName = $value->property->value;
                    $condition = $value->condition->value;
                        $filterResult = array_filter( $userResult, function ( $item ) use ( $conditionValue, $tableColumnName, $condition ) {
                            if($condition == "Equals"){
                                if (is_string($conditionValue) || is_numeric($conditionValue)) {
                                    if ($item->$tableColumnName == $conditionValue) {
                                        return true;
                                    }
                                } elseif (is_array($conditionValue)) {
                                    if (in_array($item->$tableColumnName, $conditionValue)) {
                                        return true;
                                    }
                                }
                                return false;
                            } else if ($condition == "Does not equal") {
                                if (is_string($conditionValue) || is_numeric($conditionValue)) {
                                    if ($item->$tableColumnName != $conditionValue) {
                                        return true;
                                    }
                                } elseif (is_array($conditionValue)) {
                                    if (!in_array($item->$tableColumnName, $conditionValue)) {
                                        return true;
                                    }
                                }
                                return false;
                            } else if ($condition == "unknown") {
                                if ( $item->$tableColumnName == null ) {
                                    return true;
                                }
                            } else if ($condition == "known") {
                                if ( $item->$tableColumnName != null ) {
                                    return true;
                                }
                            }
                            return false;
                        });
                        return $filterResult;
            });
            $userResult = $groupResult->last();
            return $userResult;
        });
        return $this->mergeAndDistinct($result->toArray(), $userResult);
    }

    public function mergeAndDistinct($data, $userResult){
        $mergedArray = array_reduce($data, function ($carry, $item) {
            $associativeArray = json_decode(json_encode($item), true);
            $carry = array_merge_recursive($carry, $item);
            return $carry;
        }, []);
        $mergedArray =  array_values(array_unique($mergedArray, SORT_REGULAR));

        $ids = [];
        foreach ($mergedArray as $key => $value) {
            $ids[] = $value->id;
        }

        $distinctArray = array_filter($userResult, function ( $item ) use ($ids) {
            if ( in_array($item->id, $ids) ) {
                return false;
            }
            return true;
        });

        return ['ifBranchData' => $mergedArray, 'thanBranchData' => $distinctArray];
    }

    public function delayActionCallback( Request $request ) {
        $request = $request->all();
        $updateArray = array(
            'user_id'=>$request[ 'userId' ],
            'workflow_id'=>$request[ 'workflowId' ],
            'action_uuid'=>$request[ 'actionUUID' ],
            'enrollment'=>$request[ 'enrollment' ],
        );

        $getWorkflow = $this->workflowService->updateDelayActionHistory( $updateArray, $request[ 'workflowId' ] );
        $this->getAndStartWorkflow($getWorkflow, [$request[ 'userId' ]], $request[ 'enrollment' ]);
        return response()->json( [
            'success'=> true,
        ] );

    }

    public function getDealStageData( Request $request ) {
        $request = $request->all();
        $dealStageData = $this->workflowService->dealStageData( $request );
        return new PortalDealStageCollection( $dealStageData );
    }

    public function errorlogs($errorarray){
        return app( 'App\Http\Controllers\LogController' )->workFlowErrorLogs( $errorarray );
    }

    public function showEnrollmentHistory(Request $request, $workflowId){
        $request = $request->all();
        $getResult = $this->workflowService->enrollmentHistory( $request, $workflowId );
        return new WorkflowEnrollmentHistoryCollection( $getResult );
    }

    public function getWorkflowEnrollmentUser(Request $request , $workflowId){
        $getResult = $this->workflowService->workflowEnrollmentUser( $workflowId );
        return response()->json([
            'data' => $getResult
        ]);
    }

    public function storeWorkflowSetting( Request $request){
        $request = $request->all();
        $result = $this->workflowService->storeWorkflowSetting($request);
        return new WorkflowSettingResource($result);
    }

    public function getWorkflowSetting(Request $request){
        $result = $this->workflowService->getWorkflowSetting();
        if(!empty($result)){
            return response()->json([
                'error'=>false,
                'statusCode'=>200,
                'data'=> new WorkflowSettingResource($result)
            ]);
        }else{
            return response()->json([
                'error'=>false,
                'statusCode'=>200,
                'data'=>[]
            ]);
        }

    }

    public function sendOtp(Request $request, $workflowId){
        $result = $this->workflowService->getWorkflowSetting($id=1);
        $getPortalUserEmails = $this->workflowService->getPortalUserEmail(json_decode($result->portal_users));
        $getWorkflowDetails = $this->workflowService->show($workflowId);
        $workflowUrl = config('services.portal.url').'workflows/'.$workflowId;
        $otp = $this->generateRandomNumber();
        $message = '<html><body>';
        $message .= '<p style="color:#333;font-size:14px;">Authorization code for activating CarBlip workflow is : '.$otp.'</p>';
        $message .= '<p style="color:#333;font-size:14px;">Workflow Name : '.$getWorkflowDetails[0]->wf_name.'</p>';
        $message .= '<p style="color:#333;font-size:14px;"><a href="'.$workflowUrl.'">'.$workflowUrl.'</a></p>';
        $message .= '<p style="color:#333;font-size:14px;">This OTP will expire in 6 hours </p>';
        $message .= '<p style="color:#333;font-size:14px;">Regards,</p>';
        $message .= '<p style="color:#333;font-size:14px;">Carblip</p>';
        $message .= '</body></html>';

        $fromEmail = 'support@carblip.com';
        $fromName = 'Carblip';
        $subject = 'Workflow Notification';
        foreach ($getPortalUserEmails as $email) {
            $toEmails[$email] = "";
        }

        $email = new Mail();
        $email->setFrom($fromEmail, $fromName);
        $email->setSubject($subject);
        $email->addTos($toEmails);
        $email->addContent(
            "text/html",
            $message
        );

        $sendgrid = new \SendGrid(config('services.sendgrid.api_key'));
        try {
            $response = $sendgrid->send($email);
            if ($response->statusCode() >= 200 && $response->statusCode() < 300) {
            } else {
                if (app()->bound('sentry')) {
                    app('sentry')->captureException(new Exception($response->body()), 500);
                }
                return response()->json( [
                    'success'=> false,
                ] );
            }
        } catch (Exception $e) {
            if (app()->bound('sentry')) {
                app('sentry')->captureException($e, 500);
            }
            return response()->json( [
                'success'=> false,
            ] );
        }
        $this->workflowService->storeVerificationCode($workflowId,$otp);
        return response()->json( [
            'success'=> true,
        ]);
    }

    public function verifyOtp(Request $request){
        $data =  $request->all();
        $result = $this->workflowService->verifyWorkflowOtp($data['id']);
        $currentDateTime = Carbon::now()->setTimezone('America/Los_Angeles');
        $storedDateTime = Carbon::parse($result->created_at)->setTimezone('America/Los_Angeles');
        $otpExpiryHours = 6;
        if ($result->verification_code == $data['otp']  && $currentDateTime->diffInHours($storedDateTime) <= $otpExpiryHours) {
            return response()->json(['message' => 'OTP verification successful'], 200);
        }else{
            return response()->json(['message' => 'Invalid or expired OTP'], 400);
        }
    }

    public function workflowSettingLogs(Request $request){
        $filter = $request->all();
        $result = $this->logService->getLogsList(Logs::Portal, $filter , TargetTypes::WorkflowSetting);
        return LogResource::collection($result);
    }


    public function getWorkflowActionEnrollment(Request $request, $workflowId){
        $request = $request->all();
        $workflow = $this->workflowService->show( $workflowId );
        $workflow = $workflow->first();
        if($workflow){
            $getActionIds = $this->getActionId(json_decode($workflow->actions));
            $delayActionId = $this->checkDelayAction(json_decode($workflow->actions));
            if($delayActionId){
                $getActionIds[] = $delayActionId;
            }
            $getResult = $this->workflowService->getlastActionEnrollmentDetails($workflowId, $getActionIds, $workflow);
            $filteredData = $getResult->reject(function ($item) {
                return $item['event_master_id'] == 102 && $item['is_open'] == 1;
            });
            $filteredEnrollmentUsers = $this->workflowService->filterEnrolledUsers($filteredData);
            return new WorkflowEnrollmentCollection($filteredEnrollmentUsers);
        }else{
            return response()->json( [
                'data'=> [],
            ]);
        }
    }

    public function getActionId($actions){
        foreach ($actions as $index => $value) {
            if($value->actionName != "Enrollment"){
                if($value->actionName == "Delay"){
                    if($index > 0){
                        if($value->actionName != "Branch"){
                            array_push($this->actionId,$actions[$index-1]->id);
                        }
                    }
                }
                if($value->actionName != "Delay" && $value->actionName != "Branch"){
                    $this->lastActionId = $value->id;
                }

                if (!empty($value->ifbranchdata) && count($value->ifbranchdata) > 0) {
                    if($index > 0 || $value->actionName != "Delay" && $value->actionName != "Branch"){
                        if($actions[$index-1]->actionName != "Delay"){
                            array_push($this->actionId,$actions[$index-1]->id);
                        }
                    }
                    $this->getActionId( $value->ifbranchdata );
                }

                if (!empty($value->thenbranchdata) && count($value->thenbranchdata) > 0 ) {
                    if($index > 0 || $value->actionName != "Delay" && $value->actionName != "Branch"){
                        if($actions[$index-1]->actionName != "Delay"){
                            array_push($this->actionId,$actions[$index-1]->id);
                        }
                    }
                    $this->getActionId( $value->thenbranchdata );
                }
            }
        }
        if ($this->lastActionId !== null) {
            array_push($this->actionId, $this->lastActionId);
        }
        return array_unique($this->actionId);

    }

    public function checkDelayAction($actions){
        $actionId = Null;
        if (!empty($actions) && $actions[0]->actionName == 'Delay') {
            $actionId = $actions[0]->id;
        }
        return $actionId;
    }

    public function getWorkflowActionEnrollmentContacts(Request $request, $workflowId){
        $request = $request->all();
        $workflow = $this->workflowService->show( $workflowId );
        $workflow = $workflow->first();
        if($workflow){
            $getActionIds = $this->getActionId(json_decode($workflow->actions));
            $delayActionId = $this->checkDelayAction(json_decode($workflow->actions));
            if($delayActionId){
                $getActionIds[] = $delayActionId;
            }
            $getResult = $this->workflowService->getlastActionEnrollmentDetails($workflowId, $getActionIds, $workflow);
            $filteredEnrollmentUsers = $this->workflowService->filterEnrolledUsers($getResult);
            $filteredEnrollmentUsers = $filteredEnrollmentUsers->where('action_uuid', $request['action_id'])->values();
            $userIds = [];
            if($filteredEnrollmentUsers->isNotEmpty()) {
                $userIds = $filteredEnrollmentUsers[0]->total_user_count;
            }
            $getResult = $this->workflowService->getWorkflowActionEnrollmentContacts($request, $workflowId, $userIds);
            return new WorkflowEnrollmentContactCollection( $getResult );
        } else {
            return response()->json( [
                'data'=> [],
            ]);
        }
    }

    public function getEngagedWorkflowsForContact(Request $request, $userId){
        $requestData  = $request->all();
        $engagedWorkflows  = $this->workflowService->getEngagedWorkflowsForContact( $requestData, $userId );
        return new ContactEngagedWorkflowCollection ( $engagedWorkflows );
    }

    public function sendWebhookAction($triggerResult,$actions,$workFlowId,$tableResult,$enrollment) {
        $request = [];
        $request['triggerResult'] = $triggerResult;
        $request['actionDetails'] = $actions;
        $request['workflowId'] = $workFlowId;
        $request['tableResult'] = $tableResult;
        $request['enrollment'] = $enrollment;
        SendWebhookJob::dispatch($request);
        return true;
    }

    public function sendWebhookTest(Request $request){
        $request =  $request->all();
        $httpClient = new \GuzzleHttp\Client();
        $statusCode = null;
        $webhookUrl = 'https://'.$request['webhook_url'];
        try {
            $response = $httpClient->request($request['method'], $webhookUrl, [
                'json' => [],
                'headers' => [
                    'content-type' => 'application/json'
                ],
            ]);
            $statusCode = $response->getStatusCode();
        } catch (\Exception $e) {
            $statusCode = $e->getCode();
        }
        return response()->json( [
            'result'=> $statusCode,
        ]);
    }
}
