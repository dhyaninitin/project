import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { TASKS } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppState } from '..';
import * as actions from './tasks.actions';
import { TasksService } from 'app/shared/services/apis/tasks.service';
import { initialState } from './tasks.states';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import * as logActions from 'app/store/taskslogs/tasklogs.actions';
import { initialState as initialLogState } from 'app/store/taskslogs/tasklogs.states';

@Injectable()
export class TasksEffects {
  @Effect()
  getList$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_LIST),
    map(action => (action as actions.GetList).payload),
    switchMap(payload => {
      return from(this.service$.getList(payload)).pipe(
        map(result => {
          return new actions.GetListSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: TASKS.TYPE,
              message: formatErrorMessage(err, TASKS.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: TASKS.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  @Effect()
  create$: Observable<Action> = this.actions$.pipe(
    ofType(actions.CREATE),
    map(action => (action as actions.Create).payload),
    switchMap(payload => {
      return from(this.service$.create(payload)).pipe(
        map(result => {
          this.snack$.open('Task Added!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          this.store$.dispatch(new actions.GetList(initialState.filter));
          this.store$.dispatch(new logActions.GetList(initialLogState.filter));
          return new actions.CreateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: TASKS.TYPE,
              message: formatErrorMessage(err, TASKS.ADD_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: TASKS.ADD_ERROR,
            })
          );
        })
      );
    })
  );

@Effect()
edit$: Observable<Action> = this.actions$.pipe(
  ofType(actions.UPDATE),
  map(action => (action as actions.Update).payload),
  switchMap(payload => {
    this.loader$.open();
    return from(this.service$.update(payload.id, payload.data)).pipe(
      map(result => {
        this.loader$.close();
        if(payload.data.task_status == 1) {
          this.snack$.open('Task is marked as completed', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
        } else if (payload.data.task_status == 0) {
          this.snack$.open('Task is marked as incomplete', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
        } else {
          this.snack$.open('Task Edited!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
        }
        this.store$.dispatch(new logActions.GetList(initialLogState.filter));
        return new actions.UpdateSuccess(result.data);
      }),
      catchError(err => {
        this.store$.dispatch(
          new AddError({
            type: TASKS.TYPE,
            message: formatErrorMessage(err, TASKS.EDIT_ERROR),
          })
        );
        return of(
          new actions.AddError({
            error: TASKS.EDIT_ERROR,
          })
        );
      })
    );
  })
);

  constructor(
    private actions$: Actions,
    private service$: TasksService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>,
    private loader$: AppLoaderService
  ) {}
}
