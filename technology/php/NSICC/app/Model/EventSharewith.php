<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class EventSharewith extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'event_share_with';

    protected $connection = 'mysql';
    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['event_id','share_id'];

}