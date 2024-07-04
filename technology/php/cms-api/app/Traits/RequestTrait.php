<?php

namespace App\Traits;
use App\Enums\{CreditScore, CreditScoreValue, BuyingTime, BuyingMethod, SourceUtm};
use App\Http\Resources\{QuoteCollection,QuoteResource};
use App\Model\{PortalUser,PortalDealStage,DealStage};
use Carbon\Carbon;
use App\Traits\PortalDealStageTrait;

trait RequestTrait
{
    use PortalDealStageTrait;

    protected function formatMiles($x)
    {
        if ($x >= 1000) {
            return number_format($x / 1000).'k';
        } else {
            return $x;
        }
    }

    protected function formatSourceUtm($source)
    {
        switch ($source) {
            case 1:
                $source_str = 'Web';
                break;
            case 2:
                $source_str = 'Mobile';
                break;
            case 3:
                $source_str = 'Direct';
                break;
            case 4:
                $source_str = 'CB2';
                break;
            case 5:
                $source_str = 'CB3';
                break;
            case 6:
                $source_str = 'CB2AZ';
                break;
            case 7:
                $source_str = 'JotForm';   
                break; 
            default:
                $source_str = 'Hubspot';
                break;
        }
        return $source_str;
    }

    protected function formatCreditScore($value)
    {
        $keys = CreditScore::getKeys();
        if (isset($keys[$value-1]))
        {
            $key = $keys[$value-1];
            $result = CreditScore::getValue($key) . ' ' . CreditScoreValue::getValue($key);
        } else {
            $result = 'N/A';
        }
        return $result;
    }

    protected function formatBuyTime($value)
    {
        $keys = BuyingTime::getKeys();
        if (isset($keys[$value-1]))
        {
            $key = $keys[$value-1];
            $result = BuyingTime::getValue($key);
        } else {
            $result = 'N/A';
        }
        return $result;
    }

    protected function formatBuyMethod($value)
    {
        $keys = BuyingMethod::getKeys();
        if (isset($keys[$value-1]))
        {
            $key = $keys[$value-1];
            $result = BuyingMethod::getValue($key);
        } else {
            $result = 'N/A';
        }
        return $result;
    }

