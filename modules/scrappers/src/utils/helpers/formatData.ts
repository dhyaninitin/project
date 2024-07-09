import * as _ from 'underscore';
import { differenceInMinutes, differenceInHours, differenceInSeconds } from 'date-fns'
import { chromeOptionKind } from '../../constants/constants'

export const formatBrands = (brands: any[]): { id: string; name: string; image_url: string }[] => {
    return _.map(brands, (item: any) => ({
        id: item.divisionId,
        name: item.divisionName,
        image_url: '',
    }));
}

export const formatModels = (models: any[]) => {
    return _.map(models, (item: any) => {
        return {
            year: item.modelYear,
            brand_id: item.divisionId,
            sub_brand_id: item.subdivisionId,
            id: item.modelId,
            name: item.modelName,
            data_release_date: item.dataReleaseDate,
            initial_price_date: item.initialPriceDate,
            data_effective_date: item.dataEffectiveDate,
            comment: item.dataComment
        };
    });
};

const formatStyle = (style: any) => {
    return {
        id: style.styleId,
        brand_id: style.model.divisionId,
        model_id: style.model.modelId,
        model_no: style.manufacturerModelCode,
        trim: style.styleName,
        friendly_model_name: style.consumerFriendlyModelName,
        friendly_style_name: style.consumerFriendlyStyleName,
        friendly_drivetrain: style.consumerFriendlyDrivetrain,
        friendly_body_type: style.consumerFriendlyBodyType,
        price: style.baseMsrp,
        base_invoice: style.baseInvoice,
        destination: style.destination,
        year: style.model.modelYear,
    };
};

export const formatStyles = (styles: any[]) => {
    return _.map(styles, (item: any) => {
        const obj = formatStyle(item);
        obj.price = parseInt(obj.price.toString(), 10) + parseInt(obj.destination.toString(), 10);
        return obj;
    });
};

export const getMediasByResolution = (medias: any, resolution?: any) => {
    let result: any;
    if (resolution) {
        result = _.filter(medias, (item: any) => {
            return item['@backgroundDescription'] === 'Transparent' && item['@width'] === resolution
        })
    } else {
        result = _.filter(medias, (item: any) => {
            return item['@backgroundDescription'] === 'Transparent'
        })
    }
    return result;
}

export const formatColors = (styleId: number, configurations: any[], type: string): any[] => {
    let optionKindId: number | null = null;

    if (type === 'interior') {
        optionKindId = chromeOptionKind.seatTrim;
    } else if (type === 'exterior') {
        optionKindId = chromeOptionKind.primaryPaint;
    }

    const selectedOptions = configurations.filter((item) => item.optionKindId === optionKindId);

    if (type === 'interior') {
        return selectedOptions.map((item) => ({
            vehicle_id: styleId,
            color: item.descriptions[0].description,
            simple_color: '',
            chrome_option_code: item.chromeOptionCode,
            oem_option_code: item.oemOptionCode,
            color_hex_code: '',
            msrp: item.msrp,
            invoice: item.invoice,
            selection_state: item.selectionState,
        }));
    } else if (type === 'exterior') {
        return selectedOptions.map((item) => {
            let simpleColor = 'n/a';
            if (item.genericColors) {
                simpleColor = item.genericColors[0].name;
            }
            return {
                vehicle_id: styleId,
                color: item.descriptions[0].description,
                simple_color: simpleColor,
                chrome_option_code: item.chromeOptionCode,
                oem_option_code: item.oemOptionCode,
                color_hex_code: item.rgbValue,
                msrp: item.msrp,
                invoice: item.invoice,
                selection_state: item.selectionState,
            };
        });
    }

    return [];
};

export const formatConfiguration = (configuration: any): any => {
    const epaItemCity = getTechSpecItem(configuration, 26);
    const epaItemHWY = getTechSpecItem(configuration, 27);
    const engineItem = getTechSpecItem(configuration, 41);
    const speedItem = getTechSpecItem(configuration, 53);
    const yearItem = getStructuredConsumerInfoItem(configuration, 200);
    const mileItem = getStructuredConsumerInfoItem(configuration, 300);
    const wheelItem = getTechSpecItem(configuration, 6);
    const passengerItem = getTechSpecItem(configuration, 8);
    let epaItem = 'EPA est. ';

    if (epaItemHWY) {
        epaItem = epaItem + epaItemHWY.value + ' Hwy';
    }

    if (epaItemCity) {
        epaItem = epaItem + ' / ' + epaItemCity.value + ' City';
    }

    let note = '';

    if (yearItem) {
        note = yearItem.value + ' years';
    }

    if (mileItem) {
        note = note + ' / ' + mileItem.value + ' miles';
    }

    const data = {
        basicInformation: {
            epa: epaItem || '',
            engine: engineItem ? engineItem.value : '',
            speed_manual: speedItem ? speedItem.value : '',
            note,
            wheel: wheelItem ? wheelItem.value : '',
            passenger: passengerItem ? passengerItem.value + ' passengers' : '',
        },
        standardEquipment: configuration.standardEquipment,
        structuredConsumerInformation: configuration.structuredConsumerInformation,
        technicalSpecifications: configuration.technicalSpecifications,
    };

    return data;
}

export const getTechSpecItem = (configuration: any, itemId: number) => {
    const group = configuration.technicalSpecifications;
    return group.find((item: any) => item.titleId === itemId);
}

export const getStructuredConsumerInfoItem = (configuration: any, value: any) => {
    const group = configuration.structuredConsumerInformation;
    let warranty_items = [];

    if (group) {
        warranty_items = group.find((item: any) => item.typeName === 'Warranty');
    }

    return warranty_items.items.find((item: any) => item.sequence === value);
}
