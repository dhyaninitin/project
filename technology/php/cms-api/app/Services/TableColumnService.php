<?php

namespace App\Services;

use App\Model\TableColumnHeading;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Auth;

class TableColumnService extends AbstractService
{
    /**
     * get role list
     *
     * @return array
     */


     public function create($request){
        $portal_user = Auth::user();
        $result = TableColumnHeading::where([
            ['portaluser_id','=', $portal_user['id']],
            ['section_name','=', $request['filter_section_name']],
        ])->first();

        if($result){
            $updatearray = array("table_column"=>json_encode($request['column']));
            $result->update($updatearray);
        }else{
            $result = new TableColumnHeading;
            $result->portaluser_id = $portal_user['id'];
            $result->section_name = $request['filter_section_name'];
            $result->table_column = json_encode($request['column']);
            $result->save();
        }
        return $result;
     }

    public function getlist()
    {
        $portal_user = Auth::user();
        echo 'yess';
    }

    public function getDetailsById($section_name) {
        $portal_user = Auth::user();
        $result = TableColumnHeading::where([
            ['portaluser_id','=', $portal_user['id']],
            ['section_name','=',$section_name],
        ])->get();
        return $result;
    }
}
