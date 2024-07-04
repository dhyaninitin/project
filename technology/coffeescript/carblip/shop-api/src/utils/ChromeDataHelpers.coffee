config = require('../config')
AWS = require('aws-sdk')
moment = require('moment-timezone')
Promise = require('bluebird')
async = require 'async'
request = require('request')
_ = require 'underscore'
__ = require 'lodash'
constants = require('../core/constants');

formatBrands = (brands) ->
    return _.map brands, (item) =>
        return { 
            id: item.divisionId
            name: item.divisionName
            image_url: constants.brand_img_list[item.divisionName.toLowerCase()]
        }

formatModels = (models) ->
    return _.map models, (item) =>
        return {
            year: item.modelYear
            brand_id: item.divisionId
            sub_brand_id: item.subdivisionId
            id: item.modelId
            name: item.modelName
            data_release_date: item.dataReleaseDate
            initial_price_date: item.initialPriceDate
            data_effective_date: item.dataEffectiveDate
            comment: item.dataComment
        }

formatStyle = (style) ->
    return {
        id: style.styleId
        brand_id: style.model.divisionId
        model_id: style.model.modelId
        model_no: style.manufacturerModelCode
        trim: style.styleName
        friendly_model_name: style.consumerFriendlyModelName
        friendly_style_name: style.consumerFriendlyStyleName
        friendly_drivetrain: style.consumerFriendlyDrivetrain
        friendly_body_type: style.consumerFriendlyBodyType
        price: style.baseMsrp
        base_invoice: style.baseInvoice
        destination: style.destination
        year: style.model.modelYear
    }

formatStyles = (styles) ->
    return _.map styles, (item) =>
        obj = formatStyle(item)
        obj.price = parseInt(obj.price) + parseInt(obj.destination)
        return obj

formatColors = (style_id, configurations, type) ->
    option_kind_id = null
    if type == 'interior'
        option_kind_id = constants.CHROME_OPTION_KIND.seatTrim
    else if type == 'exterior'
        option_kind_id = constants.CHROME_OPTION_KIND.primaryPaint
    
    selectedOptions = _.filter configurations, (item) =>
        return item.optionKindId == option_kind_id
    
    if type == 'interior'
        return _.map selectedOptions, (item) =>
            return {
                vehicle_id: style_id
                color: item.descriptions[0].description
                simple_color: ''
                chrome_option_code: item.chromeOptionCode
                oem_option_code: item.oemOptionCode
                color_hex_code: ''
                msrp: item.msrp
                invoice: item.invoice
                selection_state: item.selectionState
            }
    else if type == 'exterior'
        return _.map selectedOptions, (item) =>
            simple_color = 'n/a'
            if item.genericColors
                simple_color = item.genericColors[0].name
            return {
                vehicle_id: style_id
                color: item.descriptions[0].description
                simple_color: simple_color
                chrome_option_code: item.chromeOptionCode
                oem_option_code: item.oemOptionCode
                color_hex_code: item.rgbValue
                msrp: item.msrp
                invoice: item.invoice
                selection_state: item.selectionState
            }

formatMedias = (medias) ->
    medias =  _.map medias, (item) =>
        return {
            oem_code: item['@primaryColorOptionCode']
            image_url: item['@href']
            shot_code: item['@shotCode']
            type: item['@type']
            width: item['@width']
        }
    medias_group =  _.groupBy medias, (item) =>
        return item.oem_code + ':' + item.shot_code
    return _.map medias_group, (group_item) =>
        initial_obj = 
            oem_code: ''
            url_2100: ''
            url_1280: ''
            url_640: ''
            url_320: ''
            shot_code: ''
            type: ''
        _.each group_item, (item) =>
            initial_obj.oem_code = item.oem_code if !initial_obj.oem_code
            initial_obj.shot_code = item.shot_code if !initial_obj.shot_code
            initial_obj.type = item.type if !initial_obj.type
            initial_obj['url_'+item.width] = item.image_url
        return initial_obj

