import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from "@angular/common/http";
import { Observable, catchError, finalize, throwError } from "rxjs";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from "environments/environment";

@Injectable()
export class HttpResponseInterceptor implements HttpInterceptor {
  constructor(private spinnerSer: NgxSpinnerService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    this.spinnerSer.show(undefined, {
      type: "square-jelly-box",
      size: "medium",
    });

    const token = localStorage.getItem("token");
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    if (request.urlWithParams == `${environment.apiUrl}/api/admin/userDataFromTo`) {
      this.spinnerSer.hide();
    }

    return next.handle(request).pipe(
      catchError((error: any) => {
        this.spinnerSer.hide();
        if (error.status === 401 || error.status === 403) {
          localStorage.clear();
          this.router.navigateByUrl("/login");
        }
        return throwError(error);
      }),
      finalize(() => {
        this.spinnerSer.hide();
      })
    );
  }
}
