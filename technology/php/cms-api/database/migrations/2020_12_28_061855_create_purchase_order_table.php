<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePurchaseOrderTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('purchase_order', function (Blueprint $table) {
            $table->bigIncrements('id'); 
            $table->integer('quote_id')->nullable();
            $table->integer('vendor_id')->nullable();
            $table->integer('vendor_contact_id')->nullable();
            $table->string('description')->nullable();
            $table->integer('amount')->nullable();
            $table->integer('request_approval_from')->nullable();
            $table->boolean('approved')->nullable(); 
            $table->string('payment_date')->nullable();
            $table->string('category')->nullable();
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
        Schema::dropIfExists('purchase_order');
    }
}
