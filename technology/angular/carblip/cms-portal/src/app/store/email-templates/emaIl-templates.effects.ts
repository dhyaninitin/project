import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMAILTEMPLATE } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { SmsTemplate } from 'app/shared/models/sms-templates.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppState } from '..';
import * as actions from './email-templates.actions';
import { WorkflowService } from '../../shared/services/apis/workflow.service';

@Injectable()
export class EmailTemplateEffects {
  @Effect()
  getList$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_LIST),
    map(action => (action as actions.GetList).payload),
    switchMap(payload => {
      return from(this.service$.getEmailTemplateList(payload)).pipe(
        map(result => {
          return new actions.GetListSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: EMAILTEMPLATE.TYPE,
              message: formatErrorMessage(err, EMAILTEMPLATE.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: EMAILTEMPLATE.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  @Effect()
  toggle$: Observable<Action> = this.actions$.pipe(
    ofType(actions.TOGGLE),
    map(action => (action as actions.Update).payload),
    switchMap(payload => {
      return from(this.service$.toggleEmailTemplateStatus(payload.id, payload.data)).pipe(
        map(result => {
          this.snack$.open('Email Template Edited!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.UpdateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: EMAILTEMPLATE.TYPE,
              message: formatErrorMessage(err, EMAILTEMPLATE.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: EMAILTEMPLATE.EDIT_ERROR,
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
      return from(this.service$.deleteEmailTemplate(payload.id)).pipe(
        map(result => {
          this.snack$.open('Email Template Deleted!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.DeleteSuccess();
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: EMAILTEMPLATE.TYPE,
              message: EMAILTEMPLATE.DELETE_ERROR,
            })
          );
          return of(
            new actions.AddError({
              error: EMAILTEMPLATE.DELETE_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: WorkflowService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>
  ) {}
}