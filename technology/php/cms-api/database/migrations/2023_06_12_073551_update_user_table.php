<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateUserTable extends Migration
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
            $table->string('linkedin_profile')->nullable();
            $table->string('concierge_source')->nullable();
            $table->string('interview_scheduled')->nullable();
            $table->string('sales_license_status')->nullable();
            $table->string('sales_license')->nullable();
            $table->text('intake_questionaire_1')->nullable();
            $table->text('intake_questionaire_2')->nullable();
            $table->text('intake_questionaire_3')->nullable();
            $table->string('w2_sgned_date')->nullable();
            $table->string('onboarded_date')->nullable();
            $table->string('works_at_dealership')->nullable();
            $table->string('physical_sales_license_received')->nullable();
            $table->string('fico_score')->nullable();
            $table->string('hhi')->nullable();
            $table->string('sex')->nullable();
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
