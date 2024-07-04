import { createSelector } from "@ngrx/store";
import { IBusVertList } from "../interfaces/business-vertical";
import { State } from "../reducers";

export const selectBusVertState = (state: State) => state.businessVerticles;

export const getBusinessVerticle = createSelector(
    selectBusVertState,
    (state: IBusVertList) => state.list
);

