<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Expression;

class CreateQuotesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('quotes', function (Blueprint $table) {
            $user_database = DB::connection("mysql-user")->getDatabaseName();

            $table->bigIncrements('id');
            $table->unsignedInteger('request_id')->nullable(false);
            $table->string('stock_no')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('contract_date')->nullable();
            $table->string('year')->nullable();
            $table->string('make')->nullable();
            $table->string('model')->nullable();
            $table->string('delivery_date')->nullable();
            $table->string('salesman')->nullable();
            $table->string('vin')->nullable();
            $table->string('business_manager')->nullable();
            $table->string('drive_off')->nullable();
            $table->text('notes')->nullable();
            $table->string('allowance_wholesale')->nullable();
            $table->string('year_wholesale')->nullable();
            $table->string('make_wholesale')->nullable();
            $table->string('model_wholesale')->nullable();
            $table->string('vin_wholesale')->nullable();
            $table->tinyInteger('type_wholesale')->nullable();
            $table->text('notes_wholesale')->nullable();
            $table->text('customersWholeSale')->nullable();
            $table->text('expenseChargedClient')->nullable();
            $table->string('allowance_chargedclient')->nullable();
            $table->string('allowance_chargeddealer')->nullable();
            $table->string('remaining_payments_chargedclient')->nullable();
            $table->string('payment_chargedclient')->nullable();
            $table->string('total_payment_chargedclient')->nullable();
            $table->string('total_chargedclient')->nullable();
            $table->text('expenseVendor')->nullable();
            $table->string('total_expensevendor')->nullable();
            $table->string('brokeer_fee_expensevendor')->nullable();
            $table->tinyInteger('paid_by_expensevendor')->nullable();
            $table->string('adds_expensevendor')->nullable();
            $table->string('gross_expensevendor')->nullable();
            $table->string('expense_actual_expensevendor')->nullable();
            $table->string('pack_expensevendor')->nullable();
            $table->string('net_expensevendor')->nullable();
            $table->string('comission_percent_expensevendor')->nullable();
            $table->string('comission_amount_expensevendor')->nullable();
            $table->string('company_net_expensevendor')->nullable();
            $table->string('invoice_dealer_expensevendor')->nullable();
            $table->string('check_to_dealer_expensevendor')->nullable();
            $table->string('check_to_client_expensevendor')->nullable();
            $table->timestamps();

            $table->foreign('request_id')
                  ->references('id')
                  ->on(new Expression($user_database . '.vehicle_requests'))
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('quotes');
    }
}
