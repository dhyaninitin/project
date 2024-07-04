<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{Role, FileToken, VehicleRequest, PortalUser, VBrand,VModel,Quote, User,Vehicle};
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Enums\{Roles, Logs, TargetTypes, PortalAction, Permissions};
use App\Http\Resources\{VehicleRequestExportResource, ContactExportResource};
use Auth;
use Illuminate\Database\Eloquent\Builder;

class ExportService extends AbstractService
{
    

    /**
     * create export token
     *
     * @return array
     */

    public function createExportToken($filters, $type)
    {
        $user = Auth::user();
        $token = Str::random(32);
        $now = Carbon::now();
        $expired_at = $now->addMinute(20);
        $new_item = array(
            'token' => $token,
            'type'  => $type,
            'filter' => json_encode($filters),
            'portal_user_id' => $user->id,
            'expired_at' => $expired_at
        );
        $obj = FileToken::create($new_item);
        return $obj;
    }


    /**
     * get data from expor totken
     *
     * @return array
     */

    public function getDataFromToken($token)
    {
        $obj = FileToken::where('token', $token)
            ->where('expired_at', '>', Carbon::now())
            ->get();
        if (count($obj))
            return $obj[0];
        return null;
    }

    public function dealsExports($filters){
        // $portal_user = Auth::user();
        $result = [];
        $db_result = [];
        $portal_user = $filters['login_user'];
        // $filters = json_decode($token_obj, true);
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $search_value = isset($filters['search']) ? $filters['search']: null;

        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();
        $start_date = isset($filter['start_date']) ? $filter['start_date']: null;
        $end_date = isset($filter['end_date']) ? $filter['end_date']: null;
        $location = isset($filter['location']) ? $filter['location']: null;
        $created_at = isset($filter['created_at']) ? $filter['created_at']: null;

        $contact_owner = isset($filter['contact_owner']) ? $filter['contact_owner']: null;
        $closedwon = isset($filter['closedwon']) ? $filter['closedwon']: null;

        $db_name = getenv('DB_DATABASE_SECOND');
        $db_name1 = getenv('DB_DATABASE');

        $query = VehicleRequest::select("{$db_name}.vehicle_requests.*");

        if ($portal_user->hasRole([Roles::Salesperson]))
        {
            $query = $query->whereHas('user', function (Builder $in_query) use($portal_user) {
                $in_query->where('contact_owner_email', $portal_user->email)->orWhereNull('contact_owner_email');
            });
        } else if ($portal_user->hasRole([Roles::Concierge])) {
            $query = $query->whereHas('user', function (Builder $in_query) use($portal_user) {
                $in_query->where('contact_owner_email', $portal_user->email);
            });
        }
        else if ($portal_user->hasRole([Roles::Manager]))
        {
            $userLocation = empty(json_decode($portal_user->locations)) ? [1] : json_decode($portal_user->locations);
            $userQuery = PortalUser::whereJsonContains('locations', $userLocation);
            if (empty(json_decode($portal_user->locations))) {
                $userQuery->orWhereNull('locations');
            }
            $usersArray = $userQuery->pluck('email')->toArray();
            $query = $query->whereHas('user', function (Builder $in_query) use($usersArray) {
                $in_query->whereIn('contact_owner_email', $usersArray)->orWhereNull('contact_owner_email');
            });
        }
        else if (!$portal_user->hasRole([Roles::SuperAdmin, Roles::Admin, Roles::Administrative]))
        {
            $query = $query->whereHas('user', function (Builder $in_query) use($portal_user) {
                $in_query->where('contact_owner_email', $portal_user->email);
            });
        }

        if ($start_date)
        {    
            if(date('Y-m-d', strtotime($start_date)) == date('Y-m-d', strtotime($end_date))) {
                $start_date = date('Y-m-d', strtotime($start_date));
                $query->whereDate('request_made_at', $start_date);
            } else {
                $start_date = date('Y-m-d', strtotime($start_date. '+1 day'));
                $end_date = date('Y-m-d', strtotime($end_date.'+1 day'));
                $query->whereBetween('request_made_at', [$start_date, $end_date]);
            }  
            
        }

        if ($created_at)
        {
            $query->where('created_at', '=', $created_at); 
        }
        
        if ($location)
        {
            $filtered_portal_users_email = PortalUser::where('location_id', $location)->pluck('email');
            $query->whereHas('user', function (Builder $in_query) use($filtered_portal_users_email) {
                $in_query->whereIn('contact_owner_email', $filtered_portal_users_email);
            });
        }

        if ($contact_owner)
        {    
            $contact_owner = $filter['contact_owner'];
            if(!in_array('0', $contact_owner)){
                $filtered_portal_users_email = PortalUser::whereIn('id', $contact_owner)->pluck('email');
                $query->whereHas('user', function (Builder $in_query) use($filtered_portal_users_email) {
                    $in_query->whereIn('contact_owner_email', $filtered_portal_users_email);
                });
            }
        }

        $year = isset($filter['year']) ? $filter['year']: null;
        $make = isset($filter['make']) ? $filter['make']: null;
        $model = isset($filter['model']) ? $filter['model']: null;
        $source = isset($filter['source']) ? $filter['source']: null;
        $referrals = isset($filter['referrals']) ? $filter['referrals']: null;

        if($search_value) {
            
            $search_value_arr = explode(' ', $search_value);
            $query->join("{$db_name}.vehicle", "vehicle_id", "=", "{$db_name}.vehicles.id");
            $query->join("{$db_name}.brands", "{$db_name}.vehicles.brand_id", "=", "{$db_name}.brands.id");
            $query->join("{$db_name}.models", "{$db_name}.vehicles.model_id", "=", "{$db_name}.models.id");
            $query->join("{$db_name}.user", "user_id", "=", "{$db_name}.user.id");
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat({$db_name}.user.first_name, ' ', {$db_name}.user.last_name, ' ', {$db_name}.brands.name, ' ', {$db_name}.models.name, ' ',  {$db_name}.vehicles.trim, ' ', {$db_name}.vehicles.year, ' ', {$db_name}.vehicle_requests.request_made_at, ' ', {$db_name}.vehicle_requests.order_number) like '%{$value}%'");
            }
        }

