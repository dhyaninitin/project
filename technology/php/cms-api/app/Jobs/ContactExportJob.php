<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Services\ExportService;
use Illuminate\Support\Facades\Storage;
use League\Csv\Writer;
use League\Csv\Reader;
use League\Csv\CannotInsertRecord;
use Maatwebsite\Excel\Facades\Excel;
use Exception;
use Carbon\Carbon;
use \Mailjet\Resources;

class ContactExportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    private $request;
    private $exportService;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($request)
    {
        $this->request = $request;
        $this->exportService = new ExportService;
    }

    protected function sendMail($url, $portalUser) {
        
        $message = '<html><head></head><body><p>Hello '.$portalUser->first_name.' '.$portalUser->last_name.',
        </p>Your export information is here.</p> <p> This link is <b>only</b> valid for <b>10 minutes</b>,
        and you can download the data. </p>
        <br/>
        <a href="'.$url.'" target="_blank"> Export Contact</a>
        </body></html>';
        
        try{
        
            $mailjet = new \Mailjet\Client(config('services.mailjet.key'), config('services.mailjet.secret'), true, ['version' => 'v3.1']);
            $body = [
                'Messages' => [
                    [
                        'From' => [
                            'Email' => "support@carblip.com",
                            'Name' => "CarBlip"
                        ],
                        'To' => [
                            [
                                'Email' => $portalUser->email,
                                'Name' => $portalUser->first_name.' '.$portalUser->last_name
                            ]
                        ],
                        'Subject' => "Export Contact",
                        'HTMLPart' => $message
                    ]
                ]
            ];

            $response = $mailjet->post(Resources::$Email, ['body' => $body]);
            if($response->success()){
                return response()->json($response->getData(), 200);
            } else {
                if(isset($response->getData()['ErrorMessage'])){
                    $message = $response->getData()['ErrorMessage'];
                } else {
                    $message = 'Failed sending export contact email';
                }
                if (app()->bound('sentry')) {
                    app('sentry')->captureException(new Exception($message, 500));
                }
                return false;
            }
        } catch ( \Exception $e ) {
            if (app()->bound('sentry')) {
                app('sentry')->captureException($e);
            }
            return $e->getMessage();
        }
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        try{
            $portalUser = $this->request['login_user'];
            $result = $this->exportService->contactExports($this->request);
            $contactResult = json_decode(json_encode($result),true);
            $fileHeader = array('First Name', 'Last Name', 'Phone Number', 'Email Address', 'Contact Owner', 'Source', 'City',
            'State', 'Zip', 'Type', 'Created Date', 'Updated Date');

            $fileName = getenv('APP_ENV').'/'.'excelfile/'.$portalUser->id.'/'.sha1(time()).'.csv';

            try {
                $storageInstance = Storage::disk('s3');
                $putFileOnStorage = $storageInstance->put($fileName, '');
                $fileContent = $storageInstance->get($fileName);
            } catch (CannotInsertRecord $e) {
                $errorarray = array( 'type'=>'505','info'=>'Export Deals','message'=>$e->getMessage(),'line'=>$e->getLine() );
                app( 'App\Http\Controllers\LogController' )->workFlowErrorLogs( $errorarray );
                return $e->getMessage();
            }

                try {
                    $writer = Writer::createFromString($fileContent, 'w');
                    $writer->insertOne($fileHeader);
                    $writer->insertAll($contactResult);

                    $csvContent = $writer->getContent();
                    $putFileOnStorage = $storageInstance->put($fileName, $csvContent);
                    $uploadedFileUrl = $storageInstance->url($fileName);

                    $url = $storageInstance->temporaryUrl($fileName, Carbon::now()->addMinutes(10));
                    return $this->sendMail($url,$portalUser);
                } catch (CannotInsertRecord $e) {
                    $errorarray = array( 'type'=>'505','info'=>'Export Deals','message'=>$e->getMessage(),'line'=>$e->getLine() );
                    app( 'App\Http\Controllers\LogController' )->workFlowErrorLogs( $errorarray );
                    return $e->getMessage();
                }            
        }catch ( \Exception $e ) {
            return $e->getMessage();
        }
    }
}