<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class DonationtypeCollection extends ResourceCollection
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
                'donation_id'       => $item->donation_type_id,
                'donation_type'     => $item->type_name, 
                'created_at'        => date('Y-m-d',strtotime($item->created_at)),
            ];
        });

        return $collection;
    }
}
    