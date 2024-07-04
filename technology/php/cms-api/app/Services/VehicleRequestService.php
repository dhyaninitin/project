<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use App\Model\{VehicleRequest, PortalUser, VBrand,VModel,Quote, User,Log, VehicleRequestPreference, WorkflowHistory,HubspotWorkFlows, Vehicle, DealStage};
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use App\Enums\{Roles, Logs, PortalAction, TargetTypes,UserAction};
use App\Traits\{PortalTraits,HubspotTrait};
use App\Services\{ApiService,UserService};
use Auth;



class VehicleRequestService extends AbstractService
{
    use PortalTraits;
    use HubspotTrait;

    /**
     * @var ApiService
     */
    protected $apiService;

    public function __construct(ApiService $apiService, UserService $userService)
    {
        $this->apiService = $apiService;
        $this->userService = $userService;
    }

    /**
     * get request list
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
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';

        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();
        $start_date = isset($filter['start_date']) ? $filter['start_date']: null;
        $end_date = isset($filter['end_date']) ? $filter['end_date']: null;
        $location = isset($filter['location']) ? $filter['location']: null;
        $created_at = isset($filter['created_at']) ? $filter['created_at']: null;
        $year = isset($filter['year']) ? $filter['year']: null;
        $make = isset($filter['make']) ? $filter['make']: null;
        $model = isset($filter['model']) ? $filter['model']: null;
        $source = isset($filter['source']) ? $filter['source']: null;
        $referrals = isset($filter['referrals']) ? $filter['referrals']: null;
        $contact_owner = isset($filter['contact_owner']) ? $filter['contact_owner']: null;
        $dealStagePipeline = isset($filter['deal_stage_pipeline']) ? $filter['deal_stage_pipeline']: null;


        $closedwon = isset($filter['closed_won']) ? $filter['closed_won']: null;
        $db_name = config('services.database.second');
        $db_name1 = config('services.database.first');
        /**
         * Check user role and determin to show all or only location based.
         */
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

        if ( $created_at)
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
            $contact_owner = array_map('intval', explode(',', $contact_owner));

            if(!in_array('0', $contact_owner)) {

                $filtered_portal_users_email = PortalUser::whereIn('id', $contact_owner)->pluck('email');
                $query->whereHas('user', function (Builder $in_query) use($filtered_portal_users_email,$contact_owner) {
                    $in_query->whereIn('contact_owner_email', $filtered_portal_users_email);
                    if(in_array('-1', $contact_owner)){
                        $in_query->orWhereNull('contact_owner_email');
                    }
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
            $query->join("{$db_name}.vehicles", "vehicle_id", "=", "{$db_name}.vehicles.id");
            $query->join("{$db_name}.brands", "{$db_name}.vehicles.brand_id", "=", "{$db_name}.brands.id");
            $query->join("{$db_name}.models", "{$db_name}.vehicles.model_id", "=", "{$db_name}.models.id");
            $query->join("{$db_name}.user", "user_id", "=", "{$db_name}.user.id");
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat({$db_name}.user.first_name, ' ', {$db_name}.user.last_name, ' ', {$db_name}.brands.name, ' ', {$db_name}.models.name, ' ',  {$db_name}.vehicles.trim, ' ', {$db_name}.vehicles.year, ' ', {$db_name}.vehicle_requests.request_made_at, ' ', {$db_name}.vehicle_requests.order_number) like '%{$value}%'");
            }
        }
        if ( $year)
        {
            $query = $query->whereHas('vehicle', function (Builder $in_query) use($year) {
                $in_query->where('year', $year);
            });
        }
        if ( $make )
        {
            $query = $query->whereHas('vehicle', function (Builder $in_query) use($make) {
                $in_query->where('brand_id', $make);
            });
        }
        if ( $model)
        {
            $query = $query->whereHas('vehicle', function (Builder $in_query) use($model) {
                $in_query->where('model_id', $model);
            });
        }

        if(!is_null($source) && $source !== '10')
        {
            if($source == '50'){
                $query->whereNull('source_utm');
            }
            $source = array_map('intval', explode(',', $source));
            if(!in_array('50', $source)){
                $query->whereIn('source_utm', $source);
            } else if(in_array('50', $source) && count($source) > 1) {
                unset( $source[array_search(50, $source )]);
                $query->whereIn('source_utm', $source);
                $query->orWhereNull('source_utm');
            }
        }

        if(!is_null($dealStagePipeline) && $dealStagePipeline !== '10'){
            $dealStagePipelineArray =  explode(',', $dealStagePipeline);
            if(!in_array('10',$dealStagePipelineArray)){
                $dealStage = DealStage::whereIn('pipeline_name', $dealStagePipelineArray)->get()->pluck('stage_id');
                $query->whereIn('deal_stage', $dealStage);
            }
        }

        if ($referrals)
        {
            if($referrals == 'WithRef'){
                $query->where('referral_code', '!=', '');
            }else {
                $query->where('referral_code', '=', '');
            }
        }


        if($closedwon)
        {
            $query->leftJoin("{$db_name1}.quotes", "request_id", "=", "{$db_name}.vehicle_requests.id");
            $query->where('contract_date', '!=', '');
        }

        $num_results_filtered = $query->count();
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

        $query = $query->offset($offset)->limit($per_page);
        $portal_users = $query->get();
        $count = $offset;
        $result = new LengthAwarePaginator($portal_users, $num_results_filtered, $per_page, $page);
        $result->setPath(route('request.index'));

        return $result;
    }

