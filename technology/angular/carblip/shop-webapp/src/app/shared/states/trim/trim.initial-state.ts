import { ITrim } from 'app/shared/states/trim/trim.interfaces';

/**
 * pass a brand and return an brand with its properties + missing ones
 * this function might be helpful to initialize brands coming from the server
 */
export function trimInitialState(brand: ITrim): ITrim {
  const emptyObj: ITrim = {
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
    media_update_at: '',
    created_at: '',
    updated_at: '',
  };

  return { ...emptyObj, ...brand };
}
