<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class AcademicYearMonth extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'academic_year_month';

    protected $connection = 'mysql';
    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['academic_month_id','academic_year_id','school_type','month','year','created_at'];

}