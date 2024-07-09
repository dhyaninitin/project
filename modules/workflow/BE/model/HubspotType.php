<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class HubspotType extends Model
{
   /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'hubspot_trigger_type';

    protected $connection = 'mysql';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'trigger_type', 'created_at','updated_at'
    ]; 

   
}
