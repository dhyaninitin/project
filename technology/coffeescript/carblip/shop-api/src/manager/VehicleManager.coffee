Promise = require('bluebird')
config = require('../config')
request=require 'request'
_ = require 'underscore'
__ = require 'lodash'
async = require 'async'
zipcodes = require('zipcodes')
moment = require('moment-timezone')
helper = require('../utils/helper');
ChromeDataHelpers = require('../utils/ChromeDataHelpers');
constants = require('../core/constants');
generateSequelizeOp = helper.generateSequelizeOp

Raven = require('raven')

Raven.config(process.env.NODE_ENV != 'localhost' && config.SENTRY.dsn, {
  name: config.SENTRY.serverName
  environment: config.SENTRY.environment
  sendTimeout: config.SENTRY.sendTimeout
}).install();

class VehicleManager

    constructor: (@wagner) ->
        
        @brands=@wagner.get('Brands')
        @models=@wagner.get('Models')
        @vehicle=@wagner.get('Vehicles')
        @vehicleMedia=@wagner.get('VehicleMedia')
        @rebates=@wagner.get('Rebates')
        @vehicleRebate=@wagner.get('VehicleRebate')
        @vehicleColors=@wagner.get('VehicleColors')
        @interiorColors=@wagner.get('InteriorColors')
        @vehicleInventory=@wagner.get('VehicleInventory')
        @VehicleColorsMedia=@wagner.get('VehicleColorsMedia')
        @VehicleOptions=@wagner.get('VehicleOptions')


    ###
    # Function to get first vehicles in model
    # @param model_id number
    # @return vehicle
    ###

    fetchFirstItem:(model_id, trim, brand_id)=>
        return new Promise (resolve, reject) =>
            query=
                where:
                    model_id: model_id,
                    trim: trim
            @vehicle.findAll(query).then (result)=>
                if not result or result.length <= 0
                    @fetchClosestTrims(model_id,trim).then (fetchedTrims)=>
                        if fetchedTrims.length <= 0
                            query=
                                where:
                                    model_id: model_id
                            @vehicle.findAll(query).then (result)=>
                                if not result or result.length <= 0
                                    query2 =
                                        where:
                                            brand_id: brand_id 
                                    @vehicle.findAll(query2).then (result)=>
                                        ### console.log "fetchFirstItem first", result ###
                                        resolve result
                                else
                                    ### console.log "fetchFirstItem", result ###
                                    resolve result
                        else
                            resolve fetchedTrims
                else
                    resolve result
            .catch (error) =>
                resolve []

    ###
    # Function to get closest vehicles in vehicles
    # @param model_id number
    # @param trim number
    # @return vehicle
    ###

    fetchClosestTrims:(model_id,trim)=>
        return new Promise (resolve,reject) =>
            if trim == null
                trim = ""
            trimVal = trim.replace(/[_$@.-]/g, ' ')
            trimVal = trimVal.split " "
            filterTrims = trimVal
            found = false
            fetchTrim=(pos) ->
                if trimVal.length == pos
                    resolve Promise.all([])
                item = trimVal[pos]
                if !found
                    filterTrims = _.without(filterTrims, item);
                    query=
                        where:
                            model_id: model_id,
                            trim: generateSequelizeOp 'like', '%' + item + '%'
                    @vehicle=@wagner.get('Vehicles')
                    @vehicle.findAll(query).then (result)=>
                        if not result or result.length <= 0
                            found = false
                            fetchTrim(pos+1)
                        else
                            if result.length == 1
                                resolve result
                            else
                                filteredTrims = []
                                found = true
                                _.map filterTrims, (filterTrim) =>
                                    filteredTrims = _.filter result, (val) =>
                                        if val.trim.includes(filterTrim)
                                            return val
                                    if filteredTrims.length != 0
                                            result = filteredTrims 
                                resolve result
            fetchTrim(0)

    ###
    # Function to get new vehicles ids which are not existing in db
    # @param ids Array<number>
    # @return ids Array<number>
    ###

    fetchNewVehicleIds:(ids)=>
        return new Promise (resolve, reject) =>
            query=
                where:
                    id: generateSequelizeOp 'in', ids
            @vehicle.findAll(query).then (result)=>
                alreadyExistsIds = _.pluck result,'id'
                # find values which are not preset and then bulk insert
                newIds = _.filter ids, (id) -> 
                    return id not in alreadyExistsIds
                    
                resolve newIds
            .catch (error) =>
                resolve []

    upsertVehicle:(options)=>
        return new Promise (resolve, reject) =>
            # fetch if id already present
            ids = _.pluck options,'id'
            query=
                where:
                    id: generateSequelizeOp 'in', ids
            # make the actual query
            @vehicle.findAll(query).then (result)=>
                alreadyExistsIds = _.pluck result,'id'
                # find values which are not preset and then bulk insert
                newCars = _.map options, (item) -> 
                    if item.id not in alreadyExistsIds
                        item = _.extend item, {is_new: 1}
                        wagner.get('ZapierManager').notifyNewVehicleAdded(item.id).then () =>
                            callback(null)
                        .catch (err)=>
                            Raven.captureException err
                            callback(err)
                    return item
                    
                if newCars.length > 0
                    @vehicle.bulkCreate(newCars, { 
                        individualHooks: false,
                        ignoreDuplicates: true,
                        updateOnDuplicate: ['trim', 'model_no', 'updated_at'] 
                    }).then (vehicle) =>
                        resolve true
                    .catch (error)=>
                        reject(error)
                else
                    resolve true
            .catch (error)=>
                reject(error)

    upsertVehicleRebates:(rebates,vehiclesId)=>
        return new Promise (resolve, reject) =>
            options = new Array
            _.each rebates,(rebate)=>
                insert_data =
                    vehicle_id: vehiclesId
                    rebate_id: rebate.id
                options.push insert_data
            @vehicleRebate.bulkCreate(options, { individualHooks: false, ignoreDuplicates: true }).then (vehicleRebates) =>
                resolve true
            .catch (error)=>
                reject error

    upsertVehicleOptions:(vehicleId, options)=>
        return new Promise (resolve, reject) =>
            length = options.length
            if length
                _.each options,(option)=>
                    if option.optionKindId == 68 || option.optionKindId == 72
                        length--
                        return
                    payload=
                        where:
                            vehicle_id: vehicleId
                            chrome_option_code: option.chromeOptionCode
                        defaults:
                            vehicle_id: vehicleId
                            chrome_option_code: option.chromeOptionCode
                            oem_option_code: option.oemOptionCode
                            header_id: option.headerId
                            header_name: option.headerName
                            consumer_friendly_header_id: option.consumerFriendlyHeaderId
                            consumer_friendly_header_name: option.consumerFriendlyHeaderName
                            option_kind_id: option.optionKindId
                            description: JSON.stringify(option.descriptions)
                            msrp: option.msrp
                            invoice: option.invoice
                            front_weight: option.frontWeight
                            rear_weight: option.rearWeight
                            price_state: option.priceState
                            affecting_option_code: option.affectingOptionCode
                            categories: JSON.stringify(option.affectingOptionCode)
                            special_equipment: option.specialEquipment
                            extended_equipment: option.extendedEquipment
                            custom_equipment: option.customEquipment
                            option_package: option.optionPackage
                            option_package_content_only: option.optionPackageContentOnly
                            discontinued: option.discontinued
                            option_family_code: option.optionFamilyCode
                            option_family_name: option.optionFamilyName
                            selection_state: option.selectionState
                            unique_type_filter: option.uniqueTypeFilter

                    @VehicleOptions.findOrCreate(payload).then (vehicleOptions, created) =>
                        length--
                        if length == 0
                            resolve 'completed'
                    .catch (error)=>
                        length--
                        if length == 0
                            resolve 'completed'
            else
                resolve 'completed'

    fetchAll:(id)=>
        return new Promise (resolve, reject) =>
            @vehicle.findAll({ where: { id : generateSequelizeOp('gte', id)} }).then (vehicles)=>
                resolve vehicles
            .catch (error)=>
                reject error
    
    fetchByMinPrice:()=>
        return new Promise (resolve,reject) =>
            query=
                    group: [
                        'model_id',
                    ]
                    # where:
                    #     price:{ $first: "$price" }
            @vehicle.findAll(query).then (vehicles)=>
                resolve vehicles
            .catch (error)=>
                reject error

    fetchAllNullPrice:(price)=>
        return new Promise (resolve, reject) =>
            @vehicle.findAll({ where: { price : generateSequelizeOp('eq', price)} }).then (vehicles)=>
                resolve vehicles
            .catch (error)=>
                reject error
    
    fetchAllByYear:(id, year)=>
        return new Promise (resolve, reject) =>
            options = 
                where:
                    id: generateSequelizeOp 'gte', id
                    year: year
            @vehicle.findAll(options).then (vehicles)=>
                resolve vehicles
            .catch (error)=>
                reject error

    fetchAllInventory:()=>
        return new Promise (resolve, reject) =>
            @vehicleInventory.findAll().then (inventory)=>
                resolve inventory
            .catch (error)=>
                reject error

    update:(options)=>
        return new Promise (resolve, reject) =>
            @vehicle.update(options, {returning: true, where: {id: options.id} }).then (result) =>
                resolve result
            .catch (error)=>
                reject error

    findById:(vehicleId)=>
        return new Promise (resolve, reject) =>
            @vehicle.findByPk(vehicleId).then (vehicle)=>
                resolve vehicle
            .catch (error)=>
                reject error

    findByIds:(vehicleIds)=>
        return new Promise (resolve, reject) =>
            query=
                where:
                    id: generateSequelizeOp 'in', vehicleIds
                include:[
                    {
                        model: @wagner.get('Brands')
                    }
                    {
                        model: @wagner.get('Models')
                    }
                ]
            @vehicle.findAll(query).then (result)=>
                resolve result
            .catch (error)=>
                reject error

    findFullInfoById: (vehicleId) =>
        return new Promise (resolve, reject) =>
            query=
                where:
                    id: vehicleId
                include:[
                    {
                        model: @wagner.get('Brands')
                    }
                    {
                        model: @wagner.get('Models')
                    }
                ]
            @vehicle.findOne(query).then (vehicle)=>
                resolve vehicle
            .catch (error)=>
                reject error


    getFullVehicleList: () =>
        return new Promise (resolve, reject) =>
            query=
                include:[
                    {
                        model: @wagner.get('Brands')
                    }
                    {
                        model: @wagner.get('Models')
                    }
                ]
            @vehicle.findAll(query).then (vehicle)=>
                resolve vehicle
            .catch (error)=>
                reject error

    findOrCreateVehicleColour:(vehicleId, colorList)=>
        return new Promise (resolve, reject) =>
            length = colorList.length
            _.each colorList,(color)=>
                payload=
                    where:
                        vehicle_id: vehicleId
                        oem_option_code: color.oem_option_code
                    defaults:
                        vehicle_id: vehicleId
                        color: color.color
                        simple_color: color.simple_color
                        oem_option_code: color.oem_option_code
                        color_hex_code: color.color_hex_code
                        msrp: color.msrp
                        invoice: color.invoice

                @vehicleColors.findOrCreate(payload).then (vehicleColors, created) =>
                    length--
                    if length == 0
                        resolve 'completed'
                .catch (error)=>
                    length--
                    if length == 0
                        resolve 'completed'

    findOrCreateInteriorColour:(vehicleId, colorList)=>
        return new Promise (resolve, reject) =>
            length = colorList.length
            if length
                _.each colorList,(color)=>
                    payload=
                        where:
                            vehicle_id: vehicleId
                            oem_option_code: color.oem_option_code
                        defaults:
                            vehicle_id: vehicleId
                            color: color.color
                            simple_color: color.simple_color
                            oem_option_code: color.oem_option_code
                            color_hex_code: color.color_hex_code
                            msrp: color.msrp
                            invoice: color.invoice

                    @interiorColors.findOrCreate(payload).then (interiorColors, created) =>
                        length--
                        if length == 0
                            resolve 'completed'
                    .catch (error)=>
                        length--
                        if length == 0
                            resolve 'completed'
            else
                resolve 'completed'

    fetchRebatesByVehicleId:(vehicleId)=>
        return new Promise (resolve, reject) =>
            query=
                where:
                    id:vehicleId
                include:[
                    {
                        model: @wagner.get('Rebates')
                    }
                ]
            @vehicle.findOne(query).then (result)=>
                resolve result
            .catch (error)=>
                reject(error)

    create:(options)=>
        return new Promise (resolve, reject) =>
            @vehicle.create(options).then (result)=>
                resolve result
            .catch (error)=>
                reject(error)

    delete:(options)=>
        return new Promise (resolve, reject) =>
            query=
                where:
                    id:options.id
            @vehicle.destroy(query).then (result)=>
                resolve result
            .catch (error)=>
                reject(error)

    findOrCreate:(options)=>
        return new Promise (resolve, reject) =>
            payload=
                where:options
                defaults:options
            @vehicle.findOrCreate(payload).then (model, created) =>
                resolve model[0]
            .catch (error)=>
                reject error

    searchResults:(options,color_codes,year,offset,limit)=>
        new Promise (resolve, reject) =>
            rad = zipcodes.radius(options.zip, config.google.radius)
            updated_time = moment.utc().subtract(28,"hours").format("YYYY-MM-DD HH:mm:ss")
            query=
                offset: offset
                limit:limit
                where:
                    model_id: generateSequelizeOp 'or', options.models
                include:[
                    {
                        model: @wagner.get('Brands')
                    }
                    {
                        model: @wagner.get('Models')
                    }
                    {
                        model: @wagner.get('Dealers')
                        where:
                            zip: generateSequelizeOp 'in', rad
                    }
                ]
                order:[
                  ['msrp','asc']
                ]
            if options.min_price and options.max_price
                if options.max_price == "100000"
                    query.where.msrp = generateSequelizeOp 'gt', options.min_price
                else
                    query.where.msrp = generateSequelizeOp('between', [
                        options.min_price
                        options.max_price
                    ])
            else
                query.where.msrp= generateSequelizeOp 'gt', 0
            if options.user_id
                query.include.push
                    model: @wagner.get('Favorites')
                    where: user_id: options.user_id
                    required: false
                query.include.push
                    model: @wagner.get('UserInventoryLease')
                    where: user_id: options.user_id
                    required: false
            if year.length
                query.where.year = generateSequelizeOp 'in', year
            if color_codes.length
                query.include.push
                  model: @wagner.get('VehicleColors')
                  where: simple_color: generateSequelizeOp 'in', color_codes
                  include: [ { model: @wagner.get('VehicleColorsMedia') } ]
            else
                query.include.push
                  model: @wagner.get('VehicleColors')
                  include: [ { model: @wagner.get('VehicleColorsMedia') } ]
            @vehicleInventory.findAll(query).then (result)=>
                resolve result
            .catch (error)=>
                reject(error)

    inventorySearch:(options,year,offset,limit)=>
        new Promise (resolve, reject) =>
            rad = zipcodes.radius(options.zip, config.google.radius)
            updated_time = moment.utc().subtract(28,"hours").format("YYYY-MM-DD HH:mm:ss")
            async.map options.models, ((model, callback) =>
                query=
                    offset: offset
                    limit:limit
                    group: [
                        'VehicleInventory.brand_id',
                        'VehicleInventory.model_id',
                        'VehicleInventory.trim'
                        'VehicleInventory.year'
                        'VehicleInventory.msrp',
                        'VehicleInventory.exterior_color',
                        'VehicleInventory.interior_color',
                    ]
                    where:
                        model_id: model.id
                        sold: options.sold
                    include:[
                        {
                            model: @wagner.get('Brands')
                        }
                        {
                            model: @wagner.get('Models')
                        }
                        {
                            model: @wagner.get('Dealers')
                            where:
                                zip: generateSequelizeOp 'in', rad
                        }
                    ]
                    order:[
                      ['msrp','asc']
                    ]
                if model.color_codes.length > 0
                    query.include.push
                        model: @wagner.get('VehicleColors')
                        where:
                            simple_color: generateSequelizeOp 'in', model.color_codes
                        include:[
                            {
                                model: @wagner.get('VehicleColorsMedia')
                            }
                        ]
                else
                    query.include.push
                        model: @wagner.get('VehicleColors')
                        required: true
                        include:[
                            {
                                model: @wagner.get('VehicleColorsMedia')
                            }
                        ]
                if options.min_price and options.max_price
                    if options.max_price == "100000"
                        query.where.msrp = generateSequelizeOp 'gt', options.min_price
                    else
                        query.where.msrp = generateSequelizeOp('between', [
                            options.min_price
                            options.max_price
                        ])
                else
                    query.where.msrp = generateSequelizeOp 'gt', 0
                if options.user_id
                    query.include.push
                        model: @wagner.get('Favorites')
                        where:
                            user_id: options.user_id
                            favorite: 1
                        required: false
                    query.include.push
                        model: @wagner.get('UserInventoryLease')
                        where: user_id: options.user_id
                        required: false
                    query.include.push
                        model: @wagner.get('VehicleOffers')
                        where:
                            user_id: options.user_id
                            is_deleted: 0
                            status: 0
                        order: [ [ 'last_offer_made_at', 'DESC' ]]
                        required: false
                if year.length
                    query.where.year = generateSequelizeOp 'in', year
                else
                    query.where.year = generateSequelizeOp 'gte', moment().year()
                @wagner.get('VehicleInventory').findAll(query).then (result)=>
                    if result.length
                        callback(null,result)
                    else
                        callback null
                .catch (error)=>
                    console.log('vehicle error : ' + error.stack)
                    callback error
            ), (error, results) =>
                results = _.without(results, null, undefined)
                results = _.flatten(results)
                results = _.reject results, (result)=>
                    if !result.Favorites and !result.VehicleOffers
                        return false
                    return (result.Favorites and result.Favorites.length) or (result.VehicleOffers and result.VehicleOffers.length)
                resolve results

    applySearchFilters:(options)=>
        return new Promise (resolve, reject) =>
            query =
                include:[
                    {
                        model: @wagner.get('Brands')
                    }
                    {
                        model: @wagner.get('Models')
                    }
                ]
            if options.year
                years = options.year.split(',')
                query.where =
                    year: generateSequelizeOp 'in', years
            if options.min_price and options.max_price
                if query.where
                    query.where.msrp = generateSequelizeOp('between', [
                        options.min_price
                        options.max_price
                    ])
                else
                    query.where =
                        msrp: generateSequelizeOp('between', [
                            options.min_price
                            options.max_price
                        ])
            @vehicleInventory.findAll(query).then (vehicles)=>
                resolve vehicles
            .catch (error)=>
                reject error

    getPrimaryVehicleColor:(vehicleId)=>
        return new Promise (resolve, reject) =>
            wagner.get('ChromeDataManager').fetchPrimaryVehicleColor(vehicleId).then (color) =>
                resolve color
            .catch (error) =>
                reject error

    getPrimaryVehicleMedia:(vehicle_color_id)=>
        return new Promise (resolve, reject) =>
            query=
                where:
                    vehicle_color_id: vehicle_color_id
                    shot_code: 1
            @VehicleMedia.findOne(query).then (result)=>
                if (result)
                    resolve result
                else 
                    resolve null
            .catch (error)=>
                reject error
    
    getPrimaryVehicleMediaInternal:(vehicle_id, vehicle_color)=>
        return new Promise (resolve, reject) =>
            query=
                where:
                    vehicle_id: vehicle_id
                    primary_color_option_code: vehicle_color.oem_option_code
                    width: config.image_resolution
                    shot_code: 1
            @vehicleMedia.findOne(query).then (result)=>
                if (result)
                    resolve result
                else 
                    resolve null
            .catch (error)=>
                reject error

    getPrimaryVehicleMediaAllResolutions:(vehicle_id, vehicle_color)=>
        return new Promise (resolve, reject) =>
            query=
                where:
                    vehicle_id: vehicle_id
                    primary_color_option_code: vehicle_color.oem_option_code
                    shot_code: 1
            @vehicleMedia.findAll(query).then (result)=>
                if (result)
                    resolve result
                else
                    resolve null
            .catch (error)=>
                reject error

    getVehicleColors:(vehicleId)=>
        return new Promise (resolve, reject) =>
            query=
                where:
                    vehicle_id:vehicleId
            @vehicleColors.findAll(query).then (vehicle_colors)=>
                resolve vehicle_colors
            .catch (error)=>
                reject error

    getVehicleColor:(options)=>
        return new Promise (resolve, reject) =>
            @vehicle.findByPk(options.vehicle_id).then (vehicle) =>
                query =
                    where:
                        color: options.color
                    include: [{
                        model: @wagner.get('Vehicles')
                        where:
                            model_id: vehicle.model_id
                            year: vehicle.year
                            trim: vehicle.trim
                    }]

                @vehicleColors.findOne(query).then (vehicleColor)=>
                    if vehicleColor
                        resolve vehicleColor
                    else
                        reject 'VehicleColor does not exist for color: ' + options.color
                .catch (error)=>
                    reject error

    getExteriorColors: (colorIds) =>
      return new Promise (resolve, reject) =>
        query =
            where:
                id: colorIds
        @vehicleColors.findAll(query).then (exteriorColors) =>
            resolve exteriorColors
        .catch (error)=>
            reject error

    getInteriorColors: (colorIds) =>
      return new Promise (resolve, reject) =>
        query =
            where:
                id: colorIds
        @interiorColors.findAll(query).then (interiorColors) =>
            resolve interiorColors
        .catch (error)=>
            reject error

    updateVehicleColorMedias:(options, vehicleColors)=>
        return new Promise (resolve, reject) =>
            async.eachSeries options, ((vehicleColorMedia, callback) ->
                if vehicleColorMedia.oem_code of vehicleColors
                    vehicleColor =  vehicleColors[vehicleColorMedia.oem_code]
                    query =
                        where:
                            vehicle_color_id: vehicleColor.id
                            shot_code: vehicleColorMedia.shot_code
                        defaults:
                            vehicle_color_id: vehicleColor.id
                            url_2100: vehicleColorMedia.url_2100
                            url_1280: vehicleColorMedia.url_1280
                            url_640: vehicleColorMedia.url_640
                            url_320: vehicleColorMedia.url_320
                            shot_code: vehicleColorMedia.shot_code
                            type: vehicleColorMedia.type


                    @wagner.get('VehicleColorsMedia').findOrCreate(query).then (vehicleObject, created)=>
                        callback null, vehicleObject[0]
                    .catch (error)=>
                        reject error
                else
                    callback null, null
            ),(error, results)=>
                if error?
                    reject error
                else
                    resolve results

    getAllVehicleOptions:() =>
      preferences = [{
        id: 1,
        label: 'Adaptive cruise control',
        keywords: ['adaptive cruise control']
      }, {
        id: 2,
        label: 'Apple carplay/Android auto',
        keywords: ['apple carplay']
      }, {
        id: 3,
        label: 'Keyless Start',
        keywords: ['keyless']
      }, {
        id: 4,
        label: 'Leather seats',
        keywords: ['leather seats']
      }, {
        id: 5,
        label: 'Sunroof/Moonroof',
        keywords: ['moonroof']
      }]

    getAllVehicleOptionsWithTitle:() =>
      preferences = [
        {
          id: 1,
          label: 'Navigation',
          category: 'Convenience',
          keywords: ['Navigation', 'system']
        }, {
          id: 2,
          label: 'Keyless Entry',
          category: 'Convenience',
          keywords: ['keyless', 'entry', 'start']
        }, {
          id: 3,
          label: 'Apple carplay/Android auto',
          category: 'Entertainment',
          keywords: ['apple', 'android', 'auto']
        }, {
          id: 4,
          label: 'Speed-sensing steering',
          category: 'Performance',
          keywords: ['speed', 'sensing']
        }, {
          id: 5,
          label: 'Adaptive cruise control',
          category: 'Performance',
          keywords: ['adaptive', 'cruise', 'control']
        }, {
          id: 6,
          label: 'All wheel Drive',
          category: 'Performance',
          keywords: ['all', 'wheel', 'drive']
        }, {
          id: 7,
          label: 'Back-up camera',
          category: 'Safety',
          keywords: ['back', 'up', 'camera']
        }, {
          id: 8,
          label: 'Blind Spot Monitor',
          category: 'Safety',
          keywords: ['blind', 'spot', 'monitor']
        }
      ]

    getStartingVehiclePriceByModel: (model_id) =>
        return new Promise (resolve, reject) =>
            query=
                order:[
                    ['price', 'ASC']
                ]
                where:
                    model_id: model_id
                    price: generateSequelizeOp 'gt', 0

            @vehicle.findOne(query).then (result)=>
                if result
                    resolve result.price
                else
                    resolve null
            .catch (error)=>
                reject(error)

    fetchPrimaryVehicleByModel: (model_id) =>
        return new Promise (resolve, reject) =>
            query=
                order:['Vehicles.id']
                where:
                    model_id: model_id
                    image_url_320: generateSequelizeOp 'ne', config.image_placeholder

            @vehicle.findAll(query).then (results)=>
                if results
                    resolve results[0]
                else
                    resolve null
            .catch (error)=>
                reject(error)

    fetchVehicleByModels:(payload)=>
        return new Promise (resolve, reject) =>
            if !payload.models and !payload.models.length
                return reject(new Error('No models specified'))

            min_price = parseInt(payload.min_price)
            max_price = parseInt(payload.max_price)

            if min_price or max_price
                where = generateSequelizeOp('and', [
                    { price: generateSequelizeOp 'gte', min_price }
                    { price: generateSequelizeOp 'lte', max_price }
                ])
                where.model_id = generateSequelizeOp 'in', payload.models
                where.is_active = true
                where.is_enable = 1
                query =
                    order: ['trim', 'id']
                    where: where
            else
                query =
                    order: ['trim', 'id']
                    where:
                        model_id: generateSequelizeOp 'in', payload.models
                        is_active: true
                        is_enable:1

            @vehicle.findAll(query).then (results)=>
                resolve results
            .catch (error)=>
                reject(error)

    fetchVehicleColorsByTrim:(payload)=>
        return new Promise (resolve, reject) =>
            if payload.vehicles.length
                query=
                    where:
                        id: generateSequelizeOp 'in', payload.vehicles
                    include: [
                        {
                            model: @wagner.get('VehicleColors')
                            include: [
                                { model: @wagner.get('VehicleColorsMedia') }
                            ]
                        }
                    ]
                @vehicle.findAll(query).then (result)=>
                    colors = __.map result,(x) => x.VehicleColors
                    unqiueColors = __.uniqBy colors, 'oem_option_code'
                    unqiueColors = __.flatten unqiueColors
                    colorsWithIds = __.map unqiueColors, (x) =>
                        color = x.toJSON();
                        color.priority = constants.COLORS_PRIORITY_MAP[color.simple_color] or constants.LOWEST_COLOR_PRIORITY
                        return color

                    resolve colorsWithIds
                .catch (error)=>
                    reject(error)
            else
                resolve []
    
    fetchInteriorVehicleColorsByTrim: (payload) =>
        return new Promise (resolve, reject) =>
            if payload.vehicles.length
                query=
                    where:
                        id: generateSequelizeOp 'in', payload.vehicles
                    include:[
                        {
                            model: @wagner.get('InteriorColors')
                        }
                    ]
                @vehicle.findAll(query).then (result)=>
                    colors = __.map result,(x) => x.InteriorColors
                    unqiueColors = __.uniqBy colors, 'oem_option_code'
                    unqiueColors = __.flatten unqiueColors
                    colorsWithIds = __.map unqiueColors, (x) =>
                        color = x.toJSON();
                        color.priority = constants.COLORS_PRIORITY_MAP[color.simple_color] or constants.LOWEST_COLOR_PRIORITY
                        return color

                    resolve colorsWithIds
                .catch (error)=>
                    reject(error)
            else
                resolve []

    fetchVehicleDetailsByTrim:(payload)=>
        return new Promise (resolve, reject) =>
            if payload.vehicles.length
                style_id = payload.vehicles[0]
                wagner.get('ChromeDataManager').fetchStyleConfiguration(style_id).then (result) =>
                    if result
                        resolve ChromeDataHelpers.formatConfiguration(result.configuration)
                    else
                        resolve []
                .catch (error) =>
                    reject error
            else
                resolve []

    fetchColorOptionsById: (payload)=>
        return new Promise (resolve, reject) =>
            if payload.configuration_state_id
                wagner.get('ChromeDataManager').fetchConfigurationById(payload.configuration_state_id).then (result) =>
                    style_id = result.configuration.style.styleId
                    if result
                        resolve @fomratColorResponse(style_id, result)
                    else
                        resolve []

                .catch (error) =>
                    reject error
            else
                resolve []

    fetchConfigurationById: (payload)=>
        return new Promise (resolve, reject) =>
            if payload.configuration_state_id
                wagner.get('ChromeDataManager').fetchConfigurationById(payload.configuration_state_id).then (result) =>
                    style_id = result.configuration.style.styleId
                    @fetchVehicleMedias(style_id).then (medias) =>
                        if result
                            resolve @formatConfigurationResponse(style_id, result, medias)
                        else
                            resolve []
                    .catch (error) =>
                        reject error
                .catch (error) =>
                    reject error
            else
                resolve []
    
    fetchDefaultConfigurationByStyleId:(payload)=>
        return new Promise (resolve, reject) =>
            if payload.vehicles.length
                style_id = payload.vehicles[0]
                wagner.get('ChromeDataManager').fetchConfigurationByOptions(payload).then (result) =>
                    # wagner.get('ChromeDataManager').fetchVehicleMedias(style_id).then (medias) =>
                    @fetchVehicleMedias(style_id).then (medias) =>
                        if result
                            resolve @formatConfigurationResponse(style_id, result, medias)
                        else
                            resolve []
                    .catch (error) =>
                        reject error
                .catch (error) =>
                    reject error
            else
                resolve []
    
    fetchConfigurationByOptions:(payload)=>
        return new Promise (resolve, reject) =>
            if payload.vehicles.length
                style_id = payload.vehicles[0]
                wagner.get('ChromeDataManager').fetchConfigurationByOptions(payload).then (result) =>
                    if result
                        resolve @formatConfigurationResponse(style_id, result)
                    else
                        resolve []
                .catch (error) =>
                    reject error
            else
                resolve []

    fetchConfigurationByOptionsRecursive: (payload) =>
        return new Promise (resolve, reject) =>
            if payload.vehicles.length
                style_id = payload.vehicles[0]
                wagner.get('ChromeDataManager').fetchConfigurationByOptions(payload).then (result) =>
                    if result
                        response =  @formatConfigurationResponse(style_id, result)
                        if response.general.requiresToggleToResolve
                            newPayload = 
                                vehicles: payload.vehicles
                                configuration_state_id: response.style.configurationState.serializedValue
                                option: response.general.conflictResolvingChromeOptionCodes[0]
                            @fetchConfigurationByOptionsRecursive(newPayload).then (newResponse) =>
                                resolve newResponse
                            .catch (error) =>
                                reject error
                        else
                            resolve response
                    else
                        resolve []
                .catch (error) =>
                    reject error
            else
                resolve []


    #### V1 functions ###

    ###
    # get initial configuration by style id
    # @param
    # @return
    ###

    fetchInitialConfigurationByStyleId:(style_id)=>
        return new Promise (resolve, reject) =>
            if style_id
                wagner.get('ChromeDataManager').fetchDefaultConfigurationByStyleId(style_id).then (configuration) =>
                    @formatConfigurationResponseV1(style_id, configuration).then (result) =>
                        resolve result
                    .catch (error) =>
                        reject error
                .catch (error) =>
                    reject error
            else
                resolve []

    ###
    # toggle configration by option
    # @param payload object
    # @return configuration array
    ###

    toggleConfigurationByOption: (payload, recursive = false) =>
        return new Promise (resolve, reject) =>
            if payload.vehicle_id
                style_id = payload.vehicle_id
                user_selection = payload.user_selection
                option = payload.option

                wagner.get('ChromeDataManager').toggleByOptions(payload).then (configuration) =>
                    conflictArr = ChromeDataHelpers.hasConflictBetweenUserSelectAndNewOptions(user_selection, configuration.configuration.options)
                    @formatConfigurationResponseV1(style_id, configuration, user_selection, conflictArr, option, recursive).then (result) =>
                        if !conflictArr.length && result.general.requiresToggleToResolve
                            user_selection = result.user_selection
                            newPayload = 
                                vehicle_id: payload.vehicle_id
                                configuration_state_id: result.configuredResult.configurationStateId
                                option: result.general.conflictResolvingChromeOptionCodes[0]
                                user_selection: user_selection
                            @toggleConfigurationByOption(newPayload, true).then (newResponse) =>
                                resolve newResponse
                            .catch (error) =>
                                reject error
                        else
                            resolve result
                    .catch (error) =>
                        reject error
                .catch (error) =>
                    reject error
            else
                resolve []


    ###
    # format configuration response v1
    # @param payload object
    # @return configuration array
    ###

    formatConfigurationResponseV1: (style_id, result, userSelection = {}, conflicts = [], option = null, recursive = false) ->
        return new Promise (resolve, reject) =>
            @fetchVehicleMedias(style_id).then (medias) =>
                
                style = result.configuration.style
                general = 
                    status: result.status
                    originatingChromeOptionCode: result.originatingChromeOptionCode
                    originatingOptionAnAddition: result.originatingOptionAnAddition
                    conflictResolvingChromeOptionCodes: result.conflictResolvingChromeOptionCodes
                    requiresToggleToResolve: result.requiresToggleToResolve
                
                configuredResult = 
                    configuredOptionsMsrp: result.configuration.configuredOptionsMsrp
                    configuredOptionsInvoice: result.configuration.configuredOptionsInvoice
                    configuredCustomEquipmentMsrp: result.configuration.configuredCustomEquipmentMsrp
                    configuredCustomEquipmentInvoice: result.configuration.configuredCustomEquipmentInvoice
                    advertisingAndAdjustmentsMsrp: result.configuration.advertisingAndAdjustmentsMsrp
                    advertisingAndAdjustmentsInvoice: result.configuration.advertisingAndAdjustmentsInvoice
                    configuredTotalMsrp: result.configuration.configuredTotalMsrp
                    configuredTotalInvoice: result.configuration.configuredTotalInvoice
                    configuredPriceState: result.configuration.configuredPriceState
                    configuredCheckList: ChromeDataHelpers.formatCheckList result.configuration.configurationCheckListItems
                    configurationStateId: style.configurationState.serializedValue

                options = result.configuration.options
                if not recursive
                    new_user_selection = ChromeDataHelpers.updateUserSelection(options, userSelection, option)
                else
                    new_user_selection = _.clone userSelection
                    
                interior_colors = ChromeDataHelpers.formatColorsV1(style_id, options, 'interior', new_user_selection['interior_color'])
                exterior_colors = ChromeDataHelpers.formatColorsV1(style_id, options, 'exterior', new_user_selection['exterior_color'])
                options_needed = ChromeDataHelpers.formatOptionsV1(options)
                vehicle_media = ChromeDataHelpers.formatVehicleMediaV1(medias, exterior_colors, new_user_selection['exterior_color'])

                response = 
                    general: general
                    user_selection: new_user_selection
                    user_conflicts: conflicts
                    configuredResult: configuredResult
                    style: style
                    vehicle_data: ChromeDataHelpers.formatConfiguration(result.configuration)
                    vehicle_media: vehicle_media
                    exterior_colors: exterior_colors
                    interior_colors: interior_colors
                    wheels: options_needed.wheel
                    options: options_needed.option_packages

                resolve response
            .catch (error) =>
                reject error
    
    fomratColorResponse: (style_id, result) => 
        options = result.configuration.options
        interior_colors = ChromeDataHelpers.formatColors(style_id, options, 'interior')
        exterior_colors = ChromeDataHelpers.formatColors(style_id, options, 'exterior')

        response = 
            exterior_colors: exterior_colors
            interior_colors: interior_colors
        return response

    formatConfigurationResponse: (style_id, result, medias = null) =>
        general = 
            status: result.status
            originatingChromeOptionCode: result.originatingChromeOptionCode
            originatingOptionAnAddition: result.originatingOptionAnAddition
            conflictResolvingChromeOptionCodes: result.conflictResolvingChromeOptionCodes
            requiresToggleToResolve: result.requiresToggleToResolve
        configuredResult = 
            configuredOptionsMsrp: result.configuration.configuredOptionsMsrp
            configuredOptionsInvoice: result.configuration.configuredOptionsInvoice
            configuredCustomEquipmentMsrp: result.configuration.configuredCustomEquipmentMsrp
            configuredCustomEquipmentInvoice: result.configuration.configuredCustomEquipmentInvoice
            advertisingAndAdjustmentsMsrp: result.configuration.advertisingAndAdjustmentsMsrp
            advertisingAndAdjustmentsInvoice: result.configuration.advertisingAndAdjustmentsInvoice
            configuredTotalMsrp: result.configuration.configuredTotalMsrp
            configuredTotalInvoice: result.configuration.configuredTotalInvoice
            configuredPriceState: result.configuration.configuredPriceState
        
        style = result.configuration.style
        options = result.configuration.options
        interior_colors = ChromeDataHelpers.formatColors(style_id, options, 'interior')
        exterior_colors = ChromeDataHelpers.formatColors(style_id, options, 'exterior')
        options_needed = ChromeDataHelpers.formatOptions(options)

        if medias && medias.length
            exterior_colors = __.map exterior_colors, (item) => 
                item.VehicleColorsMedia = __.filter medias, (media_item) =>
                    return media_item.oem_code == item.oem_option_code
                return item

        response = 
            general: general
            style: style
            configuredResult: configuredResult
            vehicle_data: ChromeDataHelpers.formatConfiguration(result.configuration)
            options: options_needed
            exterior_colors: exterior_colors
            interior_colors: interior_colors
        return response

    fetchVehicleOptionsByTrim:(payload)=>
        return new Promise (resolve, reject) =>
            if !payload.vehicles || !payload.vehicles.length
                return reject(new Error('No Vehicle specified'));
            style_id = payload.vehicles[0]
            query=
                where:
                    id: style_id
                include:[
                    {
                        model: @wagner.get('VehicleOptions')
                    }
                ]

            @vehicle.findOne(query).then (vehicle)=>
                if vehicle
                    resolve @formatVehicleOptions vehicle.VehicleOptions
                else
                    resolve []
            .catch (error)=>
                reject(error)

    formatVehicleOptions: (options) =>
        _.each options,(option) =>
            option.description = JSON.parse(option.description)

    searchVehicle: (options, pagination) =>
        return new Promise (resolve, reject) =>
            wagner.get('BrandsManager').fetchYears().then (years) =>
                keyword = options.keyword.trim()
                year = options.year
                if keyword.length < 2
                    resolve {
                        rows: []
                        count: 0
                    }

                keyword_list = keyword.split " "
                and_query = _.map keyword_list, (item) =>
                    return sequelize.where(sequelize.fn("concat", ' ', sequelize.col("Model.year"), ' ', sequelize.col("Brand.name"), ' ', sequelize.col("Model.name"), ' ', sequelize.col("trim"), ' '), 
                        generateSequelizeOp('like', '%' + item.trim() + '%'))
                
                offset = parseInt((pagination.page - 1) * pagination.count)
                limit =  parseInt(pagination.count)
            
                where = generateSequelizeOp 'and', and_query
                where.is_active = true
                
                if year
                    where = _.extend where, { year: year }
                else
                    where = _.extend where, { year: generateSequelizeOp 'in', years}
                vehicle_query =
                    order: [
                        [ 'year', 'desc' ],
                        [ 'id', 'asc' ]
                    ]
                    where: where
                    offset: offset
                    limit: limit
                    include:[
                        {
                            model: @wagner.get('Brands')
                            attributes: ['id','name']
                        }
                        {
                            model: @wagner.get('Models')
                            attributes: ['id','name']
                        }
                    ]
                @vehicle.findAndCountAll(vehicle_query).then (result) =>
                    resolve result
                .catch (error) =>
                    reject(error)

    upsertVehicleMedia:(options)=>
        return new Promise (resolve, reject) =>
            payload=
                where:
                    vehicle_id: options.vehicle_id
                    primary_color_option_code: options.primary_color_option_code
                    width: options.width
                    shot_code: options.shot_code
                    background_type: options.background_type
                defaults:
                    vehicle_id: options.vehicle_id
                    url: options.url
                    primary_color_option_code: options.primary_color_option_code
                    secondary_color_option_code: options.secondary_color_option_code
                    primary_rgb: options.primary_rgb
                    secondary_rgb: options.secondary_rgb
                    width: options.width
                    height: options.height
                    shot_code: options.shot_code
                    background_type: options.background_type
                    type: options.type

            @vehicleMedia.findOrCreate(payload).then (result, created) =>
                resolve result[0]
            .catch (error)=>
                reject error
    
    updateVehiceMediaStatus: (vehicle_id, options) =>
        return new Promise (resolve, reject) =>
            options.media_update_at = moment().toISOString()
            @vehicle.update(options, {where: {id: vehicle_id} }).then (result) =>
                resolve true

    
    fetchVehicleMedias: (vehicle_id) =>
        return new Promise (resolve, reject) =>
            query=
                where:
                    vehicle_id: vehicle_id

            @vehicleMedia.findAll(query).then (result)=>
                if result
                    resolve helper.formatInternalMedias(result)
                else
                    resolve []
            .catch (error)=>
                reject(error)
    
    fetchVehiclesWithoutImages: (start_id, year) =>
        return new Promise (resolve, reject) =>
            where = generateSequelizeOp('or', [
                {
                    media_status: generateSequelizeOp 'ne',
                        constants.vechile_scrapping_status['success']
                },
                { media_status: null },
                { image_url_320: config.image_placeholder_320 }
            ])
            _.extend where, {
                id: generateSequelizeOp 'gte', start_id
                year: year
            }
                    
            @vehicle.findAll({ where }).then (vehicles)=>
                resolve vehicles
            .catch (error)=>
                reject error    


    getVehicleImageOptionFromFetch: (vehicle_id) =>
        return new Promise (resolve, reject) =>
            update_options = 
                id: vehicle_id
                image_url_320: config.image_placeholder_320
                image_url_640: config.image_placeholder_640
                image_url_1280: config.image_placeholder_1280
                image_url_2100: config.image_placeholder_2100
            @getPrimaryVehicleColor(vehicle_id).then (vehicle_color)=>
                if vehicle_color
                    @getPrimaryVehicleMediaAllResolutions(vehicle_id, vehicle_color).then (vehicle_media)=>
                        if vehicle_media
                            [media_320] = vehicle_media.filter (media) -> media.width == 320
                            if media_320
                                update_options.image_url_320 = media_320.url
                            [media_640] = vehicle_media.filter (media) -> media.width == 640
                            if media_640
                                update_options.image_url_640 = media_640.url
                            [media_1280] = vehicle_media.filter (media) -> media.width == 1280
                            if media_1280
                                update_options.image_url_1280 = media_1280.url
                            [media_2100] = vehicle_media.filter (media) -> media.width == 2100
                            if media_2100
                                update_options.image_url_2100 = media_2100.url
                        else
                            console.log 'PrimaryVehicleMedia is not availalble'
                        resolve update_options
                    .catch (error)=>
                        reject error
                else
                    console.log 'PrimaryVehicleColor is not availalble'
                    resolve update_options
            .catch (error)=>
                reject error

    updateVehicleImages: (vehicle_id) =>
        return new Promise (resolve, reject) =>
            update_options = 
                id: vehicle_id
                image_url_320: config.image_placeholder_320
                image_url_640: config.image_placeholder_640
                image_url_1280: config.image_placeholder_1280
                image_url_2100: config.image_placeholder_2100

            @getPrimaryVehicleColor(vehicle_id).then (vehicle_color)=>
                if vehicle_color
                    @getPrimaryVehicleMediaAllResolutions(vehicle_id, vehicle_color).then (vehicle_media)=>
                        if vehicle_media
                            [media_320] = vehicle_media.filter (media) -> media.width == 320
                            if media_320
                                update_options.image_url_320 = media_320.url
                            [media_640] = vehicle_media.filter (media) -> media.width == 640
                            if media_640
                                update_options.image_url_640 = media_640.url
                            [media_1280] = vehicle_media.filter (media) -> media.width == 1280
                            if media_1280
                                update_options.image_url_1280 = media_1280.url
                            [media_2100] = vehicle_media.filter (media) -> media.width == 2100
                            if media_2100
                                update_options.image_url_2100 = media_2100.url
                        else
                            console.log 'PrimaryVehicleMedia is not availalble'
                        @update(update_options).then (result)=>
                            resolve result
                        .catch (error)=>
                            reject error
                    .catch (error)=>
                        reject error
                else
                    console.log 'PrimaryVehicleColor is not availalble'
                    @update(update_options).then (result)=>
                        resolve result
                    .catch (error)=>
                        reject error
            .catch (error)=>
                reject error
        .catch (error)=>
            reject error     
        
    search:(options)=>
        return new Promise (resolve, reject) =>
            query=
                where:options
            @vehicle.findOne(query).then (result)=>
                resolve result
            .catch (error)=>
                reject(error)

    getVehicleIdByModelId:(modelId,trim)=>
        return new Promise (resolve,reject) =>
            query =
                where:
                    model_id: modelId
                    trim: trim
            @vehicle.findOne(query).then (vehicle) =>
                if vehicle
                    resolve vehicle
                else
                    reject 'Vehicle doesnot exist'
            .catch (error) =>
                reject error

    todayAddedVehiclesCount:()=>
        return new Promise (resolve, reject) =>
            todayDate = new Date()
            tomorrowDate = new Date(todayDate.setDate(todayDate.getDate()+1)).toISOString().slice(0,10)
            yesterdayDate = new Date(todayDate.setDate(todayDate.getDate()-1)).toISOString().slice(0,10)
            
            query =
                where:
                    created_at : generateSequelizeOp 'between', [yesterdayDate, tomorrowDate]

            @vehicle.count(query).then (result)=>
                resolve result
            .catch (error)=>
                reject(error)

module.exports = VehicleManager
