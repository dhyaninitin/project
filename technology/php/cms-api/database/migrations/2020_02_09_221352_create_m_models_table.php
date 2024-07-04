<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMModelsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('m_models', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('m_make_id')->nullable();
            $table->string('name')->nullable(false);
            $table->tinyInteger('is_new')->nullable(false)->default(true);

            $table->foreign('m_make_id')
                  ->references('id')
                  ->on('m_makes')
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
        Schema::dropIfExists('m_models');
    }
}