formatConfiguration = (configuration) ->
    epaItemCity = getTechSpecItem configuration, 26
    epaItemHWY = getTechSpecItem configuration, 27
    engineItem = getTechSpecItem configuration, 41
    speedItem = getTechSpecItem configuration, 53
    yearItem = getStructuredConsumerInfoItem configuration, 200
    mileItem = getStructuredConsumerInfoItem configuration, 300
    wheelItem = getTechSpecItem configuration, 6
    passengerItem = getTechSpecItem configuration, 8
    epaItem = 'EPA est. '
    epaItem = (epaItem + epaItemHWY.value + ' Hwy') if epaItemHWY
    epaItem = (epaItem + ' / ' + epaItemCity.value + ' City') if epaItemCity
    note = (yearItem.value + ' years') if yearItem
    note = (note + ' / ' + mileItem.value + ' miles') if mileItem
    data = 
        basicInformation: 
            epa: if epaItem then epaItem else ''
            engine: if engineItem then engineItem.value
            speed_manual: if speedItem then speedItem.value
            note: note
            wheel: if wheelItem then wheelItem.value else ''
            passenger: if passengerItem then passengerItem.value + ' passengers'
        standardEquipment: configuration.standardEquipment
        structuredConsumerInformation: configuration.structuredConsumerInformation
        technicalSpecifications: configuration.technicalSpecifications

    return data

formatOptions = (options) ->
    # Wheel options
    wheel_options = _.filter options, (item) -> item.optionKindId == 41
    # Additional Equipments
    additional_equipment_options = _.filter options, (item) -> item.optionKindId == 0
    
    result = 
        wheel: wheel_options
        additional_equipment: additional_equipment_options

    return result

###
# format checklist
# @param data array
# @return result array
###
formatCheckList = (data) ->
    isCompleted = true
    group = _.map data, (item) ->
        tmp =
            itemName: item.itemName
            satisfied: item.satisfied
        isCompleted = isCompleted and item.satisfied
        return tmp
    result = 
        isCompleted: isCompleted
        data: group


getTechSpecItem = (configuration, itemId) ->
    group = configuration.technicalSpecifications
    return _.find group, (item) -> item.titleId == itemId

getStructuredConsumerInfoItem = (configuration, value) ->
    group = configuration.structuredConsumerInformation
    warranty_items = []
    if group
        warranty_items = _.find group, (item) -> item.typeName == 'Warranty'
    return _.find warranty_items.items, (item) -> item.sequence == value

getColorNames = (colors, option_codes) ->
    colors = _.filter colors, (item) -> _.contains(option_codes, item.chrome_option_code)
    colorName = 'N/A'
    if colors
        colorName = _.map colors, (item) =>
            return item.color
        colorName = colorName.join(' , ')
    return colorName

###
# Function to get array of color values
# @param colors - colors object from chrome service
# @param option_codes - selected color option codes from request
# @return
###

getColorArr = (colors, option_codes) ->
    colors = _.filter colors, (item) -> _.contains(option_codes, item.chrome_option_code)
    colorName = []
    if colors
        colorName = _.map colors, (item) =>
            return {
                option_code: item.chrome_option_code
                option_value: item.color
            }
    return colorName


getOptionNames = (options, option_codes) ->
    if options && options.wheel
        wheelOptions = _.filter options.wheel, (item) -> _.contains(option_codes, item.chromeOptionCode)
    else
        wheelOptions = []
    if options && options.additional_equipment
        additionalEquipmentOptions = _.filter options.additional_equipment, (item) -> _.contains(option_codes, item.chromeOptionCode)
    else
        additionalEquipmentOptions = []
    optionName = 'N/A'
    if wheelOptions.length || additionalEquipmentOptions.length
        wheelOptionName = _.map wheelOptions, (item) =>
            item_name = ''
            if item.descriptions && item.descriptions[0] && item.descriptions[0]['description']
                item_name = item.descriptions[0]['description']
            return item_name

        additionalOptionName = _.map additionalEquipmentOptions, (item) =>
            item_name = ''
            if item.descriptions && item.descriptions[0] && item.descriptions[0]['description']
                item_name = item.descriptions[0]['description']
            return item_name
        optionName = _.union(wheelOptionName, additionalOptionName).join(' , ')
    return optionName


###
# Function to get array of option values
# @param options - option object from chrome service
# @param option_codes - selected option codes from request
# @return
###

getOptionArr = (options, option_codes) ->
    if options && options.wheel
        wheelOptions = _.filter options.wheel, (item) -> _.contains(option_codes, item.chromeOptionCode)
    else
        wheelOptions = []
    if options && options.additional_equipment
        additionalEquipmentOptions = _.filter options.additional_equipment, (item) -> _.contains(option_codes, item.chromeOptionCode)
    else
        additionalEquipmentOptions = []
    optionName = []
    if wheelOptions.length || additionalEquipmentOptions.length
        wheelOptionName = _.map wheelOptions, (item) =>
            item_name = ''
            if item.descriptions && item.descriptions[0] && item.descriptions[0]['description']
                item_name = item.descriptions[0]['description']
            return {
                option_code: item.chromeOptionCode
                option_value: item_name
            }

        additionalOptionName = _.map additionalEquipmentOptions, (item) =>
            item_name = ''
            if item.descriptions && item.descriptions[0] && item.descriptions[0]['description']
                item_name = item.descriptions[0]['description']
            return {
                option_code: item.chromeOptionCode
                option_value: item_name
            }
        optionName = _.union(wheelOptionName, additionalOptionName)
    return optionName


