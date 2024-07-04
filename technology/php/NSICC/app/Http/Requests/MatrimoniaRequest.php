<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Route;
use App\Http\Requests\Traits\HasApiResponseTrait;
use App\Http\Requests\Traits\RequestValidationTrait;
use App\Services\MatrimonialService;

class MatrimoniaRequest extends FormRequest
{
    use HasApiResponseTrait;
    use RequestValidationTrait;

    protected $validationRules = [
        'email' => 'required|string|email|max:255|unique:users',
    ];
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
        return $this->{$this->getCallableValidationMethod()}();
    }

    /**
     *
     * @return array
     */
    private function rulesPost(): array
    {
        $rules = [
            'full_name' => 'required|string|max:255',
            'age' => 'required|int|max:255',
            'home_contact_number' => 'numeric|digits:10',
            'personal_contact_number' => 'numeric|digits:10',
            'parent_phone' => 'numeric|digits:10',
            'postal_code' => 'required|int|digits:5',
            'marital_status' => 'int|max:5',
            'province' => 'int|min:0',
            'city' => 'required|int|min:0',
            'country' => 'required|string|min:0',
        ];

        return array_merge($this->validationRules, $rules);
    }

     /**
     *
     * @return array
     */
    private function rulesPut(): array
    {
        $id = Route::current()->parameter('id');
        $matrimonialService = new MatrimonialService();
        $service = $matrimonialService->getMatrimonial($id);

        $rules = [
            'email'     => ['sometimes', Rule::unique('mysql.matrimonial_service')->ignore($service->id)],
        ];

        return array_merge($this->validationRules, $rules);
    }
}
