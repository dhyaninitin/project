<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateDBFromSQLSchema extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:generate-from-sql-schema';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate DB From SQL Schema';

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
        $username = 'root';
        $password = '';
        $host = 'localhost';

        $database1 = 'testdb1';
        $database2 = 'testdb2';

        $this->info('Generate DB Schema ..');

        $command = "mysql -u $username -D $database1 < database/cms-staging-schema.sql";
        system($command);

        $command = "mysql -u $username -D $database1 < database/data.sql";
        system($command);

        $command = "mysql -u $username -D $database2 < database/configurator_staging-schema.sql";
        system($command);

        $this->info("DB Generate.");
    }
}
