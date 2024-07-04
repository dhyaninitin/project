<?php

namespace App\Console\Commands;

use App\Jobs\FetchMakeJob;
use Illuminate\Console\Command;

class FetchMake extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mscan:fetch-make';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'fetch make from Mscan';

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
        FetchMakeJob::dispatch();
    }
}
