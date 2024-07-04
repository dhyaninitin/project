<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ User };
use App\Mail\SendMail; 
use Illuminate\Http\Request; 
use Illuminate\Support\Facades\Mail; 
use Carbon\Carbon;
use Auth;

class MailService extends AbstractService
{

    public function sendmail($template,$title,$customer_details,$order_details)
    {
        $sendmail = Mail::to($customer_details['email'])->send(new SendMail($template,$title, $customer_details, $order_details)); 
        if (empty($sendmail)) { 
            return true;
        }else{ 
            return false; 
        }

    }
    
}
