<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Added2FactorToCmsUserTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $database = getenv('DB_DATABASE');
        Schema::table("{$database}.cms_users", function (Blueprint $table) {
            $table->integer('two_factor_slider')->default(0)->nullable()->comment('0=off,1=on');
            $table->integer('two_factor_option')->nullable()->comment('0=phone,1=google');
            $table->string('two_factor_token')->nullable();
            $table->integer('is_verify')->default(0);
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
