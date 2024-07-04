<?php

namespace App\Services;

use App\Model\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class RoleService extends AbstractService
{
    /**
     * get role list
     *
     * @return array
     */


    public function getList()
    {
        $result = Role::all();
        return $result;
    }
}
