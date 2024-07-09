<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class HubspotWorkFlows extends Model
{
   /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'hubspot_workflow';

    protected $connection = 'mysql';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'wf_name','type','triggers','actions','is_active','is_activation','added_by','workflow_execute_time','schedule_time','created_at','updated_at','activation_updated_at', 'enrollment_count'
    ];

    /**
     * Get all of the workflow  logs
     */
    public function logs()
    {
        return $this->morphMany('App\Model\Log', 'target');
    }


}
