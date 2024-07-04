<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateContactOwners extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $db_name = getenv('DB_DATABASE_SECOND');
        Schema::table("{$db_name}.contact_owners", function (Blueprint $table) {
            $table->text('rr_days')->nullable();
            $table->text('rr_source')->nullable();
            $table->integer('rr_limit')->nullable()->default(0);
            $table->string('rr_timeframe')->nullable();
            $table->integer('rr_total_assigned')->default(0);
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
