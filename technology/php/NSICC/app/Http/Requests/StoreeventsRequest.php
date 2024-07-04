<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreeventsRequest extends FormRequest
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
            'event_title'       => 'required|string|min:2',
            'short_description' => 'required|string|min:2', 
            'long_description'  => 'required|string|min:2',
            'event_venue'       => 'required|string|min:2', 
            'event_organizer'   => 'required|string|min:2',
            'contact_number'    => 'min:10|numeric',
            'email'             => 'required|string|email',
            'event_date'        => 'required|date_format:Y-m-d',
            'event_start_time'  => 'date_format:H:i:s',
            'event_end_time'    => 'date_format:H:i:s',
            'event_cost'        => 'required|int|max:255',
            'event_type'        => 'numeric',
            'recurring_type'    => 'numeric',
            'event_cost_type'   => 'numeric',
            'registration_required' => 'numeric',
            'registration_capacity' => 'numeric',
        ];
    }
}
