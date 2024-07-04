<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class MatrimonialServices extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'matrimonial_service';

    protected $connection = 'mysql';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['user_id','full_name','email','age','gender','home_contact_number','personal_contact_number','parent_name','parent_phone','address','city','province','postal_code','country','nationality','ethnic_background','marital_status','height','complexion','religion','education','parent_education','sibling_info','other_info','spouse_requirements','created_at','updated_at'];
    
    
}