    protected function formatTerm($request)
    {
        $term_text = '';
        $term = 0;
        $down_payment = '0';
        $annual_milage = '0';
        if ($request->preference)
        {
            $preference = json_decode($request->preference->preferences, true);
            if (isset($preference['user_car_information'])) 
            {
                $user_car_info = $preference['user_car_information'];
                if (isset($user_car_info['term_in_months']))
                {
                    $term = $user_car_info['term_in_months'];
                }
                if (isset($user_car_info['annual_milage']))
                {
                    $annual_milage = $this->formatMiles($user_car_info['annual_milage']);
                }
                if (isset($user_car_info['down_payment']))
                {
                    $down_payment = number_format($user_car_info['down_payment']);
                }
            }
        }

        if ($request->buying_method === 2) {
            $term_text = 'Down: $'.$down_payment.', Term: '.$term.' mo';
        } else if ($request->buying_method === 3) {
            $term_text = 'Term: '.$term.' mo, Mileage: '.$annual_milage.'/year, Down: $'.$down_payment;
        }
        return $term_text;
    }
    /**
     * @return String
     */
    protected function formatVehicleRequest($request)
    {
        $preference = array();
        $exterior_color = [];
        $interior_color = [];
        $options = [];
        $user_id = $request->user? $request->user->id: '';
        $full_name = $request->user? $request->user->full_name: '';
        $first_name = $request->user? $request->user->first_name: '';
        $last_name = $request->user? $request->user->last_name: '';
        $year = $request->vehicle? $request->vehicle->year: '';
        $brand = $request->vehicle? $request->vehicle->brand->name: '';
        $model = $request->vehicle? $request->vehicle->model->name: '';
        $trim = $request->vehicle? $request->vehicle->trim: '';
        $price = $request->total_price;
        $order_number = $request->order_number;
        $request_time = $request->request_made_at;
        $credit_score = $this->formatCreditScore($request->credit_score);
        $buying_time = $this->formatBuyTime($request->buying_time);
        $buying_method = $this->formatBuyMethod($request->buying_method);
        $terms = $this->formatTerm($request);
        $referral_code = $request->referral_code;
        $source_utm = $this->formatSourceUtm($request->source_utm);
        $is_complete = $request->is_complete;
        $portal_user = $request->user && $request->user->portal_user? $request->user->portal_user : null;
        $car_direct_id = $request->car_direct_id? $request->car_direct_id: '';
        $style = $request->style? $request->style: '';
        $vehicle_type = $request->vehicle_type? $request->vehicle_type: '';
        $color_preference = $request->color_preference? $request->color_preference: '';
        $price_comment = $request->price_comment? $request->price_comment: '';
        $finance_method = $request->finance_method? $request->finance_method: '';
        $finance_type = $request->finance_type? $request->finance_type: '';
        $finance_amount = $request->finance_amount? $request->finance_amount: '';
        $provider_id = $request->provider_id? $request->provider_id: '';
        $provider_name = $request->provider_name? $request->provider_name: ''; 
        $deposit_status = $request->deposit_status? $request->deposit_status : '';
        $credit_application_status = $request->credit_application_status? $request->credit_application_status : '';
        $insurance_status = $request->insurance_status? $request->insurance_status : '';
        $send_tradein_form = $request->send_tradein_form? $request->send_tradein_form : '';
        $tradein_acv = $request->tradein_acv? $request->tradein_acv : '';
        $dealId = $request->deal_id? $request->deal_id : '';

        if ($request->preference)
        {
            $preference = json_decode($request->preference->preferences, true);
        }
        if ($request->options)
        {
            foreach($request->options as $item)
            {
                if ($item->option_type == 'Exterior')
                {
                    $exterior_color[] = $item->option_value;
                } else if ($item->option_type == 'Interior')
                {
                    $interior_color[] = $item->option_value;
                } else {
                    $options[] = $item->option_value;
                }
            }
        }
        
        $quotes = new QuoteCollection($request->quotes()->get());

        if($quotes){
            $contract_date = $quotes->pluck('contract_date');
            $sale_date = $quotes->pluck('sale_date');
            $trade_in = isset($sale_date[0]) ? $sale_date[0] : false;
            
            $contract_date = isset($contract_date[0]) ? $contract_date[0] : false;
            if($contract_date){
                $contract_date = Carbon::parse($contract_date);
                $contract_date = date('Y-m-d H:i:s', strtotime($contract_date->timezone('America/Los_Angeles')));
                $closed_won = 1;
                
            }else{
                $closed_won =0;
                $contract_date = NULL;
                
            }
            $trade_in = $trade_in;
        }else{
            $contract_date = NULL;
            $closed_won = 0;
            $trade_in = 0;
        }   
        $hubspotDealStageDetails = $this->getDealStageDetails($request->deal_stage, false);
        $portalDealStageDetails = $this->getDealStageDetails($request->portal_deal_stage, true);
        // dd($request->color_preference);
        $request_time = Carbon::parse($request_time);
        return array(
            'id'                => $request->id,
            'user_id'           => $user_id,
            'first_name'        => $first_name,
            'last_name'         => $last_name,
            'full_name'         => $full_name,
            'year'              => $year,
            'brand'             => $brand,
            'model'             => $model,
            'trim'              => $trim,
            'price'             => $price,
            'order_number'      => $order_number,
            'request_time'      => date('Y-m-d H:i:s', strtotime($request_time->timezone('America/Los_Angeles'))),
            'credit_score'      => $credit_score,
            'buying_time'       => $buying_time,
            'buying_method'     => $buying_method,
            'terms'             => $this->formatTerm($request),
            'referral_code'     => $referral_code,
            'source_utm'        => $source_utm,
            'is_complete'       => $is_complete,
            'contact_owner'     => $portal_user? $portal_user->full_name: '',
            'contact_owner_id'  => $portal_user ? $portal_user->id: null,
            'exterior_color'    => $exterior_color,
            'interior_color'    => $interior_color,
            'options'           => $options,
            'quotes'            => $quotes, 
            'car_direct_id'     => $car_direct_id,
            'style'             => $style,
            'vehicle_type'      => $vehicle_type,
            'color_preference'  => $color_preference,
            'price_comment'     => $price_comment,
            'finance_method'    => $finance_method,
            'finance_type'      => $finance_type,
            'finance_amount'    => $finance_amount,
            'provider_id'       => $provider_id,
            'provider_name'     => $provider_name,
            'closed_won'        => $closed_won,
            'contract_date'     => $contract_date,
            'trade_in'          => $trade_in,
            'deposit_status'    => $deposit_status,
            'credit_application_status' => $credit_application_status,
            'insurance_status'          => $insurance_status,
            'send_tradein_form'         => $send_tradein_form,
            'tradein_acv'               => $tradein_acv,
            'deal_stage'                => $hubspotDealStageDetails->label ?? null,
            'deal_id'                   => $dealId,
            'hubspot_deal_stage_pipeline_name' => $hubspotDealStageDetails->pipeline_name ?? null,
            'portal_deal_stage'         => $request->portal_deal_stage ?? null,
            'portal_deal_stage_name'    => $portalDealStageDetails->label ?? null,
            'deal_id'                   => $dealId,
            'portal_deal_stage_pipeline' => $portalDealStageDetails ? $this->checkPipelineValue($portalDealStageDetails->pipeline) : null,
            'created_at'                => date('Y-m-d H:i:s', strtotime($request->created_at->timezone('America/Los_Angeles'))),
            'updated_at'                => date('Y-m-d H:i:s', strtotime($request->updated_at->timezone('America/Los_Angeles'))),
        );
    }

