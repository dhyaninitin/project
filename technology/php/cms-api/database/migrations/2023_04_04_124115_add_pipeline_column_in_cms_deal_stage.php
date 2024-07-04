<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPipelineColumnInCmsDealStage extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $database = getenv('DB_DATABASE');
        Schema::table("{$database}.cms_deal_stage", function (Blueprint $table) {
            $table->string('pipeline')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $database = getenv('DB_DATABASE');
        Schema::table("{$database}.cms_deal_stage", function (Blueprint $table) {
            $table->dropColumn('pipeline');
        });
    }
}
