<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'academic_year';

    protected $connection = 'mysql';
    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['academic_year_id','school_type','title','start_month','created_at'];
     /**
     * Get month associated with this model

     */
    public function academicmonth()
    {
        return $this->hasMany('App\Model\AcademicYearMonth', 'academic_year_id', 'academic_year_id');
    }

}