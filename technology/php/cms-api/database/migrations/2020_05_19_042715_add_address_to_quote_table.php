<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddAddressToQuoteTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->string('address')->nullable(true);
            $table->string('city')->nullable(true);
            $table->string('state')->nullable(true);
            $table->string('zip')->nullable(true);
            $table->unsignedBigInteger('dealer_id')->nullable(true);
            $table->unsignedBigInteger('dealer_contact_id')->nullable(true);
            $table->double('tax_rate')->nullable(true);
            $table->double('license_fee')->nullable(true);
            $table->double('profit_due')->nullable(true);

            $table->foreign('dealer_id')
                  ->references('id')
                  ->on('dealers')
                  ->onDelete('SET NULL');

            $table->foreign('dealer_contact_id')
                  ->references('id')
                  ->on('dealer_contacts')
                  ->onDelete('SET NULL');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropForeign(['dealer_id']);
            $table->dropForeign(['dealer_contact_id']);
            $table->dropColumn(['address', 'city', 'state', 'zip', 'tax_rate',
                'license_fee', 'profit_due', 'dealer_id', 'dealer_contact_id']);
        });
    }
}
