<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\{ EventService };
use App\Http\Requests\{ListRequest};
use App\Http\Resources\{ EventParticipantResource,EventParticipantCollection };
use Auth;
use Session;

class EventsParticipantController extends Controller
{
    public function __construct(EventService $EventService)
    {
        $this->eventService = $EventService;
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $store = $request->all();
        $result = $this->eventService->storeParticipants($store);
        return new EventParticipantCollection($result);
    }

    public function getlist(Request $request,$event_id)
    {
        $user = Auth::user(); 
        $result = $this->eventService->showparticipants($event_id);
        return new EventParticipantCollection($result);
    }

    public function update(Request $request,$update_id)
    {
        $user = Auth::user();
        $request = $request->all();
        $updateResult = $this->eventService->updateParticipants($request,$update_id);
        return new EventParticipantResource($updateResult);
    }

    public function delete(Request $request,$delete_id)
    {
        $user = Auth::user();
        $get_account_list = $this->eventService->deleteParticipants($delete_id);
        return response()->json([
            'result' => 'Participant has been successfully removed.'
        ]);
    }

    
}
