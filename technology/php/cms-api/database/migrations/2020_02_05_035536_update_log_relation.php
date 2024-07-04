<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateLogRelation extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('logs', function (Blueprint $table) {
            $table->dropForeign(['cms_user_id']);
            $table->foreign('cms_user_id')
                  ->references('id')
                  ->on('cms_users')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('logs', function (Blueprint $table) {
            $table->dropForeign(['cms_user_id']);
            $table->foreign('cms_user_id')
                  ->references('id')
                  ->on('cms_users')
                  ->onDelete('cascade');
        });
    }
}
