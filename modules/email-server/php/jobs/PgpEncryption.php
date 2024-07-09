<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Services\{PortalUserService, ApiService};
use Illuminate\Support\Facades\Storage;
use Webklex\IMAP\Facades\Client;

class PgpEncryption implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @var PortalUserService
     */
    private $portaluserService;

    /**
     * @var ApiService
     */
    private $apiService;
    private $messageData;


    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($messageData)
    {
        $this->portaluserService = new PortalUserService();
        $this->apiService = new ApiService();
        $this->messageData = $messageData;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $fileName = null;
        $privateKey = null;
        $passPhrase = null;

        $fileName = $this->messageData['fileName'];
        $passPhrase = array();
        $privateKey = array();
        for ($i = 0; $i < count($fileName); $i++) {
            $client = Storage::disk('s3')->getDriver()->getAdapter()->getClient();
            $expiry = "+5 minutes";
            $options = ['user-data' => 'user-meta-value'];
            $cmd = $client->getCommand('GetObject', [
                'Bucket' => \Config::get('filesystems.disks.s3.bucket'),
                'Key' => 'test/' . $this->messageData['folderName'] . '/' . $fileName[$i],
            ]);
            $request = $client->createPresignedRequest($cmd, $expiry);
            $gets3Url = (string) $request->getUri();
            $url = explode(':', $gets3Url);
            $url = 'http:' . $url[1];
            $result = $this->apiService->pgpFileEncrypt($url, $this->messageData['first_name'], $this->messageData['user_email'], $fileName[$i], $this->messageData['folderName']);
            $passPhrase[] = $result['data']['passPhrase'];
        }

        $this->portaluserService->updatePortalsendmessage($this->messageData['save_id'], json_encode($passPhrase));
    }

}
