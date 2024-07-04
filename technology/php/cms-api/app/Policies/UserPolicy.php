<?php

namespace App\Policies;

use App\Model\{PortalUser, User, Role};
use App\Enums\{Roles};
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Http\Request;

class UserPolicy
{
    use HandlesAuthorization;
    protected $roleList;

    public function __construct()
    {
        $this->roleList = Role::roleList();
    }
    /**
     * Determine whether the user can view any users.
     *
     * @param  \App\Model\PortalUser  $user
     * @return mixed
     */
    public function before(PortalUser $portal_user)
    {
        if ($portal_user->hasRole([Roles::SuperAdmin]))
            return true;
    }

    /**
     * Determine whether the portal user can toggle the user.
     *
     * @param  \App\Model\PortalUser  $portal_user
     * @param  \App\Model\User  $user
     * @return mixed
     */
    public function toggle_user(PortalUser $portal_user, User $user, Request $request)
    {
        if (!$portal_user->hasRole([Roles::Admin]))
            return false;
        return true;
    }

    /**
     * Determine whether the portal user can delete the user.
     *
     * @param  \App\Model\PortalUser  $user
     * @param  \App\Model\User  $portalUser
     * @return mixed
     */
    public function delete_user(PortalUser $portal_user, User $user = null)
    {
        $flag = false;
        if($portal_user->hasRole([Roles::Admin])){
            $flag = true;
        }
        if ($portal_user->hasRole([Roles::SuperAdmin])){
            $flag = true;
        }

        return $flag;
    }
}
