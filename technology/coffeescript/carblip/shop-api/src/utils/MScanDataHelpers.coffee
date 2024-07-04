config = require('../config')
AWS = require('aws-sdk')
moment = require('moment-timezone')
Promise = require('bluebird')
async = require 'async'
request = require('request')
_ = require 'underscore'
moment = require('moment-timezone')
constants = require('../core/constants');


converTStoTimestamp = (str) ->
    if typeof str != 'string'
        str = str.toString();
    timestamp = Number(str.substring(6, 19));
    return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');

convertToNumber = (str) ->
    if typeof str != 'number'
        str = Number(str)
    return str

formatDealers = (dealers) ->
    return _.map dealers, (item) =>
        m_activated_at = if item['ActivatedTS'] then @converTStoTimestamp(item['ActivatedTS']) else null
        m_beta_end_at = if item['BetaEndDate'] then @converTStoTimestamp(item['BetaEndDate']) else null
        m_created_at = if item['CreatedTS'] then @converTStoTimestamp(item['CreatedTS']) else null
        m_disabled_at = if item['DisabledTS'] then @converTStoTimestamp(item['DisabledTS']) else null
        api_status = if (item['mScanAPIStatus'] == 'Live') then true else false
        return {
            id:             @convertToNumber(item['Number']),
            account_type:   item['AccountType'],
            address:        item['Address'],
            city:           item['City'],
            monthly_fee:    item['MonthlyFee'],
            name:           item['Name'],
            phone:          item['Phone'],
            state:          item['State'],
            zip:            item['ZIP'],
            api_status:     api_status,
            is_active:      !item['Disabled'],
            m_activated_at: m_activated_at,
            m_beta_end_at:  m_beta_end_at,
            m_created_at:   m_created_at,
            m_disabled_at:  m_disabled_at,
        }

formatMakes = (makes, is_new) ->
    return _.map makes, (item) =>
        return {
            id:           @convertToNumber(item['ID']),
            is_domestic:  item['IsDomestic'],
            name:         item['Name'],
            captive:      JSON.stringify(item['Captive']),
            is_new:       is_new,
        }

formatModels = (models, is_new) ->
    return _.map models, (item) =>
        return {
            id:           @convertToNumber(item['ID']),
            m_make_id:    item['MakeID'],
            name:         item['Name'],
            is_new:       is_new,
        }

formatInventory = (models, dealer_id, is_new) ->
    return _.map models, (item) =>
        return {
            m_dealer_id:            dealer_id,
            inventory_id:           item['ID'],
            invoice:                item['Invoice'],
            is_new:                 item['IsNew'],
            msrp:                   item['MSRP'],
            m_make_id:              item['MakeID'],
            m_model_id:             item['ModelID'],
            model_number:           item['ModelNumber'],
            mscode:                 item['MsCode'],
            shipping:               item['Shipping'],
            desc:                   item['ShortDescription'],
            weight:                 item['Weight'],
            year:                   item['Year'],
            year_display:           item['YearDisplay'],
            base_msrp:              item['BaseMSRPAmount'],
            current_mileage:        item['CurrentMileage'],
            exterior_color:         item['ExteriorColor'],
            interior_color:         item['InteriorColor'],
            lot_age:                item['LotAge'],
            price:                  item['PreferredPrice'],
            stock_no:               item['StockNo'],
            vin:                    item['VIN'],
        }

module.exports.convertToNumber = convertToNumber
module.exports.converTStoTimestamp = converTStoTimestamp
module.exports.formatDealers = formatDealers
module.exports.formatMakes = formatMakes
module.exports.formatModels = formatModels
module.exports.formatInventory = formatInventory
