<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ResetsPasswords;
use Illuminate\Http\Request;
use App\Model\PortalUser;
use Illuminate\Support\Facades\Password;
// use Illuminate\Validation\Validator;
use Illuminate\Support\Facades\Auth;
use DB;
class ResetPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset requests
    | and uses a simple trait to include this behavior. You're free to
    | explore this trait and override any methods you wish to tweak.
    |
    */

    use ResetsPasswords;

    /**
     * Where to redirect users after resetting their password.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }
    public function reset(Request $request)
    {
        $data = $request->all();
        $user = PortalUser::where('email', $data['email']  )->first(); 
 
        $tokenData = DB::table('password_resets')
        ->where('token', $data['token']  )->first();
        $validator = \Validator::make($request->all(), [
            'email' => 'required|email|exists:portal_users,email',
            'password' => 'min:6|required|confirmed',
            "password_confirmation" => 'min:6|required',
            'token' => 'required' 
            ]);

        if ($validator->fails()) {
            $errors = $validator->errors();
            return response()->json(  $errors );     
        }  
        if( $data['token'] == null || !$data['token'] ) {
            return response()->json([ 
                'message' => 'Invalid Token'
            ]);   
        }
        if (!$user){
            return response()->json([ 
                'message' => 'Email not found!'
            ]);   
        }  
 
        $user->password = \Hash::make( $data['password'] );
        $user->update();  
 
        DB::table('password_resets')->where('email', $user->email)
        ->delete();
        return response()->json([
            'data'=> $user,
            'message' => 'Password reset successfully'
        ]);    
         
    }   
    public function broker()
    {  
        return Password::broker('portalusers');
    }
}
