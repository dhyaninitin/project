<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeesResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
         return array(
            'id'                => $this->id,
            'fullname'          => $this->fullname,
            'email'             => $this->email,
            'contact_number'    => $this->contact_number,
            'emp_code'          => $this->emp_code,
            'created_at'        => date('Y-m-d',strtotime($this->created_at)),
            'updated_at'        => date('Y-m-d',strtotime($this->updated_at)),
            'archive'           => $this->archive,
        );
    }
}
