<?php

namespace App\Exports;
use App\Model\{User,Quote,VehicleRequest,PortalUser};
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;
use App\Http\Resources\QuotesExportResource;
use Illuminate\Support\Facades\DB;
use Auth;
use Carbon\Carbon;

class QuotesExport implements FromCollection, WithHeadings
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
        $query = Quote::select('*','user.phone','user.email_address','user.contact_owner_email','vehicles.trim');
        $query->join("{$db_second}.vehicle_requests", 'quotes.request_id', '=', "{$db_second}.vehicle_requests.id");
        $query->join("{$db_second}.user", "{$db_second}.user.id", '=', "{$db_second}.vehicle_requests.user_id");
        $query->join("{$db_second}.vehicles", "{$db_second}.vehicles.id", '=', "{$db_second}.vehicle_requests.vehicle_id");

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

            if($contact_owner)
            {   $contact_owner = array_map('intval',explode(',', $contact_owner));
                $filtered_portal_users_email = PortalUser::whereIn('id', $contact_owner)->pluck('email');
                $query->whereIn('user.contact_owner_email', $filtered_portal_users_email);
            }

         $getdata =  $query->get();
         return QuotesExportResource::collection($getdata);
        
    }

    public function headings(): array
    {
        return [
            'First name',
            'Last name',
            'Phone number',
            'Email address',
            'Year',
            'Make',
            'Model',
            'Trim',
            'Contract date',
            'Contact owner'
        ];
    }


}
