import { ErrorObj } from 'app/shared/models/common.model';

export interface ErrorState {
  errors: Array<ErrorObj>;
}

export const initialState: ErrorState = {
  errors: [],
};
