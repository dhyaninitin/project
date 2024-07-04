<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{PhoneNumbers, PortalUser};
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;
use Twilio\Rest\Client;

class PhoneNumbersService extends AbstractService
{
    /**
     * get phone numbers all
     *
     * @return array
     */

    public function getAll($filter)
    {
        $result = [];
        $page  = isset($filter['page']) ? $filter['page'] : 1;
        $per_page = isset($filter['per_page']) ? $filter['per_page'] : 10;
        $order_by = isset($filter['order_by']) ? $filter['order_by']: null;
        $order_dir = isset($filter['order_dir']) ? $filter['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $query = PhoneNumbers::query();

        //Filter related to search key
        if(isset($filter['search'])){
            $search_value = isset($filter['search']) ? $filter['search']: null;
            $query->where("phone", "LIKE", "%$search_value%");
        }
        $num_results_filtered = $query->count();
        //Filter related to sort selection
        if(isset($filter['order_by'])) {
            $order_dir = $filter['order_dir'] ? $filter['order_dir'] : 'desc';
            $query = $query->orderBy($filter['order_by'], $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);
        $phoneNumbers = $query->get();
        $count = $offset;
        $result = new LengthAwarePaginator($phoneNumbers, $num_results_filtered, $per_page, $page);
        $result->setPath(route('quotes.index'));
        return $result;
    }

    /**
     * get phone number item
     *
     * @param Number $contact_id
     * @return array
     */

    public function show($userid)
    {
        $data = PhoneNumbers::where('portal_user_id', $userid)->first();
        return $data;
    }

    /**
     * create phone number item
     *
     * @param Number $target_id
     * @param Array $data
     * @return array
     */

    public function create($data)
    {
        $result = PhoneNumbers::create($data);
        return $result;
    }

    public function update($data, $id)
    {
        $result = PhoneNumbers::where('id', $id)->update($data);
        return $result;
    }

    /**
     * delete phone number item
     *
     * @param Number $phonenumber_id
     * @param String
     * @return array
     */

    public function delete($request)
    {
        $phoneNumber = PhoneNumbers::find($request['id']);

        if($phoneNumber){
            if($phoneNumber->twilio_phone_sid){
                $twilio = new Client(config('services.twilio.twilio_account_sid'), config('services.twilio.twilio_auth_token'));
                $twilio->incomingPhoneNumbers($phoneNumber->twilio_phone_sid)->delete();
            }
            $phoneNumber->delete();
            return true;
        } else {
            return false;
        }
    }

    public function updateTwilioPhoneSID($phone, $sid)
    {
        $phoneNumber = DB::table('phone_numbers')->where('phone', $phone)->update(['twilio_phone_sid'=>$sid]);
        return true;
    }
}
