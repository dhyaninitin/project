<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddMarkAsFinalColumnInWholesaleQuotesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('wholesale_quote', function (Blueprint $table) {
            $table->boolean('mark_as_final')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('wholesale_quote', function (Blueprint $table) {
            $table->dropColumn('mark_as_final')->nullable();
        });
    }
}
