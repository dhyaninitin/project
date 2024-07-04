<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DonationtypeResource extends JsonResource
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
            'donation_id'       => $this->donation_type_id,
            'donation_type'     => $this->type_name, 
            'created_at'        => date('Y-m-d',strtotime($this->created_at)),
        );
    }
}
