import { IProfile } from 'app/shared/states/auth/auth.interfaces';

export function profileInitialState(user: IProfile): IProfile {
  const emptyObj: IProfile = {
    id: null,
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: null,
    email_address: '',
    password: null,
    facebook_id: null,
    device_token: '',
    device_type: '',
    access_token: null,
    otp: null,
    phone: '',
    phone_verified: false,
    status: null,
    zipcode: null,
    location: null,
    login_verify_code: '',
    lease_captured: false,
  };

  return { ...emptyObj, ...user };
}
