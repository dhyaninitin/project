import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';

import { QUOTE } from 'app/core/errors';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { getBoolColor, getUserFullName } from 'app/shared/helpers/utils';
import * as commonModels from 'app/shared/models/common.model';
import { Log, LogResponse } from 'app/shared/models/log.model';
import { Quote } from 'app/shared/models/quote.model';
import { Request } from 'app/shared/models/request.model';
import { QuoteService } from 'app/shared/services/apis/quotes.service';
import { RequestService } from 'app/shared/services/apis/requests.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { AppState } from 'app/store/';
import { AddError } from 'app/store/error/error.actions';
import * as quoteActions from 'app/store/quotes/quotes.actions';
import * as actions from 'app/store/requests/requests.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/requests/requests.selectors';
import { initialState } from 'app/store/requests/requests.states';
import { NgxRolesService } from 'ngx-permissions';
import { CarsDirectService } from 'app/shared/services/apis/cars-direct.service';
import { CarsDirect } from 'app/shared/models/cars-direct.model';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { Location } from '@angular/common';

@Component({
  selector: 'app-requests-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.style.scss'],
  animations: [fadeInRight400ms],
})
export class CarsDirectDetailComponent implements OnInit, OnDestroy {
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;

  private onDestroy$ = new Subject<void>();

  public requestId: string;
  public isReady: boolean;
  public carsData: CarsDirect;

  constructor(
    private store$: Store<AppState>,
    private route$: ActivatedRoute,
    private router$: Router,
    private changeDetectorRefs: ChangeDetectorRef,
    private loader$: AppLoaderService,
    private service$: CarsDirectService,
    private location: Location
  ) {}

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    setTimeout(() => {
      this.loader$.open();
    }, 10);
    this.route$.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.requestId = params.get('id');
      this.initData();
    });

  }

  initData() {
    combineLatest(
      this.service$.getById(this.requestId),
    )
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(([result, logResonse]) => {
        this.loader$.close();
        this.carsData = result.data;

        this.isReady = true;
        this.changeDetectorRefs.detectChanges();
      });
  }

}
