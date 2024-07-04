<?php

namespace App\Traits;
use App\Model\{ School,StudentDetails,AcademicYear, StudentClass};
use Carbon\Carbon;
use App\Http\Resources\{ StudentBasicCollection };

trait SchoolTrait
{

    /**
     * @return String
     */
    protected function formatstudentData($request)
    {
        $student_data = StudentDetails::where('sc_reg_id', $request)->get();
        $student_data = new StudentBasicCollection($student_data);
        return $student_data;

    }
    /**
     * @return String
     */
    protected function formatacademicData($request)
    {
        $academic_data = AcademicYear::where('academic_year_id', $request)->first();
        if($academic_data)
        {
            return $academic_data->title;
        }

    }/**
     * @return String
     */
    protected function studentClassData($request)
    {
        $class_data = StudentClass::where('student_class_id', $request)->first();
        return $class_data->class_name;

    }
}