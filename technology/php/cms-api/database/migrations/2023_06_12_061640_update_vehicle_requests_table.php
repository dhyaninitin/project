<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateVehicleRequestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $database = getenv('DB_DATABASE_SECOND');
        Schema::table("{$database}.vehicle_requests", function (Blueprint $table) {
            $table->string('deposit_status')->nullable();
            $table->string('credit_application_status')->nullable();
            $table->string('insurance_status')->nullable();
            $table->string('send_tradein_form')->nullable();
            $table->string('tradein_acv')->nullable();
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
