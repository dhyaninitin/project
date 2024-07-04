import { IModel, IModelYear } from 'app/shared/states/models/models.interfaces';

/**
 * pass a brand and return an brand with its properties + missing ones
 * this function might be helpful to initialize brands coming from the server
 */
export function modelInitialState(brand: IModel): IModel {
  const emptyObj: IModel = {
    id: null,
    name: '',
    brand_id: null,
    year: null,
    msrp: null,
    image_url: '',
    data_release_date: '',
    initial_price_date: '',
    data_effective_date: '',
    comment: '',
    created_at: '',
    updated_at: '',
  };

  return { ...emptyObj, ...brand };
}

export function modelYear(item: object): IModelYear {
  const yearObject: IModelYear = {
    id: item['year'],
    label: item['year'] + ' Models',
    default: item['default'],
  };

  return yearObject;
}
