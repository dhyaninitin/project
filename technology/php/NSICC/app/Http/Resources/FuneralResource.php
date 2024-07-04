<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FuneralResource extends JsonResource
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
                'id'                 => $this->id,
                'user_id'                    => $this->user_id,
                'grave_number'               => $this->grave_number,
                'email'                      => $this->email,
                'deceased_name'              => $this->deceased_name,
                'dob'                        => $this->dob,
                'dod'                        => $this->dod,
                'funeral_executor_name'      => $this->funeral_executor_name,
                'contact'                    => $this->contact,
                'cause_of_death'             => $this->cause_of_death,
                'body_location'              => $this->body_location,
                'addition_info'              => $this->addition_info,
                'approved_sts'               => $this->approved_sts,
                'approve_by_user'            => $this->approve_by_user,
                'payment_type'               => $this->payment_type,
                'payment_method'             => $this->payment_method,
                'payment_amt'                => $this->payment_amt,
                'payment_sts'                => $this->payment_sts,
                'transcation_id'             => $this->transcation_id,
                'payment_date'               => $this->payment_date,
                'created_at'                 => $this->created_at,
                'updated_at'                 => $this->updated_at,
        );
    }
}
