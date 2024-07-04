<?php

namespace App\Traits;
use Auth;
use App\Traits\{LogTrait,PortalDealStageTrait};
use App\Model\{Log, PortalUser, VModel, VehicleTrim, VehicleRequest, WholeSaleQuote, PortalDealStage, User, DealStage};
use Carbon\Carbon;
use App\Enums\{Roles, Logs, PortalAction, TargetTypes};

trait PortalTraits
{
    use LogTrait;
    use PortalDealStageTrait;

    // generate random otp for two factor authentication
    protected function generateRandomNumber(){
        return mt_rand(100000,999999);
    }

    protected function createUpdateLogs($new_data, $old_data,$logsFor,$logArray) {
        $portal_user = Auth::user();
        // remove or unset the value form array
        $old_data = $this->removeUnwantedKeyFromArray($old_data);
        $new_data = $this->removeUnwantedKeyFromArray($new_data);

        $old_data_arr = array(); $new_data_arr = array();
        if($logsFor == 'Users'){
            $current_role_id = $new_data->roles ? $new_data->roles[0]->id : null;
            $old_data_arr['role_id'] = $current_role_id;

            if (isset($old_data['role_id'])) {
                $role_id = $old_data['role_id'];
                $new_data->syncRoles([$role_id]);
    
                if ($role_id != 5 && $role_id != 6 && $role_id != 4) {
                    $new_data->contactOwner()->delete();
                }
            }
        }

        if(!empty($old_data)){
            foreach ($old_data as $key => $value){
                if($logsFor == 'Users'){
                    $new_data_arr[$key] = $old_data[$key];
                    $old_data_arr[$key] = $new_data->$key;
                }else{
                    $newDataValue = null; $oldDataValue = null; 
                    if(strtotime($new_data->$key) != false && $key != 'sex' && $key != 'portal_deal_stage') {
                            $newDataValue = date('d/m/Y', strtotime($new_data->$key));
                            $oldDataValue = date('d/m/Y', strtotime($old_data[$key])); 
                    } else {
                        $newDataValue = $new_data->$key;
                        $oldDataValue = $old_data[$key];
                    }
                    $new_data_arr[$key] = $oldDataValue;
                    $old_data_arr[$key] = $newDataValue; 
                }
            }
        }

        if($logsFor === 'Contacts') {
            if (isset($new_data_arr['opted_out_email_important_update'])) {
                $new_data_arr['opted_out_email_important_update'] = $new_data_arr['opted_out_email_important_update'] ? 1 : 0;
            }
            if (isset($new_data_arr['opted_out_email_marketing_information'])) {
                $new_data_arr['opted_out_email_marketing_information'] = $new_data_arr['opted_out_email_marketing_information'] ? 1 : 0;
            }
            if (isset($new_data_arr['opted_out_email_one_to_one'])) {
                $new_data_arr['opted_out_email_one_to_one'] = $new_data_arr['opted_out_email_one_to_one'] ? 1 : 0;
            }
        }
        $new_data = collect($new_data_arr);
        $old_data = collect($old_data_arr);
        $diff = collect(array_diff_assoc($new_data_arr, $old_data_arr));
        // get the title base on logs type
        $logsTypeArray = $this->checkLogsType($logsFor);
        $msg = '';
        if(!empty($logsTypeArray)){
            foreach ($logsTypeArray as $key => $value){
                $msg .= ucfirst($new_data[$value]).' ';
            }
        }
        //  check count in of diff
        if(!empty($diff->toArray())){
            foreach ($diff as $key => $value){
                if(isset($diff->toArray()[$key])){
                    $old_value =''; $new_value ='';
                    if(!empty($old_data[$key])){
                        if(strtotime($old_data[$key]) != false && $key != 'sex') {
                            $old_value = 'from '.date('d/m/Y', strtotime($old_data[$key]));
                            
                        } else {
                            $old_value = 'from '.$old_data[$key];
                        }
                    }else{
                        $old_value = $old_data[$key];
                    }

                    if(!empty($new_data[$key])){
                        if(strtotime($new_data[$key]) != false && $key != 'sex' && $key != 'portal_deal_stage') {
                            $new_value = date('d/m/Y', strtotime($new_data[$key]));
                        } else {
                            $new_value = $new_data[$key];
                        }
                    }else{
                        $new_value = $new_data[$key];
                    }

                    if($logsFor == 'Users' && $key == 'role_id'){
                        $role = $this->formatRoleIds($new_data[$key]);
                        $old_role = $this->formatRoleIds($old_data[$key]);
                        $msg .= " {$this->removeSpecialChar($key)} was updated {$old_role} to <b>{$role}</b>, ";
                    }else if($logsFor == 'Users' && $key == 'two_factor_slider'){
                        $msg .= " {$this->removeSpecialChar($key)} was updated to <b>{$this->checkTwoFactor($new_data[$key])}</b>, ";
                    }else if($logsFor == 'Users' && $key == 'two_factor_option'){
                        $msg .= " {$this->removeSpecialChar($key)} was updated to <b>{$this->checkTwoFactorOption($new_data[$key])}</b>, ";
                    }else if($logsFor == 'PortalDealStage' && $key == 'pipeline'){
                        $oldPipelineName = $this->checkPipelineValue($old_data[$key]);
                        $newPipelineName = $this->checkPipelineValue($new_data[$key]);
                        $msg .= "{$this->removeSpecialChar($key)} was updated <b>{$oldPipelineName}</b> to <b>{$newPipelineName}</b>, ";
                    }else if($logsFor == 'PortalTasks' && $key == 'task_owner'){
                        $res = $this->getPortalUsers($new_data[$key],$old_data[$key]);
                        $newTaskOwner = $this->array_flatten($res->where('id', $new_data[$key])->toarray());
                        $oldTaskOwner = $this->array_flatten($res->where('id', $old_data[$key])->toarray());
                        $msg .= "{$this->removeSpecialChar($key)} was updated <b>".$oldTaskOwner[1]." ".$oldTaskOwner[2]."</b> to <b>".$newTaskOwner[1]." ".$newTaskOwner[2]."</b>,";
                    }else if($logsFor == 'PortalTasks' && $key == 'task_status'){
                        if($old_data['task_status'] == 1) {
                            $msg .= "<b>{$this->removeSpecialChar($key)}</b> task was marked as incomplete, ";
                        } else {
                            $msg .= "<b>{$this->removeSpecialChar($key)}</b> task was marked as completed by, ";
                        }
                    }else if($logsFor == 'Contacts'){
                        if($key == 'type') {
                            $msg .= "<b>{$this->removeSpecialChar($key)}</b> was updated {$this->checkContactType($old_value)} to <b>{$this->checkContactType($new_value)}</b>, ";
                        }else if($key == 'over18'){
                            $msg .= "<b>{$this->removeSpecialChar($key)}</b> was updated {$this->checkOver18($old_value)} to <b>{$this->checkOver18($new_value)}</b>, ";
                        }else if($key == 'concierge_state'){
                            $msg .= "<b>{$this->removeSpecialChar($key)}</b> was updated {$this->checkState($old_value)} to <b>{$this->checkState($new_value)}</b>, ";
                        }else if($key == 'sex'){
                            $msg .= "<b>{$this->removeSpecialChar($key)}</b> was updated {$this->checkGender($old_value)} to <b>{$this->checkGender($new_value)}</b>, ";
                        }else if($key == 'opted_out_email_important_update'){
                            $msg .= "<b>{$this->removeSpecialChar($key)}</b> was updated to <b>{$this->checkValueType($new_value)}</b>, ";
                        }else if($key == 'opted_out_email_marketing_information'){
                            $msg .= "<b>{$this->removeSpecialChar($key)}</b> was updated to <b>{$this->checkValueType($new_value)}</b>, ";
                        }else if($key == 'opted_out_email_one_to_one'){
                            $msg .= "<b>{$this->removeSpecialChar($key)}</b> was updated to <b>{$this->checkValueType($new_value)}</b>, ";
                        }else{
                            $msg .= "<b>{$this->removeSpecialChar($key)}</b> was updated {$old_value} to <b>{$new_value}</b>, ";
                        }
                    }else if($logsFor == 'Deals'){
                        if($key == 'portal_deal_stage') {
                            $old_value = str_replace("from ", "", $old_value);
                            $msg .= "<b>{$this->removeSpecialChar($key)}</b> was updated {$this->getDealStageDetails($old_value)} to <b>{$this->getDealStageDetails($new_value)}</b>, ";
                        }else{
                            $msg .= "<b>{$this->removeSpecialChar($key)}</b> was updated {$old_value} to <b>{$new_value}</b>, ";
                        }
                    }
                    else{
                        $info = $new_data[$key];
                        if(strtotime($new_data[$key]) != false) {
                            $info = date('d/m/Y', strtotime($new_data[$key]));
                        }
                        $msg .= " {$this->removeSpecialChar($key)} was updated {$old_value} to <b>{$info}</b>, ";
                    }
                }
            }
            if(!empty($msg) ){
                $msg = substr(trim($msg), 0, -1);
                $msg .= " by <b>{$portal_user->full_name}</b>";
                $logArray['content'] = ucfirst($msg);
                Log::create($logArray);
            }
        }
        return true;
    }

