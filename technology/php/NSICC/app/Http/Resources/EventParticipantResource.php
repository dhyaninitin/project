<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EventParticipantResource extends JsonResource
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
            'event_participant_id'    => $this->id,
            'event_id'                => $this->event_reg_id,
            'full_name'               => $this->full_name,
            'email'                   => $this->email,
            'contact_number'          => $this->contact_number,
            'gender'                  => $this->gender,
            'age'                     => $this->age,
            'created_at'              => $this->created_at,
            'modifed_at'              => $this->modified_at,
            'archive'                 => $this->archive,
        );
    }
}
