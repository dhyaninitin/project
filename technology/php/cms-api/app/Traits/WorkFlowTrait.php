<?php

namespace App\Traits;
use Twilio\Rest\Client;
use App\Model\{PortalUser, Log, HubspotWorkFlows};
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Carbon\Carbon;
use \Mailjet\Resources;
use Exception;
use App\Enums\{Roles,SendSmsAction, Logs, UserAction, TargetTypes,PortalAction};
use Illuminate\Support\Facades\DB;

trait WorkFlowTrait
{
    use SendsPasswordResetEmails;

    protected function formatCondition($condition)
    {
        switch ($condition) {
            case 1:
                $conditionName = 'Equals';
                $conditionValue = '=';
                break;
            case 2:
                $conditionName = 'Does not equal';
                $conditionValue = '!=';
                break;
            case 3:
                $conditionName = 'known';
                $conditionValue = 'IS NULL';
                break;
            case 4:
                $conditionName = 'unknown';
                $conditionValue = 'NOT NULL';
                break;
            default:
                $conditionName = 'NONE';
                $conditionValue = 'NONE';
                break;
        }
        return array('condition_name'=>$conditionName,'condition_val'=>$conditionValue);
    }

    protected function typeformate($type){
        $second_db_name = config('services.database.second');
        $db_name = config('services.database.first');
        switch ($type) {
            case '1':
                $databaseName = $second_db_name;
                $tableName =  "user";
                break;

            case '2':
                $databaseName = $second_db_name;
                $tableName =  "vehicle_requests";
                break;

            case '3':
                $databaseName = $db_name;
                $tableName =  "portal_users";
                break;

            default:
                $typeValue = NULL;
                break;
        }
        return array(
            "db_name" => $databaseName,
            "table_name" => $tableName
        );
    }

    protected function getTableFieldType($field_type,$fieldName){
        $autoComplete = array('street_address','city','state','zip');
        $selectOption = array('phone_preferred_time','source','credit_score','source_utm','deal_stage','type', 'concierge_state', 'portal_deal_stage');
        $type = explode('(',$field_type);
        if(in_array($fieldName,$autoComplete)){
            $field_type = 'autoComplete';
        }else if(in_array($fieldName,$selectOption)){
            $field_type = 'selectOption';
        }else{
            $field_type = $this->checkTableColumnType($type[0]);
        }
        return $field_type;
    }

    protected function checkTableColumnType($columnType){
        switch ($columnType) {
            case 'int':
                $value = 'number';
                break;
            case 'varchar':
                $value = 'text';
                break;
            case 'date':
                $value = 'date';
                break;
            case 'text':
                $value = 'text';
                break;
            case 'tinyint':
                $value = 'number';
                break;
            case 'timestamp':
                $value = 'date';
                break;
            case 'char':
                $value = 'text';
                break;
            default:
                $value = 'text';
                break;

        }
        return $value;
    }

    protected function mailJetCollection($response){
        $collection = array(); $temp = 0;
        foreach ($response as  $template) {
            $collection[$temp]['id'] =  $template['ID'];
            $collection[$temp]['name'] =  $template['Name'];
            $collection[$temp]['senderName'] =  '';
            $collection[$temp]['senderEmail'] =  '';
            $collection[$temp]['is_active'] = true;
            $temp++;
        }
        return $collection;
    }