    /**
     * get request item
     *
     * @param Number $request_id
     * @return array
     */

    public function get($request_id)
    {
        $user = Auth::user();
        $request = VehicleRequest::with(['vehicle.brand', 'vehicle.model', 'preference', 'options', 'user.portal_user'])->find($request_id);
        if($user->hasRole(Roles::Concierge)) {
            $query = User::select('contact_owner_email')->where('id', $request->user_id)->where('contact_owner_email', $user->email)->get()->toarray();
            if(empty($query)) {
                return [];
            }
        }
        return $request;
    }

    /**
     * update request item
     *
     * @param Number $request_id
     * @return array
     */

    public function update($request_id, $data)
    {
        $user = Auth::user();
        $request = VehicleRequest::find($request_id);

        $logArray = array(
                        'category'      => Logs::Request,
                        'action'        => PortalAction::UPDATED,
                        'target_id'     => $request_id,
                        'target_type'   => TargetTypes::Request,
                        'portal_user_id'   => $user->id,
                        'portal_user_name' => $user->full_name,
                    );
        $this->createUpdateLogs($request,$data,'Deals',$logArray);
        // $old_data_array = array(
        //     "deposit_status" => $request->deposit_status,
        //     "credit_application_status" => $request->credit_application_status,
        //     "insurance_status" => $request->insurance_status,
        //     "send_tradein_form" => $request->send_tradein_form,
        //     "tradein_acv" => $request->tradein_acv,
        // );

        // $new_Data_array = array(
        //     "deposit_status" => $data['deposit_status'],
        //     "credit_application_status" => $data['credit_application_status'],
        //     "insurance_status" => $data['insurance_status'],
        //     "send_tradein_form" => $data['send_tradein_form'],
        //     "tradein_acv" => $data['tradein_acv'],
        // );
        // $old_data = collect($old_data_array);
        $update_deals = $request->update($data);
        if($update_deals){
            // $new_data = collect($new_Data_array);
            // $diff = $new_data->diff($old_data);
            // $msg = "";
            // if (isset($diff->toArray()['deposit_status'])) {
            //     $deposit_status = $diff->toArray()['deposit_status'];
            //     $msg .= "Deposit status was updated from <b>{$old_data['deposit_status']}</b> to <b>{$deposit_status}</b>, ";
            // }

            // if (isset($diff->toArray()['credit_application_status'])) {
            //     $credit_application_status = $diff->toArray()['credit_application_status'];
            //     $msg .= "Credit application status was updated from <b>{$old_data['credit_application_status']}</b> to <b>{$credit_application_status}</b>, ";
            // }

            // if (isset($diff->toArray()['insurance_status'])) {
            //     $insurance_status = $diff->toArray()['insurance_status'];
            //     $msg .= "Insurance status was updated from <b>{$old_data['insurance_status']}</b> to <b>{$insurance_status}</b>, ";
            // }

            // if (isset($diff->toArray()['send_tradein_form'])) {
            //     $send_tradein_form = $diff->toArray()['send_tradein_form'];
            //     $msg .= "Send trade-in form was updated from <b>{$old_data['send_tradein_form']}</b> to <b>{$send_tradein_form}</b>, ";
            // }

            // if (isset($diff->toArray()['tradein_acv'])) {
            //     $tradein_acv = $diff->toArray()['tradein_acv'];
            //     $msg .= "Trade-in ACV form was updated from <b>{$old_data['tradein_acv']}</b> to <b>{$tradein_acv}</b>, ";
            // }
            // if(!empty($msg)){
            //     Log::create(array(
            //         'category'      => Logs::Request,
            //         'action'        => PortalAction::UPDATED,
            //         'target_id'     => $request_id,
            //         'target_type'   => TargetTypes::Request,
            //         'portal_user_id'   => $user->id,
            //         'portal_user_name' => $user->full_name,
            //         'content'       => $msg
            //     ));
            // }

            return $this->get($request_id);
        }
        return [];
    }

