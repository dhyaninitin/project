<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class WorkflowVerification extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $connection = 'mysql';
    protected $table = 'workflow_verification';

    public $timestamps = true;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id','workflow_id', 'verification_code'
    ];

}
