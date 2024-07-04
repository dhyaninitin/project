<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLastIndexedPageTable extends Migration
{
     /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('last_indexed_page', function (Blueprint $table) {  
            $table->bigIncrements('id');
            $table->string('name')->nullable();
            $table->integer('value')->nullable();
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
        Schema::dropIfExists('last_indexed_page');
    }
}
