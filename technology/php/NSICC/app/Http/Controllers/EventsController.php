<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\{ EventService };
use App\Http\Requests\{StoreeventsRequest,ListRequest};
use App\Http\Resources\{ EventResource,EventCollection };
use Auth;
use Session;

class EventsController extends Controller
{
    public function __construct(EventService $EventService)
    {
        $this->eventService = $EventService;
    }

    public function store(StoreeventsRequest $request)
    {
        $user = Auth::user();
        $store = $request->all();$user_id = $user->id;
        $store_result = $this->eventService->store($store,$user_id);
        return new EventResource($store_result);
    }

    public function show(Request $request,$event_id)
    {
        $user = Auth::user(); 
        $result = $this->eventService->show($event_id);
        return new EventResource($result);
    }

    public function getlist(ListRequest $request)
    {
        $search = $request->all();
        $result = $this->eventService->getlist($search);
        return new EventCollection($result);
    }

    public function delete(Request $request,$delete_id)
    {
        $user = Auth::user();
        $get_account_list = $this->eventService->delete($delete_id);
        return response()->json([
            'result' => 'Event has been successfully removed.'
        ]);
    }

    public function update(Request $request,$update_id)
    {
        $user = Auth::user();
        $request = $request->all();
        $updateResult = $this->eventService->update($request,$update_id);
        return new EventResource($updateResult);
    }



}
