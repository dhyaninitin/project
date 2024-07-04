<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUniqueMessageIdToMailboxTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('mailbox', function (Blueprint $table) {
            //
            $table->string('message_id', 255)->nullable();
            $table->integer('uniqueId', false, false)->length(11);
            $table->dateTime('mail_date')->nullable();

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('mailbox', function (Blueprint $table) {
            //
            $table->dropColumn('uniqueId');
            $table->dropColumn('message_id');
            $table->dropColumn('mail_date');

        });
    }
}