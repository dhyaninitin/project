<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateQuoteFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn('allowance_chargeddealer');
            $table->dropColumn('remaining_payments_chargeddealer');
            $table->dropColumn('payment_chargeddealer');
            $table->dropColumn('total_payment_chargeddealer');
            $table->dropColumn('date_paid_expensevendor');
            $table->dropColumn('check_number_expensevendor');

            $table->string('client_date_paid_expensevendor')->nullable();
            $table->integer('client_check_number_expensevendor')->nullable();
            $table->string('dealer_date_paid_expensevendor')->nullable();
            $table->integer('dealer_check_number_expensevendor')->nullable();
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
            $table->string('allowance_chargeddealer')->nullable();
            $table->string('remaining_payments_chargeddealer')->nullable();
            $table->string('payment_chargeddealer')->nullable();
            $table->string('total_payment_chargeddealer')->nullable();
            $table->string('date_paid_expensevendor');
            $table->integer('check_number_expensevendor');

            $table->dropColumn('client_date_paid_expensevendor');
            $table->dropColumn('client_check_number_expensevendor');
            $table->dropColumn('dealer_date_paid_expensevendor');
            $table->dropColumn('dealer_check_number_expensevendor');
        });
    }
}
