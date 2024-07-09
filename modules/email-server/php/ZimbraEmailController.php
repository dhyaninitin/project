<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use DateTime;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
use Webklex\IMAP\Facades\Client;
use App\Services\{PortalUserService, ApiService};
use App\Model\{ZimbarMailbox};
use App\Http\Resources\{UserMailboxCollection, MailboxResource};
use Illuminate\Support\Facades\Crypt;
use App\Http\Requests\StoreImage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Http\Response;
use Auth;
use Spatie\Async\Pool;
use App\Jobs\{PgpEncryption, ZimbraMailSaveJob, ZimbraSentMailJob, ZimbraSentReplyMailJob};


class ZimbraEmailController extends Controller
{

    /**
     * @var PortalUserService
     */
    protected $portaluserService;
    protected $apiService;
    /**
     * @var LogService
     */
    protected $logService;

    public function __construct(PortalUserService $portaluserService, ApiService $apiService)
    {
        require base_path("vendor/autoload.php");
        $this->portaluserService = $portaluserService;
        $this->apiService = $apiService;
        $this->zimbra = new ZimbarMailbox();
    }

    // GroupBy List
    public function zimbramailList(Request $request, $email)
    {
        $user = Auth::user();
        // $this->zimbra->updatemailid();
        $details = $this->portaluserService->zimbramailList($email, $request);
        return new UserMailboxCollection($details);
    }

    // Thread_id List
    public function usermailList(Request $request, $mailid, $contactEmail)
    {

        $user = Auth::user();
        // $this->zimbra->updatemailid();
        $maillist = $this->portaluserService->usermailList($mailid, $contactEmail);
        return new UserMailboxCollection($maillist);
    }


    // old

    public function getmaillist(Request $request, $email)
    {
        $user = Auth::user();
        $details = $this->portaluserService->zimbramailList($email, $request);
        return new UserMailboxCollection($details);
    }

