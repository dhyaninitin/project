<?php

namespace App\Observers;

use App\Model\{User, PortalUser, Log};
use App\Enums\{Logs, UserAction, TargetTypes, SourceUtm};
use Auth;

class UserObserver
{
    /**
     * Handle the user "created" event.
     *
     * @param  \App\User  $user
     * @return void
     */
    public function created(User $user)
    {
        $portal_user = Auth::user();

        if ($portal_user == null)
        {
            $portal_user = PortalUser::where('email', $user->contact_owner_email)->first();
        }

        $content = array(
            'id' => $user->id,
            'name' => $user->full_name,
        );
        $msg = "<b>{$user->first_name} {$user->last_name}</b> was <b>created</b> on ".SourceUtm::Portal." by <b>{$portal_user->full_name}</b> and assigned to <b>{$user->contact_owner_email}</b> contact owner";

        Log::create(array(
            'category'      => Logs::User,
            'action'        => UserAction::CREATED,
            'target_id'     => $user->id,
            'target_type'   => TargetTypes::User,
            'portal_user_id'   => $portal_user->id,
            'portal_user_name' => $portal_user->full_name,
            // 'content'       => json_encode($content),
            'content'       => $msg,
        ));
    }

    /**
     * Handle the user "updated" event.
     *
     * @param  \App\User  $user
     * @return void
     */
    public function updated(User $user)
    {
        $portal_user = Auth::user();

        if ($portal_user == null)
        {
            $portal_user = PortalUser::where('email', $user->contact_owner_email)->first();
        }

        $update =[
            'id' => $user->id,
            'name' => $user->full_name
        ];

        $msg = "<b>{$user->first_name} {$user->last_name}</b> was <b>updated</b> with ";
        if($user->isDirty('is_active')){
            $update['is_active'] = $user->is_active;
            $msg .= "is active <b>{$update['is_active']}</b> ";
        }

        $msg .= " by <b>{$portal_user->full_name}</b>";

        if (count($update))
        {
            if (!$user->isDirty('is_active'))
            {
            } else {
                Log::create(array(
                    'category'      => Logs::User,
                    'action'        => UserAction::TOGGLED,
                    'target_id'     => $user->id,
                    'target_type'   => TargetTypes::User,
                    'portal_user_id'   => $portal_user->id,
                    'portal_user_name' => $portal_user->full_name,
                    'content'       => $msg,
                ));
            }
        }
    }

    /**
     * Handle the user "deleted" event.
     *
     * @param  \App\User  $user
     * @return void
     */
    public function deleted(User $user)
    {
        $portal_user = Auth::user();

        $user->car_info()->delete();
        $user->requests()->delete();

        $content = array(
            'id' => $user->id,
            'name' => $user->full_name,
        );

        Log::create(array(
            'category'      => Logs::User,
            'action'        => UserAction::DELETED,
            'target_id'     => $user->id,
            'target_type'   => TargetTypes::User,
            'portal_user_id'   => $portal_user->id,
            'portal_user_name' => $portal_user->full_name,
            'content'       => json_encode($content),
        ));
    }

    /**
     * Handle the user "restored" event.
     *
     * @param  \App\User  $user
     * @return void
     */
    public function restored(User $user)
    {
        //
    }

    /**
     * Handle the user "force deleted" event.
     *
     * @param  \App\User  $user
     * @return void
     */
    public function forceDeleted(User $user)
    {
        //
    }
}
