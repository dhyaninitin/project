<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ MDealer };
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use App\Traits\MScanTrait;
use Auth;

class MDealerService extends AbstractService
{
    use MScanTrait;

    /**
     * get active dealers ids
     *
     * @return array
     */

    public function getActiveDealerIds()
    {
        $ids = MDealer::where('is_active', true)
            ->get()
            ->pluck('id');
        return $ids;
    }

   /**
     * get dealer list
     *
     * @return array
     */

    public function getList($filters = array())
    {
        $portal_user = Auth::user();
        $result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';

        $query = MDealer::where('is_active', true);

        if($search_value) {
            $search_value_arr = explode(' ', $search_value);
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE(`name`,''), ' ', COALESCE(`address`,''), ' ', COALESCE(`city`, ''), ' ', COALESCE(`state`, ''), ' ', COALESCE(`zip`, ''), ' ', COALESCE(`phone`, '')) like '%{$value}%'");
            }
        }

        $num_results_filtered = $query->count();
        if ($order_by) {
            switch ($order_by) {
                default:
                    $query = $query->orderBy($order_by, $order_dir);
                    break;
            }
        } else {
            $query = $query->orderBy('name', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $dealers = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($dealers, $num_results_filtered, $per_page, $page);
        $result->setPath(route('mdealers.index'));

        return $result;
    }

    /**
     * get dealer all
     *
     * @return array
     */

    public function getAll($filter)
    {
        $is_active = isset($filters['is_active']) ? $filters['is_active'] : 1;
        return MDealer::where('is_active', $is_active)->get();
    }

    /**
     * create or update dealer
     *
     * @return array
     */

    public function updateOrCreate($data, $is_new = true)
    {
        foreach ($data as $key => $item) {
            $m_activated_at = $item->ActivatedTS? $this->converTStoTimestamp($item->ActivatedTS): null;
            $m_beta_end_at = $item->BetaEndDate? $this->converTStoTimestamp($item->BetaEndDate): null;
            $m_created_at = $item->CreatedTS? $this->converTStoTimestamp($item->CreatedTS): null;
            $m_disabled_at = $item->DisabledTS? $this->converTStoTimestamp($item->DisabledTS): null;
            $api_status = ($item->mScanAPIStatus == 'Live')? true: false;
            MDealer::updateOrCreate(
                array(
                    'id' => $item->Number
                ),
                array(
                    'id' => $item->Number,
                    'account_type' => $item->AccountType,
                    'address' => $item->Address,
                    'city' => $item->City,
                    'monthly_fee' => $item->MonthlyFee,
                    'name' => $item->Name,
                    'phone' => $item->Phone,
                    'state' => $item->State,
                    'zip' => $item->ZIP,
                    'api_status' => $api_status,
                    'is_active' => !$item->Disabled,
                    'm_activated_at' => $m_activated_at,
                    'm_beta_end_at' => $m_beta_end_at,
                    'm_created_at' => $m_created_at,
                    'm_disabled_at' => $m_disabled_at,
                )
            );
        }
        return true;
    }

    /**
     * get dealer item
     *
     * @param Number $dealer_id
     * @return array
     */

    public function get($dealer_id)
    {
        $data = MDealer::find($dealer_id);
        return $data;
    }
}
