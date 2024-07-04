import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';

import { egretAnimations } from 'app/shared/animations/egret-animations';
import { getBoolColor, getUserFullName } from 'app/shared/helpers/utils';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import * as commonModels from 'app/shared/models/common.model';
import { Log, LogResponse } from 'app/shared/models/log.model';
import { MDealer } from 'app/shared/models/mdealer.model';
import { MDealerService } from 'app/shared/services/apis/mdealer.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/mdealers/mdealers.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/mdealers/mdealers.selectors';
import { initialState } from 'app/store/mdealers/mdealers.states';
import { NgxRolesService } from 'ngx-permissions';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { Location } from '@angular/common';

@Component({
  selector: 'app-mdealers-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.style.scss'],
  animations: [fadeInRight400ms]
})
export class MDealersDetailComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public dealerId: string;
  public isReady: boolean;
  public dealer: MDealer;

  public getBoolColor = getBoolColor;

  constructor(
    private store$: Store<AppState>,
    private route$: ActivatedRoute,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private loader$: AppLoaderService,
    private confirmService$: AppConfirmService,
    private service$: MDealerService,
    private location: Location
  ) {}

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.isReady = false;
    this.route$.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.dealerId = params.get('id');
      this.initData();
    });
  }

  initData() {
    setTimeout(() => {
      this.loader$.open();
    }, 10);

    combineLatest(this.service$.getById(this.dealerId))
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(([result]) => {
        this.loader$.close();
        this.dealer = result.data;
        this.isReady = true;
        this.changeDetectorRefs.detectChanges();
      });
  }
}
