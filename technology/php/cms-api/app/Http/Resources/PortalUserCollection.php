<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;
use App\Traits\RevenueTrait;

class PortalUserCollection extends ResourceCollection
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
                $permissions = $item->roles[0]['permissions']->map(function($p, $key) {
                    return array(
                        'id'    => $p['id'],
                        'name'  => $p['name']
                    );
                });
            }
            $profile_url = null;
            if(!empty($item->profile_name) && !empty($item->profile_path)){
                $profile_url = $this->getProfileUrl($item->profile_name,$item->profile_path);
            }
            $carblipAssignedPhone = $this->getCarblipAssignedNumber($item->id);
            return [
                'id'                => $item->id,
                'first_name'        => $item->first_name,
                'last_name'         => $item->last_name,
                'full_name'         => $item->full_name,
                'location_id'       => json_decode($item->locations),
                'location'          => $this->getLocation(json_decode($item->locations)),
                'email'             => $item->email,
                'phone'             => $carblipAssignedPhone == "" ? $item->phone : $carblipAssignedPhone,
                'profile_url'       => $profile_url,
                'roles'             => $roles,
                'permissions'       => $permissions,
                'roundrobin'        => $item->round_robin,
                'is_active'         => $item->is_active,
                'promo_code'        => $item->promo_code,
                'city'              => $item->city,
                'state'             => $item->state,
                'sales_license_expiry_date' => $item->sales_license_expiry_date,
                'created_at'        => date('Y-m-d H:i:s', strtotime($item->created_at->timezone('America/Los_Angeles'))),
                'updated_at'        => date('Y-m-d H:i:s', strtotime($item->updated_at->timezone('America/Los_Angeles'))),
            ];
        });

        return $collection;
    }
}
    