<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Route;
use App\Http\Requests\Traits\HasApiResponseTrait;
use App\Http\Requests\Traits\RequestValidationTrait;
use App\Services\UserService;

class UserRequest extends FormRequest
{
    use HasApiResponseTrait;
    use RequestValidationTrait;

    protected $validationRules = [
        'first_name'    => 'required|min:1|max:255',
        'last_name'     => 'sometimes|max:255',
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
            'email_address' => 'required|email|unique:mysql-user.user,email_address',
            'phone' => 'required|unique:mysql-user.user,phone',
            'contact_owner_email' => 'required|email|exists:portal_users,email',
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
        $userService = new UserService();
        $user = $userService->get($id);

        $rules = [
            'email_address'     => ['sometimes', Rule::unique('mysql-user.user')->ignore($user->id)],
            'phone'     => ['sometimes', Rule::unique('mysql-user.user')->ignore($user->id)],
            'contact_owner_email' => 'sometimes|email|exists:portal_users,email',
        ];

        return array_merge($this->validationRules, $rules);
    }
}
