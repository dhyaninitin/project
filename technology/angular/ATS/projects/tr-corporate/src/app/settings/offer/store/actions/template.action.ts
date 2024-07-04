import { createAction, props } from '@ngrx/store';

export const setTemplateComponent = createAction(
    '[offerComponent] Set templates',
    props<{ data: any }>()
);

export const resetComponent = createAction(
    '[offerComponent] Reset templates',
    props<{ data: boolean }>()
);
