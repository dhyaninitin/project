import { createAction, props } from "@ngrx/store";
import { BusinessVerticleActios } from "../action.constants";
import { IBusVert } from "../interfaces/business-vertical";

export const setBusinessVerticle = createAction(
    BusinessVerticleActios.BUSINESS_VERTICLE_ACTION,
    props<{ data: IBusVert[] }>()
);

