<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class DumpSchema extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:dump-schema';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dump the schema for MySQL databases';

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
        $this->info("Dumping schema ...");

        $this->executeMysqlSchemaDump('cms-staging');
        $this->executeMysqlSchemaDump('configurator_staging');

        //dump migrations data
        $this->executeMysqlDataDump('cms-staging', 'migrations');

        $this->info('Schema dump completed.');
    }

    private function executeMysqlSchemaDump($database)
    {
        $username = 'root'; // Replace with your MySQL username
        // $password = $this->secret('Enter MySQL password:');
        $password = '';

        $command = "mysqldump -u $username --no-data $database > database/$database-schema.sql";

        $this->line("Running command: $command");

        system($command);

        $this->info("Schema dumped for $database.");
    }
    private function executeMysqlDataDump($database, $table)
    {
        $username = 'root'; // Replace with your MySQL username
        // $password = $this->secret('Enter MySQL password:');
        $password = '';
        $command = "mysqldump -u $username --no-create-db --no-create-info $database $table > database/data.sql";

        $this->line("Running command: $command");

        system($command);

        $this->info("Schema dumped for $database.");
    }

}
