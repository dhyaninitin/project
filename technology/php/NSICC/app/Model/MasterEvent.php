<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class MasterEvent extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'master_events';

    protected $connection = 'mysql';
    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['created_by_user_id','event_title','short_description','long_description','event_venue','event_organizer','event_cover_img','event_website_link','google_location_link','email','contact_number','event_date','event_start_time','event_end_time','event_type','recurring_type','event_cost_type','event_cost','registration_required','registration_capacity','approved','approved_by_user_id','created_at','modifed_at','archive'];

}