    protected function getDealStageDetails($stageId,$status)
    {   
        if(!empty($stageId)){
            if($status){
                $result = PortalDealStage::where('id', $stageId)->first();
            }else{
                $result = DealStage::where('stage_id', $stageId)->first();
            }
            if ($result){
                $getDealStageLabel = $result;
            } else {
                $getDealStageLabel = "";
            }
        }else{
            $getDealStageLabel = "";
        }
        return $getDealStageLabel;
        
    }

    /**
     * @return String
     */
    protected function formatVehicleRequestExport($request)
    {
        $preference = array();
        $exterior_color = [];
        $interior_color = [];
        $options = [];
        $first_name = $request->user? $request->user->first_name: '';
        $last_name = $request->user? $request->user->last_name: '';
        $year = $request->vehicle? $request->vehicle->year: '';
        $brand = $request->vehicle? $request->vehicle->brand->name: '';
        $model = $request->vehicle? $request->vehicle->model->name: '';
        $trim = $request->vehicle? $request->vehicle->trim: '';
        $price = $request->total_price;
        $order_number = $request->order_number;
        $request_time = $request->request_made_at;
        $credit_score = $this->formatCreditScore($request->credit_score);
        $buying_time = $this->formatBuyTime($request->buying_time);
        $buying_method = $this->formatBuyMethod($request->buying_method);
        $terms = $this->formatTerm($request);
        $referral_code = $request->referral_code;
        $source_utm = $this->formatSourceUtm($request->source_utm);
        $is_complete = $request->is_complete;
        // $contact_owner = $request->user && $request->user->portal_user? $request->user->portal_user->full_name: '';

        if ($request->preference)
        {
            $preference = json_decode($request->preference->preferences, true);
        }
        if ($request->options)
        {
            foreach($request->options as $item)
            {
                if ($item->option_type == 'Exterior')
                {
                    $exterior_color[] = $item->option_value;
                } else if ($item->option_type == 'Interior')
                {
                    $interior_color[] = $item->option_value;
                } else {
                    $options[] = $item->option_value;
                }
            }
        }
        $request_time = Carbon::parse($request_time);
        return array(
            'first_name'        => $first_name,
            'last_name'         => $last_name,
            'year'              => $year,
            'brand'             => $brand,
            'model'             => $model,
            'trim'              => $trim,
            'exterior_color'    => implode(',', $exterior_color),
            'interior_color'    => implode(',', $interior_color),
            'price'             => $price,
            'order_number'      => $order_number,
            'request_time'      => date('Y-m-d H:i:s', strtotime($request_time->timezone('America/Los_Angeles'))),
            'credit_score'      => $credit_score,
            'buying_time'       => $buying_time,
            'buying_method'     => $buying_method,
            'terms'             => $this->formatTerm($request),
            'referral_code'     => $referral_code,
            'source_utm'        => $source_utm,
            'options'           => implode(',', $options),
            'is_complete'       => $is_complete ? 'Yes': 'No',
            // 'contact_owner'     => $contact_owner,
        );
    }

   

