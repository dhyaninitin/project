<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ User };
use Illuminate\Http\Request; 
use Carbon\Carbon;
use Auth;
use Beanstream;


class PaymentService extends AbstractService
{

    public function payOne($request)
    {
        $merchant_id = env('BAMBORA_MERCHANT_ID', ''); //INSERT MERCHANT ID (must be a 9 digit string)
        $api_key = env('BAMBORA_PASSCODE', ''); //INSERT API ACCESS PASSCODE
        $api_version = 'v1'; //default
        $platform = 'api'; //default

        //Create Beanstream Gateway
        $beanstream = new \Beanstream\Gateway($merchant_id, $api_key, $platform, $api_version);

        //Card Payment Data
        $payment_data = array(
        'order_number' => $request['order_number'],
        'amount' => $request['amount'],
        'payment_method' => $request['payment_method'],
        'card' => array(
            'name' =>  $request['card_holder'],
            'number' =>  $request['card_number'],
            'expiry_month' =>  $request['card_expiry_month'],
            'expiry_year' =>  $request['card_expiry_year'],
            'cvd' =>  $request['card_cvd']
        
        )
        );
         
        $complete = TRUE; //set to FALSE for PA

        //Try to submit a Card Payment
        try {

        $result = $beanstream->payments()->makeCardPayment($payment_data, $complete);

        /*
        * Handle successful transaction, payment method returns
        * transaction details as result, so $result contains that data
        * in the form of associative array.
        */
        //return $result;
        } catch (\Beanstream\Exception $e) {
        /*
        * Handle transaction error, $e->code can be checked for a
        * specific error, e.g. 211 corresponds to transaction being
        * DECLINED, 314 - to missing or invalid payment information
        * etc.
        */
        //return $e->code;
        }

    }
    
}
