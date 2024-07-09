<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
use Webklex\IMAP\Facades\Client;
use App\Services\{WorkflowService};

class SendWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    private $requestData;
    protected $workflowService;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($requestData)
    {
        $this->requestData = $requestData;
        $this->workflowService = new WorkflowService;
    }

    protected function mapDynamicPropertyValues($dataValues, $propertyValues)
    {
        $tempString = '';
        foreach ($propertyValues as $key => $value) {
            $tempString .= $value->key . '=' . (property_exists($dataValues, $value->key) ? $dataValues->{$value->key} : null) . '&';
        }
        return rtrim($tempString, '&');
    }

    protected function mapStaticPropertyValues($propertyValues)
    {
        $tempString = '';
        foreach ($propertyValues as $value) {
            if (!empty($value->key) && !empty($value->value)) {
                $tempString .= $value->key . '=' . $value->value . '&';
            }
        }
        return rtrim($tempString, '&');
    }

    protected function replaceDynamicPropertyValues($dataValues, $dynamicPropertyValues, $staticPropertyValues)
    {
        $tempArray = [];
        foreach ($dynamicPropertyValues as $value) {
            $tempArray[$value->key] = property_exists($dataValues, $value->key) ? $dataValues->{$value->key} : null;
        }

        foreach ($staticPropertyValues as $staticValue) {
            $tempArray[$staticValue->key] = $staticValue->value;
        }
        return $tempArray;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $webhookResult = [];
        $triggerResults=$this->requestData['triggerResult'];
        $actionDetails=$this->requestData['actionDetails'];
        $dynamicProperty = '';
        $staticProperty = '';
        $requestData = [];
        $headers = [
            'content-type' => 'application/json'
        ];
        $jsonData = [];
        $webhookUrl = '';
        $httpClient = new \GuzzleHttp\Client();
        foreach ($triggerResults as $key => $values) {
            if (isset($actionDetails->webhook->dynamic_property) && !empty($actionDetails->webhook->dynamic_property)) {
                $dynamicProperty = $this->mapDynamicPropertyValues($values, $actionDetails->webhook->dynamic_property);
            }

            if (isset($actionDetails->webhook->static_properties) && !empty($actionDetails->webhook->static_properties)) {
                $staticProperty = $this->mapStaticPropertyValues($actionDetails->webhook->static_properties);
            }

            if ($actionDetails->webhook->request_type == 'get') {
                if (!empty($dynamicProperty)) {
                    $webhookUrl .= '?' . $dynamicProperty;
                }
                if (!empty($staticProperty)) {
                    $webhookUrl .= (!empty($dynamicProperty) ? '&' : '?') . $staticProperty;
                }
            } elseif ($actionDetails->webhook->request_type == 'post') {
                $jsonData = ($actionDetails->webhook->request_body_type == 0) ? $values : $this->replaceDynamicPropertyValues($values, $actionDetails->webhook->dynamic_property, $actionDetails->webhook->static_properties);
            }

            if (isset($actionDetails->webhook->authentication_type)) {
                if ($actionDetails->webhook->authentication_type->type != 'none') {
                    if ($actionDetails->webhook->authentication_type->api_key_location == 'req_header') {
                        if (!empty($actionDetails->webhook->authentication_type->secret->key) && !empty($actionDetails->webhook->authentication_type->secret->value)) {
                            $headers[$actionDetails->webhook->authentication_type->secret->key] = $actionDetails->webhook->authentication_type->secret->value;
                        }
                    } elseif ($actionDetails->webhook->authentication_type->api_key_location == 'q_param') {
                        if (!empty($actionDetails->webhook->authentication_type->secret->key) && !empty($actionDetails->webhook->authentication_type->secret->value)) {
                            $webhookUrl .= (!empty($dynamicProperty) || !empty($staticProperty)) ? '&' : '?';
                            $webhookUrl .= $actionDetails->webhook->authentication_type->secret->key . '=' . $actionDetails->webhook->authentication_type->secret->value;
                        }
                    }
                }
            }

            $webhookUrl = 'https://'.$actionDetails->webhook->webhook_url . $webhookUrl;
            $userId = $values->id;
            if(isset($values->user_id)){
                $userId = $values->user_id;
            }
            $updateArray = array(
                'user_id' => $userId,
                'workflow_id' => $this->requestData['workflowId'],
                'action_uuid' => $actionDetails->id,
                'enrollment' => $this->requestData['enrollment']
            );
            if(config('app.env') != 'testing') {
                try {
                    $response = $httpClient->request($actionDetails->webhook->request_type, $webhookUrl, [
                        'json' => $jsonData,
                        'headers' => $headers
                    ]);
                    // Update webhook status if success
                    $this->workflowService->updateWebhookActionHistory($updateArray, $webhookStatus = true);
                    array_push($webhookResult,$values);
                } catch (\Exception $e) {
                    $response = false;
                }
            } else {
                $values->request_status = false;
            }
            $webhookUrl = '';
        }

        if(!empty($webhookResult)){
            $workflows = $this->workflowService->show($this->requestData['workflowId']);
            app('App\Http\Controllers\WorkflowController')->getAndStartWorkflow($workflows);
        }
    }
}
