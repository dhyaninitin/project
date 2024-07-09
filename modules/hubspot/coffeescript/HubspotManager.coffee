Promise = require('bluebird')
config = require('../config')
async=require 'async'
request=require 'request'
_ = require 'underscore'
moment = require('moment')
formatCurrency = require('format-currency')
phoneFormatter = require('phone-formatter');
helpers = require('../utils/helper');
constants = require('../core/constants');

class HubspotManager
    sourceForContactOwnerAssignment = ''
    hs_header =
      'authorization': 'Bearer ' + config.hubspotprivateapp.apikey
      'content-type': 'application/json'
    
    g_contact_owner_id = undefined

    constructor: (@wagner) ->        
        @offersManager = @wagner.get('OffersManager')
        @contactOwnerManager = @wagner.get('ContactOwnerManager')
        @cportaluserManager = @wagner.get('CPortaluserManager')
        @saleOwnerId = 32092474
        @defaultDealStage = ''

    _apiCall:(options,callback)=>
        request options, (error, response, body) =>
            if !error
                try
                    data = JSON.parse(body)
                catch error
                    data = body
                callback(null,data)
            else
                callback(error,null)

    findContactsByEmails:(emails)=>
        return new Promise (resolve, reject) =>
            data = {
              properties: ['firstname', 'lastname', 'phone', 'email'],
              idProperty: 'email',
              inputs: emails
            }
            options=
              url: config.hubspotprivateapp.apiurl+'objects/contacts/batch/read'
              method: 'POST'
              headers: hs_header
              json: data
            @_apiCall options,(error,result)=>
                if error
                    reject error
                else
                    resolve result.results
    # Not in use
    findContact:(email)=>
        return new Promise (resolve, reject) =>
            options=
                url: config.hubspot.apiurl+"contacts/v1/contact/email/"+email+"/profile?hapikey="+config.hubspot.apikey
                method: 'GET'
            @_apiCall options,(error,result)=>
                if error
                    reject error
                else
                    resolve result

    findContactById:(id)=>
        return new Promise (resolve, reject) =>
            options=
              url: config.hubspotprivateapp.apiurl+"objects/contacts/"+id
              method: 'GET'
              headers: hs_header
            @_apiCall options,(error,result)=>
                if error
                    reject error
                else
                    resolve result
    
    # Not in use
    findCompanyContacts:(companyId)=>
        return new Promise (resolve, reject) =>
            headers =
                'Content-Type': 'application/json'
            options=
                url: config.hubspot.apiurl + 'companies/v2/companies/' + companyId + '/contacts?hapikey=' + config.hubspot.apikey
                method: 'GET'
                headers: headers
            @_apiCall options,(error,result)=>
                if error
                    reject error
                else
                    resolve result

    createCompany:(dealer)=>
        return new Promise (resolve, reject) =>
            options=
              url: config.hubspotprivateapp.apiurl+'objects/companies'
              method: 'POST'
              headers: hs_header
              json:
                properties:
                  name: dealer.name
                  city: dealer.city
                  zip: dealer.zip
                  state: dealer.state
                  phone: phoneFormatter.format(dealer.contact, 'NNN-NNN-NNNN')
            
            @_apiCall options,(error,result)=>
                if error
                    reject error
                else
                    resolve result

    getAvailableContactOwnerId: (contact_email) => 
      return new Promise (resolve, reject) =>
        @contactOwnerManager.getContactOwnerList().then (list) =>
          list = list.results
          @checkTypeOfContact(contact_email).then (contact_type) =>
            if contact_type
              availableEmail = "brynn@carblip.com"
              availableContact = _.find list, (item) => item.email == availableEmail

              if availableContact
                resolve availableContact.id
              else 
                resolve null

            else
              @getLastContactOnwerId().then (owner_id) => 
                lastOwner = _.find list, (item) =>
                #  item.ownerId == owner_id
                  item.id == owner_id

                lastOwnerEmail = if lastOwner then lastOwner.email else null
                @contactOwnerManager.getAvilableContactOwnerEmail(lastOwnerEmail, sourceForContactOwnerAssignment).then (availableEmail) =>
                  availableContact = _.find list, (item) => item.email == availableEmail
                  if availableContact
                    console.log("ROUND ROBIN 2", availableContact)
                    resolve availableContact.id
                  else 
                    availableEmail = "brynn@carblip.com"
                    availableContact = _.find list, (item) => item.email == availableEmail
                    if availableContact
                      resolve availableContact.id
                    else
                      resolve null

                .catch (error) =>
                  resolve null

    checkTypeOfContact: (contact_email) => 
      return new Promise (resolve, reject) =>
        wagner.get('UserManager').getUserByEmail(contact_email).then (contact) ->
          if contact.type == 1
            resolve true
          else
            resolve false
        .catch (error) =>
          resolve false
   
    # Migreated v1 to v3
    getContactOwnerList:() =>
      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+"owners"
          method: 'GET'
          headers: hs_header

        @_apiCall options,(error,result)=>
          if error
            resolve []
          else
            resolve result
    
    getLastContactOnwerId: () => 
      return new Promise (resolve, reject) =>
        data = { "sorts": [
          {
            "propertyName": "createdate",
            "direction": "DESCENDING",
          }
        ],
        "properties": [
            "hubspot_owner_id"
        ], 
        "limit": 1 }

        options=
          url: config.hubspotprivateapp.apiurl+'objects/contacts/search'
          method: 'POST'
          headers: hs_header
          json: data

        @_apiCall options,(error,result)=>
          if error
            resolve null
          else
            try
              onwer_id = result.results[0].properties.hubspot_owner_id
            catch error
              onwer_id = null
            resolve onwer_id
    
    getContactOwnerById:(onwer_id) =>
      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+'owners/'+onwer_id
          method: 'GET'
          headers: hs_header
        @_apiCall options,(error,result)=>
          if error
            resolve null
          else
            resolve result
    
    getDealsAssociatedToContact: (contact_id) => 
      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+'objects/contacts/'+contact_id+'/associations/deal'
          method: 'GET'
          headers: hs_header

        @_apiCall options,(error,result)=>
          if error
            resolve null
          else
            resolve result.results

    createContact:(dealer, rr_applied)=>
        if dealer.source >= 1 && dealer.source <= 6
          dealer.source = constants.source_utm_list?[dealer.source] || ''
          
        dealer_contact = if dealer.phone then dealer.phone else ''
        sourceForContactOwnerAssignment = dealer.source.trim()
        return new Promise (resolve, reject) =>
            phone = ''
            if dealer_contact && dealer_contact
              phone = helpers.formatPhoneNumberNational(dealer_contact.trim())
                
            if rr_applied && dealer.source != "Portal" && dealer.source != "Direct"
              @contactOwnerManager.updateLastAssigned(sourceForContactOwnerAssignment).then(result) =>
                resolve result
                
    getContactOwnerId: (contactId) => 
      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+'objects/contacts/'+contactId+'?properties=hubspot_owner_id'
          method: 'GET'
          headers: hs_header

        @_apiCall options,(error,result)=>
          if error
            resolve null
          else
            try
              onwer_id = result.properties.hubspot_owner_id
            catch error
              onwer_id = null
            resolve onwer_id                

    createRequestDeal: (request, contactId) =>
      return new Promise (resolve, reject) =>
        portal_user_url = ''
        portal_user_deal_url = ''
        if config.SENTRY.environment == 'localhost'
          portal_user_url = config.portalbaseurl.localhost + '/users/' + request.user_id
          portal_user_deal_url = config.portalbaseurl.localhost + '/requests/' + request.id
        else if config.SENTRY.environment == 'staging'
          portal_user_url = config.portalbaseurl.staging + 'users/' + request.user_id
          portal_user_deal_url = config.portalbaseurl.staging + '/requests/' + request.id
        else
          portal_user_url =  config.portalbaseurl.production + '/users/' + request.user_id
          portal_user_deal_url =  config.portalbaseurl.production + '/requests/' + request.id
       
        messageData = portal_user_url + '|*' + request.first_name + ' ' + request.last_name + ' ' + request.email_address + '*>\n' + portal_user_deal_url + '|*' + request.year + ' ' + request.brand + ' ' + request.model + ' ' + request.trim + '*>'
        
        @getContactOwnerId(contactId).then (hubspotOwnerId) =>
          
          if contactId
            associations =
                associatedVids: [
                  contactId
                ]
          else
            associations = {}

          dealname = request.first_name
          dealname += ' - ' + request.brand if request.brand
          dealname += ' ' + request.model if request.model
          dealname += ' ' + request.trim if request.trim

          dealstage_id = request.dealstage_id || @defaultDealStage
          closedate = ''
          if dealstage_id == 'closedwon' or dealstage_id == 'closedlost'
            closedate = new Date().getTime()
          request_type = if request.request_type then 'Custom' else 'Standard'
          type_of_car = if request.request_type then request.brand else ''
          if request.request_type
            monthly = if request.price_type == 2 then 'Yes' else 'No'
          else
            monthly = ''

          payment_type = request.buying_method
          if request.buying_method == 'Cash'
            payment_type = 'pay cash'

          options=
            url: config.hubspotprivateapp.apiurl+'objects/deals'
            method: 'POST'
            headers: hs_header
            json: 
              properties:
                dealname: dealname
                dealstage: dealstage_id
                closedate: closedate
                hubspot_owner_id: hubspotOwnerId || ''
                dealtype: 'newbusiness'
                make: request.brand
                model: request.model
                trim: request.trim
                purchase_timeframe: request.buying_time
                payment_type: payment_type || ''
                option_preferences: request.option_preferences
                request_id: request.request_id || ''
                universal_deeplink: request.universal_url || ''
                year: request.year || ''
                request_type: request_type || ''
                credit_score: request.credit_score_txt || ''
                type_of_car: type_of_car || ''
                price: request.msrp_org || ''
                monthly: monthly || ''
                model_id: request.model_number || ''
                deal_source_requested_: request.source_utm || ''
                promo_code: request.referral_code || ''

          @_apiCall options,(error,result)=>
            if error
                reject error
            else
                if result.id
                  associateDealWithContact = 'objects/deals/'+result.id+'/associations/contact/'+contactId+'/3'

                  @associationsWithObjects(associateDealWithContact).then (res) =>

                    if !hubspotOwnerId
                      alert = 
                        eventType: 'Deal created without contact owner',
                        message: messageData
                      wagner.get('ZapierManager').sendAlert(alert).then (result) =>
                        console.log 'alert sent successfully'
                    resolve result
                else
                  reject result
        .catch (error) =>
          reject error

    createDeal:(companyId, contactId, offer)=>
        inventory = offer.VehicleInventory
        brand = inventory.Brand
        model = inventory.Model
        dealer = offer.primaryDealer

        return new Promise (resolve, reject) =>
            @getContactOwnerId(contactId).then (hubspotOwnerId) =>
                options=
                  url: config.hubspotprivateapp.apiurl+'objects/deals'
                  method: 'POST'
                  headers: hs_header
                  json: 
                    properties:
                      dealname: dealer.name + ' ' + offer.last_offer_made_at + ' ' + brand.name + ' ' + model.name + ' ' + inventory.trim
                      dealstage: 'qualifiedtobuy'
                      hubspot_owner_id: hubspotOwnerId || ''
                      amount: offer.last_offered_price
                      dealtype: 'newbusiness'

                @_apiCall options,(error,result)=>
                    if error
                        reject error
                    else
                        associateDealWithContact = 'objects/deals/'+result.id+'/associations/contact/'+contactId+'/3'
                        associateDealWithCompany = 'objects/deals/'+result.id+'/associations/company/'+companyId+'/5'

                        @associationsWithObjects(associateDealWithContact).then (res) =>
                          @associationsWithObjects(associateDealWithCompany).then (response) =>
                            if !hubspotOwnerId
                              alert = 
                                eventType: 'Deal created without contact owner',
                                message: 'Deal Id #' + result.id + ' doesn\'t have contact owner!' 
                              wagner.get('ZapierManager').sendAlert(alert).then (result) =>
                                console.log 'alert sent successfully'
                            resolve result
            .catch (error) =>
                reject error

    createNote:(companyId, contactId, dealId, offer)=>
        inventory = offer.VehicleInventory
        user = offer.User
        brand = inventory.Brand
        model = inventory.Model

        return new Promise (resolve, reject) =>
            premium = if offer.premium then 'Yes' else 'No'
            options=
              url: config.hubspotprivateapp.apiurl+'objects/notes'
              method: 'POST'
              headers: hs_header
              json: 
                properties:
                  hs_timestamp: new Date()
                  hs_note_body: 'body': '<br> Lead Name: ' + user.first_name + '<br> Lead Phone Number: ' + user.phone + '<br> Lead Email: ' + user.email_address + '<br> Year: ' + inventory.year + '<br> Brand: ' + brand.name + '<br> Model: ' + model.name + '<br> Trim: ' + inventory.trim + '<br> Exterior Color: ' +  inventory.exterior_color + '<br> Interior Color: ' + inventory.interior_color + '<br> VIN: ' + inventory.vin + '<br> MSRP: $' + formatCurrency(inventory.msrp) + '<br> Accepted Offer Price: $' + formatCurrency(offer.last_offered_price) + '<br> CB Premium: ' + premium

            @_apiCall options,(error,result)=>
                if error
                    reject error
                else
                    if result.id
                      associateNoteWithContact = 'objects/notes/'+result.id+'/associations/contact/'+contactId+'/202'
                      associateNoteWithCompany = 'objects/notes/'+result.id+'/associations/company/'+companyId+'/190'
                      associateNoteWithDeal = 'objects/notes/'+result.id+'/associations/deal/'+dealId+'/214'
                      @associationsWithObjects(associateNoteWithContact).then (res) =>
                        @associationsWithObjects(associateNoteWithCompany).then (respo) => 
                          @associationsWithObjects(associateNoteWithDeal).then (response) =>
                            result['dealId'] = dealId
                            resolve result

    createRequestNote:(dealId, request, contactId)=>
        return new Promise (resolve, reject) =>
            
            is_new_deal = if request.requestCount > 1 then 'No' else 'Yes'
            phone_number = if request.phone then phoneFormatter.format(request.phone.trim(), '(NNN) NNN-NNNN') else ''
            payment_type = request.buying_method
            if request.buying_method == 'Cash'
              payment_type = 'pay cash'

            car = request.year || ''
            car += ' ' + request.brand
            car += ' ' + request.model if request.model
            car += ' ' + request.trim if request.trim
            note = '<br> New Lead: ' + is_new_deal +
                  '<br>' +
                  '<br> Name: ' + request.first_name +
                  '<br> Email: ' + request.email_address +
                  '<br> Phone: ' + phone_number +
                  '<br> Car: ' + car
            if request.model_number
               note += '<br> Model ID: ' + request.model_number
            if request.exterior_colors
              note += '<br> Exterior Colors: ' +  request.exterior_colors
            if request.interior_colors
              note += '<br> Interior Colors: ' + request.interior_colors
            if request.option_preferences
              note += '<br> Preferred Options: ' + request.option_preferences
            if request.msrp
              note += '<br> Price: ' + request.msrp
              
            note += '<br>'
            if request.buying_method
              note += '<br> Purchase type: ' + payment_type

            if request.term_text
              note += '<br> Terms: ' + request.term_text

            if request.buying_time
              note += '<br> Purchase timeframe: ' + request.buying_time
            if request.credit_score
              note += '<br> Credit Assessment: ' + request.credit_score

            if request.referral_code
              note += '<br> Referral Code: ' + request.referral_code

            if request.source_utm
              note += '<br> Source: ' + request.source_utm
            if request.user_car_information
              if request.user_car_information.will_trade == 1
                note += '<br><br> Trade In: Yes'
                note += '<br> Miles: ' + request.user_car_information.miles_formatted +
                        '<br> Make: ' + request.user_car_information.brand +
                        '<br> Model: ' + request.user_car_information.model +
                        '<br> Year: ' + request.user_car_information.year
              else
                note += '<br><br> Trade In: No'

            if contactId
              contactIds = [
                contactId
              ]
            else
              contactIds = []

            options=
              url: config.hubspotprivateapp.apiurl+'objects/notes'
              method: 'POST'
              headers: hs_header
              json: 
                properties:
                  hs_timestamp: new Date()
                  hs_note_body: note


            @_apiCall options,(error,result)=>
                if error
                    reject error
                else
                    associateNoteWithContact = 'objects/notes/'+result.id+'/associations/contact/'+contactId+'/202'
                    associateNoteWithDeal = 'objects/notes/'+result.id+'/associations/deal/'+dealId+'/214'
                    @associationsWithObjects(associateNoteWithContact).then (res) =>
                      @associationsWithObjects(associateNoteWithDeal).then (response) =>
                        result['dealId'] = dealId
                        resolve result

    associateContactWithCompany:(companyId, contactId)=>
        return new Promise (resolve, reject) =>
            options=
              url: config.hubspotprivateapp.apiurl+'objects/companies/'+companyId+'/associations/contact/'+contactId+'/2'
              method: 'PUT'
              headers: hs_header
            
            @_apiCall options,(error,result)=>
                if error
                    reject error
                else
                    resolve result

    createDealAndSendEmail: (companyId, contactId, offer) =>
      return new Promise (resolve, reject) =>
        @createDeal(companyId, contactId, offer).then (result)=>
          if result
            console.log "Lead Id: #{result.id}"
            @createNote(companyId, contactId, result.id, offer).then (dealNote)=>
              if dealNote
                wagner.get('EmailTransport').sendConfirmDealEmail(offer);
                resolve dealNote
              else
                reject new Error('Unable to create deal note')
          else
            reject new Error ('Unable to create deal')
        .catch (error) =>
            reject error

    createRequestDealAndSendEmail: (request, contactId) =>
      return new Promise (resolve, reject) =>
        # Create Deal in hubspot
        @createRequestDeal(request, contactId).then (result)=>
          if result
            console.log "Lead Id: #{result.id}"
            @createRequestNote(result.id, request, contactId).then (dealNote)=>
              @getHubspotContactById(contactId).then (contact) =>
                owner_id = contact.properties && contact.properties.hubspot_owner_id || null
                if owner_id
                  @getContactOwnerById(owner_id).then (owner_info) => 
                    owner_email = owner_info.email
                    request.owner_email = owner_email
                    wagner.get('EmailTransport').sendRequestConfirmDealEmail(request)
                  .catch (error) =>
                    console.log error      
              .catch (error) =>
                console.log error      
              resolve dealNote
            .catch (error) =>
              reject error
          else
            reject new Error ('Unable to create deal')
        .catch (error) =>
            reject error

    createHubspotCompany: (options, dealer)=>
      return new Promise (resolve, reject) =>
          if options.companyId
              return resolve options.companyId
          else
            @createCompany(dealer).then (company) =>
                resolve company.id
            .catch (error) =>
                reject error

    createContactInHubspot: (dealer, rr_applied) =>
      
      console.log "createContactInHubspot -->",dealer, rr_applied

      return new Promise (resolve, reject) =>
        @getHubspotContact(dealer.email).then (contact) =>
          if contact && contact.id
            owner_id = contact.properties && contact.properties.hubspot_owner_id || null
            options = {}
            if !contact.properties || (contact.properties.firstname != dealer.name)
              options.first_name = dealer.name
            if !contact.properties || (contact.properties.phone != dealer.phone)
              options.phone = dealer.phone

            if !_.isEmpty(options) || rr_applied
              @updateHubspotContact(contact, options, rr_applied).then (new_owner_id) =>
                if new_owner_id
                  owner_id = new_owner_id
                if !_.isEmpty(options) && owner_id
                  @getDealsAssociatedToContact(contact.id).then (deals) => 
                    if deals && deals.length
                      @getContactOwnerById(owner_id).then (owner_info) => 
                        old_info = 
                          first_name: contact.properties && contact.properties.firstname || ''
                          phone: contact.properties && contact.properties.phone || ''
                          email_address: dealer.email
                      
                        new_info = options
                        wagner.get('EmailTransport').sendSalespersonNotificaitonEmail(old_info, new_info, owner_info.email)
                  .catch (error) =>
                    console.log error
                    wagner.get('Raven').captureException(error)
                resolve contact.id
              .catch (error) =>
                reject error
            else
              resolve contact.id
          else
            @createContact(dealer, rr_applied).then (result)=>
              if !result
                  resolve result.id
              else
                  resolve result.id
            .catch (error) =>
              reject error
        .catch (error) =>
          reject error

    createLead: (options)=>
      return new Promise (resolve, reject) =>
        @offersManager.getOfferWithPrimaryDealer(options.offerId).then (offer)=>
          dealer = offer.primaryDealer;
          if (!dealer.email)
              throw new Error('Dealer email does not exists');

          @createHubspotCompany(options, dealer).then (companyId) =>
              @createContactInHubspot(dealer, false).then (contactId) =>
                  @associateContactWithCompany(companyId, contactId).then (result) =>
                      @createDealAndSendEmail(companyId, contactId, offer).then (result) =>
                          resolve result
    
    createRequestContact: (options) =>
      return new Promise (resolve, reject) =>
        user =
          email: options.email_address
          name: options.first_name
          lastname: options.last_name
          phone: options.phone
          source: options.source_utm
          city: options.city
          state: options.state
          zip: options.zip

        sourceForContactOwnerAssignment = options.source_utm
        # @createContactInHubspot(user, true).then (contactId) =>
        # get promo code from DB
        @getPortalUserByPromoCode(options.referral_code).then((portal_user) =>
          console.log "getPortalUserByPromoCode -->", portal_user;
          if Object.keys(portal_user).length
              update= 
                contact_owner_email: portal_user.email
              wagner.get('UserManager').updateProfile(options.user_id, update)
            else
              @getContactOwnerEmailByEmail(options.email_address).then((owner_email) =>
                console.log "Owner email -->", owner_email ;
                if owner_email
                  update = 
                  contact_owner_email: owner_email

                @createContactIfRequestFromPortal(options.email_address).then (contact_owner_id) =>
                  if contact_owner_id 
                  else
                    wagner.get('UserManager').updateProfile(options.user_id, update)
              ).catch((error) =>
                console.log('ELSE error', error)
              )
              resolve true              
          ).catch((error) =>
            console.log('error resolve', error)
            reject error
          )

    updateHubspotContactData: (contactId, options) =>
      data = 
        universal_url: options.universal_url
        year: options.year
        request_id: options.request_id
        source: options.source_utm
      
      sourceForContactOwnerAssignment = options.source_utm
      @updateHubspotContactById(contactId, data, false)

    createRequestLeadAndSendEmail: (options) =>
      return new Promise (resolve, reject) =>
        @createRequestContact(options).then (contactId) =>
          @createRequestDealAndSendEmail(options, contactId).then (result) =>

            console.log("createRequestDealAndSendEmail");
            resolve result
          .catch (error) =>
            reject error
        .catch (error) =>
          reject error

    createRequestLeadAndSendEmailForCarsDirect: (options) =>
      return new Promise (resolve, reject) =>
        @createRequestContactForCarsDirect(options).then (contactId) =>
          @createRequestDealAndSendEmail(options, contactId).then (result) =>
            console.log("createRequestDealAndSendEmail----");
            resolve result
          .catch (error) =>
            reject error
        .catch (error) =>
          reject error


    createRequestContactForCarsDirect: (options) =>
      return new Promise (resolve, reject) =>
        user =
          email: options.email_address
          name: options.first_name
          lastname: options.last_name
          phone: options.phone
          source: options.source_utm
          city: options.city
          state: options.state
          zip: options.zip
        sourceForContactOwnerAssignment = options.source_utm.trim()
        @createContactInHubspot(user, true).then (contactId) =>
          @getContactOwnerEmailByEmail(options.email_address).then((owner_email) =>
            console.log "owner email -->", owner_email;
            if owner_email
              update = 
                contact_owner_email: owner_email
              console.log("User Data",options.user_id, update);
            wagner.get('UserManager').updateProfile(options.user_id, update)
            wagner.get('CarsDirectRequestManager').updateCarsRequest(options.cars_id, update)
          ).catch((error) =>
            console.log('ELSE error', error)
          )
          @updateHubspotContactData(contactId, options)
          resolve contactId 
        .catch (error) =>
          reject error

    getPortalUserByPromoCode: (options) =>
      return new Promise (resolve, reject) =>
        wagner.get('CPortaluserManager').getPortalUserList(options).then (user) ->
            resolve user
        .catch (error) =>
          reject error

    removeTestDeals: (options) =>
      return new Promise (resolve, reject) =>
        async.eachSeries options.email_addresses, ((email_address, callback) =>
            @getContactAndRemoveLeads(email_address).then (result) =>
              callback null, result
        ),(error, result)=>
            if error?
              reject error
            else
              resolve result

    removeTestContacts: (options) =>
      return new Promise (resolve, reject) =>
        async.eachSeries options.email_addresses, ((email_address, callback) =>
          @getHubspotContact(email_address).then (contact) =>
            @removeHubspotContact(contact.id).then (result) =>
              callback null, result
        ),(error, result)=>
            if error?
              reject error
            else
              resolve result
    #Not in use
    removeHubspotContact: (contactId) =>
      return new Promise (resolve, reject) =>
        headers =
          'Content-Type': 'application/json'
        options =
          url: config.hubspot.apiurl + 'contacts/v1/contact/vid/' + contactId + '?hapikey=' + config.hubspot.apikey
          method: 'DELETE'
          headers: headers

        @_apiCall options,(error,result)=>
            if error
                reject error
            else
                resolve result

    getContactAndRemoveLeads: (email_address) =>
      return new Promise (resolve, reject) =>
        @getHubspotContact(email_address).then (contact) =>
          @getLeadsForContact(contact).then (result) =>
            @removeDealsFromHubspot(result.deals).then (result) =>
              resolve result
        .catch (error) =>
          reject error

    removeDealsFromHubspot: (deals) =>
      return new Promise (resolve, reject) =>
        async.eachSeries deals, ((deal, callback) =>
            @removeDeal(deal.dealId).then (result) =>
              callback null, result
        ),(error, result)=>
            if error?
              reject error
            else
              resolve result
    #Not in use
    removeDeal: (dealId) =>
      return new Promise (resolve, reject) =>
        headers =
          'Content-Type': 'application/json'
        options =
          url: config.hubspot.apiurl + 'deals/v1/deal/' + dealId + '?hapikey=' + config.hubspot.apikey
          method: 'DELETE'
          headers: headers

        @_apiCall options,(error,result)=>
            if error
                reject error
            else
                resolve result
    
    # Not in use
    getLeadsForContact: (contact) =>
      return new Promise (resolve, reject) =>
        headers =
          'Content-Type': 'application/json'
        options =
          url: config.hubspot.apiurl + 'deals/v1/deal/associated/contact/'+contact.id+'/paged?hapikey=' + config.hubspot.apikey
          method: 'GET'
          headers: headers

        @_apiCall options,(error,result)=>
            if error
                reject error
            else
                resolve result

    ###
    # Api call to get hubspot contact detail by ID
    # @param v_id Number
    # @return
    ###
    getHubspotContactById: (v_id) =>
      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+"objects/contacts/"+v_id+"?properties=hubspot_owner_id"
          method: 'GET'
          headers: hs_header

        @_apiCall options,(error,result)=>
          if error
            reject error
          else
            resolve result  

    # ONLY ONE PENDING
    getHubspotDeals: (offset) =>
      return new Promise (resolve, reject) =>
        headers =
          'Content-Type': 'application/json'
        options =
          url: config.hubspot.apiurl + 'deals/v1/deal/recent/created?count=100&offset='+offset+'&hapikey=' + config.hubspot.apikey
          method: 'GET'
          headers: headers

        @_apiCall options,(error,result)=>
          if error
            reject error
          else
            resolve result  

    ###
    # Get hubspot contact by email
    # @param email_address email
    # @return
    ###

    getHubspotContact: (email_address) =>
      return new Promise (resolve, reject) =>
        data = { "filters": [
          {
            "propertyName": "email",
            "operator": "EQ",
            "value": email_address
          }
        ],
        "properties": [
            "hubspot_owner_id",
            "firstname",
            "lastname",
            'email',
            "phone",
            "type",
            "over18",
            "concierge_state"
        ] }
        options=
          url: config.hubspotprivateapp.apiurl+"objects/contacts/search"
          method: 'POST'
          headers: hs_header
          json: data

        @_apiCall options,(error,result)=>
          if error
            reject error
          else
            console.log "getHubspotContact -->", result
            resolve result.results[0]

    ###
    # Get hubspot owner by email
    # @param email_address email
    # @return
    ###
    getHubspotOwnerByEmail: (email_address) =>
      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+'owners/?email='+email_address+'&limit=1'
          method: 'GET'
          headers: hs_header

        @_apiCall options,(error,result)=>
          if error
            reject error
          else
            resolve result.results

    updateHubspotDealDetail: (deal_id, data) =>
      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+'objects/deals/'+deal_id
          method: 'PATCH'
          headers: hs_header
          json: 
            properties: data

        @_apiCall options,(error,result)=>
          if error
            reject error
          else
            resolve result
    
    ###
    # Function to update hubspot contact properties with contact id
    # @param contactId number
    # @param data object
    # @return
    ###

    updateHubspotContactById: (contactId, data, rr_applied) =>
      if data.source == 1 || data.source == 2 || data.source == 3 || data.source == 4 || data.source == 5
        data.source = constants.source_utm_list?[data.source] || ''

      sourceForContactOwnerAssignment = data.source.trim()
      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+'objects/contacts/'+contactId
          method: 'PATCH'
          headers: hs_header
          json: 
            properties: {}

        if data.universal_url
          options.json.properties['universal_deeplink'] = data.universal_url.trim() || ''

        if data.year
          options.json.properties['vehicle_year'] = data.year

        if data.request_id
          options.json.properties['request_id'] = data.request_id

        if data.source
          options.json.properties['source__requested_'] = data.source.trim()

        @_apiCall options,(error,result)=>
          if error
            console.log error
          else
            console.log 'Contact is successfully updated with deeplink'
            resolve true

    ###
    # Function to update hubspot contact properties with contact email
    # @param email string
    # @param data object
    # @return
    ###

    updateHubspotContactByEmail: (email, data) =>
      return new Promise (resolve, reject) =>
        @getHubspotContact(email).then (contact) =>
          contact_id = contact.id
          options=
          url: config.hubspotprivateapp.apiurl+'objects/contacts/'+contact_id
          method: 'PATCH'
          headers: hs_header
          json: 
            properties: {}

          if data.phone
            options.json.properties['phone'] = helpers.formatPhoneNumberNational(data.phone.trim())

          @_apiCall options,(error,result)=>
            if error
              console.log error
            else
              console.log 'Contact is successfully updated'
              resolve true

    ###
    Function to update hubspot contact properties with contact and user
    @param contact: Hubspot Contact Object
    @param user: User Object
    @param rr_applied: Flag to apply round robin rule - 0: No, 1: Yes
    @return
    ###   
            
    updateHubspotContact: (contact, user, rr_applied) =>
      contactId = contact.id
      if user.source
        sourceForContactOwnerAssignment = user.source.trim()
      
      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+'objects/contacts/'+contactId
          method: 'PATCH'
          headers: hs_header
          json: 
            properties: {}
        
        @getAvailableContactOwnerId(contact?.properties?.email).then (owner_id) =>  
          if user.first_name
            options.json.properties['firstname'] = user.first_name.trim()

          if user.last_name
            options.json.properties['lastname'] = user.last_name.trim()

          if user.phone
            options.json.properties['phone'] = helpers.formatPhoneNumberNational(user.phone.trim())

          if user.source
            options.json.properties['source__requested_'] = user.source.trim()

          if user.city
            options.json.properties['city'] = user.city.trim()

          if user.state
            options.json.properties['state'] = user.state.trim()

          if user.zip
            options.json.properties['zip'] = user.zip.trim()
          
          if rr_applied && contact.properties && !contact.properties.hubspot_owner_id
            options.json.properties['hubspot_owner_id'] = owner_id || ''

          @_apiCall options,(error,result)=>
            if error
              console.log('ERRROOO',error);
              reject error
            else
              console.log('ELSE****');
              if rr_applied && contact.properties && (!contact.properties.hubspot_owner_id)
                console.log("UPDTE LASR");
                @contactOwnerManager.updateLastAssigned(sourceForContactOwnerAssignment)
                resolve owner_id
              else
                resolve null
        .catch (error) =>
            reject error

    updateHubspotContactOwnerByPromoCode: (contactId,owner_email) =>
      
      console.log("updateHubspotContactOwnerByPromoCode-->",contactId,owner_email);

      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+'objects/contacts/'+contactId
          method: 'PATCH'
          headers: hs_header
          json: 
            properties: {}
        @getHubspotOwnerByEmail(owner_email).then((owner) =>
          console.log "getHubspotOwnerByEmail----->", owner;
          if owner.length > 0 
             owner_id = owner[0].id || null
             if owner_id
              options.json.properties['hubspot_owner_id'] = owner_id
    
          @_apiCall options,(error,result)=>
            if error 
              reject error
            else 
              resolve owner_id 
          )
          .catch (error) => reject error

    updateHubspotContactWithEmail: (email_address, user) =>
      return new Promise (resolve, reject) =>
        @getHubspotContact(email_address).then (contact) =>
          if contact && contact.id
            @updateHubspotContact(contact, user, false).then (result) =>
              resolve result
          else
            resolve true
        .catch (error) =>
          reject error

    getContactOwnerEmail: (dealer, rr_applied) =>
      return new Promise (resolve, reject) =>
        @getHubspotContact(dealer.email).then (contact) =>
          if contact && contact.id
            owner_id = contact.properties && contact.properties.hubspot_owner_id || null
            options = {}
            if !contact.properties || (contact.properties.firstname != dealer.name)
              options.first_name = dealer.name
            if !contact.properties || (contact.properties.phone != dealer.phone)
              options.phone = dealer.phone

            @getContactOwnerById(owner_id).then (owner_info) => 
              if !_.isEmpty(options) || rr_applied
                @updateHubspotContact(contact, options, rr_applied).then (new_owner_id) =>
                  console.log 'update hubspot contact'
                  if new_owner_id
                    owner_id = new_owner_id
                  if !_.isEmpty(options) && owner_id
                    @getDealsAssociatedToContact(contact.id).then (deals) => 
                      if deals && deals.length
                        old_info = 
                          first_name: contact.properties && contact.properties.firstname || ''
                          phone: contact.properties && contact.properties.phone || ''
                          email_address: dealer.email
                        new_info = options
              resolve owner_info.email
          else
            @createContact(dealer, rr_applied).then (contact)=>
              console.log 'create hubspot contact'
              owner_id = undefined
              if contact
                owner_id = contact.properties && contact.properties.hubspot_owner_id || null
              else 
                owner_id = g_contact_owner_id
              
              @getContactOwnerById(owner_id).then (owner_info) =>
                g_contact_owner_id = undefined 
                resolve owner_info.email


    ###
    # Get contact owner email from customer email address
    # @param email string : customer email address
    # @return email: contact owner email
    ###

    getContactOwnerEmailByEmail: (email) =>
      return new Promise (resolve, reject) =>
        if g_contact_owner_id == undefined
          @getHubspotContact(email).then (contact) =>
              owner_id = contact.properties && contact.properties.hubspot_owner_id || null
              if owner_id
                @getContactOwnerById(owner_id).then (owner_info) => 
                  resolve owner_info.email
              else
                resolve false
        else
          if g_contact_owner_id
            @getContactOwnerById(g_contact_owner_id).then (owner_info) =>
              g_contact_owner_id = undefined 
              resolve owner_info.email

    fetchDeals: (offset) =>
      return new Promise (resolve, reject) =>
        @getHubspotDeals(offset).then (result) =>
          resolve result
        .catch (error) =>
          reject error

    ###
    # Create Note for Contact
    # @param Number contact_id
    # @param String note
    # @return 
    ###

    createContactNote: (contact_id, note) =>
      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+'objects/notes'
          method: 'POST'
          headers: hs_header
          json: 
            properties:
              hs_timestamp: new Date()
              hs_note_body: note

        @_apiCall options,(error,result)=>
          if error
            reject error
          else
            associateNoteWithContact = 'objects/notes/'+result.id+'/associations/contact/'+contact_id+'/202'
            @associationsWithObjects(associateNoteWithContact).then (res) =>
              resolve result

    fetchDealStages: () =>
      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+"pipelines/deal"
          method: 'GET'
          headers: hs_header

        @_apiCall options,(error,result)=>
          if error
            reject error
          else
            resolve result.results

    
    ###
    # Function to update hubspot contact properties as referral URL with contact id
    # @param contactId number
    # @return
    ###

    updateHubspotContactReferral: (generatedReferralURL, contactId) =>
      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+'objects/contacts/'+contactId
          method: 'PATCH'
          headers: hs_header
          json: 
            properties: {}

        if generatedReferralURL
          options.json.properties['referral_url'] = generatedReferralURL

        @_apiCall options,(error,result)=>
          if error
            console.log error
          else
            console.log 'Contact is successfully updated with deeplink'
            resolve true

    associationsWithObjects: (associatiationObjectUrl) =>
      return new Promise (resolve, reject) =>
        options=
          url: config.hubspotprivateapp.apiurl+associatiationObjectUrl
          method: 'PUT'
          headers: hs_header

        @_apiCall options,(error,result)=>
          if error
            console.log error
          else
            resolve true


    # this function is used to sync type, over18 and concierge state if present on hubspot for contact
    checkAndUpdateTypeForContact: (contact_email) =>
      return new Promise (resolve, reject) =>
        @getHubspotContact(contact_email).then (contact) =>
          if contact && contact.id
            update=
              type: contact.properties && contact.properties.type || null
              over18: contact.properties && contact.properties.over18 || null
              concierge_state: contact.properties && contact.properties.concierge_state || null

            if update.type == "Concierge"
              update.type = 1
            else if update.type == "ConciergeTest"
              update.type = 2
            else
              update.type = null
            
            if update.over18 == "Yes"
              update.over18 = 1
            else if update.over18 == "No"
              update.over18 = 2
            else 
              update.over18 = 0
            
            if update.concierge_state == "California" || update.concierge_state == "CA"
              update.concierge_state = "CA"
            else if update.concierge_state == "Arizone" || update.concierge_state == "AZ"
              update.concierge_state = "AZ"
            else
              update.concierge_state = null

            wagner.get('UserManager').updateProfileByEmail(contact_email, update)

            wagner.get('UserManager').updateHubspotContactId(contact.id, contact_email)

            resolve true
          resolve false


    # When Request comes from protal and contact does not exist on Hubspot
    createContactIfRequestFromPortal: (email_address) =>
      return new Promise (resolve, reject) => 
        wagner.get('UserManager').getUserByEmail(email_address).then (contact) =>
          if contact.contact_owner_email
            wagner.get('HubspotManager').getHubspotOwnerByEmail(contact.contact_owner_email).then((owner) =>
              if owner.length > 0 
                owner_id = owner[0].id || null
                resolve owner_id
              else 
                resolve null

            ).catch (error) => reject error
            
          else
            resolve null

module.exports = HubspotManager
