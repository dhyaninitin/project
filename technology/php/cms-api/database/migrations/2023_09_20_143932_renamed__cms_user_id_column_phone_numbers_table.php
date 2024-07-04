<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class RenamedCmsUserIdColumnPhoneNumbersTable extends Migration
{
     /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("phone_numbers", function (Blueprint $table) {
            $table->renameColumn("cms_user_id", "portal_user_id");
        });
    }    

    public function down()
    {
        Schema::table("phone_numbers", function (Blueprint $table) {
            $table->renameColumn("portal_user_id", "cms_user_id");
        });
    }  
}
