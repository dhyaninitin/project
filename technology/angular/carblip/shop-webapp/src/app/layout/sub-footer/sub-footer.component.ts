import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { IStore } from 'app/shared/interfaces/store.interface';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import * as UiActions from 'app/shared/states/ui/ui.actions';

@Component({
  selector: 'app-sub-footer',
  templateUrl: './sub-footer.component.html',
  styleUrls: ['./sub-footer.component.scss'],
})
export class SubFooterComponent implements OnInit, OnDestroy {
  public showNextButton$: Observable<boolean>;
  public showPrevButton$: Observable<boolean>;
  public showCancelSearch$: Observable<boolean>;
  public showSkipButton$: Observable<boolean>;
  public nextLabel$: Observable<string>;

  public showNextButton = false;
  public showPrevButton = false;
  public showCancelSearch = false;
  public showSkipButton = false;
  public nextLabel: string;

  private onDestroy$ = new Subject<void>();

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.showNextButton$ = this.store$.pipe(
      select(state => state.ui.showNextButton)
    );
    this.showPrevButton$ = this.store$.pipe(
      select(state => state.ui.showPrevButton)
    );
    this.showCancelSearch$ = this.store$.pipe(
      select(state => state.ui.showCancelSearch)
    );
    this.showSkipButton$ = this.store$.pipe(
      select(state => state.ui.showSkipButton)
    );
    this.nextLabel$ = this.store$.pipe(
      select(state => state.ui.nextButtonLabel)
    );

    this.showNextButton$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(showNextButton => (this.showNextButton = showNextButton))
      )
      .subscribe();
    this.showPrevButton$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(showPrevButton => (this.showPrevButton = showPrevButton))
      )
      .subscribe();
    this.showCancelSearch$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(showCancelSearch => (this.showCancelSearch = showCancelSearch))
      )
      .subscribe();
    this.showSkipButton$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(showSkipButton => (this.showSkipButton = showSkipButton))
      )
      .subscribe();
    this.nextLabel$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(nextLabel => (this.nextLabel = nextLabel))
      )
      .subscribe();
  }

  onNextButtonClick() {
    this.store$.dispatch(
      new UiActions.NavigateButtonClick({
        type: 'next',
        click: true,
      })
    );
  }

  onSkipButtonClick() {
    this.store$.dispatch(
      new UiActions.NavigateButtonClick({
        type: 'skip',
        click: true,
      })
    );
  }

  onPrevButtonClick() {
    this.store$.dispatch(
      new UiActions.NavigateButtonClick({
        type: 'previous',
        click: true,
      })
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
