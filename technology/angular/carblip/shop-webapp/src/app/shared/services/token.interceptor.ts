import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { environment as env } from 'environments/environment';
import { Observable, TimeoutError } from 'rxjs';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/timeout';

import { NOTIFICATION_LIST } from 'app/core/constant';
import {
  CHROME_FAILED,
  FORBIDDEN_USER,
  INVALID_API_URL,
  MODEL_NOT_FOUND,
  REQUEST_TIMEOUT,
  TRIM_NOT_FOUND,
  UNAUTHORIED_USER,
} from 'app/core/events';
import { NotificationService } from 'app/shared/services/notification.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import * as AuthActions from 'app/shared/states/auth/auth.actions';
import { AuthServiceImpl } from 'app/shared/states/auth/auth.service';
import * as UiActions from 'app/shared/states/ui/ui.actions';
import { IStore } from '../interfaces/store.interface';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private authService: AuthServiceImpl;
  constructor(
    private store$: Store<IStore>,
    private router$: Router,
    private injector: Injector,
    public notificationService$: NotificationService,
    private segmentioService$: SegmentioService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.authService = this.injector.get(AuthServiceImpl);
    const timeout =
      Number(request.headers.get('timeout')) || env.requestTimeout;

    return next
      .handle(request)
      .timeout(timeout)
      .do(
        (event: HttpEvent<any>) => {},
        (error: any) => {
          this.store$.dispatch(new UiActions.SetLoadingStatus(false));

          /*
           * Handled timeout over error
           */
          if (error instanceof TimeoutError) {
            this.segmentioService$.track(
              REQUEST_TIMEOUT.EVENT_NAME,
              REQUEST_TIMEOUT.PROPERTY_NAME,
              REQUEST_TIMEOUT.SCREEN_NAME,
              REQUEST_TIMEOUT.ACTION_NAME
            );
            this.notificationService$.warning(
              NOTIFICATION_LIST.serverDown,
              '',
              {
                timeOut: 5000,
                enableHtml: true,
              }
            );
          }

          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              this.unauthorizedHandler(error);
            } else if (error.status === 403) {
              this.forbiddenHandler(error);
            } else if (error.status === 404) {
              this.notfoundHandler(error);
            } else if (error.status === 422) {
              this.unprocessableHandler(error);
            } else if (error.status === 500) {
              this.internalServerErrorHandler(error);
            } else if (error.status === 501) {
              this.notImplementedErrorHandler(error);
            } else if (error.status === 429) {
              this.apiLimitErrorHandler(error);
            }
          }
        }
      );
  }

  /*
   * Handled 401 - unauthroized error response
   * @param error object
   */
  unauthorizedHandler(error) {
    this.segmentioService$.track(
      UNAUTHORIED_USER.EVENT_NAME,
      UNAUTHORIED_USER.PROPERTY_NAME,
      UNAUTHORIED_USER.SCREEN_NAME,
      UNAUTHORIED_USER.ACTION_NAME
    );
    const message = error.error.message;
    const url = this.router$.url;
    this.authService.clearAuthInfo();
    this.store$.dispatch(new AuthActions.UpdateAuthMessage(message));
    this.store$.dispatch(new AuthActions.UpdateAuthRedirect(url));
    this.router$.navigate(['find-my-car']);
    this.store$.dispatch(new AuthActions.RegisterUser('expired'));
  }

  /*
   * Handled 403 - forbidden error response
   * @param error object
   */
  forbiddenHandler(error) {
    this.segmentioService$.track(
      FORBIDDEN_USER.EVENT_NAME,
      FORBIDDEN_USER.PROPERTY_NAME,
      FORBIDDEN_USER.SCREEN_NAME,
      FORBIDDEN_USER.ACTION_NAME
    );
    const message = error.error.message;
    const url = this.router$.url;
    this.authService.clearAuthInfo();
    this.store$.dispatch(new AuthActions.UpdateAuthRedirect(url));
    this.notificationService$.error(message, '', {
      timeOut: 5000,
      enableHtml: true,
    });
    this.router$.navigate(['find-my-car']);
  }

  /*
   * Handled 404 - Not Found error response
   * when requested data is not found (model and trim)
   * @param error object
   */
  notfoundHandler(error) {
    const message = error.error.message;
    const type = error.error.type;
    switch (type) {
      case 'model_not_found':
        this.segmentioService$.track(
          MODEL_NOT_FOUND.EVENT_NAME,
          MODEL_NOT_FOUND.PROPERTY_NAME,
          MODEL_NOT_FOUND.SCREEN_NAME,
          MODEL_NOT_FOUND.ACTION_NAME
        );
        break;
      case 'trim_not_found':
        this.segmentioService$.track(
          TRIM_NOT_FOUND.EVENT_NAME,
          TRIM_NOT_FOUND.PROPERTY_NAME,
          TRIM_NOT_FOUND.SCREEN_NAME,
          TRIM_NOT_FOUND.ACTION_NAME
        );
        break;
      default:
        // code...
        break;
    }
    this.notificationService$.warning(message, '', {
      timeOut: 5000,
      enableHtml: true,
    });
  }

  /*
   * Handled 422 - Unprocessable error response
   * when request params are not acceptable
   * @param error object
   */

  unprocessableHandler(error) {
    const message = error.error.message;
    this.notificationService$.warning(message, '', {
      timeOut: 5000,
      enableHtml: true,
    });
  }

  /*
   * Handled 501 - Not Implemented error response
   * when api endpoint is not implemented
   * @param error object
   */

  notImplementedErrorHandler(error) {
    this.segmentioService$.track(
      INVALID_API_URL.EVENT_NAME,
      INVALID_API_URL.PROPERTY_NAME,
      INVALID_API_URL.SCREEN_NAME,
      INVALID_API_URL.ACTION_NAME
    );
  }

  /*
   * Handled 429 - Api limit error response
   * when api request reached limit
   * @param error object
   */

  apiLimitErrorHandler(error) {
    const message = 'Too many requests. Please try again after 30 mins.';
    this.notificationService$.warning(message, '', {
      timeOut: 5000,
      enableHtml: true,
    });
  }

  /*
   * Handled 500 - standard internal server error response
   * when api endpoint is not implemented
   * @param error object
   */
  internalServerErrorHandler(error) {
    const erroCase = error.error.case;
    const message = error.error.message;
    switch (erroCase) {
      case 1:
        this.segmentioService$.track(
          CHROME_FAILED.EVENT_NAME,
          CHROME_FAILED.PROPERTY_NAME,
          CHROME_FAILED.SCREEN_NAME,
          CHROME_FAILED.ACTION_NAME
        );
        this.notificationService$.error(message, '', {
          timeOut: 5000,
          enableHtml: true,
        });
        break;

      case 2:
        this.segmentioService$.track(
          CHROME_FAILED.EVENT_NAME,
          CHROME_FAILED.PROPERTY_NAME,
          CHROME_FAILED.SCREEN_NAME,
          CHROME_FAILED.ACTION_NAME
        );
        this.notificationService$.error(message, '', {
          timeOut: 5000,
          enableHtml: true,
        });
        break;
      case 3:
        this.notificationService$.error(message, '', {
          timeOut: 5000,
          enableHtml: true,
        });
        break;
      default:
        break;
    }
  }
}
