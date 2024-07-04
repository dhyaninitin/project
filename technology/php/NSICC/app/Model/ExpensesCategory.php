<?php
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class ExpensesCategory extends Model
{
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'expense_category';

    protected $connection = 'mysql';
    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['cat_name','created_at','modified_at','archive'];

}