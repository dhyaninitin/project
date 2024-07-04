<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class LocationCollection extends ResourceCollection
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
                'id'                    => $item->id,
                'name'                  => $item->name,
                'street_address'        => $item->street_address,
                'city'                  => $item->city,
                'state'                 => $item->state,
                'zip_code'              => $item->zip_code,
                'created_at'            => date('Y-m-d H:i:s', strtotime($item->created_at->timezone('America/Los_Angeles'))),
                'updated_at'            => date('Y-m-d H:i:s', strtotime($item->updated_at->timezone('America/Los_Angeles'))),
            ];
        });

        return $collection;
    }
}
    