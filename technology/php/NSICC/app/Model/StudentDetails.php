<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class StudentDetails extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'student_basic_details';

    protected $connection = 'mysql';
    //public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['sc_reg_id','school_type','academic_year','student_name','roll_no','student_grade','student_class','gender','dob','IsArabicSpeak','IsEnglishSpeak','IsOtherSpeak','CanReadArabic','CanWriteArabic','IsRegisterKLM','child_memory','additional_info','pickup_person_name','approved_sts','approve_by_user','created_at','updated_at','archive'];

}