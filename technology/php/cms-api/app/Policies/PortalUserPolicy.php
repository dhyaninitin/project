<?php

namespace App\Policies;

use App\Model\{PortalUser, Role};
use App\Enums\{Roles};
use Illuminate\Auth\Access\HandlesAuthorization;
use App\Http\Requests\PortalUserRequest;

class PortalUserPolicy
{
    use HandlesAuthorization;
    protected $roleList;

    public function __construct()
    {
        $this->roleList = Role::roleList();
    }
    /**
     * Determine whether the user can view any portal users.
     *
     * @param  \App\Model\PortalUser  $user
     * @return mixed
     */
    public function before(PortalUser $user)
    {
        if ($user->hasRole([Roles::SuperAdmin]))
            return true;
    }

    /**
     * Determine whether the portal user can toggle the portal user.
     *
     * @param  \App\Model\PortalUser  $portalUser
     * @param  \App\Model\PortalUser  $user
     * @return mixed
     */
    public function toggle_user(PortalUser $portalUser)
    {
        if ($portalUser->hasRole([ Roles::SuperAdmin, Roles::Admin, Roles::Administrative ]))
            return true;
    }

    /**
     * Determine whether the user can list the portal users.
     *
     * @param  \App\Model\PortalUser  $user
     * @return mixed
     */
    public function list_portal(PortalUser $user)
    {
        return true;
    }

    /**
     * Determine whether the user can view the portal user.
     *
     * @param  \App\Model\PortalUser  $user
     * @param  \App\Model\PortalUser  $portalUser
     * @return mixed
     */
    public function view_portal(PortalUser $user, PortalUser $user1)
    {
        $user_roles = array_filter($this->roleList, function($item) use($user) {
            return in_array($item, $user->getRoleNames()->toArray());
        });

        $user1_roles = array_filter($this->roleList, function($item) use($user1) {
            return in_array($item, $user1->getRoleNames()->toArray());
        });

        $user_role_id = array_keys($user_roles)[0];
        $user1_role_id = array_keys($user1_roles)[0];
        if ( $user_role_id <= $user1_role_id ){
            if ($user->hasRole([Roles::Manager])){
                
                if(!empty($user->location_id) && !empty($user1->location_id)){
                    return $user->location_id == $user1->location_id;
                }
                return !empty(array_intersect(json_decode($user->locations), json_decode($user1->locations)));
            }else {
                return true;
            }
        } else {
            return false;
        }
    }

    /**
     * Determine whether the user can create portal users.
     *
     * @param  \App\Model\PortalUser  $user
     * @return mixed
     */
    public function create_portal(PortalUser $user, PortalUserRequest $request)
    {
        $user_roles = array_filter($this->roleList, function($item) use($user) {
            return in_array($item, $user->getRoleNames()->toArray());
        });

        $request_roles = \Arr::where($this->roleList, function ($item, $key) use($request) {
            return $key == $request->role_id;
        });

        $user_role_id = array_keys($user_roles)[0];
        $request_role_id = array_keys($request_roles)[0];
        
        if ( $user_role_id < $request_role_id )
        {
            if ($user->hasRole([Roles::Manager])){
                $userLocation = json_decode($user->locations, true);
                if(empty($userLocation)){
                    $userLocation = [1];
                }
                 return !empty(array_intersect($userLocation, $request->location_id));
            }else{
                return true;
            }
        } else {
            return false;
        }
    }

    /**
     * Determine whether the user can update the portal user.
     *
     * @param  \App\Model\PortalUser  $user
     * @param  \App\Model\PortalUser  $portalUser
     * @return mixed
     */
    public function update_portal(PortalUser $user, PortalUser $user1, PortalUserRequest $request)
    {
        if ($user->id == $user1->id)
            return true;

        $user_roles = array_filter($this->roleList, function($item) use($user) {
            return in_array($item, $user->getRoleNames()->toArray());
        });

        $user1_roles = array_filter($this->roleList, function($item) use($user1) {
            return in_array($item, $user1->getRoleNames()->toArray());
        });

        $user_role_id = array_keys($user_roles)[0];
        $user1_role_id = array_keys($user1_roles)[0];
        if ( $user_role_id <= $user1_role_id )
        {
            if ($user->hasRole([Roles::Manager])){
                if(!empty($user->location_id) && !empty($user1->location_id)){
                    return $user->location_id == $user1->location_id;
                }
                $userLocation = empty(json_decode($user->locations)) ? [1] : json_decode($user->locations, true);
                $user1Location = empty(json_decode($user1->locations)) ? [1] : json_decode($user1->locations, true);
                return !empty(array_intersect($userLocation, $user1Location));
            }else {
                return true;
            }
        } else {
            return false;
        }
    }

    /**
     * Determine whether the user can update the portal user RR rule.
     *
     * @param  \App\Model\PortalUser  $user
     * @param  \App\Model\PortalUser  $portalUser
     * @return mixed
     */
    public function update_rr(PortalUser $user, PortalUser $user1)
    {
        if ($user->id == $user1->id)
            return true;

        $user_roles = array_filter($this->roleList, function($item) use($user) {
            return in_array($item, $user->getRoleNames()->toArray());
        });

        $user1_roles = array_filter($this->roleList, function($item) use($user1) {
            return in_array($item, $user1->getRoleNames()->toArray());
        });

        $user_role_id = array_keys($user_roles)[0];
        $user1_role_id = array_keys($user1_roles)[0];
        if ( $user_role_id <= $user1_role_id )
        {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Determine whether the user can delete the portal user.
     *
     * @param  \App\Model\PortalUser  $user
     * @param  \App\Model\PortalUser  $portalUser
     * @return mixed
     */
    public function delete_portal(PortalUser $user, PortalUser $user1)
    {
        $user_roles = array_filter($this->roleList, function($item) use($user) {
            return in_array($item, $user->getRoleNames()->toArray());
        });

        $user1_roles = array_filter($this->roleList, function($item) use($user1) {
            return in_array($item, $user1->getRoleNames()->toArray());
        });

        $user_role_id = array_keys($user_roles)[0];
        $user1_role_id = array_keys($user1_roles)[0];
        if ( $user_role_id < $user1_role_id )
        {
            if ($user->hasRole([Roles::Manager])){
                 // return $user->location_id == $user1->location_id;
                 if(!empty($user->location_id) && !empty($user1->location_id)){
                    return $user->location_id == $user1->location_id;
                }
                $userLocation = empty(json_decode($user->locations)) ? [1] : json_decode($user->locations, true);
                $user1Location = empty(json_decode($user1->locations)) ? [1] : json_decode($user1->locations, true);
                return !empty(array_intersect($userLocation, $user1Location));
            }else {
                return true;
            }
        } else {
            return false;
        }
    }

    /**
     * Determine whether the user can restore the portal user.
     *
     * @param  \App\Model\PortalUser  $user
     * @param  \App\Model\PortalUser  $portalUser
     * @return mixed
     */
    public function restore(PortalUser $user, PortalUser $portalUser)
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the portal user.
     *
     * @param  \App\Model\PortalUser  $user
     * @param  \App\Model\PortalUser  $portalUser
     * @return mixed
     */
    public function forceDelete(PortalUser $user, PortalUser $portalUser)
    {
        return false;
    }
}
