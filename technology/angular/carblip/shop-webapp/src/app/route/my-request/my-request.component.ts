import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { COMMING_SOON_IMG, NOTIFICATION_LIST } from 'app/core/constant';
import { kFormatter } from 'app/shared/helpers/utils.helper';
import { IStore } from 'app/shared/interfaces/store.interface';
import { CustomOverlayService } from 'app/shared/services/custom-overlay.service';
import * as RequestsAcions from 'app/shared/states/my-request/myrequests.actions';
import {
  IRequest,
  IVehicleMediaitem,
  IVehicleRequestPreferenceObj,
} from 'app/shared/states/my-request/myrequests.interfaces';
import {
  getRequestsAsArray,
  selectCurrentMyRequestId,
} from 'app/shared/states/my-request/myrequests.selectors';
import * as UiActions from 'app/shared/states/ui/ui.actions';
import { INavigator } from 'app/shared/states/ui/ui.interface';

@Component({
  selector: 'app-my-request',
  templateUrl: './my-request.component.html',
  styleUrls: ['./my-request.component.scss'],
})
export class MyRequestComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  public request$: Observable<IRequest[]>;
  public didFetch$: Observable<boolean>;
  public selectedId$: Observable<number>;
  public navButtonClick$: Observable<INavigator>;

  private pageTitle = 'My Requests';
  public countPerPage = 12;
  public request: any = [];
  public p: number;
  public commingSoonImg = COMMING_SOON_IMG;
  public selectedId: number;

  constructor(
    private store$: Store<IStore>,
    private overlayService$: CustomOverlayService,
    private router$: Router
  ) {}

  ngOnInit() {
    this.store$.dispatch(new RequestsAcions.ClearRequestList());
    this.initSubHeader();

    this.didFetch$ = this.store$.select(state => state.myRequests.didFetch);
    this.request$ = this.store$.select(getRequestsAsArray);
    this.selectedId$ = this.store$.select(selectCurrentMyRequestId);

    this.selectedId$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(selectedId => {
          this.selectedId = selectedId;
        })
      )
      .subscribe();
    this.didFetch$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(didFetch => {
          if (!didFetch) {
            const payload = {
              page: 1,
              count: 9,
            };
            this.store$.dispatch(new RequestsAcions.FetchRequestList(payload));
          }
        })
      )
      .subscribe();

    this.request$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(request => {
          this.request = request ? request : [];
          this.request.sort((a, b) => {
            return a.request_made_at > b.request_made_at ? -1 : 1;
          });
        })
      )
      .subscribe();

    this.navButtonClick$ = this.store$.select(
      state => state.ui.navigateButtonClick
    );
    this.navButtonClick$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(data => {
          this.onNavButtonClick(data);
        })
      )
      .subscribe();
  }

  initSubHeader() {
    this.store$.dispatch(new UiActions.SetPrevPage(null));
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.HideAllComponent());
    // this.store$.dispatch(
    //   new UiActions.SetShowNextLabel('Go to Credit Application')
    // );
    // this.store$.dispatch(new UiActions.SetShowNextButton(true));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowRightBlock(true));
    this.store$.dispatch(new UiActions.SetCurrentPage(null));
  }

  onNavButtonClick(data: INavigator) {
    if (data.click) {
      this.store$.dispatch(new UiActions.ClearNavigateState());
      if (data.type === 'next') {
        this.goToNextStep();
      }
    }
  }

  goToNextStep() {
    if (!this.selectedId) {
      this.store$.dispatch(
        new UiActions.SetNotificationMessage(NOTIFICATION_LIST.noMyRequestItem)
      );
      this.overlayService$.open();
      return;
    }
    this.router$.navigate(['credit-application'], {
      queryParams: { request_id: this.selectedId },
      queryParamsHandling: 'merge',
    });
  }

  getImage(id) {
    const medias: Array<IVehicleMediaitem> =
      this.request[id].VehicleMedias || [];
    return medias.map(item => item.url_640).sort();
  }

  getColors(id, type) {
    const request: IRequest = this.request[id];
    const preference: IVehicleRequestPreferenceObj = JSON.parse(
      request.VehicleRequestPreference.preferences
    );
    if (type === 'exterior') {
      return request.exterior_colors.find(
        item => item.chrome_option_code === preference.exterior_colors[0]
      );
    } else {
      return request.interior_colors.find(
        item => item.chrome_option_code === preference.interior_colors[0]
      );
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  formatNumber(number) {
    let formattedNumber = '';
    for (let i = 0; i <= number.length - 1; i++) {
      formattedNumber += number[i];
      if (number.length - i > 5 && (number.length - i - 1) % 3 === 0) {
        formattedNumber += ',';
      }
    }
    return formattedNumber;
  }

  getPrice(item: IRequest) {
    return kFormatter(item.min_price) + ' - ' + kFormatter(item.max_price);
  }

  isColorLoaded(item: IRequest) {
    return (
      item.exterior_colors &&
      item.exterior_colors.length &&
      item.interior_colors &&
      item.interior_colors.length
    );
  }

  selectMyRequest(item: IRequest) {
    if (item.id === this.selectedId) {
      this.store$.dispatch(new RequestsAcions.SelectMyRequest(null));
    } else {
      this.store$.dispatch(new RequestsAcions.SelectMyRequest(item.id));
    }
  }

  getVehiclePrice(item: IRequest) {
    switch (item.buying_method) {
      case 2:
      case 3:
        return item.formatted_price || 0;
        break;
      case 1:
      default:
        return item.total_price || 0;
        break;
    }
  }
}