    public function getuserMailbox(Request $request, $email)
    {
        $user = Auth::user();
        $mailDetails = $this->portaluserService->getUserLastRecord($user->email);
        $details = $this->portaluserService->zimbramailList($email, $request);
        return new UserMailboxCollection($details);
    }
    public function syncInboxMail(Request $request)
    {
        $user = Auth::user();
        $registerUserDetail = $this->portaluserService->getUserDetails($user->email);
        $InboxSync = $this->syncMail($user->email, $registerUserDetail, 'inbox');
        return $InboxSync;
    }
    public function syncSentBoxMail(Request $request)
    {
        $user = Auth::user();
        $registerUserDetail = $this->portaluserService->getUserDetails($user->email);
        $SentBoxSync = $this->syncMail($user->email, $registerUserDetail, 'sent');
        return $SentBoxSync;
    }
    public function show($id, Request $request)
    {
        $user = Auth::user();
        if (empty(Cookie::get('zimbra_token'))) {
            $gettoken = $this->checkAccount($user->email);
        } else {
            $gettoken = Cookie::get('zimbra_token');
        }
        $details = $this->portaluserService->getMailboxbyID($id);
        $uploadFile = null;
        $mail_token = $details[0]->mail_id;
        if ($details[0]->type == 'S') {
            $subject = str_replace(' ', '?', $details[0]->subject);
            $urls = "https://m.carblip.com/service/home/~/sent.json?id=" . $mail_token . "&fmt=sync&part=1";
            $message_urls = "https://m.carblip.com/service/home/~/sent.json?id=" . $mail_token . "&fmt=sync";
            //    $urls = "https://m.carblip.com/service/home/~/sent.json";

        } else {
            $urls = "https://m.carblip.com/service/home/~/Inbox.json?id=" . $mail_token . "&fmt=sync&part=1";
            $message_urls = "https://m.carblip.com/service/home/~/Inbox.json?id=" . $mail_token . "&fmt=sync";
        }
        // echo $urls;

        $headers = array(
            "Content-Type: application/json",
            "Cookie: ZM_TEST=true; ZM_AUTH_TOKEN={$gettoken}"
        );
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $urls);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        $resultt = curl_exec($curl);
        $message_curl = curl_init();
        curl_setopt($message_curl, CURLOPT_URL, $message_urls);
        curl_setopt($message_curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($message_curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($message_curl, CURLOPT_SSL_VERIFYPEER, false);
        $message_resultt = curl_exec($message_curl);
        $MessageId = explode('Message-ID: <', $message_resultt);
        $originalMsgId = explode('>', $MessageId[1]);
        $originalMessageId = $originalMsgId[0];
        // $details[0]->type;
        // // $res = json_decode($resultt,true);
        // if ($details[0]->type == 'S') {
        //     $sent_msgs = explode('charset=iso-8859-1', $resultt);
        //     // print_r($sent_msgs);
        //     // die();
        //     $final_msg = $sent_msgs[1];
        // } else {
        //     $fist_split = explode('Content-Transfer-Encoding', $resultt);
        //     $second_split = explode('--=', $fist_split[1]);
        //     $second_split = explode('From: "', $second_split[0]);

        //     $final_msg = str_replace(': 7bit', '', $second_split[0]);
        // }
        if (!empty($resultt)) {
            // $array = $res['m'][0];
            $array = json_decode($details[0], true);
            $array['mail_id'] = $id;
            $array['message'] = $resultt;
            $array['header_message'] = $details[0]->message;
            $array['originalMessageId'] = $originalMessageId;
            $array['attachment'] = json_decode($details[0]->file_name);
            return new MailboxResource((object) $array);
        } else {
            return "No mail"; // return "Zimbra account does not exist";
        }
    }


    public function showAttachment(Request $request)
    {
        $user = Auth::user();
        $request = $request->all();
        $details = $this->portaluserService->getMailboxbyID($request['mailid']);
        $attchmentDetails = json_decode($details[0]->file_name);

        $pass_phraseDetails = json_decode($details[0]->pass_phrase);
        $pass_phrase = ($pass_phraseDetails[$request['fileindex']]);

        $attachmentFile = ($attchmentDetails[$request['fileindex']])->documentoriginalname;
        // $gets3Url = $this->readfileFromS3($attachmentFile,$details[0]->file_path); //get read file url form s3
        // $url = explode(':',$gets3Url);
        // $s3url = 'http:'.$url[1];
        // $filedecrypt = array();
        $result = $this->apiService->pgpFileDecrypt($details[0]->file_path, $pass_phrase, $attachmentFile);
        $filedecrypt['payload'] = $result['data'];
        $getExtension = pathinfo($attachmentFile, PATHINFO_EXTENSION);
        // $getExtension = ".pdf";
        $filedecrypt['mime_type'] = $this->check_MimeType($getExtension);
        $filedecrypt['extension'] = $getExtension;
        $filedecrypt['token'] = $pass_phrase;
        $filedecrypt['documentOriginalName'] = ($attchmentDetails[$request['fileindex']])->documentname;
        return response()->json([
            'data' => $filedecrypt
        ]);
    }




    // ========== [ Compose Email ] ================
    public function composeEmail(Request $request)
    {
        $request = $request->all();
        $user = Auth::user();
        $zimbratoken = Crypt::decryptString($user->zimbra_token);
        if (empty(Cookie::get('zimbra_token'))) {
            $gettoken = $this->checkAccount($user->email);
        } else {
            $gettoken = Cookie::get('zimbra_token');
        }
        // print_r($request);

        $user_name = $user->first_name . ' ' . $user->last_name;
        $folderName = $user->email . '/' . $user->id . '/' . $request['register_id'] . '/' . $request['to'];
        $fileName = array();
        $fileUrl = null;
        $getFileUrl = array();
        $originalFileName = null;
        $s3folderName = null;
        if (!empty($request['attachments'])) {
            foreach ($request['attachments'] as $attachfileDetails) {
                $fileName[] = $attachfileDetails['documentoriginalname'];
                $gets3FileUrl = $this->readfileFromS3($attachfileDetails['documentoriginalname'], $folderName);
                $getFileUrl[] = array($attachfileDetails['documentname'], $gets3FileUrl);
            }
            $s3folderName = $folderName;
        }
        $request['user_name'] = $user_name;
        $request['zimbra_passeord'] = $zimbratoken;
        $request['file_url'] = $getFileUrl;
        $request['user_email'] = $user->email;
        $request['zimbraToken'] = $gettoken;
        $request['fileName'] = $fileName;
        $request['first_name'] = $user->first_name;
        $request['last_name'] = $user->last_name;
        $request['s3folderName'] = $s3folderName;
        $request['folderName'] = $folderName;

        ZimbraSentMailJob::dispatch($request);
        // $this->SendEmail($request);
        // $registerUserDetail = $this->portaluserService->getUserDetails($user->email);
        // $SentBoxSync = $this->syncMail($user->email, $registerUserDetail, 'sent');

        // $Saveid = $this->portaluserService->storePortalsendmessage($user_name,$request['to'],$user->email,$request['subject'],$request['message'],$request['attachments'],$request['thread_id'],$s3folderName);

        // $Saveid = $this->portaluserService->storePortalsendmessage($user_name,$request['to'],$user->email,$request['subject'],$request['message'],
        // json_encode($request['attach']),$request['thread_id'],$s3folderName);
        // $request['save_id'] = $Saveid;
        return response()->json([
            'data' => 'Email sent successfully'
        ]);
    }



    // ========== [ Compose Reply Email ] ================
    public function composeReplyEmail(Request $request)
    {
        $request = $request->all();
        $user = Auth::user();
        $zimbratoken = Crypt::decryptString($user->zimbra_token);
        if (empty(Cookie::get('zimbra_token'))) {
            $gettoken = $this->checkAccount($user->email);
        } else {
            $gettoken = Cookie::get('zimbra_token');
        }
        // print_r($request);

        $user_name = $user->first_name . ' ' . $user->last_name;
        $folderName = $user->email . '/' . $user->id . '/' . $request['register_id'] . '/' . $request['to'];
        $fileName = array();
        $fileUrl = null;
        $getFileUrl = array();
        $originalFileName = null;
        $s3folderName = null;
        if (!empty($request['attachments'])) {
            foreach ($request['attachments'] as $attachfileDetails) {
                $fileName[] = $attachfileDetails['documentoriginalname'];
                $gets3FileUrl = $this->readfileFromS3($attachfileDetails['documentoriginalname'], $folderName);
                $getFileUrl[] = array($attachfileDetails['documentname'], $gets3FileUrl);
            }
            $s3folderName = $folderName;
        }
        $request['user_name'] = $user_name;
        $request['zimbra_passeord'] = $zimbratoken;
        $request['file_url'] = $getFileUrl;
        $request['user_email'] = $user->email;
        $request['zimbraToken'] = $gettoken;
        $request['fileName'] = $fileName;
        $request['first_name'] = $user->first_name;
        $request['last_name'] = $user->last_name;
        $request['s3folderName'] = $s3folderName;
        $request['folderName'] = $folderName;

        ZimbraSentReplyMailJob::dispatch($request);
        // $this->SendEmail($request);

        return response()->json([
            'data' => 'Email sent successfully'
        ]);
    }

    public function SendEmail($requestData)
    {

        $user = Auth::user();
        $mail = new PHPMailer(true);

        // Email server settings
        $mail->SMTPDebug = 0;
        $mail->isSMTP();
        $mail->Host = 'm.carblip.com'; //  smtp host
        $mail->SMTPAuth = true;
        $mail->Username = $requestData['user_email']; // sender username
        $mail->Password = $requestData['zimbra_passeord']; // sender password
        $mail->SMTPSecure = 'tls'; // encryption - ssl/tls
        $mail->Port = 587;
        $mail->setFrom($requestData['user_email'], $requestData['user_name']);
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        $mail->addAddress($requestData['to']);

        if (!empty($requestData['addCc'])) {
            $mail->addCC($requestData['addCc']);
        }
        if (!empty($requestData['addBcc'])) {
            $mail->addCC($requestData['addBcc']);
        }
        $mail->addReplyTo($requestData['user_email'], $requestData['user_name']);
        if (!empty($requestData['attachments'])) {
            $fileattachment = $requestData['file_url'];

            foreach ($requestData['file_url'] as $getFileDetails) {
                $fileData = file_get_contents($getFileDetails[1]);
                $mail->addStringAttachment($fileData, $getFileDetails[0]);
            }
            // $fileData = file_get_contents($this->requestData['file_url']);
            // $mail->addStringAttachment($fileData, $this->requestData['attach']);
        }
        $mail->isHTML(true); // Set email content format to HTML
        $mail->Subject = $requestData['subject'];
        $mail->Body = $requestData['message'];
        try {
            $mail->send();

        } catch (\Exception $e) { echo $e->getMessage(); }
        // print_r($mail);

        $path = "{m.carblip.com:993/imap/ssl/novalidate-cert}Sent";
        $imapStream = imap_open($path, $requestData['user_email'], $requestData['zimbra_passeord']);
        $ressss = imap_append($imapStream, $path, $mail->getSentMIMEMessage(), "\\Seen");
        imap_close($imapStream); //Closing the connection

    }


    // Change mail status
    public function changeInboxstatus($id, Request $request)
    {
        $user = Auth::user();
        $zimbratoken = Crypt::decryptString($user->zimbra_token);
        $details = $this->portaluserService->updateInboxStatus($id);
        $this->changeZimbraStatus($details[0]->mail_id, $user->email, $zimbratoken);
        return response()->json([
            'data' => 'Status Changed successfully.'
        ]);
    }


    public function changeZimbraStatus($requestID, $user_email, $user_password)
    {
        $user = Auth::user();
        $imapPath = "{m.carblip.com:993/imap/ssl/novalidate-cert}INBOX";
        try {
            $inbox = imap_open($imapPath, $user_email, $user_password);
            imap_setflag_full($inbox, $requestID, "\\Seen", ST_UID); // Setting flag from un-seen email to seen on emails ID.
            imap_expunge($inbox);
            imap_close($inbox); // colse the connection
            return response()->json([
                'error' => false,
                'statusCode' => 200,
                'message' => 'Success',
                'data' => 'Status Changed successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'statusCode' => 400,
                'message' => 'error',
                'data' => $e->getMessage()
            ]);
        }
    }

    public function presignedUpload(Request $request)
    {
        $user = Auth::user();
        $request = $request->all();
        $folderName = $user->email . '/' . $user->id . '/' . $request['register_id'] . '/' . $request['register_email'];

        $client = Storage::disk('s3')->getDriver()->getAdapter()->getClient();
        $expiry = "+10 minutes";
        $options = ['ContentType' => 'image/jpeg'];
        $randomNumber = random_int(100000, 999999);
        $filename = $randomNumber . '.' . $request['file_type'];
        $cmd = $client->getCommand('PutObject', [
            'Bucket' => \Config::get('filesystems.disks.s3.bucket'),
            'Key' => 'test/' . $folderName . '/' . $filename,
        ]);

        $request = $client->createPresignedRequest($cmd, $expiry);
        $presignedUrl = (string) $request->getUri();
        return response()->json([
            'error' => false,
            'statusCode' => 200,
            'data' => [
                'url' => $presignedUrl,
                'filename' => $filename
            ]
        ]);
    }


    public function uploadDownloadFileS3($id, $uniqueId, $registerUserDetail)
    {
        $user = Auth::user();
        if (empty(Cookie::get('zimbra_token'))) {
            $gettoken = $this->checkAccount($user->email);
        } else {
            $gettoken = Cookie::get('zimbra_token');
        }
        $registerUserID = $registerUserDetail[0]->id;
        $registerUseremail = $registerUserDetail[0]->email_address;
        $folderName = $user->email . '/' . $user->id . '/' . $registerUserID . '/' . $registerUseremail;

        $urls = "https://m.carblip.com/service/home/~/?auth=co&loc=en_US&id=" . $id;
        $headers = array(
            // "Content-Type: application/pdf",
            "Cookie: ZM_TEST=true; ZM_AUTH_TOKEN={$gettoken}"
        );
        try {
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, $urls);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            $attachment = curl_exec($curl);
            // print_r($attachment);
            $removeHtml = explode('name=', $attachment);
            $filename_explode = explode('Content-Transfer-Encoding:', $removeHtml[1]);
            $originalFileName = $filename_explode[0];
            $base64File = explode('--b1=', $filename_explode[1]);
            $base64File = $base64File[0];

            // $originalFileName = $this->removeSpecialCharacters(str_replace('Content-Transfer-Encoding', '', substr(strstr($removeHtml[2], 'filename='), strlen('filename='))));

            $originalFileextension = $this->removeSpecialCharacters(pathinfo($originalFileName, PATHINFO_EXTENSION));
            $randomNumber = random_int(100000, 999999);
            $filename = $this->removeSpecialCharacters($randomNumber . '.' . $originalFileextension);

            $fileattachment[] = array(
                'documentname' => $originalFileName,
                'documentoriginalname' => $filename,
                'mimetype' => $originalFileextension
            );

            Storage::disk('s3')->put('test/' . $folderName . '/' . $filename, $base64File);
            $s3Url = $this->readfileFromS3($filename, $folderName);
            $url = explode(':', $s3Url);
            $url = 'http:' . $url[1];

            $encryptResult = $this->apiService->pgpFileEncrypt($url, $user->first_name, $user->email, $filename, $folderName);

            // $privateKey = $encryptResult['data']['privateKey'];
            $passPhrase[] = $encryptResult['data']['passPhrase'];
            $res = $this->portaluserService->saveDownloadFile($id, $uniqueId, json_encode($fileattachment), json_encode($passPhrase), $folderName);
            return $s3Url;
        } catch (\Exception $e) {
            echo $s3Url = $e->getMessage();
            return $s3Url;
        }
    }

