<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class FuneralCollection extends ResourceCollection
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
                'grave_number'               => $item->grave_number,
                'email'                      => $item->email,
                'deceased_name'              => $item->deceased_name,
                'dob'                        => $item->dob,
                'dod'                        => $item->dod,
                'funeral_executor_name'      => $item->funeral_executor_name,
                'contact'                    => $item->contact,
                'cause_of_death'             => $item->cause_of_death,
                'body_location'              => $item->body_location,
                'addition_info'              => $item->addition_info,
                'approved_sts'               => $item->approved_sts,
                'approve_by_user'            => $item->approve_by_user,
                'payment_type'               => $item->payment_type,
                'payment_method'             => $item->payment_method,
                'payment_amt'                => $item->payment_amt,
                'payment_sts'                => $item->payment_sts,
                'transcation_id'             => $item->transcation_id,
                'payment_date'               => $item->payment_date,
                'created_at'                 => $item->created_at,
                'updated_at'                 => $item->updated_at,
            ];
        });

        return $collection;
    }
}