    protected function formatRegisterUserExport($request)
    {  
        return array(
            'first_name'          => $request->first_name,
            'last_name'           => $request->last_name,
            'phone'               => $request->phone,
            'email_address'       => $request->email_address,
            'created_at'          => date('Y-m-d H:i:s', strtotime($request->created_at->timezone('America/Los_Angeles'))),
            'source'              => $this->formatSourceUtm($request->source),
            'contact_owner'       => $this->getContactOwnerName($request->contact_owner_email)
        );
    }

    protected function formatrequestsExport($data)
    {
        return  array(
            'first_name'          => $data->first_name,
            'last_name'           => $data->last_name,
            'phone'               => $data->phone,
            'email_address'       => $data->email_address,
            'year'                => $data->year,
            'brand'               => $data->brand_name,
            'model'               => $data->modelsname,
            'Trim'                => $data->trim,
            'source'              => $this->formatSourceUtm($data->source_utm),
            'created_at'          => date('Y-m-d H:i:s', strtotime($data->created_at->timezone('America/Los_Angeles'))),
            'contact_owner'       => $this->getContactOwnerName($data->contact_owner_email)
        );
    }

   

    protected function formatquotesExport($quotesdata)
    {
        return array(
            'first_name'           => $quotesdata->first_name,
            'last_name'            => $quotesdata->last_name,
            'phone'                => $quotesdata->phone,
            'email_address'        => $quotesdata->email_address,
            'year'                 => $quotesdata->year,
            'make'                 => $quotesdata->make,
            'model'                => $quotesdata->model,
            'trim'                 => $quotesdata->trim,
            'contract_date'        => date('Y-m-d', strtotime($quotesdata->contract_date)),
            'contact_owner'        => $this->getContactOwnerName($quotesdata->contact_owner_email)
        );
    }


    protected function formatquoteRevenueExport($quoterevenuedata)
    {
        return array(
            'first_name'    => $quoterevenuedata->first_name,
            'last_name'     => $quoterevenuedata->last_name,
            'stock_no'      => $quoterevenuedata->stock_no
        ); 
    }

    protected function formatWholeSalequotesExport($wholesalequotesdata)
    {
        return array(
            'first_name'    => $wholesalequotesdata->first_name,
            'last_name'     => $wholesalequotesdata->last_name,
            'year'          => $wholesalequotesdata->year,
            'make'          => $wholesalequotesdata->make,
            'model'         => $wholesalequotesdata->model,
            'sale_date'     => date('Y-m-d', strtotime($wholesalequotesdata->sale_date)),
            'contact_owner' => $this->getContactOwnerName($wholesalequotesdata->contact_owner_email),
        );  
    }

