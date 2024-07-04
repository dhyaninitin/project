<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class DonationType extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'donation_type';

    protected $connection = 'mysql';
    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['donation_type_id','type_name','created_at','archive'];

}