getPrimaryMedia = (medias, oem_codme) ->
    result = config.image_placeholder
    primaryMedia = _.find medias, (item) =>
        return item['@backgroundDescription'] == 'Transparent' && 
            item['@primaryColorOptionCode'] == oem_codme &&
            item['@width'] == '1280' &&
            item['@shotCode'] == '01'
    if primaryMedia
        result  = primaryMedia['@href']
    return result

getMediasByResolution = (medias, resolution) ->
    if resolution
        result = _.filter medias, (item) =>
            return item['@backgroundDescription'] == 'Transparent' && 
                item['@width'] == resolution
    else
        result = _.filter medias, (item) =>
            return item['@backgroundDescription'] == 'Transparent'
    return result

isVehicleNotSupported = (error_msg, vehicle_id) ->
    return error_msg.includes('Style was not found for id: ' + vehicle_id)


###
# Function for V1 apis
###

###
# Function to format wheel and option packages
# @param options - option object from chrome service
# @param result - array
# @return
###

formatOptionsV1 = (options) ->
    # Wheel options
    wheel_options = _.filter options, (item) -> item.optionKindId == constants.CHROME_OPTION_KIND.wheel
    # Option Packages
    option_packages = _.filter options, (item) -> item.optionKindId not in [constants.CHROME_OPTION_KIND.wheel, constants.CHROME_OPTION_KIND.primaryPaint, constants.CHROME_OPTION_KIND.seatTrim]
    
    result = 
        wheel: wheel_options
        option_packages: option_packages

    return result

###
# Function to format color options
# @param style_id - vehicle id
# @param configuration - configuration array
# @param type - color types (exterior, interior )
# @param userSelection - list of options user selected
# @param result - array
# @return
###

formatColorsV1 = (style_id, configurations, type, userSelection) ->
    option_kind_id = null
    if type == 'interior'
        option_kind_id = constants.CHROME_OPTION_KIND.seatTrim
    else if type == 'exterior'
        option_kind_id = constants.CHROME_OPTION_KIND.primaryPaint
    
    selectedOptions = _.filter configurations, (item) =>
        return item.optionKindId == option_kind_id
    
    if type == 'interior'
        return _.map selectedOptions, (item) =>
            return {
                vehicle_id: style_id
                color: item.descriptions[0].description
                simple_color: ''
                chrome_option_code: item.chromeOptionCode
                oem_option_code: item.oemOptionCode
                color_hex_code: ''
                msrp: item.msrp
                invoice: item.invoice
                selection_state: item.selectionState
                user_selection_state: if item.chromeOptionCode == userSelection then 'Selected' else 'Unselected'
            }
    else if type == 'exterior'
        return _.map selectedOptions, (item) =>
            simple_color = 'n/a'
            if item.genericColors
                simple_color = item.genericColors[0].name
            return {
                vehicle_id: style_id
                color: item.descriptions[0].description
                simple_color: simple_color
                chrome_option_code: item.chromeOptionCode
                oem_option_code: item.oemOptionCode
                color_hex_code: item.rgbValue
                msrp: item.msrp
                invoice: item.invoice
                selection_state: item.selectionState
                user_selection_state: if item.chromeOptionCode == userSelection then 'Selected' else 'Unselected'
            }

###
# format vehicle media
# @param medias array - array of media
# @param exterior_colors array - exterior color options
# @param userSelection string - user selected chrome code
# @return result - selected media for vehicle
###

formatVehicleMediaV1 = (medias, exterior_colors, userSelection) ->
    result = [];
    selectedColor = _.find exterior_colors, (item) ->
        item.chrome_option_code == userSelection

    if not selectedColor
        exterior_colors = _.sortBy exterior_colors, (item) =>
            constants.COLORS_PRIORITY_MAP[item.simple_color] 
        selectedColor = exterior_colors[0]

    if medias && medias.length
        result = __.filter medias, (media_item) =>
            return media_item.oem_code == selectedColor.oem_option_code
    return result