        if ($year)
        {
            $query = $query->whereHas('vehicle', function (Builder $in_query) use($year) {
                $in_query->where('year', $year);
            });
        }
        if ($make)
        {
            $query = $query->whereHas('vehicle', function (Builder $in_query) use($make) {
                $in_query->where('brand_id', $make);
            });
        }
        if ($model)
        {
            $query = $query->whereHas('vehicle', function (Builder $in_query) use($model) {
                $in_query->where('model_id', $model);
            });
        }

        if(!empty($source) && !in_array('10', $source))
        {
            if(in_array('50', $source)){
                $query->whereNull('source_utm');
            }
            // $source = array_map('intval', explode(',', $source));
            if(!in_array('50', $source)){
                $query->whereIn('source_utm', $source);
            } else if(in_array('50', $source) && count($source) > 1) {
                unset( $source[array_search(50, $source )]);
                $query->whereIn('source_utm', $source);
                $query->orWhereNull('source_utm');
            }
        }
        
        if ($referrals)
        {
            if(in_array('WithRef', $referrals)){
                $query->where('referral_code', '!=', ''); 
            }else {
                $query->where('referral_code', '=', ''); 
            }
        }
        
        
        if(!is_null($closedwon))
        {
            if($filter['closedwon'] == "closedWon"){
                $query->leftJoin("{$db_name1}.quotes", "request_id", "=", "{$db_name}.vehicle_requests.id");
                $query->where('contract_date', '!=', '');
            }
            
        }
        if ($order_by && !$search_value) {
            if($order_by == 'contact_owner') {
                $query = $query->join("{$db_name}.user", "user_id", "=", "{$db_name}.user.id")->orderBy('contact_owner_email', $order_dir);
            } else if ($order_by == 'contract_date') {
                $query = $query->leftJoin("{$db_name1}.quotes", "request_id", "=", "{$db_name}.vehicle_requests.id")->orderBy("{$db_name1}.quotes.contract_date", $order_dir)->distinct();
            } else if ($order_by == 'year' || $order_by == 'trim' || $order_by == 'brand' || $order_by == 'model') {
                $order_by = $order_by == 'brand' ? 'brand_id' : $order_by;
                $order_by = $order_by == 'model' ? 'model_id' : $order_by;
                $query = $query->join("{$db_name}.vehicles", "vehicle_id", "=", "{$db_name}.vehicles.id")->orderBy($order_by, $order_dir);
            } else if ($order_by == 'first_name') {
                $query = $query->join("{$db_name}.user", "user_id", "=", "{$db_name}.user.id")->orderBy('first_name', $order_dir);
            } else if ($order_by == 'last_name') {
                $query = $query->join("{$db_name}.user", "user_id", "=", "{$db_name}.user.id")->orderBy('last_name', $order_dir);
            } else if ($order_by == 'referral_code') {
                $query = $query->orderBy('referral_code', $order_dir);
            } else if ($order_by == 'source') {
                $query = $query->orderBy('source_utm', $order_dir);
            } else {
                $query = $query->orderBy('created_at', 'desc');
            }
        }

