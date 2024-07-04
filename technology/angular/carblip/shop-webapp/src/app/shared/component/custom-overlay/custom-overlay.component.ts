import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { IStore } from 'app/shared/interfaces/store.interface';

@Component({
  selector: 'app-custom-overlay',
  templateUrl: './custom-overlay.component.html',
  styleUrls: ['./custom-overlay.component.scss'],
})
export class AppCustomOverlayComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  private notificationMessage$: Observable<string>;
  public notificationMessage: string;

  constructor(private store$: Store<IStore>) {
    this.notificationMessage$ = this.store$.pipe(
      select(state => state.ui.notificationMessage)
    );
  }

  ngOnInit() {
    this.notificationMessage$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(message => (this.notificationMessage = message))
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
