<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\{DonationstyppeRequest,DonationsRequest,ListRequest};
use App\Services\{DonationsService,UserService};
use App\Http\Resources\{ DonationtypeResource,DonationtypeCollection,DonationResource,DonationCollection };
use Auth;


class DonationsController extends Controller
{

    public function __construct(DonationsService $DonationsService)
    {
        $this->donationsService = $DonationsService;
    }

    public function index(ListRequest $request)
    {
        $user = Auth::user(); 
        $search = $request->all();
        $result = $this->donationsService->getList($search);
        return new DonationCollection($result);
    }

    public function storetype(DonationstyppeRequest $request)
    {
        $user = Auth::user();   
        $insert = $request->all();
        $result = $this->donationsService->storetype($insert);
        return new DonationtypeResource($result);
    }

    public function gettype(Request $request)
    {
        $result = $this->donationsService->gettype();
        return new DonationtypeCollection($result);
    }

    public function deletetype(Request $request,$donationtypeid)
    {
        $user = Auth::user();
        $result = $this->donationsService->deletetype($donationtypeid);
        return response()->json([
            'result' => 'Donation Type has been successfully removed.'
        ]);
    }

    public function storedonation(DonationsRequest $request){
        $user = Auth::user();
        $insert = $request->all();
        $result = $this->donationsService->storedonation($insert);
        return new DonationResource($result);
    }

    public function show(Request $request,$donationid)
    {
        $user = Auth::user();
        $result = $this->donationsService->showdonation($donationid);
        return new DonationResource($result);
    }

    public function deletedonation(Request $request,$donationid)
    {
        $user = Auth::user();
        $result = $this->donationsService->deletedonation($donationid);
        return response()->json([
            'result' => 'Donation has been successfully removed.'
        ]);
    }

    public function update(Request $request,$updateid)
    {
        $user = Auth::user();
        $update_data = $request->all();
        $result = $this->donationsService->update($updateid, $update_data);
        return new DonationResource($result);
    }

}
