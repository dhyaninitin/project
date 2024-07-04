<?php

namespace App\Traits;

use HubSpot;
use Carbon\Carbon;

trait HubspotTrait
{
    /**
     * Get hubspot contact owner id from email
     *
     * @param email string
     * @return id string
     */
    // Not in use
    protected function getHBOwnerIdByEmail($email)
    {
        $owner_id = null;
        $request_param = array(
            'email' => $email
        );
        try {
            $owner = HubSpot::owners()->all($request_param);

            if ($owner) {
                $owner = $owner[0];
                $owner_id = $owner['ownerId'];
            }
        } catch (\Exception $e) {
        }
        return $owner_id;
    }

    /**
     * Create hubspot contact
     *
     * @param data array
     * @return id string
     */
    protected function createHBContact($data)
    {
        $client = new \GuzzleHttp\Client();
        $source = $this->formatSourceUtm($data['source']);
        // $contact_owner_id = self::getHBOwnerIdByEmail($data['contact_owner_email']);
        $contact_owner = $this->getHubSpotOwnerIdByEmail($data['contact_owner_email'], 'contact_owner');
        $contact_owner_id = count($contact_owner['results']) > 0 ? $contact_owner['results'][0]['id'] : null;
        $over18 = '';
        if($data['over18'] == 1) {
            $over18 = "Yes";
        } else if($data['over18'] == 2) {
            $over18 = "No";
        } else {
            $over18 = '';
        }
        $type = '';
        if($data['type'] == 1){
            $type = 'Concierge';
        }else if($data['type'] == 2){
            $type = 'ConciergeTest';
        }else{
            $type = '';
        }

        $request_param = array(
            'properties'=>
                array(
                    'email'             => $data['email_address'],
                    'firstname'         => $data['first_name'],
                    'lastname'          => $data['last_name'],
                    'phone'             => $data['phone'],
                    'city'              => $data['city'],
                    'state'             => $data['state'],
                    'zip'               => $data['zip'],
                    'source__requested_'=> $source,
                    'type'              => $type,  // This is used to update Type property in HubSpot
                    'over18'            => $over18,
                    'concierge_state'   => $data['concierge_state'] == null ? "" : $data['concierge_state']
                )
        );

        if ($contact_owner_id)
        {
            $request_param['properties']['hubspot_owner_id'] = $contact_owner_id;
        }
        // $url = getenv('HUBSPOT_API_BASE_URL')."objects/contacts";
        $url = "https://api.hubapi.com/crm/v3/objects/contacts";
        try {
            $response = $client->request('POST', $url, [
                'json' => $request_param,
                'headers' => [
                    'content-type'  => 'application/json',
                    'authorization' => "Bearer ". getenv('HUBSPOT_PRIVATE_APP_TOKEN')
                ]
            ]);
            $response = json_decode($response->getBody(), true);

        } catch (\Exception $e) {
            switch ($e->getCode())
            {
                // when contact is already exists
                case 409:
                    break;
                default:
                    break;
            }
            $response = false;
        }
        return $response;
    }

