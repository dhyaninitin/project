<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCmsUserToFileTokenTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('file_tokens', function (Blueprint $table) {
            $table->unsignedBigInteger('cms_user_id')->nullable();

            $table->foreign('cms_user_id')
                  ->references('id')
                  ->on('cms_users')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('file_tokens', function (Blueprint $table) {
            $table->dropForeign(['cms_user_id']);
            $table->dropColumn('cms_user_id');
        });
    }
}
