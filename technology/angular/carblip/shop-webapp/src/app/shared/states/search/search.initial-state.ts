import { ISearchItem } from 'app/shared/states/search/search.interfaces';

/**
 * pass a brand and return an brand with its properties + missing ones
 * this function might be helpful to initialize brands coming from the server
 */
export function searchInitialState(brand: ISearchItem): ISearchItem {
  const emptyObj: ISearchItem = {
    id: null,
    brand_id: null,
    model_id: null,
    trim: '',
    friendly_model_name: '',
    friendly_style_name: '',
    friendly_drivetrain: '',
    friendly_body_type: '',
    price: null,
    base_invoice: null,
    destination: null,
    year: null,
    image_url: '',
    media_status: null,
    media_update_at: '',
    is_supported: null,
    created_at: '',
    updated_at: '',
    Brand: {
      id: null,
      name: '',
    },
    Model: {
      id: null,
      name: '',
    },
  };

  return { ...emptyObj, ...brand };
}
