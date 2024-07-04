import { EntityState } from '@ngrx/entity';

export interface ISearchPagination {
  readonly total: number;
  readonly per_page: number;
  readonly current_page: number;
}

export interface ISearchBrand {
  readonly id: number;
  readonly name: string;
}

export interface ISearchModel {
  readonly id: number;
  readonly name: string;
}

export interface ISearchResponse {
  data: Array<ISearchItem>;
  pagination: ISearchPagination;
}

// ------------------
// FOR A SINGLE SEARCH ITEM
// ------------------
// definition of a Search Item as it is on the backend
export interface ISearchItem {
  readonly id: number;
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
  readonly media_status: number;
  readonly media_update_at: string;
  readonly is_supported: number;
  readonly created_at: string;
  readonly updated_at: string;
  readonly Brand: ISearchBrand;
  readonly Model: ISearchModel;
}

// ----------------------------------------------------------------------------

// -------------------
// FOR MULTIPLE SEARCH ITEMS
// -------------------
// definition of the Search Items with `ids` and `entities` for state normalization
// thanks to ngrx entity we do not manipulate `ids` and `entities` directly
export interface ISearchItemGroup extends EntityState<ISearchItem> {
  // additional entity state properties
  readonly selected: number;
  readonly fetching: boolean;
  readonly didFetch: boolean;
  readonly keyword: string;
  readonly pagination: ISearchPagination;
  readonly errors: Array<string>;
}

// ----------------------------------------------------------------------------

// -------------------
// FOR FETCH API REQUEST
// -------------------
// definition of the Models for Fetch List api request
export interface IRequestFecthList {
  readonly keyword: string;
  readonly page: number;
  readonly count: number;
}
