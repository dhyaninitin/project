import { EntityState } from '@ngrx/entity';

// ------------------
// FOR A SINGLE MODEL
// ------------------
// definition of a Trim as it is on the backend
export interface ITrim {
  readonly id: string;
  readonly brand_id: number;
  readonly model_id: number;
  readonly trim: string;
  readonly friendly_model_name: string;
  readonly friendly_style_name: string;
  readonly friendly_drivetrain: string;
  readonly friendly_body_type: string;
  readonly price: number;
  readonly base_invoice: number;
  readonly destination: number;
  readonly year: number;
  readonly image_url: string;
  readonly media_update_at: string;
  readonly created_at: string;
  readonly updated_at: string;
}

// ----------------------------------------------------------------------------

// -------------------
// FOR MULTIPLE MODELS
// -------------------
// definition of the Trim with `ids` and `entities` for state normalization
// thanks to ngrx entity we do not manipulate `ids` and `entities` directly
export interface ITrimGroup extends EntityState<ITrim> {
  // additional entity state properties
  readonly selected: number;
  readonly fetching: boolean;
  readonly didFetch: boolean;
  readonly errors: Array<string>;
}

// ----------------------------------------------------------------------------

// -------------------
// FOR FETCH API REQUEST
// -------------------
// definition of the Trim for Fetch List api request
export interface IRequestFecthList {
  readonly min_price?: number;
  readonly max_price?: number;
  readonly models: any;
}
