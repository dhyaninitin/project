<?php

namespace App\Exports;
use App\Model\{User,PortalUser,VehicleRequest};
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;
use App\Http\Resources\RequestsExportResource;
use Illuminate\Support\Facades\DB;
use Auth;
use Carbon\Carbon;


class RequestExport implements FromCollection, WithHeadings
{
    use Exportable;

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

        $filter  = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();
        $start_d = isset($filter['start_date']) ? $filter['start_date']: null;
        $end_d = isset($filter['end_date']) ? $filter['end_date']: null;
        $source = isset($filter['source']) ? $filter['source']: null;
        $contact_owner = isset($filter['contact_owner']) ? $filter['contact_owner']: null;
        $startDate = date('Y-m-d', strtotime(" $start_d ")); $endDate = date('Y-m-d', strtotime(" $end_d "));

        $db_second = getenv('DB_DATABASE_SECOND');
        $query = VehicleRequest::select('*','user.first_name','user.last_name','user.phone','user.email_address','vehicles.year','vehicles.trim','models.name as modelsname','brands.name as brand_name','vehicle_requests.created_at');
        $query->join("{$db_second}.user", "{$db_second}.user.id", '=', "{$db_second}.vehicle_requests.user_id");
        $query->join("{$db_second}.vehicles", "{$db_second}.vehicles.id", '=', "{$db_second}.vehicle_requests.vehicle_id");
        $query->join("{$db_second}.models", "{$db_second}.models.id", '=', "{$db_second}.vehicles.model_id");
        $query->join("{$db_second}.brands", "{$db_second}.brands.id", '=', "{$db_second}.vehicles.brand_id");

        if($start_d && $end_d)
        {
            $requestChart = $query->whereBetween('vehicle_requests.created_at', [$startDate, $endDate]);
        }

        if(!is_null($source)){
            $source = array_map('intval', explode(',', $source));
            if(!in_array('0', $source)){
                $requestChart = $query->whereIn('vehicle_requests.source_utm', $source); 
            }
        }

        if($contact_owner)
        {   
            $contact_owner = array_map('intval',explode(',', $contact_owner));
            $filtered_portal_users_email = PortalUser::whereIn('id', $contact_owner)->pluck('email');
            $requestChart = $query->whereIn('user.contact_owner_email', $filtered_portal_users_email);

        }
        $requests = $requestChart->get();
        return RequestsExportResource::collection($requests);
    }

    public function headings(): array
    {
        return [
            'First name',
            'Last name',
            'Phone number',
            'Email address',
            'Year',
            'Brand Name',
            'Model',
            'Trim',
            'Source',
            'Created date',
            'Contact owner',
        ];

        
    }
}
