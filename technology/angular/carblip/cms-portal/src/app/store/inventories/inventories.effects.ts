import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { INVENTORY } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import {
  Filter,
  Inventory,
  InventoryResponse,
} from 'app/shared/models/inventory.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AppState } from '..';
import { InventoryService } from '../../shared/services/apis/inventories.service';
import * as actions from './inventories.actions';
import { filterSelector } from './inventories.selectors';

@Injectable()
export class InventoryEffects {
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
              type: INVENTORY.TYPE,
              message: formatErrorMessage(err, INVENTORY.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: INVENTORY.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: InventoryService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>
  ) {}
}
