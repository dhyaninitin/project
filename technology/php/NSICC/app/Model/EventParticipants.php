<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class EventParticipants extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'event_participants';

    protected $connection = 'mysql';
    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['event_reg_id','full_name','email','contact_number','gender','age','created_at','modified_at','archive'];

}