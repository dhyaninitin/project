<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\{SchoolRequest,ListRequest,StudentRequest};
use App\Model\{School,User};
use App\Services\{ SchoolService };
use App\Http\Resources\{ SchoolResource, SchoolCollection,StudentResource,StudentBasicCollection };
use Auth;
use JWTAuth;

class SchoolController extends Controller
{
 /**
     * @var Schoolservice
     */
    protected $schoolService;

    public function __construct(
        SchoolService $schoolService
    )
    {
        $this->schoolService = $schoolService;
        
    }

    /**
     * Get School Registration  list (Weekend/Weekdays)
     *
     * @param  App\Http\Requests\ListRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function schoolRegList(ListRequest $request)
    {
        
         $filter = $request->all();
         $result = $this->schoolService->getSchooolRegList($filter);
         if($result)
            {
             return new SchoolCollection($result);
            }
         else{
             return response()->json(['error' => 'API Error'], 400);
         }
    }
    
     /**
     * School Registration 
     * @param  App\Http\Requests\SchoolRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function schoolReg(SchoolRequest $request)
    {
        $data = $request->all();       
        $result = $this->schoolService->schoolreg($data);
        if($result)
         {
             return new SchoolResource($result);
            }
         else{
             return response()->json(['error' => 'Something Went Wrong!'], 400);
         }
    }
    
    /**
     * Update School Registration  info
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $id
     */
    public function UpdateschoolReg(SchoolRequest $request, $id)
    {
        $user = Auth::user();
        $data = $request->all();
        $result = $this->schoolService->UpdateschoolReg($id, $data);
        return new SchoolResource($result);
    }
  /**
     * Delete School Registration
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $id
     */
    public function DeleteschoolReg(Request $request, $id)
    {
        $user = Auth::user();
        $result = $this->schoolService->DeleteschoolReg($id);
        return response()->json([
            'result' => 'Registration has been successfully removed.'
        ]);
    }

/**
     * Get Student list (Weekend/Weekdays)
     *
     * @param  App\Http\Requests\ListRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function StudentList(ListRequest $request)
    {
        
         $filter = $request->all();
         $result = $this->schoolService->getStudentList($filter);
         if($result)
            {
             return new StudentBasicCollection($result);
            }
         else{
             return response()->json(['error' => 'API Error'], 400);
         }
    }
    /**
     * Add Student for parent account 
     * @param  App\Http\Requests\SchoolRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function addStudent(StudentRequest $request)
    {
        $data = $request->all();       
        $result = $this->schoolService->addStudent($data);
        if($result)
         {
             return new StudentResource($result);
            }
         else{
             return response()->json(['error' => 'Something Went Wrong!'], 400);
         }
    }
     /**
     * Update Student Details
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $id
     */
    public function UpdateStudent(StudentRequest $request, $id)
    {
        $user = Auth::user();
        $data = $request->all();
        $result = $this->schoolService->UpdateStudent($id, $data);
        return new StudentResource($result);
    }
    /**
     * Delete Student
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $id
     */
    public function DeleteStudent(Request $request, $id)
    {
        $user = Auth::user();
        $result = $this->schoolService->DeleteStudent($id);
        return response()->json([
            'result' => 'Student has been successfully removed.'
        ]);
    }

}