<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\User;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Model\Nsiccuser;
use Carbon\Carbon;
use Auth as UserAuth;

class ApiAuthController extends Controller
{
    public function login (Request $request) {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:6',
        ]);
        if ($validator->fails())
        {
            return response(['errors'=>$validator->errors()->all()], 422);
        }
        $nsicc_user = Nsiccuser::where('email', $request->email)->first();
    
        echo $request->password;
        echo $nsicc_user->email;
        echo $nsicc_user->password."<br/>";

        if ($nsicc_user) {
            if (!$nsicc_user || Hash::check($request->password, $nsicc_user->password)) {
                $token = $nsicc_user->createToken('token')->accessToken;
                    $tokenResult = $nsicc_user->createToken('Personal Access Token');
                    $token = $tokenResult->token;
                    $token->expires_at = Carbon::now()->addWeeks(1);
                $token->save();
                return response()->json([
                    'access_token' => $tokenResult->accessToken,
                    'token_type' => 'Bearer',
                    'expires_at' => Carbon::parse(
                        $tokenResult->token->expires_at
                    )->toDateTimeString()
                ]);
                
            } else {
                return response()->json([
                    'message' => 'Can\'t login. Please check your email and password'
                ], 401);
            }
        } else {
            return response()->json([
                'message' => 'User does not exist'
            ], 422);
        }
    }

      /**
     * Logout cms_user (Revoke the token)
     *
     * @return [string] message
     */
    public function logout(Request $request)
    {
        $request->user()->token()->revoke();
        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }


    
}
