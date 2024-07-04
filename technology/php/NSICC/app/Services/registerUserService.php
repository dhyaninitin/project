<?php

namespace App\Services;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Model\{ MarriageServices };
use App\Model\User;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class registerUserService extends AbstractService
{

   /**
     * Register a user api
     
     * @return [string] message
     */
    public function register($request)
    {
        
        $user = User::create([
            'email' => $request['email'],
            'password' => Hash::make($request['password']),
            'role_id' =>  $request['role_id'],
        ]);

        $token = JWTAuth::fromUser($user);
        return $user->id;
    }
   
}
