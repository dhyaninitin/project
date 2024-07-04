<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateBrandTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $database = getenv('DB_DATABASE_SECOND');
        Schema::table("{$database}.brands", function (Blueprint $table) {
            $table->string('years')->nullable();
            $table->integer('is_active')->nullable()->default(0);
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
        Schema::table("{$database}.brands", function (Blueprint $table) {
            $table->string('years')->nullable();
            $table->integer('is_active')->nullable();

        });
    }
}
