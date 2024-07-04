import { Component, OnDestroy, OnInit } from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IStore } from 'app/shared/interfaces/store.interface';
import * as UiActions from 'app/shared/states/ui/ui.actions';
import { INavigator } from 'app/shared/states/ui/ui.interface';

import {
  CLICK_ON_LEAD_SAVE,
  CLICK_ON_LEAD_SUBMIT,
  VIEW_LEAD_PAGE,
} from 'app/core/events';

import { liveFormatPhoneNumber } from 'app/shared/helpers/utils.helper';
import { FacebookLeadsService } from 'app/shared/services/facebook-leads.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';

import {
  NUMBER_KEYS,
  SMOKE_FREE_LIST,
  VEHICLE_CONDITIONS,
} from 'app/core/constant';

import { FormControlService } from 'app/shared/services/form-control.service';
import { NotificationService } from 'app/shared/services/notification.service';

@Component({
  selector: 'app-user-lease',
  templateUrl: './user-lease.component.html',
  styleUrls: ['./user-lease.component.scss'],
})
export class UserLeaseComponent implements OnInit, OnDestroy {
  private pageTitle = 'Lease Information';
  private onDestroy$ = new Subject<void>();

  public leaseForm: FormGroup;
  public newForm: FormGroup;

  public leaseEndDateConfig = {
    dateInputFormat: 'MMMM YYYY',
    containerClass: 'theme-orange',
    minMode: 'month',
  };

  public leaseReturnDateConfig = {
    dateInputFormat: 'MMMM DD, YYYY',
    containerClass: 'theme-orange',
  };
  public minDate: any;
  public smokeFreeList: Array<any>;
  public vehicleConditionList: Array<any>;
  public numberKeysList: Array<any>;
  public uri: string;
  public show: boolean;
  public hasInfo: boolean;

  public navButtonClick$: Observable<INavigator>;

  constructor(
    private store$: Store<IStore>,
    private formBuilder: FormBuilder,
    private facebookLeadsService$: FacebookLeadsService,
    public formControlService: FormControlService,
    private notificationService$: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private segmentioService$: SegmentioService
  ) {}

