<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;
use App\Traits\DonationTrait;

class ExpenseCollection extends ResourceCollection
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
                'id'                => $item->id,
                'user_id'           => $item->created_by_user_id,
                'expense_category'  => $this->formatExpenseCategory($item->expense_cat_id),
                'paid_to'           => $item->paid_to,
                'description'       => $item->description,
                'payment_method'    => $this->formatpaymetMethod($item->payment_method),
                'account_number'    => $this->formatAccountNumber($item->account_number),
                'cheque_number'     => $item->cheque_number,
                'hst'               => $item->hst,
                'amount'            => $item->amount,
                'created_at'        => date('Y-m-d',strtotime($item->created_at)),
                'modified_at'       => date('Y-m-d',strtotime($item->modified_at)),
                'archive'           => $item->archive,
            ];
        });

        return $collection;
    }
}