    /**
     * get quote item
     *
     * @param Number $request_id
     * @return array
     */

    public function getQuotes($request_id)
    {
        $quotes = VehicleRequest::find($request_id)->quotes()->get();
        return $quotes;
    }

    /**
     * delete requst item
     *
     * @param Number $request_id
     * @param String
     * @return array
     */

    public function delete($request_id)
    {
        $user = Auth::user();
        $request = VehicleRequest::find($request_id);
        if ($request) {
            $result = $request->delete();
        } else {
            $result = false;
        }
        return $result;
    }

    /**
     * create requst item
     *
     * @param Data $data
     * @return array
     */

    public function create($data)
    {
        $portal_user = Auth::user();
        if($portal_user->hasRole(Roles::Concierge)) {
            $data['create_request_on_hubspot'] = false;
        } else {
            $data['create_request_on_hubspot'] = true;
            $contact_owner_email = User::select('contact_owner_email')->where('id', $data['user_id'])->get()->toArray();
            if(count($contact_owner_email) > 0) {
                if(!empty($contact_owner_email[0]['contact_owner_email'])){
                    $contact_owner_email = $contact_owner_email[0]['contact_owner_email'];
                        $user = PortalUser::where('email', $contact_owner_email)->get();
                        if($user[0]->hasRole(Roles::Concierge)) {
                            $data['create_request_on_hubspot'] = false;
                        }
                        else {
                            $data['create_request_on_hubspot'] = true;
                        }
                }
            }
        }
        $result = $this->apiService->createRequest($data);
        return $result;
    }

    /**
     * get Vehicle requests by user id item
     *
     * @param Number $request_id
     * @return array
     */

