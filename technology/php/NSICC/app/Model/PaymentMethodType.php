<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class PaymentMethodType extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'payment_method_type';

    protected $connection = 'mysql';
    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['payment_method_type_id','type_name','created_at','archive'];
}