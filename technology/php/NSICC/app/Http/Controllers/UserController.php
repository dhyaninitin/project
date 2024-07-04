<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\{UsersRequest,ListRequest};
use App\Services\{UserService};
use App\Http\Resources\{UserResource,UserCollection};
use Auth;
use App\Model\{User};


class UserController extends Controller
{
    public function __construct(UserService $userservice)
    {
        $this->userService = $userservice;
    }

    public function index(ListRequest $request)
    {
        $user = Auth::user(); 
        $search = $request->all();
        $result = $this->userService->getList($search);
        return new UserCollection($result);
    }

    public function store(UsersRequest $request)
    {
        $user = Auth::user();   
        $insert = $request->all();
        $result = $this->userService->create($insert);
        return new UserResource($result);
    }

    public function show(Request $request,$userid)
    {
        $user = Auth::user();
        $result = $this->userService->get($userid);
        return new UserResource($result);
    }

    public function update(Request $request,$updateid)
    {
        $user = Auth::user();
        $update_data = $request->all();
        $result = $this->userService->update($updateid, $update_data);
        return new UserResource($result);
    }

    function delete(Request $request,$deleteid)
    {
        $user = Auth::user();
        $result = $this->userService->delete($deleteid);
        return response()->json([
            'result' => 'NSICC user has been successfully removed.'
        ]);
    }

}
