require('dotenv').config()

module.exports = {
    "log_level": "debug",
    "sslEnabled": false,
    "apiToken": "process.env.API_TOKEN",
    "recaptcha_api_key":"process.env.Recaptcha_Api_Key",
    "recaptcha_site_key":"process.env.Recaptcha_Site_Key",
    "yearEnabled": 2023,
    "image_resolution": "1280",
    "session_timeout_value": 1,
    "session_timeout_unit": "month",
    "encryptionKey": "process.env.ENCRYPTION_KEY",
    "apiUrl": "http://81c4b6cbfc8c.ngrok.io",
    "webUrl": "https://shop.Automotive.com",
    "shopUrl": "https://shop.Automotive.com",
    "logoUrl": "https://shop.com/assets/logo/Automotive-logo-OG-web.png",
    "s3_folder": "process.env.AWS_S3_FOLDER",
    "AWS_ACCESS_KEY_ID":" process.env.AWS_ACCESS_KEY_ID",
    "AWS_ACCESS_KEY": "process.env.AWS_ACCESS_KEY",
    "AWS_S3_BUCKET": "process.env.AWS_S3_BUCKET",
    "AWS_S3_CREDIT_APP_BUCKET": "process.env.AWS_S3_CREDIT_APP_BUCKET",
    "AWS_ENDPOINT": "process.env.AWS_ENDPOINT_URL",
    "HUBSPOT_TOKEN": "process.env.HUBSPOT_TOKEN",
    "WEBHOOK_TOKEN": "process.env.WEBHOOK_TOKEN",
    "iOS_LINK": {
        "deep_link": "Automotive://"
    },
    "SENTRY": {
        "dsn": "",
        "environment": "localhost",
        "serverName": "localhost",
        "sendTimeout": 5
    },
    "SEGMENT": {
        "api_key": "",
        "app_name": "Automotive-app-test"
    },
    "APPSFLYER": {
        "devkey": "",
        "appid": ""
    },
    "aws": {
        "accessKeyId": "process.env.AWS_ACCESS_KEY_ID",
        "AccessKey": "process.env.AWS_ACCESS_KEY",
        "endpoint": "process.env.AWS_ENDPOINT_URL",
        "region": "us-phoenix-1",
        "s3BucketEndpoint": "process.env.AWS_ENDPOINT_URL"
    },
    "loggly": {
        "credentials": {
            "token": "",
            "subdomain": "Automotive",
            "tags": [
                "Automotive-local"
            ]
        },
        "bufferLength": 20,
        "bufferTimeout": 300000
    },
    "marketscan": {
        "partnerId": ""
    },
    "branchio": {
        "key": ""
    },
    "google": {
        "auth_redirect_url": "http://localhost:3000/google-auth",
        "folder_id": "",
        "radius": 20
    },
    "fuelapi": {
        "apikey": ""
    },
    "searchapi": {
        "apikey": ""
    },
    "hubspot": {
        "apiurl": "https://api.hubapi.com/",
        "apikey": "process.env.HUBSPOT_API_KEY",
    },
    "UrbanAirship": {
        "appKey": "",
        "app": "",
        "appMaster": ""
    },
    "facebook": {
        "appId": "",
        "app": "",
        "callbackURL": "http://localhost:3000/auth/facebook/callback",
        "scope": [
            "email",
            "user_about_me",
            "user_birthday",
            "user_work_history"
        ]
    },
    "twilio": {
        "accountSid": "",
        "authToken": "process.env.TWILIO_AUTH_TOKEN",
        "fromNumber": "+3432432424",
        "messageServiceId": ""
    },
    "EmailTransporter": {
        "transport": "mailjet"
    },
    "mandrill": {
        "apikey": ,
        "fromEmail": "support@Automotive.com",
        "formName": "Automotive Customer Service",
        "backup_lead_emails": "test@Automotive.com"
    },
    "mailchimp": {
        "apiKey": "",
        "apiUrl": "https://us16.api.mailchimp.com/3.0",
        "audience_ids": {
            "registered_users": ""
        }
    },
    "sqs": {
        "url": "https://sqs.us-east-1.amazonaws.com/567997895920/",
        "counter_offer_delay": 0,
        "queues": {
            "vehicle_color_exception_processor": "test",
            "vehicle_inventory_processor": "test",
            "standard_vehicle_inventory_processor": "test3",
            "non_standard_vehicle_inventory_processor": "test",
            "vehicle_fuel_format_processor": "test",
            "counter_offer_processor": "test2",
            "inventory_color_processor": "test"
        }
    },
    "chromeData": {
        "accountInfo": {
            "accountNumber": "",
            "account": "",
            "locale": {
                "country": "US",
                "language": "en"
            }
        },
        "mediaServiceCredential": {
            "username": "",
            "password": ""
        },
        "optionKindIds": {
            "primaryPaint": 68,
            "seatTrim": 72
        }
    },
    "modelsBlocked": [31262, 32213, 31566,  32557, 31447, 31448, 31320, 33008, 31321, 33009, 31134, 32562, 31234, 31235, 31203, 31200, 32810, 32848, 32854,  31230,  32827, 32809, 31509, 32814, 31510, 32815, 31582, 32558, 31264, 32209, 31880, 32759, 31858, 32186, 32926, 32190, 32987, 32183, 32928, 31427, 32455, 31428, 32454],
    "brandsBlocked": ["Karma", "Lucid", "Polestar", "Rivian", "Tesla"],
    "branch_io": {
        "appId": "",
        "key": "key_test_li",
        "s_key": "_test_"
    },
    "db": {
        "database": "process.env.DB_NAME",
        "options": {
            "dialect": "mysql",
            "timezone": "+00:00",
            "logging": false,
            "benchmark": true,
            "port": 3306,
            "pool": {
                "max": 300,
                "min": 0,
                "idle": 500
            },
            "replication": {
                "write": {
                    "username": "process.env.DB_USERNAME",
                    "password": "process.env.DB_PASSWORD",
                    "host": "process.env.DB_WRITE_HOST",
                    "port": 3306
                },
                "read": [
                    {
                        "username": "process.env.DB_USERNAME",
                        "password": "process.env.DB_PASSWORD",
                        "host": "process.env.DB_READ_HOST",
                        "port": 3306
                    }
                ]
            }
        }
    },
    "dbPortal": {
        "database": "process.env.DB_PORTAL_NAME",
        "options": {
            "dialect": "mysql",
            "timezone": "+00:00",
            "logging": false,
            "benchmark": true,
            "port": 3306,
            "pool": {
                "max": 300,
                "min": 0,
                "idle": 500
            },
            "replication": {
                "write": {
                    "username": "process.env.DB_USERNAME",
                    "password": "process.env.DB_PASSWORD",
                    "host": "process.env.DB_WRITE_HOST",
                    "port": 3306
                },
                "read": [
                    {
                        "username": "process.env.DB_USERNAME",
                        "password": "process.env.DB_PASSWORD",
                        "host": "process.env.DB_READ_HOST",
                        "port": 3306
                    }
                ]
            }
        }
    },
    "portalDefaultLogin":{
        "email": 'functionaltest@gmail.com',
        "password": '123456',
    },
    "sendinblue": {
        "apikey": "process.env.SENDINBLUE_APIKEY",
        "fromEmail": "support@Automotive.com",
        "formName": "Automotive",
        "contact_list": {
            "listId": 5
        }
    },
    "mailjet": {
        "apiKey": "process.env.MAILJET_API_KEY",
        "apiSKey": "process.env.MAILJET_API_S_KEY",
        "fromEmail": "support@Automotive.com",
        "formName": "Automotive",
        "contact_list": {
            "listId": 10312971
        }
    },
    "googleOAuthCreds": {
        "JOTFORM_CLIENT_ID": "process.env.JOTFORM_CLIENT_ID",
        "JOTFORM_CLIENT": "process.env.JOTFORM_CLIENT",
        "JOTFORM_REDIRECT_URI": 'https://developers.google.com/oauthplayground',
        'JOTFORM_REFRESH_TOKEN': "process.env.JOTFORM_REFRESH_TOKEN"
    },
    "hubspotprivateapp": {
        "apiurl": "https://api.hubapi.com/crm/v3/",
        "apikey": "process.env.HUBSPOT_PRIVATE_APP_TOKEN",
    },
    "zimbraConfiguration": {
        "zimbra_host": "process.env.ZIMBRA_HOST",
        "admin_login":" process.env.ZIMBRA_ADMIN_LOGIN",
        "admin_password": "process.env.ZIMBRA_ADMIN_PASSWORD",
    },
    "portalbaseurl": {
        "localhost": "http://localhost:4200",
        "staging": "https://portal-staging.Automotive.com",
        "production": "https://portal.Automotive.com"
    },
}