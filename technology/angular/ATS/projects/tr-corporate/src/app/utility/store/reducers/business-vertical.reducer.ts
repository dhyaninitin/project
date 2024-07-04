import { Action, createReducer, on } from "@ngrx/store";
import * as BusVetActions from '../actions/business-vertical.action';
import { IBusVertList } from "../interfaces/business-vertical";

export const initialState: IBusVertList = {
    list: []
}

export const busVertReducer = createReducer(
    initialState,

    on(BusVetActions.setBusinessVerticle, (state, action) => {
        return {
            ...state,
            list: action.data
        };
    }),
);
