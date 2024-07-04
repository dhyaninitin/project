import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TemplateInfo } from "../interface/template";

const getCreateState = createFeatureSelector<TemplateInfo>('offerComponent');

export const getTemplateDetails = createSelector(
  getCreateState,
  (state) => state
);