<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\SchoolacademicTrait;

class AcademicResource extends JsonResource
{
    use SchoolacademicTrait;
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
         return array(
            'academic_month_id'       => $this->id,
            'academic_year_id'        => $this->academic_year_id,
            'school_type'             => $this->school_type,
            'academic_year_title'     => $this->formatAcademictitle($this->academic_year_id)->title,
            'months'                  => $this->formatAcademictitle($this->academic_year_id)->months,
            'years'                   => $this->formatAcademictitle($this->academic_year_id)->years,
        );
    }
}
