<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPortalDealStageColumnVehicleRequests extends Migration
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
            $table->string('portal_deal_stage')->nullable();
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
        Schema::table("{$database}.vehicle_requests", function (Blueprint $table) {
            $table->string('portal_deal_stage')->nullable();
        });
    }
}