    public function getVehicleRequests($user_id,$filters)
    {
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;
        $dataBaseName = config('services.database.second');

        $query = VehicleRequest::select("{$dataBaseName}.vehicle_requests.*")->where('user_id',$user_id);
        $num_results_filtered = $query->count();
        if ($order_by) {
            if($order_by == 'brand'){
                $query->leftJoin("{$dataBaseName}.vehicles", "vehicle_id", "=", "{$dataBaseName}.vehicles.id");
                $query->leftJoin("{$dataBaseName}.brands", "{$dataBaseName}.vehicles.brand_id", "=", "{$dataBaseName}.brands.id");
                $query->orderBy("{$dataBaseName}.brands.name", $order_dir);
            }else if($order_by == 'model'){
                $query->leftJoin("{$dataBaseName}.vehicles", "vehicle_id", "=", "{$dataBaseName}.vehicles.id");
                $query->leftJoin("{$dataBaseName}.models", "{$dataBaseName}.vehicles.model_id", "=", "{$dataBaseName}.models.id");
                $query->orderBy("{$dataBaseName}.models.name", $order_dir);
            }else if($order_by == 'year'){
                $query->leftJoin("{$dataBaseName}.vehicles", "vehicle_id", "=", "{$dataBaseName}.vehicles.id");
                $query->orderBy("{$dataBaseName}.vehicles.year", $order_dir);
            }else {
                $query = $query->orderBy('created_at', 'desc');
            }
        }
        $data = $query->offset($offset)->limit($per_page)->get();
        $count = $offset;

        $result = new LengthAwarePaginator($data, $num_results_filtered, $per_page, $page);
        $result->setPath(route('request.alluser_requests',$user_id));


        return $result;
    }
    public function get_req_data($filters){

        $portal_user = Auth::user();
        $result = [];
        $db_result = [];
        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();

        $start_d = isset($filter['start_date']) ? $filter['start_date']: null;
        $end_d = isset($filter['end_date']) ? $filter['end_date']: null;
        $source = isset($filter['source']) ? $filter['source']: null;
        $contact_owner = isset($filter['contact_owner']) ? $filter['contact_owner']: null;

        $startDate = date('Y-m-d', strtotime("$start_d")); $endDate = date('Y-m-d', strtotime(" $end_d "));

        // $query = VehicleRequest::select(DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") as date'), DB::raw('count(*) as count'));
        $query = VehicleRequest::select(DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") as date'), DB::raw('count(*) as count'));

        if($start_d && $end_d)
        {
            $requestChart = $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        if(!is_null($source)){
            $source = array_map('intval', explode(',', $source));
            if(!in_array('0', $source)){
                $requestChart = $query->whereIn('source_utm', $source);
            }
        }

        if(!is_null($contact_owner)){
           $contact_owner = array_map('intval',explode(',', $contact_owner));
           if(!in_array('0', $contact_owner)){
                $filtered_portal_users_email = PortalUser::whereIn('id', $contact_owner)->pluck('email');
                $requestChart =  $query->whereHas('user', function (Builder $in_query) use($filtered_portal_users_email) {
                                    $in_query->whereIn('contact_owner_email', $filtered_portal_users_email);
                                });
            }
        }

        return $requestChart->groupBy('date')->get()->toarray();
    }

    public function get_req_years(){
        $portal_user = Auth::user();
        $db_name = config('services.database.second');
        $query = VehicleRequest::select("{$db_name}.vehicles.year");
        if ($portal_user->hasRole([Roles::Salesperson]) || $portal_user->hasRole([Roles::Concierge]))
        {
            $query = $query->whereHas('user', function (Builder $in_query) use($portal_user) {
                $in_query->where('contact_owner_email', $portal_user->email);
            });
        }
        else if (!$portal_user->hasRole([Roles::SuperAdmin, Roles::Admin, Roles::Administrative]))
        {
            $query = $query->whereHas('user', function (Builder $in_query) use($portal_user) {
                $in_query->where('contact_owner_email', $portal_user->email);
            });
        }
        $query->join("{$db_name}.vehicles", "vehicle_id", "=", "{$db_name}.vehicles.id");
        $reg_chart = $query->groupBy("{$db_name}.vehicles.year")->orderby("{$db_name}.vehicles.year",'Asc')->get();
        return $reg_chart;
    }

    public function getAllRequestBrandsByYear($filters){
        $portal_user = Auth::user();
        $db_name = config('services.database.second');
        $query = VehicleRequest::select("{$db_name}.vehicles.brand_id");
        if ($portal_user->hasRole([Roles::Salesperson]) || $portal_user->hasRole([Roles::Concierge]))
        {
            $query = $query->whereHas('user', function (Builder $in_query) use($portal_user) {
                $in_query->where('contact_owner_email', $portal_user->email);
            });
        }
        else if (!$portal_user->hasRole([Roles::SuperAdmin, Roles::Admin, Roles::Administrative]))
        {
            $query = $query->whereHas('user', function (Builder $in_query) use($portal_user) {
                $in_query->where('contact_owner_email', $portal_user->email);
            });
        }

        $query->join("{$db_name}.vehicles", "vehicle_id", "=", "{$db_name}.vehicles.id")->where('vehicles.year',$filters['year']);
        $reg_chart = $query->groupBy("{$db_name}.vehicles.brand_id")->orderby("{$db_name}.vehicles.brand_id",'Asc')->get()->pluck('brand_id')->toArray();

        $brand_query = VBrand::select('*')->whereIn('id',$reg_chart);

        $brands = $brand_query->get();
        return $brands;
    }


    public function getAllRequestMadeByBrandsAndYear($filters){
        $portal_user = Auth::user();
        $db_name = config('services.database.second');
        $query = VModel::select("*");
        $query->where('brand_id',$filters['brand_id'])->where('year',$filters['year'])->orderby('name','Asc');
        $brands = $query->get();
        return $brands;
    }
    public function getAllRequestSources($filters){
        $portal_user = Auth::user();
        $db_name = config('services.database.second');
        $query = VehicleRequest::select("{$db_name}.vehicle_requests.source_utm");
        if ($portal_user->hasRole([Roles::Salesperson]) || $portal_user->hasRole([Roles::Concierge])) {
            $query = $query->whereHas('user', function (Builder $in_query) use($portal_user) {
                $in_query->where('contact_owner_email', $portal_user->email);
            });
        } else if (!$portal_user->hasRole([Roles::SuperAdmin, Roles::Admin, Roles::Administrative,Roles::Manager])) {
            $query = $query->whereHas('user', function (Builder $in_query) use($portal_user) {
                $in_query->where('contact_owner_email', $portal_user->email);
            });
        }
        $sources = $query->groupBy('source_utm')->get()->pluck('source_utm')->toArray();
        return $sources;
    }

    function getWorkflowsNotEnrolledByDeal($dealId) {
        $workflowsEnrolled = WorkflowHistory::where('deal_id', $dealId)->groupBy('workflow_id')->get()->pluck('workflow_id')->toArray();
        return HubspotWorkFlows::select( "*" )->whereNotIn('id', $workflowsEnrolled)->where( 'is_active', 0 )->get();
    }

    // public function syncDealsFromHubspot($payload){
    //     $dealPayload = [
    //         "user_id" => $payload['user_id'],
    //         "is_complete" => true,
    //         "request_type" => 1,
    //         "source_utm" => null,
    //     ];
    //     $getContactDetails = User::find($payload['user_id']);
    //     $contactUser = $this->getHubSpotOwnerIdByEmail($getContactDetails->email_address, 'user');
    //     if(count($contactUser) && gettype($contactUser[0]) == 'array' && $contactUser[0]['id']) {
    //         $hubspotDeal = $this->getHubSpotDealAssociatedWithContactById($contactUser[0]['id']);

    //         foreach ($hubspotDeal as $value) {
    //             $isVehicleExist = VehicleRequest::where('deal_id', $value['id'])->get();
    //             if($isVehicleExist->isEmpty()) {
    //                 $hubspotDealDetails = $this->getHubSpotDeals($value['id']);              
    //                 $dealPayload['dealId'] = $hubspotDealDetails['dealId'];
    //                 $getVehicleDetails = Vehicle::select('id')->where('trim',$hubspotDealDetails['properties']['trim']['value']);
    //                 $getVehicleDetails->where('friendly_model_name',$hubspotDealDetails['properties']['model']['value']);
    //                 $vehicleResult = $getVehicleDetails->where('year',$hubspotDealDetails['properties']['year']['value'])->first();
        
    //                 $checkVehicleDetails = VehicleRequest::where('vehicle_id',$vehicleResult->id)->where('deal_id',$hubspotDealDetails['dealId'])->get();
                    
    //                 if($checkVehicleDetails->isEmpty()){
    //                     $dealPayload['vehicle_id'] = $vehicleResult->id;
    //                     $dealPayload['deal_stage'] = $hubspotDealDetails['properties']['dealstage']['value'];
    //                     $message = $hubspotDealDetails['properties']['make']['value'].' '.$hubspotDealDetails['properties']['model']['value'].' '.$hubspotDealDetails['properties']['year']['value'].' '.$hubspotDealDetails['properties']['trim']['value'];
    //                     $message .= ' synced from HubSpot for '.$getContactDetails->first_name.' '.$getContactDetails->last_name;
    //                     $message .= ' was assigned to <b>'.$getContactDetails->contact_owner_email. '</b> deal owner on ';
    //                     $result = $this->storeDeals($dealPayload);
    //                     $this->createLogs(Logs::Request,PortalAction::CREATED,$result->id,TargetTypes::Request,$payload['portal_user_id'] = Null,$payload['portal_user_name']= Null,$message); 
    //                     return true;
    //                 }
    //             }   
    //         }
    //     }
    //     return true;
    // }

    public function createDeals($payload){
        try {
            $storeDeal = $this->storeDeals($payload);
            return $storeDeal;
        } catch (\Exception $e) {
            return false;
        }
    }


    public function workflowCreateDealAction($payload){
        try {
            $storeDeal = $this->storeDeals($payload);
            if($payload['contact_owner'] != $payload['existing_contact_owner']){
                User::where('id', $storeDeal->user_id)->update(['contact_owner_email' => $payload['contact_owner']]);
                // Create Logs when contact owner change
                $message = "contact owner email was updated from ".$payload['existing_contact_owner']." to ".$payload['contact_owner'];
                $this->createLogs(Logs::User,UserAction::UPDATED,$storeDeal->user_id,TargetTypes::User,$payload['portal_user_id'],$payload['portal_user_name'],$message);
            }
            // if($payload['create_request_on_hubspot'] && $payload['vehicle_id']){
            //     $contactUser = $this->getHubSpotOwnerIdByEmail($payload['user_email'], 'user');
            //     if(!empty($contactUser)){
            //         $this->userService->getDealsDetails($storeDeal->id, $payload['first_name'], $payload['contact_owner'],$contactUser[0]['id']);
            //     }
            // }
            $make = !empty($payload['make']) ? $payload['make']->value : null;
            $model = !empty($payload['model']) ? $payload['model']->value : null;
            $year = ($payload['year'] == -1) ? null : $payload['year'];
            $trim = !empty($payload['trim']) ? $payload['trim']->value : null;
                if($make){
                    $message = $payload['portal_user_name']." created a deal from workflow for a vehicle ".$make." ".$model." ".$year." ".$trim." for ". $payload['user_name'];
                }else{
                    $message = "Deal is created with N/A option from workflow for <b>".$payload['user_name']."</b>";
                }
            $this->createLogs(Logs::Request,PortalAction::UPDATED,$storeDeal->id,TargetTypes::Request,$payload['portal_user_id'],$payload['portal_user_name'],$message);
            return $storeDeal;
        } catch (\Exception $e) {
            return false;
        }
        
    }

    public function createLogs($category,$action,$targetId,$targetType,$portalUserId,$portalUserName,$content){
        Log::create(array(
            'category'      => $category,
            'action'        => $action,
            'target_id'     => $targetId,
            'target_type'   => $targetType,
            'portal_user_id'   => $portalUserId,
            'portal_user_name' => $portalUserName,
            'content'    => $content
        ));
        return true;
    }

    public function storeDeals($payload){
        $dealPreference = VehicleRequestPreference::create(['preferences' => json_encode($payload)]);
        $createDeal = [
            "vehicle_id" => $payload['vehicle_id'] ?? null,
            "user_id" => $payload['user_id'],
            "vehicle_req_preferences_id" => $dealPreference->id,
            "is_complete" => $payload['is_complete'],
            "source_utm" => $payload['source_utm'],
            "request_type" => 1,
            "deal_stage" => $payload['deal_stage'] ?? null,
            "portal_deal_stage" => $payload['portal_deal_stage'] ?? null,
            "deal_id" => $payload['dealId'] ?? null
        ];

        try {
            $storeDeal = VehicleRequest::create($createDeal);
            return $storeDeal;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function HubspotDealStagePipeline($filters){
        $result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $perPage = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $orderBy = isset($filters['order_by']) ? $filters['order_by']: null;
        $orderDir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $perPage;
        $searchValue = isset($filters['search']) ? $filters['search']: '';

        $query = DealStage::select('pipeline_name')->groupBy('pipeline_name');

        $numResultsFiltered = $query->count();

        if($searchValue) {
            $searchValueArray = explode(' ', $searchValue);
            foreach ($searchValueArray as $value) {
                $query->whereRaw("concat(quotes.pipeline_name, ' ') like '%{$value}%'");
            }
        }

        // if ($orderBy) {
        //     $query = $query->orderBy($orderBy, $orderDir);
        // } else {
        //     $query = $query->orderBy('created_at', 'desc');
        // }

        $query = $query->offset($offset)->limit($perPage);
        $dealers = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($dealers, $numResultsFiltered, $perPage, $page);
        $result->setPath(route('request.HubspotDealStagePipeline'));
        return $result;
    }

    public function getBoardViewDeals($data){
        $query = DealStage::select('id','stage_id','label','pipeline_name');
        if($data['deal_stage'] == 'null'){
            $query->where('pipeline_name', $data['pipeline']);
        }else{
            $query->where('stage_id', $data['deal_stage']);
        }
        return $query->get();
    }

    public function getDealsBasedOnStageId($stageIds, $filters){
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $perPage = isset($filters['per_page']) ? $filters['per_page'] : 20;
        $offset = ($page - 1) * $perPage;
        $searchValue = isset($filters['search']) ? $filters['search']: '';
        $filter  = isset($filters['filters']) ? json_decode($filters['filters'], true) : array();

        $source = isset($filter['source']) ? $filter['source']: null;
        $year = isset($filter['year']) ? $filter['year']: null;
        $make = isset($filter['make']) ? $filter['make']: null;
        $model = isset($filter['model']) ? $filter['model']: null;
        $contactOwner = isset($filter['contact_owner']) ? $filter['contact_owner']: null;
        $referrals = isset($filter['referrals']) ? $filter['referrals']: null;
        $closedwon = isset($filter['closed_won']) ? $filter['closed_won']: null;

        $startDate = isset($filter['start_date']) ? $filter['start_date']: null;
        $endDate = isset($filter['end_date']) ? $filter['end_date']: null;

        $firstDataBase = config('services.database.first');
        $dataBase = config('services.database.second');
        
        $query = VehicleRequest::select("{$dataBase}.vehicle_requests.id","{$dataBase}.vehicle_requests.user_id","{$dataBase}.vehicle_requests.deal_stage","{$dataBase}.user.contact_owner_email",
        "{$dataBase}.user.first_name","{$dataBase}.user.last_name","{$dataBase}.vehicles.trim","{$dataBase}.brands.name as brand_name", "{$dataBase}.models.name as models_name");
        $query->leftJoin("{$dataBase}.vehicles", "vehicle_id", "=", "{$dataBase}.vehicles.id");
        $query->leftJoin("{$dataBase}.brands", "{$dataBase}.vehicles.brand_id", "=", "{$dataBase}.brands.id");
        $query->leftJoin("{$dataBase}.models", "{$dataBase}.vehicles.model_id", "=", "{$dataBase}.models.id");
        $query->leftJoin("{$dataBase}.user", "user_id", "=", "{$dataBase}.user.id");
        
        if($searchValue){
            $searchValueArray = explode(' ', $searchValue); 
            foreach ($searchValueArray as $value) {
                $query->whereRaw("concat({$dataBase}.user.first_name, ' ', {$dataBase}.user.last_name) like '%{$value}%'");
            }
        }

        if ( $year){
            $query = $query->whereHas('vehicle', function (Builder $in_query) use($year) {
                $in_query->where('year', $year);
            });
        }

        if ( $make ){
            $query = $query->whereHas('vehicle', function (Builder $in_query) use($make) {
                $in_query->where('brand_id', $make);
            });
        }
        if ( $model){
            $query = $query->whereHas('vehicle', function (Builder $in_query) use($model) {
                $in_query->where('model_id', $model);
            });
        }

        if(!is_null($source) && $source !== '10'){
            if($source == '50'){
                $query->whereNull("{$dataBase}.vehicle_requests.source_utm");
            }
            if(is_string($source)){
                $source = array_map('intval', explode(',', $source));
            }
            
            if(!in_array('50', $source) && !in_array('10', $source)){
                $query->whereIn("{$dataBase}.vehicle_requests.source_utm", $source);
            } else if(in_array('50', $source) && count($source) > 1) {
                unset( $source[array_search(50, $source )]);
                $query->whereIn("{$dataBase}.vehicle_requests.source_utm", $source);
                $query->orWhereNull("{$dataBase}.vehicle_requests.source_utm");
            }
        }

        if ($contactOwner){
            if(is_string($contactOwner)){
                $contactOwner = array_map('intval', explode(',', $contactOwner));
            }
            if(!in_array('0', $contactOwner)) {
                $filteredPortalUsersEmail = PortalUser::whereIn('id', $contactOwner)->pluck('email');
                $query->whereHas('user', function (Builder $in_query) use($filteredPortalUsersEmail,$contactOwner) {
                    $in_query->whereIn('contact_owner_email', $filteredPortalUsersEmail);
                    if(in_array('-1', $contactOwner)){
                        $in_query->orWhereNull('contact_owner_email');
                    }
                });
            }
        }

        if ($referrals){
            if($referrals[0] == 'WithRef'){
                $query->where("{$dataBase}.vehicle_requests.referral_code", '!=', '');
            }else {
                $query->where("{$dataBase}.vehicle_requests.referral_code", '=', '');
            }
        }

        if($closedwon){
            $query->leftJoin("{$firstDataBase}.quotes", "request_id", "=", "{$dataBase}.vehicle_requests.id");
            $query->where("{$firstDataBase}.quotes.contract_date", '!=', '');
        }

        if ($startDate){
            if(date('Y-m-d', strtotime($startDate)) == date('Y-m-d', strtotime($endDate))) {
                $start_date = date('Y-m-d', strtotime($startDate));
                $query->whereDate("{$dataBase}.vehicle_requests.request_made_at", $startDate);
            } else {
                $start_date = date('Y-m-d', strtotime($startDate. '+1 day'));
                $end_date = date('Y-m-d', strtotime($endDate.'+1 day'));
                $query->whereBetween("{$dataBase}.vehicle_requests.request_made_at", [$startDate, $endDate]);
            }
        }
        
        $dataByStage = [];
        foreach ($stageIds as $stageId) {
            $stageQuery = clone $query;
            $stageQuery->where("vehicle_requests.deal_stage", $stageId);
            $stageQuery->orderBy("vehicle_requests.created_at", 'desc');
            $numResultsFiltered = $stageQuery->count();
            $data = $stageQuery->get();
            // Get data for this stage
            $data = $stageQuery->offset($offset)->limit($perPage)->get();
            $result = new LengthAwarePaginator($data, $numResultsFiltered, $perPage, $page);
        
            // Store data for this stage in the associative array
            $dataByStage[$stageId] = $result;
        }
        return $dataByStage;
    }

    public function updateDealStage($data, $dealId){
        $query = VehicleRequest::find($dealId);
        $this->boardViewLogsForDeal($query, $data, $dealId);
        $query->update($data);
        return $query;
    }

    public function boardViewLogsForDeal($dealOldData, $dealNewData, $dealId){
        $portalUser = Auth::user();
        $oldDealStageData = $dealOldData->toArray();
        $newData = collect($dealNewData);
        $oldData = collect($oldDealStageData);
        $diff = $newData->diff($oldData);
        $msg = "";
        if(isset($diff->toArray()['deal_stage'])){
            $msg .= " <b>Deal stage </b> was <b>update</b> from {$this->getDealStage($oldData['deal_stage'], false)} to <b>{$this->getDealStage($newData['deal_stage'], false)}</b>,";
        }
        $msg = substr(trim($msg), 0, -1);
        $msg .= " by <b>{$portalUser->full_name}</b>";

        Log::create(array(
            'category'      => Logs::Request,
            'action'        => PortalAction::UPDATED,
            'target_id'     => $dealId,
            'target_type'   => TargetTypes::Request,
            'portal_user_id'   => $portalUser->id,
            'portal_user_name' => $portalUser->full_name,
            'content'       => $msg,
        ));
        return true;
    }
}
