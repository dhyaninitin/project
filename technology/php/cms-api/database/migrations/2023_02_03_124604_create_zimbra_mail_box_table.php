<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateZimbraMailBoxTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('mailbox', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('mail_id')->nullable();
            $table->integer('thread_id')->nullable();
            $table->string('to')->nullable();
            $table->string('from')->nullable();
            $table->string('user_name')->nullable();
            $table->string('subject')->nullable();
            $table->text('message')->nullable();
            $table->string('type')->nullable();
            $table->integer('status')->default(0);
            $table->integer('file_status')->default(0);
            $table->text('file_name')->nullable();
            $table->string('attachment_status')->nullable();
            $table->string('file_path')->nullable();
            $table->text('private_key')->nullable();
            $table->text('pass_phrase')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('zimbra_mail_box');
    }
}
