<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'donations';

    protected $connection = 'mysql';
    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['donation_id','user_id','fname','lname','email','contact_number','donation_amount','donation_type','city','country','payment_method','payment_sts','transcation_id','payment_date','created_at','modified_at','archive'];

}