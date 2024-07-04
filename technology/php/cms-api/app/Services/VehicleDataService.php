<?php

namespace App\Services;

use App\Model\{Years, VBrand, VModel, VehicleTrim, VehicleDataLogs};
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Auth;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use App\Traits\PortalTraits;

class VehicleDataService extends AbstractService{
    use PortalTraits;

    public function getYearList($filters){
        $currentYear =  date("Y");
        Years::firstOrCreate(['year' => $currentYear]);
        $query = Years::select('*')->get();
        return $query;
    }

    public function getBrandList($filters){
        $query = VBrand::select('*')->get();
        return $query;
    }

    public function getModels($modelFilter){
        $brand = isset($modelFilter['brand']) ? $modelFilter['brand']: '';
        $year = isset($modelFilter['year']) ? $modelFilter['year']: '';
        $query = VModel::select('*')->where('brand_id', $brand)->where('year',$year)->orderBy('name', 'asc')->get();
        return $query;
    }

    public function getTrims($modelFilter){
        $brand = isset($modelFilter['brand']) ? $modelFilter['brand']: '';
        $year = isset($modelFilter['year']) ? $modelFilter['year']: '';
        $modelId = isset($modelFilter['model_id']) ? $modelFilter['model_id']: '';
        $query = VehicleTrim::select('*')->where('brand_id', $brand)->where('year',$year)->where('model_id',$modelId);
        $query->orderBy('trim', 'asc');
        return $query->get();
    }

    public function updateYear($data, $id){
        $user = Auth::user();
        $msg = '';
        if(isset($data['is_default'])){
            $query = Years::select('*')->where('is_default', 1)->update(array('is_default' => 0));  
        }
        $update = Years::find($id);
        $msg = $update->year;
        unset($data['id']);
        $update->update($data);

        if(isset($data['is_default'])){
            if($data['is_default'] === 0) {
                $msg .= ' was removed from default by '.$user->full_name;
            } else {
                $msg .= ' was marked as default by '.$user->full_name;
            }
        }

        if(isset($data['is_scrapable'])){
            $msg .= ' was marked as <b>'.$this->checkStatus($data['is_scrapable']).'</b> for scraper by '.$user->full_name;
        }

        if(isset($data['is_active'])){
            $msg .= ' was marked as <b>'.$this->checkStatus($data['is_active']).'</b> for shop by '.$user->full_name;
        }

        $logArray = array(
            'scraper_type'  => 0,
            'content'       => $msg,
        );
        VehicleDataLogs::create($logArray);
        return $update;
    }

    public function upadteBrands($data, $id){
        unset($data['id']);
        $update = VBrand::find($id);
        if(isset($data['years'])){
            $jsonYears = json_decode($update->years);
            $brandYear = ($jsonYears !== null) ? $jsonYears : [];

            if(!empty($update->years) && !in_array($data['years'], $brandYear) && $data['is_active'] == 0){
                array_push($brandYear,$data['years']);
            }else if(in_array($data['years'], $brandYear) && $data['is_active'] == 1){
                $remove = array_search($data['years'], $brandYear);
                if ($remove !== false) {
                    unset($brandYear[$remove]);
                }
                $brandYear = array_values($brandYear);
            }else{
                if(!in_array($data['years'], $brandYear)){
                    array_push($brandYear,$data['years']);
                }
            }
            if(!empty($brandYear)){
                $data['years'] = json_encode($brandYear);
            }else{
                $data['years'] = Null;
            }
        }
        $update->update($data);
        return $update;
    }

    public function updateVehicleValues($id,$data){
        $user = Auth::user();
        $update = VBrand::find($id);
    
        $old_Data_array = [
            "name" => $update->name
        ];
        if(isset($data['image_url'])){
            $old_Data_array['image'] = $update->image_url;
        }

        $old_data = collect($old_Data_array);
        $update->update($data);

        $new_Data_array = [
            "name" => $data['name']
        ];

        if(isset($data['image_url'])){
            $new_Data_array['image'] = $data['image_url'];
        }

        $new_data = collect($new_Data_array);

        $diff = $new_data->diff($old_data);
        $msg = "";

        if (isset($diff->toArray()['name'])) {
            $name = $diff->toArray()['name'];
            $msg .= "brand name was updated <b>{$old_data['name']}</b> to <b>{$name}</b>, ";
        }

        if (isset($diff->toArray()['image'])) {
            $msg .= "brand image was updated,";
        }

            $msg .= ' by '.$user->full_name;

        $logArray = array(
            'scraper_type'  => 1,
            'content'       => $msg,
        );
        VehicleDataLogs::create($logArray); 
        return $update;
    }

