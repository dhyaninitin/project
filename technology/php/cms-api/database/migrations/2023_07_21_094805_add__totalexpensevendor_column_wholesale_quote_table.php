<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTotalexpensevendorColumnWholesaleQuoteTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('wholesale_quote', function (Blueprint $table) {
            $table->string('total_expensevendor')->nullable();
        });
    }
    
}
