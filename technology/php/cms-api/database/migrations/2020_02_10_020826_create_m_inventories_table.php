<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMInventoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('m_inventories', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('inventory_id')->nullable(false);
            $table->unsignedBigInteger('m_make_id')->nullable(false);
            $table->unsignedBigInteger('m_model_id')->nullable(false);
            $table->integer('year')->nullable(false);
            $table->float('invoice')->nullable();
            $table->tinyInteger('is_new')->nullable(false)->default(true);
            $table->float('msrp')->nullable();
            $table->string('model_number')->nullable();
            $table->string('mscode')->nullable();
            $table->float('shipping')->nullable();
            $table->string('desc')->nullable();
            $table->integer('weight')->nullable();
            $table->string('year_display')->nullable(false);
            $table->float('base_msrp')->nullable();
            $table->integer('current_mileage')->nullable();
            $table->string('exterior_color')->nullable();
            $table->string('interior_color')->nullable();
            $table->integer('lot_age')->nullable();
            $table->float('price')->nullable();
            $table->string('stock_no')->nullable(false);
            $table->string('vin')->nullable(false);

            $table->foreign('m_make_id')
                  ->references('id')
                  ->on('m_makes')
                  ->onDelete('cascade');

            $table->foreign('m_model_id')
                  ->references('id')
                  ->on('m_models')
                  ->onDelete('cascade');

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
        Schema::dropIfExists('m_inventories');
    }
}
