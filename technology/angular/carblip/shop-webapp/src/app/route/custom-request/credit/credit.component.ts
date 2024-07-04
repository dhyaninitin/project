import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of, Subject } from 'rxjs';

import { Router } from '@angular/router';
import {
  CREDIT_ASSESSMENT_LIST,
  FIND_STEP_CUSTOM_REQUEST,
  FIND_STEP_CUSTOM_REQUEST_CREDIT,
} from 'app/core/constant';
import {
  CLICK_ON_CREDIT_EXCEL_CUSTOM,
  CLICK_ON_CREDIT_FAIR_CUSTOM,
  CLICK_ON_CREDIT_GOOD_CUSTOM,
  CLICK_ON_CREDIT_POOR_CUSTOM,
  VIEW_CUSTOM_REQUEST_CREDIT_PAGE,
} from 'app/core/events';
import { IStore } from 'app/shared/interfaces/store.interface';
import { CreateRequestService } from 'app/shared/services/create-request.service';
import { FormControlService } from 'app/shared/services/form-control.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import * as CustomRequestActions from 'app/shared/states/custom-request/custom-request.actions';
import { ICustomRequest } from 'app/shared/states/custom-request/custom-request.interface';
import {
  getCredetScore,
  getState,
} from 'app/shared/states/custom-request/custom-request.selectors';
import * as UiActions from 'app/shared/states/ui/ui.actions';
import { INavigator } from 'app/shared/states/ui/ui.interface';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-custom-request-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss'],
})
export class CustomRequestCreditComponent implements OnInit, OnDestroy {
  @ViewChild('requestConfirmationModal') requestConfirmationModal;

  private pageTitle = 'Custom Request';
  public firstFindStep = FIND_STEP_CUSTOM_REQUEST;
  public prevFindStep = FIND_STEP_CUSTOM_REQUEST;
  public currentFindStep = FIND_STEP_CUSTOM_REQUEST;
  public nextFindStep = FIND_STEP_CUSTOM_REQUEST_CREDIT;

  private onDestroy$ = new Subject<void>();
  public navButtonClick$: Observable<INavigator>;
  public creditScore$: Observable<number>;
  public customRequest$: Observable<ICustomRequest>;

  public creditScoreList = CREDIT_ASSESSMENT_LIST;
  public creditSelected: number;
  public customRequest: ICustomRequest;

  private requestConfirmationModalRef: BsModalRef;

