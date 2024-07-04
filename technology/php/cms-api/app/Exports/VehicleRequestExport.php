<?php

namespace App\Exports;

use Illuminate\Database\Eloquent\Builder;
use App\Model\{VehicleRequest, PortalUser, VBrand,VModel,Quote, User,Vehicle};
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;
use Auth;
use App\Enums\{Roles, Logs, TargetTypes, PortalAction};
use App\Http\Resources\VehicleRequestExportResource;
use Carbon\Carbon;

class VehicleRequestExport implements FromCollection, WithHeadings
{
    use Exportable;

    /**
     * @var token_obj
     */

    private $token_obj;

    public function __construct($token_obj)
    {
        $this->token_obj = $token_obj;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    
    public function collection()
    {
        $result = [];
        $db_result = [];
        $portal_user = $this->token_obj->portal_user;
        $filters = json_decode($this->token_obj->filter, true);
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
            $users_array = PortalUser::where('location_id', $portal_user->location_id)->pluck('email')->toArray();  
            $query = $query->whereHas('user', function (Builder $in_query) use($users_array) {
                $in_query->whereIn('contact_owner_email', $users_array)->orWhereNull('contact_owner_email');
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
        set_time_limit(0);
        $requests = $query->get();
        return VehicleRequestExportResource::collection($requests);
    }


    public function headings(): array
    {
        return [
            'First Name',
            'Last Name',
            'Year',
            'Brand',
            'Model',
            'Trim',
            'Exterior Color',
            'Interior Color',
            'MSRP',
            'Order/Request Number',
            'Request Time',
            'Self Assessed Credit Score',
            'Purchase timeframe',
            'Purchase preference',
            'Terms',
            'Referral Code',
            'Source',
            'Options',
            'Incomplete Request',
            'Deal Assigned to'
        ];
    }
}
