<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Queue;
use Illuminate\Queue\Events\JobFailed;
use App\Model\{ReportStatus, User, PortalUser, VehicleRequest, WorkflowHistory, EmailTemplates, WorkflowSetting};
use App\Enums\ReportStatusType;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use App\Observers\UserObserver;
use App\Observers\VehicleRequestObserver;
use App\Observers\PortalUserObserver;
use App\Observers\workflowUsersHistoryObserver;
use App\Observers\EmailTemplateObserver;
use App\Observers\WorkflowSettingObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Schema::defaultStringLength(191);

        // Init Observers
        User::observe(UserObserver::class);
        VehicleRequest::observe(VehicleRequestObserver::class);
        PortalUser::observe(PortalUserObserver::class);
        WorkflowHistory::observe(workflowUsersHistoryObserver::class);
        EmailTemplates::observe(EmailTemplateObserver::class);
        WorkflowSetting::observe(WorkflowSettingObserver::class);
    }
}
