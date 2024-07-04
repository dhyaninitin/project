<?php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Database Connection Name
    |--------------------------------------------------------------------------
    |
    | Here you may specify which of the database connections below you wish
    | to use as your default connection for all database work. Of course
    | you may use many connections at once using the Database library.
    |
    */

    'default' => getenv('DB_CONNECTION', 'mysql'),

    /*
    |--------------------------------------------------------------------------
    | Database Connections
    |--------------------------------------------------------------------------
    |
    | Here are each of the database connections setup for your application.
    | Of course, examples of configuring each database platform that is
    | supported by Laravel is shown below to make development simple.
    |
    |
    | All database work in Laravel is done through the PHP PDO facilities
    | so make sure you have the driver for your particular database of
    | choice installed on your machine before you begin development.
    |
    */

    'connections' => [

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => getenv('DATABASE_URL'),
            'database' => getenv('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'foreign_key_constraints' => getenv('DB_FOREIGN_KEYS', true),
        ],

        
        'mysql' => [
            'driver' => getenv('DB_CONNECTION', 'mysql'),
            'url' => getenv('DATABASE_URL'),
            'read' => [
                'host' => [
                    getenv('DB_READ_HOST', '127.0.0.1')
                ],
            ],
            'write' => [
                'host' => [
                    getenv('DB_WRITE_HOST', '127.0.0.1')
                 ],
            ],
            'sticky'    => true,
            'port' => getenv('DB_PORT', '3306'),
            'database' => getenv('DB_DATABASE', 'forge'),
            'username' => getenv('DB_USERNAME', 'forge'),
            'password' => getenv('DB_PASSWORD', ''),
            'unix_socket' => getenv('DB_SOCKET', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => false,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => getenv('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'mysql-user' => [
            'driver' => getenv('DB_CONNECTION_SECOND', 'mysql'),
            'url' => getenv('DATABASE_URL_SECOND'),
            'read' => [
                'host' => [
                    getenv('DB_READ_HOST_SECOND', '127.0.0.1')
                ],
            ],
            'write' => [
                'host' => [
                    getenv('DB_WRITE_HOST_SECOND', '127.0.0.1')
                 ],
            ],
            'sticky'    => true,
            'port' => getenv('DB_PORT_SECOND', '3306'),
            'database' => getenv('DB_DATABASE_SECOND', 'forge'),
            'username' => getenv('DB_USERNAME_SECOND', 'forge'),
            'password' => getenv('DB_PASSWORD_SECOND', ''),
            'unix_socket' => getenv('DB_SOCKET_SECOND', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => getenv('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'pgsql' => [
            'driver' => 'pgsql',
            'url' => getenv('PG_DB_URL'),
            'host' => getenv('PG_DB_HOST', '127.0.0.1'),
            'port' => getenv('PG_DB_PORT', '5432'),
            'database' => getenv('PG_DB_DATABASE', 'forge'),
            'username' => getenv('PG_DB_USERNAME', 'forge'),
            'password' => getenv('PG_DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
            'schema' => getenv('PG_DB_SCHEMA', 'public'),
            'sslmode' => 'prefer',
        ],

        'sqlsrv' => [
            'driver' => 'sqlsrv',
            'url' => getenv('DATABASE_URL'),
            'host' => getenv('DB_HOST', 'localhost'),
            'port' => getenv('DB_PORT', '1433'),
            'database' => getenv('DB_DATABASE', 'forge'),
            'username' => getenv('DB_USERNAME', 'forge'),
            'password' => getenv('DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Repository Table
    |--------------------------------------------------------------------------
    |
    | This table keeps track of all the migrations that have already run for
    | your application. Using this information, we can determine which of
    | the migrations on disk haven't actually been run in the database.
    |
    */

    'migrations' => 'migrations',

    /*
    |--------------------------------------------------------------------------
    | Redis Databases
    |--------------------------------------------------------------------------
    |
    | Redis is an open source, fast, and advanced key-value store that also
    | provides a richer body of commands than a typical key-value system
    | such as APC or Memcached. Laravel makes it easy to dig right in.
    |
    */

    'redis' => [

        'client' => getenv('REDIS_CLIENT', 'predis'),

        'options' => [
            'cluster' => getenv('REDIS_CLUSTER', 'predis'),
            'prefix' => Str::slug(getenv('APP_NAME', 'laravel'), '_').'_database_',
        ],

        'default' => [
            'host' => getenv('REDIS_HOST', '127.0.0.1'),
            'password' => getenv('REDIS_PASSWORD', null),
            'port' => getenv('REDIS_PORT', 6379),
            'database' => getenv('REDIS_DB', 0),
        ],

        'cache' => [
            'host' => getenv('REDIS_HOST', '127.0.0.1'),
            'password' => getenv('REDIS_PASSWORD', null),
            'port' => getenv('REDIS_PORT', 6379),
            'database' => getenv('REDIS_CACHE_DB', 1),
        ],

    ],

];
