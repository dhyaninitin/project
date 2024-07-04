<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMDealersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('m_dealers', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name')->nullable(false);
            $table->tinyInteger('account_type')->nullable(false)->default(0);
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('phone')->nullable();
            $table->float('monthly_fee')->nullable();
            $table->tinyInteger('is_active')->nullable(false)->default(true);
            $table->tinyInteger('api_status')->nullable(false)->default(true);
            $table->timestamp('m_activated_at')->nullable();
            $table->timestamp('m_beta_end_at')->nullable();
            $table->timestamp('m_created_at')->nullable();
            $table->timestamp('m_disabled_at')->nullable();
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
        Schema::dropIfExists('m_dealers');
    }
}
