<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class HubspotWorkflow extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $database = getenv('DB_DATABASE');
        Schema::create("{$database}.hubspot_workflow", function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('wf_name')->nullable();
            $table->tinyInteger('type')->nullable();
            $table->text('triggers')->nullable();
            $table->text('actions')->nullable();
            $table->tinyInteger('is_active')->nullable();
            $table->tinyInteger('is_activation')->nullable();
            $table->tinyInteger('added_by')->nullable();
            $table->tinyInteger('workflow_execute_time')->nullable();
            $table->string('schedule_time')->nullable();
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
