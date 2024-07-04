<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUuidInWorkflowEventHistory extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('workflow_event_history', function (Blueprint $table) {
            $table->string('action_uuid')->nullable()->after('sequence_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('workflow_event_history', function (Blueprint $table) {
            $table->dropColumn('action_uuid');
        });
    }
}
