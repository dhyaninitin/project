<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\SchoolTrait;

class StudentResource extends JsonResource
{
    use SchoolTrait;
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
         return array(
            'student_id'               => $this->id,
            'sc_reg_id'                => $this->sc_reg_id,
            'school_type'              => $this->school_type,
            'academic_year'            => $this->formatacademicData($this->academic_year),
            'student_name'             => $this->student_name,
            'roll_no'                  => $this->roll_no,
            'student_grade'            => $this->student_grade,
            'student_class'            => $this->studentClassData($this->student_class),
            'gender'                   => $this->gender,
            'dob'                      => $this->dob,
            'IsArabicSpeak'            => $this->IsArabicSpeak,
            'IsEnglishSpeak'           => $this->IsEnglishSpeak,
            'IsOtherSpeak'             => $this->IsOtherSpeak,
            'CanReadArabic'            => $this->CanReadArabic,
            'CanWriteArabic'           => $this->CanWriteArabic,
            'IsRegisterKLM'            => $this->IsRegisterKLM,
            'child_memory'             => $this->child_memory,
            'additional_info'          => $this->additional_info,
            'pickup_person_name'       => $this->pickup_person_name,
            'created_at'               => $this->created_at,           
            'updated_at'               => $this->updated_at,           
           
        );
    }
}
