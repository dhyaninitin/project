import { Profile } from 'app/shared/models/user.model';

export interface AuthenticationState {
  fetching: boolean;
  didFetch: boolean;
  processing: boolean;
  data: Profile;
}

export const initialState: AuthenticationState = {
  didFetch: false,
  fetching: false,
  processing: false,
  data: {
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    phone: null,
    profile_url: null,
    location: null,
    permissions: [],
    roles: [],
    created_at: '',
    updated_at: '',
  },
};
