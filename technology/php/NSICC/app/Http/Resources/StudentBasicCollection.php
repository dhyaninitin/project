<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;
use App\Traits\SchoolTrait;

class StudentBasicCollection extends ResourceCollection
{
    use SchoolTrait;
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $collection = $this->collection->map(function($item){
            return [
            'student_id'               => $item->id,
            'sc_reg_id'                => $item->sc_reg_id,
            'school_type'              => $item->school_type,
            'academic_year'            => $this->formatacademicData($item->academic_year),
            'student_name'             => $item->student_name,
            'roll_no'                  => $item->roll_no,
            'student_grade'            => $item->student_grade,
            'student_class'            => $this->studentClassData($item->student_class),
            'gender'                   => $item->gender,
            'dob'                      => $item->dob,
            'IsArabicSpeak'            => $item->IsArabicSpeak,
            'IsEnglishSpeak'           => $item->IsEnglishSpeak,
            'IsOtherSpeak'             => $item->IsOtherSpeak,
            'CanReadArabic'            => $item->CanReadArabic,
            'CanWriteArabic'           => $item->CanWriteArabic,
            'IsRegisterKLM'            => $item->IsRegisterKLM,
            'child_memory'             => $item->child_memory,
            'additional_info'          => $item->additional_info,
            'pickup_person_name'       => $item->pickup_person_name,
            'created_at'               => $item->created_at,           
            'updated_at'               => $item->updated_at,           
            ];
        });

        return $collection;
    }
}
    