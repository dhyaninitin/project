<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Route;
use App\Http\Requests\Traits\HasApiResponseTrait;
use App\Http\Requests\Traits\RequestValidationTrait;
use App\Services\FuneralService;

class FuneralRequest extends FormRequest
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
            'deceased_name' => 'required|string|max:255',
            'dob' => 'required|date',
            'dod' => 'required|date',
            'funeral_executor_name' => 'string|max:255',
            'contact' => 'numeric|digits:10',
            'cause_of_death' => 'string|max:255',
            'body_location' => 'string|max:255',
            'addition_info' => 'string|max:255',
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
        $funeralService = new FuneralService();
        $service = $funeralService->getFuneral($id);

        $rules = [
            'deceased_name' => 'required|string|max:255',
            'dob' => 'required|date',
            'dod' => 'required|date',
            'funeral_executor_name' => 'string|max:255',
            'contact' => 'numeric|digits:10',
            'cause_of_death' => 'string|max:255',
            'body_location' => 'string|max:255',
            'addition_info' => 'string|max:255',
            'email'     => ['sometimes', Rule::unique('mysql.funeral_service')->ignore($service->id)],
        ];

        return array_merge($this->validationRules, $rules);
    }
}