refreshUserSelection = (options, user_selection) ->
    option_formatted =  _.map options, (item) =>
        data = 
            chromeOptionCode: item.chromeOptionCode
            selectionState: item.selectionState
        return data
    
    tmp = _.find option_formatted, (item) => item.chromeOptionCode == user_selection.exterior_color && _.contains ['Unselected', 'Excluded'], item.selectionState
    if tmp || !user_selection.exterior_color
        user_selection.exterior_color = null

    tmp = _.find option_formatted, (item) => item.chromeOptionCode == user_selection.interior_color && _.contains ['Unselected', 'Excluded'], item.selectionState
    if tmp || !user_selection.interior_color
        user_selection.interior_color = null

    user_selection.wheel = _.filter user_selection.wheel, (wheel_item_code) =>
        _.find option_formatted, (item) => item.chromeOptionCode == wheel_item_code && !_.contains ['Unselected', 'Excluded'], item.selectionState

    user_selection.options =  _.filter user_selection.options, (option_item_code) =>
        _.find option_formatted, (item) => item.chromeOptionCode == option_item_code && !_.contains ['Unselected', 'Excluded'], item.selectionState

    return user_selection

updateUserSelection = (options, user_selection, option) ->
    toggledOption = _.find options, (item) -> item.chromeOptionCode == option
    newUserSelection  = @refreshUserSelection(options, _.clone user_selection)

    if toggledOption
        switch toggledOption.optionKindId
            when constants.CHROME_OPTION_KIND.seatTrim
                newUserSelection.interior_color = if !_.contains ['Unselected', 'Excluded'], toggledOption.selectionState then option else null
            when constants.CHROME_OPTION_KIND.primaryPaint
                newUserSelection.exterior_color = if !_.contains ['Unselected', 'Excluded'], toggledOption.selectionState then option else null
            when constants.CHROME_OPTION_KIND.wheel
                if !_.contains ['Unselected', 'Excluded'], toggledOption.selectionState
                    newUserSelection.wheel = _.union(newUserSelection.wheel, [option])
                else
                    newUserSelection.wheel = _.without(newUserSelection.wheel, option)
            else
                if !_.contains ['Unselected', 'Excluded'], toggledOption.selectionState
                    newUserSelection.options = _.union(newUserSelection.options, [option])
                else
                    newUserSelection.options = _.without(newUserSelection.options, option)
        
    return newUserSelection

hasConflictBetweenUserSelectAndNewOptions = (user_selection, options) =>
    result = []

    option_formatted =  _.map options, (item) =>
        data = 
            chromeOptionCode: item.chromeOptionCode
            selectionState: item.selectionState
        return data

    tmp = _.find option_formatted, (item) => item.chromeOptionCode == user_selection.exterior_color && _.contains ['Unselected', 'Excluded'], item.selectionState
    if tmp
        result.push('exterior_color')

    tmp = _.find option_formatted, (item) => item.chromeOptionCode == user_selection.interior_color && _.contains ['Unselected', 'Excluded'], item.selectionState
    if tmp
        result.push('interior_color')

    _.each user_selection.wheel, (wheel_item_code) =>
        tmp = _.find option_formatted, (item) => item.chromeOptionCode == wheel_item_code && _.contains ['Unselected', 'Excluded'], item.selectionState
        if tmp
            result.push('wheel')

    _.each user_selection.options, (option_item_code) =>
        tmp = _.find option_formatted, (item) => item.chromeOptionCode == option_item_code && _.contains ['Unselected', 'Excluded'], item.selectionState
        if tmp
            result.push('options')

    return _.uniq result


module.exports.formatBrands = formatBrands
module.exports.formatModels = formatModels
module.exports.formatStyle = formatStyle
module.exports.formatStyles = formatStyles
module.exports.formatColors = formatColors
module.exports.formatMedias = formatMedias
module.exports.formatConfiguration = formatConfiguration
module.exports.formatOptions = formatOptions
module.exports.formatCheckList = formatCheckList
module.exports.getColorNames = getColorNames
module.exports.getOptionNames = getOptionNames
module.exports.getPrimaryMedia = getPrimaryMedia
module.exports.getMediasByResolution = getMediasByResolution
module.exports.isVehicleNotSupported = isVehicleNotSupported
module.exports.getColorArr = getColorArr
module.exports.getOptionArr = getOptionArr

### V1 functions ###

module.exports.formatOptionsV1 = formatOptionsV1
module.exports.formatColorsV1 = formatColorsV1
module.exports.formatVehicleMediaV1 = formatVehicleMediaV1
module.exports.updateUserSelection = updateUserSelection
module.exports.hasConflictBetweenUserSelectAndNewOptions = hasConflictBetweenUserSelectAndNewOptions
module.exports.refreshUserSelection = refreshUserSelection

