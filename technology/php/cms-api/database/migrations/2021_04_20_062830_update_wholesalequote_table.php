<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateWholesalequoteTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('wholesale_quote', function (Blueprint $table) {
            $table->dropColumn('purchase_order_ids');
            $table->dropColumn('from_new');
            $table->float('auction_fee', null, 2)->nullable()->change();
            $table->float('sale_amount', null, 2)->nullable()->change();
            $table->float('payoff_amount', null, 2)->nullable()->change();
            $table->string('paid_by')->nullable()->change();
            $table->string('allowance_to_new')->nullable()->change();
            $table->string('check_to_client')->nullable()->change();
            $table->string('repairs')->nullable()->change();
            $table->float('net_amount', null, 2)->nullable()->change();
            $table->float('pack_fee', null, 2)->nullable()->change();
            $table->float('company_net', null, 2)->nullable()->change();
            $table->float('allowance_chargedclient', null, 2)->nullable()->change();
            $table->float('remaining_payments_chargedclient', null, 2)->nullable()->change();
            $table->string('allowance_from')->nullable()->change();  
            $table->float('wholesale_commission_amount', null, 2)->nullable();
            $table->float('newcar_commission_amount', null, 2)->nullable();
            $table->string('invoice_dealer_expensevendor')->nullable();
            $table->float('invoice_client_expensevendor', null, 2)->nullable();
            $table->string('check_to_dealer_expensevendor')->nullable();
            $table->string('check_to_client_expensevendor')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
