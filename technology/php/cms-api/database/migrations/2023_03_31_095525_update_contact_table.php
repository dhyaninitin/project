<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateContactTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $database = getenv('DB_DATABASE_SECOND');
        Schema::table("{$database}.user", function (Blueprint $table) {
            $table->integer('type')->nullable()->comment('0=none,1=Concierge');;
            $table->string('concierge_state')->nullable();
            $table->integer('over18')->default(0)->nullable()->comment('0=none,1=yes,2=no');;
        });
    }

    /**
     * Reverse the migrations.
     *user
     * @return void
     */
    public function down()
    {
        //
    }
}
