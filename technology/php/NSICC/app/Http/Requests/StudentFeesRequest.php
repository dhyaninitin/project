<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Route;
use App\Http\Requests\Traits\HasApiResponseTrait;
use App\Http\Requests\Traits\RequestValidationTrait;
use App\Services\SchoolconfigService;

class StudentFeesRequest extends FormRequest
{
    use HasApiResponseTrait;
    use RequestValidationTrait;

    protected $validationRules = [
        'option_name' => 'required|string|max:255|unique:students_fees_option',
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
            'no_of_child' => 'required|int|max:10',
            'cost' => 'required|int',
            'school_type' => 'required|int',
        ];

        return array_merge($this->validationRules, $rules);
    }

     /**
     *
     * @return array
     */
    private function rulesPut(): array
    {
        $rules = [
            'no_of_child' => 'required|int|max:10',
            'cost' => 'required|int',
            'school_type' => 'required|int',
        ];

        return array_merge($this->validationRules, $rules);
    }
}
