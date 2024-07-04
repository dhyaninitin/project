<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;
use App\Traits\RequestTrait;
use Carbon\Carbon;

class UserCollection extends ResourceCollection
{
    use RequestTrait;

    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $collection = $this->collection->map(function($item){
            $contact_owner = $item->portal_user;
            $createdAt = null;
            if(!empty($item->created_at)){
                $createdAt = Carbon::parse($item->created_at)->setTimezone('America/Los_Angeles')->format('Y-m-d H:i:s');
            }
            
            return [
                'id'                => $item->id,
                'first_name'        => $item->first_name,
                'last_name'         => $item->last_name,
                'full_name'         => $item->full_name,
                'gender'            => $item->gender,
                'date_of_birth'         => $item->date_of_birth,
                'email_address'         => $item->email_address,
                'contact_owner_id'      => $contact_owner ? $contact_owner->id : '',
                'contact_owner'         => $contact_owner ? $contact_owner->full_name : '',
                'contact_owner_email'   => $contact_owner ? $contact_owner->email : '',
                'app_version'           => $item->app_version,
                'device_type'           => $item->device_type,
                'device_token'          => $item->device_token,
                'access_token'          => $item->access_token,
                'status'                => $item->status,
                'created_at'            => $createdAt,
                'updated_at'            => date('Y-m-d H:i:s', strtotime($item->updated_at->timezone('America/Los_Angeles'))),
                'phone'                 => $item->phone,
                'zipcode'               => $item->zipcode,
                'location'              => $item->location,
                'phone_verified'        => $item->phone_verified,
                'login_verify_code'     => $item->login_verify_code,
                'lease_captured'        => $item->lease_captured,
                'lease_information_id'  => $item->lease_information_id,
                'is_active'             => $item->is_active,
                'phone_preferred_contact'=> $item->phone_preferred_contact,
                'phone_preferred_time'  => $item->phone_preferred_time,
                'phone_preferred_type'  => $item->phone_preferred_type,
                'street_address'        => $item->street_address,
                'city'                  => $item->city,
                'state'                 => $item->state,
                'zip'                   => $item->zip,
                'source'                => $this->formatSourceUtm($item->source),
                'type'                  => $item->type,
                'concierge_state'       => $item->concierge_state,
                'over18'                => $item->over18
            ];
        });

        return $collection;
    }
}
