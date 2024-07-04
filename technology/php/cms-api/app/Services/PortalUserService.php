<?php

namespace App\Services;

use App\Model\{PortalUser, User, Log, ContactOwner, VehicleRequest, WorkflowHistory, HubspotWorkFlows, ZimbarMailbox, PhoneNumbers};
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use App\Enums\{Roles, Logs, PortalAction, TargetTypes};
use Illuminate\Support\Collection;
use Auth;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\{LogTrait,HubspotTrait,PortalTraits};
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use PragmaRX\Google2FA\Google2FA;

class PortalUserService extends AbstractService
{
    use LogTrait;
    use HubspotTrait;
    use PortalTraits;
    /**
     * get portal user list
     *
     * @param Array $filters
     * @return array
     */

    public function getList($filters)
    {
        $user = Auth::user();
        $result = [];
        $db_result = [];
        $page = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $offset = ($page - 1) * $per_page;
        $search_value = isset($filters['search']) ? $filters['search'] : '';
        // filters
        $filter = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();
        $isroundrobin = isset($filter['isroundrobin']) ? $filter['isroundrobin'] : null;
        $isactiveStatus = isset($filter['isactive']) ? $filter['isactive'] : null;
        $isinactiveStatus = isset($filter['isinactive']) ? $filter['isinactive'] : null;
        $roles = isset($filter['roles']) ? $filter['roles'] : null;
        $orderDir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';

        /**
         * Check user role and determin to show all or only location based.
         */
        $query = PortalUser::with('roles')->with('roles.permissions');
        $firstDataBase = config('services.database.first');
        $secondDataBase = config('services.database.second');

        if ($roles != '0' && $roles != '') {
            $roles = array_map('intval', explode(',', $roles));
            $query->whereHas('roles', function ($query_p) use ($roles) {
                $query_p->whereIn('role_id', $roles);
            });
        }

        if ($search_value) {
            $search_value_arr = explode(' ', $search_value);
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE(`first_name`,''), ' ', COALESCE(`last_name`, ''), ' ', COALESCE(`email`, ''), ' ', COALESCE(`promo_code`, ''), ' ', COALESCE(`created_at`, ''), ' ', COALESCE(`updated_at`, ''), ' ') like '%{$value}%'");
            }
        }

        if ($isroundrobin == '1') {
            $contactOwners = ContactOwner::select('email')->get()->toarray();
            $query->whereIn('email', $contactOwners);
        }

        if ($isactiveStatus == '1' && $isinactiveStatus == '0') {
            $query->where("is_active", 1);
        } else if ($isactiveStatus == '0' && $isinactiveStatus == '1') {
            $query->where("is_active", 0);
        } else {

        }

        if (isset($filters['order_by'])) {
            if ($filters['order_by'] == 'roundrobin') {
                $query->select("{$firstDataBase}.portal_users.*");
                $query->join("{$firstDataBase}.model_has_roles", "model_has_roles.model_id", "=", "{$firstDataBase}.portal_users.id");
                if($orderDir == 'asc'){
                    $query->leftJoin("{$secondDataBase}.contact_owners", "contact_owners.email", "=", "{$firstDataBase}.portal_users.email");
                    $query->orderByRaw("CASE WHEN model_has_roles.role_id IN (" . implode(',', ['4', '5']) . ") THEN 0 ELSE 1 END,
                        CASE WHEN {$secondDataBase}.contact_owners.email IS NOT NULL THEN 0 ELSE 1 END,
                        model_has_roles.role_id $orderDir");
                }else{
                    $query->leftJoin("{$secondDataBase}.contact_owners", "contact_owners.email", "=", "{$firstDataBase}.portal_users.email");
                    $query->orderByRaw("CASE WHEN {$secondDataBase}.contact_owners.email IS NOT NULL THEN 1 ELSE 0 END,
                    FIELD(model_has_roles.role_id, " . implode(',', ['6','3','2','1','4','5']) . "), model_has_roles.role_id $orderDir");
                }
            }else if($filters['order_by'] == 'phone'){
                $query->select("{$firstDataBase}.portal_users.*");
                $query->leftJoin("{$firstDataBase}.phone_numbers", "phone_numbers.portal_user_id", "=", "{$firstDataBase}.portal_users.id");
                $query->orderBy("{$firstDataBase}.phone_numbers.phone", $orderDir);
                $query->orderBy("{$firstDataBase}.portal_users.phone", $orderDir);
            }else if ($filters['order_by'] == 'role') {
                $query->join("{$firstDataBase}.model_has_roles", "model_has_roles.model_id", "=", "{$firstDataBase}.portal_users.id");
                $query->orderBy('model_has_roles.role_id', $orderDir);
            } else if ($filters['order_by'] == 'location') {
                $query = $query->orderBy('location_id', $orderDir);
            } else {
                $query = $query->orderBy($filters['order_by'], $orderDir);
            }
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }
        $num_results_filtered = $query->count();

        $query = $query->offset($offset)->limit($per_page);
        $portal_users = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($portal_users, $num_results_filtered, $per_page, $page);
        $result->setPath(route('portaluser.index'));

        return $result;
    }

    public function getListByNoPhoneAssigned($filters)
    {
        $user = Auth::user();
        $result = [];
        $db_result = [];
        $page = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $offset = ($page - 1) * $per_page;
        $search_value = isset($filters['search']) ? $filters['search'] : '';
        // filters
        $filter = isset($filters['filter']) ? json_decode($filters['filter'], true) : array();
        $isroundrobin = isset($filter['isroundrobin']) ? $filter['isroundrobin'] : null;
        $isactiveStatus = isset($filter['isactive']) ? $filter['isactive'] : null;
        $isinactiveStatus = isset($filter['isinactive']) ? $filter['isinactive'] : null;
        $roles = isset($filter['roles']) ? $filter['roles'] : null;
        $orderDir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';

        $query = PortalUser::with('roles')->with('roles.permissions');

        if ($search_value) {
            $search_value_arr = explode(' ', $search_value);
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE(`first_name`,''), ' ', COALESCE(`last_name`, '')) like '%{$value}%'");
            }
        }
        $usersWithPhone = PhoneNumbers::whereNotNull('portal_user_id')->get()->pluck('portal_user_id');
        $query = $query->whereNotIn('id', $usersWithPhone);
        if (isset($filters['order_by'])) {
            $query = $query->orderBy($filters['order_by'], $orderDir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        $num_results_filtered = $query->count();

        $query = $query->offset($offset)->limit($per_page);
        $portal_users = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($portal_users, $num_results_filtered, $per_page, $page);
        $result->setPath(route('portaluser.index'));

        return $result;
    }

    /**
     * get portal user info
     *
     * @param String $portal_user_id
     * @return array
     */

    public function get($portal_user_id)
    {
        $portal_user = PortalUser::with('roles', 'roles.permissions')->find($portal_user_id);
        if ($portal_user->profile_name) {
            $profileImage = $this->getProfileUrl($portal_user->profile_name, $portal_user->profile_path);
            $portal_user['profile_url'] = $profileImage;
        }
        return $portal_user;
    }

    public function getProfileUrl($fileName, $filePath)
    {
        $path = config('filesystems.disks.s3.bucket') . '/' . getenv('APP_ENV') . '/' . 'profile/' . $filePath;
        return Storage::disk('s3')->url($path);
    }

    /**
     * get all portal users
     *
     * @param array $filter
     * @return array
     */

    public function getAll($filter)
    {
        $user = Auth::user();

        $search = data_get($filter, 'search', null);
        $roles = data_get($filter, 'roles', []);
        $query = PortalUser::selectRaw('*');
        if ($user->hasRole(Roles::Concierge)) {
            $query = $query->where('id', $user->id);
        } else {
            if ($search) {
                $query = $query->where(function ($wquery) use ($search) {
                    $wquery->Where('first_name', 'like', '%' . strtolower($search) . '%')
                        ->orWhere('last_name', 'like', '%' . strtolower($search) . '%')
                        ->orWhere('email', 'like', '%' . strtolower($search) . '%');
                });
            }

            if ($roles && count($roles)) {
                $query = $query->whereHas('roles', function (Builder $in_query) use ($roles) {
                    $in_query->whereIn('id', $roles)->orWhere('email', "brynn@carblip.com");
                });
            }
        }

        $query = $query->orderBy('created_at', 'desc');

        $portal_user = $query->get();
        return $portal_user;
    }

    /**
     * create portal user
     *
     * @param Array $data
     * @return array
     */

    public function create($data)
    {

        $user = Auth::user();
        $email = $data['email'];
        $portal_user = PortalUser::where('email', $email)->first();
        if (!$portal_user) {
            $portal_user = new PortalUser;
        }
        if ($data['role_id'] == 6) {
            $portal_user->zimbra_token = Crypt::encryptString($data['password']);
        }

        $data['password'] = \bcrypt($data['password']);

        $portal_user->first_name = $data['first_name'];
        $portal_user->last_name = $data['last_name'];
        $portal_user->email = $data['email'];
        $portal_user->personalemail = $data['personalemail'];
        $portal_user->locations = json_encode($data['location_id']);
        $portal_user->password = $data['password'];
        $portal_user->promo_code = $data['promo_code'];
        $portal_user->city = $data['city'];
        $portal_user->state = $data['state'];
        $portal_user->sales_license_expiry_date = $data['sales_license_expiry_date'];
        if (isset($data['phone'])) {
            $portal_user->phone = $data['phone'];
        }
        $portal_user->save();

        if (isset($data['role_id'])) {
            $role_id = $data['role_id'];
            $portal_user->syncRoles([$role_id]);
        }

        return $portal_user;
    }



    /**
     * update portal user
     *
     * @param Array $data
     * @param String $portal_user_id
     * @return array
     */

    public function update($portal_user_id, $data, $profile_update = false)
    {
        $user = Auth::user();

        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = \bcrypt($data['password']);
        }

        $portal_user = PortalUser::find($portal_user_id);

        // $current_role_id = $portal_user->roles ? $portal_user->roles[0]->id : null;
            $logArray = array(
                'category' => Logs::Portal,
                'action' => PortalAction::UPDATED,
                'target_id' => $portal_user->id,
                'target_type' => TargetTypes::Portal,
                'portal_user_id' => $user->id,
                'portal_user_name' => $user->full_name,
            );
            $this->createUpdateLogs($portal_user,$data,'Users',$logArray);
        // die();
        // $old_data_arr = [
        //     'role_id'       => $current_role_id,
        //     'first_name'   => $portal_user->first_name,
        //     'last_name'   => $portal_user->last_name,
        //     'location_id'   => $portal_user->location_id,
        //     'promo_code'   => $portal_user->promo_code,
        //     'password'   => $portal_user->password,
        //     'is_reset_password_required' => $portal_user->is_reset_password_required,
        // ];
        // if (isset($data['password']) && !empty($data['password'])) {
        //     $old_data_arr['password'] = $portal_user->password;
        // }
        // if (isset($data['tiktok_url'])) {
        //     $old_data_arr['tiktok_url'] = $portal_user->tiktok_url;
        // }
        // if (isset($data['twitter_url'])) {
        //     $old_data_arr['twitter_url'] = $portal_user->twitter_url;
        // }
        // if (isset($data['linkedin_url'])) {
        //     $old_data_arr['linkedin_url'] = $portal_user->linkedin_url;
        // }
        // if (isset($data['instagram_url'])) {
        //     $old_data_arr['instagram_url'] = $portal_user->instagram_url;
        // }
        // if (isset($data['facebook_url'])) {
        //     $old_data_arr['facebook_url'] = $portal_user->facebook_url;
        // }
        // if (isset($data['discord_url'])) {
        //     $old_data_arr['discord_url'] = $portal_user->discord_url;
        // }
        // if (isset($data['personalemail'])) {
        //     $old_data_arr['personalemail'] = $portal_user->personalemail;
        // }
        // if (isset($data['city'])) {
        //     $old_data_arr['city'] = $portal_user->city;
        // }
        // if (isset($data['state'])) {
        //     $old_data_arr['state'] = $portal_user->state;
        // }
        // if (isset($data['sales_license_expiry_date'])) {
        //     $old_data_arr['sales_license_expiry_date'] = $portal_user->sales_license_expiry_date;
        // }

        // $old_data = collect($old_data_arr);

        if (isset($data['role_id'])) {
            $role_id = $data['role_id'];
            $portal_user->syncRoles([$role_id]);

            if ($role_id != 5 && $role_id != 6 && $role_id != 4) {
                $portal_user->contactOwner()->delete();
            }
        }

        $portal_user->update($data);

        // if (!$profile_update) {
        //     $new_data_arr = [
        //         'role_id'       => $data['role_id'],
        //         'first_name'   => $data['first_name'],
        //         'last_name'   => $data['last_name'],
        //         'location_id'   => $data['location_id'],
        //         'promo_code'   => $data['promo_code']
        //     ];

        //     if (isset($data['tiktok_url'])) {
        //         $new_data_arr['tiktok_url'] = $data['tiktok_url'];
        //     }
        //     if (isset($data['twitter_url'])) {
        //         $new_data_arr['twitter_url'] = $data['twitter_url'];
        //     }
        //     if (isset($data['linkedin_url'])) {
        //         $new_data_arr['linkedin_url'] = $data['linkedin_url'];
        //     }
        //     if (isset($data['instagram_url'])) {
        //         $new_data_arr['instagram_url'] = $data['instagram_url'];
        //     }
        //     if (isset($data['facebook_url'])) {
        //         $new_data_arr['facebook_url'] = $data['facebook_url'];
        //     }
        //     if (isset($data['discord_url'])) {
        //         $new_data_arr['discord_url'] = $data['discord_url'];
        //     }
        //     if (isset($data['personalemail'])) {
        //         $new_data_arr['personalemail'] = $data['personalemail'];
        //     }
        //     if (isset($data['city'])) {
        //         $new_data_arr['city'] = $data['city'];
        //     }
        //     if (isset($data['state'])) {
        //         $new_data_arr['state'] = $data['state'];
        //     }
        //     if (isset($data['sales_license_expiry_date'])) {
        //         $new_data_arr['sales_license_expiry_date'] = $data['sales_license_expiry_date'];
        //     }

        //     if(isset($data['is_reset_password_required'])) {
        //         $new_data_arr['is_reset_password_required'] = $data['is_reset_password_required'];
        //     }

        //     if (isset($data['password']) && !empty($data['password'])) {
        //         $new_data_arr['password'] = $data['password'];
        //     }

        //     $new_data = collect($new_data_arr);

        //     $msg = "{$portal_user->full_name}'s ";
        //     $diff = $new_data->diff($old_data);
        //     if (isset($diff->toArray()['first_name'])) {
        //         $first_name = $diff->toArray()['first_name'];
        //         $msg .= "first name was updated from {$old_data['first_name']} to <b>{$first_name}</b>, ";
        //     }
        //     if (isset($diff->toArray()['last_name'])) {
        //         $last_name = $diff->toArray()['last_name'];
        //         $msg .= "last name was updated from {$old_data['last_name']} to <b>{$last_name}</b>, ";
        //     }
        //     if (isset($diff->toArray()['role_id'])) {
        //         $role = $this->formatRoleIds($diff->toArray()['role_id']);
        //         $old_role = $this->formatRoleIds($old_data['role_id']);
        //         $msg .= "role was updated from {$old_role} to <b>{$role}</b>, ";
        //     }
        //     if (isset($diff->toArray()['location_id'])) {
        //         $location = $this->formatLocationString($diff->toArray()['location_id']);
        //         $oldlocation = $this->formatLocationString($old_data['location_id']);
        //         $msg .= "location was updated from {$oldlocation} to <b>{$location}</b>, ";
        //     }
        //     if (isset($diff->toArray()['promo_code'])) {
        //         $promo_code = $diff->toArray()['promo_code'];
        //         $msg .= "promocode was updated from {$old_data['promo_code']} to <b>{$promo_code}</b>, ";
        //     }
        //     if (isset($diff->toArray()['password'])) {
        //         $msg .= "password was updated, ";
        //     }
        //     if(isset($diff->toArray()['is_reset_password_required'])) {
        //         $is_reset_password_required = $diff->toArray()['is_reset_password_required'];
        //         if($is_reset_password_required == 1) {
        //             $msg .= "Require user to change password on their next login was activated, ";
        //         } else {
        //             $msg .= "Require user to change password on their next login was de-activated, ";
        //         }
        //     }
        //     if (isset($diff->toArray()['tiktok_url'])) {
        //         $msg .= "TikTok url was updated from  {$old_data['tiktok_url']} to <b>{$diff->toArray()['tiktok_url']}</b>, ";
        //     }
        //     if (isset($diff->toArray()['twitter_url'])) {
        //         $msg .= "Twitter url was updated from {$old_data['twitter_url']} to <b>{$diff->toArray()['twitter_url']}</b>, ";
        //     }
        //     if (isset($diff->toArray()['linkedin_url'])) {
        //         $msg .= "Linkedin url was updated from {$old_data['linkedin_url']} to <b>{$diff->toArray()['linkedin_url']}</b>, ";
        //     }
        //     if (isset($diff->toArray()['instagram_url'])) {
        //         $msg .= "Instagram url was updated from {$old_data['instagram_url']} to <b>{$diff->toArray()['instagram_url']}</b>, ";
        //     }
        //     if (isset($diff->toArray()['facebook_url'])) {
        //         $msg .= "Facebook url was updated from {$old_data['facebook_url']} to <b>{$diff->toArray()['facebook_url']}</b>, ";
        //     }
        //     if (isset($diff->toArray()['discord_url'])) {
        //         $msg .= "Discord url was updated from {$old_data['discord_url']} to <b>{$diff->toArray()['discord_url']}</b>, ";
        //     }
        //     if (isset($diff->toArray()['personalemail'])) {
        //         $msg .= "Personal Email was updated from {$old_data['personalemail']} to <b>{$diff->toArray()['personalemail']}</b>, ";
        //     }

        //     if (isset($diff->toArray()['state'])) {
        //         $msg .= "State was updated from {$old_data['state']} to <b>{$diff->toArray()['state']}</b>, ";
        //     }
        //     if (isset($diff->toArray()['city'])) {
        //         $msg .= "City was updated from {$old_data['city']} to <b>{$diff->toArray()['city']}</b>, ";
        //     }
        //     if (isset($diff->toArray()['sales_license_expiry_date'])) {
        //         $msg .= "Sales License expiry date was updated from ".date('Y-m-d', strtotime($old_data['sales_license_expiry_date']))." to <b>".date('Y-m-d', strtotime($diff->toArray()['sales_license_expiry_date']))."</b>, ";
        //     }

        //     $msg = substr(trim($msg), 0, -1);

        //     $msg .= " by <b>{$user->full_name}</b>";

        //     if ($diff->count())
        //     {
        //         $diff = $diff->merge([
        //             'id' => $portal_user->id,
        //             'name' => $portal_user->full_name,
        //         ]);

        //         Log::create(
        //             array(
        //                 'category' => Logs::Portal,
        //                 'action' => PortalAction::UPDATED,
        //                 'target_id' => $portal_user->id,
        //                 'target_type' => TargetTypes::Portal,
        //                 'portal_user_id' => $user->id,
        //                 'portal_user_name' => $user->full_name,
        //                 // 'content'       => $diff->toJson()
        //                 'content' => $msg
        //             )
        //         );
        //     }
        // }

        if ($portal_user->profile_name) {
            $profileImage = $this->getProfileUrl($portal_user->profile_name, $portal_user->profile_path);
            $portal_user['profile_url'] = $profileImage;
        }
        return $portal_user;
    }

    /**
     * update portal user RR
     *
     * @param Array $data
     * @param String $portal_user_id
     * @return array
     */

    public function updateRR($portal_user_id, $data)
    {
        $user = Auth::user();
        $status = data_get($data, 'status', false);

        $portal_user = PortalUser::find($portal_user_id);

        $old_data = collect([
            'roundrobin' => $portal_user->round_robin
        ]);
        $msg = "";
        if ($status) {
            $msg = "Round Robin activated for this user by <b>{$user->full_name}</b>";
            $newContactOwner = [
                'email' => $portal_user->email,
            ];
            if (!ContactOwner::where('last_assigned', 1)->count()) {
                $newContactOwner = array_merge($newContactOwner, [
                    'last_assigned' => 1
                ]);
            }
            ContactOwner::firstOrCreate($newContactOwner);
        } else {
            $msg = "Round Robin de-activated for this user by <b>{$user->full_name}</b>";
            if (ContactOwner::select('*')->get()->count() > 1) {
                $portal_user->contactOwner()->delete();
                if (!ContactOwner::where('last_assigned', 1)->count()) {
                    ContactOwner::first()->update([
                        'last_assigned' => 1
                    ]);
                }
            }
        }

        $new_data = collect([
            'roundrobin' => $status
        ]);

        $diff = $new_data->diff($old_data);
        if ($diff->count()) {
            $diff = $diff->merge([
                'id' => $portal_user->id,
                'name' => $portal_user->full_name,
            ]);

            Log::create(
                array(
                    'category' => Logs::Portal,
                    'action' => PortalAction::UPDATED,
                    'target_id' => $portal_user->id,
                    'target_type' => TargetTypes::Portal,
                    'portal_user_id' => $user->id,
                    'portal_user_name' => $user->full_name,
                    'content' => $msg
                )
            );
        }

        return PortalUser::find($portal_user_id);
    }

    /**
     * delete portal user
     *
     * @param Array $data
     * @param String
     * @return array
     */

    public function delete($portal_user_id)
    {
        $user = Auth::user();
        $portal_user = PortalUser::find($portal_user_id);
        if ($portal_user) {
            $result = $portal_user->delete();
        } else {
            $result = false;
        }
        return $result;
    }

    /**
     * toggle portal user
     *
     * @param Array $data
     * @param String
     * @return array
     */

    public function toggle($portalUserId, $data)
    {
        $portalUser = PortalUser::find($portalUserId);
        $is_active = $data['is_active'];
        $update = array(
            'is_active' => $is_active
        );
        $this->portalUserToggleLogs($portalUser, $update);
        $portalUser->update($update);
        return $portalUser;
    }

    public function getrrdetails($rrdata)
    {
        $query = ContactOwner::select('*')->where('email', $rrdata)->get();
        return $query;
    }

    public function getallcontactowner()
    {
        $query = ContactOwner::select('*')->get();

        foreach ($query as $values) {
            $current_day = Carbon::now()->format("w");
            if ($values->rr_timeframe == 'D') {
                $rrdays = json_decode($values->rr_days);
                $this->updaterrlimit($values->id, 0);
            } else if ($values->rr_timeframe == 'W') {
                if ($current_day == 6) {
                    $this->updaterrlimit($values->id, 0);
                }
            } else {
                $endofmonth = date('Y-m-d', strtotime(Carbon::now()->endOfMonth()));
                $current_date = date('Y-m-d', strtotime(Carbon::now()));
                if ($endofmonth == $current_date) {
                    $this->updaterrlimit($values->id, 0);
                }
            }
        }
        return true;
    }

    public function updaterrdetails($req)
    {
        $user = Auth::user();
        $findemail = $req['email'];
        $rr_user = ContactOwner::where('email', $findemail);

        if (count($rr_user->get()) > 0) {
            $old_data = $rr_user->get()->toarray();
            $msg = "";
            $is_updated = false;
            $portal_user = PortalUser::where('email', $findemail)->get();
            if ($old_data[0]['rr_days'] != json_encode($req['days'])) {
                $msg .= "Scheduled days {$this->checkDays(json_decode($old_data[0]['rr_days']))} was updated to <b>{$this->checkDays($req['days'])}</b> ";
                $is_updated = true;
            }
            if ($old_data[0]['rr_source'] != json_encode($req['source'])) {
                $msg .= "Assigned source {$this->checkSource(json_decode($old_data[0]['rr_source']))} was updated to <b>{$this->checkSource($req['source'])}</b> ";
                $is_updated = true;
            }
            if ($old_data[0]['rr_limit'] != $req['limit']) {
                $msg .= "Round Robin limit {$old_data[0]['rr_limit']} was updated to <b>{$req['limit']}</b> ";
                $is_updated = true;
            }
            if ($old_data[0]['rr_timeframe'] != $req['typeoflimit']) {
                $msg .= "Round Robin limit type per {$old_data[0]['rr_timeframe']} was updated to per <b>{$req['typeoflimit']}</b> ";
                $is_updated = true;
            }
            if($is_updated) {
                $msg .= "by <b>{$user->full_name}</b> for {$portal_user[0]['full_name']}";

                Log::create(
                    array(
                        'category' => Logs::Portal,
                        'action' => PortalAction::UPDATED,
                        'target_id' => $portal_user[0]['id'],
                        'target_type' => TargetTypes::Portal,
                        'portal_user_id' => $user->id,
                        'portal_user_name' => $user->full_name,
                        'content' => $msg
                    )
                );
            }

            $rr_user->update([
                'rr_days' => json_encode($req['days']),
                'rr_source' => json_encode($req['source']),
                'rr_limit' => $req['limit'],
                'rr_timeframe' => $req['typeoflimit']
            ]);
        }
        return $rr_user->get();

    }

    public function checkDays($days){
        $msg = "";
        if($days) {
            if(in_array(0,$days)){
                $msg.= 'Sun, ';
            }
            if(in_array(1,$days)){
                $msg.= 'Mon, ';
            }
            if(in_array(2,$days)){
                $msg.= 'Tue, ';
            }
            if(in_array(3,$days)){
                $msg.= 'Wed, ';
            }
            if(in_array(4,$days)){
                $msg.= 'Thu, ';
            }
            if(in_array(5,$days)){
                $msg.= 'Fri, ';
            }
            if(in_array(6,$days)){
                $msg.= 'Sat, ';
            }
        }
        return rtrim($msg, ',');
    }

    public function checkSource($source){
        $msg = "";
        if($source) {
            for ($i=0; $i < count($source) ; $i++ ){
                $msg.= $this->formatSourceUtm($source[$i]).',';
            }
        }
        return rtrim($msg, ',');
    }

    public function updaterrlimit($id, $limit)
    {
        $rr_updatelimit = ContactOwner::where('id', $id)->update(['rr_total_assigned' => 0]);
        if ($rr_updatelimit) {
            return true;
        }
    }

    public function upaterrdefaultUser($req)
    {
        $user = Auth::user();
        $findemail = $req['email'];
        $portal_user = PortalUser::where('email', $findemail)->get();
        ContactOwner::where('is_default', 1)->update(['is_default' => 0]);
        $rr_upatedefault = ContactOwner::where('email', $findemail)->update(['is_default' => 1]);
        if ($rr_upatedefault) {
            $msg = "{$portal_user[0]['full_name']} was updated to default user for round robin by <b>{$user->full_name}</b>";

            Log::create(
                array(
                    'category' => Logs::Portal,
                    'action' => PortalAction::UPDATED,
                    'target_id' => $portal_user[0]['id'],
                    'target_type' => TargetTypes::Portal,
                    'portal_user_id' => $user->id,
                    'portal_user_name' => $user->full_name,
                    'content' => $msg
                )
            );
            return true;
        }
    }

    public function getContactOwnersFilterByRole($coming_from)
    {
        $portal_user = Auth::user();
        $db_name = config('services.database.second');
        if ($portal_user->hasRole(Roles::Manager)) {
            // $sub_users_emails = PortalUser::where('location_id', $portal_user->location_id)->get()->pluck('email')->toArray();
            $userLocation = empty(json_decode($portal_user->locations)) ? [1] : json_decode($portal_user->locations);
            $userQuery = PortalUser::whereJsonContains('locations', $userLocation);
            if (empty(json_decode($portal_user->locations))) {
                $userQuery->orWhereNull('locations');
            }
            $subUsersEmails = $userQuery->pluck('email')->toArray();
            if ($coming_from == '1') {
                $query = User::select('contact_owner_email')->orWhere(function ($in_query) use ($subUsersEmails) {
                    $in_query->whereIn('contact_owner_email', $subUsersEmails);
                });
                $users = $query->get()->unique('contact_owner_email')->pluck('contact_owner_email')->toArray();
                $query = PortalUser::whereIn('email', $users)->get();
            } else if ($coming_from == '2') {
                $query = VehicleRequest::select("{$db_name}.vehicle_requests.user_id", "{$db_name}.user.contact_owner_email");
                $query->join("{$db_name}.user", "{$db_name}.user.id", "=", "{$db_name}.vehicle_requests.user_id");
                $query->whereNotNull("{$db_name}.user.contact_owner_email");
                $query = $query->whereIn("{$db_name}.user.contact_owner_email", $subUsersEmails);
                $users = $query->get()->unique('contact_owner_email')->pluck('contact_owner_email')->toArray();
            }
            $query = PortalUser::whereIn('email', $users)->get();

        } else if ($portal_user->hasRole(Roles::Salesperson) || $portal_user->hasRole(Roles::Concierge)) {
            $query = PortalUser::where('email', $portal_user->email)->get();
        } else {
            if ($coming_from == '1') {
                $users = User::select('contact_owner_email')->get()->unique('contact_owner_email')->pluck('contact_owner_email')->toArray();
            } else if ($coming_from == '2') {
                $query = VehicleRequest::select("{$db_name}.vehicle_requests.user_id", "{$db_name}.user.contact_owner_email");
                $query->join("{$db_name}.user", "{$db_name}.user.id", "=", "{$db_name}.vehicle_requests.user_id");
                $users = $query->get()->unique('contact_owner_email')->pluck('contact_owner_email')->toArray();
            }
            $query = PortalUser::whereIn('email', $users)->get();
        }
        return $query;
    }

    /**
     * Zimbra user List
     */
    public function getUserLastRecord($portalUserEmail)
    {
        return ZimbarMailbox::select('id', 'uniqueId', 'mail_id', 'thread_id', 'to', 'from', 'subject', 'type', 'subject', 'status', 'file_status', 'created_at', 'updated_at')
            ->where('to', $portalUserEmail)->orWhere('from', $portalUserEmail)->orderBy('id', 'desc')->first();
        // ->whereNull('thread_id')->whereNull('mail_id')
    }
    /**
     * Zimbra user List
     */
    public function getUserMailRecord($mailId, $uniqueIid)
    {
        $query = ZimbarMailbox::select('id', 'uniqueId', 'mail_id', 'thread_id')->Where("uniqueId", $uniqueIid)->Where("mail_id", $mailId);
        $query = $query->first();
        return $query;
    }
    /**
     * Zimbra user List
     */
    public function getUserSentMailRecord($column, $id, $type)
    {
        $query = ZimbarMailbox::select('id', 'uniqueId', 'mail_id', 'thread_id')->Where($column, $id);
        $query = $query->where('type', $type);
        $query = $query->first();
        // echo $query->toSql();
        return $query;
    }

    public function storeZimbramail($uniqueId, $id, $to, $from, $subj, $mesg, $type, $fileStatus, $thread_id, $userName, $mail_date, $originalMessageId)
    {
        $res = ZimbarMailbox::where('uniqueId', $uniqueId)->where('mail_id', $id)->first();
        if (!$res) {
            $res = new ZimbarMailbox;
        }
        $seconds = $mail_date / 1000;
        $mail_date = date("Y-m-d H:i:s", $seconds);
        $mesg = strip_tags($mesg);
        $res->uniqueId = $uniqueId;
        $res->mail_id = $id;
        $res->message_id = $originalMessageId;
        $res->to = $to;
        $res->from = $from;
        $res->user_name = $userName;
        $res->subject = $subj;
        $res->message = substr($mesg, 0, 50);
        if ($fileStatus == 'au' || $fileStatus == 'a') {
            $res->file_status = 1;
        }
        $res->attachment_status = $fileStatus;
        $res->thread_id = $thread_id;
        $res->type = $type;
        $res->mail_date = $mail_date;
        $res->save();
        return $res->id;
    }

    public function UpdateZimbraSentmails($mailId, $threadId, $uniqueId, $originalMessageId, $mail_Type)
    {
        return ZimbarMailbox::where('message_id', $originalMessageId)->where('type', $mail_Type)->update(
            [
                'thread_id' => $threadId,
                'mail_id' => $mailId,
                'uniqueId' => $uniqueId,
            ]
        );
    }

    public function UpdateZimbramails($thresdId, $uniqueId, $mailId)
    {
        return ZimbarMailbox::where('uniqueId', $uniqueId)->where('mail_id', $mailId)->update(
            [
                'thread_id' => $thresdId,
            ]
        );
    }

    public function storePortalsendmessage($user_name, $originalMsgId, $to, $from, $sub, $msg, $attachmentfile_details, $s3folderName)
    {
        $res = new ZimbarMailbox;
        $res->message_id = $originalMsgId;
        $res->to = $to;
        $res->from = $from;
        $res->user_name = $user_name;
        $res->subject = $sub;
        $res->message = substr($msg, 0, 50);
        $res->type = 'S';
        $res->status = 1;
        if (!empty($attachmentfile_details)) {
            $res->file_status = 1;
        }
        $res->file_name = json_encode($attachmentfile_details);
        $res->file_path = $s3folderName;

        $res->save();
        return $res->id;
    }


    public function updatePortalsendmessage($save_id, $passPhrase)
    {
        return ZimbarMailbox::where('id', $save_id)->update(
            [
                // 'private_key'=>$privateKey,
                'pass_phrase' => $passPhrase
            ]
        );
        // if($updatePortalsendmessage){
        //     return ZimbarMailbox::where('id', $save_id)->get();
        // }
    }

    public function zimbramailList($email, $filters)
    {
        $user = Auth::user();
        $loggedUserEmail = $user->email;
        $page = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $order_by = isset($filters['order_by']) ? $filters['order_by'] : null;
        $order_dir = isset($filters['order_dir']) ? $filters['order_dir'] : 'desc';
        $offset = ($page - 1) * $per_page;

        $query = ZimbarMailbox::where(function ($query) use ($email) {
            $query->where('to', $email)->Where('type', 'S')->orWhere('from', $email)->Where('type', 'R');
        })->where(function ($query) use ($loggedUserEmail) {
            $query->where('to', $loggedUserEmail)->orWhere('from', $loggedUserEmail);
        });

        $query = $query->groupBy('mailbox.thread_id');
        // echo $query->toSql();
        // die();
        // $query = ZimbarMailbox::whereIn("id",$groupMessages);
        if ($order_by) {
            $query = $query->orderBy($order_by, $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }
        // $num_results_filtered = $query->count();
        $data = $query->offset($offset)->limit($per_page)->get();
        $num_results_filtered = count($data); //returns correct value. I will assume there is bug in eloquent.

        $count = $offset;
        $result = new LengthAwarePaginator($data, $num_results_filtered, $per_page, $page);
        $result->setPath(route('email.getuserMailbox', $email));
        return $result;
    }



    public function usermailList($mailid, $contactEmail)
    {
        $user = Auth::user();
        $loggedUserEmail = $user->email;
        $count = ZimbarMailbox::where('thread_id', $mailid)->count();
        $skip = 1;
        $limit = $count - $skip; // the limit
        $query = ZimbarMailbox::where('thread_id', $mailid)->where(function ($query) use ($contactEmail) {
            $query->where('to', $contactEmail)->orWhere('from', $contactEmail);
        })->where(function ($query) use ($loggedUserEmail) {
            $query->where('to', $loggedUserEmail)->orWhere('from', $loggedUserEmail);
        })->skip(1)->take($limit)->orderBy('created_at', 'asc')->get();
        return $query;
    }

    public function updateInboxStatus($id)
    {
        ZimbarMailbox::where('id', $id)->update(['status' => 1]);
        return ZimbarMailbox::where('id', $id)->get();
    }

    public function getMailboxbyID($id)
    {
        return ZimbarMailbox::where('id', $id)->get();
    }

    public function saveDownloadFile($id, $uniqueId, $filename, $passPhrase, $folderpath)
    {
        return ZimbarMailbox::where('uniqueId', $uniqueId)->where('mail_id', $id)->update(
            [
                'file_name' => $filename,
                // 'private_key'=>$privateKey,
                'pass_phrase' => $passPhrase,
                'file_path' => $folderpath
            ]
        );
    }

    public function updateMailDetails($save_id, $mail_id, $thread_id)
    {
        $updateMailid = ZimbarMailbox::where('id', $save_id)->update(
            [
                'mail_id' => $mail_id,
                'thread_id' => $thread_id
            ]
        );
        if ($updateMailid) {
            return ZimbarMailbox::where('id', $save_id)->get();
        }
    }

    public function getUserDetails($userEmail)
    {
        return User::where('email_address', $userEmail)->get();
    }

    public function turnOffTwoFactor($userId){
        $portal_user = PortalUser::find($userId);
        $updateArray = array(
            'is_verify' => 0,
            'two_factor_option' => null,
            'two_factor_slider' => 0,
            'two_factor_token' => null
        );
        $portal_user->update($updateArray);
        return $portal_user;
    }

    public function getWorkflowsNotEnrolledByUser($userId) {
        return HubspotWorkFlows::whereNotExists(function ($query) use ($userId) {
            $query->select(DB::raw(1))
                ->from('workflow_event_history as weh')
                ->whereRaw('weh.workflow_id = hubspot_workflow.id')
                ->whereRaw('weh.enrollment = hubspot_workflow.enrollment_count')
                ->where('weh.portal_user_id', $userId);
        })->where('is_active', 0)->get();
    }

}
