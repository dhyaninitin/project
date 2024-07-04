<?php

namespace App\Services;

use App\Model\{EmailTemplates};
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Auth;
use Illuminate\Database\Eloquent\Builder;

class EmailTemplateService extends AbstractService
{

    public function getList($filters){
        $result = [];
        $page  = isset( $filters[ 'page' ] ) ? $filters[ 'page' ] : 1;
        $perPage = isset( $filters['per_page'] ) ? $filters['per_page'] : 10;
        $orderBy = isset( $filters[ 'order_by' ] ) ? $filters[ 'order_by' ]: null;
        $orderDir = isset( $filters[ 'order_dir' ] ) ? $filters[ 'order_dir' ]: 'desc';
        $offset = ( $page - 1 ) * $perPage;
        $searchValue = isset($filters['search']) ? $filters['search']: '';

        $template_id = isset( $filters[ 'template_id' ] ) ? $filters[ 'template_id' ]: null;

        $query = EmailTemplates::select('*');
        
        if($searchValue) { 
        
            $searchValueArray = explode(' ', $searchValue);
            foreach ($searchValueArray as $value) {
                $query->whereRaw("concat(COALESCE(`title`,''), ' ', COALESCE(`subject`,''), ' ', COALESCE(`body`,''), ' ') like '%{$value}%'");
            }
        }

        $numResultsFiltered = $query->count();

        if ( $orderBy ) {
            $query = $query->orderBy( $orderBy, $orderDir );
        } else {
            $query = $query->orderBy( 'created_at', 'desc' );
        }
       
        $query = $query->offset($offset)->limit($perPage);

        if($template_id != null && $offset == 0) {
            $specificRecord = EmailTemplates::select('*')->where("id", $template_id);
            $template = $specificRecord->union($query)->get();
        } else {
            $template = $query->get();
        }
        // $template = $query->get();
        $count = $offset;
        $result = new LengthAwarePaginator( $template, $numResultsFiltered, $perPage, $page );
        $result->setPath( route( 'email-template.index') );
        return $result;
    }

    public function store($data,$id) {
        $store = new EmailTemplates;
        $store->title = $data['title'];
        $store->subject = $data['subject'];
        $store->body = $data['body'];
        $store->added_by = $id;
        $store->save();
        return $store;
    }

    public function update($updateData, $updateId){
        $update = EmailTemplates::find($updateId);
        $update->update($updateData);
        return $update;
    }


    public function delete($deleteId){
        $emailTemplate = EmailTemplates::find($deleteId);
        if($emailTemplate){
            $emailTemplate->delete();
            return true;
        }
    }
}