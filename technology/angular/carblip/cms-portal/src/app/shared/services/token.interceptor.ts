import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { environment as env } from 'environments/environment';
import { Observable, TimeoutError } from 'rxjs';
import { timeout, tap } from 'rxjs/operators';

import { AUTH } from 'app/core/errors';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { AppState } from 'app/store';
import { LogoutSuccessful } from 'app/store/auth/authentication.action';
import { AddError } from 'app/store/error/error.actions';
import { Location } from '@angular/common';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private store$: Store<AppState>,
    private router$: Router,
    private injector: Injector,
    private authService: AuthService,
    private snack$: MatSnackBar,
    private location: Location
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const timeoutEnv =
      Number(request.headers.get('timeout')) || env.requestTimeout;

    return next
      .handle(request).pipe(timeout(timeoutEnv), tap(
          (event: HttpEvent<any>) => {
          const body = event['body'];
          if (event['status'] === 200) {
            if (body?.message === 'No data found') {
              this.snack$.open(body.message, 'OK', {
                verticalPosition: 'top',
                panelClass: ['snack-warning'],
                duration: 3000,
              });
            } else {
              if (body?.message) {
                this.snack$.open(body.message, 'OK', {
                  verticalPosition: 'top',
                  panelClass: ['snack-success'],
                  duration: 5000,
                });
              }
            }
          }
        },
        (error: any) => {
          /*
           * Handled timeout over error
           */
          if (error instanceof TimeoutError) {
            this.store$.dispatch(
              new AddError({
                type: AUTH.TYPE,
                message: AUTH.NO_INTERNET,
              })
            );
          } else if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              this.unauthorizedHandler(error);
            } else if(error.status == 0) {
              this.internalServerHandler();
            } else if(error.status == 404) {
              this.snack$.open("Details Not Found", 'OK', {
                verticalPosition: 'top',
                panelClass: ['snack-warning'],
                duration: 3000,
              });
              this.location.back();
            } else {
              this.standardHandler(error);
            }
          }
        }
      ))
      // .timeout(timeout)
      // .do(
      //   (event: HttpEvent<any>) => {
      //     const body = event['body'];
      //     if (event['status'] === 200) {
      //       if (body.message) {
      //         this.snack$.open(body.message, 'OK', {
      //           duration: 5000,
      //           verticalPosition: 'top',
      //         });
      //       }
      //     }
      //   },
      //   (error: any) => {
      //     /*
      //      * Handled timeout over error
      //      */
      //     if (error instanceof TimeoutError) {
      //       this.store$.dispatch(
      //         new AddError({
      //           type: AUTH.TYPE,
      //           message: AUTH.NO_INTERNET,
      //         })
      //       );
      //     } else if (error instanceof HttpErrorResponse) {
      //       if (error.status === 401) {
      //         this.unauthorizedHandler(error);
      //       } else {
      //         this.standardHandler(error);
      //       }
      //     }
      //   }
      // );
  }

  /*
   * Handled 401 - unauthroized error response
   * @param error object
   */
  unauthorizedHandler(error) {
    if (this.authService.isLoggedIn()) {
      this.store$.dispatch(
        new AddError({
          type: AUTH.TYPE,
          message: AUTH.SESSION_EXPIRED,
        })
      );
      this.store$.dispatch(new LogoutSuccessful());
    }
  }

    /*
   * Handled 500 - Internal server error response
   * @param error object
   */
    internalServerHandler() {
      if (this.authService.isLoggedIn()) {
        this.store$.dispatch(
          new AddError({
            type: AUTH.TYPE,
            message: AUTH.SERVER_DOWN,
          })
        );
        this.store$.dispatch(new LogoutSuccessful());
        this.router$.navigateByUrl('/sessions/error');
      } else {
        this.snack$.open(AUTH.SERVER_DOWN, 'OK', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['snack-warning'],
        });
        this.router$.navigateByUrl('/sessions/error');
      }
    }

  /*
   * Handled Standard Errors
   * @param error object
   */
  standardHandler(error) {
    if (error.error && error.error.message) {
      this.snack$.open(error.error.message, 'OK', {
        duration: 5000,
        verticalPosition: 'top',
        panelClass: ['snack-warning'],
      });
    } else if (error.error && error.error.errors) {
      if (typeof error.error.errors === 'object') {
        const errorData = error.error.errors;
        const message = Object.keys(errorData).map(key => errorData[key]);
        this.snack$.open(message[0], 'OK', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['snack-warning'],
        });
      }
    }
  }
}
