<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateScraperLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {   
        $database = getenv('DB_DATABASE_SECOND');
        Schema::create("{$database}.scrapers_logs", function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('content')->nullable();
            $table->integer('status')->nullable();
            $table->integer('status_type')->default(0);
            $table->integer('is_running')->default(0);
            $table->integer('scraper_type')->nullable()->comment('0=year, 1= Brand, 2=model, 3= Trim,4=media');;
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
        $database = getenv('DB_DATABASE_SECOND');
        Schema::dropIfExists("{$database}.scrapers_logs");
    }
}
