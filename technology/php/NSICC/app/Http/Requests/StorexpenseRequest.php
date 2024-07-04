<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorexpenseRequest extends FormRequest
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
            'category_id'       => 'required', 
            'paid_to'           => 'required|string',
            'description'       => 'sometimes|string',
            'amount'            => 'required|numeric',
            'hst'               => 'sometimes|numeric',
            'payment_method'    => 'required|numeric',
        ];
    }
}
