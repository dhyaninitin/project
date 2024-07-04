<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
         return array(
                'event_id'                => $this->id,
                'created_by'              => $this->created_by_user_id,
                'event_title'             => $this->event_title,
                'short_description'       => $this->short_description,
                'long_description'        => $this->long_description,
                'event_venue'             => $this->event_venue,
                'event_organizer'         => $this->event_organizer,
                'event_cover_img'         => $this->event_cover_img,
                'event_website_link'      => $this->event_website_link,
                'google_location_link'    => $this->google_location_link,
                'phone'                   => $this->contact_number,
                'email'                   => $this->email,
                'event_date'              => $this->event_date,
                'event_start_time'        => $this->event_start_time,
                'event_end_time'          => $this->event_end_time,
                'event_type'              => $this->event_type,
                'recurring_type'          => $this->recurring_type,
                'event_cost_type'         => $this->event_cost_type,
                'event_cost'              => $this->event_cost,
                'registration_required'   => $this->registration_required,
                'registration_capacity'   => $this->registration_capacity,
                'share_with'              => $this->share_with,
                'approved'                => $this->approved,
                'approved_by'             => $this->approved_by_user_id,
                'created_at'              => $this->created_at,
                'modifed_at'              => $this->modifed_at,
                'archive'                 => $this->archive,
        );
    }
}
