<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMMakesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('m_makes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('captive')->nullable();
            $table->tinyInteger('is_domestic')->nullable();
            $table->string('name')->nullable(false);
            $table->tinyInteger('is_new')->nullable(false)->default(true);
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
        Schema::dropIfExists('m_makes');
    }
}
