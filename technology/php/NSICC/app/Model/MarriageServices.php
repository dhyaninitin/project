<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class MarriageServices extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'marriage_service';

    protected $connection = 'mysql';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['user_id','marriage_date','ceremony_address','ceremony_people_count','groom_full_name','bride_full_name','email','contact_number','premarital_counseling_day','marriage_license','witness','additional_info'];


}
