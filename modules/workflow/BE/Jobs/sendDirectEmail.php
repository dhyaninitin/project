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
use Illuminate\Support\Facades\Crypt;
use App\Traits\WorkFlowTrait;

class sendDirectEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    use WorkFlowTrait;

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


    protected function createMessage($data,$messagekeys,$message) {
        foreach ($messagekeys as $msgkey) {
            $removeSpecialCharacter = str_replace('{','',$msgkey);
            $removeSpecialCharacter =  str_replace('}','',$removeSpecialCharacter);
            if(property_exists($data,$removeSpecialCharacter)){
                $message = str_replace($msgkey,$data->$removeSpecialCharacter,$message);
            }
        }
        return $message;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $emailResult = [];
        foreach ($this->requestData['user_details'] as $key => $value) {
            $getSenderDetails = $this->workflowService->getPortalUserDetails($value->contact_owner_email);
            $userDetails = $getSenderDetails[0];
            $userName = $userDetails['first_name']. ' '. $userDetails['last_name'];
            $message =  $this->createMessage($value, $this->requestData['body'], $this->requestData['template_message']);
            $htmlString = htmlspecialchars_decode($message);
            $htmlString = str_replace('&nbsp;', '', $htmlString);
            $htmlString = str_replace('<pre class="ql-syntax" spellcheck="false">', '', $htmlString);
            $htmlString = str_replace('</pre>', '', $htmlString);

            if(config('app.env') != 'testing') {
                $mail = new PHPMailer(true);
                $zimbratoken = Crypt::decryptString($userDetails['zimbra_token']);
                $path = "{m.carblip.com:993/imap/ssl/novalidate-cert}Sent";
                $imapStream = imap_open($path, $userDetails['email'], $zimbratoken);
                if($imapStream){
                        $mail = new PHPMailer(true);
                        // Email server settings
                        $mail->SMTPDebug = 1;
                        $mail->isSMTP();
                        $mail->Host = 'm.carblip.com'; //  smtp host
                        $mail->SMTPAuth = true;
                        $mail->Username = $userDetails['email']; // sender username
                        $mail->Password = $zimbratoken; // sender password
                        $mail->SMTPSecure = 'tls'; // encryption - ssl/tls
                        $mail->Port = 587;
                        $mail->setFrom($userDetails['email'], $userName);
                        $mail->SMTPOptions = array(
                        'ssl' => array(
                            'verify_peer' => false,
                            'verify_peer_name' => false,
                            'allow_self_signed' => true
                        )
                        );
                        $mail->addAddress($value->email_address);
                        $mail->addReplyTo($userDetails['email'], $userName);
                        $mail->isHTML(true); // Set email content format to HTML
                        $mail->Subject = $this->requestData['subject'];
                        $mail->Body = $htmlString;
                        $mail->send();
                        array_push($emailResult,$value);
                    $result = imap_append($imapStream, $path, $mail->getSentMIMEMessage(), "\\Seen");
                    imap_close($imapStream);
                }
            } else {
                array_push($emailResult,$value);
            }
        }
        $this->workflowService->createActionHistory( $this->requestData['workflow_id'], $emailResult, $this->requestData['sequence_id'], $this->requestData['action_uuid'], $this->requestData['event_master_id'], $this->requestData['enrollment'], $this->requestData['table_result'], $this->requestData['actions'] );
    }
}


