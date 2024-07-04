<?php

namespace App\Services;

use App\Model\{User, PortalUser, ClientFileApplication};
use Illuminate\Support\Facades\DB;
use App\Http\Resources\UserCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use App\Services\ApiService;
use Auth;
use App\Enums\{Roles, Permissions};
use Illuminate\Support\Collection;
use Webklex\IMAP\Facades\Client;
use App\Traits\PortalTraits;

class ClientFilesService extends AbstractService
{
    use PortalTraits;
    /**
     * @var ApiService
     */
    protected $apiService;

    public function __construct(ApiService $apiService = null)
    {
        $this->apiService = $apiService;
    }
    
    public function submitClientApplication($request) {
        $rawRequest = json_decode($request['rawRequest']);
        $client_details = array(
            "submission_id" => $request['submissionID'],
            "first_name" => $rawRequest->q178_name->first,
            "last_name" => $rawRequest->q178_name->last,
            "phone" => $rawRequest->q5_mobilePhone5->full,
            "email_address" => $rawRequest->q4_emailAddress
        );
        
        $store_form = ClientFileApplication::create($client_details);

        $options = array(
            "filename" => $client_details['submission_id'],
            "email" => $client_details['email_address']
        );
        $this->uploadClientApplication($client_details);
        // $this->sendFilledApplicationNotification($options);
        
        return $store_form;
    } 

    public function uploadClientApplication($client_details) {
        sleep(7);
        $result = ClientFileApplication::where('submission_id', $client_details['submission_id'])->first();
        if($result) {
            if(empty($result->status)) {
                $fileStatus = $this->apiService->uploadFileToS3($result);
                $result->status = $fileStatus['data']['passPhrase'] ? 'true' : NULL;
                $result->pass_phrase = $fileStatus['data']['passPhrase'];
                $result->file_type = "credit application";
                $result->save();

                $this->createIfUserExists($client_details);
            }
        }
    }

    public function createIfUserExists($data) {
        $base_url = getenv('WEB_URL');

        $query = User::select('email_address')->where('email_address', $data['email_address'])->get()->toarray();
        if($query) {

        } else {
            $userInfo = array(
                'first_name'           => $data['first_name'],
                'last_name'            => $data['last_name'],
                'phone'                => $data['phone'],
                'email_address'        => $data['email_address'],
                'contact_owner_email'  => "chang@carblip.com", 
                'source'               => 7
            );
 
            try {
                $user = User::create($userInfo);
            } catch (\Exception $e)
            {
                
            }   
            
            $alert = array(
                "event_type" => "<@U6PQM7Y3T>, Credit Application uploaded without contact",
                "message" => "New Contact: " . "<".$base_url."/"."users/1451"."|*".$data['first_name'] ." ". $data['last_name'] . " at " . $data['email_address'] ."*>" . " created."
            );
            
            $this->apiService->sendAlert($alert);
        }
    }

    public function sendFilledApplicationNotification($request) {
        if($request) {
            $query = User::select('contact_owner_email')->where('email_address', $request['email'])->get()->toarray();
            if($query) {
                $contact_owner_email = $query[0]['contact_owner_email'];
                $user = PortalUser::select('first_name', 'last_name')->where('email', $contact_owner_email)->get()->toarray();
                if($user) {
                    $full_name = $user[0]['first_name']." ".$user[0]['last_name'];
                    if($full_name && $contact_owner_email) {
                        $request['email_address'] = $contact_owner_email;
                        $request['full_name'] = $full_name;

                        $res = $this->apiService->sendFilledApplicationNotification($request);
                    }
                }
            }
        }
    }

    public function getClientApplication($id) {
        $user = Auth::user();
        if($user->hasRole(Roles::Admin) || $user->hasRole(Roles::SuperAdmin) || $user->hasRole(Roles::Administrative)) {
            return array(
                "data" => "You don't have permission to view or download this file.",
                "permission" => false
            );
        }

        $result = ClientFileApplication::where('submission_id', $id)->first();
        if($result) {
            if($result->status == 'true') {
                $urlResult = $this->apiService->getFileFromS3($result);
                return array(
                        "data" => $urlResult['data'],
                        "token" => $result['pass_phrase'],
                        "documentname" => rand().".pdf",
                        "mimetype" => 'application/pdf',
                        "permission" => true
                );
            }else{
                return '';
            }
        }
    }

    public function getClientApplicationByEmail($email) {
        $user = Auth::user();
        $result = [];
        $db_name1 = getenv('DB_DATABASE');

        $query = ClientFileApplication::select("{$db_name1}.client_files.email_address as email","{$db_name1}.client_files.first_name as first","{$db_name1}.client_files.last_name as last","{$db_name1}.client_files.id as files_id","{$db_name1}.client_files.phone as phonenumber","{$db_name1}.client_files.file_type as filetype","{$db_name1}.client_files.created_at", "{$db_name1}.client_files.submission_id", "{$db_name1}.client_files.status");
        $query = $query->where('email_address', $email);
        $files = $query->get();
        return $files;
    }


