<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Expenses extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'expenses';

    protected $connection = 'mysql';
    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['created_by_user_id','expense_cat_id','paid_to','description','payment_method','account_number','cheque_number','hst','amount','created_at','modified_at','archive'];

}