    protected function emailAction($templateDetails, $userDetails, $workflowType, $triggerData, $workflowDetails = null, $actionId = null){
        $result=[];
        $mailjet = new \Mailjet\Client(config('services.mailjet.key'), config('services.mailjet.secret'), true, ['version' => 'v3.1']);
        foreach ($userDetails as $users) {

            if ($workflowType == 'Users') {
                $toEmail = $users->email;
            } else if ($workflowType == 'Contacts'){
                $toEmail = $users->email_address;
            } else {
                $toEmail = $users->email_address;
            }

            $body = [
                'Messages' => [
                    [
                        'To' => [
                            [
                                'Email' =>  $toEmail,
                                'Name' => $users->first_name . ' ' . $users->last_name
                            ]
                        ],
                        'TemplateID' => $templateDetails->id,
                        'TemplateLanguage' => true,
                        'Variables' => [
                            'FNAME' => $users->first_name,
                            'LNAME' => $users->last_name,
                            'SUBJECT' => $templateDetails->value,
                        ]
                    ]
                ]
            ];

            try{
                if(config('app.env') != 'testing') {
                    $response = $mailjet->post(Resources::$Email, ['body' => $body]);

                    if(!$response->success()){
                        if(isset($response->getData()['ErrorMessage'])){
                            $message = $response->getData()['ErrorMessage'];
                        } else {
                            $message = 'Failed sending workflow action email';

                        }
                        if (app()->bound('sentry')) {
                            app('sentry')->captureException(new Exception($message, 500));
                        }

                        // $failedArray = [
                        //     "userid" => $users->id,
                        //     "type" => 'Action',
                        //     "actionId" =>  $actionId,
                        //     "workflow_name" => $workflowDetails->wf_name,
                        //     "failed" => true,
                        // ];
                        // $this->actionFailedLogs($failedArray, $workflowDetails->id);
                    }
                }

                array_push($result, $users);
            } catch ( \Exception $e ) {
                info($e);
                if (app()->bound('sentry')) {
                    app('sentry')->captureException($e);
                }
            }

        }
        return $result;
    }

    protected function checkPersonalEmailKeyInArray($triggerData,$value){
        $propertyArray = array();
        foreach ( $triggerData as $trigger ) {
            if($trigger->property->value == $value){
                array_push($propertyArray,'0');
            }
        }
        return $propertyArray;
    }

    protected function scheduleNextWorkflowTrigger($schedule) {
        $res = array();

        $seconds = $schedule['seconds'];
        $min = $schedule['minutes'];
        $hour = $schedule['hours'];
        $day = $schedule['days'];
        $month = $schedule['month'];
        $year = $schedule['year'];
        $result = [];
        foreach ($schedule['user_data'] as $userdetails) {
            $dateString = "$year-$month-$day $hour:$min:$seconds";
            $scheduleTime = Carbon::now()->addDays($day)->addHours($hour)->addMinutes($min)->addSeconds($seconds);

            try {
                if(config('app.env') != 'testing') {
                    $client = new \GuzzleHttp\Client();
                    $url = 'https://inn.gs/e/' . getenv('INNGEST_EVENT_KEY');
                    $data = [
                        [
                            'name' => 'schedule.wokflow',
                            'data' => [
                                'scheduleTime' => $scheduleTime,
                                'workflowId'=> $schedule['workflow_id'],
                                'sequenceId'=> $schedule['seq_id'],
                                'actionUUID'=> $schedule['action_uuid'],
                                'userId'=> $userdetails->id,
                                'enrollment' => $schedule['enrollment'],
                            ],
                            'ts' => time() * 1000,
                        ],
                    ];

                    $headers = [
                        'Content-Type' => 'application/json',
                    ];

                    $client->post($url, [
                        'json' => $data,
                        'headers' => $headers,
                    ]);
                }

                // $result = "Next trigger scheduled at: " . $scheduleTime;
                array_push($result, $userdetails);
            } catch (\Exception $e) {
                info($e);
                $result = $e->getMessage();
                $errorarray = [
                    'type' => '505',
                    'info' => 'Ingest Event Trigger',
                    'message' => $e->getMessage(),
                    'line'=> $e->getLine()
                ];

                app('App\Http\Controllers\LogController')->workFlowErrorLogs($errorarray);
            }
            array_push($res, $result);
        }

        return $result;
    }


