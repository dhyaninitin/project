<?php

namespace App\Console\Commands;

use App\Jobs\FetchModelJob;
use Illuminate\Console\Command;

class FetchModel extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mscan:fetch-model';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'fetch model from Mscan';

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
        FetchModelJob::dispatch();
    }
}
