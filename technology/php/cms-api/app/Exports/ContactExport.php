<?php

namespace App\Exports;

use Illuminate\Database\Eloquent\Builder;
use App\Model\{User,PortalUser};
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;
use App\Http\Resources\ContactExportResource;
use Auth;
use Carbon\Carbon;
use App\Enums\{Roles, Permissions};
use App\Services\ExportService;

class ContactExport implements FromCollection, WithHeadings
{
    use Exportable;
    /**
     * @var token_obj
     */

    private $token_obj;
    private $exportService;

    public function __construct($token_obj)
    {
        $this->token_obj = $token_obj;
        $this->exportService = new ExportService;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        $filters = json_decode($this->token_obj->filter, true);
        $filters['login_user'] = $this->token_obj->portal_user;
        $result = $this->exportService->contactExports($filters);
        return ContactExportResource::collection($result);
    }


    public function headings(): array
    {
        return [
            'First name',
            'Last name',
            'Phone number',
            'Email address',
            'Contact owner',
            'Source',
            'City',
            'State',
            'Zip',
            'Type',
            'Created date',
            'Updated date',
        ];
    }
}
