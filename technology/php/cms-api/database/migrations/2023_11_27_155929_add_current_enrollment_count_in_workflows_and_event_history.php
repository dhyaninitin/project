<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCurrentEnrollmentCountInWorkflowsAndEventHistory extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('hubspot_workflow', function (Blueprint $table) {
            $table->integer('enrollment_count')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('hubspot_workflow', function (Blueprint $table) {
            $table->dropColumn('enrollment_count');
        });
    }
}
