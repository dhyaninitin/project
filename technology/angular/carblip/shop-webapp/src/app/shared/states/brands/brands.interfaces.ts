import { EntityState } from '@ngrx/entity';

// ------------------
// FOR A SINGLE BRAND
// ------------------
// definition of a Brand as it is on the backend
export interface IBrand {
  readonly id: number;
  readonly name: string;
  readonly image_url?: string;
  readonly is_domestic?: boolean;
  readonly min_price?: number;
  readonly max_price?: number;
}

// ----------------------------------------------------------------------------

// -------------------
// FOR MULTIPLE BRANDS
// -------------------
// definition of the Brands with `ids` and `entities` for state normalization
// thanks to ngrx entity we do not manipulate `ids` and `entities` directly
export interface IBrandsGroup extends EntityState<IBrand> {
  // additional entity state properties
  readonly selected: number;
  readonly fetching: boolean;
  readonly didFetch: boolean;
  readonly errors: Array<string>;
}