    protected function getIds($userdata,$tableResult){
        if(in_array("1",$tableResult) && in_array("2",$tableResult)){
            $getIds = array_map(function ($user) {return $user->id;}, $userdata);
            $getuser_ids = array_map(function ($user) {return $user->user_id;}, $userdata);
            return array_merge($getIds,$getuser_ids);
        }else if(in_array("1",$tableResult)){
            return array_map(function ($user) {return $user->id;}, $userdata);
        }else if(in_array("2",$tableResult)){
            $getIds = array_map(function ($user) {return $user->id;}, $userdata);
            $getuser_ids = array_map(function ($user) {return $user->user_id;}, $userdata);
            return array_merge($getIds,$getuser_ids);
        }else{
            return array_map(function ($user) {return $user->id;}, $userdata);
        }
    }

    protected function getPropertyUpdateIds($triggerResult, $tableResult, $queryTableResult)
    {
        if(in_array("2",$tableResult))
        {
            $ids = [];
            foreach ($triggerResult as $result)
            {
                if(isset($result->deal_id) && $result->deal_id != null) {
                    if(in_array("2",$queryTableResult) && !in_array("1",$queryTableResult)) {
                        $ids[] = $result->id;
                    } else {
                        $ids[] = $result->deal_id;
                    }
                }
                // $ids[] = $result->id;
            }
            return $ids;
        } else {
            return array_map(function ($result) {
                return $result->id;
            }, $triggerResult);
        }
    }


    protected function sendSmsAction($triggerData, $message, $sentFrom, $workflowDetails = null, $actionId = null ){
        $result=[];
        $fromPhoneNumber = "";
        foreach ($triggerData as $values) {
            if(isset($values->phone)){
                if($sentFrom == SendSmsAction::Contact_Owner){
                     $query = PortalUser::where('email',$values->contact_owner_email);
                     $getContactOwnerDetails = $query->get();
                     if($getContactOwnerDetails[0]->hasRole(Roles::Concierge)){
                        $query = $query->select('phone_numbers.phone');
                        $phoneNumber = $query->join( "phone_numbers", "phone_numbers.portal_user_id", '=', "portal_users.id" )->get()->toArray();
                        if(!empty($phoneNumber)){
                            $fromPhoneNumber = $phoneNumber[0]['phone'];
                        } else {
                            $errorMessage = "Error while sending SMS action: No phone number assigned to concierge {$values->contact_owner_email}";
                            throw new Exception($errorMessage, 500);
                        }
                        if ($fromPhoneNumber[0] !== '+') {
                            $fromPhoneNumber = '+' . $fromPhoneNumber;
                        }
                     }else{
                        $fromPhoneNumber = config('services.twilio.twilio_number');
                     }
                }else if($sentFrom == SendSmsAction::Carblip){
                    $fromPhoneNumber = config('services.twilio.twilio_number');
                }
                if(!empty($fromPhoneNumber)){
                    $getMessage = '';
                    for ($i=0; $i < sizeof($message); $i++) {
                            $matches= array();
                            preg_match_all("/\\{(.*?)\\}/", $message[$i], $matches);
                            $getMessage .= $this->checkArrayKey($values,$matches[0],$message[$i]);
                    }
                        try{
                            if(config('app.env') != 'testing') {
                                $client = new Client(getenv('TWILIO_ACCOUNT_SID'), getenv('TWILIO_AUTH_TOKEN'));
                                $sendMessage = $client->messages->create(
                                    $values->phone,
                                    array(
                                        'from' => $fromPhoneNumber,
                                        'body' => $getMessage,
                                        'messagingServiceSid' => config('services.twilio.messaging_service_id')
                                    )
                                );
                            }
                        } catch (Exception $e){
                            info($e);
                            // $failedArray = [
                            //     "userid" => $values->id,
                            //     "type" => 'Action',
                            //     "actionId" =>  $actionId,
                            //     "workflow_name" => $workflowDetails->wf_name,
                            //     "failed" => true,
                            // ];
                            // $this->actionFailedLogs($failedArray, $workflowDetails->id);
                            $errorArray = array( 'type'=>'505','info'=>'Sms Send','message'=>$e->getMessage(),'line'=>$e->getLine() );
                            return app( 'App\Http\Controllers\LogController' )->workFlowErrorLogs( $errorArray );
                        }
                    array_push($result, $values);
                }
            }
        }
        return $result;
    }

