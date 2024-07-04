import { IBrand } from 'app/shared/states/brands/brands.interfaces';

/**
 * pass a brand and return an brand with its properties + missing ones
 * this function might be helpful to initialize brands coming from the server
 */
export function brandInitialState(brand: IBrand): IBrand {
  const emptyObj: IBrand = {
    id: null,
    name: '',
    image_url: '',
    is_domestic: false,
    min_price: 0,
    max_price: 0,
  };

  return { ...emptyObj, ...brand };
}
