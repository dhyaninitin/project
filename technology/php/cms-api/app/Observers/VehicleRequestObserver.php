<?php

namespace App\Observers;

use App\Model\{VehicleRequest, Log, User};
use App\Enums\{Roles, Logs, PortalAction, TargetTypes};
use Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log as LaravelLog;

class VehicleRequestObserver
{
    /**
     * Handle the vehicle request "created" event.
     *
     * @param  \App\VehicleRequest  $vehicleRequest
     * @return void
     */
    public function created(VehicleRequest $vehicleRequest)
    {
        if ($vehicleRequest->portal_deal_stage == 27)
        {
            $user = User::find($vehicleRequest->user_id);
            if ($user->onboarded_date == NULL)
            {
                $user->onboarded_date = Carbon::now()->toFormattedDateString();
                $user->save();
            }
        }
    }

    /**
     * Handle the vehicle request "updated" event.
     *
     * @param  \App\VehicleRequest  $vehicleRequest
     * @return void
     */
    public function updated(VehicleRequest $vehicleRequest)
    {
        if ($vehicleRequest->portal_deal_stage == 27)
        {
            $user = User::find($vehicleRequest->user_id);
            if ($user->onboarded_date == NULL)
            {
                $user->onboarded_date = Carbon::now()->toFormattedDateString();
                $user->save();

            }
        }
    }

    /**
     * Handle the vehicle request "deleted" event.
     *
     * @param  \App\VehicleRequest  $vehicleRequest
     * @return void
     */
    public function deleted(VehicleRequest $vehicleRequest)
    {
        $user = Auth::user();
        $request_id = $vehicleRequest->id;

        $content = array(
            'id' => $vehicleRequest->id,
        );

        Log::create(array(
            'category'      => Logs::Request,
            'action'        => PortalAction::DELETED,
            'target_id'     => $request_id,
            'target_type'   => TargetTypes::Request,
            'portal_user_id'   => $user->id,
            'portal_user_name' => $user->full_name,
            'content'       => json_encode($content),
        ));
    }

    /**
     * Handle the vehicle request "restored" event.
     *
     * @param  \App\VehicleRequest  $vehicleRequest
     * @return void
     */
    public function restored(VehicleRequest $vehicleRequest)
    {
        //
    }

    /**
     * Handle the vehicle request "force deleted" event.
     *
     * @param  \App\VehicleRequest  $vehicleRequest
     * @return void
     */
    public function forceDeleted(VehicleRequest $vehicleRequest)
    {
        //
    }
}