    protected function array_flatten($array) { 
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

    protected function getPortalUsers($newId,$oldId){
        return PortalUser::select('id','first_name','last_name')->whereIn('id',[$newId,$oldId])->get();
    }

    protected function checkLogsType($logsType){
        switch ($logsType) {
            case 'Contacts':
                $str = array('first_name','last_name');
                break;
            case 'Deals':
                $str = array();
                break;
            case 'PortalTasks':
                $str = array();
                break;
            case 'Users':
                $str = array('first_name','last_name');
                break;
            case 'PortalDealStage':
                $str = array('label');
                break;
            default:
                $str = '';
                break;
        }
        return $str;
    }

    function removeSpecialChar($string) {

        if (str_contains($string, '_')) { 
            return str_replace('_', ' ', $string);
        }else{
            return $string;
        }
     }
    
    protected function removeUnwantedKeyFromArray($data){
        $array = array('phone','device_type','role_id','is_reset_password_required','location_id','password',
        'sex','is_verify','locations');
        // Remove all values from the array
        foreach ($array as $key => $value) {
            unset($data[$value]);
        }
        return $data;
    }

    protected function checkState($state){
        switch ($state) {
            case 'CA':
                $value = 'California';
                break;
            case 'AZ':
                $value = 'Arizona';
                break;
            default:
                $value = '';
                break;
        }
        return $value;
    }

    protected function checkContactType($type){
        switch ($type) {
            case '0':
                $value = 'NUll';
                break;
            case '1':
                $value = 'Concierge';
                break;
            default:
                $value = '';
                break;
        }
        return $value;
    }

    protected function checkOver18($data){
        switch ($data) {
            case '0':
                $value = 'NUll';
                break;
            case '1':
                $value = 'Yes';
                break;
            case '2':
                $value = 'No';
                break;
            default:
                $value = '';
                break;
        }
        return $value;
    }

    protected function checkGender($gender){
        switch ($gender) {
            case 'M':
                $value = 'Male';
                break;
            case 'F':
                $value = 'Female';
                break;
            default:
                $value = '';
                break;
        }
        return $value;
    }

    protected function getNewAddition($year){
        $is_new = 0;
        $currentDate = Carbon::now()->toDateString();
        $modelCount =  VModel::where('year', $year)->whereDate('created_at', $currentDate)->count();
        $vehicleDataCount = VehicleTrim::where('year', $year)->whereDate('created_at', $currentDate)->count();
        $totalCount = (int)$vehicleDataCount + (int)$modelCount;
        if($totalCount > 0){
         $is_new = 1;
        }
        return $is_new;
    }

    protected function checkStatus($status){
        switch ($status) {
            case 0:
                $value = 'in-active';
                break;
            case 1:
                $value = 'active';
                break;
            default:
                $value = '';
                break;
        }
        return $value;
    }

    protected function checkTwoFactor($data){
        switch ($data) {
            case 0:
                $value = 'off';
                break;
            case 1:
                $value = 'on';
                break;
            default:
                $value = '';
                break;
        }
        return $value;
    }

    protected function checkTwoFactorOption($data){
        switch ($data) {
            case 0:
                $value = 'phone';
                break;
            case 1:
                $value = 'google';
                break;
            default:
                $value = '';
                break;
        }
        return $value;
    }

    protected function vehicleDetails($deaId){
        $request = VehicleRequest::with(['vehicle.brand', 'vehicle.model'])->find($deaId);
        return $request->vehicle;
    }

    protected function portalUserToggleLogs($portalUserDetail, $updateData){
        list($oldValue, $newValue) = $updateData['is_active'] ? ['In-active', 'Active'] : ['Active', 'In-active'];
        $poratlUser = Auth::user();
        $msg = "{$portalUserDetail->full_name} status was updated from {$oldValue} to <b>{$newValue}</b> by {$poratlUser->full_name} ";
        Log::create(array(
            'category' => Logs::Portal,
            'action' => PortalAction::UPDATED,
            'target_id' => $portalUserDetail->id,
            'target_type' => TargetTypes::Portal,
            'portal_user_id' => $poratlUser->id,
            'portal_user_name' => $poratlUser->full_name,
            'content'       => $msg
        ));
        return true;
    }
    
    protected function getStockNumber($id){
        $query = WholeSaleQuote::select('wholesale_stock_no')->where('id', $id)->get();
        return $query->isNotEmpty() ? $query[0]->wholesale_stock_no : null;
    }

    protected function getDealStageDetails($stageId){   
        if(!empty($stageId)){
            $result = PortalDealStage::where('stage_id', $stageId)->first();
            if ($result){
                $getDealStageLabel = $result->label;
            } else {
                $getDealStageLabel = "";
            }
        }else{
            $getDealStageLabel = "";
        }
        return $getDealStageLabel;
    }

    protected function checkContactExist($userId){
        $getUserDetails = User::find($userId);
        return $getUserDetails ? $userId : null;
    }

    protected function checkDealExist($dealId){
        $getUserDetails = VehicleRequest::find($dealId);
        return $getUserDetails ? $dealId : null;
    }

    protected function checkValueType($value){
        switch ($value) {
            case '0':
                $value = 'false';
                break;
            case '1':
                $value = 'true';
                break;
            default:
                $value = '';
                break;
        }
        return $value;
    }

    protected function checkOver18ForConciergeQuestionnaireForm($data){
        switch ($data) {
            case 'Yes':
                $value = '1';
                break;
            case 'No':
                $value = '2';
                break;
            default:
                $value = '0';
                break;
        }
        return $value;
    }

    protected function formatPhoneNumber($phoneNumber){
        // Remove all non-numeric characters from the phone number
        $phoneNumber = preg_replace('/\D/', '', $phoneNumber);
        // Check if the phone number starts with '1' (indicating the US country code)
        // or if it's 10 digits long, which is a typical US phone number format
        if (substr($phoneNumber, 0, 1) !== '1' && strlen($phoneNumber) === 10) {
            // If it doesn't start with '1' and it's 10 digits long,
            // assume it's a US number and prepend the country code +1
            $phoneNumber = '+1' . $phoneNumber;
        } else if (substr($phoneNumber, 0, 1) == '1') {
            $phoneNumber = '+1' . substr($phoneNumber, 1);
        }
        // Return the formatted phone number
        return $phoneNumber;
    }

    protected function getDealStage($stageId,$status)
    {   $dealStageName;
        if(!empty($stageId)){
            $result = DealStage::where('stage_id', $stageId)->first(); 
            $dealStageName = $result->label;
        }
        return $dealStageName;
    }
}