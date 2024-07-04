<?php

namespace App\Services;

use App\Model\{TwilioSms,TwilioCall};
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Auth;
use Illuminate\Database\Eloquent\Builder;


class TwilioSMSService extends AbstractService
{
    public function getList($registerUserPhoneNumber){
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;
        
        $query = TwilioSms::select()->where('sms_to', $registerUserPhoneNumber)->orWhere('msg_from', $registerUserPhoneNumber);
        if ($order_by) {
            $query = $query->orderBy($order_by, $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'asc');
        }
        $num_results_filtered = $query->count();
        $data = $query->offset($offset)->limit($per_page)->get();
        $count = $offset;
        $result = new LengthAwarePaginator($data, $num_results_filtered, $per_page, $page);
        $result->setPath(route('sms.index',$registerUserPhoneNumber));
        return $result;
    }


    public function twilioreceive($message_responce){
        $sms_result = TwilioSms::where('message_sid', $message_responce->input('MessageSid'))->first();
        if (!$sms_result){
            $sms_result = new TwilioSms;
        }
        $sms_result->body = substr($message_responce->input('Body'), 0, 10);
        $sms_result->msg_from = $message_responce->input('From');
        $sms_result->message_sid = $message_responce->input('MessageSid');
        $sms_result->sms_status = $message_responce->input('SmsStatus');
        $sms_result->sms_to = $message_responce->input('To');
        $sms_result->save();
        return $sms_result->id; 
    }

    public function twiliosentMessage($message_data){
        $sms = TwilioSms::where('message_sid', $message_data->sid)->first();
        if (!$sms){
            $sms = new TwilioSms;
        }
        $sms->body = $message_data->body;
        $sms->msg_from = $message_data->from;
        $sms->message_sid = $message_data->sid;
        $sms->sms_status = 'sent';
        $sms->status = 1;
        $sms->sms_to = $message_data->to;
        $sms->save();
        return $sms->id; 
    }

    public function getUserDetails($messageid){
        $message_detail = TwilioSms::find($messageid);
        if($message_detail){
            TwilioSms::where('id', $messageid)->update(['status'=>1]);
            return $message_detail;
        }

    }

    public function storecallrecord($callDetails){
    $call = new TwilioCall;
        $call->to = $callDetails['To'];
        $call->from = $callDetails['callerId'];
        $call->direction = $callDetails['call_direction'];
        $call->status = $callDetails['CallStatus'];
        // $call->duration = ;
        return $call->save();
        
    }
}
