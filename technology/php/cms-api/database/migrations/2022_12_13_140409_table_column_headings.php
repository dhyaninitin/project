<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class TableColumnHeadings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $database = getenv('DB_DATABASE');
        Schema::create("{$database}.table_column_headings", function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('cmsuser_id')->nullable();
            $table->string('section_name')->nullable();
            $table->text('table_column')->nullable();
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
        Schema::dropIfExists('table_column_headings');
    }
}
