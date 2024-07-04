<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessWorkflowJob;
use Illuminate\Http\Request;
use App\Http\Requests\{ListRequest,CreateVehicleRequest};
use App\Model\VehicleRequest;
use App\Services\{VehicleRequestService, LogService,UserService};
use App\Http\Resources\{VehicleRequestCollection, VehicleRequestResource, LogResource, QuoteCollection, BoardDealsCollection, HubspotDealStagePipelineCollection};
use App\Enums\{Logs, TargetTypes};
use Auth;
use DateTime;
use App\Traits\RequestTrait;
use Carbon\Carbon;

class VehicleRequestController extends Controller
{

    use RequestTrait;
    /**
     * @var VehicleRequestService
     */
    protected $vehicleRequestService;
    protected $userService;

    /**
     * @var LogService
     */
    protected $logService;


    public function __construct(
        VehicleRequestService $vehicleRequestService,
        LogService $logService,
        UserService $userService
    )
    {
        $this->vehicleRequestService = $vehicleRequestService;
        $this->logService = $logService;
        $this->userService = $userService;
    }

    /**
     * Get request list
     *
     * @param  App\Http\Requests\ListRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function index(ListRequest $request)
    {
        $filter = $request->all();
        $result = $this->vehicleRequestService->getList($filter);
        return new VehicleRequestCollection($result);
    }

    /**
     * Return request object
     *
     * @param  App\Model\VehicleRequest  $request
     * @param  Number  $request_id
     * @return \Illuminate\Http\Response
     */
    public function show(VehicleRequest $request)
    {
        $result = $this->vehicleRequestService->get($request->id);
        if(empty($result)) {
            return response()->json([
                'data' => []
            ]);
        }
        return new VehicleRequestResource($result);
    }

    public function update(Request $request,$dealId){
        $data = $request->all();
        $result = $this->vehicleRequestService->update($dealId, $data);
        if($result){
            $workflows = $this->userService->getWorkflowsNotEnrolledByUser($result->user_id);
            $workflowIds = array();
            foreach ($workflows as $workflow)
            {
                array_push($workflowIds, $workflow->id);
            }
            $this->userService->updateUpdatedAt($result->user_id);
            $data = [
                'event' => 'object-updated',
                'workflowIds' => $workflowIds,
                'objectIds' => [$result->user_id]
            ];
            ProcessWorkflowJob::dispatch($data);
        }
        return new VehicleRequestResource($result);
    }

    /**
     * Return quotes list
     *
     * @param  App\Model\VehicleRequest  $request
     * @param  Number  $request_id
     * @return \Illuminate\Http\Response
     */
    public function getQuotes(VehicleRequest $request)
    {
        $result = $this->vehicleRequestService->getQuotes($request->id);
        return new QuoteCollection($result);
    }

