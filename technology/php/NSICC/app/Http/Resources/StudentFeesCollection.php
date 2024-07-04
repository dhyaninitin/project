<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;
use App\Traits\SchoolacademicTrait;

class StudentFeesCollection extends ResourceCollection
{
    use SchoolacademicTrait;
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
            'id'             => $item->id,
            'option_name'    => $item->option_name,
            'no_of_child'    => $item->no_of_child,
            'cost'           => $item->cost,
            'created_at'     => $item->created_at,
            ];
        });

        return $collection;
    }
}
    