        if ($order_by && $search_value) {
            if($order_by == 'contact_owner') {
                $query->orderBy("{$db_name}.user.contact_owner_email", $order_dir);
            } else if ($order_by == 'contract_date') {
                $query = $query->leftJoin("{$db_name1}.quotes", "request_id", "=", "{$db_name}.vehicle_requests.id")->orderBy("{$db_name1}.quotes.contract_date", $order_dir)->distinct();
            } else if($order_by == 'year' || $order_by == 'trim'){
                $query->orderBy("{$db_name}.vehicles.$order_by", $order_dir);
            } else if($order_by == 'brand'){
                $query->orderBy("{$db_name}.brands.name", $order_dir);
            } else if($order_by == 'model'){
                $query->orderBy("{$db_name}.models.name", $order_dir);
            } else if($order_by == 'first_name' || $order_by == 'last_name'){
                $query->orderBy("{$db_name}.user.$order_by", $order_dir);
            } else if ($order_by == 'referral_code') {
                $query = $query->orderBy('referral_code', $order_dir);
            } else if ($order_by == 'source') {
                $query = $query->orderBy('source_utm', $order_dir);
            } else {
                $query = $query->orderBy('created_at', 'desc');
            }
        }
        // $requests = $query->get();

        $chunkSize = 1000;
        $results = [];

        // Retrieve records in chunks using the chunk method
        $query->chunk($chunkSize, function ($chunkRecords) use (&$results) {
            // Add the chunk records to the results array
            $results = array_merge($results, $chunkRecords->toArray());
        });

        // Convert the results array to a collection
        $resultCollection = collect($results);

