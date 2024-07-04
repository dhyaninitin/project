<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\DonationTrait;

class DonationResource extends JsonResource
{
    use DonationTrait;
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
         return array(
            'donation_id'       => $this->id,
            'user_id'           => $this->user_id,
            'first_name'        => $this->fname,
            'last_name'         => $this->lname,
            'email'             => $this->email,
            'contact_number'    => $this->contact_number,
            'donation_amount'   => $this->donation_amount,
            'donation_type'     => $this->formatDonationtype($this->donation_type),
            'city'              => $this->formatCity($this->city),
            'country'           => $this->formatCountry($this->country),
            'payment_method'    => $this->formatpaymetMethod($this->payment_method),
            'transcation_id'    => $this->transcation_id,
            'payment_date'      => date('Y-m-d',strtotime($this->payment_date)),
            'payment_sts'       => $this->payment_sts,
            'transcation_id'    => $this->transcation_id,
        );
    }
}
