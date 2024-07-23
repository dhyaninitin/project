module.exports = (wagner) ->

    wagner.factory 'UserManager', ->
        UserManager=require('./UserManager')
        return new UserManager(wagner)

    wagner.factory 'MarketScanManager', ->
        MarketScanManager=require('./MarketScanManager')
        return new MarketScanManager(wagner)

    wagner.factory 'BlackBookManager', ->
        BlackBookManager=require('./BlackBookManager')
        return new BlackBookManager(wagner)

    wagner.factory 'BrandsManager', ->
        BrandsManager=require('./BrandsManager')
        return new BrandsManager(wagner)

    wagner.factory 'TypesManager', ->
        TypesManager=require('./TypesManager')
        return new TypesManager(wagner)

    wagner.factory 'SampleDataManager', ->
        SampleDataManager=require('./SampleDataManager')
        return new SampleDataManager(wagner)

    wagner.factory 'VehicleManager', ->
        VehicleManager=require('./VehicleManager')
        return new VehicleManager(wagner)

    wagner.factory 'RebateManager', ->
        RebateManager=require('./RebateManager')
        return new RebateManager(wagner)

    wagner.factory 'ModelManager', ->
        ModelManager=require('./ModelManager')
        return new ModelManager(wagner)

    wagner.factory 'FuelApiManager', ->
        FuelApiManager=require('./FuelApiManager')
        return new FuelApiManager(wagner)

    wagner.factory 'ScrapeManager', ->
        ScrapeManager=require('./ScrapeManager')
        return new ScrapeManager(wagner)

    wagner.factory 'CarsManager', ->
        CarsManager=require('./CarsManager')
        return new CarsManager(wagner)

    wagner.factory 'VehicleInventoryManager', ->
        VehicleInventoryManager=require('./VehicleInventoryManager')
        return new VehicleInventoryManager(wagner)

    wagner.factory 'AdminManager', ->
        AdminManager=require('./AdminManager')
        return new AdminManager(wagner)

    wagner.factory 'ZapierManager', ->
        ZapierManager=require('./ZapierManager')
        return new ZapierManager(wagner)

    wagner.factory 'HubspotManager', ->
        HubspotManager=require('./HubspotManager')
        return new HubspotManager(wagner)

    wagner.factory 'OffersManager', ->
        OffersManager=require('./OffersManager')
        return new OffersManager(wagner)

    wagner.factory 'RequestsManager', ->
        RequestsManager=require('./RequestsManager')
        return new RequestsManager(wagner)

    wagner.factory 'AppVersionManager', ->
        AppVersionManager=require('./AppVersionManager')
        return new AppVersionManager(wagner)
    
    wagner.factory 'ContactOwnerManager', ->
        ContactOwnerManager=require('./ContactOwnerManager')
        return new ContactOwnerManager(wagner)
        
    wagner.factory 'MailchimpManager', ->
        MailchimpManager=require('./MailchimpManager')
        return new MailchimpManager(wagner)
    
    wagner.factory 'ChromeDataManager', ->
        ChromeDataManager=require('./ChromeDataManager')
        return new ChromeDataManager(wagner)

    wagner.factory 'FacebookManager', ->
        FacebookManager=require('./FacebookManager')
        return new FacebookManager(wagner)

    wagner.factory 'CreditApplicationManager', ->
        CreditApplicationManager=require('./CreditApplicationManager')
        return new CreditApplicationManager(wagner)

    wagner.factory 'PdfManager', ->
        PdfManager=require('./PdfManager')
        return new PdfManager(wagner)

    wagner.factory 'GoogleApiManager', ->
        GoogleApiManager=require('./GoogleApiManager')
        return new GoogleApiManager(wagner)

    wagner.factory 'ApiCredentialManager', ->
        ApiCredentialManager=require('./ApiCredentialManager')
        return new ApiCredentialManager(wagner)

    wagner.factory 'BranchIOManager', ->
        BranchIOManager=require('./BranchIOManager')
        return new BranchIOManager(wagner)
    
    wagner.factory 'NotificationManager', ->
        NotificationManager=require('./NotificationManager')
        return new NotificationManager(wagner)

    wagner.factory 'ExportManager', ->
        ExportManager=require('./ExportManager')
        return new ExportManager(wagner)

    wagner.factory 'DealStageManager', ->
        DealStageManager=require('./DealStageManager')
        return new DealStageManager(wagner)

    wagner.factory 'CDealerManager', ->
        CDealerManager=require('./CDealerManager')
        return new CDealerManager(wagner)
    
    wagner.factory 'CMakeManager', ->
        CMakeManager=require('./CMakeManager')
        return new CMakeManager(wagner)
    
    wagner.factory 'CModelManager', ->
        CModelManager=require('./CModelManager')
        return new CModelManager(wagner)

    wagner.factory 'CInventoryManager', ->
        CInventoryManager=require('./CInventoryManager')
        return new CInventoryManager(wagner)

    wagner.factory 'ApiLimitManager', ->
        ApiLimitManager=require('./ApiLimitManager')
        return new ApiLimitManager(wagner)

    wagner.factory 'PhoneLimitManager', ->
        PhoneLimitManager=require('./PhoneLimitManager')
        return new PhoneLimitManager(wagner)
     
    wagner.factory 'CPortaluserManager', ->
        CPortaluserManager=require('./CPortaluserManager')
        return new CPortaluserManager(wagner)

    wagner.factory 'CarsdirectManager', ->
        CarsdirectManager = require('./CarsdirectManager')
        return new CarsdirectManager(wagner)
    
    wagner.factory 'CarsDirectRequestManager', ->
        CarsDirectRequestManager = require('./CarsDirectRequestManager')
        return new CarsDirectRequestManager(wagner)

    wagner.factory 'HealthCheckManager', ->
        HealthCheckManager = require('./HealthCheckManager')
        return new HealthCheckManager(wagner)
