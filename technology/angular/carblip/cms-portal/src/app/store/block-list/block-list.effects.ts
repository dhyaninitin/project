import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { BLOCKLIST } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { BlockList, BlockResponse } from 'app/shared/models/block-list.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AppState } from '..';
import { BlockListService } from '../../shared/services/apis/block-list.service';
import * as actions from './block-list.actions';
import { filterSelector } from './block-list.selectors';

@Injectable()
export class BlockListEffects {
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
                            type: BLOCKLIST.TYPE,
                            message: formatErrorMessage(err, BLOCKLIST.LIST_ERROR),
                        })
                    );
                    return of(
                        new actions.AddError({
                            error: BLOCKLIST.LIST_ERROR,
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
            return from(this.service$.delete(payload.id)).pipe(
                map(result => {
                    let msg = 'Block number successfully Deleted!';
                    if(payload.id.length > 1) {
                        msg = `${payload.id.length} Blocked numbers successfully Deleted!`;
                    }
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
                            type: BLOCKLIST.TYPE,
                            message: BLOCKLIST.DELETE_ERROR,
                        })
                    );
                    return of(
                        new actions.AddError({
                            error: BLOCKLIST.DELETE_ERROR,
                        })
                    );
                })
            );
        })
    );

    constructor(
        private actions$: Actions,
        private service$: BlockListService,
        private snack$: MatSnackBar,
        private store$: Store<AppState>
    ) { }
}
