import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IStore } from 'app/shared/interfaces/store.interface';
import { getLoadingStatus } from 'app/shared/states/ui/ui.selectors';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class AppLoaderComponent implements OnInit, OnDestroy {
  isVisible = true;

  private onDestroy$ = new Subject<void>();
  public fetchingBrand$: Observable<boolean>;
  public fetchingModel$: Observable<boolean>;
  public fetchingTrim$: Observable<boolean>;
  public fetchingConfiguration$: Observable<boolean>;
  public fetchingConfigurationProcessing$: Observable<boolean>;
  public fetchingMyRequests$: Observable<boolean>;
  public fetchingSearch$: Observable<boolean>;

  public showLoading$: Observable<boolean>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.showLoading$ = this.store$.select(getLoadingStatus);

    this.fetchingBrand$ = this.store$.pipe(
      select(state => state.brand.fetching)
    );
    this.fetchingModel$ = this.store$.pipe(
      select(state => state.model.fetching)
    );
    this.fetchingTrim$ = this.store$.pipe(select(state => state.trim.fetching));

    this.fetchingConfiguration$ = this.store$.pipe(
      select(state => state.configuration.fetching)
    );

    this.fetchingMyRequests$ = this.store$.pipe(
      select(state => state.myRequests.fetching)
    );

    this.fetchingSearch$ = this.store$.pipe(
      select(state => state.search.fetching)
    );

    combineLatest(
      this.showLoading$,
      this.fetchingBrand$,
      this.fetchingModel$,
      this.fetchingTrim$,
      this.fetchingConfiguration$,
      this.fetchingMyRequests$,
      this.fetchingSearch$
    )
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        ([
          status,
          fetchingBrand,
          fetchingModel,
          fetchingTrim,
          fetchingConfiguration,
          fetchingMyRequests,
          fetchingSearch,
        ]) => {
          this.isVisible =
            status ||
            fetchingBrand ||
            fetchingModel ||
            fetchingTrim ||
            fetchingConfiguration ||
            fetchingMyRequests ||
            fetchingSearch;
        }
      );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
