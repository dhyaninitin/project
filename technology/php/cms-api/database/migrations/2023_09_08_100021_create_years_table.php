<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateYearsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $database = getenv('DB_DATABASE_SECOND');
        Schema::create("{$database}.years", function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('year')->nullable();
            $table->integer('is_active')->default(0);
            $table->integer('is_scrapable')->default(0);
            $table->integer('is_default')->default(0);
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
        $database = getenv('DB_DATABASE_SECOND');
        Schema::dropIfExists("{$database}.years");
    }
}
