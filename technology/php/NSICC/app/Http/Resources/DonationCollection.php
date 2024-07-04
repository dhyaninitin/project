<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;
use App\Traits\DonationTrait;

class DonationCollection extends ResourceCollection
{
    use DonationTrait;
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
                'donation_id'       => $item->id,
                'user_id'           => $item->user_id,
                'first_name'        => $item->fname,
                'last_name'         => $item->lname,
                'email'             => $item->email,
                'contact_number'    => $item->contact_number,
                'donation_amount'   => $item->donation_amount,
                'donation_type'     => $this->formatDonationtype($item->donation_type),
                'city'              => $this->formatCity($item->city),
                'country'           => $this->formatCountry($item->country),
                'payment_method'    => $this->formatpaymetMethod($item->payment_method),
                'transcation_id'    => $item->transcation_id,
                'payment_date'      => date('Y-m-d',strtotime($item->payment_date)),
                'payment_sts'       => $item->payment_sts,
                'transcation_id'    => $item->transcation_id,
            ];
        });

        return $collection;
    }
}
    