<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'userid'                  => $this->id,
            'first_name'              => $this->fname,
            'last_name'               => $this->lname,
            'user_email'              => $this->email,
            'contact_number'          => $this->contact_number,
            'birthdate'               => date('Y-m-d',strtotime($this->birthdate)),
            'roleid'                  => $this->role_id,
            'userpermissions'         => $this->permissions,
            'is_website'              => $this->is_website_user, 
            'created_at'              => date('Y-m-d',strtotime($this->created_at)), 
            'updated_at'              => date('Y-m-d',strtotime($this->updated_at)), 
            'active'                  => $this->active,
        );
    }
}
