<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class EmployeesCollection extends ResourceCollection
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
                'id'                 => $item->id,
                'fullname'           => $item->fullname,
                'email'              => $item->email,
                'contact_number'     => $item->contact_number,
                'emp_code'           => $item->emp_code,
                'created_at'         => $item->created_at,
                'updated_at'         => $item->updated_at,
                'archive'            => $item->archive,
            ];
        });

        return $collection;
    }
}
    