    /**
     * Create request info
     *
     * @param  App\Http\Requests\CreateVehicleRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CreateVehicleRequest $request)
    {
        $user = Auth::user();
        $data = $request->all();
        $data['portal_user_name'] = $user->full_name;
        $data['portal_user_id'] = $user->id;

        $result = $this->vehicleRequestService->create($data);
        if ($result)
        {
            $workFlows = $this->userService->getWorkflowsNotEnrolledByUser($result['data']['user_id']);
            $workflowIds = array();
            foreach ($workFlows as $workflow)
            {
                array_push($workflowIds, $workflow->id);
            }
            $data = [
                'event' => 'object-updated',
                'objectIds' => [$result['data']['user_id']],
                'workflowIds' => $workflowIds
            ];
            $this->userService->updateUpdatedAt($result['data']['user_id']);
            ProcessWorkflowJob::dispatch($data);
            return response()->json([
                'message' => 'Request has been successfully created.',
                'data' => $result
            ]);
        }
        else {
            return response()->json([
                'message' => 'Something went wrong, try again.'
            ], 500);
        }

    }

    /**
     * Return request logs
     *
     * @param  VehicleRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function logs(VehicleRequest $request)
    {
        $request_id = $request->id;
        $result = $this->logService->getByCategory(Logs::Request, $request_id);
        return LogResource::collection($result);
    }

    /**
     * Return request delete logs
     *
     * @param  Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function delete_log(Request $request)
    {
        $filter = $request->all();
        $result = $this->logService->getDeleteLogByCategory(Logs::Request, $filter, TargetTypes::Request);
        return LogResource::collection($result);
    }

    /**
     * Delete request object
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $request_id
     */
    public function destroy(VehicleRequest $request)
    {
        $result = $this->vehicleRequestService->delete($request->id);
        if ($result)
        {
            return response()->json([
                'message' => 'Request has been successfully removed.'
            ]);
        }
        else {
            return response()->json([
                'message' => 'Something went wrong, try again.'
            ], 500);
        }
    }
    /**
     * Return user's quotes list by user id
     *
     * @param  App\Model\VehicleRequest  $request
     * @param  Number  $request_id
     * @return \Illuminate\Http\Response
     */
    public function getAllRequestByUserId($user_id,Request $request)
    {
        $result = $this->vehicleRequestService->getVehicleRequests($user_id,$request);
        return new VehicleRequestCollection($result);
        // return new QuoteCollection($result);
    }
    public function requests(Request $request){

        $getreq = $request->all();
        $result = $this->vehicleRequestService->get_req_data($getreq);
        $getContactowner = $this->userService->getContactOwner($getreq,'request');
        if ($result){

            $retn_array=[];
                $final_array=[]; $n=0;
                    foreach($result as $value){
                        $created_at = Carbon::parse($value['date']);
                        $final_array[$n]['date'] = date('F d, Y',strtotime($created_at->timezone('America/Los_Angeles')));
                        $final_array[$n]['count'] = $value['count'];
                        $n++;
                    }
            return response()->json([
                'error'=>false,
                'statusCode'=>200,
                'data'=>[array("chartdata"=>$this->formatAndCountDate($final_array),'contactowner'=>$getContactowner)]
            ]);
        }
        else {
            return response()->json([
                'error'=>false,
                'statusCode'=>200,
                'data'=>[]
            ]);
        }
    }

    public function formatAndCountDate($chartData){
        $countedData = [];
            foreach ($chartData as $data) {
                $date = $data["date"];
                if (isset($countedData[$date])) {
                    $countedData[$date]["count"]++;
                } else {
                    $countedData[$date] = [
                        "date" => $date,
                        "count" => 1
                    ];
                }
            }
        $finalChartData = array_values($countedData);
        return $finalChartData;
    }

    function daycal($start_date,$end_date){
        $datetime1 = new DateTime($start_date);$datetime2 = new DateTime($end_date);
        $interval = $datetime1->diff($datetime2);$elapsedhr= $interval->format('%h');
        $elapsedsec = $interval->format('%s');
        return $elapsed = $interval->format('%a');
    }

    function find_key_value($array, $key, $val){
        foreach ($array as $item){
           if ($item[$key] == $val) return true;
        }
        return false;
    }
    //Get all years in request vehicle
    public function getRequestYears(Request $request){
        $getreq = $request->all();
        $result = $this->vehicleRequestService->get_req_years();
        if ($result){
            $years= array();
            $i = 0;
            foreach($result as $val){
                array_push($years,$val->year);
            }
            return response()->json([
                'error'=>false,
                'statusCode'=>200,
                'data'=>$years,
                'meta'=>[]
            ]);
        }
        else {
            return response()->json([
                'error'=>true,
                'statusCode'=>200,
                'message' => 'No data found',
                'data'=>[],
                'meta'=>[]
            ]);
        }
    }

    //Get all Brands in request vehicle
    public function requestsBrandByYear(Request $request){

        $getreq = $request->all();
        $result = $this->vehicleRequestService->getAllRequestBrandsByYear($getreq);
        if ($result){
            return response()->json([
                'error'=>false,
                'statusCode'=>200,
                'message' => 'Success',
                'data'=>$result,
                'meta'=>[]
            ]);
        }
        else {
            return response()->json([
                'error'=>true,
                'statusCode'=>200,
                'message' => 'No data found',
                'data'=>[],
                'meta'=>[]
            ]);
        }
    }

