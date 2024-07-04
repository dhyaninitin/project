<?php

namespace App\Services;

use App\Model\{HubspotType,WorkflowSmsTemplates, HubspotWorkFlows,
    User, WorkflowHistory,PortalUser,PortalDealStage,Log,WorkflowProperty,VehicleRequest,EmailTemplates,WorkflowSetting, WorkflowVerification};
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Auth;
use App\Traits\WorkFlowTrait;
use App\Enums\{Roles, Logs, PortalAction, TargetTypes, EnrollmentStatus};
use Illuminate\Support\Collection;
use Carbon\Carbon;

    class WorkflowService extends AbstractService
 {
        use WorkFlowTrait;

        // Workflow Property


        public function getTableColumns(){
            $registerUserColumns = DB::connection('mysql-user')->select( DB::raw('SHOW COLUMNS FROM `user`'));
            $vehicle_requestColumns = DB::connection('mysql-user')->select( DB::raw('SHOW COLUMNS FROM `vehicle_requests`'));
            $portal_users_requestColumns = DB::connection('mysql')->select( DB::raw('SHOW COLUMNS FROM `portal_users`'));
            return array(
                "users"=>$registerUserColumns,
                "vehicle_requests"=>$vehicle_requestColumns,
                "portal_users"=>$portal_users_requestColumns,
            );
        }

        public function workflowProprty($status){
            if($status){
                return WorkflowProperty::select("*")->count();
            }else{
                return WorkflowProperty::select("*")->orderBy('table_type', 'asc')->get();
            }

        }

        public function storeWorkflowProperty($tableColumn,$tableType){
            foreach ($tableColumn as $column_name) {
                $property = WorkflowProperty::where('table_type', $tableType)->where('name', $column_name->Field)->first();
                if (!$property){
                    $property = new WorkflowProperty;
                    $property->table_type = $tableType;
                    $property->name = $column_name->Field;
                    $property->type = $column_name->Type;
                    $property->save();
                }
            }
        }




       public function getpropertyValue($tableDetails,$request){
            $query = DB::table($tableDetails['db_name'].'.'.$tableDetails['table_name']);
            $query->select($request['field_name'])->Where($request['field_name'], 'like',  $request['inputValue'] . '%');
            $query->groupBy($request['field_name'])->orderBy( 'created_at', 'desc' );
            return $query->get();
        }

        // Sms Templates

        public function getSmstemplateList($filters){
            $result = [];
            $page  = isset( $filters[ 'page' ] ) ? $filters[ 'page' ] : 1;
            $per_page = isset( $filters['per_page'] ) ? $filters['per_page'] : 10;
            $order_by = isset( $filters[ 'order_by' ] ) ? $filters[ 'order_by' ]: null;
            $order_dir = isset( $filters[ 'order_dir' ] ) ? $filters[ 'order_dir' ]: 'desc';
            $offset = ( $page - 1 ) * $per_page;
            $search_value = isset($filters['search']) ? $filters['search']: '';

            $db_name = config('services.database.first');
            $query = WorkflowSmsTemplates::select("{$db_name}.sms_template.*","{$db_name}.portal_users.first_name","{$db_name}.portal_users.last_name");
            $query->join( "{$db_name}.portal_users", "{$db_name}.portal_users.id", '=', "{$db_name}.sms_template.added_by" );

            if($search_value) {

                $search_value_arr = explode(' ', $search_value);
                foreach ($search_value_arr as $value) {
                    $query->whereRaw("concat(sms_title) like '%{$value}%'");
                }
            }

            $num_results_filtered = $query->count();

            if ( $order_by ) {
                $query = $query->orderBy( $order_by, $order_dir );
            } else {
                $query = $query->orderBy( 'created_at', 'desc' );
            }

            $query = $query->offset($offset)->limit($per_page);
            $template = $query->get();
            $count = $offset;
            $result = new LengthAwarePaginator( $template, $num_results_filtered, $per_page, $page );
            $result->setPath( route( 'workflow-sms.getSmsTemplateList') );
            return $result;
        }

        public function storeSmsTemplate($data,$id) {
            $store = new WorkflowSmsTemplates;
            $store->sms_title = $data['title'];
            $store->added_by = $id;
            $store->message = json_encode($data['message']);
            $store->save();
            return $store;
        }

        public function updateSmsTemplate($request){
            $upateSmsStatus = WorkflowSmsTemplates::where('id', $request['id'])->update(
                ['sms_title'=>$request['title'],'message'=> json_encode($request['message'])]
            );
                if($upateSmsStatus){
                    return true;
                }
        }

        public function upateSmsTemplateStatus($data,$id){
            $portal_user = Auth::user();
            $db_name = config('services.database.first');
            $query = WorkflowSmsTemplates::select("{$db_name}.sms_template.*","{$db_name}.portal_users.first_name","{$db_name}.portal_users.last_name");
            $query->join( "{$db_name}.portal_users", "{$db_name}.portal_users.id", '=', "{$db_name}.sms_template.added_by" );

            $smsTemplate = $query->find($id);
            $is_active = $data['is_active'];
            $update = array(
                'is_active' => $is_active
            );
            $smsTemplate->update($update);

            return $smsTemplate;
        }

        public function deletesmsTemplate($ids){
            $deleteSmsTemplate = WorkflowSmsTemplates::where('id', $ids)->delete();
                if($deleteSmsTemplate){
                    return true;
                }
        }

        public function getListSmstemplate(){
            $db_name = config('services.database.first');
            $query = WorkflowSmsTemplates::select("{$db_name}.sms_template.*","{$db_name}.portal_users.first_name","{$db_name}.portal_users.last_name");
            $query->join( "{$db_name}.portal_users", "{$db_name}.portal_users.id", '=', "{$db_name}.sms_template.added_by" );
            $query->where( "{$db_name}.sms_template.is_active", 0 );
            return $query->get();
        }

        public function getSmsTemplatedByid($tempid){
            return WorkflowSmsTemplates::select('message')->where('id', $tempid)->get()->toarray();
        }

        public function getEmailTemplateById($tempid){
            return EmailTemplates::select('body','subject')->where('id', $tempid)->get()->toarray();
        }

        public function getPortalUserDetails($email){
            return PortalUser::select('*')->where('email',$email)->get()->toArray();
        }

        // Workflow services

        public function getWorkFlowList( $filters ) {
            $result = [];
            $page  = isset( $filters[ 'page' ] ) ? $filters[ 'page' ] : 1;
            $per_page = isset( $filters[ 'per_page' ] ) ? $filters[ 'per_page' ] : 10;
            $order_by = isset( $filters[ 'order_by' ] ) ? $filters[ 'order_by' ]: null;
            $order_dir = isset( $filters[ 'order_dir' ] ) ? $filters[ 'order_dir' ]: 'desc';
            $offset = ( $page - 1 ) * $per_page;
            $search_value = isset($filters['search']) ? $filters['search']: '';
            $db_name = config('services.database.first');

            $query = HubspotWorkFlows::select( "{$db_name}.hubspot_workflow.*", "{$db_name}.hubspot_trigger_type.trigger_type as type","{$db_name}.portal_users.first_name","{$db_name}.portal_users.last_name" );
            $query->join( "{$db_name}.hubspot_trigger_type", "{$db_name}.hubspot_trigger_type.id", '=', "{$db_name}.hubspot_workflow.type" );
            $query->join( "{$db_name}.portal_users", "{$db_name}.portal_users.id", '=', "{$db_name}.hubspot_workflow.added_by" );

            if($search_value) {

                $search_value_arr = explode(' ', $search_value);
                foreach ($search_value_arr as $value) {
                    $query->whereRaw("concat(hubspot_workflow.wf_name, ' ',hubspot_trigger_type.trigger_type, ' ',portal_users.first_name, ' ',portal_users.last_name, ' ') like '%{$value}%'");
                }
            }

            $num_results_filtered = $query->count();

            if ( $order_by ) {
                $query = $query->orderBy( $order_by, $order_dir );
            } else {
                $query = $query->orderBy( 'created_at', 'desc' );
            }

            $query = $query->offset( $offset )->limit( $per_page );

            $workflows = $query->get();
            $count = $offset;
            $result = new LengthAwarePaginator( $workflows, $num_results_filtered, $per_page, $page );
            $result->setPath( route( 'workflow.workflowList' ) );
            return $result;
        }

        public function show( $requestId ) {
            $db_name = config('services.database.first');
            $query = HubspotWorkFlows::select( "{$db_name}.hubspot_workflow.*", "{$db_name}.hubspot_trigger_type.trigger_type as type" );
            $query->join( "{$db_name}.hubspot_trigger_type", "{$db_name}.hubspot_trigger_type.id", '=', "{$db_name}.hubspot_workflow.type" );
            $result = $query->where( "{$db_name}.hubspot_workflow.id", $requestId )->get();
            return $result;
        }

        public function gettypelist () {
            return HubspotType::select()->get();
        }

        public function create( $data ) {
            $portal_user = Auth::user();
            $store = new HubspotWorkFlows;
            $store->wf_name = $data[ 'workflowname' ];
            $store->type = $this->getWorkflowType($data[ 'trigger' ]);
            $store->triggers = json_encode( $data[ 'trigger' ] );
            $store->actions = json_encode( $data[ 'action' ] );
            $store->added_by = $portal_user->id;
            $store->is_active = 1;
            $store->workflow_execute_time = 0;
            $store->save();
            if($store){
                $msg= '<b>'.$data[ 'workflowname' ].'</b> was <b>created</b> on portal by <b>'.$portal_user->full_name.'</b>';
                Log::create(array(
                    'category'      => Logs::Workflow,
                    'action'        => PortalAction::CREATED,
                    'target_id'     => $store->id,
                    'target_type'   => TargetTypes::Workflow,
                    'portal_user_id'   => $portal_user->id,
                    'portal_user_name' => $portal_user->full_name,
                    'content'       => $msg
                ));
            }

            return $store;
        }

        public function updateWorkflow($data){
            $update = HubspotWorkFlows::find($data['workflow_id']);
                $update->update(
                    [
                        'type' => $this->getWorkflowType($data[ 'trigger' ]),
                        'triggers'=>json_encode( $data[ 'trigger' ] ),
                        'actions'=>json_encode( $data[ 'action' ] ),
                        'wf_name'=> $data[ 'workflowname' ],
                    ]
                );
            if($update){
                // $data['workflow_payload']['content'] = preg_replace('/,/', '', $data['workflow_payload']['content'], 1);
                // Log::create($data['workflow_payload']);
                return true;
            }
        }

        public function updateWorkflowStatus($data){
            $portal_user = Auth::user();
            $db_name = config('services.database.first');
            $query = HubspotWorkFlows::select("{$db_name}.hubspot_workflow.*",
                            "{$db_name}.hubspot_trigger_type.trigger_type as type",
                            "{$db_name}.portal_users.first_name",
                            "{$db_name}.portal_users.last_name")
                        ->join("{$db_name}.hubspot_trigger_type",
                            "{$db_name}.hubspot_trigger_type.id", '=', "{$db_name}.hubspot_workflow.type")
                        ->join("{$db_name}.portal_users",
                            "{$db_name}.portal_users.id", '=', "{$db_name}.hubspot_workflow.added_by");
            $workflow = $query->find($data['id']);

            $enrollmentCount = $workflow->enrollment_count;
            if(($data['activation_for'] == 1) &&  ($data['is_active'] == 0)){
                $enrollmentCount = $enrollmentCount + 1;
            }

            $update = [
                'is_active' => $data[ 'is_active' ] ,
                'is_activation'=>$data[ 'activation_for' ] ,
                'activation_updated_at'=> date('Y-m-d H:i:s'),
                'enrollment_count' => $enrollmentCount
            ];
            $workflow->update($update);

            if($workflow){
                if ($data['activation_for'] == 1) {
                    $activationFor = 'All records';
                } elseif($data['activation_for'] == 2) {
                    $activationFor = 'Only records created after activation';
                }

                if ($workflow->is_active == 0) {
                    $msg = '<b>'.$workflow->wf_name.'</b> is <b>activated</b> for <b>'.$activationFor.'</b> by <b>'.$portal_user->full_name.'</b>';
                } elseif ($workflow->is_active == 1){
                    $msg = '<b>'.$workflow->wf_name.'</b> is <b>deactivated</b> by <b>'.$portal_user->full_name.'</b>';
                }

                Log::create(array(
                    'category'      => Logs::Workflow,
                    'action'        => PortalAction::UPDATED,
                    'target_id'     => $workflow->id,
                    'target_type'   => TargetTypes::Workflow,
                    'portal_user_id'   => $portal_user->id,
                    'portal_user_name' => $portal_user->full_name,
                    'content'       => $msg
                ));
            }
            return $workflow;
        }

        public function deleteWorkflow($id){
            $portal_user = Auth::user();
            $workflow = HubspotWorkFlows::find($id);
            if ($workflow) {
                $workflow->delete();
                $msg = '<b>'.$workflow->wf_name.'</b> <b>deleted </b> by <b>'.$portal_user->full_name.'</b>';
                Log::create(array(
                    'category'      => Logs::Workflow,
                    'action'        => PortalAction::DELETED,
                    'target_id'     => $id,
                    'target_type'   => TargetTypes::Workflow,
                    'portal_user_id'   => $portal_user->id,
                    'portal_user_name' => $portal_user->full_name,
                    'content'       => $msg
                ));
                return true;
            } else {
                return false;
            }
        }

        // Workflow Services

        public function getAllWorkflows() {
            $db_name = config('services.database.first');
            $query = HubspotWorkFlows::select( "{$db_name}.hubspot_workflow.*", "{$db_name}.hubspot_trigger_type.trigger_type as type" );
            $query->join( "{$db_name}.hubspot_trigger_type", "{$db_name}.hubspot_trigger_type.id", '=', "{$db_name}.hubspot_workflow.type" );
            $query->where( 'is_active', 0 );
            return $query->get();
        }

        public function updateDelayActionHistory($request, $workflowId) {
            $prev_enrollment = $request['enrollment'];
            $db_name = config('services.database.first');
            $workflow = HubspotWorkFlows::select("{$db_name}.hubspot_workflow.wf_name",
                    "{$db_name}.hubspot_workflow.is_active",
                    "{$db_name}.hubspot_workflow.enrollment_count")
                ->where("{$db_name}.hubspot_workflow.id", $request['workflow_id'])->get();
            $delayActionResult = WorkflowHistory::where($request)->first();
            if ($delayActionResult) {
                $workflow_name = null;
                $logData = [
                    "userid" => $request['user_id'],
                    "type" => 'Action',
                    "actionId" =>'102',
                    "workflow_name" => $workflow_name
                ];
                if((!empty($workflow) || !$workflow->isEmpty()) && count($workflow) > 0) {
                    $current_enrollment = $workflow[0]['enrollment_count'];
                    $is_workflow_active = $workflow[0]['is_active'];
                    $workflow_name = $workflow[0]['wf_name'];
                    if($is_workflow_active == 0 && $current_enrollment && $current_enrollment != $prev_enrollment) {
                        // Delay Aborted/Cancelled
                        $logData = [
                            "userid" => $request['user_id'],
                            "type" => 'Action',
                            "actionId" =>'102',
                            "workflow_name" => $workflow_name,
                            "delay_status" => EnrollmentStatus::CANCELLED
                        ];
                        $delayActionResult->is_open = EnrollmentStatus::CANCELLED;
                    } else if($is_workflow_active == 1) {
                        // Delay Failed as workflow was not active
                        $logData = [
                            "userid" => $request['user_id'],
                            "type" => 'Action',
                            "actionId" => '102',
                            "workflow_name" => $workflow_name,
                            "delay_status" => EnrollmentStatus::FAILED
                        ];
                        $delayActionResult->is_open = EnrollmentStatus::FAILED;
                    } else {
                        // Delay Success
                        $logData = [
                            "userid" => $request['user_id'],
                            "type" => 'Action',
                            "actionId" => '102',
                            "workflow_name" => $workflow_name,
                            "delay_status" => EnrollmentStatus::SUCCESS
                        ];
                        $delayActionResult->is_open = EnrollmentStatus::SUCCESS;
                    }
                } else {
                    $delayActionResult->is_open = EnrollmentStatus::SUCCESS;
                }

                $delayActionResult->save();

                Log::create([
                    'category' => Logs::Workflow,
                    'action' => PortalAction::UPDATED,
                    'target_id' => $workflowId,
                    'target_type' => TargetTypes::Workflow,
                    'content' =>  json_encode($logData),
                ]);

                $query = HubspotWorkFlows::select("{$db_name}.hubspot_workflow.*")
                            ->where("{$db_name}.hubspot_workflow.is_active", 0)
                            ->where("{$db_name}.hubspot_workflow.id", $workflowId)
                            ->where("{$db_name}.hubspot_workflow.enrollment_count", $prev_enrollment);

                return $query->get();
            }
        }


        public function createTriggerQuery($triggerData , $activateFor,$updated_at, $objectIds = null, $skippedObjects = 0) {
            $second_db_name = config('services.database.second');
            $first_db_name = config('services.database.first');
            $query = ''; $dbTableName; $databaseId = [];
            $tableJoined = ['user' => false, 'portal_users' => false, 'vehicle_requests' => false];

            foreach ( $triggerData as $index => $value ) {
                $queryResult = $this->triggerQuery($value, $index, $query, $objectIds, $tableJoined);
                $query = $queryResult['sql_query'];
                $tableJoined = $queryResult['tableJoined'];
              if(empty($dbTableName)){
                $dbTableName = $queryResult['database_table'];
                $databaseId = array_merge($databaseId , $queryResult['database_id']);
              }
            }

            if($activateFor == 2){
                if($dbTableName == 'user'){
                    $query->where("{$second_db_name}.user.updated_at",'>',date('Y-m-d H:i:s', strtotime("$updated_at")));
                } else if ($dbTableName == 'vehicle_requests') {
                    $query->where("{$second_db_name}.vehicle_requests.updated_at",'>',date('Y-m-d H:i:s', strtotime("$updated_at")));
                } else if ($dbTableName == 'portal_users'){
                    $query->where("{$first_db_name}.portal_users.updated_at",'>',date('Y-m-d H:i:s', strtotime("$updated_at")));
                }
            }

            return [
                'result'=> $query->skip($skippedObjects * 1000)->take(1000)->get()->toArray(),
                'database_id'=> $databaseId
            ];
        }

        // get and check all workflow
        public function triggerQuery( $data , $triggerindex, $query, $objectIds = null, $tableJoined) {
            $second_db_name = config('services.database.second');
            $queryresult = ''; $queryRes = []; $dbTableName; $dataBaseId = [];
                foreach ( $data as $index => $value ) {
                    $table = $this->typeformate( $value->type->id ); // Check Type or get table name & configuration
                    $dbTableName = $table['table_name'];
                    array_push($dataBaseId , $value->type->id);

                    if($dbTableName == 'user'){
                        $dbTableNames = $table['db_name'].'.user';
                    }else if($dbTableName == 'vehicle_requests'){
                        $dbTableNames = $table['db_name'].'.vehicle_requests';
                    }else if($dbTableName == 'portal_users'){
                        $dbTableNames = $table['db_name'].'.portal_users';
                    }

                    if($triggerindex == 0){
                        if($index == 0){
                            $tableJoined[$dbTableName] = true;
                            $result = $this->createWorkflowQuery($value,DB::table($dbTableNames),$dbTableName,$condition=null, $objectIds, $tableJoined);
                        }else{
                            $result = $this->createWorkflowQuery($value,$queryresult,$dbTableName,$condition=null, $objectIds, $tableJoined);
                        }
                    }else{
                        if($index == 0){
                            $result = $this->createWorkflowQuery($value,$query,$dbTableName,$condition="OR", $objectIds, $tableJoined);
                        }else{
                            $result = $this->createWorkflowQuery($value,$query,$dbTableName,$condition=null, $objectIds, $tableJoined);
                        }
                    }
                    $queryresult = $result['query'];
                    $tableJoined = $result['tableJoined'];
                }
                return ['sql_query'=>$queryresult,'database_table'=> $dbTableName, 'database_id'=> $dataBaseId, 'tableJoined' => $tableJoined];

        }

        // Create workflow dynamic Query
        public function createWorkflowQuery($workflow,$query,$dbTableName,$queryCondition, $objectIds = null, $tableJoined){
            $secondDatabaseName = config('services.database.second');
            $fristDatabaseName = config('services.database.first');
            $condition = $this->formatCondition($workflow->condition->id );
            $conditionData = !is_array($workflow->conditionvalue) ? explode(',', $workflow->conditionvalue) : $workflow->conditionvalue;

            if($dbTableName == 'user'){
                if ($objectIds && count($objectIds)) {
                    $query->whereIn($secondDatabaseName.'.user.id', $objectIds);
                }

                if(!$tableJoined[$dbTableName]){
                    $query->select("{$secondDatabaseName}.vehicle_requests.*","{$secondDatabaseName}.user.*", "{$secondDatabaseName}.vehicle_requests.id as deal_id", "{$secondDatabaseName}.vehicle_requests.id as id");
                    $query->join("{$secondDatabaseName}.user", "user.id", "=", "{$secondDatabaseName}.vehicle_requests.user_id");
                    $query->where(function ($query) use ($secondDatabaseName) {
                        $query->whereRaw("{$secondDatabaseName}.vehicle_requests.id = (
                            SELECT MAX(id) FROM {$secondDatabaseName}.vehicle_requests AS latest_vehicle_request
                            WHERE latest_vehicle_request.user_id = {$secondDatabaseName}.user.id )");
                    });
                    $tableJoined[$dbTableName] = true;
                }

                if ( $condition['condition_name'] == 'Equals' ) {
                    if(!empty($queryCondition)){
                        $query->orWhereIn($secondDatabaseName.'.user.'.$workflow->property->value, $conditionData);
                    } else {
                        $query->whereIn( $secondDatabaseName.'.user.'.$workflow->property->value, $conditionData);
                    }
                }

                if ( $condition['condition_name'] == 'Does not equal' ) {
                    if(!empty($queryCondition)){
                        $query->orWhere(function ($query){
                            $query->whereNotIn( $secondDatabaseName.'.user.'.$workflow->property->value, $conditionData);
                        });
                    }else{
                        $query->whereNotIn( $secondDatabaseName.'.user.'.$workflow->property->value, $conditionData);
                    }
                }

                if ( $condition['condition_name'] == 'unknown' ) {

                    if(!empty($queryCondition)){
                        $query->orwhereNull($secondDatabaseName.'.user.'.$workflow->property->value);
                    }else{
                        $query->whereNull($secondDatabaseName.'.user.'.$workflow->property->value);
                    }
                }
                if ( $condition['condition_name'] == 'known' ) {
                    if(!empty($queryCondition)){
                        $query->orwhereNotNull($secondDatabaseName.'.user.'.$workflow->property->value);
                    }else{
                        $query->whereNotNull($secondDatabaseName.'.user.'.$workflow->property->value);
                    }

                }

            }else if ($dbTableName == 'vehicle_requests'){

                // if ($objectIds && count($objectIds)) {
                //     $query->whereIn($secondDatabaseName.'.vehicle_requests.id', $objectIds);
                // }

                if(!$tableJoined[$dbTableName]){
                    $query->select("{$secondDatabaseName}.vehicle_requests.*","{$secondDatabaseName}.user.*", "{$secondDatabaseName}.vehicle_requests.id as deal_id", "{$secondDatabaseName}.vehicle_requests.id as id");
                    $query->join("{$secondDatabaseName}.vehicle_requests", "{$secondDatabaseName}.user.id", "=", "{$secondDatabaseName}.vehicle_requests.user_id");
                    $query->where(function ($query) use ($secondDatabaseName) {
                            $query->whereRaw("{$secondDatabaseName}.vehicle_requests.id = (
                                SELECT MAX(id) FROM {$secondDatabaseName}.vehicle_requests AS latest_vehicle_request
                                WHERE latest_vehicle_request.user_id = {$secondDatabaseName}.user.id )");
                    });
                    $tableJoined[$dbTableName] = true;
                }

                // $query->join("{$second_db_name}.vehicle_requests", "{$second_db_name}.vehicle_requests.user_id", "=", "{$second_db_name}.user.id");


                if ( $condition['condition_name'] == 'Equals' ) {

                    if(!empty($queryCondition)){

                        $query->orWhereIn($secondDatabaseName.'.vehicle_requests.'.$workflow->property->value, $conditionData);
                    }else{
                        $query->WhereIn( $secondDatabaseName.'.vehicle_requests.'.$workflow->property->value, $conditionData);
                    }
                }
                if ( $condition['condition_name'] == 'Does not equal' ) {
                    if(!empty($queryCondition)){
                        $query->orWhere(function ($query){
                            $query->whereNotIn( $secondDatabaseName.'.vehicle_requests.'.$workflow->property->value, $conditionData);
                        });
                    }else{
                        $query->whereNotIn( $secondDatabaseName.'.vehicle_requests.'.$workflow->property->value, $conditionData);
                    }

                }
                if ( $condition['condition_name'] == 'unknown' ) {

                    if(!empty($queryCondition)){
                        $query->orwhereNull($secondDatabaseName.'.vehicle_requests.'.$workflow->property->value);
                    }else{
                        $query->whereNull($secondDatabaseName.'.vehicle_requests.'.$workflow->property->value);
                    }
                }
                if ( $condition['condition_name'] == 'known' ) {
                    if(!empty($queryCondition)){
                        $query->orwhereNotNull($secondDatabaseName.'.vehicle_requests.'.$workflow->property->value);
                    }else{
                        $query->whereNotNull($secondDatabaseName.'.vehicle_requests.'.$workflow->property->value);
                    }

                }
            }else if ($dbTableName == 'portal_users'){

                // if ($objectIds && count($objectIds)) {
                //     $query->whereIn($fristDatabaseName.'.portal_users.id', $objectIds);
                // }

                if ( $condition['condition_name'] == 'Equals' ) {

                    if(!empty($queryCondition)){

                        $query->orWhereIn($fristDatabaseName.'.portal_users.'.$workflow->property->value, $conditionData);
                    }else{
                        $query->WhereIn( $fristDatabaseName.'.portal_users.'.$workflow->property->value, $conditionData);
                    }
                }

                if ( $condition['condition_name'] == 'Does not equal' ) {
                    if(!empty($queryCondition)){
                        $query->orWhere(function ($query){
                            $query->whereNotIn( $fristDatabaseName.'.portal_users.'.$workflow->property->value, $conditionData);
                        });
                    }else{
                        $query->whereNotIn( $fristDatabaseName.'.portal_users.'.$workflow->property->value, $conditionData);
                    }

                }
                if ( $condition['condition_name'] == 'unknown' ) {

                    if(!empty($queryCondition)){
                        $query->orwhereNull($fristDatabaseName.'.portal_users.'.$workflow->property->value);
                    }else{
                        $query->whereNull($fristDatabaseName.'.portal_users.'.$workflow->property->value);
                    }
                }
                if ( $condition['condition_name'] == 'known' ) {
                    if(!empty($queryCondition)){
                        $query->orwhereNotNull($fristDatabaseName.'.portal_users.'.$workflow->property->value);
                    }else{
                        $query->whereNotNull($fristDatabaseName.'.portal_users.'.$workflow->property->value);
                    }

                }
            }

            return ['query' => $query, 'tableJoined' => $tableJoined];
        }

        // $userId,$isOpen
        public function createActionHistory($workFlowId,$usersData,$sequenceId, $actionUUID, $eventMasterId, $enrollment, $tableResult, $actionDetails = Null){
            $userArray = [];
            $getActionTitle = $this->getActionTitle($actionDetails);
            foreach ($usersData as $users) {
                if(in_array(1, $tableResult) && in_array(2, $tableResult)){
                    $actionHistory = WorkflowHistory::where('user_id', $users->user_id)->where('deal_id', $users->deal_id)->where('workflow_id', $workFlowId)->where('enrollment', $enrollment)
                    ->where('action_uuid', $actionUUID)->first();
                } else if (in_array(1, $tableResult)){
                    $actionHistory = WorkflowHistory::where('user_id', $users->id)->where('workflow_id', $workFlowId)->where('enrollment', $enrollment)
                    ->where('action_uuid', $actionUUID)->first();
                } else if (in_array(2, $tableResult)){
                    $actionHistory = WorkflowHistory::where('deal_id', $users->id)->where('workflow_id', $workFlowId)->where('enrollment', $enrollment)
                    ->where('event_master_id', $eventMasterId)->where('action_uuid', $actionUUID)->first();
                } else if (in_array(5, $tableResult)){
                    $actionHistory = WorkflowHistory::where('user_id', $users->id)->where('deal_id', $users->deal_id)->where('workflow_id', $workFlowId)->where('enrollment', $enrollment)
                    ->where('action_uuid', $actionUUID)->first();
                } else if (in_array(3, $tableResult)){
                    $actionHistory = WorkflowHistory::where('portal_user_id', $users->id)->where('workflow_id', $workFlowId)->where('enrollment', $enrollment)
                    ->where('event_master_id', $eventMasterId)->where('action_uuid', $actionUUID)->first();
                }

                if(!$actionHistory){
                    array_push($userArray,$users->id);
                    $actionHistory = new WorkflowHistory;
                    $actionHistory->workflow_id = $workFlowId;
                    if(in_array(1, $tableResult) && in_array(2, $tableResult)){
                        $actionHistory->deal_id = $users->deal_id;
                        $actionHistory->user_id = $users->user_id;
                    } else if (in_array(1, $tableResult)) {
                        $actionHistory->user_id = $users->id;
                    } else if (in_array(2, $tableResult)) {
                        if ($users->deal_id == NULL)
                        {
                            $actionHistory->deal_id = $users->id;
                            $actionHistory->user_id = $users->user_id;
                        }
                        else
                        {
                            $actionHistory->deal_id = $users->id;
                            $actionHistory->user_id = $users->user_id;
                        }
                    }else if (in_array(5, $tableResult)) {
                        $actionHistory->deal_id = $users->deal_id;
                        $actionHistory->user_id = $users->id;
                    } else if (in_array(3, $tableResult)) {
                        $actionHistory->user_id = $users->id;
                        $actionHistory->portal_user_id = $users->id;
                    }
                    $actionHistory->sequence_id = $sequenceId;
                    $actionHistory->action_uuid = $actionUUID;
                    $actionHistory->event_master_id = $eventMasterId;
                    $actionHistory->action_title = $getActionTitle;
                    if($eventMasterId != '102' && $eventMasterId != '110'){
                        $actionHistory->is_open = 1;
                    }
                    $actionHistory->enrollment = $enrollment;
                    $actionHistory->save();
                }
            }
            return $userArray;
        }

        public function createTriggerHistory($workFlowId,$workFlowName,$usersData,$sequenceId, $actionUUID, $eventMasterId, $enrollment, $tableResult, $triggerData){
            $triggerTitle = $this->getTriggerTitle($triggerData);
            try{
                foreach ($usersData as $users) {
                    if(in_array(1, $tableResult) && in_array(2, $tableResult)){
                        $triggerHistory = WorkflowHistory::where('user_id', $users->user_id)->where('deal_id', $users->deal_id)->where('workflow_id', $workFlowId)->where('enrollment', $enrollment)->first();
                    } else if (in_array(1, $tableResult)){
                        $triggerHistory = WorkflowHistory::where('user_id', $users->id)->where('workflow_id', $workFlowId)->where('enrollment', $enrollment)
                        ->where('action_uuid', $actionUUID)->first();
                    } else if (in_array(2, $tableResult)){
                        $triggerHistory = WorkflowHistory::where('deal_id', $users->id)->where('workflow_id', $workFlowId)->where('enrollment', $enrollment)
                        ->where('event_master_id', $eventMasterId)->where('action_uuid', $actionUUID)->first();
                    } else if (in_array(3, $tableResult)){
                        $triggerHistory = WorkflowHistory::where('portal_user_id', $users->id)->where('workflow_id', $workFlowId)->where('enrollment', $enrollment)
                        ->where('event_master_id', $eventMasterId)->where('action_uuid', $actionUUID)->first();
                    }
                    if(!$triggerHistory){
                        $store = new WorkflowHistory;
                        $store->workflow_id = $workFlowId;
                        if(in_array(1, $tableResult) && in_array(2, $tableResult)){
                            $store->deal_id = $users->deal_id;
                            $store->user_id = $users->user_id;
                        } else if (in_array(1, $tableResult)) {
                            $store->user_id = $users->id;
                        } else if (in_array(2, $tableResult)) {
                            $store->user_id = $users->user_id;
                            $store->deal_id = $users->id;
                        } else if (in_array(3, $tableResult)) {
                            $store->user_id = $users->id;
                            $store->portal_user_id = $users->id;
                        }
                        $store->sequence_id = $sequenceId;
                        $store->action_uuid = $actionUUID;
                        $store->event_master_id = $eventMasterId;
                        $store->action_title = $triggerTitle;
                        $store->enrollment = $enrollment;
                        $store->is_open = 1;
                        $store->save();

                    }
                }
                return true;
            }catch ( \Exception $e ) {
                $errorarray = array( 'type'=>'505','info'=>'Trigger History','message'=>$e->getMessage(),'line'=>$e->getLine() );
                return app( 'App\Http\Controllers\LogController' )->workFlowErrorLogs( $errorarray );
            }

        }

        public function updatePropertyActionValues($propertyData,$DataIds, $userIdIfDealTriggerNotExist = null){
            $query;
            foreach($propertyData as $property){
                if($property->tableid == 1){
                    $query = User::whereIn('id',$DataIds)->update([$property->fieldname  => $property->conditionvalue]);
                } else if ($property->tableid == 2){
                    if($userIdIfDealTriggerNotExist != null && !empty($userIdIfDealTriggerNotExist)) {
                        $query = VehicleRequest::whereIn('user_id',$userIdIfDealTriggerNotExist)->update([$property->fieldname  => $property->conditionvalue]);
                        $this->updateUsersUpdatedAtByUserIds($userIdIfDealTriggerNotExist);
                    } else {
                        $query = VehicleRequest::whereIn('id',$DataIds);
                        $getDealQuery = $query;
                        $userIds = $getDealQuery->pluck("user_id")->toArray();
                        $query->update([$property->fieldname  => $property->conditionvalue]);
                        $this->updateUsersUpdatedAtByUserIds($userIds);
                    }
                }
            }
            return $query;
        }


        public function dealStageData($filters){

            $result = [];
            $page  = isset( $filters[ 'page' ] ) ? $filters[ 'page' ] : 1;
            $per_page = isset( $filters[ 'per_page' ] ) ? $filters[ 'per_page' ] : 10;
            $order_by = isset( $filters[ 'order_by' ] ) ? $filters[ 'order_by' ]: null;
            $order_dir = isset( $filters[ 'order_dir' ] ) ? $filters[ 'order_dir' ]: 'desc';
            $offset = ( $page - 1 ) * $per_page;
            $search_value = isset($filters['search']) ? $filters['search']: '';
            $db_name = config('services.database.first');

            $query = PortalDealStage::select('*');

            if($search_value) {

                $search_value_arr = explode(' ', $search_value);
                foreach ($search_value_arr as $value) {
                    $query->whereRaw("concat(label) like '%{$value}%'");
                }
            }

            $num_results_filtered = $query->count();

            if ( $order_by ) {
                $query = $query->orderBy( $order_by, $order_dir );
            } else {
                $query = $query->orderBy( 'created_at', 'desc' );
            }

            $query = $query->offset( $offset )->limit( $per_page );

            $portal_users = $query->get();
            $count = $offset;
            $result = new LengthAwarePaginator( $portal_users, $num_results_filtered, $per_page, $page );
            $result->setPath( route( 'workflow.getDealStageData' ) );
            return $result;
        }

        public function updateWorkflowSchedule($data){
            $portal_user = Auth::user();
            $db_name = config('services.database.first');
            $query = HubspotWorkFlows::select( "{$db_name}.hubspot_workflow.*", "{$db_name}.hubspot_trigger_type.trigger_type as type","{$db_name}.portal_users.first_name","{$db_name}.portal_users.last_name" );
            $query->join( "{$db_name}.hubspot_trigger_type", "{$db_name}.hubspot_trigger_type.id", '=', "{$db_name}.hubspot_workflow.type" );
            $query->join( "{$db_name}.portal_users", "{$db_name}.portal_users.id", '=', "{$db_name}.hubspot_workflow.added_by" );
            $workflow = $query->find($data['id']);
                $update = array(
                    'workflow_execute_time' => $data['workflow_execute_time'],
                    'schedule_time' => json_encode($data['schedule_time'])
                );
            $workflow->update($update);

            if ($workflow) {
                $msg = '<b>' . $workflow->wf_name . '</b> was <b>scheduled</b> by <b>' . $portal_user->full_name . '</b>';
                    Log::create(array(
                        'category' => Logs::Workflow,
                        'action' => PortalAction::UPDATED,
                        'target_id' => $workflow->id,
                        'target_type' => TargetTypes::Workflow,
                        'portal_user_id' => $portal_user->id,
                        'portal_user_name' => $portal_user->full_name,
                        'content' => $msg
                    ));
            }
                return $workflow;
        }


        public function enrollmentHistory( $filters, $workflowId ){
            $firstDataBaseName = config('services.database.first');
            $secondDataBaseName = config('services.database.second');
            $result = [];
            $page  = isset( $filters[ 'page' ] ) ? $filters[ 'page' ] : 1;
            $perPage = isset( $filters[ 'per_page' ] ) ? $filters[ 'per_page' ] : 10;
            $orderBy = isset( $filters[ 'order_by' ] ) ? $filters[ 'order_by' ]: null;
            $orderDir = isset( $filters[ 'order_dir' ] ) ? $filters[ 'order_dir' ]: 'desc';
            $groupBy = isset( $filters[ 'group_by' ] ) ? $filters[ 'group_by' ]: 0;
            $enrollmentType = isset( $filters[ 'type' ] ) ? $filters[ 'type' ]: 0;
            $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();
            // for contact enrollment
            $firstName = isset($filter['first_name']) ? $filter['first_name']: null;
            $lastName = isset($filter['last_name']) ? $filter['last_name']: null;
            $emailAddress = isset($filter['email_address']) ? $filter['email_address']: null;
            // for deal enrollment
            $brand = isset($filter['make']) ? $filter['make']: null;
            $model = isset($filter['model']) ? $filter['model']: null;
            $trim = isset($filter['trim']) ? $filter['trim']: null;

            $offset = ( $page - 1 ) * $perPage;
            $searchValue = isset($filters['search']) ? $filters['search']: '';

                $query = WorkflowHistory::select("{$firstDataBaseName}.workflow_event_history.*", "{$secondDataBaseName}.user.first_name", "{$secondDataBaseName}.user.last_name", "{$secondDataBaseName}.user.email_address");
                $query->join( "{$secondDataBaseName}.user", "{$secondDataBaseName}.user.id", '=', "{$firstDataBaseName}.workflow_event_history.user_id" );
                $query->where("{$firstDataBaseName}.workflow_event_history.workflow_id", $workflowId);

                    if($enrollmentType){
                        $query->join( "{$secondDataBaseName}.vehicle_requests", "{$secondDataBaseName}.vehicle_requests.id", '=', "{$firstDataBaseName}.workflow_event_history.deal_id" );
                    }

                    if($firstName){
                        $query->where("{$secondDataBaseName}.user.first_name", 'like','%'.$firstName.'%');
                    }

                    if($lastName){
                        $query->where("{$secondDataBaseName}.user.last_name", 'like','%'.$lastName.'%');
                    }

                    if($emailAddress){
                        $query->where("{$secondDataBaseName}.user.email_address", 'like','%'.$emailAddress.'%');
                    }

                    if($enrollmentType){
                        $query->join("{$secondDataBaseName}.vehicles", "vehicle_id", "=", "{$secondDataBaseName}.vehicles.id");
                        $query->join("{$secondDataBaseName}.brands", "{$secondDataBaseName}.vehicles.brand_id", "=", "{$secondDataBaseName}.brands.id");
                        $query->join("{$secondDataBaseName}.models", "{$secondDataBaseName}.vehicles.model_id", "=", "{$secondDataBaseName}.models.id");

                        if($trim){
                            $query->where("{$secondDataBaseName}.vehicles.trim", 'like','%'.$trim.'%');
                        }

                        if($brand){
                            $query->where("{$secondDataBaseName}.brands.name", 'like','%'.$brand.'%');
                        }

                        if($model){
                            $query->where("{$secondDataBaseName}.models.name", 'like','%'.$model.'%');
                        }
                    }

                    if($searchValue) {
                        $searchValueArray = explode(' ', $searchValue);
                        foreach ($searchValueArray as $value){
                            if($enrollmentType){
                                $query->whereRaw("concat({$secondDataBaseName}.models.name, ' ' , {$secondDataBaseName}.brands.name , ' ', {$secondDataBaseName}.vehicles.trim, ' ' ) like '%{$value}%'");
                            }else{
                                $query->whereRaw("concat({$secondDataBaseName}.user.first_name, ' ' , {$secondDataBaseName}.user.last_name , ' ', {$secondDataBaseName}.user.email_address , ' ' ) like '%{$value}%'");
                            }
                        }

                    }

                    if($enrollmentType){
                        $query->whereNotNull("{$firstDataBaseName}.workflow_event_history.deal_id");
                        if($groupBy){
                            $query->groupBy("{$secondDataBaseName}.models.name");
                        }
                    }else{
                        if($groupBy){
                            $query->groupBy("{$secondDataBaseName}.user.email_address");
                        }
                    }

                    $numberOfResultsFiltered = $query->count();

                    if ( $orderBy ) {
                        $query = $query->orderBy( $orderBy, $orderDir );
                    } else {
                        $query = $query->orderBy( 'created_at', 'desc' );
                    }

                $query = $query->offset( $offset )->limit( $perPage );

                $enrollmentHistory = $query->get();
                $count = $offset;
                $result = new LengthAwarePaginator( $enrollmentHistory, $numberOfResultsFiltered, $perPage, $page );
                $result->setPath( route( 'enrollment-history.showEnrollmentHistory', $workflowId ) );
                return $result;

        }

        public function getActionLastRecord($userIds,$workFlowId, $enrollment = null){
            $query =  WorkflowHistory::where( 'workflow_id', $workFlowId )->where( 'is_open', 0 )->where('enrollment', $enrollment)->whereIn('user_id',$userIds);
            return $query->get()->toArray();
        }

        public function getWorkHistoryById($workflowId){
            return WorkflowHistory::where( 'workflow_id', $workflowId )->get()->toArray();
        }


        public function verifyActionRunOrNot($workFlowId,$usersData, $actionUUID, $eventMasterId,$enrollment,$tableResult){
            $userIds =[];
            foreach ($usersData as $users) {
                if(in_array("1", $tableResult) && in_array("2", $tableResult)){
                    $actionHistory = WorkflowHistory::where('user_id', $users->user_id)->where('deal_id', $users->deal_id)->where('workflow_id', $workFlowId)->where('enrollment', $enrollment)
                    ->where('action_uuid', $actionUUID)->first();
                }else if(in_array("2", $tableResult)){
                    $actionHistory = WorkflowHistory::where('user_id', $users->user_id)->where('deal_id', $users->id)->where('workflow_id', $workFlowId)->where('enrollment', $enrollment)
                    ->where('action_uuid', $actionUUID)->first();
                }else if(in_array("5", $tableResult)){
                    $history = WorkflowHistory::where('user_id', $users->id);
                    if(isset($users->deal_id)){
                        $history->orWhere('deal_id', $users->deal_id);
                    }
                    $history->where('workflow_id', $workFlowId)->where('enrollment', $enrollment);
                    $actionHistory = $history->where('event_master_id', $eventMasterId)->first();
                }else{
                    $actionHistory = WorkflowHistory::select('*')->where('user_id', $users->id)->where('workflow_id', $workFlowId)->where('enrollment', $enrollment)
                    ->where('event_master_id', $eventMasterId)->where('action_uuid', $actionUUID)->first();
                }
                if($actionHistory){
                    $userId =  $actionHistory->user_id;
                    array_push($userIds, $userId);
                }
            }
            
            $userArray = array_filter($usersData, function ($user) use ($userIds, $tableResult) {
                if(in_array(2, $tableResult)) {
                    return !in_array($user->user_id, $userIds);
                } else {
                    return !in_array($user->id, $userIds);
                }
            });
            return $userArray;
        }

        public function workflowEnrollmentUser($workflowId){
            $getWorkflowResult = HubspotWorkFlows::select( "*" )->where('id', $workflowId )->first();
            if($getWorkflowResult){
                $getTriggerResult = $this->createTriggerQuery(json_decode($getWorkflowResult->triggers), $activateFor = 1,$getWorkflowResult->updated_at );
                return count( $getTriggerResult['result'] );
            }
            return 0;
        }


        public function storeWorkflowSetting($data){
            $query = new WorkflowSetting;
            $id = $data['id'] ?? 1;
            $result = $query->find($id);

            if (!$result) {
                $query->enrollment_number = $data['enrollment_number'];
                $query->portal_users = json_encode($data['portal_users']);
                $query->save();
                return $query;
            } else {
                $result->enrollment_number = $data['enrollment_number'];
                $result->portal_users = json_encode($data['portal_users']);
                $result->update();
                return $result;
            }
        }

        public function getWorkflowSetting(){
            $query = WorkflowSetting::select('*');
            return $query->first();
        }

        public function getPortalUserEmail($ids){
            return PortalUser::whereIn('id', $ids)->pluck('email')->toArray();
        }

        public function storeVerificationCode($workflowId,$otp){
            $query = new WorkflowVerification;
            $query->workflow_id = $workflowId;
            $query->verification_code = $otp;
            return $query->save();
        }

        public function verifyWorkflowOtp($workflowId){
            return WorkflowVerification::where('workflow_id', $workflowId)->latest()->first();

        }

        public function getlastActionEnrollmentDetails($workflowId,$actionIds,$workflowDetails){
            $query = WorkflowHistory::where('workflow_id', $workflowId)->whereIn('action_uuid',$actionIds)
                ->where('enrollment', $workflowDetails->enrollment_count);
                if($workflowDetails->is_activation == 2) {
                    $query->where("created_at",'>',date('Y-m-d H:i:s', strtotime("$workflowDetails->activation_updated_at")));
                }
                $query->select('workflow_id', 'event_master_id', 'action_uuid', 'is_open', 'sequence_id',
                    \DB::raw('GROUP_CONCAT(DISTINCT CASE WHEN action_uuid IS NOT NULL AND created_at >= (SELECT MAX(created_at) FROM workflow_event_history WHERE action_uuid IS NULL) THEN user_id END) as filtered_user_ids'),
                    \DB::raw('COUNT(*) as total_enrollment'),
                    \DB::raw('GROUP_CONCAT(DISTINCT user_id) as total_user_count'),
                    \DB::raw('SUM(CASE WHEN action_uuid IS NOT NULL AND created_at >= (SELECT MAX(created_at) FROM workflow_event_history WHERE action_uuid IS NULL) THEN 1 ELSE 0 END) as different_timestamp_count'),
                );
                $query->groupBy('workflow_id', 'event_master_id', 'action_uuid', 'is_open', 'sequence_id');
                $result = $query->get();
            return $result;

        }

        public function getWorkflowActionEnrollmentContacts( $filters, $workflowId, $userIds ){
            $result = [];
            $page  = isset( $filters[ 'page' ] ) ? $filters[ 'page' ] : 1;
            $perPage = isset( $filters[ 'per_page' ] ) ? $filters[ 'per_page' ] : 10;
            $orderBy = isset( $filters[ 'order_by' ] ) ? $filters[ 'order_by' ]: null;
            $orderDir = isset( $filters[ 'order_dir' ] ) ? $filters[ 'order_dir' ]: 'desc';

            $offset = ( $page - 1 ) * $perPage;
            $searchValue = isset($filters['search']) ? $filters['search']: '';

            $query = User::select("id", "first_name", "last_name", "email_address", "contact_owner_email", "created_at", "updated_at");
            $query->whereIn('id', $userIds);

            $numberOfResultsFiltered = $query->count();

            if ( $orderBy ) {
                $query = $query->orderBy( $orderBy, $orderDir );
            } else {
                $query = $query->orderBy( 'created_at', 'desc' );
            }

            $query = $query->offset( $offset )->limit( $perPage );

            $enrolledContacts = $query->get();
            $count = $offset;
            $result = new LengthAwarePaginator( $enrolledContacts, $numberOfResultsFiltered, $perPage, $page );
            $result->setPath( route( 'workflow.getWorkflowActionEnrollmentContacts', $workflowId ) );
            return $result;
        }

        public function filterEnrolledUsers(Collection $enrolledObjects)
        {
            $enrolledObjectsResult = collect();
            // Sort the collection by sequence_id in descending order
            $sortedEnrolledObjects = $enrolledObjects->sortBy('sequence_id')->values();
            // Iterate through the sorted collection
            $sortedEnrolledObjects->each(function ($item, $index) use ($sortedEnrolledObjects, &$enrolledObjectsResult) {
                if (isset($item['total_user_count']) && $item['total_user_count'] !== null) {
                    if (is_array($item['total_user_count'])) {
                        $item['total_user_count'] = implode(',', $item['total_user_count']);
                    }
                    $userCounts = explode(',', $item['total_user_count']);
                } else {
                    $userCounts = [];
                }

                // Check if the user count exists in any previous element with a larger sequence_id
                $previousItems = $sortedEnrolledObjects->slice($index + 1);
                $previousItems->each(function ($previousItem) use (&$userCounts) {
                    if (isset($previousItem['total_user_count']) && $previousItem['total_user_count'] !== null) {
                        if (is_array($previousItem['total_user_count'])) {
                            $previousItem['total_user_count'] = implode(',', $previousItem['total_user_count']);
                        }
                        $previousUserCounts = explode(',', $previousItem['total_user_count']);
                    } else {
                        $previousUserCounts = [];
                    }
                    $userCounts = array_diff($userCounts, $previousUserCounts);
                });

                if (!empty($userCounts)) {
                    // Assign the unique values to the original array
                    $item['total_user_count'] = $userCounts;
                    $enrolledObjectsResult->push($item);
                }
            });

            return $enrolledObjectsResult;
        }

        public function getEngagedWorkflowsForContact( $filters, $userId ){
            $result = [];
            $page  = isset( $filters[ 'page' ] ) ? $filters[ 'page' ] : 1;
            $perPage = isset( $filters['per_page'] ) ? $filters['per_page'] : 10;
            $offset = ( $page - 1 ) * $perPage;

            $query = HubspotWorkFlows::select( 'id','wf_name as name' )->where( 'is_active', 0 );
            $query->whereExists(function ($query) use ($userId){
                $query->select(DB::raw(1));
                $query->from('workflow_event_history');
                $query->whereRaw("workflow_event_history.workflow_id = hubspot_workflow.id");
                $query->whereRaw("workflow_event_history.enrollment = hubspot_workflow.enrollment_count");
                $query->whereRaw("workflow_event_history.user_id = {$userId}");
            });
            $numberResultsFiltered = $query->count();
            $query = $query->offset($offset)->limit($perPage);
            $workflow = $query->get();

            $result = new LengthAwarePaginator( $workflow, $numberResultsFiltered, $perPage, $page );
            $result->setPath( route( 'workflow.getEngagedWorkflowsForContact', $userId) );
            return $result;
        }

        public function updateWebhookActionHistory($request, $webhookStatus) {
            $dataBaseName = config('services.database.first');
            $workflow = HubspotWorkFlows::select("{$dataBaseName}.hubspot_workflow.wf_name")
                ->where("{$dataBaseName}.hubspot_workflow.id", $request['workflow_id'])->get();
            $webhookActionResult = WorkflowHistory::where($request)->first();

            if($webhookActionResult){
                $workflowName = null;
                $logData = [
                    "userid" => $request['user_id'],
                    "type" => 'Action',
                    "actionId" => '110',
                ];
                if((!empty($workflow) || !$workflow->isEmpty()) && count($workflow) > 0) {
                    $logData['workflow_name'] = $workflow[0]['wf_name'];
                    if($webhookStatus){
                        $logData['webhook_status'] = EnrollmentStatus::SUCCESS;
                        $webhookActionResult->is_open = EnrollmentStatus::SUCCESS;
                    }else{
                        $logData['webhook_status'] = EnrollmentStatus::FAILED;
                        $webhookActionResult->is_open = EnrollmentStatus::FAILED;
                    }
                }
                $webhookActionResult->save();
                Log::create([
                    'category' => Logs::Workflow,
                    'action' => PortalAction::UPDATED,
                    'target_id' => $request['workflow_id'],
                    'target_type' => TargetTypes::Workflow,
                    'content' =>  json_encode($logData),
                ]);
                return true;
            }
        }

        private function updateUsersUpdatedAtByUserIds($userIds) {
            User::whereIn('id', $userIds)->update(['updated_at'=> Carbon::now()]);
            return true;
        }
    }