    protected function getHubSpotOwnerIdByEmail($email, $userType)
    {
        $client = new \GuzzleHttp\Client();
        $method = 'GET';
        $api_url = '';
        $options = array(
            'headers' => [
                'content-type'  => 'application/json',
                'accept'        => 'application/json',
                'authorization' => "Bearer ". getenv('HUBSPOT_PRIVATE_APP_TOKEN')
            ]
        );
        if($userType == 'user') {
            $method = 'POST';
            // $api_url = getenv('HUBSPOT_API_BASE_URL')."objects/contacts/search";
            $api_url = "https://api.hubapi.com/crm/v3/objects/contacts/search";
            try {
                $json_body = array(
                    'filters'     => array(
                        array(
                            'propertyName' => 'email',
                            'operator' => 'EQ',
                            'value' => $email
                        )),
                    'properties' => array(
                        "hubspot_owner_id",
                        "firstname",
                        "lastname",
                        "phone"
                    )
                    );
                $response = $client->request($method, $api_url, [
                    'json' => $json_body,
                    'headers' => [
                        'content-type'  => 'application/json',
                        'accept'        => 'application/json',
                        'authorization' => "Bearer ". getenv('HUBSPOT_PRIVATE_APP_TOKEN')
                    ]
                ]);

                $response = json_decode($response->getBody(), true);

            } catch (\Exception $e) {
                echo 'Message: ' .$e->getMessage();

                $response = false;
            }
            return $response['results'];

        } else if ($userType == 'contact_owner') {

            // $api_url = getenv('HUBSPOT_API_BASE_URL')."owners/?email=".$email."&limit=1&";
            $api_url = "https://api.hubapi.com/crm/v3/owners/?email=".$email."&limit=1";

            try {
                $response = $client->request($method, $api_url, $options);
                $response = json_decode($response->getBody(), true);


            } catch (\Exception $e) {
                $response = false;
            }
            return $response;
        }
    }
    function updateHBContact($data){
        $client = new \GuzzleHttp\Client();
        $contact_user = $this->getHubSpotOwnerIdByEmail($data['email_address'], 'user');
        $contact_owner = null;
        $contact_owner = $this->getHubSpotOwnerIdByEmail($data['contact_owner_email'], 'contact_owner');

        $hubspot_owner_id = count($contact_owner['results']) > 0 ? $contact_owner['results'][0]['id'] : null;
        // $hubspot_owner_id = $contact_owner['results'][0]['id'];
        $over18 = '';
        if($data['over18'] == 1) {
            $over18 = "Yes";
        } else if($data['over18'] == 2) {
            $over18 = "No";
        } else {
            $over18 = '';
        }

        $fields = array(
            'properties'=>
                array(
                    'hubspot_owner_id'  => $hubspot_owner_id,
                    'email'             => $data['email_address'],
                    'firstname'         => $data['first_name'],
                    'lastname'          => $data['last_name'],
                    'phone'             => $data['phone'],
                    'city'              => $data['city'],
                    'state'             => $data['state'],
                    'zip'               => $data['zip'],
                    'type'              => $data['type'] == 1 ? "Concierge" : '',  // This is used to update Type property in HubSpot
                    'over18'            => $over18,
                    'concierge_state'   => $data['concierge_state'] == null ? "" : $data['concierge_state']
                )
        );

        // $url = getenv('HUBSPOT_API_BASE_URL')."objects/contacts/".$contact_user[0]['id'];
        $url = "https://api.hubapi.com/crm/v3/objects/contacts/".$contact_user[0]['id'];
        try {
            $response = $client->request('PATCH', $url, [
                'json' => $fields,
                'headers' => [
                    'content-type'  => 'application/json',
                    'authorization' => "Bearer ". getenv('HUBSPOT_PRIVATE_APP_TOKEN')
                ]
            ]);
            $response = json_decode($response->getBody(), true);

        } catch (\Exception $e) {
            $response = false;
        }
        return $response;
    }

    protected function formatSourceUtm($source)
    {
        switch ($source) {
            case 1:
                $source_str = 'Web';
                break;
            case 2:
                $source_str = 'Mobile';
                break;
            case 3:
                $source_str = 'Direct';
                break;
            case 4:
                $source_str = 'CB2';
                break;
            case 5:
                $source_str = 'CB3';
                break;
            case 6:
                $source_str = 'CB2AZ';
                break;
            case 7:
                $source_str = 'JotForm';
                break;
            default:
                $source_str = 'Hubspot';
                break;
        }
        return $source_str;
    }

    protected function formatBuyingMethod($buying_method)
    {
        switch ($buying_method) {
            case 1:
                $buying_method = 'Cash';
                break;
            case 2:
                $buying_method = 'Finance';
                break;
            case 3:
                $buying_method = 'Lease';
                break;
            case 4:
                $buying_method = 'Undecided';
                break;
            default:
                $buying_method = 'Undecided';
                break;
        }
        return $buying_method;
    }

    protected function getHubSpotDealAssociatedWithContactById($userId)
    {
        $client = new \GuzzleHttp\Client();
        $method = 'GET';
        $api_url = '';
        $options = array(
            'headers' => [
                'content-type'  => 'application/json',
                'accept'        => 'application/json',
                'authorization' => "Bearer ". getenv('HUBSPOT_PRIVATE_APP_TOKEN')
            ]
        );
        $method = 'GET';
        $api_url = "https://api.hubapi.com/crm/v3/objects/contacts/".$userId."/associations/deal";
        try {
            $response = $client->request($method, $api_url, [
                'headers' => [
                    'content-type'  => 'application/json',
                    'accept'        => 'application/json',
                    'authorization' => "Bearer ". getenv('HUBSPOT_PRIVATE_APP_TOKEN')
                ]
            ]);

            $response = json_decode($response->getBody(), true);

        } catch (\Exception $e) {
            echo 'Message: ' .$e->getMessage();

            $response = false;
        }
        return $response['results'];
    }

