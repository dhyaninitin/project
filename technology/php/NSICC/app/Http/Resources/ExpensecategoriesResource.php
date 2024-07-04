<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExpensecategoriesResource extends JsonResource
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
                'category_id'       => $this->id,
                'category_name'     => $this->cat_name,
                'create_at'         => date('Y-m-d',strtotime($this->created_at)),
                'modifi_date'       => date('Y-m-d',strtotime($this->modified_at)),
                'archive'           => $this->archive,
        );
    }
}
