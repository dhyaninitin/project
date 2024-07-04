<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class EventCollection extends ResourceCollection
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $collection = $this->collection->map(function($item){
            return [
                    'event_id'                => $item->id,
                    'created_by'              => $item->created_by_user_id,
                    'event_title'             => $item->event_title,
                    'short_description'       => $item->short_description,
                    'long_description'        => $item->long_description,
                    'event_venue'             => $item->event_venue,
                    'event_organizer'         => $item->event_organizer,
                    'event_cover_img'         => $item->event_cover_img,
                    'event_website_link'      => $item->event_website_link,
                    'google_location_link'    => $item->google_location_link,
                    'phone'                   => $item->contact_number,
                    'email'                   => $item->email,
                    'event_date'              => $item->event_date,
                    'event_start_time'        => $item->event_start_time,
                    'event_end_time'          => $item->event_end_time,
                    'event_type'              => $item->event_type,
                    'recurring_type'          => $item->recurring_type,
                    'event_cost_type'         => $item->event_cost_type,
                    'event_cost'              => $item->event_cost,
                    'registration_required'   => $item->registration_required,
                    'registration_capacity'   => $item->registration_capacity,
                    'share_with'              => $item->share_with,
                    'approved'                => $item->approved,
                    'approved_by'             => $item->approved_by_user_id,
                    'created_at'              => $item->created_at,
                    'modifed_at'              => $item->modifed_at,
                    'archive'                 => $item->archive,
            ];
        });
        return $collection;
    }
}
