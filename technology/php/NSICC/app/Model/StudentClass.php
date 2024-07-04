<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class StudentClass extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'master_student_class';

    protected $connection = 'mysql';
    //public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['student_class_id','class_name','created_at','archive'];

}