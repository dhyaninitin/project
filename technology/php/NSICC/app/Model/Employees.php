<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Employees extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'employees';

    protected $connection = 'mysql';
    public $timestamps = true;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['fullname','email','contact_number','emp_code','created_at','updated_at','archive'];

}