<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\{DonationsRequest,ListRequest};
use App\Services\{DashboardService,UserService};
use App\Http\Resources\{ DonationResource,DonationCollection };
use Auth;


class DashboardController extends Controller
{

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function serviceCount(Request $request)
    {
        $user = Auth::user(); 
        $search = $request->all();
        $result = $this->dashboardService->serviceCount($search);
    }

}