    protected function formatWholeSaleRevenuequoteExport($wholesaleRevenuedata)
    {
        return array(
            'year'                  => $wholesaleRevenuedata->year,
            'make'                  => $wholesaleRevenuedata->make,
            'wholesale_stock_no'   => $wholesaleRevenuedata->wholesale_stock_no
        
        ); 
    }

    protected function formatPurchaseOrderExport($purchaseorderdata)
    {
        return array(
            'description'                  => $purchaseorderdata->description,
            'amount'                  => $purchaseorderdata->amount,
        ); 
    }

    protected function getContactOwnerName($email)
    {
      
        $result = PortalUser::where('email', $email)->first();
        if ($result)
        {
            $getcontactName = $result->first_name.' '.$result->last_name;
        } else {
            $getcontactName = "";
        }
        return $getcontactName;
    }

    protected function formatContactType($type){
        switch ($type) {
            case 1:
                $result = 'Concierge';
                break;
            case 2:
                $result = 'Concierge (Test)';
                break;
            default:
                $result = NUll;
                break;
        }
        return $result;
    }

    // protected function filterDealsBasedOnStageId($deals, $dealId, $page = 1, $perPage = 20){
    //     // $deals = $deals->where('deal_stage', $dealId);
    //     // $dealsResultForMeta = $deals->all();
    //     // $dealsResult = $deals->take(20)->all();
    //     // $lastPage = $totalDeals > 0 ? ceil($totalDeals / $perPage) : 0;
    //     // $dealsArray = [
    //     //     'deals_data' => $dealsResult,
    //     //     'meta_data' => [
    //     //         'total' => count($dealsResultForMeta),
    //     //         'count' => count($dealsResult),
    //     //         'last_page' => count($dealsResult) != 0 ? (round(count($dealsResultForMeta) / 20)-1) : 0
    //     //     ],
    //     // ];
    //     // return $dealsArray;
    //     $offset = ($page - 1) * $perPage;
    //     $perPage = 20;
    //     $deals = $deals->where('deal_stage', $dealId);
    //     $dealsResultForMeta = $deals->all();
    //     $totalDeals = count($dealsResultForMeta);
    //     $lastPage = $totalDeals > 0 ? ceil($totalDeals / $perPage) : 0;
    //     $dealsResult = $deals->take($perPage)->all();

    //     $dealsArray = [
    //         'deals_data' => $dealsResult,
    //         'meta_data' => [
    //             'total' => $totalDeals,
    //             'count' => count($dealsResult),
    //             'last_page' => $lastPage,
    //         ],
    //     ];

    //     return $dealsArray;
    // }

    protected function filterDealsBasedOnStageId($deals, $dealId) {
        // $offset = ($page - 1) * $perPage; 
        // $filteredDeals = $deals->where('deal_stage', $dealId);
        // $totalDeals = $deals->count();

        // $lastPage = $totalDeals > 0 ? ceil($totalDeals / $perPage) : 0;
        // $dealsResult = $filteredDeals->slice($offset, $perPage)->values();
        $dealsResult = $deals[$dealId];
        $dealsArray = [
            'deals_data' => $dealsResult->items(),
            'meta_data' => [
                'total' => $dealsResult->total(),
                // 'count' => count($dealsResult),
                'last_page' => $dealsResult->lastPage(),
            ],
        ];
    
        return $dealsArray;
    }    

    protected function dealStageDummyData(){
        $lebelArray = ['Checkout Abandoned', 'Checkout Pending', 'Checkout Completed', 'Processed', 'Shipped', 'Cancelled'];
        $resultArray = [];
        $idCounter = 1;
        foreach ($lebelArray as $key => $value) {
            $resultArray[$key]['id'] =  $idCounter++;
            $resultArray[$key]['stage_id'] = null;
            $resultArray[$key]['label'] = $value;
            $resultArray[$key]['deals'] = [];
            $resultArray[$key]['total_deals'] = 0;
            $resultArray[$key]['deals_meta'] = [];
        }
        return collect($resultArray);
    }

    



}
