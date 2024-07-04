<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CmsDealStage extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {   
        $database = getenv('DB_DATABASE');
        Schema::create("{$database}.cms_deal_stage", function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('stage_id')->nullable();
            $table->string('label')->nullable();
            $table->tinyInteger('order')->nullable();
            $table->tinyInteger('active')->nullable();
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
        //
    }
}
