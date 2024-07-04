<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Model\{ School,StudentDetails, User };
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class SchoolService extends AbstractService
{

    /**
     * get School Registrations List(Weekend AND Weekdays)
     *
     * @return array
     */

    public function getSchooolRegList($filters = array())
    {
        
        $cms_user = Auth::user();
        $result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';
        
        $query = School::select('*')->where('archive','=','0');
        if($search_value) { 
            $search_value_arr = explode(' ', $search_value); 
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE(`parent_full_name`,''), ' ', COALESCE(`relationship_with_child`, ''), ' ',COALESCE(`school_type`, ''), ' ',COALESCE(`contact_number`, ''), ' ') like '%{$value}%'");
            }
        }
        $school_type = isset($filters['school_type']) ? $filters['school_type']: '';
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
     * get school registration info
     *
     * @param String $id
     * @return array
     */

    public function getSchoolReg($id)
    {
        $result = School::find($id)->get();
        return $result;
    }
    /**
     * get student  info
     *
     * @param String $id
     * @return array
     */

    public function getstudent($id)
    {
        $result = StudentDetails::find($id)->get();
        return $result;
    }
    /**
     * School Registrations Api  
     *
     * @param Array $data
     * @return array
     */

    public function schoolreg($insert)
    {
        
        $users = User::where('email', $insert['email'])->first();
     
            $cmsusers = new User;
            $cmsusers->fname = $insert['parent_full_name'];
            $cmsusers->email = $insert['email'];
            $cmsusers->password = Hash::make('NSICC'.rand(897,98767788));
            $cmsusers->contact_number = $insert['contact_number'];
            $cmsusers->role_id = 7;
            $cmsusers->is_website_user = 1;
            $cmsusers->permissions = "";
            $cmsusers->active = 1;
            $cmsusers->save();
        
            if(isset($insert['user_id']))
            {
            $insert['user_id']=$insert['user_id'];

            }
            else{
            $insert['user_id']=$cmsusers->id;
            }
           $school_reg = School::create($insert);
           $size_of_student=sizeof($insert['student_name']);
          if($school_reg)
          {
            for($g=0;$g<$size_of_student;$g++)
            {
             $student_data['sc_reg_id'] = $school_reg->id;
             $student_data['school_type'] = $insert['school_type'];
             $student_data['student_name'] = $insert['student_name'][$g];
             $student_data['roll_no'] =  $insert['roll_no'][$g];
             $student_data['student_grade'] =  $insert['student_grade'][$g];
             $student_data['student_class'] =  $insert['student_class'][$g];
             $student_data['academic_year'] =  $insert['academic_year'][$g];
             $student_data['gender'] =  $insert['gender'][$g];
             $student_data['dob'] =  $insert['dob'][$g];
             $student_data['IsArabicSpeak'] =  $insert['IsArabicSpeak'][$g];
             $student_data['IsEnglishSpeak'] =  $insert['IsEnglishSpeak'][$g];
             $student_data['IsOtherSpeak'] =  $insert['IsOtherSpeak'][$g];
             $student_data['CanReadArabic'] =  $insert['CanReadArabic'][$g];
             $student_data['CanWriteArabic'] =  $insert['CanWriteArabic'][$g];
             $student_data['IsRegisterKLM'] =  $insert['IsRegisterKLM'][$g];
             $student_data['child_memory'] =  $insert['child_memory'][$g];
             $student_data['additional_info'] =  $insert['additional_info'][$g];
             $student_data['pickup_person_name'] =  $insert['pickup_person_name'][$g];
             $students = StudentDetails::create($student_data);
            }
        }

            return $school_reg;

    }

     /**
     * update School Registration (Weekend/Weekdays)
     *
     * @param Array $data
     * @param String $id
     * @return array
     */
    public function UpdateschoolReg($id, $data)
    { 
        $cms_user = Auth::user(); 
        $schoolReg = School::find($id);
        $data_update = array(
            "school_type" => $data['school_type'],
            "parent_full_name" => $data['parent_full_name'],
            "contact_number"=> $data['contact_number'],
            "relationship_with_child"=> $data['relationship_with_child'],
            "whatsapps_available"=> $data['whatsapps_available'],
            "whatsapps_number"=> $data['whatsapps_number'],
            "no_of_child"=> $data['no_of_child'],
        );
        $result=$schoolReg->update($data_update); 
        $size_of_student=sizeof($data['student_name']);
        if($result)
        {
          for($g=0;$g<$size_of_student;$g++)
          {
           $student_data['sc_reg_id'] = $id;
           $student_data['school_type'] = $data['school_type'];
           $student_data['student_name'] = $data['student_name'][$g];
           $student_data['roll_no'] =  $data['roll_no'][$g];
           $student_data['student_grade'] =  $data['student_grade'][$g];
           $student_data['student_class'] =  $data['student_class'][$g];
           $student_data['academic_year'] =  $data['academic_year'][$g];
           $student_data['gender'] =  $data['gender'][$g];
           $student_data['dob'] =  $data['dob'][$g];
           $student_data['IsArabicSpeak'] =  $data['IsArabicSpeak'][$g];
           $student_data['IsEnglishSpeak'] =  $data['IsEnglishSpeak'][$g];
           $student_data['IsOtherSpeak'] =  $data['IsOtherSpeak'][$g];
           $student_data['CanReadArabic'] =  $data['CanReadArabic'][$g];
           $student_data['CanWriteArabic'] =  $data['CanWriteArabic'][$g];
           $student_data['IsRegisterKLM'] =  $data['IsRegisterKLM'][$g];
           $student_data['child_memory'] =  $data['child_memory'][$g];
           $student_data['additional_info'] =  $data['additional_info'][$g];
           $student_data['pickup_person_name'] =  $data['pickup_person_name'][$g];
           $students = StudentDetails::create($student_data);
          }
      }
        return $schoolReg;
    }
    
    /**
     * delete School Registration
     *
     * @param Array $data
     * @param String
     * @return array
     */

    public function DeleteschoolReg($id)
    {
        $cms_user = Auth::user();
        $schoolreg = School::find($id)->update(['archive'=>1]);
        $studntreg = StudentDetails::where('sc_reg_id', $id)->update(['archive'=>1]);
        if($schoolreg){
            return true;
        }
    }
     /**
     * get Student Registrations List(Weekend AND Weekdays)
     *
     * @return array
     */

    public function getStudentList($filters = array())
    {
        
        $cms_user = Auth::user();
        $result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by']: null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir']: 'desc';
        $offset = ($page - 1) * $per_page;

        $search_value = isset($filters['search']) ? $filters['search']: '';
        
        $query = StudentDetails::select('*')->where('archive','=','0');
        if($search_value) { 
            $search_value_arr = explode(' ', $search_value); 
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE(`student_name`,''), ' ', COALESCE(`roll_no`, ''), ' ',COALESCE(`school_type`, ''), ' ',COALESCE(`gender`, ''), ' ') like '%{$value}%'");
            }
        }
        $school_type = isset($filters['school_type']) ? $filters['school_type']: '';
        if($school_type)
        {
            $query=$query->where('school_type','=',$school_type);
        }
        $academic_year = isset($filters['academic_year']) ? $filters['academic_year']: '';
        if($academic_year)
        {
            $query=$query->where('academic_year','=',$academic_year);
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
     * Add Student for Parents Account  Api  
     *
     * @param Array $data
     * @return array
     */

    public function addStudent($insert)
    {
        
        $cms_user = Auth::user();

        
            if(isset($insert['sc_reg_id']))
            {
            $userid=$insert['sc_reg_id'];

            }
            else{
            $userid=$cms_user->id;
            }
            $sc_reg_result =School::where('user_id','=',$userid)->first();
            $sc_reg_id=$sc_reg_result->id;
           $size_of_student=sizeof($insert['student_name']);
          if($size_of_student!=0)
          {
            for($g=0;$g<$size_of_student;$g++)
            {
             $student_data['sc_reg_id'] = $sc_reg_id;
             $student_data['school_type'] = $insert['school_type'];
             $student_data['student_name'] = $insert['student_name'][$g];
             $student_data['roll_no'] =  $insert['roll_no'][$g];
             $student_data['student_grade'] =  $insert['student_grade'][$g];
             $student_data['student_class'] =  $insert['student_class'][$g];
             $student_data['academic_year'] =  $insert['academic_year'][$g];
             $student_data['gender'] =  $insert['gender'][$g];
             $student_data['dob'] =  $insert['dob'][$g];
             $student_data['IsArabicSpeak'] =  $insert['IsArabicSpeak'][$g];
             $student_data['IsEnglishSpeak'] =  $insert['IsEnglishSpeak'][$g];
             $student_data['IsOtherSpeak'] =  $insert['IsOtherSpeak'][$g];
             $student_data['CanReadArabic'] =  $insert['CanReadArabic'][$g];
             $student_data['CanWriteArabic'] =  $insert['CanWriteArabic'][$g];
             $student_data['IsRegisterKLM'] =  $insert['IsRegisterKLM'][$g];
             $student_data['child_memory'] =  $insert['child_memory'][$g];
             $student_data['additional_info'] =  $insert['additional_info'][$g];
             $student_data['pickup_person_name'] =  $insert['pickup_person_name'][$g];
             $students = StudentDetails::create($student_data);
            }
        }

            return $students;

    }
    /**
     * update Student detail (Weekend/Weekdays)
     *
     * @param Array $data
     * @param String $id
     * @return array
     */
    public function UpdateStudent($id, $data)
    { 
        $cms_user = Auth::user(); 
        $student_detail = StudentDetails::find($id);
        $student_detail->update($data); 
        return $student_detail;
    }
    /**
     * delete Student 
     *
     * @param Array $data
     * @param String
     * @return array
     */

    public function DeleteStudent($id)
    {
        $cms_user = Auth::user();
        $schoolreg = StudentDetails::find($id)->update(['archive'=>1]);
        if($schoolreg){
            return true;
        }
    }
}
