<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateContactHubspotContactId extends Migration
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
            $table->bigInteger('hubspot_contact_id')->nullable();
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
            $table->dropColumn('hubspot_contact_id');
        });
    }
}
