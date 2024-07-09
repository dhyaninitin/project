import dotenv from 'dotenv';

dotenv.config();

const serverConfig = {
    hostname: process.env.SERVER_HOST,
    port: process.env.SERVER_PORT
};

const chromeConfig = {
    chromeData: {
        accountInfo: {
            accountNumber: process.env.CHROME_ACCOUNT,
            accountSecret: process.env.ACCOUNT_SECRET,
            locale: {
                country: "US",
                language: "en"
            }
        },
        mediaServiceCredential: {
            username: process.env.CHROME_ACCOUNT,
            password: process.env.ACCOUNT_SECRET
        },
        optionKindIds: {
            primaryPaint: 68,
            seatTrim: 72
        },
        baseUrl: "https://services.chromedata.com/AutomotiveConfigCompareService/AutomotiveConfigCompareService4h?WSDL",
        baseMediaUrl: "https://media.chromedata.com/MediaGallery/service/style/"
    },
    modelsBlocked: [31262, 32213, 31566, 32557, 31447, 31448, 31320, 33008, 31321, 33009, 31134, 32562, 31234, 31235, 31203, 31200, 32810, 32848, 32854, 31230, 32827, 32809, 31509, 32814, 31510, 32815, 31582, 32558, 31264, 32209, 31880, 32759, 31858, 32186, 32926, 32190, 32987, 32183, 32928, 31427, 32455, 31428, 32454],
    brandsBlocked: ["Karma", "Lucid", "Polestar", "Rivian", "Tesla"],
    yearEnabled: 2024
}

const ociConfig = {
    accessKeyId: process.env.OCI_ACCESS_KEY_ID,
    secretAccessKey: process.env.OCI_SECRET_ACCESS_KEY,
    endpoint: process.env.OCI_ENDPOINT_URL,
    region: process.env.OCI_DEFAULT_REGION,
    s3BucketEndpoint: process.env.OCI_ENDPOINT_URL,
    bucket: process.env.OCI_BUCKET,
    folder:process.env.OCI_S3_FOLDER
}

const placeHolder = {
    image_placeholder: "https://axo7dvhusjw2.compat.objectstorage.us-phoenix-1.oraclecloud.com/carblip-configurator/assets/image-coming-soon.png",
    image_placeholder_320: "https://axo7dvhusjw2.compat.objectstorage.us-phoenix-1.oraclecloud.com/carblip-configurator/assets/image-coming-soon-320.png",
    image_placeholder_640: "https://axo7dvhusjw2.compat.objectstorage.us-phoenix-1.oraclecloud.com/carblip-configurator/assets/image-coming-soon-640.png",
    image_placeholder_1280: "https://axo7dvhusjw2.compat.objectstorage.us-phoenix-1.oraclecloud.com/carblip-configurator/assets/image-coming-soon-1280.png",
    image_placeholder_2100: "https://axo7dvhusjw2.compat.objectstorage.us-phoenix-1.oraclecloud.com/carblip-configurator/assets/image-coming-soon-2100.png",
    image_resolution: "1280",
}

const slackConfig = {
    url:process.env.SLACK_URL,
    channel: '#cron',
    username: 'Cron Notification',
    icon_emoji: 'https://a.slack-edge.com/80588/img/icons/app-57.png',
    newVehicleNotifier:process.env.NEW_VEHICLE_NOTIFIER,
    vehicleAdditionUsername:'Vehicle additions',
    additionChannel:'#vehicle-additions'
}

const Sentry = {
    dsn: process.env.DSN,
    environment: "localhost",
    serverName: "localhost",
    sendTimeout: 5
}

const zapier = {
    batchSlackNotifier: process.env.BATCH_SLACK_NOTIFIER,
    createCompany: process.env.CREATE_COMPANY,
    findCompany: process.env.FIND_COMPANY,
    confirmOffer: process.env.CONFIRM_OFFER,
    newVehicleNotifier: process.env.NEW_VEHICLE_NOTIFIER,
    requestLinkGenerate: process.env.REQUEST_LINK_GENERATE,
}

const schedulerTime = process.env.SCHEDULER_TIME


export { serverConfig, chromeConfig, Sentry, ociConfig, placeHolder, slackConfig, zapier, schedulerTime};