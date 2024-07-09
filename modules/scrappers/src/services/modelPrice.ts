import { placeHolder } from '../config/config';
import * as _ from 'underscore';
import Vehicles from '../model/vehicle';
import { Op } from 'sequelize';
import Models from '../model/model';
import * as sentry from '@sentry/node';
import { formatImageUrl } from '../utils/helpers/uploadImage';

export const fetchAndUpdateModels = async () => {
    const models = await Models.findAll({ raw: true })
    for (const model of models) {
        await updateModelImagesOnFetch(model.id)
    }
}

export const updateModelImagesOnFetch = async (modelId: number) => {
    const updateOptions: any = {
        image_url_320: placeHolder.image_placeholder_320,
        image_url_640: placeHolder.image_placeholder_640,
        image_url_1280: placeHolder.image_placeholder_1280,
        image_url_2100: placeHolder.image_placeholder_2100,
        msrp: null,
        is_new: 0
    }
    let flag = false
    const result = await getStartingVehiclePriceByModel(modelId)
    if (result) {
        flag = true;
        updateOptions.msrp = result.price

    }
    const vehicle: Vehicles = await fetchPrimaryVehicleByModel(modelId);
    if (vehicle) {
        flag = true;
        if (vehicle.image_url_320 === null) {
            updateOptions.is_new = 1;
        }
        updateOptions.image_url_320 = formatImageUrl(vehicle.image_url_320);
        updateOptions.image_url_640 = formatImageUrl(vehicle.image_url_640);
        updateOptions.image_url_1280 = formatImageUrl(vehicle.image_url_1280);
        updateOptions.image_url_2100 = formatImageUrl(vehicle.image_url_2100)

    }
    if (flag) {
        const query = {
            where: { id: modelId }
        }
        try {
            await Models.update(updateOptions, query)
        } catch (error) {
            sentry.captureException(error);
        }
    }
}

export const getStartingVehiclePriceByModel = async (modelId: number) => {
    try {
        const query: any = {
            where: {
                model_id: modelId,
                price: {
                    [Op.gt]: 0
                }
            },
            order: [['price', 'ASC']],
            raw: true
        };

        const result = await Vehicles.findOne(query);
        return result;
    } catch (error) {
        throw error;

    }
};


export const fetchPrimaryVehicleByModel = async (modelId: number) => {
    const query: any = {
        order: [['media_update_at', 'DESC']],
        where: {
            model_id: modelId,
        },
        raw: true
    };

    try {
        const result = await Vehicles.findAll(query);
        return result[0];
    } catch (error) {
        throw error;
    }
};