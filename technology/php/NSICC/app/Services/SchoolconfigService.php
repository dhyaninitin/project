<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ AcademicYear,AcademicYearMonth,StudentsFeesOption, User };
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class SchoolconfigService extends AbstractService
{

    /**
     * get academic year and month list
     *
     * @return array
     */

    public function getacademicList($filters = array())
    {
        
        $cms_user = Auth::user();
        $result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';
        $school_type = isset($filters['school_type']) ? $filters['school_type']: '';
        $query = AcademicYear::select('*');
       
        if($school_type)
        {
            $query=$query->where('school_type','=',$school_type);
        }
        $num_results_filtered = $query->count();
        if ($order_by) {
            switch ($order_by) {
                default:
                    $query = $query->orderBy($order_by, $order_dir);
                    break;
            }
        } else {
            $query = $query->orderBy('academic_year_id', 'asc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $dealers = $query->with('academicmonth')->get();
        $count = $offset;

        $result = new LengthAwarePaginator($dealers, $num_results_filtered, $per_page, $page);
        //$result->setPath(route('vmodels.index'));

        return $result;
    }

    /**
     * Add academic year  
     *
     * @param Array $data
     * @return array
     */

    public function addacademic($insert)
    {
        
       

        $size_of_months=sizeof($insert['months']);
        $size_of_years=sizeof($insert['years']);
        if($size_of_months!=$size_of_years)
        {
         return false;
        }    
        $months=json_encode($insert['months']);    
        $years=json_encode($insert['years']);    
            $academic = new AcademicYear;
            $academic->title = $insert['title'];
            $academic->start_month = $insert['months'][0];
            $academic->school_type = $insert['school_type'];
            $academic->months = $months;
            $academic->years = $years;
            $academic_m=$academic->save();

           
            for($g=0;$g<$size_of_months;$g++)
            {
             $academic_month['academic_year_id'] = $academic->id;
             $academic_month['school_type'] = $insert['school_type'];
             $academic_month['month'] = $insert['months'][$g];
             $academic_month['year'] =  $insert['years'][$g];
             $academic_year = AcademicYearMonth::create($academic_month);
            }
            return $academic_year;

    }
    /** 
     * Add students Fees Options  
     *
     * @param Array $data
     * @return array
     */

    public function addstudentFees($insert)
    {
                      
            $studentfees['option_name'] = $insert['option_name'];
            $studentfees['no_of_child'] = $insert['no_of_child'];
            $studentfees['cost'] = $insert['cost'];
            $studentfees['school_type'] =  $insert['school_type'];
            $studentfees = StudentsFeesOption::create($studentfees);
            return $studentfees;

    }

    /**
     * get student fees List 
     *
     * @return array
     */

    public function getstudentfeesList($filters = array())
    {
        
        $cms_user = Auth::user();
        $result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';
        $school_type = isset($filters['school_type']) ? $filters['school_type']: '';
        $query = StudentsFeesOption::select('*');
       
        if($school_type)
        {
            $query=$query->where('school_type','=',$school_type);
        }
        $num_results_filtered = $query->count();
        if ($order_by) {
            switch ($order_by) {
                default:
                    $query = $query->orderBy($order_by, $order_dir);
                    break;
            }
        } else {
            $query = $query->orderBy('id', 'asc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $dealers = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($dealers, $num_results_filtered, $per_page, $page);
        //$result->setPath(route('vmodels.index'));

        return $result;
    }

     /**
     * update Studnet Fees Option 
     *
     * @param Array $data
     * @param String $id
     * @return array
     */
    public function updateStudentFees($id, $data)
    { 
        $cms_user = Auth::user(); 
        $studentfees = StudentsFeesOption::find($id);
        $studentfees->update($data); 
        return $studentfees;
    }
    
  /**
     * delete Student Fees
     *
     * @param Array $data
     * @param String
     * @return array
     */

    public function deleteStudentFees($id)
    {
        $cms_user = Auth::user();
        $studentfees = StudentsFeesOption::where('id', $id)->delete();
        if($studentfees){
            return true;
        }
    }
    
    
}