    /**
     * This function is used to create hubspot deal
     */
    protected function createHBDeal($dealInfo)
    {
        $client = new \GuzzleHttp\Client();
        $source = $this->formatSourceUtm($dealInfo['source_utm']);

        $contact_owner = $this->getHubSpotOwnerIdByEmail($dealInfo['contact_owner_email'], 'contact_owner');
        $contact_owner_id = $contact_owner['results'][0]['id'];

        $dealname = $dealInfo['first_name'];
        $dealname .= ' - ' . $dealInfo['brand'];
        $dealname .= ' - ' . $dealInfo['model'];
        $dealname .= ' - ' . $dealInfo['trim'];

        $dealstage_id = $dealInfo['dealstage_id'] ? $dealInfo['dealstage_id'] : "7dd4085b-69ff-4361-8cae-9209bc5708c7";
        $closedate = "";
        if($dealstage_id == "closedwon" || $dealstage_id == "closedlost") {
            $currentTime = Carbon::now();
            $closedate = $currentTime->toDateTimeString();
        }
        $request_type = $dealInfo['request_type'] == 2 ? "Custom" : "Standard";
        $type_of_car = $dealInfo['request_type'] ? $dealInfo['brand'] : "";
        if($dealInfo['request_type']) {
            $monthly = $dealInfo['price_type'] == 2 ? 'Yes' : 'No';
        } else {
            $monthly = '';
        }

        $payment_type = $this->formatBuyingMethod($dealInfo['buying_method']);
        if($this->formatBuyingMethod($dealInfo['buying_method']) === "Cash") {
            $payment_type = 'pay cash';
        }
        $request_param = array(
            'properties'=>
                array(
                    "dealname" => $dealname,
                    "dealstage" => $dealstage_id,
                    "closedate" => $closedate,
                    "hubspot_owner_id"  => $contact_owner_id,
                    "dealtype"  => 'newbusiness',
                    "make"  => $dealInfo['make'],
                    "model" => $dealInfo['model'],
                    "trim"  => $dealInfo['trim'],
                    "purchase_timeframe"    => $dealInfo['buying_time'],
                    "payment_type"  => $payment_type,
                    "option_preferences"    => $dealInfo['option_preferences'],
                    "request_id"    =>  $dealInfo['request_id'],
                    "universal_deeplink"    =>  $dealInfo['universal_url'],
                    "year"  =>  $dealInfo['year'],
                    "request_type"  =>  $request_type,
                    "credit_score"  =>  $dealInfo['credit_score_txt'],
                    "type_of_car"   =>  $type_of_car,
                    "price" =>  $dealInfo['msrp_org'],
                    "monthly"   =>  $monthly,
                    "model_id"  =>  $dealInfo['model_number'],
                    "deal_source_requested_"    =>  $source,
                    "promo_code"    =>  $dealInfo['referral_code'],
                )
        );

        // print_r($request_param);
        // die();

        $url = "https://api.hubapi.com/crm/v3/objects/deals";
        try {
            $response = $client->request('POST', $url, [
                'json' => $request_param,
                'headers' => [
                    'content-type'  => 'application/json',
                    'authorization' => "Bearer ". getenv('HUBSPOT_PRIVATE_APP_TOKEN')
                ]
            ]);
            $response = json_decode($response->getBody(), true);

        } catch (\Exception $e) {
            switch ($e->getCode())
            {
                // when contact is already exists
                case 409:
                    break;
                default:
                    break;
            }
            $response = false;
        }
        return $response;
    }

    /**
     * This function is used to associate a deal with the contact
     */
    protected function associateDealWithContact($dealId, $contactId)
    {
        $client = new \GuzzleHttp\Client();
        $url = "https://api.hubapi.com/crm/v3/objects/deals/".$dealId."/associations/contact/".$contactId."/3";
        try {
            $response = $client->request('PUT', $url, [
                'headers' => [
                    'content-type'  => 'application/json',
                    'authorization' => "Bearer ". getenv('HUBSPOT_PRIVATE_APP_TOKEN')
                ]
            ]);
            $response = json_decode($response->getBody(), true);

        } catch (\Exception $e) {
            switch ($e->getCode())
            {
                // when contact is already exists
                case 409:
                    break;
                default:
                    break;
            }
            $response = false;
        }
        return $response;
    }

    protected function getHubSpotDeals($dealId)
    {
        $client = new \GuzzleHttp\Client();
        $method = 'GET';
        $api_url = '';
        $options = array(
            'headers' => [
                'content-type'  => 'application/json',
                'accept'        => 'application/json',
                'authorization' => "Bearer ". getenv('HUBSPOT_PRIVATE_APP_TOKEN')
            ]
        );
        $method = 'GET';
        $api_url = "https://api.hubapi.com/deals/v1/deal/".$dealId;
        try {
            $response = $client->request($method, $api_url, [
                'headers' => [
                    'content-type'  => 'application/json',
                    'accept'        => 'application/json',
                    'authorization' => "Bearer ". getenv('HUBSPOT_PRIVATE_APP_TOKEN')
                ]
            ]);

            $response = json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            echo 'Message: ' .$e->getMessage();

            $response = false;
        }
        return $response;
    }
}
