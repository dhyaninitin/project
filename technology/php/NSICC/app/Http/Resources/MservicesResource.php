<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MservicesResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        
        return array(
            'id'                         => $this->id,
            'user_id'                    => $this->user_id,
            'marriage_date'              => $this->marriage_date,
            'ceremony_address'           => $this->ceremony_address,
            'ceremony_people_count'      => $this->ceremony_people_count,
            'groom_full_name'            => $this->groom_full_name,
            'bride_full_name'            => $this->bride_full_name,
            'email'                      => $this->email,
            'contact_number'             => $this->contact_number,
            'premarital_counseling_day'  => $this->premarital_counseling_day,
            'marriage_license'           => $this->marriage_license,
            'witness'                    => $this->marriage_license,
            'additional_info'            => $this->additional_info,
            'created_at'                 => $this->created_at,
            'updated_at'                 => $this->updated_at,
        );
    }
}