    protected function checkSentSmsFrom($value){
        switch ($value) {
            case '1001':
                $result = 'Carblip';
                break;
            case '1002':
                $result = 'Contact owner';
                break;
            case '1003':
                $result = 'Concierge';
                break;
            default:
                $result = NUll;
                break;
        }
        return $result;
    }

    protected function checkArrayKey($data,$messagekeys,$message){
        foreach ($messagekeys as $msgkey) {
            $removeSpecialCharacter = str_replace('{','',$msgkey);
            $removeSpecialCharacter =  str_replace('}','',$removeSpecialCharacter);
            if(property_exists($data,$removeSpecialCharacter)){
                $message = str_replace($msgkey,$data->$removeSpecialCharacter,$message);
            }
        }
        return $message;
    }

    protected function convertDate($date,$addValue,$convertInto){
        switch ($convertInto) {
            case 'days':
                $value = date('d', strtotime($date. ' + '.$addValue.' days'));
                break;
            case 'hours':
                $value = date('H', strtotime($date. ' + '.$addValue.' hours'));
                break;

            case 'minutes':
                $value = date('i', strtotime($date. ' + '.$addValue.' minutes'));
                break;

            case 'seconds':
                $value = date('s', strtotime($date. ' + '.$addValue.' seconds'));
                break;

            case 'year':
                $value = date('Y', strtotime($date));
                break;

            case 'month':
                $value = date('m', strtotime($date));
                break;

            default:
                $value = NULL;
                break;
        }

        return $value;
    }


    protected function propertyValueCollection($data,$field_name){
        $collection = array(); $temp = 0;
            foreach ($data as  $value) {
                $collection[$temp]['field_name'] =  $value->$field_name;
                $temp++;
            }
        return $collection;
    }

    protected function getTableDetails($value){
        switch ($value) {
            case 1:
                $value = array('table_name' => 'user', 'name' => 'Contacts');
                break;
            case '2':
                $value = array('table_name' => 'vehicle_requests', 'name' => 'Deals');
                break;

            case '3':
                $value = array('table_name' => 'portal_users', 'name' => 'Users');
                break;

            default:
                $value = NULL;
                break;
        }

        return $value;
    }

    protected function actionFailedLogs($content, $workflowId){
        Log::create(array(
            'category'      => Logs::Workflow,
            'action'        => PortalAction::CREATED,
            'target_id'     => $workflowId,
            'target_type'   => TargetTypes::Workflow,
            'content'       => json_encode($content),
        ));
        return true;
    }

    protected function createDealAssignTo($id){
        switch ($id) {
            case 1:
                $value = "Existing owner of the contact";
                break;
            case 2:
                $value = "Specific User";
                break;
            default:
                $value = NULL;
                break;
        }
        return $value;
    }

    protected function getPortalUserDetails($portalUserEmail){
        $user = PortalUser::where('email', $portalUserEmail)->get();
        $data = [];
        if($user->isNotEmpty()){
            $data['id'] = $user[0]->id;
            $data['name'] = $user[0]->full_name;
            if($user[0]->hasRole(Roles::Concierge)) {
                $data['concierge_user'] = true;
            } else{
                $data['concierge_user'] = false;
            }
        }
        return $data;
    }

