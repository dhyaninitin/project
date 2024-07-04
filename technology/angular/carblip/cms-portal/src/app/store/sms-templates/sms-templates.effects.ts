import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SMSTEMPLATE } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { SmsTemplate, WorkflowSmsTemplateResponse } from 'app/shared/models/sms-templates.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppState } from '..';
import * as actions from './sms-templates.actions';
import { WorkflowService } from '../../shared/services/apis/workflow.service';

@Injectable()
export class SmsTemplateEffects {
  @Effect()
  getList$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_LIST),
    map(action => (action as actions.GetList).payload),
    switchMap(payload => {
      return from(this.service$.getSmsTemplateList(payload)).pipe(
        map(result => {
          return new actions.GetListSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: SMSTEMPLATE.TYPE,
              message: formatErrorMessage(err, SMSTEMPLATE.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: SMSTEMPLATE.LIST_ERROR,
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
      return from(this.service$.toggleSmsTemplateStatus(payload.id, payload.data)).pipe(
        map(result => {
          this.snack$.open('Sms Template Edited!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.UpdateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: SMSTEMPLATE.TYPE,
              message: formatErrorMessage(err, SMSTEMPLATE.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: SMSTEMPLATE.EDIT_ERROR,
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
      return from(this.service$.deleteSmsTemplate(payload.id)).pipe(
        map(result => {
          this.snack$.open('Sms Template Deleted!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.DeleteSuccess();
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: SMSTEMPLATE.TYPE,
              message: SMSTEMPLATE.DELETE_ERROR,
            })
          );
          return of(
            new actions.AddError({
              error: SMSTEMPLATE.DELETE_ERROR,
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