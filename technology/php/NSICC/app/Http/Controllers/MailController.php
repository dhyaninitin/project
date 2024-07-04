<?php 
namespace App\Http\Controllers; 
use App\Mail\SendMail; 
use Illuminate\Http\Request; 
use Illuminate\Support\Facades\Mail; 
use App\Services\{ MailService };

class MailController extends Controller 
{ 
    // 
    /**
     * @var MailService
     */
    protected $mailService;

    public function __construct(
        MailService $mailService
    )
    {
        $this->mailService = $mailService;
    }
    
    public function sendEmail() 
    { 
        $template = 'customer_mail1'; 
        $title = '[Confirmation] Thank you for your order'; 
        $customer_details = [ 
            'name' => 'Arogya', 
            'address' => 'kathmandu Nepal', 
            'phone' => '123123123', 
            'email' => 'sanjaybhatt300' 
        ]; 
        $order_details = [ 
            'SKU' => 'D-123456', 
            'price' => '10000', 
            'order_date' => 
            '2020-01-22', 
        ]; 
        $result = $this->mailService->sendmail($template,$title,$customer_details,$order_details);
        if($result)
        {
            return response()->json(['message' => 'Mail Sent Sucssfully'], 200); 
        }else{ 
            return response()->json(['message' => 'Mail Sent fail'], 400); 
        } 
       
    } 
}