    //Get all Models by brand and year in request vehicle
    public function requestsModelByYear(Request $request){
        $getreq = $request->all();
        $result = $this->vehicleRequestService->getAllRequestMadeByBrandsAndYear($getreq);
        if ($result){
            return response()->json([
                'error'=>false,
                'statusCode'=>200,
                'message' => 'Success',
                'data'=>$result,
                'meta'=>[]
            ]);
        }
        else {
            return response()->json([
                'error'=>true,
                'statusCode'=>200,
                'message' => 'No data found',
                'data'=>[],
                'meta'=>[]
            ]);
        }
    }

    //Get all sources of requests
    public function allRequestSources(Request $request){
        $getreq = $request->all();
        $result = $this->vehicleRequestService->getAllRequestSources($getreq);
        if ($result){
            $sources= array();
            $i = 0;
            foreach($result as $val){
                $source = $this->formatSourceUtm($val);
                $sources[$i]['id'] = $val?$val:50;
                $sources[$i]['name'] = $source;
                $i++;
            }
            return response()->json([
                'error'=>false,
                'statusCode'=>200,
                'data'=>$sources,
                'meta'=>[]
            ]);
        }
        else {
            return response()->json([
                'error'=>true,
                'statusCode'=>200,
                'data'=>[],
                'meta'=>[]
            ]);
        }
    }

    /**
     * Return logs by targetIds
     *
     * @param  VehicleRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function logsByTargetIds(Request $request)
    {
        $request = $request->all();
        $result = $this->logService->getByCategoryByIds(Logs::Portal, TargetTypes::Quote, $request);
        return LogResource::collection($result);
    }

    public function storeDeal(Request $request)
    {
        $user = Auth::user();
        $data = $request->all();
        $data['portal_user_name'] = $user->full_name;
        $data['portal_user_id'] = $user->id;
        $data['is_complete'] = true;
        $data['source_utm'] = 3;
        $data['deal_stage'] = $data['dealstage_id'];
        $result = $this->vehicleRequestService->createDeals($data);
        if ($result){
            $workFlows = $this->userService->getWorkflowsNotEnrolledByUser($request['user_id']);
            $workflowIds = array();
            foreach ($workFlows as $workflow)
            {
                array_push($workflowIds, $workflow->id);
            }
            $data = [
                'event' => 'object-updated',
                'objectIds' => [$request['user_id']],
                'workflowIds' => $workflowIds
            ];
            // Updated updatedAt so workflows can be triggered
            $this->userService->updateUpdatedAt($request['user_id']);
            ProcessWorkflowJob::dispatch($data);
            return response()->json([
                'message' => 'Deal has been created successfully',
                'data' => $result
            ]);
        }else {
            return response()->json([
                'message' => 'Something went wrong, try again.'
            ], 500);
        }
    }

    public function HubspotDealStagePipeline(Request $request){
        $user = Auth::user();
        $requestData = $request->all();
        $dealStageResult = $this->vehicleRequestService->HubspotDealStagePipeline($requestData);
        return new HubspotDealStagePipelineCollection( $dealStageResult );
    }

    public function getBoardViewDeals(Request $request){
        $user = Auth::user();
        $data = $request->all();
        if($data['pipeline'] === 'undefined'){
            $dummyDataResult = $this->dealStageDummyData();
            return response()->json([
                'data' => $dummyDataResult
            ]);
        }else{
            
            $dealStageResult = $this->vehicleRequestService->getBoardViewDeals($data);
            $stageIds = $dealStageResult->pluck('stage_id');
            $getDeals = $this->vehicleRequestService->getDealsBasedOnStageId($stageIds->toArray(),$data);
            foreach ($dealStageResult as $key => $value) {
                $result = $this->filterDealsBasedOnStageId($getDeals, $value['stage_id']);
                $value['deals'] = $result['deals_data'];
                $value['total_deals'] = $result['meta_data']['total'];
                $value['deals_meta'] = $result['meta_data'];
                $dealStageResult[$key] = $value;
            }
            return new BoardDealsCollection( $dealStageResult );
        }
    }

    public function updateDealStage(Request $request, $dealId){
        $requestData  = $request->all();
        $result = $this->vehicleRequestService->updateDealStage($requestData , $dealId);
        $dealRequest = new Request(['pipeline' => 'Sales Pipeline', 'deal_stage' => 'null','page' => 1, 'per_page' => 20 ]);
        $dealResult = $this->getBoardViewDeals($dealRequest);
        return new BoardDealsCollection( $dealResult );
    }
}
