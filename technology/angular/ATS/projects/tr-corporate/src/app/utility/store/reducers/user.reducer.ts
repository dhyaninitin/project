import { Action, createReducer, on } from "@ngrx/store";
import * as UserActions from "../actions/user.action";
import { Iuser } from "../interfaces/user";

export const initialState: Iuser = {
	isLoggedIn: false,
	name: { firstName: '', middleName: '', lastName: '' },
	fullName: '',
	address: '',
	mobileNumber: '',
	city: { cityId: '', cityName: '' },
	downloadPreSignedURI:'',
	country: { countryId: '', countryName: '' },
	state: { stateId: '', stateName: '' },
	role: { roletypeid: 0, roletypename: '' },
	email: '',
	practicename: '',
	picturename: '',
	profileimagepath: '',
	locationname: '',
	designationname: '',
	businessverticalid: '',
	status: 0
};

export const userReducer = createReducer(
	initialState,

	on(UserActions.resetUser, (state, action) => {
		return { ...initialState };
	}),

	on(UserActions.setUserName, (state, action) => {
		return {
			...state,
			name: action.data
		};
	}),

	on(UserActions.setUserFullName, (state, action) => {
		return {
			...state,
			fullName: action.data
		};
	}),

	on(UserActions.setUserAddress, (state, action) => {
		return {
			...state,
			address: action.data
		};
	}),

	on(UserActions.setUserCity, (state, action) => {

		return {
			...state,
			city: action.data
		};
	}),

	on(UserActions.setUserState, (state, action) => {
		return {
			...state,
			state: action.data
		};
	}),

	on(UserActions.setUserCountry, (state, action) => {
		return {
			...state,
			country: action.data
		};
	}),

	on(UserActions.setUserMobile, (state, action) => {
		return {
			...state,
			mobileNumber: action.data
		};
	}),

	on(UserActions.setUserMail, (state, action) => {
		return {
			...state,
			email: action.data
		};
	}),

	on(UserActions.setUserRole, (state, action) => {
		return {
			...state,
			role: action.data
		};
	}),

	on(UserActions.setUserLoginStatus, (state, action) => {
		return {
			...state,
			isLoggedIn: action.data
		};
	}),

	on(UserActions.setUserStatus, (state, action) => {
		return {
			...state,
			status: action.data
		};
	}),

	on(UserActions.setUserImage, (state, action) => {
		return {
			...state,
			profileimagepath: action.data.url,
			picturename: action.data.name
		};
	}),
);
