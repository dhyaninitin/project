<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class WorkflowProperty extends Model
{
   /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'workflow_property';

    protected $connection = 'mysql';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'table_type','name', 'type', 'created_at', 'updated_at'
    ]; 
    
}
