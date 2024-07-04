<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Passport\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Nsiccuser extends Model
{
    use HasFactory,HasApiTokens;

    protected $guard_name = 'api';
    protected $connection = 'mysql';
    protected $table = 'users';

    protected $fillable = [
        'frist_name', 'last_name', 'email', 'contactnumber', 'password','remember_token', 'birthdate', 'user_type', 'permissions', 'created_at', 'updated_at'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];
}
