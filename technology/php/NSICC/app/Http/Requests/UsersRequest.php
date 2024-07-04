<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UsersRequest extends FormRequest
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
            'first_name'    => 'required|min:1|max:255',
            'last_name'     => 'sometimes|max:255', 
            'email'         => 'required|unique:users',
            'contact_number'=> 'min:10|numeric',
            'role_id'     => 'min:1|numeric',
            'user_password' => 'required|min:8'
        ];
    }
}
