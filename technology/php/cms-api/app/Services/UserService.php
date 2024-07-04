<?php

namespace App\Services;

use App\Model\{User, PortalUser, Log, VehicleRequest, Quote, WholeSaleQuote, WorkflowHistory, HubspotWorkFlows, ConciergeContactOwner, 
    ContactSecondaryEmailModel, ContactSecondaryPhoneModel};
use App\Enums\{Logs, UserAction, TargetTypes, SourceUtm};
use Illuminate\Support\Facades\DB;
use App\Http\Resources\UserCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use App\Services\ApiService;
use Auth;
use HubSpot;
use App\Enums\{Roles, Permissions};
use App\Traits\{HubspotTrait,PortalTraits};
use Illuminate\Support\Collection;
use Propaganistas\LaravelPhone\PhoneNumber;

use Illuminate\Support\Facades\Log as LaravelLog;


class UserService extends AbstractService
{

    use HubspotTrait;
    use PortalTraits;
    /**
     * @var ApiService
     */
    protected $apiService;

    public function __construct(ApiService $apiService = null)
    {
        $this->apiService = $apiService;
    }

    /**
     * get user list
     *
     * @param Array $filters
     * @return array
     */


    public function getList($filters)
    {
        $portal_user = Auth::user();
        $result = [];
        $db_result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $offset = ($page - 1) * $per_page;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: 'created_at';
        $search_value = isset($filters['search']) ? $filters['search']: null;
        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();
        $first_name = isset($filter['first_name']) ? $filter['first_name']: null;
        $last_name = isset($filter['last_name']) ? $filter['last_name']: null;
        $phone = isset($filter['phone']) ? $filter['phone']: null;
        $contact_owner = isset($filter['contact_owner']) ? $filter['contact_owner']: null;
        $start_date = isset($filter['start_date']) ? $filter['start_date']: null;
        $created_by = isset($filter['created_by']) ? $filter['created_by']: null;
        $end_date = isset($filter['end_date']) ? $filter['end_date']: null;
        $source = isset($filter['source']) ? $filter['source']: null;
        $type = isset($filter['type']) ? $filter['type']: null;

        $query = User::select('*');

		if($search_value) {
            $search_value_arr = explode(' ', $search_value);

            foreach ($search_value_arr as $key => $value) {
                if ($this->checkEmail($value) ) {
                    $value = $value;
                }else{
                    $value = $this->sanitizeValue($value);
                }

                $query->whereRaw("concat(COALESCE(`first_name`,''), ' ', COALESCE(`last_name`, ''), ' ', COALESCE(`phone`, ''), ' ', COALESCE(`email_address`, ''), ' ', COALESCE(`zip`, ''), ' ' ) like '%{$value}%'");
            }
        }

        if($type) {
            if($type != 10 && $type != 2 && !empty($type)){
                $query->where('type',$type);
            } else if($type != 10 && $type == 2) {
                $query->where('type',Null);
            }
        }

        /**
         * Check Portal user role and permission and restrict user list
         */

        if ($portal_user->hasPermissionTo(Permissions::ViewLocal)) {

            // When user has Manager Role, Show all users having contact owner as all Portal users under location
            if ($portal_user->hasRole(Roles::Manager)) {
                if(!$search_value) {
                    $userLocation = empty(json_decode($portal_user->locations)) ? [1] : json_decode($portal_user->locations);
                    $userQuery = PortalUser::whereJsonContains('locations', $userLocation);
                        if (empty(json_decode($portal_user->locations))) {
                            $userQuery->orWhereNull('locations');
                        }
                    $usersArray = $userQuery->pluck('email')->toArray();
                    $query = $query->orWhere(function ($in_query) use($portal_user, $usersArray) {
                        $in_query->whereIn('contact_owner_email', $usersArray)->orWhereNull('contact_owner_email');
                    });
                }
                if($search_value) {
                    $userLocation = empty(json_decode($portal_user->locations)) ? [1] : json_decode($portal_user->locations);
                    $userQuery = PortalUser::whereJsonContains('locations', $userLocation);
                        if (empty(json_decode($portal_user->locations))) {
                            $userQuery->orWhereNull('locations');
                        }
                    $usersArray = $userQuery->pluck('email')->toArray();
                    $query = $query->where(function ($in_query) use($portal_user, $usersArray) {
                        $in_query->whereIn('contact_owner_email', $usersArray)->orWhereNull('contact_owner_email');
                    });
                }
            // When user has Salesperson Role, Show all users having contact owner as current salesperson
            } else if ($portal_user->hasRole(Roles::Salesperson)) {
                if(!$search_value) {
                    $query = $query->orWhere(function ($in_query) use($portal_user) {
                        $in_query->where('contact_owner_email', $portal_user->email)->orWhereNull('contact_owner_email');
                    });
                }

                if($search_value) {
                    $query = $query->where(function ($in_query) use($portal_user) {
                        $in_query->where('contact_owner_email', $portal_user->email)->orWhereNull('contact_owner_email');
                    });
                }
            } else if ($portal_user->hasRole(Roles::Concierge)) {
                if(!$search_value) {
                    $query = $query->orWhere(function ($in_query) use($portal_user) {
                        $in_query->where('contact_owner_email', $portal_user->email);
                    });
                }

                if($search_value) {
                    $query = $query->where(function ($in_query) use($portal_user) {
                        $in_query->where('contact_owner_email', $portal_user->email);
                    });
                }
            } else {
                $query = $query->where('contact_owner_email', $portal_user->email);
            }
            if($first_name){
                $query->where('first_name', 'like','%'.$first_name.'%');
            }
            if($last_name){
                $query->where('last_name', 'like','%'.$last_name.'%');
            }
            if($contact_owner){
                if($contact_owner == 'no_owner'){
                    $query->WhereNull('contact_owner_email');
                }else{
                    $query->where('contact_owner_email', 'like','%'.$contact_owner.'%');
                }
            }

            if(!is_null($source) && $source !== '10' && !empty($source))
            {
                if($source == '50'){
                    $query->whereNull('source');
                }
                $source = array_map('intval', explode(',', $source));
                if(!in_array('50', $source)){
                   $query->whereIn('source', $source);
                } else if(in_array('50', $source) && count($source) > 1) {
                    unset( $source[array_search(50, $source )]);
                    $query->whereIn('source', $source);
                    $query->orWhereNull('source');
                }
            }
            if($created_by){
                $users_created_by = Log::select('target_id')->where('logs.action','created')->where('logs.category','user')->where('portal_user_id',$created_by)->get()->pluck('target_id')->toArray();
                if(count($users_created_by) > 0){
                    $query->whereIn('id', $users_created_by);
                }
            }

            if($phone){
                $phoneformat1 = str_replace('-', '', $phone);
                $phoneformat2 = '+1'.str_replace('-', '', $phone);
                $phoneformat3 = '+1'.$phone;
                $phoneformat4 = $phone;

                $query->where( function($query) use ($phoneformat1,$phoneformat2,$phoneformat3,$phoneformat4) {
                    return $query->where('phone', 'LIKE', '%'.$phoneformat1.'%')
                    ->orWhere('phone', 'LIKE', '%'.$phoneformat2.'%')
                    ->orWhere('phone', 'LIKE', '%'.$phoneformat3.'%')
                    ->orWhere('phone', 'LIKE', '%'.$phoneformat4.'%');
                   });
            }
            if ($start_date)
            {
                if(date('Y-m-d', strtotime($start_date)) == date('Y-m-d', strtotime($end_date))) {
                    $start_date = date('Y-m-d', strtotime($start_date));
                    $query->whereDate('created_at', $start_date);
                } else {
                    $start_date = date('Y-m-d', strtotime($start_date. '+1 day'));
                    $end_date = date('Y-m-d', strtotime($end_date.'+1 day'));
                    $query->whereBetween('created_at', [$start_date, $end_date]);
                }
            }
        } else {
            if($first_name){
                $query->where('first_name', 'like','%'.$first_name.'%');
            }
            if($last_name){
                $query->where('last_name', 'like','%'.$last_name.'%');
            }
            if($contact_owner){
                if($contact_owner == 'no_owner'){
                    $query->WhereNull('contact_owner_email');
                }else{
                    $query->where('contact_owner_email', 'like','%'.$contact_owner.'%');
                }
            }

            if(!is_null($source) && $source !== '10' && !empty($source))
            {
                if($source == '50'){
                    $query->whereNull('source');
                }
                $source = array_map('intval', explode(',', $source));
                if(!in_array('50', $source)){
                   $query->whereIn('source', $source);
                } else if(in_array('50', $source) && count($source) > 1) {
                    unset( $source[array_search(50, $source )]);
                    $query->where(function ($query) use ($source) {
                        $query->whereIn('source', $source)
                            ->orWhereNull('source');
                    });
                }
            }
            if($created_by){
                $users_created_by = Log::select('target_id')->where('logs.action','created')->where('logs.category','user')->where('portal_user_id',$created_by)->get()->pluck('target_id')->toArray();
                if(count($users_created_by) > 0){
                    $query->whereIn('id', $users_created_by);
                }
            }

            if($phone){
                $phoneformat1 = str_replace('-', '', $phone);
                $phoneformat2 = '+1'.str_replace('-', '', $phone);
                $phoneformat3 = '+1'.$phone;
                $phoneformat4 = $phone;

                $query->where( function($query) use ($phoneformat1,$phoneformat2,$phoneformat3,$phoneformat4) {
                    return $query->where('phone', 'LIKE', '%'.$phoneformat1.'%')
                    ->orWhere('phone', 'LIKE', '%'.$phoneformat2.'%')
                    ->orWhere('phone', 'LIKE', '%'.$phoneformat3.'%')
                    ->orWhere('phone', 'LIKE', '%'.$phoneformat4.'%');
                   });
            }
            if ($start_date)
            {
                if(date('Y-m-d', strtotime($start_date)) == date('Y-m-d', strtotime($end_date))) {
                    $start_date = date('Y-m-d', strtotime($start_date));
                    $query->whereDate('created_at', $start_date);
                } else {
                    $start_date = date('Y-m-d', strtotime($start_date. '+1 day'));
                    $end_date = date('Y-m-d', strtotime($end_date.'+1 day'));
                    $query->whereBetween('created_at', [$start_date, $end_date]);
                }
            }
        }

		$num_results_filtered = $query->count();
        $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
        if (isset($filters['order_by'])) {
            $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
            $query = $query->orderBy($filters['order_by'], $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }
        $query = $query->offset($offset)->limit($per_page);
		$users = $query->get();
        foreach( $users as $key => $value){

            $portalUser = PortalUser::select('first_name', 'last_name')->where('email', $value->contact_owner_email)->get()->toarray();
            if( $portalUser &&  $portalUser != '' && count($portalUser) > 0 ){
                $value->contact_owner = $portalUser[0]['first_name'].' '. $portalUser[0]['last_name'];
            } else{
                $value->contact_owner = null;
            }
        }

        $count = $offset;

        $result = new LengthAwarePaginator($users, $num_results_filtered, $per_page, $page);
        $result->setPath(route('users.index'));
        return $result;
    }
    // check string is email or not

    public function checkEmail($email) {
        $find1 = strpos($email, '@');
        $find2 = strpos($email, '.');
        return ($find1 !== false || $find2 !== false || $find2 > $find1);
     }

    /**
     * get user info
     *
     * @param String $user_id
     * @return array
     */

    public function get($user_id)
    {
        $user = Auth::user();
        $result = User::find($user_id);
        if($user->hasRole(Roles::Concierge)) {
            if($result->contact_owner_email != $user->email) {
                return [];
            }
        }
        return $result;
    }

    public function updateContactProperty($user_email, $data){
        $updateData = array(
            "linkedin_profile"=>$data['linkedin_profile'],
            "concierge_source"=>$data['concierge_source'],
            "interview_scheduled"=>$data['interview_scheduled'],
            "sales_license_status"=>$data['sales_license_status'],
            "sales_license"=>$data['sales_license'],
            "intake_questionaire_1"=>$data['intake_questionaire_1'],
            "intake_questionaire_2"=>$data['intake_questionaire_2'],
            "intake_questionaire_3"=>$data['intake_questionaire_3'],
            "w2_sgned_date"=>$data['w2_sgned_date'],
            "onboarded_date"=>$data['onboarded_date'],
            "works_at_dealership"=>$data['works_at_dealership'],
            "physical_sales_license_received"=>$data['physical_sales_license_received'],
            "fico_score"=>$data['fico_score'],
            "hhi"=>$data['hhi'],
            "sex"=>$data['sex'],
        );
        return User::where('email_address', $user_email)
        ->update($updateData);
    }

    /**
     * create user
     *
     * @param Array $data
     * @return array
     */

    public function create($data)
    {
        $portal_user = Auth::user();
        $userSecondaryEmails = $data['secondary_emails'];
        $userSecondaryPhones = implode(',', $data['secondary_phone']);

        unset( $data['secondary_emails']);
        unset( $data['secondary_phone']);
        // $contact = User::create($data);
        // $hubspotContactId = null;
        // if($portal_user->hasRole(Roles::Concierge)) { } else {
        //     $user = PortalUser::where('email', $data['contact_owner_email'])->get();
        //     if($user[0]->hasRole(Roles::Concierge)) { }
        //     else {
        //         // Check if contact exist on hubspot
        //         $contact_user = $this->getHubSpotOwnerIdByEmail($data['email_address'], 'user');
        //         if(count($contact_user) && gettype($contact_user[0]) == 'array' && $contact_user[0]['id']) {
        //             $getResponse = $this->updateHBContact($data);
        //             $hubspotContactId = $contact_user[0]['id'];
        //         } else {
        //             $getResponse = $this->createHBContact($data);
        //             $hubspotContactId = $getResponse['id'];
        //         }
        //     }
        // }
        $data['hubspot_contact_id'] = null;
        $contact = User::create($data);
        $emailData = [];
        foreach ($userSecondaryEmails as $email) {
            $emailData[] = [
                'email' => $email,
                'user_id' => $contact->id,
                'portal_user_id' => $portal_user->id
            ];
        }
        ContactSecondaryEmailModel::insert($emailData);
        $this->addSecondaryPhone($contact->id, $userSecondaryPhones);
        $respose = $this->apiService->registerOrUpdateUserOnSendinblue($data);
        return $contact;
    }

    public function createConciergeUser($data)
    {
        $userData = array();
        $userData['first_name'] = $data['first_name'];
        $userData['last_name'] = $data['last_name'];
        $userData['email_address'] = $data['email'];
        $userData['phone'] = $data['phone'];
        if (in_array(strtolower($data['state']), ['az', 'ca'])) {
            $userData['concierge_state'] = $data['state'];
        }
        $userData['state'] = $data['state'];
        if (array_key_exists("source", $data) && $data['source'] != null) {
            $userData['source'] = $data['source'];
            $userData['concierge_source'] = $data['source'];
        } else {
            $userData['source'] = 3;
            $userData['concierge_source'] = "Web";
        }

        $user = User::where('email_address', $userData["email_address"])->first();
        if (!$user)
        {
            $userData["type"] = 1; // Type 1 means concierge
            if (isset($userData['phone']) && $userData['phone']) {
                $userData['phone'] = $this->formatPhoneNumber($userData['phone']);
            }
            $conciergeOwner = ConciergeContactOwner::first();
            $portal_user = PortalUser::find($conciergeOwner->user_id);
            $userData["contact_owner_email"] = $portal_user->email;
            $userData["source"] = 3; // 3 means it's direct lead coming from website
            $user = User::create($userData);
            $this->apiService->registerOrUpdateUserOnSendinblue($userData);
        } else if ($user->type != 1)
        {
            $user->concierge_state = $userData['state'];
            $user->concierge_source = $userData['concierge_source'];
            $user->type = 1;
            $user->save();
        }

        return $user;
    }

    public function updateUpdatedAt($userId) {
        $user = User::find($userId);
        if ($user) {
            // Update updated_at
            $user->touch();
        }
    }

    /**
     * update user
     *
     * @param Array $data
     * @param String $user_id
     * @return array
     */

    public function update($user_id, $data)
    {
        $portal_user = Auth::user();
        $user = User::find($user_id);
        $secondaryEmails = $data['secondary_emails'];
        $secondaryPhones = $data['secondary_phone'];
        unset( $data['secondary_emails'] );
        unset( $data['secondary_phone'] );

        // if($portal_user->hasRole(Roles::Concierge)) {}
        // else {
        //     $data['source'] = $user->source;
        //     $previous_contact_owner = PortalUser::where('email', $user['contact_owner_email'])->get();
        //     $new_contact_owner = PortalUser::where('email', $data['contact_owner_email'])->get();
        //     // $note = "{$data['first_name']}"." {$data['last_name']}". " was transferred to "."{$new_contact_owner[0]['first_name']} {$new_contact_owner[0]['last_name']}";
        //     if(sizeof($previous_contact_owner) > 0) {
        //         // if($data['type'] == 1) {
        //         //     $data['contact_owner_email'] = "brynn@carblip.com";
        //         // }
        //         if($previous_contact_owner[0]->hasRole(Roles::Concierge) && $new_contact_owner[0]->hasRole(Roles::Concierge)) {

        //         } else if(($previous_contact_owner[0]->hasRole(Roles::Salesperson) || $previous_contact_owner[0]->hasRole(Roles::Manager)) && ($new_contact_owner[0]->hasRole(Roles::Salesperson) || $new_contact_owner[0]->hasRole(Roles::Manager))) {
        //             // $contact_user = $this->getHubSpotOwnerIdByEmail($data['email_address'], 'user');
        //             // if(count($contact_user) && gettype($contact_user[0]) == 'array' && $contact_user[0]['id']) {
        //             //     $this->updateHBContact($data);
        //             //     $this->createDealIfNotExistOnHubspot($contact_user[0]['id'], $data['first_name'], $user_id, $new_contact_owner);
        //             // } else {
        //             //     $hubspot_contact_details = $this->createHBContact($data);
        //             //     $this->createDealIfNotExistOnHubspot($hubspot_contact_details['id'], $data['first_name'], $user_id, $new_contact_owner);
        //             // }
        //         } else if(($previous_contact_owner[0]->hasRole(Roles::Salesperson) || $previous_contact_owner[0]->hasRole(Roles::Manager)) && $new_contact_owner[0]->hasRole(Roles::Concierge)) {
        //             // $res = $this->apiService->createHBContactNotes($data['email_address'], $note);
        //         } else if($previous_contact_owner[0]->hasRole(Roles::Concierge) && ($new_contact_owner[0]->hasRole(Roles::Salesperson) || $new_contact_owner[0]->hasRole(Roles::Manager))) {
        //             // $data['source'] = 3;
        //             // $contact_user = $this->getHubSpotOwnerIdByEmail($data['email_address'], 'user');
        //             // if(count($contact_user) && gettype($contact_user[0]) == 'array' && $contact_user[0]['id']) {
        //                 // $this->updateHBContact($data);
        //             // } else {
        //                 // $this->createHBContact($data);
        //             // }
        //             // $res = $this->apiService->createHBContactNotes($data['email_address'], $note);
        //         }
        //     } else {
        //         if($new_contact_owner[0]->hasRole(Roles::Salesperson) || $new_contact_owner[0]->hasRole(Roles::Manager)) {
        //             // $contact_user = $this->getHubSpotOwnerIdByEmail($data['email_address'], 'user');
        //             // if(count($contact_user) && gettype($contact_user[0]) == 'array' && $contact_user[0]['id']) {
        //                 // $this->updateHBContact($data);
        //                 // $this->createDealIfNotExistOnHubspot($contact_user[0]['id'], $data['first_name'], $user_id, $new_contact_owner);
        //             // } else {
        //                 // $hubspot_contact_details = $this->createHBContact($data);
        //                 // $this->createDealIfNotExistOnHubspot($hubspot_contact_details['id'], $data['first_name'], $user_id, $new_contact_owner);
        //             // }
        //         }
        //     }
        // }
        
        $res = $this->apiService->registerOrUpdateUserOnSendinblue($data);
        $logArray = array(
            'category'      => Logs::User,
            'action'        => UserAction::UPDATED,
            'target_id'     => $user_id,
            'target_type'   => TargetTypes::User,
            'portal_user_id'   => $portal_user->id,
            'portal_user_name' => $portal_user->full_name,
        );
        $this->createUpdateLogs($user,$data,'Contacts',$logArray);
        // $this->updateLogsForUser($data, $user);
        $this->addSecondaryEmail($user_id, $secondaryEmails);
        $this->addSecondaryPhone($user_id, $secondaryPhones);
        $user->update($data);
        return $user;
    }

    /**
     * delete user
     *
     * @param Array $data
     * @param String
     * @return array
     */

    public function delete($user_id)
    {
        $portal_user = Auth::user();
        $user = User::find($user_id);

        if ($user) {
            DB::connection('mysql-user')->table('credit_applications')->where('user_id', $user_id)->delete();
            $result = $user->delete();
        } else {
            $result = false;
        }
        return $result;
    }

    /**
     * delete user
     *
     * @param Array $data
     * @param String
     * @return array
     */

    public function update_source()
    {
        $query = VehicleRequest::select(DB::raw('DISTINCT(user_id)'));
        $user= $query->where('source_utm', '!=', null)->orderby("created_at", 'DESC')->get()->toarray();
            foreach($user as $ur)
            {
             $query_source = VehicleRequest::select(DB::raw('source_utm, created_at'));
             $source_user= $query_source->where('user_id', $ur['user_id'])
             ->where('source_utm', '!=', null)
             ->orderby("created_at", 'asc')->limit(1)->get()->toarray();
                $source_user=reset($source_user);
                 $update_data = array(
                    'source' => $source_user['source_utm']
                );

                $user_update = User::where('id','=', $ur['user_id'])->where('source', '=', null);
                $user_updated=$user_update->update($update_data);

            }
        if ($user_updated) {
            $result = $user_updated;
        } else {
            $result = false;
        }
        return $result;
    }




    /**
     * toggle user
     *
     * @param Array $data
     * @param String
     * @return array
     */

    public function toggle($user_id, $data)
    {
        $portal_user = Auth::user();
        $user = User::find($user_id);
        $is_active = $data['is_active'];
        $update = array(
            'is_active' => $is_active
        );
        $user->update($update);

        return $user;
    }



    /**
     * Get all created by of users
     *
     * @param Array $data
     * @param String
     * @return array
     */
    public function getCreatedBy(){
        $portal_user = Auth::user();
        $portalusers = array();
        $db_name = config('services.database.second');
        // $query = User::select(DB::raw("user.id as user_id"), DB::raw("count(user.id) as count"));
        $query = Log::select('logs.portal_user_id');
        $query->join("{$db_name}.user", "user.id", "=", "logs.target_id",'inner');
        $createdBy = $query->where('logs.action','created')->where('logs.category','user')->groupBy('logs.portal_user_id')->pluck('portal_user_id')->toarray();
        if ($portal_user->hasRole(Roles::Concierge)) {
            $portalusers = PortalUser::select('*')->where('id', $portal_user->id)->get();
        } else {
            if(count($createdBy) > 0){
                $portalusers = PortalUser::select('*')->whereIn('id', $createdBy)->get();
            }
        }

        return $portalusers;
    }


    function sanitizeValue($string) {
        $string = str_replace(' ', '-', $string);
        return preg_replace('/[^A-Za-z0-9\-]/', '', $string);
     }

     public function getuser_reg_chart($filters){

        $portal_user = Auth::user();
        $result = [];
        $db_result = [];
        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();

        $start_d = isset($filter['start_date']) ? $filter['start_date']: null;
        $end_d = isset($filter['end_date']) ? $filter['end_date']: null;
        $source = isset($filter['source']) ? $filter['source']: null;
        $contact_owner = isset($filter['contact_owner']) ? $filter['contact_owner']: null;


        $startDate = date('Y-m-d', strtotime("$start_d")); $endDate = date('Y-m-d', strtotime(" $end_d "));
        $query = User::select(DB::raw('DATE(created_at) as date'),DB::raw('count(*) as count'));

        if($start_d && $end_d)
        {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }


        if(!is_null($source)){
            $source = array_map('intval', explode(',', $source));
            if(!in_array('0', $source)){
                $query->whereIn('source', $source);
            }
        }

        if(!is_null($contact_owner)){
            $contact_owner = array_map('intval',explode(',', $contact_owner));
            if(!in_array('0', $contact_owner)){
                $filtered_portal_users_email = PortalUser::whereIn('id', $contact_owner)->pluck('email');
                $query->whereIn('contact_owner_email', $filtered_portal_users_email);
            }
        }

       return $query->groupBy('date')->get()->toarray();
    }


    public function getContactOwner($filters,$value)
    {
        $portal_user = Auth::user();
        $result = [];
        $db_result = [];
        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();

        $start_d = isset($filter['start_date']) ? $filter['start_date']: null;
        $end_d = isset($filter['end_date']) ? $filter['end_date']: null;
        $source = isset($filter['source']) ? $filter['source']: null;

        $startDate = date('Y-m-d', strtotime("$start_d")); $endDate = date('Y-m-d', strtotime(" $end_d "));

        $db_second = config('services.database.second');

        switch ($value) {
            case 1:
                $query = User::select('contact_owner_email')->whereNotNull('contact_owner_email');
                if($start_d && $end_d)
                {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                }
                if(!is_null($source)){
                    $source = array_map('intval', explode(',', $source));
                    if(!in_array('0', $source)){
                        $query->whereIn('source', $source);
                    }
                }
                $Contactowner =  $query->groupBy('contact_owner_email')->get()->toarray();
                return $this->getcontactOwnerfromPortal($Contactowner);
            break;
            case 'quotes':
                $query = Quote::select("portal_user_id")->whereNotNull("portal_user_id");
                $query->join("{$db_second}.vehicle_requests", 'quotes.request_id', '=', "{$db_second}.vehicle_requests.id");

                    if($start_d && $end_d)
                    {
                        $query->whereBetween('quotes.contract_date', [$startDate, $endDate]);
                    }

                    if(!is_null($source)){
                        $source = array_map('intval', explode(',', $source));
                        if(!in_array('0', $source)){
                            $query->whereIn('vehicle_requests.source_utm', $source);
                        }
                    }

                $contact_owner = $query->groupBy('portal_user_id')->get()->pluck('portal_user_id');
                $filtered_portal_users_email = PortalUser::select('id','email','first_name','last_name')
                ->whereIn('id', $contact_owner)->get()->toarray();
                return $filtered_portal_users_email;
            break;
            case 'wholesalequotes':

                $query = WholeSaleQuote::select("newcar_sale_id")->whereNotNull("newcar_sale_id");
                $query->join("{$db_second}.user", 'wholesale_quote.user_id', '=', "{$db_second}.user.id");
                    if($start_d && $end_d)
                    {
                        $query->whereBetween('sale_date', [$startDate, $endDate]);
                    }

                    if(!is_null($source)){
                        $source = array_map('intval', explode(',', $source));
                        if(!in_array('0', $source)){
                            $query->whereIn('user.source', $source);
                        }
                    }
                $contact_owner = $query->groupBy("newcar_sale_id")->get()->toarray();
                $filtered_portal_users_email = PortalUser::select('id','email','first_name','last_name')
                ->whereIn('id', $contact_owner)->get()->toarray();
                return $filtered_portal_users_email;

            break;
            case 'request':

                $query = VehicleRequest::select("{$db_second}.user.contact_owner_email")->whereNotNull("{$db_second}.user.contact_owner_email");
                $query->join("{$db_second}.user", "{$db_second}.user.id", '=', "{$db_second}.vehicle_requests.user_id");


                    if($start_d && $end_d)
                    {
                        $query->whereBetween('vehicle_requests.created_at', [$startDate, $endDate]);
                        // echo 'yes';
                    }

                    if(!is_null($source)){
                        $source = array_map('intval', explode(',', $source));
                        if(!in_array('0', $source)){
                            $query->whereIn('vehicle_requests.source_utm', $source);
                        }
                    }

                $Contactowner = $query->groupBy("{$db_second}.user.contact_owner_email")->get();
                return $this->getcontactOwnerfromPortal($Contactowner);
            break;

        }

    }

    public function getcontactOwnerfromPortal($Contactowner)
    {
        return PortalUser::select('id','email','first_name','last_name')->whereIn('email', $Contactowner)->get();
    }

    public function checkIfDealExitsInDB($user_id) {
        $deal = VehicleRequest::where('user_id', $user_id)->orderby("created_at", 'desc')->get()->toarray();
        return $deal;
    }

    // public function createDealIfNotExistOnHubspot($hubspot_contact_id, $first_name, $user_id, $new_contact_owner) {
    //     $deals = $this->checkIfDealExitsInDB($user_id);
    //     if(!empty($deals)) {
    //         $hubspot_deals = $this->getHubSpotDealAssociatedWithContactById($hubspot_contact_id);
    //         if(empty($hubspot_deals)) {
    //             // Create deal on hubspot
    //             $deal = $deals[0];
    //             $assigned_contact_owner = $new_contact_owner->toarray();
    //             $contact_owner = $assigned_contact_owner[0]['email'];
    //             $this->getDealsDetails($deal['id'], $first_name, $contact_owner, $hubspot_contact_id);
    //         }
    //     }
    // }

    // public function getDealsDetails($deal_id, $first_name, $contact_owner, $hubspot_contact_id) {
    //     $db_second = getenv('DB_DATABASE_SECOND');
    //     $query = DB::table("{$db_second}.vehicle_requests")->select(DB::raw("{$db_second}.vehicles.*,{$db_second}.vehicle_requests.*,
    //     {$db_second}.brands.name as brand_name, {$db_second}.models.name as model_name"));
    //     $query->join("{$db_second}.vehicles", "{$db_second}.vehicle_requests.vehicle_id", "=", "{$db_second}.vehicles.id");
    //     $query->join("{$db_second}.brands", "{$db_second}.vehicles.brand_id", "=", "{$db_second}.brands.id");
    //     $query->join("{$db_second}.models", "{$db_second}.vehicles.model_id", "=", "{$db_second}.models.id");
    //     $query->where("{$db_second}.vehicle_requests.id", $deal_id);
    //     $query->orderBy("{$db_second}.vehicle_requests.created_at", 'desc');
    //     $dealInfo = $query->get();
    //     if(!empty($dealInfo) && !empty($dealInfo[0])) {
    //         $dealInfo = $dealInfo[0];
    //         $payload = array(
    //             "dealstage_id"=> $dealInfo->deal_stage,
    //             "first_name" => $first_name,
    //             "brand" => $dealInfo->brand_name,
    //             "make"  => $dealInfo->brand_name,
    //             "model" => $dealInfo->model_name,
    //             "trim"  => $dealInfo->trim,
    //             "source_utm"    => $dealInfo->source_utm,
    //             "contact_owner_email"   => $contact_owner,
    //             "request_type"  => $dealInfo->request_type,
    //             "price_type"    => $dealInfo->price_type,
    //             "buying_method" => $dealInfo->buying_method,
    //             "buying_time"   => $dealInfo->buying_time,
    //             "option_preferences"    => "",
    //             "request_id"    => $dealInfo->id,
    //             "universal_url" => "",
    //             "year"  => $dealInfo->year,
    //             "credit_score_txt"  => "",
    //             "msrp_org"  => "",
    //             "model_number" => $dealInfo->model_id,
    //             "referral_code" => $dealInfo->referral_code
    //         );

    //         // $deal_response = $this->createHBDeal($payload);
    //         if($deal_response['id']) {
    //             $this->associateDealWithContact($deal_response['id'], $hubspot_contact_id);
    //         }
    //     }
    // }


    function updateLogsForUser($user, $old_data) {
        $portal_user = Auth::user();
        $old_data = $old_data->toArray();
        $new_data = collect($user);
        $old_data = collect($old_data);
        $diff = $new_data->diff($old_data);
        $update =[
            'id' => $old_data['id'],
            'name' => "{$user['first_name']} {$user['last_name']}"
        ];

        $msg = "<b>{$old_data['first_name']} {$old_data['last_name']}</b>'s ";
        if(isset($diff->toArray()['first_name'])){
            $msg .= "first name was <b>updated</b> from {$old_data['first_name']} to ";
            $update['first_name'] = $user['first_name'];
            $msg .= "<b>{$update['first_name']}</b>, ";
        }
        if(isset($diff->toArray()['last_name'])){
            $msg .= "last name was <b>updated</b> from {$old_data['last_name']} to ";
            $update['last_name'] = $user['last_name'];
            $msg .= "<b>{$update['last_name']}</b>, ";
        }
        if(isset($diff->toArray()['phone'])){
            $msg .= "phone was <b>updated</b> from {$old_data['phone']} to ";
            $update['phone'] = $user['phone'];
            $msg .= "<b>{$update['phone']}</b>, ";
        }
        if(isset($diff->toArray()['email_address'])){
            $msg .= "email address was <b>updated</b> from {$old_data['email_address']} to ";
            $update['email_address'] = $user['email_address'];
            $msg .= "<b>{$update['email_address']}</b>, ";
        }
        if(isset($diff->toArray()['contact_owner_email'])){
            $msg .= "contact owner email was <b>updated</b> from {$old_data['contact_owner_email']} to ";
            $update['contact_owner_email'] = $user['contact_owner_email'];
            $msg .= "<b>{$update['contact_owner_email']}</b>, ";
        }
        if(isset($diff->toArray()['phone_preferred_contact'])){
            $msg .= "phone preferred contact was <b>updated</b> from {$old_data['phone_preferred_contact']} to ";
            $update['phone_preferred_contact'] = $user['phone_preferred_contact'];
            $msg .= "<b>{$update['phone_preferred_contact']}</b>, ";
        }
        if(isset($diff->toArray()['phone_preferred_time'])){
            $msg .= "phone preferred time was <b>updated</b> from {$old_data['phone_preferred_time']} to ";
            $update['phone_preferred_time'] = $user['phone_preferred_time'];
            $msg .= "<b>{$update['phone_preferred_time']}</b>, ";
        }
        if(isset($diff->toArray()['phone_preferred_type'])){
            $msg .= "phone preferred type was <b>updated</b> from {$old_data['phone_preferred_type']} to ";
            $update['phone_preferred_type'] = $user['phone_preferred_type'];
            $msg .= "<b>{$update['phone_preferred_type']}</b>, ";
        }
        if(isset($diff->toArray()['street_address'])){
            $msg .= "street address was <b>updated</b> from {$old_data['street_address']} to ";
            $update['street_address'] = $user['street_address'];
            $msg .= "<b>{$update['street_address']}</b>, ";
        }
        if(isset($diff->toArray()['city'])){
            $msg .= "city was <b>updated</b> from {$old_data['city']} to ";
            $update['city'] = $user['city'];
            $msg .= "<b>{$update['city']}</b>, ";
        }
        if(isset($diff->toArray()['state'])){
            $msg .= "state was <b>updated</b> from {$old_data['state']} to ";
            $update['state'] = $user['state'];
            $msg .= "<b>{$update['state']}</b>, ";
        }
        if(isset($diff->toArray()['zip'])){
            $msg .= "zip was <b>updated</b> from {$old_data['zip']} to ";
            $update['zip'] = $user['zip'];
            $msg .= "<b>{$update['zip']}</b>, ";
        }
        if(isset($diff->toArray()['type'])){
            $msg .= "type was <b>updated</b> from {$old_data['type']} to ";
            $update['type'] = $user['type'];
            $msg .= "<b>{$update['type']}</b>, ";
        }
        if(isset($diff->toArray()['concierge_state'])){
            $msg .= "concierge state was <b>updated</b> from {$old_data['concierge_state']} to ";
            $update['concierge_state'] = $user['concierge_state'];
            $msg .= "<b>{$update['concierge_state']}</b>, ";
        }
        if(isset($diff->toArray()['over18'])){
            $msg .= "over18 was <b>updated</b> from {$old_data['over18']} to ";
            $update['over18'] = $user['over18'];
            $msg .= "<b>{$update['over18']}</b>, ";
        }

        $msg = substr(trim($msg), 0, -1);
        $msg .= " by <b>{$portal_user->full_name}</b>";

        if ($diff->count())
        {
            $diff = $diff->merge([
                'id' => $portal_user->id,
                'name' => $portal_user->full_name,
            ]);

            Log::create(array(
                'category'      => Logs::User,
                'action'        => UserAction::UPDATED,
                'target_id'     => $old_data['id'],
                'target_type'   => TargetTypes::User,
                'portal_user_id'   => $portal_user->id,
                'portal_user_name' => $portal_user->full_name,
                // 'content'       => json_encode($update),
                'content'       => $msg,
            ));
        }
    }

    function getWorkflowsNotEnrolledByUser($userId) {
        return HubspotWorkFlows::whereNotExists(function ($query) use ($userId) {
            $query->select(DB::raw(1))
            ->from('workflow_event_history as weh')
            ->whereRaw('weh.workflow_id = hubspot_workflow.id')
            ->whereRaw('weh.enrollment = hubspot_workflow.enrollment_count')
            ->where('weh.user_id', $userId);
        })->where('is_active', 0)->get();
    }

    function formatPhoneNumber($phoneNumber)
    {
        // Remove all non-numeric characters from the phone number
        $phoneNumber = preg_replace('/\D/', '', $phoneNumber);
        // Check if the phone number starts with '1' (indicating the US country code)
        // or if it's 10 digits long, which is a typical US phone number format
        if (substr($phoneNumber, 0, 1) !== '1' && strlen($phoneNumber) === 10) {
            // If it doesn't start with '1' and it's 10 digits long,
            // assume it's a US number and prepend the country code +1
            $phoneNumber = '+1' . $phoneNumber;
        } else if (substr($phoneNumber, 0, 1) == '1') {
            $phoneNumber = '+1' . substr($phoneNumber, 1);
        }
        // Return the formatted phone number
        return $phoneNumber;
    }

    public function addSecondaryEmail($userId,$secondaryEmail){
        $secondaryEmail = explode(',',$secondaryEmail);
        $portalUser = Auth::user();
        $contactSecondaryEmailModel = new ContactSecondaryEmailModel();
        $contactSecondaryEmailModel->where('user_id', $userId)->delete();
        $emailData = [];
        foreach ($secondaryEmail as $email) {
            $emailData[] = [
                'email' => $email,
                'user_id' => $userId,
                'portal_user_id' => $portalUser->id
            ];
        }
        $contactSecondaryEmailModel->insert($emailData);
        return $contactSecondaryEmailModel->where('user_id', $userId)->get();
    }
    
    public function addSecondaryPhone($userId,$secondaryPhone){
        $secondaryPhone = explode(',',$secondaryPhone);
        $portalUser = Auth::user();
        $ContactSecondaryPhoneModel = new ContactSecondaryPhoneModel();
        $ContactSecondaryPhoneModel->where('user_id', $userId)->delete();
        $phoneData = [];
        foreach ($secondaryPhone as $phone) {
            $phoneData[] = [
                'phone' => $this->formatPhoneNumber($phone),
                'user_id' => $userId,
                'portal_user_id' => $portalUser->id
            ];
        }
        $ContactSecondaryPhoneModel->insert($phoneData);
        return $ContactSecondaryPhoneModel->where('user_id', $userId)->get();
    }

    public function checkContactSecondaryEmails($email){
        $contactEmail = User::select('email_address')->where('email_address', $email)->get()->toArray();
        $contactSecondaryEmail = ContactSecondaryEmailModel::select('email')->where('email', $email)->get()->toArray();
        if(empty($contactEmail) && empty($contactSecondaryEmail)){
            return false;
        }else{
            return true;
        }
    }

    public function checkContactSecondaryPhoneNumber($phoneNumber){
        $contactPhoneNumber = User::select('phone')->where('phone', $phoneNumber)->get()->toArray();
        $contactSecondaryPhoneNumber = ContactSecondaryPhoneModel::select('phone')->where('phone', $phoneNumber)->get()->toArray();
        if(empty($contactPhoneNumber) && empty($contactSecondaryPhoneNumber)){
            return false;
        }else{
            return true;
        }
    }
}
