<?php

namespace App\Policies;

use App\Model\{PortalUser, Role};
use App\Enums\{Roles};
use Illuminate\Auth\Access\HandlesAuthorization;

class LocationPolicy
{
    use HandlesAuthorization;

    public function __construct()
    {

    }
    /**
     * Determine whether the user can view any portal users.
     *
     * @param  \App\Model\PortalUser  $user
     * @return mixed
     */
    public function before(PortalUser $user)
    {
        if ($user->hasRole([Roles::SuperAdmin, Roles::Admin]))
            return true;
        else
            return false;
    }
}
