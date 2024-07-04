<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
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
            'id'                    => $this->id,
            'name'                  => $this->name,
            'street_address'        => $this->street_address,
            'city'                  => $this->city,
            'state'                 => $this->state,
            'zip_code'              => $this->zip_code,
            'created_at'            => date('Y-m-d H:i:s', strtotime($this->created_at->timezone('America/Los_Angeles'))),
            'updated_at'            => date('Y-m-d H:i:s', strtotime($this->updated_at->timezone('America/Los_Angeles'))),
        );
    }
}
