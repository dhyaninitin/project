<?php

namespace App\Services;
use App\Model\{PortalDealStage,Log};
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use App\Enums\{Logs,Roles,TargetTypes,PortalAction};
use Auth;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\{PortalDealStageTrait, PortalTraits};

class PortalDealStageService extends AbstractService
{
    use PortalDealStageTrait;
    use PortalTraits;

    public function getPortalDealStageList($filters){

        $result = [];
        $page  = isset( $filters[ 'page' ] ) ? $filters[ 'page' ] : 1;
        $per_page = isset( $filters[ 'per_page' ] ) ? $filters[ 'per_page' ] : 10;
        $order_by = isset( $filters[ 'order_by' ] ) ? $filters[ 'order_by' ]: null;
        $order_dir = isset( $filters[ 'order_dir' ] ) ? $filters[ 'order_dir' ]: 'desc';
        $offset = ( $page - 1 ) * $per_page;
        $search_value = isset($filters['search']) ? $filters['search']: '';
        $portal_deal_stage_id = isset( $filters[ 'portal_deal_stage' ] ) ? $filters[ 'portal_deal_stage' ]: null;
        $db_name = getenv( 'DB_DATABASE' );

        $query = PortalDealStage::select('*');

        if($search_value) {
        
            $search_value_arr = explode(' ', $search_value);
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(label) like '%{$value}%'");
            }
        }

        $num_results_filtered = $query->count();

        if ( $order_by ) {
            $query = $query->orderBy( $order_by, $order_dir );
        } else {
            $query = $query->orderBy( 'created_at', 'desc' );
        }

        $query = $query->offset( $offset )->limit( $per_page );

        $deal_stages_list = $query->get();

        if($portal_deal_stage_id != null && $offset == 0) {
            $specificRecord = PortalDealStage::select('*')->where("id", $portal_deal_stage_id);
            $deal_stages_list = $specificRecord->union($query)->get();
        } else {
            $deal_stages_list = $query->get();
        }

        $count = $offset;
        $result = new LengthAwarePaginator( $deal_stages_list, $num_results_filtered, $per_page, $page );
        $result->setPath( route( 'portalDealSatge.getPortalDealStageList' ) );
        return $result;
    }

    // Delete deal stage
    public function delete($dealStageId)
    {
        $portal_user = Auth::user();
        if ($portal_user->hasRole(Roles::SuperAdmin)) { 
            $dealStage = PortalDealStage::find($dealStageId);
            if ($dealStage) {
                $result = $dealStage->delete();
                
                if($result){
                    $msg= '<b>'.$dealStage->label.'</b> <b>deleted </b> by <b>'.$portal_user->full_name.'</b>';
                    Log::create(array(
                        'category'      => Logs::DEALSTAGE,
                        'action'        => PortalAction::DELETED,
                        'target_id'     => $dealStage->id,
                        'target_type'   => TargetTypes::DealStage,
                        'portal_user_id'   => $portal_user->id,
                        'portal_user_name' => $portal_user->full_name,
                        'content'       => $msg
                    ));
                }
            } else {
                $result = false;
            }
        } else {
            $result = false;
        }
        return $result;
    }


    // Add Portal Deal stage
    public function create($data)
    { 
        $portal_user = Auth::user();
        $result = false;  
        try {
            if ($portal_user->hasRole(Roles::SuperAdmin) || $portal_user->hasRole(Roles::Admin)) { 
                $result = PortalDealStage::create($data); 
                if($result){
                    $msg= '<b>'.$data[ 'label' ].'</b> was <b>created</b> by <b>'.$portal_user->full_name.'</b>';
                    Log::create(array(
                        'category'      => Logs::DEALSTAGE,
                        'action'        => PortalAction::CREATED,
                        'target_id'     => $result->id,
                        'target_type'   => TargetTypes::DealStage,
                        'portal_user_id'   => $portal_user->id,
                        'portal_user_name' => $portal_user->full_name,
                        'content'       => $msg
                    ));
                }   
            } else {
                return $result;
            }
            
        } catch (\Exception $e) { 
        } 
        return $result;
    }

    public function update($data, $portal_deal_stage_id)
    { 
        $portal_user = Auth::user();
        $deal_stage = false;  
        try {
            if ($portal_user->hasRole(Roles::SuperAdmin) || $portal_user->hasRole(Roles::Admin)) { 
                $deal_stage = PortalDealStage::find($portal_deal_stage_id); 
                // $old_Data_array = [
                //     "label" => $deal_stage->label,
                //     "pipeline" => $deal_stage->pipeline
                // ];
                $logArray = array(
                    'category'      => Logs::DEALSTAGE,
                    'action'        => PortalAction::UPDATED,
                    'target_id'     => $deal_stage->id,
                    'target_type'   => TargetTypes::DealStage,
                    'portal_user_id'   => $portal_user->id,
                    'portal_user_name' => $portal_user->full_name,
                );
                $this->createUpdateLogs($deal_stage,$data,'PortalDealStage',$logArray);

                // $old_data = collect($old_Data_array);
                $deal_stage->update($data);

                // $new_Data_array = [
                //     "label" => $data['label'],
                //     "pipeline" => $data['pipeline']
                // ];
                // $msg = "";
                // $new_data = collect($new_Data_array);
                // $diff = $new_data->diff($old_data);

                // if (isset($diff->toArray()['label'])) {
                //     $label = $diff->toArray()['label'];
                   
                //     $msg .= "label name was updated <b>{$old_data['label']}</b> to <b>{$label}</b> ";
                // }

                // if (isset($diff->toArray()['pipeline'])) {
                //     $pipeline = $diff->toArray()['pipeline'];
                //     $oldPipelineName = $this->checkPipelineValue($old_data['pipeline']);
                //     $newPipelineName = $this->checkPipelineValue($pipeline);
                //     $msg .= "pipeline name was updated <b>{$oldPipelineName}</b> to <b>{$newPipelineName}</b> ";
                // }

                // Log::create(array(
                //     'category'      => Logs::DEALSTAGE,
                //     'action'        => PortalAction::UPDATED,
                //     'target_id'     => $deal_stage->id,
                //     'target_type'   => TargetTypes::DealStage,
                //     'portal_user_id'   => $portal_user->id,
                //     'portal_user_name' => $portal_user->full_name,
                //     'content'       => $msg
                // ));

            } else {
                return $result;
            }
        } catch (\Exception $e)
        {
        }

        return $deal_stage;
    }

}

