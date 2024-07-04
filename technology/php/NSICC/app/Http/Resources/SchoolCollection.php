<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class SchoolCollection extends ResourceCollection
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
                'id'                       => $item->id,
                'user_id'                  => $item->user_id,
                'school_type'              => $item->school_type,
                'parent_full_name'         => $item->parent_full_name,
                'email'                    => $item->email,
                'contact_number'           => $item->contact_number,
                'relationship_with_child'  => $item->relationship_with_child,
                'whatsapps_available'      => $item->whatsapps_available,
                'whatsapps_number'         => $item->whatsapps_number,
                'no_of_child'              => $item->no_of_child,
                'created_at'               => $item->created_at,
            ];
        });

        return $collection;
    }
}
    