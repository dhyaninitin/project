<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Route;
use App\Http\Requests\Traits\HasApiResponseTrait;
use App\Http\Requests\Traits\RequestValidationTrait;
use App\Services\SchoolService;

class SchoolRequest extends FormRequest
{
    use HasApiResponseTrait;
    use RequestValidationTrait;

    protected $validationRules = [
        'email' => 'required|string|max:255|unique:users',
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
            'school_type' => 'required|int|max:2',
            'parent_full_name' => 'required|string',
            'relationship_with_child' => 'required|string',
            'no_of_child' => 'required|int',
            'student_name' => 'required|array|min:1|max:15',
            'student_class' => 'required|array|min:1|max:15',
            'academic_year' => 'required|array|min:1|max:15',
            'roll_no' => 'required|array|min:1|max:15',
            'gender' => 'required|array|min:1|max:15',
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
        
        $SchoolService = new SchoolService();
        $service = $SchoolService->getSchoolReg($id);
        $rules = [
            'email'     => ['sometimes', Rule::unique('mysql.school_registrations')->ignore($id)],
            'roll_no' => 'required|array|min:1|max:15|unique:student_basic_details',

        ];
         
        return array_merge($this->validationRules, $rules);
    }
}