    public function getClientFilesList($filters) {
        $user = Auth::user();
        $result = [];
        $db_result = [];
        $page  = isset($filters['page']) ? $filters['page'] : 1;
        $per_page = isset($filters['per_page']) ? $filters['per_page'] : 10;
        $offset = ($page - 1) * $per_page;
        $search_value = isset($filters['search']) ? $filters['search']: '';

        $db_name = getenv('DB_DATABASE_SECOND');
        $db_name1 = getenv('DB_DATABASE');
        \DB::statement("SET SQL_MODE=''");
        $query = ClientFileApplication::select("{$db_name1}.client_files.email_address as email","{$db_name1}.client_files.first_name as first","{$db_name1}.client_files.last_name as last","{$db_name1}.client_files.id as files_id","{$db_name1}.client_files.phone as phonenumber","{$db_name1}.client_files.file_type as filetype","{$db_name1}.client_files.created_at","{$db_name1}.client_files.submission_id", "{$db_name1}.client_files.status");
        $query->join("{$db_name}.user", "{$db_name}.user.email_address", "=", "{$db_name1}.client_files.email_address");

        if ($user->hasRole(Roles::Salesperson)) { 
            $query->where("{$db_name}.user.contact_owner_email", $user->email);
        } else if($user->hasRole(Roles::Concierge)) {
            $query->where("{$db_name}.user.contact_owner_email", $user->email);
        } else if ($user->hasRole(Roles::Manager)) {
            $sub_users_emails = PortalUser::where('location_id', $user->location_id)->pluck('email')->toArray();
            $query = $query->where(function ($in_query) use($user, $sub_users_emails, $db_name) {
                $in_query->whereIn("{$db_name}.user.contact_owner_email", $sub_users_emails);
            });
        } else if ($user->hasRole(Roles::Admin)) {

        }

        if($search_value) { 
            $search_value_arr = explode(' ', $search_value); 
            foreach ($search_value_arr as $value) {
                $query->whereRaw("concat(COALESCE({$db_name1}.client_files.first_name,''), ' ',COALESCE({$db_name1}.client_files.first_name,''), ' ',COALESCE({$db_name1}.client_files.last_name,''), ' ',COALESCE({$db_name1}.client_files.phone,''), ' ',COALESCE({$db_name1}.client_files.email_address,''), ' ') like '%{$value}%'");
            }
        } 
        $query = $query->groupBy("{$db_name1}.client_files.email_address");
        if (isset($filters['order_by'])) {
            $order_dir = $filters['order_dir'] ? $filters['order_dir'] : 'desc';
            $query = $query->orderBy("{$db_name1}.client_files.".$filters['order_by'], $order_dir);
        } else {
            $query = $query->orderBy("{$db_name1}.client_files.created_at", 'desc');
        }
        $num_results_filtered = $query->get()->count();
        $query = $query->offset($offset)->limit($per_page);
        $files = $query->get();
        $files = $this->fetchDuplicateclientFiles($files);
        $count = $offset;

        $result = new LengthAwarePaginator($files, $num_results_filtered, $per_page, $page);
        $result->setPath(route('client-files.index'));
        return $result;    
    }

    function fetchDuplicateclientFiles($files){
        foreach ($files as $item) {
            $duplicateEmailCount = ClientFileApplication::where('email_address', $item->email)->count();
            $item['total_application'] = $duplicateEmailCount;
        }
        return $files;
    }

    // Store information when car deal form is submitted
    public function submitCarDealApplication($request) {
        $rawRequest = json_decode($request['rawRequest']);
        
        $deal_details = array(
            'json' => array (
                "contact" => array(
                    "full_name" => $rawRequest->q9_customerFull,
                    "phone" => $rawRequest->q14_customerPhone->full,
                    "email" => $rawRequest->q15_customerEmail,
                    "contact_owner" => $rawRequest->q7_carblipEmail,
                    "email_preferred_contact" => 0,
                    "address" => array(
                        "street" => $rawRequest->q16_customerAddress->addr_line1,
                        "city" => $rawRequest->q16_customerAddress->city,
                        "state" => $rawRequest->q16_customerAddress->state,
                        "zip" => $rawRequest->q16_customerAddress->postal,
                    ),
                ),
                "vehicle" => array(
                    "finance_method" => $rawRequest->q27_leaseFinance,
                    "interest" => "buy",
                    "status" => "new",
                    "year" => $rawRequest->q18_vehicleYear,
                    "make" => $rawRequest->q35_vehicleManufacturer,
                    "model" => $rawRequest->q19_vehicleModel,
                    "trim" => $rawRequest->q20_trimLevel,
                    "interior_color" => [$rawRequest->q22_top3],
                    "exterior_color" => [$rawRequest->q22_top3],
                    "down_payment" => $rawRequest->q28_downPayment,
                    "finance_term_in_months" => $rawRequest->q31_forFinancing,
                    "lease_term_in_months" => $rawRequest->q29_forA,
                    "annual_milage" => $rawRequest->q30_forA30,
                    "preference" => null,
                    "timeframe" => count($rawRequest->q8_buyingTimeframe) > 0 ? 6 : null,
                ),
            )
        ); 
        $result = $this->apiService->createJotAplicationDeal($deal_details);
        return $result;
    }


    public function updateConciergeQuestionnaireFormData($requestData){
        $rawRequest = json_decode($requestData['rawRequest']);
        $user = User::where('email_address', $rawRequest->q19_email19);
        if($user) {
            $updateData = [
                'city' => $rawRequest->q9_typeA,
                'state' => $rawRequest->q21_state,
                'linkedin_profile' => $rawRequest->q14_whatIs,
                'phone' => $this->formatPhoneNumber($rawRequest->q4_phoneNumber->full),
                'over18' => $this->checkOver18ForConciergeQuestionnaireForm($rawRequest->q12_areYou),
                'intake_questionaire_1' => 'true'
            ];
            if (isset($rawRequest->q23_doYou23)) {
                $updateData['works_at_dealership'] = $rawRequest->q23_doYou23;
            }
            return $user->update($updateData);
        }
        return $user;
    }

    public function upateCOnciergeSalesLicenseStatus($requestData){
        $rawRequest = json_decode($requestData['rawRequest']);
        $user = User::where('email_address', $rawRequest->q11_email11);
        if($user) {
            $updateData = [
                'sales_license_status' => 'Uploaded',
            ];
            return $user->update($updateData);
        }
        return $user;
    }
}
