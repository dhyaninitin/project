<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\RevenueTrait;
use Carbon\Carbon;

class PortalUserResource extends JsonResource
{
    use RevenueTrait;

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $roles = null;
        $permissions = null;
        if (isset($this->roles[0]))
        {
            $roles = $this->roles->map(function($p, $key) {
                return array(
                    'id'    => $p['id'],
                    'name'  => $p['name']
                );
            });
            $permissions = $this->roles[0]['permissions']->map(function($p, $key) {
                return array(
                    'id'    => $p['id'],
                    'name'  => $p['name']
                );
            });
        }
        $lastActiveDate = null;
        if(!empty($this->last_active)){
            $lastActiveDate = Carbon::parse($this->last_active)->setTimezone('America/Los_Angeles')->format('Y-m-d H:i:s');
        }
        $salesLicenseExpiryDate = null;
        if(!empty($this->sales_license_expiry_date)){
            $salesLicenseExpiryDate = Carbon::parse($this->sales_license_expiry_date)->setTimezone('America/Los_Angeles')->format('Y-m-d H:i:s');
        }
        
        return array(
            'id'                => $this->id,
            'first_name'        => $this->first_name,
            'last_name'         => $this->last_name,
            'full_name'         => $this->full_name,
            'location_id'       => json_decode($this->locations),
            'location'          => $this->getLocation(json_decode($this->locations)),
            'email'             => $this->email,
            'personalemail'     => $this->personalemail,
            'phone'             => $this->phone,
            'carblip_assigned_phone' => $this->getCarblipAssignedNumber($this->id),
            'roles'             => $roles,
            'permissions'       => $permissions,
            'roundrobin'        => $this->round_robin,
            'is_active'         => $this->is_active,
            'is_reset_password_required' => $this->is_reset_password_required,
            'profile_url'       => $this->profile_url,
            'discord_url'       => $this->discord_url,
            'facebook_url'      => $this->facebook_url,
            'linkedin_url'      => $this->linkedin_url,
            'instagram_url'     => $this->instagram_url,
            'twitter_url'       => $this->twitter_url,
            'tiktok_url'        => $this->tiktok_url,
            'promo_code'        => $this->promo_code,
            'city'              => $this->city,
            'state'             => $this->state,
            'city'              => $this->city,
            'sales_license_expiry_date' => $salesLicenseExpiryDate,
            'two_factor_slider' => $this->two_factor_slider,
            'two_factor_option' => $this->two_factor_option,
            'secretkey'         => $this->two_factor_token,
            'is_verify'         => $this->is_verify,
            'last_active'       => $lastActiveDate,
            'created_at'        => date('Y-m-d H:i:s', strtotime($this->created_at->timezone('America/Los_Angeles'))),
            'updated_at'        => date('Y-m-d H:i:s', strtotime($this->updated_at->timezone('America/Los_Angeles'))),
        );
    }
}
