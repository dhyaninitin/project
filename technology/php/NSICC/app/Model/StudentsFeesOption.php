<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class StudentsFeesOption extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'students_fees_option';

    protected $connection = 'mysql';
    //public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['option_name','no_of_child','cost','school_type','created_at'];

}