<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWholesalequoteTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('wholesale_quote', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('wholesale_stock_no')->nullable();
            $table->string('sale_date')->nullable();
            $table->string('year')->nullable();
            $table->string('make')->nullable();
            $table->string('model')->nullable();
            $table->string('sold_to')->nullable();
            $table->unsignedBigInteger('wholesale_sale_id')->nullable();
            $table->unsignedBigInteger('newcar_sale_id')->nullable();
            $table->string('vin')->nullable();
            $table->string('client_name')->nullable();
            $table->integer('auction_fee')->nullable();
            $table->string('purchase_order_ids')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->integer('sale_amount')->nullable();
            $table->string('from_new')->nullable();
            $table->integer('payoff_amount')->nullable();
            $table->text('paid_by')->nullable();
            $table->text('allowance_to_new')->nullable();
            $table->integer('check_to_client')->nullable();
            $table->integer('check_to_dealer')->nullable();
            $table->integer('gross_profit')->nullable();
            $table->text('repairs')->nullable();
            $table->integer('net_amount')->nullable();
            $table->integer('wholesale_commission')->nullable();
            $table->integer('pack_fee')->nullable();
            $table->integer('newcar_commission')->nullable();
            $table->integer('company_net')->nullable();
            $table->text('expenseChargedClient')->nullable();
            $table->text('expenseChargedDealer')->nullable();
            $table->integer('allowance_chargedclient')->nullable();
            $table->integer('remaining_payments_chargedclient')->nullable();
            $table->integer('payment_chargedclient')->nullable();
            $table->unsignedBigInteger('dealer_id')->nullable();
            $table->unsignedBigInteger('dealer_contact_id')->nullable();
            $table->unsignedBigInteger('quote_id')->nullable();
            $table->string('allowance_from')->nullable();
            $table->string('title_payoff_date')->nullable();
            $table->string('title_receive_date')->nullable();
            $table->text('customersWholeSale')->nullable();
            $table->text('expenseVendor')->nullable();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('wholesale_quote');
    }
}
