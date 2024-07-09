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
use App\Jobs\PgpEncryption;
use App\Services\{PortalUserService};


class ZimbraSentMailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $requestData;
    protected $portaluserService;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($requestData)
    {
        $this->requestData = $requestData;
        $this->portaluserService = new PortalUserService;

    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        require base_path("vendor/autoload.php");
        $mail = new PHPMailer(true);
        $path = "{m.carblip.com:993/imap/ssl/novalidate-cert}Sent";
        $imapStream = imap_open($path, $this->requestData['user_email'], $this->requestData['zimbra_passeord']);
        if ($imapStream) {
            // Email server settings
            $mail->SMTPDebug = 0;
            $mail->isSMTP();
            $mail->Host = 'm.carblip.com'; //  smtp host
            $mail->SMTPAuth = true;
            $mail->Username = $this->requestData['user_email']; // sender username
            $mail->Password = $this->requestData['zimbra_passeord']; // sender password
            $mail->SMTPSecure = 'tls'; // encryption - ssl/tls
            $mail->Port = 587;
            $mail->setFrom($this->requestData['user_email'], $this->requestData['user_name']);
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );
            $mail->addAddress($this->requestData['to']);
            if (!empty($this->requestData['addCc'])) {
                $mail->addCC($this->requestData['addCc']);
            }
            if (!empty($this->requestData['addBcc'])) {
                $mail->addCC($this->requestData['addBcc']);
            }
            $mail->addReplyTo($this->requestData['user_email'], $this->requestData['user_name']);
            if (!empty($this->requestData['attachments'])) {
                foreach ($this->requestData['file_url'] as $getFileDetails) {
                    $fileData = file_get_contents($getFileDetails[1]);
                    $mail->addStringAttachment($fileData, $getFileDetails[0]);
                }
            }

            $mail->isHTML(true); // Set email content format to HTML
            $mail->Subject = $this->requestData['subject'];
            $mail->Body = $this->requestData['message'];
            $mail->send();
            
                $user_name = $this->requestData['first_name'] . ' ' . $this->requestData['last_name'];
                $mail_result = $mail->getSentMIMEMessage();
                $MessageId = explode('Message-ID: <', $mail_result);
                $originalMsgId = explode('>', $MessageId[1]);
                $originalMessageId = $originalMsgId[0];
                $Saveid = $this->portaluserService->storePortalsendmessage($user_name, $originalMessageId, $this->requestData['to'], $this->requestData['user_email'], $this->requestData['subject'], $this->requestData['message'], $this->requestData['attachments'], $this->requestData['s3folderName']);
                if (!empty($this->requestData['attachments'])) {
                    $this->requestData['save_id'] = $Saveid;
                    $fileName = $this->requestData['fileName'];
                    if ($Saveid) {
                        PgpEncryption::dispatch($this->requestData);
                    }
                }
            $ressss = imap_append($imapStream, $path, $mail->getSentMIMEMessage(), "\\Seen");
            imap_close($imapStream); //Closing the connection
        }

    }
}
