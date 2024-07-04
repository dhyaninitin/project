<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseaccountResource extends JsonResource
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
            'id'                => $this->id,
            'user_id'           => $this->user_id,
            'account_number'    => $this->account_number,
            'create_at'         => date('Y-m-d',strtotime($this->created_at)),
            'modifi_date'       => date('Y-m-d',strtotime($this->modified_at)),
            'archive'           => $this->archive,
        );
    }
}