    public function base64_to_stream($email_string)
    {
        $removeSpecialchar = substr($email_string, 0, strpos($email_string, "="));
        return base64_decode(substr(strstr($removeSpecialchar, 'base64'), strlen('base64')));
    }

    public function removeSpecialCharacters($string)
    {
        return preg_replace('/\s+/', '', $string);
    }




    public function syncMail($useremail, $registerUserDetail, $mailType)
    {
        if (empty(Cookie::get('zimbra_token'))) {
            $gettoken = $this->checkAccount($useremail);
        } else {
            $gettoken = Cookie::get('zimbra_token');
        }
        // echo $gettoken;
        // $gettoken = $this->checkAccount($useremail);
        $currentDate = date('m/d/Y');
        $nextDate = date('m/d/Y', strtotime('+1 day', time()));
        if ($mailType == 'inbox') {
            $mail_Type = 'R';
            $mailboxUrl = "https://m.carblip.com/service/home/~/Inbox.json?recursive=1&query=after:" . $currentDate . "&query=before:" . $nextDate;
        } else {
            $mail_Type = 'S';
            $mailboxUrl = "https://m.carblip.com/service/home/~/Sent.json?recursive=1&query=after:" . $currentDate . "&query=before:" . $nextDate;

        }
        $headers = array(
            "Content-Type: application/json",
            "Cookie: ZM_TEST=true; ZM_AUTH_TOKEN={$gettoken}"
        );
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $mailboxUrl);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        $resultt = curl_exec($curl);
        $result_json = json_decode($resultt, true);
        // print_r($result_json);
        // die();
        if (!empty($result_json)) {
            foreach ($result_json['m'] as $item) {
                $threadId = $item['cid'];
                $uniqueId = $item['s'];
                $mailId = $item['id'];
                if ($mailType == 'inbox') {
                    $message_urls = "https://m.carblip.com/service/home/~/sent.json?id=" . $item['id'] . "&fmt=sync";

                } else {
                    $message_urls = "https://m.carblip.com/service/home/~/Inbox.json?id=" . $item['id'] . "&fmt=sync";
                }
                $message_curl = curl_init();
                curl_setopt($message_curl, CURLOPT_URL, $message_urls);
                curl_setopt($message_curl, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt($message_curl, CURLOPT_HTTPHEADER, $headers);
                curl_setopt($message_curl, CURLOPT_SSL_VERIFYPEER, false);
                $message_resultt = curl_exec($message_curl);
                $MessageId = explode('Message-ID: <', $message_resultt);
                $originalMsgId = explode('>', $MessageId[1]);
                $originalMessageId = $originalMsgId[0];
                //check mail already exist or not in database
                $mailDetails = $this->portaluserService->getUserMailRecord($mailId, $uniqueId);
                if (!empty($mailDetails->id)) {
                    if ($mailDetails->thread_id != $threadId) {
                        $this->portaluserService->UpdateZimbramails($threadId, $uniqueId, $mailId);
                    }

                } else {

                    $mailDetails_message = $this->portaluserService->getUserSentMailRecord("message_id", $originalMessageId, $mail_Type);
                    if (!empty($mailDetails_message->id)) {
                        if ($mailDetails_message->thread_id != $threadId) {
                            $this->portaluserService->UpdateZimbraSentmails($mailId, $threadId, $uniqueId, $originalMessageId, $mail_Type);
                        }

                    } else {
                        $message = null;
                        if (!empty($item['fr'])) {
                            if (preg_match("/From:/i", $item['fr'])) {
                                $check = explode('From:', $item['fr']);
                                $message = $check[0];
                            } else {
                                $message = $item['fr'];
                            }
                        }
                        try {
                            $file_status = $item['f'];
                        } catch (\Exception $e) {
                            $file_status = null;
                        }

                        if (!isset($item['e'][1]['p'])) {
                            $item['e'][1]['p'] = "";
                        }
                        $saveid = $this->portaluserService->storeZimbramail($item['s'], $item['id'], $item['e'][0]['a'], $item['e'][1]['a'], $item['su'], $message, $mail_Type, $file_status, $item['cid'], $item['e'][1]['p'], $item['d'], $originalMessageId);
                        if (!empty($saveid)) {
                            // $file_status == 'au' || $file_status == 'a'
                            if ($file_status == 'au' || $file_status == 'a') {
                                $this->uploadDownloadFileS3($item['id'], $item['s'], $registerUserDetail);
                            }
                        }

                    }
                }
            }
            return response()->json([
                'data' => 'Mail sync'
            ]);
        } else {
            return response()->json([
                'data' => 'No mail for sync'
            ]);
        }
    }



