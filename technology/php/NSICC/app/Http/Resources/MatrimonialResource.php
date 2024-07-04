<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MatrimonialResource extends JsonResource
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
                'full_name'                  => $this->full_name,
                'email'                      => $this->email,
                'age'                        => $this->age,
                'gender'                     => $this->gender,
                'home_contact_number'        => $this->home_contact_number,
                'personal_contact_number'    => $this->personal_contact_number,
                'parent_name'                => $this->parent_name,
                'parent_phone'               => $this->parent_phone,
                'address'                    => $this->address,
                'city'                       => $this->city,
                'province'                   => $this->province,
                'postal_code'                => $this->postal_code,
                'country'                    => $this->country,
                'nationality'                => $this->nationality,
                'ethnic_background'          => $this->ethnic_background,
                'marital_status'             => $this->marital_status,
                'height'                     => $this->height,
                'complexion'                 => $this->complexion,
                'religion'                   => $this->religion,
                'education'                  => $this->education,
                'parent_education'           => $this->parent_education,
                'sibling_info'               => $this->sibling_info,
                'other_info'                 => $this->other_info,
                'spouse_requirements'        => $this->spouse_requirements,
                'created_at'                 => $this->created_at,
                'updated_at'                 => $this->updated_at,
        );
    }
}
