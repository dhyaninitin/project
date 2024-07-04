<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'country';

    protected $connection = 'mysql';
    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['country_name','archive'];

}