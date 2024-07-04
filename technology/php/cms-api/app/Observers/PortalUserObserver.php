<?php

namespace App\Observers;

use App\Model\{PortalUser, Log};
use App\Enums\{Roles, Logs, PortalAction, TargetTypes, SourceUtm};
use Auth;

class PortalUserObserver
{
    /**
     * Handle the portal user "created" event.
     *
     * @param  \App\PortalUser  $portalUser
     * @return void
     */
    public function created(PortalUser $portalUser)
    {
        $portal_user = Auth::user();

        $content = array(
            'id' => $portalUser->id,
            'name' => $portalUser->full_name,
        );
        $msg = "<b>{$portalUser->full_name}</b> was <b>created</b> on ".SourceUtm::Portal." by <b>{$portal_user->full_name}</b>";

        Log::create(array(
            'category'      => Logs::Portal,
            'action'        => PortalAction::CREATED,
            'target_id'     => $portalUser->id,
            'target_type'   => TargetTypes::Portal,
            'portal_user_id'   => $portal_user->id,
            'portal_user_name' => $portal_user->full_name,
            'content'       => $msg,
        ));
    }

    /**
     * Handle the portal user "updated" event.
     *
     * @param  \App\PortalUser  $portalUser
     * @return void
     */
    public function updated(PortalUser $portalUser)
    {

    }

    /**
     * Handle the portal user "deleted" event.
     *
     * @param  \App\PortalUser  $portalUser
     * @return void
     */
    public function deleted(PortalUser $portalUser)
    {
        $portal_user = Auth::user();

        $content = array(
            'id' => $portalUser->id,
            'name' => $portalUser->full_name,
        );

        $portalUser->contactOwner()->delete();

        Log::create(array(
            'category'      => Logs::Portal,
            'action'        => PortalAction::DELETED,
            'target_id'     => $portalUser->id,
            'target_type'   => TargetTypes::Portal,
            'portal_user_id'   => $portal_user->id,
            'portal_user_name' => $portal_user->full_name,
            'content'       => json_encode($content),
        ));
    }

    /**
     * Handle the portal user "restored" event.
     *
     * @param  \App\PortalUser  $portalUser
     * @return void
     */
    public function restored(PortalUser $portalUser)
    {
        //
    }

    /**
     * Handle the portal user "force deleted" event.
     *
     * @param  \App\PortalUser  $portalUser
     * @return void
     */
    public function forceDeleted(PortalUser $portalUser)
    {
        //
    }
}
