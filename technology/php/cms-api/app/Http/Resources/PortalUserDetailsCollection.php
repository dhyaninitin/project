<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;
use App\Traits\RevenueTrait;

class PortalUserDetailsCollection extends ResourceCollection
{
    use RevenueTrait;
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $collection = $this->collection->map(function($item){
            $roles = null;
            $permissions = null;
            if (isset($item->roles[0]))
            {
                $roles = $item->roles->map(function($p, $key) {
                    return array(
                        'id'    => $p['id'],
                        'name'  => $p['name']
                    );
                });
            }
            return [
                'id'                => $item->id,
                'first_name'        => $item->first_name,
                'last_name'         => $item->last_name,
                'full_name'         => $item->full_name,
                'email'             => $item->email,
                'roles'             => $roles,
            ];
        });

        return $collection;
    }
}
    