    public function updateModelValues($id,$data){
        $user = Auth::user();
        $update = VModel::find($id);

        $old_Data_array = [
            "name" => $update->name
        ];
        if(isset($data['image_url_640'])){
            $old_Data_array['image'] = $update->image_url;
        }
        $old_data = collect($old_Data_array);

        $update->update($data);

        $new_Data_array = [
            "name" => $data['name']
        ];

        if(isset($data['image_url_640'])){
            $new_Data_array['image'] = $data['image_url_640'];
        }

        $new_data = collect($new_Data_array);

        $diff = $new_data->diff($old_data);
        $msg = "";

        if (isset($diff->toArray()['name'])) {
            $name = $diff->toArray()['name'];
            $msg .= "model name was updated <b>{$old_data['name']}</b> to <b>{$name}</b>, ";
        }

        if (isset($diff->toArray()['image'])) {
            $msg .= "model image was updated,";
        }

            $msg .= ' by '.$user->full_name;

        $logArray = array(
            'scraper_type'  => 2,
            'content'       => $msg,
        );
        VehicleDataLogs::create($logArray); 

        return $update;
    }

    public function updateTrimValues($id,$data){
        $user = Auth::user();
        $update = VehicleTrim::find($id);

            $old_Data_array = [
                "trim" => $update->trim
            ];
            if(isset($data['image_url_640'])){
                $old_Data_array['image'] = $update->image_url;
            }
            $old_data = collect($old_Data_array);

        $update->update($data);

            $new_Data_array = [
                "trim" => $data['trim']
            ];

            if(isset($data['image_url_640'])){
                $new_Data_array['image'] = $data['image_url_640'];
            }

            $new_data = collect($new_Data_array);

            $diff = $new_data->diff($old_data);
            $msg = "";

            if (isset($diff->toArray()['trim'])) {
                $trim = $diff->toArray()['trim'];
                $msg .= "trim was updated <b>{$old_data['trim']}</b> to <b>{$trim}</b>, ";
            }
    
            if (isset($diff->toArray()['image'])) {
                $msg .= "trim image was updated,";
            }
            $msg .= ' by '.$user->full_name;

            $logArray = array(
                'scraper_type'  => 3,
                'content'       => $msg,
            );
            VehicleDataLogs::create($logArray);

            
        return $update;
    }

    // get logs

    public function getVehicleLogs($logFilter){
        $result = [];
        $page  = isset( $logFilter[ 'page' ] ) ? $logFilter[ 'page' ] : 1;
        $perPage = isset( $logFilter['per_page'] ) ? $logFilter['per_page'] : 10;
        $orderBy = isset( $logFilter[ 'order_by' ] ) ? $logFilter[ 'order_by' ]: null;
        $orderDir = isset( $logFilter[ 'order_dir' ] ) ? $logFilter[ 'order_dir' ]: 'desc';
        $offset = ( $page - 1 ) * $perPage;
        $searchValue = isset($logFilter['search']) ? $logFilter['search']: '';
        $logsType = isset($logFilter['type']) ? $logFilter['type']: '';

        $query = VehicleDataLogs::select('*')->where('status_type','!=',1 )->where('scraper_type',$logsType);

        if($searchValue) {
            $searchValueArray = explode(' ', $searchValue);
            foreach ($searchValueArray as $value) {
                $query->whereRaw("concat(content) like '%{$value}%'");
            }
        }

        $numberResultsFiltered = $query->count();

        if ( $orderBy ) {
            $query = $query->orderBy( $orderBy, $orderDir );
        } else {
            $query = $query->orderBy( 'created_at', 'desc' );
        }
       
        $query = $query->offset($offset)->limit($perPage);
        $template = $query->get();
        $count = $offset;
        $result = new LengthAwarePaginator( $template, $numberResultsFiltered, $perPage, $page );
        $result->setPath( route( 'vehicle-data.getVehicleLogs') );
        return $result;
    }


    public function getStatus(){
        return VehicleDataLogs::select('*')->where('status_type',1)->orderBy( 'status', 'asc' )->get();
    }

    public function updateModel($data, $id){
        $user = Auth::user();
        $update = VModel::find($id);
        unset($data['id']);
        $update->update($data);
        return $update;
    }

    public function updateTrim($data, $id){
        $user = Auth::user();
        $update = VehicleTrim::find($id);
        unset($data['id']);
        $update->update($data);
        return $update;
    }

    public function getYears(){
        $getYears = VehicleTrim::select('year')->groupBy('year')->get();
        foreach($getYears as $item){
            Years::firstOrCreate(['year' => $item['year']]);
        }
        return true;
    }

}

    



