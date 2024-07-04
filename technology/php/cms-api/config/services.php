<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Stripe, Mailgun, SparkPost and others. This file provides a sane
    | default location for this type of information, allowing packages
    | to have a conventional place to find your various credentials.
    |
    */

    'mailgun' => [
        'domain' => getenv('MAILGUN_DOMAIN'),
        'secret' => getenv('MAILGUN_SECRET'),
        'endpoint' => getenv('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => getenv('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => getenv('AWS_ACCESS_KEY_ID'),
        'secret' => getenv('AWS_SECRET_ACCESS_KEY'),
        'region' => getenv('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'sparkpost' => [
        'secret' => getenv('SPARKPOST_SECRET'),
    ],

    'stripe' => [
        'model' => App\Model\User::class,
        'key' => getenv('STRIPE_KEY'),
        'secret' => getenv('STRIPE_SECRET'),
        'webhook' => [
            'secret' => getenv('STRIPE_WEBHOOK_SECRET'),
            'tolerance' => getenv('STRIPE_WEBHOOK_TOLERANCE', 300),
        ],
    ],
    'mandrill' => [
        'secret' => getenv('MANDRILL_KEY'),
    ],

    'mailjet' => [
        'key' => getenv('MAILJET_API_KEY'),
        'secret' => getenv('MAILJET_API_SECRET_KEY'),
    ],

    'twilio' => [
        'twilio_account_sid' => getenv('TWILIO_ACCOUNT_SID'),
        'twilio_auth_token' => getenv('TWILIO_AUTH_TOKEN'),
        'twilio_number' => getenv('TWILIO_NUMBER'),
        'messaging_service_id' => getenv('TWILIO_MESSAGING_SERVICE_ID'),
    ],

    'database' => [
        'first' => getenv('DB_DATABASE'),
        'second' => getenv('DB_DATABASE_SECOND'),
    ],

    'slack' => [
        'webhook_url' => getenv('SLACK_WEBHOOK_URL'),
    ],

    'portal' => [
        'url' => getenv('WEB_URL'),
    ]
];
