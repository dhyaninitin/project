<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddDealerIdToInventory extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('m_inventories', function (Blueprint $table) {
            $table->unsignedBigInteger('m_dealer_id')->nullable()->after('id');

            $table->foreign('m_dealer_id')
                  ->references('id')
                  ->on('m_dealers')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('m_inventories', function (Blueprint $table) {
            $table->dropForeign(['m_dealer_id']);
            $table->dropColumn('m_dealer_id');
        });
    }
}
