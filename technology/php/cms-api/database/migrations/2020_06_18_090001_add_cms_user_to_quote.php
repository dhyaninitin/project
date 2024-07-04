<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCmsUserToQuote extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn('salesman');
            $table->unsignedBigInteger('cms_user_id')->nullable(true);

            $table->foreign('cms_user_id')
                ->references('id')
                ->on('cms_users')
                ->onDelete('SET NULL');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->string('salesman')->nullable();
            $table->dropForeign(['cms_user_id']);
            $table->dropColumn('cms_user_id');
        });
    }
}
