<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPhonesourceidColumnPhoneNumbersTable extends Migration
{
     /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('phone_numbers', function (Blueprint $table) {
            $table->unsignedBigInteger('phone_source_id')->nullable();

            $table->foreign('phone_source_id')->references('id')->on('phone_sources');
        });
    }    
}
