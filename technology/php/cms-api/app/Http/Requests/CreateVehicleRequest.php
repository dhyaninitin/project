<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Http\Requests\Traits\HasApiResponseTrait;
use App\Http\Requests\Traits\RequestValidationTrait;

class CreateVehicleRequest extends FormRequest
{
    use HasApiResponseTrait;
    use RequestValidationTrait;
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
        $rules = [
            'user_id'           => 'required|exists:mysql-user.user,id',
            'vehicle_id'        => 'required|exists:mysql-user.vehicles,id',
            'dealstage_id'      => 'required|exists:mysql-user.deal_stage,stage_id',
        ];
        return $rules;
    }
}
