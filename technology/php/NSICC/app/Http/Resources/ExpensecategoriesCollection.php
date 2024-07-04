<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class ExpensecategoriesCollection extends ResourceCollection
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
                'category_id'       => $item->id,
                'category_name'     => $item->cat_name,
                'create_at'         => date('Y-m-d',strtotime($item->created_at)),
                'modifi_date'       => date('Y-m-d',strtotime($item->modified_at)),
                'archive'           => $item->archive,
            ];
        });

        return $collection;
    }
}
    