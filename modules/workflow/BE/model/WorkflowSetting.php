<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class WorkflowSetting extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $connection = 'mysql';
    protected $table = 'workflow_setting';

    public $timestamps = true;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id','enrollment_number', 'portal_users'
    ];
    

}
