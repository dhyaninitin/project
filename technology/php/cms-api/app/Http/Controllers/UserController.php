<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessWorkflowJob;
use Illuminate\Http\Request;
use App\Model\{User, PortalUser, ConciergeContactOwner};
use App\Http\Requests\{UserListRequest, UserRequest};
use App\Services\{UserService, LogService};
use App\Http\Resources\{UserCollection, UserResource, LogResource, PortalUserCollection};
use App\Traits\{UserTrait,HubspotTrait};
use App\Enums\{Logs, Roles};
use Auth;
use App\Http\Requests\ConciergeUserRequest;

class UserController extends Controller
{
    use UserTrait;
    use HubspotTrait;

    /**
     * @var UserService
     */
    protected $userService;

    /**
     * @var LogService
     */
    protected $logService;

    public function __construct(
        UserService $userService,
        LogService $logService
    )
    {
        $this->userService = $userService;
        $this->logService = $logService;
    }

    /**
     * Get user list
     *
     * @param  App\Http\Requests\UserListRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function index(UserListRequest $request)
    {
        $user = Auth::user();
        $filter = $request->all();
        $result = $this->userService->getList($filter);
        return new UserCollection($result);
    }


    /**
     * Return user object
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $user_id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request,$user_id)
    {
        $result = $this->userService->get($user_id);
        if(empty($result)) {
            return response()->json([
                'data' => []
            ]);
        }
        return new UserResource($result);
    }

    /**
     * Return user logs
     *
     * @param  User  $request
     * @return \Illuminate\Http\Response
     */
    public function logs(User $user,Request $request)
    {
        $filters = $request->all();
        $user_id = $user->id;
        $result = $this->logService->getByCategoryPagniated(Logs::User, $user_id,$filters);
        return LogResource::collection($result);
    }

    public function userslogs(Request $request)
    {
        $filter = $request->all();
        $result = $this->logService->getByallusersPagniated(Logs::User,$filter);
        return LogResource::collection($result);
    }

    /**
     * Create user info
     *
     * @param  App\Http\Requests\UserRequest  $request
     * @return \Illuminate\Http\Response
     */
    // public function store(UserRequest $request)
    public function store(Request $request)
    {
        $user = Auth::user();
        $data = $request->all();
        $data['over18'] = $data['over18'] ?? null;

        $email_address =  explode("@",$data['email_address']);
        if (str_contains($email_address[1], 'con')) {
            $email = explode('.',$email_address[1]);
            $data['email_address'] = $email_address[0].'@'.$email[0].'.com';
        }else{
            $data['email_address'] = $data['email_address'];
        }
        $data['device_type'] = $request->server('HTTP_USER_AGENT');
        $result = $this->userService->create($data);
        if($result){
            $data = ['event' => 'object-created', 'objectIds' => [$result->id]];
            ProcessWorkflowJob::dispatch($data);
        }
        return new UserResource($result);
    }

    /**
     * Update user info
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $user_id
     */
    public function update(UserRequest $request, $user_id)
    {
        $user = Auth::user();
        $data = $request->all();
        $data['device_type'] = $request->server('HTTP_USER_AGENT');
        $result = $this->userService->update($user_id, $data);
        if($result){
            $workflows = $this->userService->getWorkflowsNotEnrolledByUser($result->id);
            $workflowIds = array();
            foreach ($workflows as $workflow)
            {
                array_push($workflowIds, $workflow->id);
            }
            $data = ['event' => 'object-updated', 'workflowIds' => $workflowIds, 'objectIds' => [$result->id]];
            ProcessWorkflowJob::dispatch($data);
        }
        return new UserResource($result);
    }

    public function updateContactProperty(Request $request,$user_email) {
        $data = $request->all();
        if($data['cdapikey'] == getenv('CONTACT_WEBHOOK_KEY')) {
            $result = $this->userService->updateContactProperty($user_email, $data);
            $msg = 'Contact property updated successfully.';
        }else{
            $msg = 'Invalid token.';
        }

        return response()->json([
            'result' => $msg
        ]);

    }

    /**
     * Delete user
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $user_id
     */
    public function destroy(Request $request, $user_id)
    {
        $this->authorize('delete_user', User::class);
        $user = Auth::user();
        $result = $this->userService->delete($user_id);
        return response()->json([
            'result' => 'User has been successfully removed.'
        ]);
    }

    /**
     * Toggle user
     *
     * @param  Illuminate\Http\Request  $request
     * @param  User  $user
     */
    public function toggle(Request $request, User $user)
    {
        $this->authorize('toggle_user', [$user, $request]);

        $data = $request->all();
        $result = $this->userService->toggle($user->id, $data);
        return new UserResource($result);
    }

    //Get all sources of requests
    public function getCreatedBy(Request $request){
        $getreq = $request->all();
        $result = $this->userService->getCreatedBy();
        return new PortalUserCollection($result);
    }

    /**
     * Update source for old user
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $user_id
     */
    public function update_source()
    {
        $user   = Auth::user();
        $result = $this->userService->update_source();
        return response()->json([
            'result' => 'Users source has been successfully updated.'
        ]);
    }

    public function createConciergeUser(ConciergeUserRequest $request)
    {
        $data = $request->all();
        $data['over18'] = $data['over18'] ?? null;

        $email_address =  explode("@",$data['email']);
        if (str_contains($email_address[1], 'con')) {
            $email = explode('.',$email_address[1]);
            $data['email'] = $email_address[0].'@'.$email[0].'.com';
        }else{
            $data['email'] = $data['email'];
        }
        $result = $this->userService->createConciergeUser($data);
        if($result){
            $data = ['event' => 'object-created', 'objectIds' => [$result->id]];
            ProcessWorkflowJob::dispatch($data);
            return new UserResource($result);
        }
        return null;
    }

    public function makeConciergeOwner(Request $request)
    {
        $this->validate($request, ['portal_user_id' => 'required | integer | exists:portal_users,id']);

        $conciergeOwner = ConciergeContactOwner::first();

        if ($conciergeOwner == null)
        {
            $conciergeOwner = new ConciergeContactOwner;
        }

        $conciergeOwner->user_id = $request->portal_user_id;
        $conciergeOwner->save();

        return response()->json([ 'data' => "success" ]);
    }

    public function checkContactSecondaryEmails(Request $request){
        $request = $request->all();
        $result = $this->userService->checkContactSecondaryEmails($request['email']);
        return response()->json([
                    'data'=> $result,
                ]);
    }

    public function checkContactSecondaryPhoneNumber(Request $request){
        $request = $request->all();
        $result = $this->userService->checkContactSecondaryPhoneNumber($request['phone_number']);
        return response()->json([
            'data'=> $result,
        ]);
    }

}
