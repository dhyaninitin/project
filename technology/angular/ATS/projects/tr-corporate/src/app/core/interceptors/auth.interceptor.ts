import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LstorageService } from '@tr/src/app/utility/services/lstorage.service';
import { LogoutService } from '../../dashboard/shared/services/logout.service';
import { SnackBarService } from '../../utility/services/snack-bar.service';
import { errorCollection } from '../../utility/configs/server-error.constant';
import { LSkeys } from '../../utility/configs/app.constants';
import { ROUTE_CONFIGS } from '../../utility/configs/routerConfig';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private errorCollection: { [key: string]: string } = errorCollection;
  private skipError: boolean = false;
  constructor(
    private router: Router,
    private lsServ: LstorageService,
    private snackBarService: SnackBarService,
    private logoutServ: LogoutService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accessToken = this.lsServ.getItem(LSkeys.BEARER_TOKEN);
    const defaultAccount = this.lsServ.getItem(LSkeys.DEFAULT_ACCOUNT) || '';

    if (request.headers.get('skipError')) this.skipError = true;
    else this.skipError = false;

    let authReq;
    let headerObj: any = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }

    if (defaultAccount) headerObj['accountID'] = defaultAccount;

    if (accessToken) {
      authReq = request.clone({
        setHeaders: headerObj
      });
    } else authReq = request.clone();

    // Pass on the cloned request instead of the original request.
    return next.handle(authReq).pipe((source) => this.handleAuthErrors(source));
  }



  handleAuthErrors(
    source: Observable<HttpEvent<any>>,
  ): Observable<HttpEvent<any>> {
    return source.pipe(
      catchError((error: HttpErrorResponse) => {
        if (this.skipError) return throwError(error);

        let message = this.errorCollection[error.status] || 'Server is unable to respond accordingly';
        this.snackBarService.open(message, 'Ok', 10000);
        if (error.status === 401) {
          this.logoutServ.logout();
          this.logoutServ.clearSavedData();
          this.router.navigate([ROUTE_CONFIGS.LOGIN]);
          return EMPTY;
        } else {
          return throwError(error);
        }
      }),
    )
  }
}
