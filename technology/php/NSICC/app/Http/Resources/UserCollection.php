<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
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
            return [
                'userid'                  => $item->id,
                'first_name'              => $item->fname,
                'last_name'               => $item->lname,
                'user_email'              => $item->email,
                'contact_number'          => $item->contact_number,
                'birthdate'               => date('Y-m-d',strtotime($item->birthdate)),
                'roleid'                  => $item->role_id,
                'userpermissions'         => $item->permissions,
                'is_website'              => $item->is_website_user, 
                'created_at'              => date('Y-m-d',strtotime($item->created_at)), 
                'updated_at'              => date('Y-m-d',strtotime($item->updated_at)), 
                'active'                  => $item->active,
            ];
        });

        return $collection;
    }
}
    