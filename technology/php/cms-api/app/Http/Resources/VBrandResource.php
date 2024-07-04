<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class VBrandResource extends JsonResource
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
            'id'            => $this->id,
            'name'          => $this->name,
            'image_url'     => $this->image_url,
            'created_at'            => date('Y-m-d H:i:s', strtotime($this->created_at->timezone('America/Los_Angeles'))),
            'updated_at'            => date('Y-m-d H:i:s', strtotime($this->updated_at->timezone('America/Los_Angeles'))),
        );
    }
}
