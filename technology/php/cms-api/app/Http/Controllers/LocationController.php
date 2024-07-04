<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Model\{Campaign, Location};
use App\Services\LocationService;
use App\Http\Resources\{LocationCollection, LocationResource};
use App\Http\Requests\LocationRequest;
use Auth;

class LocationController extends Controller
{
    /**
     * @var LocationService
     */
    protected $locationService;

    public function __construct(LocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    /**
     * Get location list
     *
     * @param  Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $filter = $request->all();
        $result = $this->locationService->getList($filter);
        return new LocationCollection($result);
    }

    /**
     * Return location object
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $user_id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request,$user_id)
    {
        $user = Auth::user();
        $result = $this->locationService->get($user_id);
        return new LocationResource($result);
    }

    /**
     * Create location info
     *
     * @param  App\Http\Requests\LocationRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(LocationRequest $request)
    {
        $this->authorize('before', Location::class);
        $user = Auth::user();
        $data = $request->all();
        $result = $this->locationService->create($data);
        return new LocationResource($result);
    }

    /**
     * Update location info
     *
     * @param  App\Http\Requests\LocationRequest  $request
     * @param  Number  $user_id
     */
    public function update(LocationRequest $request, $user_id)
    {
        $this->authorize('before', Location::class);
        $user = Auth::user();
        $data = $request->all();
        $result = $this->locationService->update($user_id, $data);
        return new LocationResource($result);
    }

    /**
     * Delete location
     *
     * @param  Illuminate\Http\Request  $request
     * @param  Number  $user_id
     */
    public function destroy(Request $request, $user_id)
    {
        $this->authorize('before', Location::class);
        $user = Auth::user();
        $result = $this->locationService->delete($user_id);
        return response()->json([
            'result' => 'Location has been successfully removed.'
        ]);
    }
}
