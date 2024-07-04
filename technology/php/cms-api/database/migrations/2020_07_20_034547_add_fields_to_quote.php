<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddFieldsToQuote extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->string('date_paid_expensevendor')->nullable(true);
            $table->double('check_number_expensevendor')->nullable(true)->default(0);
            $table->tinyInteger('net_deal_expensevendor')->nullable(true);
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
            $table->dropColumn('date_paid_expensevendor');
            $table->dropColumn('check_number_expensevendor');
            $table->dropColumn('net_deal_expensevendor');
        });
    }
}