  ngOnInit() {
    this.segmentioService$.page(
      VIEW_LEAD_PAGE.EVENT_NAME,
      VIEW_LEAD_PAGE.PROPERTY_NAME,
      VIEW_LEAD_PAGE.SCREEN_NAME,
      VIEW_LEAD_PAGE.ACTION_NAME
    );

    this.initSubHeader();
    this.minDate = new Date();
    this.show = false;
    this.hasInfo = false;

    this.uri = this.route.snapshot.queryParamMap.get('uri');
    this.uri = (this.uri && this.uri.trim()) || null;
    this.newForm = this.formBuilder.group({
      email: ['', Validators.required],
    });

    this.leaseForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      year: ['', Validators.required],
      make: ['', Validators.required],
      model: ['', Validators.required],
      mileage: ['', Validators.required],
      exterior_color: ['', Validators.required],
      interior_color: ['', Validators.required],
      vin: ['', Validators.required],
      vehicle_condition: [null, Validators.required],
      smoke_free: [null, Validators.required],
      number_keys: [null, Validators.required],
      bank_lender: ['', Validators.required],
      account: ['', Validators.required],
      payoff_amount: ['', Validators.required],
      leaseEndDate: [null, Validators.required],
    });

    this.smokeFreeList = SMOKE_FREE_LIST.map(item => {
      return {
        id: item.id,
        label: item.label,
      };
    });

    this.vehicleConditionList = VEHICLE_CONDITIONS.map(item => {
      return {
        id: item.id,
        label: item.label,
      };
    });

    this.numberKeysList = NUMBER_KEYS.map(item => {
      return {
        id: item.id,
        label: item.label,
      };
    });

    if (this.uri) {
      this.getData();
    } else {
      this.show = true;
    }
  }

  getData() {
    this.facebookLeadsService$.getLeadsInfo(this.uri).subscribe(
      data => {
        this.show = true;
        this.hasInfo = true;
        const lead = data.data;
        const phone = lead.FbUser['phone']
          ? lead.FbUser['phone'].substring(2)
          : '';
        this.leaseForm.setValue({
          firstName: lead.FbUser['first_name'],
          lastName: lead.FbUser['last_name'],
          email: lead.FbUser['email_address'],
          phone: liveFormatPhoneNumber(phone),
          year: lead['year'],
          make: lead['make'],
          model: lead['model'],
          mileage: lead['mileage'],
          exterior_color: lead['exterior_color'],
          interior_color: lead['interior_color'],
          vin: lead['vin'],
          vehicle_condition: lead['vehicle_condition'],
          smoke_free: lead['smoke_free'],
          number_keys: lead['number_keys'],
          bank_lender: lead['bank_lender'],
          account: lead['account'],
          payoff_amount: lead['payoff_amount'],
          leaseEndDate: lead['lease_end_date']
            ? new Date(lead['lease_end_date'])
            : null,
        });
      },
      err => {
        this.show = true;
        this.hasInfo = false;
        this.router.navigateByUrl('/lease');
      }
    );
  }

  onSaveButonClick() {
    this.segmentioService$.track(
      CLICK_ON_LEAD_SAVE.EVENT_NAME,
      CLICK_ON_LEAD_SAVE.PROPERTY_NAME,
      CLICK_ON_LEAD_SAVE.SCREEN_NAME,
      CLICK_ON_LEAD_SAVE.ACTION_NAME
    );
    this.submitData(false);
  }

  onApplyButonClick() {
    this.segmentioService$.track(
      CLICK_ON_LEAD_SUBMIT.EVENT_NAME,
      CLICK_ON_LEAD_SUBMIT.PROPERTY_NAME,
      CLICK_ON_LEAD_SUBMIT.SCREEN_NAME,
      CLICK_ON_LEAD_SUBMIT.ACTION_NAME
    );
    this.submitData(true);
  }

  submitData(submit_type: boolean) {
    if (submit_type && !this.leaseForm.valid) {
      this.formControlService.validateAllFormFields(this.leaseForm);
      return false;
    }
    const param = {
      uri: this.uri,
      email: this.leaseForm.value.email,
      first_name: this.leaseForm.value.firstName,
      last_name: this.leaseForm.value.lastName,
      phone: this.leaseForm.value.phone,
      year: this.leaseForm.value.year,
      make: this.leaseForm.value.make,
      mileage: this.leaseForm.value.mileage,
      model: this.leaseForm.value.model,
      exterior_color: this.leaseForm.value.exterior_color,
      interior_color: this.leaseForm.value.interior_color,
      vin: this.leaseForm.value.vin,
      vehicle_condition: this.leaseForm.value.vehicle_condition,
      smoke_free: this.leaseForm.value.smoke_free,
      number_keys: this.leaseForm.value.number_keys,
      bank_lender: this.leaseForm.value.bank_lender,
      account: this.leaseForm.value.account,
      payoff_amount: this.leaseForm.value.payoff_amount,
      lease_end_date:
        this.leaseForm.value.leaseEndDate &&
        this.leaseForm.value.leaseEndDate.toISOString(),
      is_submitted: submit_type,
    };
    this.store$.dispatch(new UiActions.SetLoadingStatus(true));

    this.facebookLeadsService$.storeLeadsInfo(param).subscribe(
      data => {
        if (submit_type) {
          this.notificationService$.success('Request successfully submitted');
        } else {
          this.notificationService$.success('Request successfully saved');
        }
        this.store$.dispatch(new UiActions.SetLoadingStatus(false));
      },
      err => {
        this.store$.dispatch(new UiActions.SetLoadingStatus(false));
      }
    );
  }

  onEmailSubmitClick() {
    if (this.newForm.valid) {
      const param = {
        email: this.newForm.value.email,
      };
      this.store$.dispatch(new UiActions.SetLoadingStatus(true));

      this.facebookLeadsService$.verifyEmail(param).subscribe(
        data => {
          this.notificationService$.success('Request successfully saved');
          this.store$.dispatch(new UiActions.SetLoadingStatus(false));
        },
        err => {
          this.store$.dispatch(new UiActions.SetLoadingStatus(false));
        }
      );
    } else {
      this.formControlService.validateAllFormFields(this.newForm);
    }
  }

  initSubHeader() {
    this.store$.dispatch(new UiActions.SetPrevPage(null));
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetShowNextLabel('Submit'));
    this.store$.dispatch(new UiActions.SetShowNextButton(true));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowRightBlock(false));
    this.store$.dispatch(new UiActions.SetCurrentPage(null));
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
