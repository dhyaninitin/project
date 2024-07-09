<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ZimbraMailSaveJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $htmlMessage;
    private $userName;
    private $passWord;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($htmlMessage, $userName, $passWord)
    {
        $this->htmlMessage = $htmlMessage;
        $this->userName = $userName;
        $this->passWord = $passWord;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
         // save email in Sent Folder
        $path = "{m.carblip.com:993/imap/ssl/novalidate-cert}SENT";
        $imapStream = imap_open($path, $this->userName, $this->passWord);
        $ressss = imap_append($imapStream, $path, $this->htmlMessage, "\\Seen");
        imap_close($imapStream);  //Closing the connection
    }
}
