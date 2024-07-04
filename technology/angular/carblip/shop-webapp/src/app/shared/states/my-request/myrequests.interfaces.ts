import { EntityState } from '@ngrx/entity';
import { IUserCarInformation } from 'app/shared/states/request/request.interface';
import {
  IExteriorColor,
  IInteriorColor,
} from '../configuration/configuration.interfaces';
export interface IVehicle {
  readonly Brand: {
    id: number;
    name: string;
  };
  readonly Model: {
    id: number;
    name: string;
  };
  readonly VehicleMedia: null;
  readonly id: number;
  readonly price: number;
  readonly trim: string;
}

export interface IVehicleMediaitem {
  readonly oem_code: string;
  readonly url_2100: string;
  readonly url_1280: string;
  readonly url_640: string;
  readonly url_320: string;
  readonly shot_code: number;
  readonly type: string;
}

export interface IVehicleRequestPreference {
  readonly id: number;
  readonly preferences: string;
}

export interface IVehicleRequestPreferenceObj {
  readonly buying_method?: number;
  readonly buying_time?: number;
  readonly configuration_state_id: string;
  readonly credit_score?: number;
  readonly exterior_colors?: Array<string>;
  readonly exterior_colors_oem?: Array<string>;
  readonly interior_colors?: Array<string>;
  readonly interior_colors_oem?: Array<string>;
  readonly is_complete: number;
  readonly is_not_complete: number;
  readonly option_preferences?: Array<string>;
  readonly source_utm: number;
  readonly user_car_information: IUserCarInformation;
  readonly user_id: number;
  readonly vehicles: Array<number>;
}

export interface IRequest {
  readonly Vehicle: IVehicle;
  readonly VehicleMedias: Array<IVehicleMediaitem>;
  readonly VehicleRequestPreference: IVehicleRequestPreference;
  readonly colorFeteched: boolean;
  readonly exterior_colors: Array<IExteriorColor>;
  readonly interior_colors: Array<IInteriorColor>;
  readonly buying_method: number;
  readonly buying_time: number;
  readonly configuration_state_id: string;
  readonly credit_score: number;
  readonly id: number;
  readonly is_complete: number;
  readonly max_price: number;
  readonly min_price: number;
  readonly order_number: string;
  readonly price_type: number;
  readonly referral_code: string;
  readonly request_made_at: string;
  readonly request_type: number;
  readonly source_utm: number;
  readonly status: number;
  readonly total_price: number;
  readonly formatted_price: number;
  readonly user_id: number;
  readonly vehicle_id: number;
  readonly vehicle_req_preferences_id: number;
  readonly vehicle_type: number;
  readonly CreditApplications: Array<object>;
  readonly has_credit_application: boolean;
  readonly credit_application_id: number;
  readonly way_of_applying: number;
}

export interface IMyRequests extends EntityState<IRequest> {
  readonly selected: number;
  readonly fetching: boolean;
  readonly didFetch: boolean;
  readonly errors: Array<string>;
}
