<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'school_registrations';

    protected $connection = 'mysql';
    //public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['user_id','school_type','parent_full_name','email','contact_number','relationship_with_child','whatsapps_available','whatsapps_number','no_of_child','created_at','updated_at','archive'];

}