    public function getActionTitle($actionData){
        $title = '';
        switch ($actionData->event_master_id) {
            case 101:
                $title = $actionData->property->value.' '.$actionData->condition->value.' '.$actionData->condition_value;
                break;
            case 102:
                $title = $actionData->days.' Days '.$actionData->hours.' Hours '.$actionData->minutes.' Minutes '.$actionData->seconds.' Seconds';
                break;
            case 104:
                $title = isset($actionData->email) ? $actionData->email->value : null;
                break;
            case 105:
                $title = $actionData->smspayload->value;
                break;
            case 106:
                $title = '';
                foreach ($actionData->property as $key => $value) {
                    $title .= $value->value.' to '.$value->condition_value;
                    if($key < (count($actionData->property)- 1)){
                        $title .= ' AND ';
                    }
                }
                break;
            case 107:
                $title = $actionData->email->value;
                break;
            case 109:
                $make = !empty($actionData->dealsPayload->make) ? $actionData->dealsPayload->make->value : null;
                $model = !empty($actionData->dealsPayload->model) ? $actionData->dealsPayload->model->value : null;
                $year = ($actionData->dealsPayload->year == -1) ? 'N/A' : $actionData->dealsPayload->year;
                $trim = !empty($actionData->dealsPayload->trim) ? $actionData->dealsPayload->trim->value : null;
                
                $title = $year.' '.$make.' '.$model.' '.$trim.' deal for ';
                $title .= $this->createDealAssignTo($actionData->dealsPayload->assignTo).' '.$actionData->dealsPayload->specificUser;
                break;
            case 110:
                $title = $actionData->webhook->webhook_url;
                break;
            default:
                $title = '';
                break;
        }
        return $title;
    }

    public function getTriggerTitle($triggerData){
        $result = '';
        foreach ($triggerData as $index => $group) {
            $groupString = '';
            foreach ($group as $key=> $condition) {
                $conditionString = "{$condition->property->title} {$condition->condition->value} {$condition->conditionvalue}";
                $groupString .= ($groupString && $key > 0 && !empty($condition->conditionvalue) ? ' AND ' : '') . $conditionString;
            }
            if (!empty($groupString)) {
                $result .= ($result ? ' OR ' : '') . "($groupString)";
            }
        }
        return $result;
    }

    public function getWorkflowType($workflowTrigger){
        $result = null;
        foreach ($workflowTrigger as $triggerValue) {
            foreach ($triggerValue as $item) {
                if ($item['type']['id'] == 1) {
                    $result = $item['type']['id'];
                    break 2; 
                }elseif ($result === null) {
                    $result = $item['type']['id'];
                }
            }
        }
        return $result;
    }

    protected function getDealIdsIfNotExistInTrigger($triggerResult)
    {
        $ids = [];
        foreach ($triggerResult as $result)
        {
            if(!isset($result->deal_id)) {
                $ids[] = $result->id;
            }
        }
        return $ids;
    }

    public function getContactsEngagementCount($userId){
        $query = HubspotWorkFlows::select( 'id','wf_name as name' )->where( 'is_active', 0 );
        $query->whereExists(function ($query) use ($userId){
            $query->select(DB::raw(1));
            $query->from('workflow_event_history');
            $query->whereRaw("workflow_event_history.workflow_id = hubspot_workflow.id");
            $query->whereRaw("workflow_event_history.enrollment = hubspot_workflow.enrollment_count");
            $query->whereRaw("workflow_event_history.user_id = {$userId}"); 
        });
        return $query->get();
    }

    protected function getObjectIds($userdata,$tableResult){
        if(in_array("1",$tableResult) && in_array("2",$tableResult)){
            $getuserIds = array_map(function ($user) {return $user->user_id;}, $userdata);
            return $getuserIds;
        }else if(in_array("1",$tableResult)){
            return array_map(function ($user) {return isset($user->user_id) ? $user->user_id : $user->id;}, $userdata);
        }else if(in_array("2",$tableResult)){
            $getuserIds = array_map(function ($user) {return $user->user_id;}, $userdata);
            return $getuserIds;
        }else{
            return array_map(function ($user) {return $user->id;}, $userdata);
        }
    }
}
