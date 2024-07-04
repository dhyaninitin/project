<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use App\Model\{ MModel };
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Auth;

class MModelService extends AbstractService
{

    /**
     * get model list
     *
     * @return array
     */

    public function getList()
    {
        return MModel::all();
    }

    /**
     * get all models
     * 
     * @param array $filter
     * @return array
     */

    public function getAll($filter)
    {
        $f_make = isset($filter['make']) ? $filter['make']: null;

        $query = MModel::with('make');

        if ($f_make)
        {
            $query = $query->whereHas('make', function (Builder $in_query) use($f_make) {
                $in_query->where('id', $f_make);
            });
        }
        
        $makes = $query->get();
        return $makes;
    }

    
    /**
     * create or update model
     *
     * @return array
     */

    public function updateOrCreate($data, $is_new = true)
    {
        foreach ($data as $key => $item) {
            MModel::updateOrCreate(
                array(
                    'id' => $item->ID
                ),
                array(
                    'id' => $item->ID,
                    'm_make_id' => $item->MakeID,
                    'name' => $item->Name,
                    'is_new' => $is_new,
                )
            );
        }
        return true;
    }
}
