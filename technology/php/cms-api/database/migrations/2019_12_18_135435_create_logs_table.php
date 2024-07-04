<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('logs', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->text('content')->nullable();
            $table->string('category')->nullable();
            $table->string('action')->nullable();
            $table->boolean('is_read')->default(false);
            $table->boolean('is_view')->default(false);

            $table->unsignedBigInteger('target_id')->nullable();
            $table->string('target_type')->nullable();

            $table->unsignedBigInteger('cms_user_id')->nullable();

            $table->foreign('cms_user_id')
                  ->references('id')
                  ->on('cms_users')
                  ->onDelete('cascade');

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
        Schema::dropIfExists('logs');
    }
}