        return VehicleRequestExportResource::collection($resultCollection);
    }


    public function dealsExportsCount($filters){
        $result = [];
        $db_result = [];
        $portal_user = $filters['login_user'];
        // $filters = json_decode($token_obj, true);
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $search_value = isset($filters['search']) ? $filters['search']: null;

        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();
        $start_date = isset($filter['start_date']) ? $filter['start_date']: null;
        $end_date = isset($filter['end_date']) ? $filter['end_date']: null;
        $location = isset($filter['location']) ? $filter['location']: null;
        $created_at = isset($filter['created_at']) ? $filter['created_at']: null;

        $contact_owner = isset($filter['contact_owner']) ? $filter['contact_owner']: null;
        $closedwon = isset($filter['closedwon']) ? $filter['closedwon']: null;

        $db_name = getenv('DB_DATABASE_SECOND');
        $db_name1 = getenv('DB_DATABASE');

        $query = VehicleRequest::select("{$db_name}.vehicle_requests.*");

        if ($portal_user->hasRole([Roles::Salesperson]))
        {
            $query = $query->whereHas('user', function (Builder $in_query) use($portal_user) {
                $in_query->where('contact_owner_email', $portal_user->email)->orWhereNull('contact_owner_email');
            });
        } else if ($portal_user->hasRole([Roles::Concierge])) {
            $query = $query->whereHas('user', function (Builder $in_query) use($portal_user) {
                $in_query->where('contact_owner_email', $portal_user->email);
            });
        }
        else if ($portal_user->hasRole([Roles::Manager]))
        {
            $userLocation = empty(json_decode($portal_user->locations)) ? [1] : json_decode($portal_user->locations);
            $userQuery = PortalUser::whereJsonContains('locations', $userLocation);
            if (empty(json_decode($portal_user->locations))) {
                $userQuery->orWhereNull('locations');
            }
            $usersArray = $userQuery->pluck('email')->toArray();
            $query = $query->whereHas('user', function (Builder $in_query) use($usersArray) {
                $in_query->whereIn('contact_owner_email', $usersArray)->orWhereNull('contact_owner_email');
            });
        }
        else if (!$portal_user->hasRole([Roles::SuperAdmin, Roles::Admin, Roles::Administrative]))
        {
            $query = $query->whereHas('user', function (Builder $in_query) use($portal_user) {
                $in_query->where('contact_owner_email', $portal_user->email);
            });
        }

        if ($start_date)
        {    
            if(date('Y-m-d', strtotime($start_date)) == date('Y-m-d', strtotime($end_date))) {
                $start_date = date('Y-m-d', strtotime($start_date));
                $query->whereDate('request_made_at', $start_date);
            } else {
                $start_date = date('Y-m-d', strtotime($start_date. '+1 day'));
                $end_date = date('Y-m-d', strtotime($end_date.'+1 day'));
                $query->whereBetween('request_made_at', [$start_date, $end_date]);
            }  
            
        }

        if ($created_at)
        {
            $query->where('created_at', '=', $created_at); 
        }
        
        if ($location)
        {
            $filtered_portal_users_email = PortalUser::where('location_id', $location)->pluck('email');
            $query->whereHas('user', function (Builder $in_query) use($filtered_portal_users_email) {
                $in_query->whereIn('contact_owner_email', $filtered_portal_users_email);
            });
        }

        if ($contact_owner)
        {    
            $contact_owner = $filter['contact_owner'];
            if(!in_array('0', $contact_owner)){
                $filtered_portal_users_email = PortalUser::whereIn('id', $contact_owner)->pluck('email');
                $query->whereHas('user', function (Builder $in_query) use($filtered_portal_users_email) {
                    $in_query->whereIn('contact_owner_email', $filtered_portal_users_email);
                });
            }
        }

        $year = isset($filter['year']) ? $filter['year']: null;
        $make = isset($filter['make']) ? $filter['make']: null;
        $model = isset($filter['model']) ? $filter['model']: null;
        $source = isset($filter['source']) ? $filter['source']: null;
        $referrals = isset($filter['referrals']) ? $filter['referrals']: null;

        if($search_value) {
            
            $search_value_arr = explode(' ', $search_value);
            $query->join("{$db_name}.vehicle", "vehicle_id", "=", "{$db_name}.vehicles.id");
            $query->join("{$db_name}.brands", "{$db_name}.vehicles.brand_id", "=", "{$db_name}.brands.id");
            $query->join("{$db_name}.models", "{$db_name}.vehicles.model_id", "=", "{$db_name}.models.id");
            $query->join("{$db_name}.user", "user_id", "=", "{$db_name}.user.id");
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat({$db_name}.user.first_name, ' ', {$db_name}.user.last_name, ' ', {$db_name}.brands.name, ' ', {$db_name}.models.name, ' ',  {$db_name}.vehicles.trim, ' ', {$db_name}.vehicles.year, ' ', {$db_name}.vehicle_requests.request_made_at, ' ', {$db_name}.vehicle_requests.order_number) like '%{$value}%'");
            }
        }

        if ($year)
        {
            $query = $query->whereHas('vehicle', function (Builder $in_query) use($year) {
                $in_query->where('year', $year);
            });
        }
        if ($make)
        {
            $query = $query->whereHas('vehicle', function (Builder $in_query) use($make) {
                $in_query->where('brand_id', $make);
            });
        }
        if ($model)
        {
            $query = $query->whereHas('vehicle', function (Builder $in_query) use($model) {
                $in_query->where('model_id', $model);
            });
        }

        if(!empty($source) && !in_array('10', $source))
        {
            if(in_array('50', $source)){
                $query->whereNull('source_utm');
            }
            // $source = array_map('intval', explode(',', $source));
            if(!in_array('50', $source)){
                $query->whereIn('source_utm', $source);
            } else if(in_array('50', $source) && count($source) > 1) {
                unset( $source[array_search(50, $source )]);
                $query->whereIn('source_utm', $source);
                $query->orWhereNull('source_utm');
            }
        }
        
        if ($referrals)
        {
            if(in_array('WithRef', $referrals)){
                $query->where('referral_code', '!=', ''); 
            }else {
                $query->where('referral_code', '=', ''); 
            }
        }
        
        
        if(!is_null($closedwon))
        {
            if($filter['closedwon'] == "closedWon"){
                $query->leftJoin("{$db_name1}.quotes", "request_id", "=", "{$db_name}.vehicle_requests.id");
                $query->where('contract_date', '!=', '');
            }
            
        }
        if ($order_by && !$search_value) {
            if($order_by == 'contact_owner') {
                $query = $query->join("{$db_name}.user", "user_id", "=", "{$db_name}.user.id")->orderBy('contact_owner_email', $order_dir);
            } else if ($order_by == 'contract_date') {
                $query = $query->leftJoin("{$db_name1}.quotes", "request_id", "=", "{$db_name}.vehicle_requests.id")->orderBy("{$db_name1}.quotes.contract_date", $order_dir)->distinct();
            } else if ($order_by == 'year' || $order_by == 'trim' || $order_by == 'brand' || $order_by == 'model') {
                $order_by = $order_by == 'brand' ? 'brand_id' : $order_by;
                $order_by = $order_by == 'model' ? 'model_id' : $order_by;
                $query = $query->join("{$db_name}.vehicles", "vehicle_id", "=", "{$db_name}.vehicles.id")->orderBy($order_by, $order_dir);
            } else if ($order_by == 'first_name') {
                $query = $query->join("{$db_name}.user", "user_id", "=", "{$db_name}.user.id")->orderBy('first_name', $order_dir);
            } else if ($order_by == 'last_name') {
                $query = $query->join("{$db_name}.user", "user_id", "=", "{$db_name}.user.id")->orderBy('last_name', $order_dir);
            } else if ($order_by == 'referral_code') {
                $query = $query->orderBy('referral_code', $order_dir);
            } else if ($order_by == 'source') {
                $query = $query->orderBy('source_utm', $order_dir);
            } else {
                $query = $query->orderBy('created_at', 'desc');
            }
        }

        if ($order_by && $search_value) {
            if($order_by == 'contact_owner') {
                $query->orderBy("{$db_name}.user.contact_owner_email", $order_dir);
            } else if ($order_by == 'contract_date') {
                $query = $query->leftJoin("{$db_name1}.quotes", "request_id", "=", "{$db_name}.vehicle_requests.id")->orderBy("{$db_name1}.quotes.contract_date", $order_dir)->distinct();
            } else if($order_by == 'year' || $order_by == 'trim'){
                $query->orderBy("{$db_name}.vehicles.$order_by", $order_dir);
            } else if($order_by == 'brand'){
                $query->orderBy("{$db_name}.brands.name", $order_dir);
            } else if($order_by == 'model'){
                $query->orderBy("{$db_name}.models.name", $order_dir);
            } else if($order_by == 'first_name' || $order_by == 'last_name'){
                $query->orderBy("{$db_name}.user.$order_by", $order_dir);
            } else if ($order_by == 'referral_code') {
                $query = $query->orderBy('referral_code', $order_dir);
            } else if ($order_by == 'source') {
                $query = $query->orderBy('source_utm', $order_dir);
            } else {
                $query = $query->orderBy('created_at', 'desc');
            }
        }
        return $query->count();
    }

    public function contactExports($filters, $getContactcount = null){
        $result = [];
        $db_result = [];
        $portalUser = $filters['login_user'];
        $orderBy = isset($filters['order_by']) ? $filters['order_by']: 'created_at';
        $searchValue = isset($filters['search']) ? $filters['search']: null;
        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();
        $firstName = isset($filter['first_name']) ? $filter['first_name']: null;
        $lastName = isset($filter['last_name']) ? $filter['last_name']: null;
        $phone = isset($filter['phone']) ? $filter['phone']: null;
        $contactOwner = isset($filter['contact_owner']) ? $filter['contact_owner']: null;
        $startDate = isset($filter['start_date']) ? $filter['start_date']: null;
        $createdBy = isset($filter['created_by']) ? $filter['created_by']: null;
        $endDate = isset($filter['end_date']) ? $filter['end_date']: null;
        $source = isset($filter['source']) ? $filter['source']: null;
        $type = isset($filter['type']) ? $filter['type']: null;

        $query = User::select('*');

		if($searchValue) {
            $searchValueArray = explode(' ', $searchValue);

            foreach ($searchValueArray as $key => $value) {
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

        if ($portalUser->hasPermissionTo(Permissions::ViewLocal)) {

            // When user has Manager Role, Show all users having contact owner as all Portal users under location
            if ($portalUser->hasRole(Roles::Manager)) {
                if(!$searchValue) {
                    $userLocation = empty(json_decode($portalUser->locations)) ? [1] : json_decode($portalUser->locations);
                    $userQuery = PortalUser::whereJsonContains('locations', $userLocation);
                        if (empty(json_decode($portalUser->locations))) {
                            $userQuery->orWhereNull('locations');
                        }
                    $usersArray = $userQuery->pluck('email')->toArray();
                    $query = $query->orWhere(function ($inQuery) use($portalUser, $usersArray) {
                        $inQuery->whereIn('contact_owner_email', $usersArray)->orWhereNull('contact_owner_email');
                    });
                }
                if($searchValue) {
                    $userLocation = empty(json_decode($portalUser->locations)) ? [1] : json_decode($portalUser->locations);
                    $userQuery = PortalUser::whereJsonContains('locations', $userLocation);
                        if (empty(json_decode($portalUser->locations))) {
                            $userQuery->orWhereNull('locations');
                        }
                    $usersArray = $userQuery->pluck('email')->toArray();
                    $query = $query->where(function ($inQuery) use($portalUser, $usersArray) {
                        $inQuery->whereIn('contact_owner_email', $usersArray)->orWhereNull('contact_owner_email');
                    });
                }
            // When user has Salesperson Role, Show all users having contact owner as current salesperson
            } else if ($portalUser->hasRole(Roles::Salesperson)) {
                if(!$searchValue) {
                    $query = $query->orWhere(function ($inQuery) use($portalUser) {
                        $inQuery->where('contact_owner_email', $portalUser->email)->orWhereNull('contact_owner_email');
                    });
                }

                if($searchValue) {
                    $query = $query->where(function ($inQuery) use($portalUser) {
                        $inQuery->where('contact_owner_email', $portalUser->email)->orWhereNull('contact_owner_email');
                    });
                }
            } else if ($portalUser->hasRole(Roles::Concierge)) {
                if(!$searchValue) {
                    $query = $query->orWhere(function ($inQuery) use($portalUser) {
                        $inQuery->where('contact_owner_email', $portalUser->email);
                    });
                }

                if($searchValue) {
                    $query = $query->where(function ($inQuery) use($portalUser) {
                        $inQuery->where('contact_owner_email', $portalUser->email);
                    });
                }
            } else {
                $query = $query->where('contact_owner_email', $portalUser->email);
            }
            if($firstName){
                $query->where('first_name', 'like','%'.$first_name.'%');
            }
            if($lastName){
                $query->where('last_name', 'like','%'.$last_name.'%');
            }
            if($contactOwner){
                if($contactOwner == 'no_owner'){
                    $query->WhereNull('contact_owner_email');
                }else{
                    $query->where('contact_owner_email', 'like','%'.$contactOwner.'%');
                }
            }

            if(!empty($source) && !in_array('10', $source))
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
            if($createdBy){
                $usersCreatedBy = Log::select('target_id')->where('logs.action','created')->where('logs.category','user')->where('portal_user_id',$createdBy)->get()->pluck('target_id')->toArray();
                if(count($usersCreatedBy) > 0){
                    $query->whereIn('id', $usersCreatedBy);
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
            if ($startDate)
            {
                if(date('Y-m-d', strtotime($startDate)) == date('Y-m-d', strtotime($endDate))) {
                    $startDate = date('Y-m-d', strtotime($startDate));
                    $query->whereDate('created_at', $startDate);
                } else {
                    $startDate = date('Y-m-d', strtotime($startDate. '+1 day'));
                    $endDate = date('Y-m-d', strtotime($endDate.'+1 day'));
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                }
            }
        } else {
            if($firstName){
                $query->where('first_name', 'like','%'.$firstName.'%');
            }
            if($lastName){
                $query->where('last_name', 'like','%'.$lastName.'%');
            }
            if($contactOwner){
                if($contactOwner == 'no_owner'){
                    $query->WhereNull('contact_owner_email');
                }else{
                    $query->where('contact_owner_email', 'like','%'.$contactOwner.'%');
                }
            }

            if(!empty($source) && !in_array('10', $source))
            {
                if($source == '50'){
                    $query->whereNull('source');
                }
                // $source = array_map('intval', explode(',', $source));
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
            if($createdBy){
                $usersCreatedBy = Log::select('target_id')->where('logs.action','created')->where('logs.category','user')->where('portal_user_id',$createdBy)->get()->pluck('target_id')->toArray();
                if(count($usersCreatedBy) > 0){
                    $query->whereIn('id', $usersCreatedBy);
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
            if ($startDate)
            {
                if(date('Y-m-d', strtotime($startDate)) == date('Y-m-d', strtotime($endDate))) {
                    $startDate = date('Y-m-d', strtotime($startDate));
                    $query->whereDate('created_at', $startDate);
                } else {
                    $startDate = date('Y-m-d', strtotime($startDate. '+1 day'));
                    $endDate = date('Y-m-d', strtotime($endDate.'+1 day'));
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                }
            }
        }

        $orderDir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
        if (isset($filters['order_by'])) {
            $orderDir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
            $query = $query->orderBy($filters['order_by'], $orderDir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        if($getContactcount){
            return $query->count();
        }else{
            $users = $query->get();
            foreach( $users as $key => $value){
                $portalUser = PortalUser::select('first_name', 'last_name')->where('email', $value->contact_owner_email)->get()->toarray();
                if( $portalUser &&  $portalUser != '' && count($portalUser) > 0 ){
                    $value->contact_owner = $portalUser[0]['first_name'].' '. $portalUser[0]['last_name'];
                } else{
                    $value->contact_owner = null;
                }
            }
            return ContactExportResource::collection($users);
        }
    }

}
