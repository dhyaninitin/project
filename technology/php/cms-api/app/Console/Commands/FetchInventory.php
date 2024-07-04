<?php

namespace App\Console\Commands;

use App\Jobs\FetchInventoryJob;
use Illuminate\Console\Command;

class FetchInventory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mscan:fetch-inventory';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'fetch inventory from Mscan';

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
        FetchInventoryJob::dispatch();
    }
}
