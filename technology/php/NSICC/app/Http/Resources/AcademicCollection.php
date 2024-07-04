<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;
use App\Traits\SchoolacademicTrait;

class AcademicCollection extends ResourceCollection
{
    use SchoolacademicTrait;
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
                'academic_year_id'        => $item->academic_year_id,
                'school_type'             => $item->school_type,
                'academic_year_title'     => $item->title,
                'start_month'             => $item->start_month,
                'created_at'              => $item->created_at,
                'academic_month_data'     => $this->formatacademicRequest($item->academic_year_id),

            ];
        });

        return $collection;
    }
}
    