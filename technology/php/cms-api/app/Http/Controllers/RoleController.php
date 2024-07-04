<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Model\Campaign;
use App\Services\RoleService;
use App\Http\Resources\{RoleCollection};
use Auth;

class RoleController extends Controller
{
    /**
     * @var RoleService
     */
    protected $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    /**
     * Get location list
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $result = $this->roleService->getList();
        return new RoleCollection($result);
    }
}
