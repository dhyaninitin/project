<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateQuotes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $database = getenv('DB_DATABASE');
        Schema::table("{$database}.quotes", function (Blueprint $table) {
            $table->tinyInteger('delivery_or_pickup')->nullable();
            $table->double('msrp')->nullable();
            $table->string('maturity_date')->nullable();
            $table->string('mileage_allotment')->nullable();
            $table->double('monthly_payment')->nullable();
            $table->string('residual_value')->nullable();
            $table->double('sale_price')->nullable();
            $table->string('term')->nullable();
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
