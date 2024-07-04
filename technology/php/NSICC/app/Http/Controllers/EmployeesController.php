<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\{EmployeesRequest,ListRequest};
use App\Services\{EmployeesService,UserService};
use App\Http\Resources\{ EmployeesResource,EmployeesCollection };
use Auth;


class EmployeesController extends Controller
{

    public function __construct(EmployeesService $EmployeesService)
    {
        $this->employeesService = $EmployeesService;
    }

    public function list(ListRequest $request)
    {
        $user = Auth::user(); 
        $search = $request->all();
        $result = $this->employeesService->getList($search);
        return new EmployeesCollection($result);
    }

    public function addEmployee(EmployeesRequest $request)
    {
        $user = Auth::user();   
        $insert = $request->all();
        $result = $this->employeesService->addemployee($insert);
        return new EmployeesResource($result);
    }

    public function show(Request $request,$id)
    {
        $user = Auth::user();
        $result = $this->employeesService->showemployee($id);
        return new EmployeesResource($result);
    }
    public function updateEmployee(EmployeesRequest $request,$updateid)
    {
        $user = Auth::user();
        $update_data = $request->all();
        $result = $this->employeesService->update($updateid, $update_data);
        return new EmployeesResource($result);
    }
    public function delemployee(Request $request,$id)
    {
        $user = Auth::user();
        $result = $this->employeesService->deleteEmployee($id);
        if($result)
        {
        return response()->json([
            'result' => 'Employee has been successfully removed.'
        ],200);
       }
       else{
        return response()->json([
            'result' => 'Employee not removed.Please check information!'
        ],400);

       }
    }

   

}
