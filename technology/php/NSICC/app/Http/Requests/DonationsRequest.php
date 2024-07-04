<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DonationsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'first_name'        => 'required|min:1|max:255',
            'last_name'         => 'sometimes|max:255', 
            'email'             => 'required', 
            'contact_number'    => 'min:10|numeric', 
            'donation_amount'   => 'min:1|numeric', 
            'donation_type'     => 'min:1|numeric', 
            'payment_method'    => 'min:1|numeric',

        ];
    }
}
