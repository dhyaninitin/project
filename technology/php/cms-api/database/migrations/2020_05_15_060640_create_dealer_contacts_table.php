<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDealerContactsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('dealer_contacts', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name')->nullable(false);
            $table->string('title')->nullable(true);
            $table->string('email')->nullable(false)->unique();
            $table->string('phone')->nullable(false);
            $table->unsignedBigInteger('dealer_id')->nullable(true);

            $table->foreign('dealer_id')
                  ->references('id')
                  ->on('dealers')
                  ->onDelete('SET NULL');
            
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
        Schema::dropIfExists('dealer_contacts');
    }
}
