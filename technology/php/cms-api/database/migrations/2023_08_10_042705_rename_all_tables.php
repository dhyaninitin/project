<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class RenameAllTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("file_tokens", function (Blueprint $table) {
            $table->dropForeign(["cms_user_id"]);
        });

        Schema::table("logs", function (Blueprint $table) {
            $table->dropForeign(["cms_user_id"]);
        });

        Schema::table("quotes", function (Blueprint $table) {
            $table->dropForeign(["cms_user_id"]);
        });

        Schema::table("cms_users", function (Blueprint $table) {
            $table->dropForeign(["location_id"]);
        });

        Schema::rename("cms_users", "portal_users");
        Schema::rename("cms_deal_stage", "portal_deal_stage");
        Schema::rename("cms_user_phone_otp", "portal_user_phone_otp");

        Schema::table("portal_users", function (Blueprint $table) {
            $table
                ->foreign("location_id")
                ->references("id")
                ->on("locations")
                ->onDelete("restrict");
        });

        Schema::table("file_tokens", function (Blueprint $table) {
            $table->renameColumn("cms_user_id", "portal_user_id");
            $table
                ->foreign("portal_user_id")
                ->references("id")
                ->on("portal_users")
                ->onDelete("cascade");
        });

        Schema::table("logs", function (Blueprint $table) {
            $table->renameColumn("cms_user_id", "portal_user_id");
            $table
                ->foreign("portal_user_id")
                ->references("id")
                ->on("portal_users")
                ->onDelete("cascade");

            $table->renameColumn("cms_user_name", "portal_user_name");
        });

        Schema::table("quotes", function (Blueprint $table) {
            $table->renameColumn("cms_user_id", "portal_user_id");
            $table
                ->foreign("portal_user_id")
                ->references("id")
                ->on("portal_users")
                ->onDelete('SET NULL');
        });

        Schema::table("table_column_headings", function (Blueprint $table) {
            $table->renameColumn("cmsuser_id", "portaluser_id");
        });
    }

    public function down()
    {
        Schema::table("file_tokens", function (Blueprint $table) {
            $table->dropForeign(["portal_user_id"]);
        });

        Schema::table("logs", function (Blueprint $table) {
            $table->dropForeign(["portal_user_id"]);
        });

        Schema::table("quotes", function (Blueprint $table) {
            $table->dropForeign(["portal_user_id"]);
        });

        Schema::table("portal_users", function (Blueprint $table) {
            $table->dropForeign(["location_id"]);
        });

        Schema::rename("portal_users", "cms_users");
        Schema::rename("portal_deal_stage", "cms_deal_stage");
        Schema::rename("portal_user_phone_otp", "cms_user_phone_otp");

        Schema::table("cms_users", function (Blueprint $table) {
            $table
                ->foreign("location_id")
                ->references("id")
                ->on("locations")
                ->onDelete("restrict");
        });

        Schema::table("file_tokens", function (Blueprint $table) {
            $table->renameColumn("portal_user_id", "cms_user_id");
            $table
                ->foreign("cms_user_id")
                ->references("id")
                ->on("cms_users")
                ->onDelete("cascade");
        });

        Schema::table("logs", function (Blueprint $table) {
            $table->renameColumn("portal_user_id", "cms_user_id");
            $table
                ->foreign("cms_user_id")
                ->references("id")
                ->on("cms_users")
                ->onDelete("cascade");

            $table->renameColumn("portal_user_name", "cms_user_name");
        });

        Schema::table("quotes", function (Blueprint $table) {
            $table->renameColumn("portal_user_id", "cms_user_id");
            $table
                ->foreign("cms_user_id")
                ->references("id")
                ->on("cms_users")
                ->onDelete("cascade");
        });

        Schema::table("table_column_headings", function (Blueprint $table) {
            $table->renameColumn("portaluser_id", "cmsuser_id");
        });
    }
}
