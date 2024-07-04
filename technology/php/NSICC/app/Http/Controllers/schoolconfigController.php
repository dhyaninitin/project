<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\{SchoolconfigRequest,StudentFeesRequest,ListRequest};
use App\Model\{Schoolconfig,User};
use App\Services\{ SchoolconfigService };
use App\Http\Resources\{ AcademicResource, AcademicCollection, StudentFeesResource, StudentFeesCollection };
use Auth;
use JWTAuth;

class schoolconfigController extends Controller
{
 /**
     * @var MservicesService
     */
    protected $schoolconfigService;

    public function __construct(
        SchoolconfigService $schoolconfigService
    )
    {
        $this->schoolconfigService = $schoolconfigService;
        
    }

    /**
     * Get academic list
     *
     * @param  App\Http\Requests\ListRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function academiclist(ListRequest $request)
    {
        
         $filter = $request->all();
         $result = $this->schoolconfigService->getacademicList($filter);
         if($result)
         {
             return new AcademicCollection($result);
            }
         else{
             return response()->json(['error' => 'API Error'], 400);
         }
    }
    
     /**
     * Add Academic Year of School 
     * @param  App\Http\Requests\SchoolconfigRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function addacademic(SchoolconfigRequest $request)
    {
        $data = $request->all();       
        $result = $this->schoolconfigService->addacademic($data);
        if($result)
         {
             return new AcademicResource($result);
            }
         else{
             return response()->json(['error' => 'Months count and years count mismatch! please check.'], 400);
         }
    }
    /**
     * Add Student Fees Options 
     * @param  App\Http\Requests\StudentFeesRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function addStudentFees(StudentFeesRequest $request)
    {
        $data = $request->all();       
        $result = $this->schoolconfigService->addstudentFees($data);
        if($result)
         {
             return new StudentFeesResource($result);
            }
         else{
             return response()->json(['error' => 'API Error'], 400);
         }
    }

     /**
     * Get student fees list
     *
     * @param  App\Http\Requests\ListRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function studentFeeslist(ListRequest $request)
    {
        
         $filter = $request->all();
         $result = $this->schoolconfigService->getstudentfeesList($filter);
         if($result)
         {
             return new StudentFeesCollection($result);
            }
         else{
             return response()->json(['error' => 'API Error'], 400);
         }
    }
    
    /**
     * Update Student Fees  info
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $marriage_service_id
     */
    public function updateStudentFees(StudentFeesRequest $request, $id)
    {
        $user = Auth::user();
        $data = $request->all();
        $result = $this->schoolconfigService->updateStudentFees($id, $data);
        return new StudentFeesResource($result);
    }
  /**
     * Delete Student Fees
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $id
     */
    public function deleteStudentFees(Request $request, $id)
    {
        $user = Auth::user();
        $result = $this->schoolconfigService->deleteStudentFees($id);
        return response()->json([
            'result' => 'Student Fees Option has been successfully removed.'
        ]);
    }

}