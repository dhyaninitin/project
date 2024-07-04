<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateQuoteTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn('brokeer_fee_expensevendor');
            $table->double('brokeer_fee_dealer_expensevendor')->nullable(true)->default(0);
            $table->double('brokeer_fee_customer_expensevendor')->nullable(true)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->double('brokeer_fee_expensevendor')->nullable(true)->default(0);
            $table->dropColumn('brokeer_fee_dealer_expensevendor');
            $table->dropColumn('brokeer_fee_customer_expensevendor');
        });
    }
}
