<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class MatrimonialCollection extends ResourceCollection
{

    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $collection = $this->collection->map(function($item){
            $owner = $item->cms_user;

            return [
                'id'                         => $item->id,
                'user_id'                    => $item->user_id,
                'full_name'                  => $item->full_name,
                'email'                      => $item->email,
                'age'                        => $item->age,
                'gender'                     => $item->gender,
                'home_contact_number'        => $item->home_contact_number,
                'personal_contact_number'    => $item->personal_contact_number,
                'parent_name'                => $item->parent_name,
                'parent_phone'               => $item->parent_phone,
                'address'                    => $item->address,
                'city'                       => $item->city,
                'province'                   => $item->province,
                'postal_code'                => $item->postal_code,
                'country'                    => $item->country,
                'nationality'                => $item->nationality,
                'ethnic_background'          => $item->ethnic_background,
                'marital_status'             => $item->marital_status,
                'height'                     => $item->height,
                'complexion'                 => $item->complexion,
                'religion'                   => $item->religion,
                'education'                  => $item->education,
                'parent_education'           => $item->parent_education,
                'sibling_info'               => $item->sibling_info,
                'other_info'                 => $item->other_info,
                'spouse_requirements'        => $item->spouse_requirements,
                'created_at'                 => $item->created_at,
                'updated_at'                 => $item->updated_at,
            ];
        });

        return $collection;
    }
}
