import { createAction, props } from "@ngrx/store";
import { UserActions } from "../action.constants";

// reset user
export const resetUser = createAction(
	UserActions.USER_RESET_ACTION,
	props<{ data: boolean }>()
);

// name
export const setUserName = createAction(
	UserActions.USER_NAME_ACTION,
	props<{ data: { firstName: string, middleName: string, lastName: string } }>()
);

// fullname
export const setUserFullName = createAction(
	UserActions.USER_FULLNAME_ACTION,
	props<{ data: string }>()
);

// email
export const setUserMail = createAction(
	UserActions.USER_EMAIL_ACTION,
	props<{ data: string }>()
);

// role
export const setUserRole = createAction(
	UserActions.USER_ROLE_ACTION,
	props<{ data: { roletypeid: number, roletypename: string } }>()
);

// address
export const setUserAddress = createAction(
	UserActions.USER_ADDRESS_ACTION,
	props<{ data: string }>()
);

// city
export const setUserCity = createAction(
	UserActions.USER_CITY_ACTION,
	props<{ data: { cityId: string, cityName: string } }>()
);

// state
export const setUserState = createAction(
	UserActions.USER_STATE_ACTION,
	props<{ data: { stateId: string, stateName: string } }>()
);

// country
export const setUserCountry = createAction(
	UserActions.USER_COUNTRY_ACTION,
	props<{ data: { countryId: string, countryName: string } }>()
);

// Others
export const setUserMobile = createAction(
	UserActions.USER_MOBILE_ACTION,
	props<{ data: string }>()
);

// user status
export const setUserStatus = createAction(
	UserActions.USER_STATUS_ACTION,
	props<{ data: number }>()
);

// user login status
export const setUserLoginStatus = createAction(
	UserActions.USER_LOGIN_STATUS_ACTION,
	props<{ data: boolean }>()
);

// user login status
export const setUserImage = createAction(
	UserActions.USER_IMAGE_ACTION,
	props<{ data: { name: string, url: string } }>()
);
