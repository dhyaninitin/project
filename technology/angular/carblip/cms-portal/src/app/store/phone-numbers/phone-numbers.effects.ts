import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { PHONENUMBERSLIST } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AppState } from '..';
import { PhoneNumbersListService } from '../../shared/services/apis/phone-numbers.service';
import * as actions from './phone-numbers.actions';
import { filterSelector } from './phone-numbers.selectors';

@Injectable()
export class PhoneNumbersListEffects {
    @Effect()
    getList$: Observable<Action> = this.actions$.pipe(
        ofType(actions.GET_LIST),
        withLatestFrom(this.store$.select(filterSelector)),
        switchMap(([action, filter]) => {
            return from(this.service$.getList(filter)).pipe(
                map(result => {
                    return new actions.GetListSuccess(result);
                }),
                catchError(err => {
                    this.store$.dispatch(
                        new AddError({
                            type: PHONENUMBERSLIST.TYPE,
                            message: formatErrorMessage(err, PHONENUMBERSLIST.LIST_ERROR),
                        })
                    );
                    return of(
                        new actions.AddError({
                            error: PHONENUMBERSLIST.LIST_ERROR,
                        })
                    );
                })
            );
        })
    );

    @Effect()
    delete$: Observable<Action> = this.actions$.pipe(
        ofType(actions.DELETE),
        map(action => (action as actions.Delete).payload),
        switchMap(payload => {
            return from(this.service$.delete(payload.id, payload.phone)).pipe(
                map(result => {
                    let msg = 'Phone number successfully Deleted!';
                    this.snack$.open(msg, 'OK', {
                        verticalPosition: 'top',
                        duration: 4000,
                        panelClass: ['snack-success'],
                    });
                    // this.store$.dispatch(new logActions.GetList(initialLogState.filter));
                    return new actions.DeleteSuccess();
                }),
                catchError(err => {
                    this.store$.dispatch(
                        new AddError({
                            type: PHONENUMBERSLIST.TYPE,
                            message: PHONENUMBERSLIST.DELETE_ERROR,
                        })
                    );
                    return of(
                        new actions.AddError({
                            error: PHONENUMBERSLIST.DELETE_ERROR,
                        })
                    );
                })
            );
        })
    );

    constructor(
        private actions$: Actions,
        private service$: PhoneNumbersListService,
        private snack$: MatSnackBar,
        private store$: Store<AppState>
    ) { }
}
