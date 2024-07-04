<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddExpenseChargedDealerToQuote extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->string('allowance_chargeddealer')->nullable();
            $table->text('expenseChargedDealer')->nullable();
            $table->string('remaining_payments_chargeddealer')->nullable();
            $table->string('payment_chargeddealer')->nullable();
            $table->string('total_payment_chargeddealer')->nullable();
            $table->string('total_chargeddealer')->nullable();
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
            $table->dropColumn('allowance_chargeddealer');
            $table->dropColumn('expenseChargedDealer');
            $table->dropColumn('remaining_payments_chargeddealer');
            $table->dropColumn('payment_chargeddealer');
            $table->dropColumn('total_payment_chargeddealer');
            $table->dropColumn('total_chargeddealer');
        });
    }
}
