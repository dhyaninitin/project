import { createAction, props } from "@ngrx/store";
import { OffersAction, UserActions } from "../action.constants";
import { IOffers } from "../interfaces/offers";

export const setOffers = createAction(
  OffersAction.Load_user_Action,
  props<{ data: IOffers }>()
);
