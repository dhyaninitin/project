import { IRequest } from 'app/shared/states/my-request/myrequests.interfaces';

export function myRequestInitialState(request: IRequest): IRequest {
  const emptyObj: IRequest = {
    Vehicle: {
      Brand: {
        id: null,
        name: '',
      },
      Model: {
        id: null,
        name: '',
      },
      VehicleMedia: null,
      id: null,
      price: null,
      trim: '',
    },
    VehicleMedias: [],
    VehicleRequestPreference: {
      id: null,
      preferences: '',
    },
    colorFeteched: false,
    exterior_colors: [],
    interior_colors: [],
    buying_method: null,
    buying_time: null,
    configuration_state_id: '',
    credit_score: null,
    id: null,
    is_complete: null,
    max_price: null,
    min_price: null,
    order_number: '',
    price_type: null,
    referral_code: '',
    request_made_at: '',
    request_type: null,
    source_utm: null,
    status: null,
    total_price: null,
    formatted_price: null,
    user_id: null,
    vehicle_id: null,
    vehicle_req_preferences_id: null,
    vehicle_type: null,
    CreditApplications: null,
    has_credit_application: false,
    credit_application_id: null,
    way_of_applying: null,
  };

  return { ...emptyObj, ...request };
}
