<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class EventParticipantCollection extends ResourceCollection
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
                    'event_participant_id'    => $item->id,
                    'event_id'                => $item->event_reg_id,
                    'full_name'               => $item->full_name,
                    'email'                   => $item->email,
                    'contact_number'          => $item->contact_number,
                    'gender'                  => $item->gender,
                    'age'                     => $item->age,
                    'created_at'              => $item->created_at,
                    'modifed_at'              => $item->modified_at,
                    'archive'                 => $item->archive,
            ];
        });
        return $collection;
    }
}
