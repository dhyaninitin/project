import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { State } from '../../utility/store/reducers';
import { setAppLoader } from '../../utility/store/actions/app.action';

@Injectable()
export class BusyInterceptor implements HttpInterceptor {
  requestCounter: number = 0;
  constructor(private store: Store<State>) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const msg = request.method === 'GET' ? 'Loading ...' : 'Saving ...';
    setTimeout(() => this.store.dispatch(setAppLoader({ data: true })), 100);
    this.requestCounter++;

    return next.handle(request).pipe(
      finalize(() => {
        this.requestCounter--;
        this.requestCounter === 0 && this.store.dispatch(setAppLoader({ data: false }));
      }),
    );
  }
}
