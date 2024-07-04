<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Route;
use App\Http\Requests\Traits\HasApiResponseTrait;
use App\Http\Requests\Traits\RequestValidationTrait;
use App\Services\SchoolService;

class StudentRequest extends FormRequest
{
    use HasApiResponseTrait;
    use RequestValidationTrait;

    protected $validationRules = [
        'sc_reg_id' => 'required|int|max:255',
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
            'student_name' => 'required|array|min:1|max:15',
            'student_class' => 'required|array|min:1|max:15',
            'academic_year' => 'required|array|min:1|max:15',
            'roll_no' => 'required|array|min:1|max:15',
            'gender'  => 'required|array|min:1|max:15',
            'dob'     => 'required|array|min:1|max:15',
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
        $service = $SchoolService->getstudent($id);
        $rules = [
            'school_type' => 'required|int|max:2',
            'student_name' => 'required|string|min:1|max:15',
            'student_class' => 'required|int|min:1|max:15',
            'academic_year' => 'required|int|min:1|max:15',
            'gender'  => 'required|int|min:1|max:15',
            'dob'     => 'required|string|min:1|max:15',
            'roll_no' => 'required|int|min:1|max:15',

        ];
         
        return array_merge($this->validationRules, $rules);
    }
}
