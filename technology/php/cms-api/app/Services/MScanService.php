<?php

namespace App\Services;

use App\Model\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class MScanService extends AbstractService
{

    // MScan Api credential
    private $base_url = 'http://v1.mscanapi.com/';
    private $partner_id = 'e193551b-30e1-4ed8-9dc0-74f32001f2a7';
    private $account_id = '650003';
    private $password = 'password';

    
    /**
     * Get list of makes
     *
     * @return array
     */

    private function _apiCall($method = 'GET', $url='', $option = array()){
        $client = new \GuzzleHttp\Client();
        try {
            $api_url = $this->base_url . $url;
            $response = $client->request($method, $api_url, $option);
        } catch (\Exception $e)
        {
            $response = null;
        }
        return $response;
    }

    /**
     * Fetch list of Make
     *
     * @param is_new boolean
     * @return result array
     */
    public function fetchMakes($is_new = true)
    {

        $method = 'GET';
        $url = "rest/mscanservice.rst/?GetMakes/{$this->partner_id}/{$this->account_id}/". ( $is_new? 'True': 'False' );
        $option = array(
        );
        $result = $this->_apiCall($method, $url, $option);
        return $result;
    }

    /**
     * Fetch list of Models
     *
     * @param is_new boolean
     * @return result array
     */
    public function fetchModels($is_new = true)
    {

        $method = 'GET';
        $url = "rest/mscanservice.rst/?GetModels/{$this->partner_id}/{$this->account_id}/". ( $is_new? 'True': 'False' );
        $option = array(
        );
        $result = $this->_apiCall($method, $url, $option);
        return $result;
    }

    /**
     * Fetch list of Inventories
     *
     * @param is_new boolean
     * @return result array
     */
    public function fetchInventories($account_id, $is_new = true)
    {
        if (!$account_id)
            $account_id = $this->account_id;
        $method = 'GET';
        $url = "rest/mscanservice.rst/?GetInventory/{$this->partner_id}/{$account_id}/". ( $is_new? 'True': 'False' );
        $option = array(
        );
        $result = $this->_apiCall($method, $url, $option);
        return $result;
    }

    /**
     * Fetch list of Dealrs
     *
     * @param is_new boolean
     * @return result array
     */
    public function fetchDealers($is_new = true)
    {

        $method = 'GET';
        $url = "rest/mscanservice.rst/?GetPartnerAccounts/{$this->partner_id}/{$this->account_id}/"   ;
        $option = array(
        );
        $result = $this->_apiCall($method, $url, $option);
        return $result;
    }
}
