<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Model\Log;
use App\Services\LogService;
use App\Http\Requests\{ListRequest};
use App\Http\Resources\LogResource;
use Auth;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

class LogController extends Controller
{
    /**
     * @var LogService
     */
    protected $logService;

    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }

    /**
     * Get log list
     *
     * @param  App\Http\Requests\ListRequest  $request
     * @return \Illuminate\Http\Response
     */

    public function index(ListRequest $request)
    {
        $filter = $request->all(); 
        $logs = $this->logService->list($filter);

        return LogResource::collection($logs);
    }
 
    public function create(Request $request)  {   
        $log = new Log($request->all()); 
        $log->save();
        return response()->json($log); 
    }

    public function notFound(Request $request)  {  
        $log = $request->all();
        $pageNotFoundLog = new Logger($log['type']);
        $msg = $log['type'] == 404 ? 'Page Not Found' : 'Internal Server Error';
        $pageNotFoundLog->pushHandler(new StreamHandler(storage_path('logs/404.log')), Logger::INFO);
        $pageNotFoundLog->info($msg, $log);
        return response()->json($log); 
    }

    public function workFlowErrorLogs($request)  {  
        $workflowLog = new Logger($request['type']);
        $workflowLog->pushHandler(new StreamHandler(storage_path('logs/workflowErrorlog-'.date('m-Y').'.log')), Logger::INFO);
        $workflowLog->info($request['info'],$request);
        return response()->json($request); 
    }
}
