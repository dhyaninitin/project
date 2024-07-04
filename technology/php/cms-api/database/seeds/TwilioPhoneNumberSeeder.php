<?php

use Illuminate\Database\Seeder;
use Twilio\Rest\Client;
use App\Model\PhoneNumbers;

class TwilioPhoneNumberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $phoneNumbers = PhoneNumbers::all();

        //synchronize twilio phone SIDs
        $twilio = new Client(config('services.twilio.twilio_account_sid'), config('services.twilio.twilio_auth_token'));
        $incomingPhoneNumbers = $twilio->incomingPhoneNumbers->read();
        foreach ($incomingPhoneNumbers as $incomingPhoneNumber) {
            info($incomingPhoneNumber->friendlyName);
            $isPhoneFoundInDB = false;
            foreach ($phoneNumbers as $key => $phoneNumber) {
                if ($phoneNumber) {
                    $phone = $phoneNumber->phone;
                    if ($phone[0] !== '+') {
                        $phone = '+' . $phone;
                    }
                    if($phone == $incomingPhoneNumber->phoneNumber){
                        $phoneNumber->twilio_phone_sid = $incomingPhoneNumber->sid;
                        $phoneNumber->save();
                        $isFoundInDB = true;
                    }
                }
            }
        }
    }
}
