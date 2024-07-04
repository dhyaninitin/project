<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class ExpensesAccounts extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'expense_account_number';

    protected $connection = 'mysql';
    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['user_id','account_number','modified_at','archive'];

}