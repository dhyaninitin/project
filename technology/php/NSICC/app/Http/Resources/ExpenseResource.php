<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\DonationTrait;

class ExpenseResource extends JsonResource
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
                'id'                => $this->id,
                'user_id'           => $this->created_by_user_id,
                'expense_category'  => $this->formatExpenseCategory($this->expense_cat_id),
                'paid_to'           => $this->paid_to,
                'description'       => $this->description,
                'payment_method'    => $this->formatpaymetMethod($this->payment_method),
                'account_number'    => $this->formatAccountNumber($this->account_number),
                'cheque_number'     => $this->cheque_number,
                'hst'               => $this->hst,
                'amount'            => $this->amount,
                'created_at'        => date('Y-m-d',strtotime($this->created_at)),
                'modified_at'       => date('Y-m-d',strtotime($this->modified_at)),
                'archive'           => $this->archive,
        );
    }
}
