<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'city';

    protected $connection = 'mysql';
    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['state_id','city_name','archive'];
}