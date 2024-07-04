<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cookie;
use Carbon\Carbon;
use App\Model\{PortalUser,PortalUserPhoneOtp};
use App\Model\Log;
use App\Services\PortalUserService;
use App\Http\Resources\PortalUserResource;
use App\Http\Requests\UpdateAuthUserRequest;
use Auth as UserAuth;
use PragmaRX\Google2FA\Google2FA;
use Twilio\Rest\Client;
use Twilio\TwiML;
use App\Traits\PortalTraits;

class AuthController extends Controller
{

    use PortalTraits;

    /**
     * @var PortalUserService
     */
    protected $portalUserService;

    public function __construct(PortalUserService $portalUserService)
    {
        $this->portalUserService = $portalUserService;
    }

    /**
     * Create portal_user
     *
     * @param  [string] name
     * @param  [string] email
     * @param  [string] password
     * @param  [string] password_confirmation
     * @return [string] message
     */
    public function signup(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string',
            'email' => 'required|string|email|unique:portal_users',
            'password' => 'required|string|confirmed'
        ]);
        $portal_user = new PortalUser([
            'first_name' => $request->first_name,
            'email' => $request->email,
            'password' => bcrypt($request->password)
        ]);
        $portal_user->save();

        $tokenResult = $portal_user->createToken('Personal Access Token');
        $token = $tokenResult->token;
        if ($request->remember_me)
            $token->expires_at = Carbon::now()->addWeeks(1);
        $token->save();
        return response()->json([
            'access_token' => $tokenResult->accessToken,
            'token_type' => 'Bearer',
            'expires_at' => Carbon::parse(
                $tokenResult->token->expires_at
            )->toDateTimeString()
        ]);
    }

    /**
     * two factor authenticat verification
     *
     * @param  [string] email
     * @param  [string] password
     * @param  [boolean] remember_me
     */
    public function twoFactorAuthantication(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
            'remember_me' => 'boolean'
        ]);
        $portal_user = PortalUser::where('email', $request->email)->first();

        if (!$portal_user || !Hash::check($request->password, $portal_user->password)) {
            return response()->json([
                'message' => 'Can\'t login. Please check your email and password'
            ], 401);
        }

        if (!$portal_user->is_active)
        {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact admin for more details.'
            ], 401);
        }

        if ($portal_user->two_factor_slider){
            $twoFactorOption = $portal_user->two_factor_option;
            if(!$twoFactorOption){
                // SMS Authantication
                if($portal_user->phone){
                    $otp =  $this->generateRandomNumber();
                    $msg = 'CarBlip Two Factor Authentication code is '.$otp;
                    $client = new Client(config('services.twilio.twilio_account_sid'), config('services.twilio.twilio_auth_token'));
                    $message = $client->messages->create(
                        $portal_user->phone,
                        array(
                            'from' => config('services.twilio.twilio_number'),
                            'body' => $msg
                        )
                    );
                    $checkCount = PortalUserPhoneOtp::where('phone_number', $portal_user->phone)->get();
                        $store = new PortalUserPhoneOtp;
                        $store->phone_number = $portal_user->phone;
                        $store->otp = $otp;
                        $store->created_at = now();
                        $store->save();
                    return response()->json([
                        'success' => true,
                        'type'=> 0,
                        'message' => 'OTP has sent to your mobile number'
                    ]);
                }
            }else{
                return response()->json([
                    'success' => true,
                    'type'=> 1,
                    'message' => 'Please Enter your OTP'
                ]);
            }

        }else{
            return $this->login($request);
        }
    }

    /**
     * Login portal_user and create token
     *
     * @param  [string] email
     * @param  [string] password
     * @param  [boolean] remember_me
     * @return [string] access_token
     * @return [string] token_type
     * @return [string] expires_at
     */
    public function login(Request $request)
    {
        $portal_user = PortalUser::where('email', $request->email)
            ->first();

        if ($portal_user->two_factor_slider){
            $twoFactorOption = $portal_user->two_factor_option;
            if(!$twoFactorOption){
                $query = PortalUserPhoneOtp::where('phone_number', $portal_user->phone)->orderBy('id', 'desc')->get();
                if(intval($query[0]->otp) === intval($request->otp)){

                }else{
                    return response()->json([
                        'message' => 'Please enter valid OTP'
                    ], 401);
                }

                PortalUserPhoneOtp::where('id', $query[0]->id)->update(['is_verifyed' => 1]);

            }else{
                $google2fa = app(Google2FA::class);
                $isvalid = $google2fa->verifyKey($portal_user->two_factor_token,$request->otp );

                if(!$isvalid){
                    return response()->json([
                        'message' => 'Please enter valid OTP'
                    ], 401);
                }
            }
        }

        $conent = json_encode(['firs_tname' =>$portal_user->first_name,'last_name' =>$portal_user->last_name, 'name' =>$portal_user['first_name'].' '.$portal_user['last_name'],'source' =>'portal']);
        $msg = "<b>{$portal_user->full_name}</b> was logged in portal";
        $userlog = new Log();
        $userlog->content = $msg;
        $userlog->category = 'portal';
        $userlog->action = 'login';
        $userlog->target_id = $portal_user->id;
        $userlog->target_type = 'App\Model\PortalUser';
        $userlog->portal_user_id  = $portal_user->id;
        $userlog->portal_user_name  =$portal_user['first_name'].' '.$portal_user['last_name'];
        $userlog->save();

        $tokenResult = $portal_user->createToken('Personal Access Token');
        $token = $tokenResult->token;
        if ($request->remember_me)
            $token->expires_at = Carbon::now()->addWeeks(1);
        $token->save();
        return response()->json([
            'access_token' => $tokenResult->accessToken,
            'token_type' => 'Bearer',
            'expires_at' => Carbon::parse(
                $tokenResult->token->expires_at
            )->toDateTimeString()
        ]);
    }

    /**
     * Logout portal_user (Revoke the token)
     *
     * @return [string] message
     */
    public function logout(Request $request)
    {
        $request->user()->token()->revoke();
        Cookie::queue(Cookie::forget('zimbra_token'));

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Get the authenticated User
     *
     * @return [json] user object
     */
    public function user(Request $request)
    {
        $portal_user = UserAuth::user();
        $user = $this->portalUserService->get($portal_user->id);
        return new PortalUserResource($user);
    }

    /**
     * Update the authenticated User
     *
     * @return [json] user object
     */
    public function update(UpdateAuthUserRequest $request)
    {
        $portal_user = UserAuth::user();
        $data = $request->all();
        $result = $this->portalUserService->update($portal_user->id, $data, true);

        return response()->json([
            'success' => true,
            'message' => 'Profile has been successfully updated',
            'data' => new PortalUserResource($result)
        ]);
    }
}
