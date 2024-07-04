<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\SchoolTrait;

class SchoolResource extends JsonResource
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
            'id'                       => $this->id,
            'user_id'                  => $this->user_id,
            'school_type'              => $this->school_type,
            'parent_full_name'         => $this->parent_full_name,
            'email'                    => $this->email,
            'contact_number'           => $this->contact_number,
            'relationship_with_child'  => $this->relationship_with_child,
            'whatsapps_available'      => $this->whatsapps_available,
            'whatsapps_number'         => $this->whatsapps_number,
            'no_of_child'              => $this->no_of_child,
            'created_at'               => $this->created_at,
            'student_data'             => $this->formatstudentData($this->id),
           
        );
    }
}
