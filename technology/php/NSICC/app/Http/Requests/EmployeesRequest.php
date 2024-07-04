<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Route;
use App\Http\Requests\Traits\HasApiResponseTrait;
use App\Http\Requests\Traits\RequestValidationTrait;
use App\Services\EmployeesService;

class EmployeesRequest extends FormRequest
{
    use HasApiResponseTrait;
    use RequestValidationTrait;

    protected $validationRules = [
        'email' => 'required|string|email|max:255|unique:employees',
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
            'fullname' => 'required|string|max:255',
            'contact_number' => 'numeric|digits:10',
            'emp_code' => 'required|max:10',
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
        $employeesService = new EmployeesService();
        $service = $employeesService->getEmployee($id);
        $rules = [
            'fullname' => 'required|string|max:255',
            'contact_number' => 'numeric|digits:10',
            'emp_code' => 'required|max:10',
            'email'     => ['sometimes', Rule::unique('mysql.employees')->ignore($service->id)],
        ];

        return array_merge($this->validationRules, $rules);
    }
    public function messages()
    {
    return [
    'fullname.required' => 'The name is required',
    ];
    }
}
