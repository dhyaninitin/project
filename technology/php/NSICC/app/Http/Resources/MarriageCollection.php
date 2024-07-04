<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class MarriageCollection extends ResourceCollection
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
                'marriage_date'              => $item->marriage_date,
                'ceremony_address'           => $item->ceremony_address,
                'ceremony_people_count'      => $item->ceremony_people_count,
                'groom_full_name'            => $item->groom_full_name,
                'bride_full_name'            => $item->bride_full_name,
                'email'                      => $item->email,
                'contact_number'             => $item->contact_number,
                'premarital_counseling_day'  => $item->premarital_counseling_day,
                'marriage_license'           => $item->marriage_license,
                'witness'                    => $item->marriage_license,
                'additional_info'            => $item->additional_info,
                'created_at'                 => $item->created_at,
                'updated_at'                 => $item->updated_at,
            ];
        });

        return $collection;
    }
}
