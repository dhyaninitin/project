<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class FuneralServices extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'funeral_service';

    protected $connection = 'mysql';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['user_id','grave_number','deceased_name','dob','dod','funeral_executor_name','email','contact','cause_of_death','body_location','addition_info','approved_sts','approve_by_user','payment_type','payment_method','payment_amt','payment_sts','transcation_id','payment_date','created_at','updated_at'];
    
    
}
