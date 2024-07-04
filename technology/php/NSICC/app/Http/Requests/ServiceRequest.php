<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Route;
use App\Http\Requests\Traits\HasApiResponseTrait;
use App\Http\Requests\Traits\RequestValidationTrait;
use App\Services\MservicesService;

class ServiceRequest extends FormRequest
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
            'marriage_date' => 'required|date|max:255',
            'ceremony_people_count' => 'required|int|max:255',
            'groom_full_name' => 'required|string|max:255',
            'premarital_counseling_day' => 'required|int|max:255',
            'marriage_license' => 'required|int|max:255',
            'witness' => 'required|int|max:255',
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
        $mservicesService = new MservicesService();
        $service = $mservicesService->getmarriage($id);

        $rules = [
            'email'     => ['sometimes', Rule::unique('mysql.marriage_service')->ignore($service->id)],
        ];

        return array_merge($this->validationRules, $rules);
    }
}
