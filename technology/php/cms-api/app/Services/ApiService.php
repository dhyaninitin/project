<?php

namespace App\Services;

use App\Model\{User};
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class ApiService extends AbstractService
{

    // Api Service
    private $base_url;
    private $api_key;


    public function __construct()
    {
        $this->base_url = env('API_SERVER', '');
        $this->api_key = env('API_KEY', '');
    }


    /**
     * api call handler
     *
     * @return array
     */

    private function _apiCall($method = 'GET', $url = '', $options = array())
    {
        $client = new \GuzzleHttp\Client();
        $options = array_merge($options, [
            'headers' => [
                'content-type' => 'application/json',
                'accept' => 'application/json',
            ],
            'auth' => [$this->api_key, null]
        ]);

        try {
            $api_url = $this->base_url . $url;
            $response = $client->request($method, $api_url, $options);
            $response = json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            echo $e->getMessage();
            $response = false;
        }
        return $response;
    }

    /**
     * Create Request
     *
     * @param data array
     * @return result array
     */
    public function createRequest($data = [])
    {
        $method = 'POST';
        $url = "/apis/createDealFromPortal";

        $option = array(
            'json' => array(
                'vehicle_id' => $data['vehicle_id'],
                'user_id' => $data['user_id'],
                'dealstage_id' => $data['dealstage_id'],
                'portal_deal_stage' => $data['portal_deal_stage'],
                'portal_user_name' => $data['portal_user_name'],
                'portal_user_id' => $data['portal_user_id'],
                'is_complete' => true,
                'create_request_on_hubspot' => $data['create_request_on_hubspot']
            )
        );

        $urlMailchimp = "/apis/addToMailchimp";
        $user = User::find($data['user_id']);
        $optionMailchimp = array(
            'json' => array(
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email_address' => $user->email_address,
                'phone' => $user->phone
            )
        );
        $this->_apiCall($method, $urlMailchimp, $optionMailchimp);
        $result = $this->_apiCall($method, $url, $option);

        return $result;
    }

    /**
     * Fetch Dealer Data
     *
     * @param data array
     * @return result array
     */
    public function fetchMDealer()
    {
        $method = 'POST';
        $url = "/apis/fetchDealer";
        $option = array(
        );
        $result = $this->_apiCall($method, $url, $option);

        return $result;
    }

    /**
     * Fetch Inventory Data
     *
     * @param data array
     * @return result array
     */
    public function fetchInventory()
    {
        $method = 'POST';
        $url = "/apis/fetchInventory";
        $option = array(
        );
        $result = $this->_apiCall($method, $url, $option);

        return $result;
    }

    /**
     * Get Brands By Year
     *
     * @param number $year
     * @return result array
     */
    public function getBrandsByYear($year)
    {
        $method = 'GET';
        $url = "/apis/getBrandsByYear";
        $option = array(
            'json' => array(
                'year' => $year
            )
        );
        $result = $this->_apiCall($method, $url, $option);
        return $result;
    }

    /**
     * Get Models by Brand and Year
     *
     * @param array $param
     * @return result array
     */
    public function getModelByBrandYear($param)
    {
        $method = 'GET';
        $url = "/apis/getModelByBrandYear";
        $option = array(
            'json' => $param
        );
        $result = $this->_apiCall($method, $url, $option);
        return $result;
    }

    /**
     * Refresh DealStage
     *
     * @param data array
     * @return result array
     */
    public function refreshDealStage()
    {
        $method = 'POST';
        $url = "/apis/refreshDealstage";
        $option = array(
        );
        $result = $this->_apiCall($method, $url, $option);

        return $result;
    }

    /**
     * Create Notes for HubSpot Contacts
     */
    public function createHBContactNotes($email, $notes)
    {
        $method = 'POST';
        $url = "/apis/createHBContactNotes";
        $option = array(
            'json' => array(
                'contact_email' => $email,
                'notes' => $notes
            )
        );
        $result = $this->_apiCall($method, $url, $option);

        return $result;
    }

    /**
     * Create User in Zimbra mail server
     */
    public function createZimbraUser($data)
    {
        $method = 'POST';
        $url = "/apis/createZimbraUser";
        $option = array(
            'json' => array(
                'data' => $data,
            )
        );
        $result = $this->_apiCall($method, $url, $option);
        return $result;
    }
    public function pgpFileEncrypt($s3url, $name, $email, $fileName, $folderName)
    {

        $method = 'POST';
        $url = "/apis/downloadFileForms3";
        $option = array(
            'json' => array(
                'data' => array(
                    'url' => $s3url,
                    'name' => $name,
                    'email' => $email,
                    'filename' => $fileName,
                    'foldername' => $folderName
                )
            )
        );
        $result = $this->_apiCall($method, $url, $option);
        return $result;
    }

    public function pgpFileDecrypt($s3url, $filename, $passphrase)
    {
        $method = 'POST';
        $url = "/apis/decryptFile";
        $option = array(
            'json' => array(
                'data' => array(
                    'readurl' => $s3url,
                    // 'privateKey'=>$privateKey,
                    'passPhrase' => $passphrase,
                    'filename' => $filename
                )
            )
        );
        $result = $this->_apiCall($method, $url, $option);
        return $result;
    }

    /* To get the file url from google drive
     */
    public function uploadFileToS3($result)
    {
        $method = 'POST';
        $url = "/apis/getFileFromDrive";
        $option = array(
            'json' => array(
                "filename" => $result['submission_id'],
                "name" => $result['first_name'],
                "email" => $result['email_address']
            )
        );
        $result = $this->_apiCall($method, $url, $option);
        return $result;
    }

    /**
     * To get the file url from google drive
     */

    public function getFileFromS3($result)
    {
        $method = 'POST';
        $url = "/apis/getFileFromS3";
        $option = array(
            'json' => array(
                "filepath" => "test/test/" . $result['submission_id'] . ".pdf",
                "passphrase" => $result['pass_phrase'],
                "secretname" => "clientfile/" . $result['pass_phrase']
            )
        );
        $result = $this->_apiCall($method, $url, $option);
        return $result;
    }


    public function sendFilledApplicationNotification($options)
    {
        $method = 'POST';
        $url = "/apis/sendCreditApplicationNotification";
        $option = array(
            'json' => array(
                'email_address' => $options['email_address'],
                'full_name' => $options['full_name'],
                'filename' => $options['filename']
            )
        );
        $result = $this->_apiCall($method, $url, $option);

        return $result;
    }

    public function sendAlert($options)
    {
        $method = 'POST';
        $url = "/apis/sendalert";
        $option = array(
            'json' => array(
                'eventType' => $options['event_type'],
                'message' => $options['message'],
            )
        );
        $result = $this->_apiCall($method, $url, $option);

        return $result;
    }

    public function registerOrUpdateUserOnSendinblue($options)
    {
        $method = 'POST';
        $url = "/apis/registerusersib";
        $option = array(
            'json' => array(
                'email_address' => $options['email_address'],
                'first_name' => $options['first_name'],
                'last_name' => $options['last_name'],
                'phone' => $options['phone']
            )
        );
        $result = $this->_apiCall($method, $url, $option);

        return $result;
    }

    /**
     * Create Deal when jotform deal application submitted
     *
     * @param data array
     * @return result array
     */
    public function createJotAplicationDeal($data = [])
    {
        $method = 'POST';
        $url = "/apis/dealFromJotApplication";

        $option = $data;
        $result = $this->_apiCall($method, $url, $option);
        return $result;
    }

    public function getVehicleColor($data){
        $method = 'POST';
        $url = "/apis/getDefaultConfiguration";
        $option = array(
            'json' => array(
                'vehicles' => [$data['vehicles']],
            )
        );
        $result = $this->_apiCall($method, $url, $option);
        return $result;
    }
}