  constructor(
    private store$: Store<IStore>,
    public formControlService: FormControlService,
    private router$: Router,
    private createRequestService$: CreateRequestService,
    private notificationService$: NotificationService,
    private modalService: BsModalService,
    private segmentioService$: SegmentioService
  ) {
    this.creditScore$ = this.store$.select(getCredetScore);
    this.customRequest$ = this.store$.select(getState);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.segmentioService$.page(
      VIEW_CUSTOM_REQUEST_CREDIT_PAGE.EVENT_NAME,
      VIEW_CUSTOM_REQUEST_CREDIT_PAGE.PROPERTY_NAME,
      VIEW_CUSTOM_REQUEST_CREDIT_PAGE.SCREEN_NAME,
      VIEW_CUSTOM_REQUEST_CREDIT_PAGE.ACTION_NAME
    );
    this.initSubHeader();

    this.creditScore$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => {
          this.creditSelected = data;
          this.onValueChages();
        })
      )
      .subscribe();

    this.customRequest$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => {
          this.customRequest = data;
        })
      )
      .subscribe();

    this.navButtonClick$ = this.store$.pipe(
      select(state => state.ui.navigateButtonClick)
    );
    this.navButtonClick$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => {
          this.onNavButtonClick(data);
        })
      )
      .subscribe();
  }

  onValueChages() {
    this.store$.dispatch(
      new UiActions.SetNextButtonActive(this.creditSelected !== null)
    );
  }

  initSubHeader() {
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetShowNextButton(true));
    this.store$.dispatch(new UiActions.SetNextButtonActive(false));
    this.store$.dispatch(new UiActions.SetPrevButtonActive(true));
    this.store$.dispatch(new UiActions.SetShowNextLabel('Submit'));
    this.store$.dispatch(new UiActions.SetShowPrevButton(true));
    this.store$.dispatch(new UiActions.SetCurrentPage(this.currentFindStep));
    this.store$.dispatch(new UiActions.SetNextPage(this.nextFindStep));
    this.store$.dispatch(new UiActions.SetPrevPage(this.prevFindStep));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowRightBlock(true));
  }

  onNavButtonClick(data: INavigator) {
    if (data.click) {
      this.store$.dispatch(new UiActions.ClearNavigateState());
      if (data.type === 'next') {
        this.goToNextStep();
      }
      if (data.type === 'previous') {
        this.gotToPreviousStep();
      }
    }
  }

  goToNextStep() {
    if (!this.creditSelected) {
      this.notificationService$.warning(
        'Please make a selection in order to continue.'
      );
      return;
    } else {
      const payload = {
        vehicle_type: this.customRequest.vehicle_type,
        price_type: this.customRequest.price_type ? 2 : 1,
        credit_score: this.creditSelected,
        buying_time: this.customRequest.buying_time,
        buying_method: this.customRequest.buying_method,
        min_price: this.customRequest.min_price,
        max_price: this.customRequest.max_price,
        referral_code: this.customRequest.referral_code[0],
        is_not_complete: 0,
      };

      this.store$.dispatch(new UiActions.SetLoadingStatus(true));
      this.createRequestService$
        .createRequestFromCustom(payload)
        .pipe(
          map(result => result),
          catchError(err => {
            return of(err);
          })
        )
        .subscribe(req => {
          this.store$.dispatch(new UiActions.SetLoadingStatus(false));
          if (req && req.success) {
            this.requestConfirmationModalRef = this.modalService.show(
              this.requestConfirmationModal,
              {
                class: 'modal-dialog-centered',
                ignoreBackdropClick: true,
              }
            );
          }
        });
    }
  }

  gotToPreviousStep() {
    this.store$.dispatch(new UiActions.ClearNavigateState());
    this.router$.navigate(['custom-request/' + this.prevFindStep]);
  }

  onCreditSelect(item) {
    this.creditSelected = item.id;
    this.store$.dispatch(new CustomRequestActions.SetCreditScore(item.id));
    switch (item.label) {
      case 'Excellent':
        this.segmentioService$.track(
          CLICK_ON_CREDIT_EXCEL_CUSTOM.EVENT_NAME,
          CLICK_ON_CREDIT_EXCEL_CUSTOM.PROPERTY_NAME,
          CLICK_ON_CREDIT_EXCEL_CUSTOM.SCREEN_NAME,
          CLICK_ON_CREDIT_EXCEL_CUSTOM.ACTION_NAME
        );
        break;
      case 'Good':
        this.segmentioService$.track(
          CLICK_ON_CREDIT_GOOD_CUSTOM.EVENT_NAME,
          CLICK_ON_CREDIT_GOOD_CUSTOM.PROPERTY_NAME,
          CLICK_ON_CREDIT_GOOD_CUSTOM.SCREEN_NAME,
          CLICK_ON_CREDIT_GOOD_CUSTOM.ACTION_NAME
        );
        break;
      case 'Fair':
        this.segmentioService$.track(
          CLICK_ON_CREDIT_FAIR_CUSTOM.EVENT_NAME,
          CLICK_ON_CREDIT_FAIR_CUSTOM.PROPERTY_NAME,
          CLICK_ON_CREDIT_FAIR_CUSTOM.SCREEN_NAME,
          CLICK_ON_CREDIT_FAIR_CUSTOM.ACTION_NAME
        );
        break;
      case 'Poor':
        this.segmentioService$.track(
          CLICK_ON_CREDIT_POOR_CUSTOM.EVENT_NAME,
          CLICK_ON_CREDIT_POOR_CUSTOM.PROPERTY_NAME,
          CLICK_ON_CREDIT_POOR_CUSTOM.SCREEN_NAME,
          CLICK_ON_CREDIT_POOR_CUSTOM.ACTION_NAME
        );
        break;
      default:
        break;
    }
  }

  confirmRequest() {
    if (this.requestConfirmationModalRef) {
      this.requestConfirmationModalRef.hide();
    }
    this.store$.dispatch(new UiActions.ClearNavigateState());
    this.router$.navigate(['my-request']);
  }
}
