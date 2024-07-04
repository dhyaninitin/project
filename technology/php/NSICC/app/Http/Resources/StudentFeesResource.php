<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\SchoolacademicTrait;

class StudentFeesResource extends JsonResource
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
            'id'             => $this->id,
            'option_name'    => $this->option_name,
            'no_of_child'    => $this->no_of_child,
            'cost'           => $this->cost,
            'created_at'     => $this->created_at,
           
        );
    }
}
