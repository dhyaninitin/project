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
            $table->string('concierge_referral_url')->nullable();
            $table->string('close_date')->nullable();
            $table->boolean('opted_out_email_important_update')->default(false);
            $table->boolean('opted_out_email_marketing_information')->default(false);
            $table->boolean('opted_out_email_one_to_one')->default(false);
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
        Schema::table("{$database}.user", function (Blueprint $table) {
            $table->dropColumn('concierge_referral_url');
            $table->dropColumn('close_date');
            $table->dropColumn('opted_out_email_important_update');
            $table->dropColumn('opted_out_email_marketing_information');
            $table->dropColumn('opted_out_email_one_to_one');
        });
    }
}