    // Save mail message
    public function MailboxColletion($request, $registerUserDetail, $query, $email_detail)
    {
        //  bullk insert

        foreach ($request as $item) {
            $message = null;
            if (!empty($item['fr'])) {
                if (preg_match("/From:/i", $item['fr'])) {
                    $check = explode('From:', $item['fr']);
                    $message = $check[0];
                } else {
                    $message = $item['fr'];
                }
            }
            try {
                $file_status = $item['f'];
            } catch (\Exception $e) {
                $file_status = null;
            }
            die();
            if (!empty($email_detail)) {

                if ($email_detail->subject == $item['su']) {
                    $this->portaluserService->UpdateZimbramails($item['id'], $item['cid'], $email_detail->id);
                } else {
                }
            } else {

                $saveid = $this->portaluserService->storeZimbramail($item['s'], $item['id'], $item['e'][0]['a'], $item['e'][1]['a'], $item['su'], $message, $file_status, $item['cid'], $item['e'][1]['p']);
                if (!empty($saveid)) {
                    // $file_status == 'au' || $file_status == 'a'
                    if ($file_status == 'au') {
                        $this->uploadDownloadFileS3($item['id'], $registerUserDetail);
                    }
                }
            }
        }
        return 'done';
    }

    // Get Zimbra token
    public function checkAccount($username)
    {
        $WEB_MAIL_PREAUTH_URL = "https://m.carblip.com/service/preauth";
        $domain = getenv('EMAIL_DOMAIN');

        try {
            $timestamp = time() * 1000;
            $preauthToken = hash_hmac("sha1", $username . "|name|0|" . $timestamp, '410858236f0b4a9403d61189c3dc1daa3c5164bc96f5e76cf1d2db6817372337');
            $preauthURL = $WEB_MAIL_PREAUTH_URL . "?account=" . $username . "&by=name" . "&timestamp=" . $timestamp . "&expires=0&preauth=" . $preauthToken;
            $curlObj = curl_init();
            curl_setopt($curlObj, CURLOPT_URL, $preauthURL);
            curl_setopt($curlObj, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curlObj, CURLOPT_HEADER, 1);
            curl_setopt($curlObj, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curlObj, CURLOPT_HEADER, 1);
            $result = curl_exec($curlObj);

            preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $result, $match_found);
            $cookies = array();
            if (!empty($match_found[1])) {
                foreach ($match_found[1] as $item) {
                    parse_str($item, $cookie);
                    $cookies = array_merge($cookies, $cookie);
                }
                // Store Zimbra token in cookie
                $minutes = 60;
                $cookies['ZM_AUTH_TOKEN'];
                Cookie::queue('zimbra_token', $cookies['ZM_AUTH_TOKEN'], $minutes);
                return $cookies['ZM_AUTH_TOKEN'];
            } else {
                return false;
            }
        } catch (Exception $e) {
            return $e->getMessage();
        }
    }



    public function readfileFromS3($fileName, $folderName)
    {
        $path_info = pathinfo($fileName);
        $client = Storage::disk('s3')->getDriver()->getAdapter()->getClient();
        $expiry = "+5 minutes";

        $options = ['user-data' => 'user-meta-value'];
        $cmd = $client->getCommand('GetObject', [
            'Bucket' => \Config::get('filesystems.disks.s3.bucket'),
            'Key' => 'test/' . $folderName . '/' . $fileName,
            'ResponseContentDisposition' => 'attachment; filename=' . $fileName,
            'Content-Type' => 'Content-Type:' . $this->check_MimeType($path_info['extension'])
        ]);
        $request = $client->createPresignedRequest($cmd, $expiry);
        return (string) $request->getUri();
    }


    // file upload on S3
    public function fileUploadS3($filename, $folderName)
    {
        $exists = Storage::disk('s3')->exists('test/' . $folderName . '/' . $filename);
        if ($exists) {
            return Storage::disk('s3')->url(config('filesystems.disks.s3.bucket') . '/test/' . $folderName . '/' . $filename);
            // return response($test)->header('Content-Type', 'image/jpeg');
        }
    }

    // file remove form S3
    public function fileRemoveS3(Request $request)
    {
        $user = Auth::user();
        $request = $request->all();
        $fileFolderName = $user->email . '/' . $user->id . '/' . $request['register_id'] . '/' . $request['register_email'];

        if (Storage::disk('s3')->exists('test/' . $fileFolderName . '/' . $request['file_name'])) {
            $response = Storage::disk('s3')->delete('test/' . $fileFolderName . '/' . $request['file_name']);
            if ($response) {
                return response()->json([
                    'data' => 'File has been successfully removed.'
                ]);
            }
        }
    }

    public function check_MimeType($mimeType)
    {
        $type = null;
        switch ($mimeType) {
            case 'pdf':
                $type = 'application/pdf;charset=utf-8';
                break;
            case 'doc':
                $type = 'application/msword';
                break;
            case 'xls':
                $type = 'application/vnd.ms-excel';
                break;
            case 'gif':
                $type = 'image/gif';
                break;
            case 'jpe':
                $type = 'image/jpeg';
                break;
            case 'jpeg':
                $type = 'image/jpeg';
                break;
            case 'ief':
                $type = 'image/ief';
                break;
            case 'txt':
                $type = 'utf-8';
                break;
            case 'png':
                $type = 'image/png';
                break;
        }
        return $type;
    }

}
