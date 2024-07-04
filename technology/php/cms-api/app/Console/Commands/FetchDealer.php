<?php

namespace App\Console\Commands;

use App\Jobs\FetchDealerJob;
use Illuminate\Console\Command;

class FetchDealer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mscan:fetch-dealer';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'fetch dealer from Mscan';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        FetchDealerJob::dispatch();
    }
}
