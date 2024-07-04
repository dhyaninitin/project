import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import * as AuthActions from 'app/shared/states/auth/auth.actions';
import { AuthServiceImpl } from 'app/shared/states/auth/auth.service';
import { environment } from 'environments/environment';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthServiceImpl
  ) {}

  @Effect({ dispatch: true })
  emailCheck$: Observable<Action> = this.actions$.pipe(
    ofType<AuthActions.FetchUserInfo>(AuthActions.FETCH_USER_INFO),
    switchMap(action =>
      this.authService.checkEmailExist(action.payload).pipe(
        map(
          response => new AuthActions.FetchUserInfoSuccess({ data: response })
        ),
        catchError(err =>
          of(new AuthActions.FetchUserInfoFailed({ error: err }))
        )
      )
    )
  );

  @Effect({ dispatch: true })
  phoneRegister$: Observable<Action> = this.actions$.pipe(
    ofType<AuthActions.RegisterPhone>(AuthActions.REGISTER_PHONE),
    switchMap(action =>
      this.authService.registerPhone(action.payload).pipe(
        map(
          response => new AuthActions.RegisterPhoneSuccess({ data: response })
        ),
        catchError(err => {
          return of(new AuthActions.RegisterPhoneFailed({ error: err }));
        })
      )
    )
  );

  @Effect({ dispatch: true })
  verifyPhone$: Observable<Action> = this.actions$.pipe(
    ofType<AuthActions.VerifyPhone>(AuthActions.VERIFY_PHONE),
    switchMap(action =>
      this.authService.verifyPhone(action.payload).pipe(
        map(response => new AuthActions.VerifyPhoneSuccess({ data: response })),
        catchError(err => {
          return of(new AuthActions.VerifyPhoneFailed({ error: err }));
        })
      )
    )
  );

  @Effect({ dispatch: true })
  verifyOtp$: Observable<Action> = this.actions$.pipe(
    ofType<AuthActions.VerifyOtp>(AuthActions.VERIFY_OTP),
    switchMap(action =>
      this.authService.verifyOtp(action.payload).pipe(
        map(response => new AuthActions.VerifyOtpSuccess({ data: response })),
        catchError(err => {
          return of(new AuthActions.VerifyOtpFailed({ error: err }));
        })
      )
    )
  );

  @Effect({ dispatch: true })
  resendCode$: Observable<Action> = this.actions$.pipe(
    ofType<AuthActions.ResendCode>(AuthActions.RESEND_CODE),
    switchMap(action =>
      this.authService.resendCode(action.payload).pipe(
        map(response => new AuthActions.ResendCodeSuccess(response)),
        catchError(err => of(new AuthActions.ResendCodeFailed({ error: err })))
      )
    )
  );

  @Effect({ dispatch: true })
  refreshUserData$: Observable<Action> = this.actions$.pipe(
    ofType<AuthActions.RefreshUserData>(AuthActions.REFRESH_USER_DATA),
    switchMap(() =>
      this.authService.fetchUserData().pipe(
        map(
          userInfo => new AuthActions.FetchUserDataSuccess({ data: userInfo })
        ),
        catchError(err => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in brands.effects:');
            console.error(err);
            console.groupEnd();
          }

          return of(
            new AuthActions.FetchUserDataFailed({
              error: err,
            })
          );
        })
      )
    )
  );

  @Effect({ dispatch: true })
  fetchUserData$: Observable<Action> = this.actions$.pipe(
    ofType<AuthActions.FetchUserData>(AuthActions.FETCH_USER_DATA),
    switchMap(() =>
      this.authService.fetchUserData().pipe(
        map(
          userInfo => new AuthActions.FetchUserDataSuccess({ data: userInfo })
        ),
        catchError(err => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in brands.effects:');
            console.error(err);
            console.groupEnd();
          }

          return of(
            new AuthActions.FetchUserDataFailed({
              error: err,
            })
          );
        })
      )
    )
  );

  @Effect({ dispatch: true })
  sendUserData$: Observable<Action> = this.actions$.pipe(
    ofType<AuthActions.SendUserData>(AuthActions.SEND_USER_DATA),
    switchMap(action =>
      this.authService.sendUserData(action.payload).pipe(
        map(res => new AuthActions.SendUserDataSuccess({ data: res })),
        catchError(err => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in brands.effects:');
            console.error(err);
            console.groupEnd();
          }

          return of(
            new AuthActions.SendUserDataFailed({
              error: err.error.message,
            })
          );
        })
      )
    )
  );

  @Effect({ dispatch: true })
  sendOtpCode$: Observable<Action> = this.actions$.pipe(
    ofType<AuthActions.SendOtpCode>(AuthActions.SEND_OTP_CODE),
    switchMap(action =>
      this.authService.sendOtpCode(action.payload).pipe(
        map(res => new AuthActions.SendOtpCodeSuccess({ data: res })),
        catchError(err => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in brands.effects:');
            console.error(err);
            console.groupEnd();
          }

          return of(
            new AuthActions.SendOtpCodeFailed({
              error: err.error.message,
            })
          );
        })
      )
    )
  );

  @Effect({ dispatch: true })
  sendPhonenoForOtp$: Observable<Action> = this.actions$.pipe(
    ofType<AuthActions.SendPhoneForOtp>(AuthActions.SEND_PHONENO_FOR_OTP),
    switchMap(action => {
      return this.authService.sendPhonenoForOtp(action.payload).pipe(
        map(res => new AuthActions.SendPhoneForOtpSuccess({ data: res })),
        catchError(err => {
          return of(
            new AuthActions.SendOtpCodeFailed({
              error: err.error.message,
            })
          );
        })
      );
    })
  );
}
