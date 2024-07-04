<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use App\Model\PortalUser;
use Illuminate\Http\Request;
use DB; 
use PHPMailer;
use Auth;
use GuzzleHttp\Client;
use \Mailjet\Resources;
use Exception;

class ForgotPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset emails and
    | includes a trait which assists in sending these notifications from
    | your application to your users. Feel free to explore this trait.
    |
    */

    use SendsPasswordResetEmails;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    } 

    public function getResetToken(Request $request)
    { 
        $this->validate($request, ['email' => 'required|email']); 
        $user = PortalUser::where('email', $request->input('email'))->first(); 
        if ($user) { 
            $token = $this->broker()->createToken($user);
            $tokenData = DB::table('password_resets')
            ->where('email', $request->input('email'))->first();
            $environment = \App::environment();
            $value = '';
            
            $value = env('WEB_URL');
            $link =  $value. 'sessions/password/reset/'. $token . '?email=' . $user->email; 
          
            \Mail::to($request->input('email'))->send(new \App\Mail\ForgotPasswordMail($link) );
            
            return response()->json([
                'data'=> ['token' => $token],
                'message' => 'A reset link has been sent to your email address.'
            ]); 
        }else {
            return response()->json([ 
                'message' => trans('passwords.user')
            ], 400);
        } 
    }
    
    public function forgetpassword(Request $request){
        $this->validate($request, ['email' => 'required|email']);
           $user = PortalUser::where('email', $request->input('email'))->first();
                
           if ($user) {
                echo 'yesss';
               $token = $this->broker()->createToken($user);
               $tokenData = DB::table('password_resets')
               ->where('email', $request->input('email'))->first();
                $environment = \App::environment();
                $value = "";
                if(empty($request['WEB_URL'])) {
                   $value = getenv('WEB_URL');
                } else {
                    $value = $request['WEB_URL'];
                }
                $link =  $value. '/sessions/password/reset/'. $token . '?email=' . $user->email; 

               $message = '<html><body>';
               $message .= '<h2 style="color:#333;">Hello!</h2>'; 
               $message .= '<p style="color:#333;font-size:14px;">You are receiving this email because we received a password reset request for your account.</p>';
               $message .= '<a mc:disable-tracking href="'.$link.'" style="padding:5px 15px; border-radius: 4px; color: #fff;display: inline-block; overflow: hidden;text-decoration: none;  background-color: #2d3748; " > Reset Password </a>';
               $message .= '<p style="color:#333;font-size:14px;">This password reset link will expire in 60 minutes.</p>';
               $message .= '<p style="color:#333;font-size:14px;">If you did not request a password reset, no further action is required.</p>';
               $message .= '<p style="color:#333;font-size:14px;">Regards,</p>';
               $message .= '<p style="color:#333;font-size:14px;">Carblip</p>';
               $message .= '</body></html>';

               $mailjet = new \Mailjet\Client(config('services.mailjet.key'), config('services.mailjet.secret'), true, ['version' => 'v3.1']);
               $body = [
                    'Messages' => [
                        [
                            'From' => [
                                'Email' => "support@carblip.com",
                                'Name' => "Carblip"
                            ],
                            'To' => [
                                [
                                    'Email' => $user->email,
                                    'Name' => $user->first_name.' '.$user->last_name
                                ]
                            ],
                            'Subject' => "Reset Password Notification",
                            'HTMLPart' => $message
                        ]
                    ]
                ];

                $response = $mailjet->post(Resources::$Email, ['body' => $body]);
                
                if($response->success()){
                    echo 'yesss1';

                    return response()->json($response->getData(), 200);
                } else {
                    if(isset($response->getData()['ErrorMessage'])){
                        echo 'yesss2';

                        $message = $response->getData()['ErrorMessage'];
                    } else {
                    echo 'yesss3';

                        $message = 'Failed sending reset password email';
                    }

                    return response()->json([
                        'message' => 'Internel server error.'
                    ], 500);
                }
           } else {
            echo 'yesss4';

               return response()->json([ 
                   'message' => trans('passwords.user')
               ], 400);
           }
    }
}
