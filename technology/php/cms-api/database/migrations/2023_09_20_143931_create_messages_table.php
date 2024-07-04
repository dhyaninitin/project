<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMessagesTable extends Migration
{
     /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {  
            $table->bigIncrements('id');
            $table->bigInteger('external_source_id')->index();
            $table->string('direction');
            $table->string('status');
            $table->string('body', 2000);
            $table->string('contact_number')->nullable();
            $table->unsignedBigInteger('portaluser_id')->nullable();
            $table->unsignedBigInteger('phone_number_id');
            $table->timestamp('message_time');
            $table->timestamps();

            $table->foreign('portaluser_id')->references('id')->on('portal_users');
            $table->foreign('phone_number_id')->references('id')->on('phone_numbers');
        });
    }

     /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('messages');
    }
}
