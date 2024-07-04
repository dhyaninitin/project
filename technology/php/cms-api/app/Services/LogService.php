<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use App\Http\Resources\UserCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Model\Log;
use App\Enums\{Roles, Logs, TargetTypes, PortalAction};
use Auth;
class LogService extends AbstractService
{
    /**
     * Get list logs
     * @return Array Log
     */

    public function list($filters)
    {
        $portal_user = Auth::user();

        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $offset = ($page - 1) * $per_page;

        $query = Log::whereRaw('1=1');

        if(!empty($filters['search'])) {
            $searchValue = $filters['search'];
            $query = $query->where( function($wquery) use($searchValue) {
                $wquery->Where('content', 'like', '%'.strtolower($searchValue).'%');
            });
        }

        /**
         * Check Portal user has admin, administrative role
         */

        if (!$portal_user->hasRole([Roles::SuperAdmin, Roles::Admin, Roles::Administrative]))
        {
            $query = $query->where('portal_user_id', $portal_user->id);
        }

        $num_results_filtered = $query->count();

        if (isset($filters['order_by'])) {
            $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
            $query = $query->orderBy($filters['order_by'], $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $logs = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($logs, $num_results_filtered, $per_page, $page);
        $result->setPath(route('log.index'));
        return $result;
    }

    /**
     * Get logs with pagination
     * @param String $category - Type for log time
     * @param Number $target_id - Id of target object
     * @return Array Log
     */    

    public function getByCategoryPagniated($category, $target_id,$filters)
    {

        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 5;
        $offset = ($page - 1) * $per_page;

        $query = Log::where('category', $category)
            ->where('target_id', $target_id);

        if(!empty($filters['search'])) {
            $searchValue = $filters['search'];
            $query = $query->where( function($wquery) use($searchValue) {
                $wquery->where('content', 'like', '%'.strtolower($searchValue).'%');
            });
        }

        $num_results_filtered = $query->count();

        if (isset($filters['order_by'])) {
            $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
            $query = $query->orderBy($filters['order_by'], $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $logs = $query->get();
        // echo '<pre>';print_r($logs->toArray());
        // customize log content 
        switch ($category) {
            case 'request':
                $create_log = new Log([
                    'category'      => Logs::Request,
                    'action'        => PortalAction::CREATED,
                    'target_id'     => $target_id,
                    'target_type'   => TargetTypes::Request,
                    'portal_user_id'   => NULL,
                ]);
                $create_log->created_at = $create_log->target->created_at;
                $create_log->updated_at = $create_log->target->updated_at;
                $logs->prepend($create_log);
                break;
            default:
                break;
        }
        $count = $offset;

        $result = new LengthAwarePaginator($logs, $num_results_filtered, $per_page, $page);
        $result->setPath(route('log.index'));
        return $result;
    }



    public function getByallusersPagniated($category,$filter)
    {
        $portal_user = Auth::user();
        $page  = isset($filter['page']) ? $filter['page'] : 1;
        $per_page = isset($filter['per_page']) ? $filter['per_page'] : 10;
        $offset = ($page - 1) * $per_page;

        $query = Log::where('category', $category);
        
        if(!empty($filters['search'])) {
            $searchValue = $filters['search'];
            $query = $query->where( function($wquery) use($searchValue) {
                $wquery->where('content', 'like', '%'.strtolower($searchValue).'%');
            });
        }

        if ($portal_user->hasRole(Roles::Concierge)) {
            $query = $query->where('portal_user_id', $portal_user->id);
        }

        $num_results_filtered = $query->count();

        if (isset($filters['order_by'])) {
            $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
            $query = $query->orderBy($filters['order_by'], $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);
        $logs = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($logs, $num_results_filtered, $per_page, $page);
        $result->setPath(route('log.index'));
        return $result;
    }


    /**
     * Get logs
     * @param String $category - Type for log time
     * @param Number $target_id - Id of target object
     * @return Array Log
     */    

    public function getByCategory($category, $target_id, $target_type=null,$filters=null)
    {
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 20;
        $offset = ($page - 1) * $per_page;

        $query = Log::where('category', $category)
            ->where('target_id', $target_id);

        if($target_type != null) {
            $query->where('target_type', 'App\Model\PortalUser');
        }
        if(!empty($filters['search'])) {
            $searchValue = $filters['search'];
            $query = $query->where( function($wquery) use($searchValue) {
                $wquery->where('content', 'like', '%'.strtolower($searchValue).'%');
            });
        }

        $num_results_filtered = $query->count();

        if (isset($filters['order_by'])) {
            $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
            $query = $query->orderBy($filters['order_by'], $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $logs = $query->get();

        $count = $offset;

        $result = new LengthAwarePaginator($logs, $num_results_filtered, $per_page, $page);
        $result->setPath(route('log.index'));
        return $result;
    }


    /**
     * Get delete logs
     * @param String $category - Type for log time
     * @return Array Log
     */    

    public function getDeleteLogByCategory($category= null, $filters, $target_type=null)
    {
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $offset = ($page - 1) * $per_page;

        $query = Log::where('category', $category)
            ->where('target_type', $target_type);
            
        if(!empty($filters['search'])) {
            $searchValue = $filters['search'];
            $query->where(function($query) use ($searchValue) {
                $query->whereHas('portal_user', function (Builder $in_query) use ($searchValue) {
                    $in_query->where('first_name', 'like', '%' . $searchValue . '%')
                        ->orWhere('last_name', 'like', '%' . $searchValue . '%');
                })
                ->orWhere('content', 'like', '%' . $searchValue . '%');
            });
        }

        $num_results_filtered = $query->count();

        if (isset($filters['order_by'])) {
            $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
            $query = $query->orderBy($filters['order_by'], $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $logs = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($logs, $num_results_filtered, $per_page, $page);
        $result->setPath(route('log.index'));
        return $result;
    }

      /**
     * Get logs
     * @param String $target_type - Type for target
     * @param Number $target_id - Id of target object
     * * @param String $filters - filter for pagination
     * @return Array Log
     */    

    public function getbyTargetType($target_type, $target_id, $filters = null)
    {
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $offset = ($page - 1) * $per_page;

        $query = Log::where('target_id', $target_id)->where('target_type', $target_type);

        $num_results_filtered = $query->count();

        if (isset($filters['order_by'])) {
            $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
            $query = $query->orderBy($filters['order_by'], $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $logs = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($logs, $num_results_filtered, $per_page, $page);
        $result->setPath(route('log.index'));
        
        return $result;
    }

    /**
     * Get logs by target ids
     * @param String $category - Type for log time
     * @param Number $target_id - Id of target object
     * @return Array Log
     */    

    public function getByCategoryByIds($category, $target_type, $filters = null)
    {
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $offset = ($page - 1) * $per_page;

        $query = Log::where('category', $category)->where('target_type', $target_type)
            ->whereIn('target_id', $filters['targetIds']);

        if(!empty($filters['search'])) {
            $searchValue = $filters['search'];
            $query = $query->where( function($wquery) use($searchValue) {
                $wquery->where('content', 'like', '%'.strtolower($searchValue).'%');
            });
        }

        $num_results_filtered = $query->count();

        if (isset($filters['order_by'])) {
            $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
            $query = $query->orderBy($filters['order_by'], $order_dir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }

        $query = $query->offset($offset)->limit($per_page);

        $logs = $query->get();
        
        $count = $offset;

        $result = new LengthAwarePaginator($logs, $num_results_filtered, $per_page, $page);
        $result->setPath(route('log.index'));
        return $result;
    }
      /**
     * Get Workflow logs By id
     * @param String $category - Type for log time
     * @return Array Log
     */    

     public function getWorkflowByCategoryId($category, $filters,$id)
     {
         $page  = isset($filters['page']) ? $filters['page'] : 1;
         $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
         $offset = ($page - 1) * $per_page;
 
         $query = Log::where('category', $category)
             ->where('target_type', 'App\Model\HubspotWorkFlows')
             ->where('target_id', $id);
 
         if(!empty($filters['search'])) {
            $searchValue = $filters['search'];
            $query = $query->where( function($wquery) use($searchValue) {
                $wquery->where('content', 'like', '%'.strtolower($searchValue).'%');
            });
         }
 
         $num_results_filtered = $query->count();
 
         if (isset($filters['order_by'])) {
             $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
             $query = $query->orderBy($filters['order_by'], $order_dir);
         } else {
             $query = $query->orderBy('created_at', 'desc');
         }
 
         $query = $query->offset($offset)->limit($per_page);
 
         $logs = $query->get();
         $count = $offset;
 
         $result = new LengthAwarePaginator($logs, $num_results_filtered, $per_page, $page);
         $result->setPath(route('log.index'));
         return $result;
     }

     public function getLogsList($category, $filters, $targetType){
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $perPage = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $offset = ($page - 1) * $perPage;

        $query = Log::where('category', $category)->where('target_type', $targetType);

            if(!empty($filters['search'])) {
                $searchValue = $filters['search'];
                $query = $query->where( function($subQuery) use($searchValue) {
                    $subQuery->where('content', 'like', '%'.strtolower($searchValue).'%');
                });
            }
        $numResultsFiltered = $query->count();

            if (isset($filters['order_by'])) {
                $orderDir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
                $query = $query->orderBy($filters['order_by'], $orderDir);
            } else {
                $query = $query->orderBy('created_at', 'desc');
            }
        $query = $query->offset($offset)->limit($perPage);

        $logs = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($logs, $numResultsFiltered, $perPage, $page);
        $result->setPath(route('log.index'));
        return $result;
     }

     public function wholesaleQuoteLogs($filters, $targetType){
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $perPage = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $offset = ($page - 1) * $perPage;
        $query = Log::where('target_type', $targetType);

        if(!empty($filters['search'])) {
            $searchValue = $filters['search'];
            $query = $query->where( function($subQuery) use($searchValue) {
                $subQuery->where('content', 'like', '%'.strtolower($searchValue).'%');
            });
        }
        $numResultsFiltered = $query->count();

        if (isset($filters['order_by'])) {
            $orderDir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
            $query = $query->orderBy($filters['order_by'], $orderDir);
        } else {
            $query = $query->orderBy('created_at', 'desc');
        }
        $query = $query->offset($offset)->limit($perPage);

        $logs = $query->get();
        $count = $offset;

        $result = new LengthAwarePaginator($logs, $numResultsFiltered, $perPage, $page);
        $result->setPath(route('log.index'));
        return $result;
     }
}
