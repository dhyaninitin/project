import { EntityState } from '@ngrx/entity';

export interface IModelYear {
  readonly id: number;
  readonly label: string;
  readonly default?: boolean;
}

// ------------------
// FOR A SINGLE MODEL
// ------------------
// definition of a Model as it is on the backend
export interface IModel {
  readonly id: number;
  readonly name: string;
  readonly brand_id?: string;
  readonly year?: number;
  readonly msrp?: number;
  readonly image_url?: string;
  readonly data_release_date?: string;
  readonly initial_price_date?: string;
  readonly data_effective_date?: string;
  readonly comment?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}

// ----------------------------------------------------------------------------

// -------------------
// FOR MULTIPLE MODELS
// -------------------
// definition of the Models with `ids` and `entities` for state normalization
// thanks to ngrx entity we do not manipulate `ids` and `entities` directly
export interface IModelsGroup extends EntityState<IModel> {
  // additional entity state properties
  readonly year: number;
  readonly selected: number;
  readonly fetching: boolean;
  readonly didFetch: boolean;
  readonly errors: Array<string>;
}

// ----------------------------------------------------------------------------

// -------------------
// FOR FETCH API REQUEST
// -------------------
// definition of the Models for Fetch List api request
export interface IRequestFecthList {
  readonly brand_id: number;
  readonly year?: number;
}
