<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCallsTable extends Migration
{
     /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('calls', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('external_source_id')->index();
            $table->string('direction');
            $table->integer('duration')->default(0);
            $table->string('contact_number')->nullable();
            $table->string('disposition')->nullable();
            $table->text('notes')->nullable();
            $table->text('recording')->nullable();
            $table->unsignedBigInteger('portaluser_id')->nullable();
            $table->unsignedBigInteger('phone_number_id');
            $table->timestamp('call_time');
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
        Schema::dropIfExists('calls');
    }
}
