EventEmitter = require('events').EventEmitter
Promise = require('bluebird')
config = require('../../config')
base64 = require('base-64')
mandrill = require('mandrill-api/mandrill')
mandrill_client = new (mandrill.Mandrill)(config.mandrill.apikey)
formatCurrency = require('format-currency')
phoneFormatter = require('phone-formatter')
moment = require('moment-timezone')
helper = require('../helper');
constants = require('../../core/constants');
##############################################
SibApiV3Sdk = require('sib-api-v3-sdk')
Mailjet = require('node-mailjet')
defaultClient = SibApiV3Sdk.ApiClient.instance
apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = config.sendinblue.apikey
apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
mailjet = new Mailjet(
  apiKey: process.env.MAILJET_API_KEY
  apiSecret: process.env.MAILJET_API_SECRET_KEY)
##############################################

class EmailTransport extends EventEmitter

    SMS_SUCCESS:"SmsSuccessEvent"
    SMS_FAILURE:"SmsFailureEvent"

    constructor: (@wagner) ->
      @config=@wagner.get('config')

    ###
      Send Notification to Customer that Credit App is submitted (Not in use)
    ###

    sendCreditAppNotificatoinToCustomer: (data) =>
      first_name = data.first_name
      email_address = data.email_address
      url = data.url

      return new Promise ( resolve, reject ) =>
        if config.EmailTransporter.transport == 'mandrill'
          params =
            template_name: 'Credit Application Request'
            template_content: []
            message:
              to: [ {
                  email: email_address
              } ]
              from_email: config.mandrill.fromEmail
              from_name: config.mandrill.formName
              subject: 'Complete your credit application.'
              global_merge_vars: [
                {
                  'name': 'FIRST_NAME',
                  'content': first_name
                }
                {
                  'name': 'LINK_URL',
                  'content': url
                }
              ]

          mandrill_client.messages.sendTemplate params, ((res) ->
            resolve res
          ), (err) ->
            reject err

    ###
      Send Notification to Saleperson that Credit App is submitted
    ###

    # sendCreditAppNotificatoin: (data) =>
    #   fileName = data.fileName
    #   userInfo = data.userInfo
    #   email = data.ownerEmail
    #   url = data.url

    #   return new Promise ( resolve, reject ) =>
    #     if config.EmailTransporter.transport == 'mandrill'
    #       note = 'New Credit Application is submitted! ' +
    #             '\n\n\t First Name: ' + userInfo.name +
    #             '\n\n\t Email Address: ' + userInfo.email +
    #             '\n\n\t Phone Number: ' + userInfo.phone +
    #             '\n\n\t File Name: ' + fileName +
    #             '\n\n\t URL: ' + url
    #       mandrill_client.messages.send {
    #         message:
    #           to: [ {
    #               email: email
    #           } ]
    #           from_email: config.mandrill.fromEmail
    #           from_name: config.mandrill.formName
    #           subject: 'New Credit Application is submitted'
    #           text: note

    #       }, ((res) ->
    #         resolve res
    #       ), (err) ->
    #         reject err

    # Mailjet
    sendCreditAppNotificatoin: (data) =>
      fileName = data.fileName
      userInfo = data.userInfo
      email = data.ownerEmail
      url = data.url

      return new Promise ( resolve, reject ) =>
        if config.EmailTransporter.transport == 'mailjet'
          note = 'New Credit Application is submitted! ' +
                '\n\n\t First Name: ' + userInfo.name +
                '\n\n\t Email Address: ' + userInfo.email +
                '\n\n\t Phone Number: ' + userInfo.phone +
                '\n\n\t File Name: ' + fileName +
                '\n\n\t URL: ' + url

          request = mailjet.post('send', version: 'v3.1').request(Messages: [ {
            From:
              Email: config.mailjet.fromEmail
              Name: config.mailjet.fromName
            To: [ {
              Email: email
              Name: ''
            } ]
            Subject: 'New Credit Application is submitted'
            TextPart: note
          } ])
          request.then((result) ->
            resolve result
          ).catch (err) ->
            reject err

    ###
      Send Notification to Saleperson that Contact info is updated
    ###
    # sendSalespersonNotificaitonEmail:(old_info, new_info, email) =>
    #   if config.EmailTransporter.transport == 'mandrill'
    #     note = 'Old information: ' +
    #           '\n\n\t First Name: ' + old_info.first_name +
    #           '\n\n\t Email Address: ' + old_info.email_address +
    #           '\n\n\t Phone Number: ' + old_info.phone +
    #           '\n\n\n\nNew information: '
    #     if new_info.first_name
    #       note += '\n\n\t First Name: ' + new_info.first_name
    #     if new_info.email_address
    #       note += '\n\n\t Email Address: ' + new_info.email_address
    #     if new_info.phone
    #       note += '\n\n\t Phone Number: ' + new_info.phone

    #     mandrill_client.messages.send {
    #       message:
    #         to: [ {
    #             email: email
    #         } ]
    #         from_email: config.mandrill.fromEmail
    #         from_name: config.mandrill.formName
    #         subject: old_info.first_name + '’s information has been updated'
    #         text: note

    #     }, ((result) -> null), (error) ->
    #       #uh oh, there was an error
    #       if error
    #          console.log('salesperson notification email error : ' + JSON.stringify(error))

    # Mailjet
    sendSalespersonNotificaitonEmail:(old_info, new_info, email) =>
      if config.EmailTransporter.transport == 'mailjet'
        note = 'Old information: ' +
              '\n\n\t First Name: ' + old_info.first_name +
              '\n\n\t Email Address: ' + old_info.email_address +
              '\n\n\t Phone Number: ' + old_info.phone +
              '\n\n\n\nNew information: '
        if new_info.first_name
          note += '\n\n\t First Name: ' + new_info.first_name
        if new_info.email_address
          note += '\n\n\t Email Address: ' + new_info.email_address
        if new_info.phone
          note += '\n\n\t Phone Number: ' + new_info.phone

        request = mailjet.post('send', version: 'v3.1').request(Messages: [ {
          From:
            Email: config.mailjet.fromEmail
            Name: config.mailjet.fromName
          To: [ {
            Email: email
            Name: ''
          } ]
          Subject: old_info.first_name + '’s information has been updated'
          TextPart: note
        } ])

        request.then((result) ->
          console.log("Sent")
        ).catch (err) ->
          console.log('salesperson notification email error : ' + err)

    # Not in use
    send:(options,token,host) =>
      return new Promise ( resolve, reject ) =>
        if config.EmailTransporter.transport == 'mandrill'
          mandrill '/messages/send', { message:
            to: [ {
                  email: options.email_address
                  name: options.first_name
            } ]
            from_email: config.mandrill.fromEmail
            from_name: config.mandrill.formName
            subject: 'Welcome to carblip'
            text: 'Welcome to carblip' }, (error, response) ->
            #uh oh, there was an error
            if error
              console.log('email error : ' + JSON.stringify(error))
        else

    # Not in use
    CreateTemplate:(options,token,host) =>
      return new Promise ( resolve, reject ) =>
        if config.EmailTransporter.transport == 'mandrill'
          name = 'FollowUp'
          from_email = config.mandrill.fromEmail
          from_name = config.mandrill.formName
          subject = 'Carblip'
          code = "<p>Awesome <strong mc:edit='firstname'>firstname</strong><strong mc:edit='lastname'>lastname</strong>! Thank you for your interest. We are currently building out the rest of the CarBlip platform. But don't worry... Someone near <strong mc:edit='location'>location</strong> is on the hunt for your new <strong mc:edit='brand'>brand</strong> <strong mc:edit='model'>model</strong> and will be in touch with your shortly.</p>"
          text = 'Carblip'
          publish = false
          labels = [ 'example-label' ]
          mandrill_client.templates.add {
            'name': name
            'from_email': from_email
            'from_name': from_name
            'subject': subject
            'text': text
            'code':code
            'publish': publish
            'labels': labels
          }, ((result) ->
            console.log result

            return
          ), (e) ->
              # Mandrill returns the error as an object with name and message keys
              console.log 'A mandrill error occurred: ' + e.name + ' - ' + e.message
        else

    # Not in use
    welcomeEmail:(options,token,host) =>
      subject = 'Welcome To carblip'
      console.log("INN 180")
      return new Promise ( resolve, reject ) =>
        if config.EmailTransporter.transport == 'mandrill'
            params =
              'template_name': 'Welcome Template'
              'template_content': [ {
                'name': 'Carblip'
                'content': 'Car Company'
              } ]
              'message':
                'from_email': config.mandrill.fromEmail
                'from_name': config.mandrill.formName
                'to': [ {
                  email: options.email_address
                  name: options.first_name
                 } ]
                'subject': subject
                'text': subject
            mandrill_client.messages.sendTemplate params, ((res) ->
              console.log res
            ), (err) ->
              console.log 'A mandrill error occurred: ' + err.name + ' - ' + e.message
        else

    # Only Mandrill template in use in 10/14/2022 that we are moving in to sendinblue
    # welcomeUserEmail:(options) =>
    #   return new Promise ( resolve, reject ) =>
    #     subject = 'Welcome To carblip'
    #     device_type = options.device_type
    #     if device_type == 'iOS'
    #       letsgoUrl = 'https://carblip.app.link/'
    #     else
    #       letsgoUrl = 'https://shop.carblip.com/'
    #     d = new Date();
    #     currentYear = d.getFullYear();

    #     if config.EmailTransporter.transport == 'mandrill'
    #         params =
    #           'template_name': 'Welcome User Template New'
    #           'template_content': [
    #             {
    #               'name': 'first_name'
    #               'content': options.first_name
    #             }
    #           ]
    #           'message':
    #             'to': [ {
    #               email: options.email_address
    #               name: options.first_name
    #              } ]
    #             'from_email': config.mandrill.fromEmail
    #             'from_name': config.mandrill.formName
    #             'subject': subject
    #             'global_merge_vars': [
    #               {
    #                 'name': 'SUBJECT',
    #                 'content': subject
    #               }
    #               {
    #                 'name': 'FNAME',
    #                 'content': options.first_name
    #               }
    #               {
    #                 'name': 'UNSUB',
    #                 'content': 'javascript:;'
    #               }
    #               {
    #                 'name': 'LETSGO',
    #                 'content': letsgoUrl
    #               }
    #               {
    #                 'name': 'CURRENT_YEAR',
    #                 'content': currentYear
    #               }
    #             ]

    #         mandrill_client.messages.sendTemplate params, ((res) ->
    #           resolve res
    #         ), (err) ->
    #           reject err
    #           console.log 'A mandrill error occurred: ' + err.name + ' - ' + e.message

    # Not in use
    VerifyEmail:(options,token,host) =>
      return new Promise ( resolve, reject ) =>
        mandrill_client.messages.send { message:
          to: [ {
              email: options.email_address
              name: options.first_name
          } ]
          from_email: config.mandrill.fromEmail
          from_name: config.mandrill.formName
          subject: 'Verify Account'
          text: 'You are receiving this because you (or someone else) have register with carblip.\n\n' + 'Please click on the following link, or paste this into your browser to verify your account complete the process:\n\n' + 'http://' + host + '/verifyEmail/' + token + '\n\n' + 'If you did not request this, please ignore this email .\n' }, ((result) ->

          ), (error) ->
          #uh oh, there was an error
          if error
             console.log('verfiy email error : ' + JSON.stringify(error))

    #Migrated from mandrill to sendinblue

    # forgotPasswordEmail: (email,name,token,host) ->
    #   if config.EmailTransporter.transport == 'mandrill'
    #     mandrill_client.messages.send { message:
    #       to: [ {
    #           email: email
    #           name: name
    #       } ]
    #       from_email: config.mandrill.fromEmail
    #       from_name: config.mandrill.formName
    #       subject: 'Forgot Password'
    #       text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' + 'Please click on the following link, or paste this into your browser to complete the process:\n\n' + 'http://' + host + '/resetPassword/' + token + '\n\n' + 'If you did not request this, please ignore this email and your password will remain unchanged.\n' }, ((result) ->

    #       ), (error) ->
    #       #uh oh, there was an error
    #       if error
    #          console.log('forgot password email error : ' + JSON.stringify(error))
    #   else
    
    # Mailjet
    forgotPasswordEmail: (email,name,token,host) ->
      if config.EmailTransporter.transport == 'mailjet'
        request = mailjet.post('send', version: 'v3.1').request(Messages: [ {
          From:
            Email: config.mailjet.fromEmail
            Name: config.mailjet.fromName
          To: [ {
            Email: email
            Name: name
          } ]
          Subject: 'Forgot Password'
          TextPart: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' + 'Please click on the following link, or paste this into your browser to complete the process:\n\n' + 'http://' + host + '/resetPassword/' + token + '\n\n' + 'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        } ])

        request.then((result) ->
          console.log("Sent")
        ).catch (err) ->
          console.log('forgot password email error : ' + err)
        
      else

    # Not in use
    followUpEmail:(options,location,data) =>
      return new Promise ( resolve, reject ) =>
        if config.EmailTransporter.transport == 'mandrill'
            params =
              'template_name': 'FollowUp'
              'template_content': [
                {
                  'name': 'firstname'
                  'content': options.first_name
                }
                {
                  'name': 'lastname'
                  'content': options.last_name
                }
                {
                  'name': 'location'
                  'content': location
                }
                {
                  'name': 'brand'
                  'content': data.brand
                }
                {
                  'name': 'model'
                  'content': data.model
                }
              ]
              'message':
                'to': [ {
                  email: options.email_address
                  name: options.first_name
                 } ]
                'subject': 'Follow Up Email'
            mandrill_client.messages.sendTemplate params, ((res) ->
              console.log res
            ), (err) ->
              console.log 'A mandrill error occurred: ' + err.name + ' - ' + err.message
        else

    # Not in use
    loginConfirmationEmail:(host, options,link) =>
      if config.EmailTransporter.transport == 'mandrill'
        mandrill_client.messages.send { message:
          to: [ {
              email: options.email_address
          } ]
          from_email: config.mandrill.fromEmail
          from_name: config.mandrill.formName
          subject: 'Login Confirmation Mail'
          text: 'Click on following link for Login Verification:\n\n' + link + '\n\n' + ' Your Passcode for Carblip login is: ' +options.login_verify_code+'\n\n If you did not request this, please ignore this email .\n' }, ((result) ->
          ), (error) ->
          #uh oh, there was an error
          if error
             console.log('login confirmation email error : ' + JSON.stringify(error))
      else

    ###
      Send Lead details to sales@carblip.com
      Details will consist of dealer, buyer info
    ###

    #Migrated mandrill to sendinblue
    # sendConfirmDealEmail:(offer) =>
    #   dealer = offer.primaryDealer
    #   user = offer.User
    #   inventory = offer.VehicleInventory
    #   brand = inventory.Brand
    #   model = inventory.Model
    #   dealer_contact = if dealer.contact  then phoneFormatter.format(dealer.contact, 'NNN-NNN-NNNN') else ''
    #   user_phone = if user.phone  then phoneFormatter.format(user.phone, 'NNN-NNN-NNNN') else ''
    #   premium = if offer.premium == '1' then 'Yes' else 'No'
    #   if config.EmailTransporter.transport == 'mandrill'
    #     mandrill_client.messages.send {
    #       message:
    #         to: [ {
    #             email: 'sales@carblip.com'
    #         } ]
    #         from_email: config.mandrill.fromEmail
    #         from_name: config.mandrill.formName
    #         subject: 'Lead Details'
    #         text: 'Dealer Name:' + dealer.name + '\n\n Dealer Contact Name: ' + dealer_contact + '\n\n Dealer Email Address: ' + dealer.email + '\n\n Lead Name: ' + user.first_name + '\n\n Lead Phone Number: ' + user_phone + '\n\n Lead email: ' + user.email_address + '\n\n Brand: ' + brand.name + '\n\n Model: ' + model.name + '\n\n Trim: ' + inventory.trim + '\n\n Exterior Color: ' +  inventory.exterior_color + '\n\n Interior Color: ' + inventory.interior_color + '\n\n VIN: ' + inventory.vin + '\n\n MSRP: $' + formatCurrency(inventory.msrp) + '\n\n Accepted Offer Price: $' + formatCurrency(offer.last_offered_price) + '\n\n Time Of Accepted Offer: ' + offer.last_offer_made_at + '\n\n CB Premium: ' + premium + '\n\n Order Number: ' + offer.order_number
    #     }, ((result) -> null), (error) ->
    #       #uh oh, there was an error
    #       if error
    #          console.log('confirm deal email error : ' + JSON.stringify(error))

    # Mailjet
    sendConfirmDealEmail:(offer) =>
      dealer = offer.primaryDealer
      user = offer.User
      inventory = offer.VehicleInventory
      brand = inventory.Brand
      model = inventory.Model
      dealer_contact = if dealer.contact  then phoneFormatter.format(dealer.contact, 'NNN-NNN-NNNN') else ''
      user_phone = if user.phone  then phoneFormatter.format(user.phone, 'NNN-NNN-NNNN') else ''
      premium = if offer.premium == '1' then 'Yes' else 'No'
      if config.EmailTransporter.transport == 'mailjet'
        request = mailjet.post('send', version: 'v3.1').request(Messages: [ {
          From:
            Email: config.mailjet.fromEmail
            Name: config.mailjet.fromName
          To: [ {
            Email: 'sales@carblip.com'
            Name: ''
          } ]
          Subject: 'Lead Details'
          TextPart: 'Dealer Name:' + dealer.name + '\n\n Dealer Contact Name: ' + dealer_contact + '\n\n Dealer Email Address: ' + dealer.email + '\n\n Lead Name: ' + user.first_name + '\n\n Lead Phone Number: ' + user_phone + '\n\n Lead email: ' + user.email_address + '\n\n Brand: ' + brand.name + '\n\n Model: ' + model.name + '\n\n Trim: ' + inventory.trim + '\n\n Exterior Color: ' +  inventory.exterior_color + '\n\n Interior Color: ' + inventory.interior_color + '\n\n VIN: ' + inventory.vin + '\n\n MSRP: $' + formatCurrency(inventory.msrp) + '\n\n Accepted Offer Price: $' + formatCurrency(offer.last_offered_price) + '\n\n Time Of Accepted Offer: ' + offer.last_offer_made_at + '\n\n CB Premium: ' + premium + '\n\n Order Number: ' + offer.order_number
        } ])

        request.then((result) ->
          console.log("Sent")
        ).catch (err) ->
          console.log('confirm deal email error : ' + err)


    ###
      Send Lead details to sales@carblip.com
      Details will consist of dealer, buyer info
    ###
    # Migrated from mandrill to sendinblue
    # sendRequestConfirmDealEmail:(request) =>
    #   if config.EmailTransporter.transport == 'mandrill'
    #     owner_email = request.owner_email
    #     is_new_deal = if request.requestCount > 0 then 'No' else 'Yes'
    #     note = 'New Lead: ' + is_new_deal +
    #           '\n\n Lead Name: ' + request.first_name +
    #           '\n\n Lead Phone Number: ' + request.phone +
    #           '\n\n Lead Email: ' + request.email_address +
    #           '\n\n Year: ' + request.year +
    #           '\n\n Car: ' + request.brand + ' ' + request.model + ' ' + request.trim +
    #           '\n\n Exterior Colors: ' +  request.exterior_colors +
    #           '\n\n Interior Colors: ' + request.interior_colors +
    #           '\n\n Preferred Options: ' + request.option_preferences +
    #           '\n\n Credit Assessment: ' + request.credit_score +
    #           '\n\n Buying Time: ' + request.buying_time +
    #           '\n\n Buying Method: ' + request.buying_method

    #     mandrill_client.messages.send {
    #       message:
    #         to: [ {
    #             email: owner_email || 'sales@carblip.com'
    #         } ]
    #         from_email: config.mandrill.fromEmail
    #         from_name: config.mandrill.formName
    #         subject: 'Lead Details'
    #         text: note

    #     }, ((result) -> null), (error) ->
    #       #uh oh, there was an error
    #       if error
    #          console.log('request confirm email error : ' + JSON.stringify(error))

    # Mailjet
    sendRequestConfirmDealEmail:(request) =>
      if config.EmailTransporter.transport == 'mailjet'
        owner_email = request.owner_email
        is_new_deal = if request.requestCount > 0 then 'No' else 'Yes'
        note = 'New Lead: ' + is_new_deal +
              '\n\n Lead Name: ' + request.first_name +
              '\n\n Lead Phone Number: ' + request.phone +
              '\n\n Lead Email: ' + request.email_address +
              '\n\n Year: ' + request.year +
              '\n\n Car: ' + request.brand + ' ' + request.model + ' ' + request.trim +
              '\n\n Exterior Colors: ' +  request.exterior_colors +
              '\n\n Interior Colors: ' + request.interior_colors +
              '\n\n Preferred Options: ' + request.option_preferences +
              '\n\n Credit Assessment: ' + request.credit_score +
              '\n\n Buying Time: ' + request.buying_time +
              '\n\n Buying Method: ' + request.buying_method

        request = mailjet.post('send', version: 'v3.1').request(Messages: [ {
          From:
            Email: config.mailjet.fromEmail
            Name: config.mailjet.fromName
          To: [ {
            Email: owner_email || 'sales@carblip.com'
            Name: ''
          } ]
          Subject: 'Lead Details'
          TextPart: note
        } ])

        request.then((result) ->
          console.log("Sent")
        ).catch (err) ->
          console.log('request confirm email error : ' + err)

    # Migrated from mailchimp to sendinblue
    # sendEmailToPrimaryDealer: (dealer, lead) =>
    #   if config.EmailTransporter.transport == 'mandrill'
    #     emails = if dealer.lead_gen_email then dealer.lead_gen_email else config.mandrill.backup_lead_emails
    #     mandrill_client.messages.send {
    #       message:
    #         to: [ {
    #             email: emails
    #         } ]
    #         from_email: config.mandrill.fromEmail
    #         from_name: config.mandrill.formName
    #         subject: 'Lead Details'
    #         text: 'Lead Name: ' + lead.first_name + ' ' + lead.last_name + '\n\n Lead Phone Number: ' + lead.phone + '\n\n Lead email: ' + lead.email_address + '\n\n Brand: ' + lead.brand + '\n\n Model: ' + lead.model + '\n\n Trim: ' + lead.trim + '\n\n Exterior Color: ' +  lead.exterior_color + '\n\n Interior Color: ' + lead.interior_color + '\n\n VIN: ' + lead.vin + '\n\n MSRP: $' + formatCurrency(lead.msrp) + '\n\n Accepted Offer Price: $' + formatCurrency(lead.last_offered_price) + '\n\n Time Of Accepted Offer: ' + lead.last_offer_made_at + '\n\n CB Premium: ' + lead.premium + '\n\n Order Number: ' + lead.order_number
    #     }, ((result) -> null), (error) ->
    #       #uh oh, there was an error
    #       if error
    #          console.log('Error while sending email to the dealer:', error)

    # Mailjet
    sendEmailToPrimaryDealer: (dealer, lead) =>
      if config.EmailTransporter.transport == 'mailjet'
        emails = if dealer.lead_gen_email then dealer.lead_gen_email else config.mandrill.backup_lead_emails
        
        request = mailjet.post('send', version: 'v3.1').request(Messages: [ {
          From:
            Email: config.mailjet.fromEmail
            Name: config.mailjet.fromName
          To: [ {
            Email: emails
            Name: ''
          } ]
          Subject: 'Lead Details'
          TextPart: 'Lead Name: ' + lead.first_name + ' ' + lead.last_name + '\n\n Lead Phone Number: ' + lead.phone + '\n\n Lead email: ' + lead.email_address + '\n\n Brand: ' + lead.brand + '\n\n Model: ' + lead.model + '\n\n Trim: ' + lead.trim + '\n\n Exterior Color: ' +  lead.exterior_color + '\n\n Interior Color: ' + lead.interior_color + '\n\n VIN: ' + lead.vin + '\n\n MSRP: $' + formatCurrency(lead.msrp) + '\n\n Accepted Offer Price: $' + formatCurrency(lead.last_offered_price) + '\n\n Time Of Accepted Offer: ' + lead.last_offer_made_at + '\n\n CB Premium: ' + lead.premium + '\n\n Order Number: ' + lead.order_number
        } ])

        request.then((result) ->
          console.log("Sent")
        ).catch (err) ->
          console.log('Error while sending email to the dealer : ' + err)

    ###
      Send Lead details to sales@carblip.com
      Details will consist of dealer, buyer info
    ###
    # Not in use
    sendAcceptRequestConfirmationEmail:(data) =>
      return new Promise ( resolve, reject ) =>
        if config.EmailTransporter.transport == 'mandrill'
          params =
            'template_name': 'Accept Request confirmation'
            'template_content': [{
              'name': 'name',
              'content': 'Carblip'
            }, {
              'name': 'year',
              'content': data.year
            }, {
              'name': 'make',
              'content': data.brand
            }, {
              'name': 'model',
              'content': data.model
            }, {
              'name': 'trim',
              'content': data.trim
            },{
              'name': 'order_number',
              'content': data.order_number
            }, {
              'name': 'exterior_colors',
              'content': data.exterior_colors
            }, {
              'name': 'interior_colors',
              'content': data.interior_colors
            }, {
              'name': 'option_preferences',
              'content': data.option_preferences
            }]
            'message':
              'from_email': config.mandrill.fromEmail
              'from_name': config.mandrill.formName
              'to': [ {
                email: data.email_address
                name: data.first_name + ' ' + data.last_name
               } ]
              'subject': 'It\'s a Deal! Request Confirmation.'
              'text': ''
              'global_merge_vars': [{
                'name': 'image_source',
                'content': data.image_url
              }]

          mandrill_client
            .messages
            .sendTemplate params, ((res) ->
              resolve res
            ), (err) ->
              reject err

    # Not in use
    sendAcceptRequestConfirmationEmailV2:(data) =>
      return new Promise ( resolve, reject ) =>
        device_type = data.device_type
        if device_type == 'iOS'
          linkUrl = 'https://carblip.app.link/'
        else
          linkUrl = 'https://shop.carblip.com/'

        d = new Date();
        currentYear = d.getFullYear();

        if config.EmailTransporter.transport == 'mandrill'
          params =
            'template_name': 'Request Template New'
            'template_content': [ {
              'name': 'year',
              'content': data.year
            }, {
              'name': 'make',
              'content': data.brand
            }, {
              'name': 'model',
              'content': data.model || ''
            }, {
              'name': 'trim',
              'content': data.trim || ''
            },{
              'name': 'first_name',
              'content': data.first_name
            }]
            'message':
              'from_email': config.mandrill.fromEmail
              'from_name': config.mandrill.formName
              'to': [ {
                email: data.email_address
                name: data.first_name + ' ' + data.last_name
               } ]
              'subject': 'Thank You for Your Request!'
              'text': ''
              'tags': [
                'request-email'
              ]
              'global_merge_vars': [
                {
                  'name': 'BRAND_NAME',
                  'content': data.brand.toUpperCase()
                }
                {
                  'name': 'LINK_URL',
                  'content': linkUrl
                }
                {
                  'name': 'CURRENT_YEAR',
                  'content': currentYear
                }
              ]
          mandrill_client
            .messages
            .sendTemplate params, ((res) ->
              resolve res
            ), (err) ->
              console.log('error', err);
              reject err

    ###
      Send Lead details to sales@carblip.com
      Details will consist of dealer, buyer info
    ###
    # Not in use
    sendAcceptOfferConfirmationEmail:(data) =>
      return new Promise ( resolve, reject ) =>
        if config.EmailTransporter.transport == 'mandrill'
          params =
            'template_name': 'Accept Offer confirmation'
            'template_content': [{
              'name': 'name',
              'content': 'Carblip'
            }, {
              'name': 'year',
              'content': data.year
            }, {
              'name': 'make',
              'content': data.brand
            }, {
              'name': 'model',
              'content': data.model
            }, {
              'name': 'trim',
              'content': data.trim
            }, {
              'name': 'last_offered_price',
              'content': helper.numberWithCommas(data.last_offered_price)
            }, {
              'name': 'msrp',
              'content': helper.numberWithCommas(data.msrp)
            }, {
              'name': 'savings',
              'content': helper.numberWithCommas(data.msrp - data.last_offered_price)
            },{
              'name': 'order_number',
              'content': data.order_number
            }]
            'message':
              'from_email': config.mandrill.fromEmail
              'from_name': config.mandrill.formName
              'to': [ {
                email: data.email_address
                name: data.first_name + ' ' + data.last_name
               } ]
              'subject': 'It\'s a Deal! Offer Confirmation.'
              'text': ''
              'global_merge_vars': [{
                'name': 'image_source',
                'content': data.image_url
              }]

          mandrill_client
            .messages
            .sendTemplate params, ((res) ->
              resolve res
            ), (err) ->
              reject err
    
    #Migrated from mandril to sendinblue
    # fbLeadSubmitEmail: (data) =>
    #   if config.EmailTransporter.transport == 'mandrill'
    #     leaseEndDate = moment(data.lease_end_date, 'YYYY-MM').add(7, 'hours').format('YYYY MM')
    #     first_name = data.FbUser && data.FbUser.first_name || ''
    #     last_name = data.FbUser && data.FbUser.last_name || ''
    #     phone = data.FbUser && data.FbUser.phone || ''
    #     email_address = data.FbUser && data.FbUser.email_address || ''
    #     note =
    #           '\n\n Lead Name: ' + first_name + ' ' + last_name +
    #           '\n\n Lead Phone Number: ' + phone +
    #           '\n\n Lead Email: ' + email_address +
    #           '\n\n Year: ' + data.year +
    #           '\n\n Car: ' + data.make + ' ' + data.model +
    #           '\n\n VIN: ' +  data.vin +
    #           '\n\n Mileage: ' +  data.mileage +
    #           '\n\n Exterior Color: ' +  data.exterior_color +
    #           '\n\n Interior Color: ' + data.interior_color +
    #           '\n\n Vehicle Condition: ' + constants.vehicle_condition[data.vehicle_condition] +
    #           '\n\n Smoke Free: ' + constants.smoke_free[data.smoke_free] +
    #           '\n\n Number of Keys: ' + data.number_keys +
    #           '\n\n Name of Bank/Lender: ' + data.bank_lender +
    #           '\n\n Account: ' + data.account +
    #           '\n\n Payoff Amount: ' + data.payoff_amount +
    #           '\n\n Lease End Date: ' + leaseEndDate

    #     mandrill_client.messages.send {
    #       message:
    #         to: [ {
    #             email: 'chang@carblip.com'
    #         } ]
    #         from_email: config.mandrill.fromEmail
    #         from_name: config.mandrill.formName
    #         subject: 'Fb Lead Details'
    #         text: note

    #     }, ((result) -> null), (error) ->
    #       #uh oh, there was an error
    #       if error
    #          console.log('fb lead submit email error : ' + JSON.stringify(error))

    # Mailjet
    fbLeadSubmitEmail: (data) =>
      if config.EmailTransporter.transport == 'sendinblue'
        leaseEndDate = moment(data.lease_end_date, 'YYYY-MM').add(7, 'hours').format('YYYY MM')
        first_name = data.FbUser && data.FbUser.first_name || ''
        last_name = data.FbUser && data.FbUser.last_name || ''
        phone = data.FbUser && data.FbUser.phone || ''
        email_address = data.FbUser && data.FbUser.email_address || ''
        note =
              '\n\n Lead Name: ' + first_name + ' ' + last_name +
              '\n\n Lead Phone Number: ' + phone +
              '\n\n Lead Email: ' + email_address +
              '\n\n Year: ' + data.year +
              '\n\n Car: ' + data.make + ' ' + data.model +
              '\n\n VIN: ' +  data.vin +
              '\n\n Mileage: ' +  data.mileage +
              '\n\n Exterior Color: ' +  data.exterior_color +
              '\n\n Interior Color: ' + data.interior_color +
              '\n\n Vehicle Condition: ' + constants.vehicle_condition[data.vehicle_condition] +
              '\n\n Smoke Free: ' + constants.smoke_free[data.smoke_free] +
              '\n\n Number of Keys: ' + data.number_keys +
              '\n\n Name of Bank/Lender: ' + data.bank_lender +
              '\n\n Account: ' + data.account +
              '\n\n Payoff Amount: ' + data.payoff_amount +
              '\n\n Lease End Date: ' + leaseEndDate

        request = mailjet.post('send', version: 'v3.1').request(Messages: [ {
          From:
            Email: config.mailjet.fromEmail
            Name: config.mailjet.fromName
          To: [ {
            Email: 'chang@carblip.com'
            Name: ''
          } ]
          Subject: 'Fb Lead Details'
          TextPart: note
        } ])

        request.then((result) ->
          console.log("Sent")
        ).catch (err) ->
          console.log('fb lead submit email error : ' + err)


    # Not in use
    fbLeadEmail:(data) =>
      return new Promise ( resolve, reject ) =>
        if config.EmailTransporter.transport == 'mandrill'
          lead = data.lead
          if lead.lease_end_date
            lease_end_date = moment(lead.lease_end_date).format('YYYY-MM')
          else
            lease_end_date = ''
          if lead.vehicle_condition
            vehicle_condition = constants.vehicle_condition[lead.vehicle_condition]
          else
            vehicle_condition = ''
          if lead.make
            make = lead.make
          else
            make = ''
          if lead.model
            model = lead.model
          else
            model = ''
          subject = 'Thanks for reaching out to us'
          request_data = ''
          if make || model
            subject = subject + ' your ' + make + ' ' + model
            request_data = ' about your ' + make + ' ' + model
          if data.first_name || data.last_name
            name = (data.first_name || '') + ' ' + (data.last_name || '')
          else
            name = data.email_address
          params =
            'template_name': 'Facebook Ads'
            'template_content': [{
              'name': 'first_name',
              'content': data.first_name
            }]
            'message':
              # 'from_email': config.mandrill.fromEmail
              'to': [ {
                email: data.email_address
                name: name
               } ]
              'subject': subject
              'text': ''
              'tags': [
                'fb-ads'
              ]
              'global_merge_vars': [
                {
                  'name': 'LINK_URL',
                  'content': data.link_url || ''
                },
                {
                  'name': 'MAKE',
                  'content': lead.make || ''
                },
                {
                  'name': 'MODEL',
                  'content': lead.model || ''
                },
                {
                  'name': 'TRIM',
                  'content': lead.trim || ''
                },
                {
                  'name': 'VIN',
                  'content': lead.vin || ''
                },
                {
                  'name': 'EXTERIOR_COLOR',
                  'content': lead.exterior_color || ''
                },
                {
                  'name': 'INTERIOR_COLOR',
                  'content': lead.interior_color || ''
                },
                {
                  'name': 'VEHICLE_CONDITION',
                  'content': vehicle_condition
                },
                {
                  'name': 'LEASE_END_DATE',
                  'content': lease_end_date
                },
                {
                  'name': 'BANK_LENDER',
                  'content': lead.bank_lender || ''
                },
                {
                  'name': 'ACCOUNT',
                  'content': lead.account || ''
                },
                {
                  'name': 'PAYOFF_AMT',
                  'content': lead.payoff_amount || ''
                },{
                  'name': 'REQUEST_DATA',
                  'content': request_data
                }
              ]
          mandrill_client
            .messages
            .sendTemplate params, ((res) ->
              resolve res
            ), (err) ->
              console.log('error', err);
              reject err

    # Migrated from mandrill to sendinblue
    # serverDownEmail: (email1,email2) ->
    #   if config.EmailTransporter.transport == 'mandrill'
    #     mandrill_client.messages.send { message:
    #       to: [{
    #         email:email1,
    #       },
    #       {
    #         email:email2
    #       }]
    #       from_email: config.mandrill.fromEmail
    #       from_name: config.mandrill.formName
    #       subject: 'Server Down'
    #       text: 'Server is down, Please check it.' }, ((result) ->

    #       ), (error) ->
    #       #uh oh, there was an error
    #       if error
    #          console.log('Server down error : ' + JSON.stringify(error))

    # Mailjet
    serverDownEmail: (email1,email2) ->
      if config.EmailTransporter.transport == 'mailjet'
        request = mailjet.post('send', version: 'v3.1').request(Messages: [ {
          From:
            Email: config.mailjet.fromEmail
            Name: config.mailjet.fromName
          To: [ {
            Email: email1
            Name: ''
          },
          {
            Email: email2
            Name: ''
          } ]
          Subject: 'Server Down'
          TextPart: 'Server is down, Please check it.'
        } ])

        request.then((result) ->
          console.log("Sent")
        ).catch (err) ->
          console.log('Server down error : ' + err)
    
    #Migrated from mailchimp to sendinblue    
    # carsDirectApiFailedEmail: (data) ->
    #   if config.EmailTransporter.transport == 'mandrill'
    #     mandrill_client.messages.send { message:
    #       to: [ {
    #             email: 'chang@carblip.com',
    #             type:"to"
    #             },
    #             {
    #             email:"a.dobhal@carblip.com",
    #             type:"cc"
    #             },
    #           ]
    #       from_email: config.mandrill.fromEmail
    #       from_name: config.mandrill.formName
    #       subject: 'ADF Lead Request Failed'
    #       text: 'Error parsing lead. Below is received XML. \n\n'+'Data:'+' '+data }, ((result) ->

    #       ), (error) ->
    #       #uh oh, there was an error
    #       if error
    #          console.log('ADF Lead error : ' + JSON.stringify(error))

    # Mailjet
    carsDirectApiFailedEmail: (data) ->
      if config.EmailTransporter.transport == 'mailjet'
        request = mailjet.post('send', version: 'v3.1').request(Messages: [ {
          From:
            Email: config.mailjet.fromEmail
            Name: config.mailjet.fromName
          To: [ {
            Email: 'chang@carblip.com'
            Name: 'Chang'
          } ]
          Cc: [ {
            Email: 'm.ibrahim@carblip.com'
            Name: 'Muhammad'
          } ]
          Subject: 'ADF Lead Request Failed'
          TextPart: 'Error parsing lead. Below is received XML. \n\n'+'Data:'+' '+data
        } ])
        request.then((result) ->
          console.log("Sent")
        ).catch (err) ->
          console.log('ADF Lead error : ' + err)

    # Migrated from mandrill to sendinblue
    # sendRejectedLeadMail:(options) =>
    #   return new Promise ( resolve, reject ) =>
    #     mandrill_client.messages.send { message:
    #       to: [ {
    #           email: options.email_address
    #           name: options.first_name
    #       } ]
    #       from_email: 'adfleads@carblip.com'
    #       from_name: 'ADF LEADS'
    #       subject: options.subject || ''
    #       text: options.description + '\n\n' + options.message + '\n\n ' + options.lead }, ((result) ->
    #         resolve result
    #       ), (error) ->
    #       #uh oh, there was an error
    #       if error
    #          console.log('verfiy email error : ' + JSON.stringify(error))
    
    # Mailjet
    sendRejectedLeadMail:(options) =>
      return new Promise ( resolve, reject ) =>
        request = mailjet.post('send', version: 'v3.1').request(Messages: [ {
          From:
            Email: 'support@carblip.com'
            Name: 'ADF LEADS'
          To: [ {
            Email: options.email_address
            Name: options.first_name
          } ]
          Subject: options.subject || ''
          TextPart: options.description + '\n\n' + options.message + '\n\n ' + options.lead
        } ])
        request.then((result) ->
          resolve result
        ).catch (err) ->
          console.log('verfiy email error : ' + err)

    # Send Welcome Email using Mailjet
    welcomeUserEmail:(options) =>
      d = new Date();
      currentYear = d.getFullYear();
      deviceType = options.device_type
      if deviceType == 'iOS'
        letsgoUrl = 'https://carblip.app.link/'
      else
        letsgoUrl = 'https://shop.carblip.com/'
      welcomeEmailTemplateId = 5292831

      response = mailjet.post('send', version: 'v3.1').request(Messages: [ {
        To: [ {
          Email: options.email_address
          Name: options.first_name
        } ]
        TemplateID: welcomeEmailTemplateId
        TemplateLanguage: true
        Subject: 'Welcome to Carblip'
        Variables: {
          SUBJECT: 'Welcome to Carblip',
          FNAME: options.first_name,
          LETSGO: letsgoUrl,
          CURRENT_YEAR: currentYear,
          UNSUBSCRIBE: 'javascript:;'
        }
      } ])

      return response

module.exports = EmailTransport
