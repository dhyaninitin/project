<?php


namespace App\Exports;
use App\Model\{PurchaseOrder};
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;
use App\Http\Resources\PurchaseOrderExportResource;
use Illuminate\Support\Facades\DB;
use Auth;
use Carbon\Carbon;

class PurchaseOrderRevenueExport implements FromCollection, WithHeadings
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
        
        $startDate = date('Y-m-d', strtotime(" $start_d ")); $endDate = date('Y-m-d', strtotime(" $end_d "));
        $query = PurchaseOrder::select('*');
        $get_purchase_order_chart = $query->whereBetween('payment_date', [$startDate, $endDate])->get();
        return PurchaseOrderExportResource::collection($get_purchase_order_chart);
    }

    public function headings(): array
    {
        return [
            'description',
            'amount'
        ];
    }
}
