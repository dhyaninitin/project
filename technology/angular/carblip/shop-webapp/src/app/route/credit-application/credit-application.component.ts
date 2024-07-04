import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment-timezone';
import { CustomValidators } from 'ng2-validation';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  COMMING_SOON_IMG,
  CREDIT_APP_EMPLOYMENT,
  CREDIT_APP_IDENTIFICATION,
  CREDIT_APP_PERSONAL,
  CREDIT_APP_RESIDENCE,
  CREDIT_APP_REVIEW,
  CREDIT_APPLICATION_CO,
  CREDIT_APPLICATION_PRIMARY,
  NOTIFICATION_LIST,
  RESIDENCE_TYPES,
  STATE_LIST,
  STEPS_CREDIT_APPLICATION,
} from 'app/core/constant';
import {
  CLICK_ON_DRIVER_LICENSE_STATE_INDIVIDUAL,
  CLICK_ON_DRIVER_LICENSE_STATE_JOINT,
  CLICK_ON_INDIVIDUAL,
  CLICK_ON_JOINT,
  CLICK_ON_RESIDENCE_STATE_INDIVIDUAL,
  CLICK_ON_RESIDENCE_STATE_JOINT,
  CLICK_ON_RESIDENCE_TYPE_INDIVIDUAL,
  CLICK_ON_RESIDENCE_TYPE_JOINT,
  CLICK_ON_SBUMIT_CA,
  VIEW_CA_EMPLOYMENT_INFO_PAGE,
  VIEW_CA_IDENTIFICATION_PAGE,
  VIEW_CA_PERSONAL_INFO_PAGE,
  VIEW_CA_RESIDENCE_INFO_PAGE,
  VIEW_CA_REVIEW_PAGE,
} from 'app/core/events';
import {
  formatPhoneNumberDomestic,
  kFormatter,
} from 'app/shared/helpers/utils.helper';
import { IStore } from 'app/shared/interfaces/store.interface';
import { CreditApplicationService } from 'app/shared/services/credit-application.service';
import { CustomOverlayService } from 'app/shared/services/custom-overlay.service';
import { FormControlService } from 'app/shared/services/form-control.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { QueryService } from 'app/shared/services/query.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import { IProfile } from 'app/shared/states/auth/auth.interfaces';
import { getUserData } from 'app/shared/states/auth/auth.selectors';
import * as creditApplicationAction from 'app/shared/states/credit-application/credit-application.actions';
import { ICreditApplicaiton } from 'app/shared/states/credit-application/credit-application.interface';
import { getState } from 'app/shared/states/credit-application/credit-application.selectors';
import {
  IRequest,
  IVehicleMediaitem,
} from 'app/shared/states/my-request/myrequests.interfaces';
import { selectCurrentMyRequest } from 'app/shared/states/my-request/myrequests.selectors';
import * as UiActions from 'app/shared/states/ui/ui.actions';
import { INavigator } from 'app/shared/states/ui/ui.interface';

@Component({
  selector: 'app-credit-application',
  templateUrl: './credit-application.component.html',
  styleUrls: ['./credit-application.component.scss'],
  animations: [
    trigger('collapse', [
      state(
        'open',
        style({
          opacity: '1',
          display: 'block',
          transform: 'translate3d(0, 0, 0)',
        })
      ),
      state(
        'closed',
        style({
          opacity: '0',
          display: 'none',
          transform: 'translate3d(0, -100%, 0)',
        })
      ),
      transition('closed => open', animate('200ms ease-in')),
      transition('open => closed', animate('100ms ease-out')),
    ]),
  ],
})
export class CreditApplicationComponent implements OnInit, OnDestroy {
  @ViewChild('requestConfirmationModal') requestConfirmationModal;

  private pageTitle = 'Credit Application';
  private subTitle = 'Personal Information';
  private onDestroy$ = new Subject<void>();

  public navButtonClick$: Observable<INavigator>;
  public selectedRequest$: Observable<IRequest>;
  public creditApplication$: Observable<ICreditApplicaiton>;

  public personalFormPrimary: FormGroup;
  public personalFormCo: FormGroup;
  public residenceFormPrimary: FormGroup;
  public residenceFormCo: FormGroup;
  public employmentFormPrimary: FormGroup;
  public employmentFormCo: FormGroup;
  public identificationFormPrimary: FormGroup;
  public identificationFormCo: FormGroup;
  public selectedMyRequest: IRequest;
  public creditApplication: ICreditApplicaiton;
  public userData$: Observable<IProfile>;

  public dateOfBirthConfig = {
    dateInputFormat: 'MMMM DD, YYYY',
    containerClass: 'theme-orange',
  };

  public steps = STEPS_CREDIT_APPLICATION ? STEPS_CREDIT_APPLICATION : [];
  public currentStep = CREDIT_APP_PERSONAL;
  public wayOfApplying: number;
  public residenceTypeList = RESIDENCE_TYPES;
  public stateList = STATE_LIST;
  public userDetails: IProfile;

  private requestConfirmationModalRef: BsModalRef;
  public commingSoonImg = COMMING_SOON_IMG;
  public isReady: Boolean = false;

  private queryParam: object;

  constructor(
    private store$: Store<IStore>,
    private formBuilder: FormBuilder,
    private notificationService$: NotificationService,
    private formControlService$: FormControlService,
    private router$: Router,
    private modalService: BsModalService,
    private creditApplicationService$: CreditApplicationService,
    private segmentioService$: SegmentioService,
    private overlayService$: CustomOverlayService,
    private activatedRoute: ActivatedRoute,
    private queryService$: QueryService
  ) {}

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.initSubHeader();
    this.creditApplication$ = this.store$.select(getState);
    this.selectedRequest$ = this.store$.select(selectCurrentMyRequest);
    this.userData$ = this.store$.pipe(select(getUserData));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params && params['request_id']) {
        this.queryParam = params;
      }
    });

    this.userData$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => {
          if (typeof data !== 'undefined') {
            this.userDetails = data;
          }
        })
      )
      .subscribe();

    this.selectedRequest$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(item => {
          if (!item) {
            if (this.queryParam) {
              this.queryService$.requestQuery(this.queryParam['request_id']);
            } else {
              this.store$.dispatch(
                new UiActions.SetNotificationMessage(
                  NOTIFICATION_LIST.noMyRequestItem
                )
              );
              this.overlayService$.open();

              this.router$.navigate(['my-request']);
              return false;
            }
          } else {
            this.selectedMyRequest = item;
            this.initData();
          }
        })
      )
      .subscribe();
  }

  initData() {
    if (this.selectedMyRequest.has_credit_application) {
      this.store$.dispatch(new UiActions.SetLoadingStatus(true));
      this.creditApplicationService$
        .getCreditApplication(this.selectedMyRequest.id)
        .pipe(
          map(result => result),
          catchError(err => {
            return of(err);
          })
        )
        .subscribe(req => {
          this.store$.dispatch(new UiActions.SetLoadingStatus(false));
          if (req && req.success) {
            this.loadData(req.data);
          }
          this.redirectTo(STEPS_CREDIT_APPLICATION[4]);
          this.isReady = true;
        });
    } else {
      this.creditApplicationService$.getCreditApplication(0).subscribe();
      this.creditApplication$
        .pipe(
          takeUntil(this.onDestroy$),
          tap((creditApplication: ICreditApplicaiton) => {
            this.creditApplication = creditApplication;
            this.loadData(null);
            this.isReady = true;
          })
        )
        .subscribe();
    }

    this.navButtonClick$ = this.store$.pipe(
      select(storeState => storeState.ui.navigateButtonClick)
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

  loadData(data) {
    const initData = {
      primary: {
        firstName: '',
        mi: '',
        lastName: '',
        phoneNumber: '',
        emailAddress: '',
        dateOfBirth: null,
        residenceType: null,
        mortage: '',
        streetAddress: '',
        apt: '',
        city: '',
        state: '',
        zipCode: '',
        employerName: '',
        employerAddress: '',
        employerPhone: '',
        securityNumber: '',
        confirmSecurityNumber: '',
        driverLicenseState: '',
        driverLicenseNumber: '',
        grossIncome: '',
      },
      co: {
        firstName: '',
        mi: '',
        lastName: '',
        phoneNumber: '',
        emailAddress: '',
        dateOfBirth: null,
        residenceType: null,
        mortage: '',
        streetAddress: '',
        apt: '',
        city: '',
        state: null,
        zipCode: '',
        employerName: '',
        employerAddress: '',
        employerPhone: '',
        securityNumber: '',
        confirmSecurityNumber: '',
        driverLicenseState: null,
        driverLicenseNumber: '',
        grossIncome: '',
      },
    };
    if (data) {
      this.wayOfApplying = data.way_of_applying;

      if (data.primary) {
        initData.primary.firstName = data.primary.first_name || '';
        initData.primary.mi = data.primary.middle_name || '';
        initData.primary.lastName = data.primary.last_name || '';
        initData.primary.phoneNumber = data.primary.phone || '';
        initData.primary.emailAddress = data.primary.email_address || '';
        initData.primary.dateOfBirth = data.primary.date_of_birth || null;
        initData.primary.residenceType =
          parseInt(data.primary.residence_type, 10) || null;
        initData.primary.mortage = data.primary.monthly_rent || '';
        initData.primary.streetAddress = data.primary.street_address || '';
        initData.primary.apt = data.primary.apt || '';
        initData.primary.city = data.primary.city || '';
        initData.primary.state = data.primary.state || null;
        initData.primary.zipCode = data.primary.zipcode || '';
        initData.primary.employerName = data.primary.employer_name || '';
        initData.primary.employerAddress = data.primary.employer_address || '';
        initData.primary.employerPhone = data.primary.employer_phone || '';
        initData.primary.securityNumber =
          data.primary.social_security_number || '';
        initData.primary.driverLicenseState =
          data.primary.driver_licence_state || '';
        initData.primary.driverLicenseNumber =
          data.primary.driver_licence_number || '';
        initData.primary.grossIncome = data.primary.gross_monthly_income || '';
      }
      if (data.co) {
        initData.co.firstName = data.co.first_name || '';
        initData.co.mi = data.co.middle_name || '';
        initData.co.lastName = data.co.last_name || '';
        initData.co.phoneNumber = data.co.phone || '';
        initData.co.emailAddress = data.co.email_address || '';
        initData.co.dateOfBirth = data.co.date_of_birth || null;
        initData.co.residenceType =
          parseInt(data.co.residence_type, 10) || null;
        initData.co.mortage = data.co.monthly_rent || '';
        initData.co.streetAddress = data.co.street_address || '';
        initData.co.apt = data.co.apt || '';
        initData.co.city = data.co.city || '';
        initData.co.state = data.co.state || null;
        initData.co.zipCode = data.co.zipcode || '';
        initData.co.employerName = data.co.employer_name || '';
        initData.co.employerAddress = data.co.employer_address || '';
        initData.co.employerPhone = data.co.employer_phone || '';
        initData.co.securityNumber = data.co.social_security_number || '';
        initData.co.driverLicenseState = data.co.driver_licence_state || '';
        initData.co.driverLicenseNumber = data.co.driver_licence_number || '';
        initData.co.grossIncome = data.co.gross_monthly_income || '';
      }
    } else if (this.creditApplication) {
      this.wayOfApplying = this.creditApplication.wayOfApplying;
      initData.primary = Object.assign(
        initData.primary,
        this.creditApplication.primary
      );
      initData.co = Object.assign(initData.co, this.creditApplication.co);
      initData.primary.firstName = initData.co.firstName = this.userDetails.first_name;
      initData.primary.phoneNumber = initData.co.phoneNumber = formatPhoneNumberDomestic(
        this.userDetails.phone
      );
      initData.primary.emailAddress = initData.co.emailAddress = this.userDetails.email_address;
    }

    this.personalFormPrimary = this.formBuilder.group({
      firstName: [initData.primary.firstName, Validators.required],
      mi: [initData.primary.mi],
      lastName: [initData.primary.lastName, Validators.required],
      phoneNumber: [initData.primary.phoneNumber, Validators.required],
      emailAddress: [initData.primary.emailAddress, Validators.required],
      dateOfBirth: [initData.primary.dateOfBirth, Validators.required],
    });

    this.personalFormCo = this.formBuilder.group({
      firstName: [initData.co.firstName, Validators.required],
      mi: [initData.co.mi],
      lastName: [initData.co.lastName, Validators.required],
      phoneNumber: [initData.co.phoneNumber, Validators.required],
      emailAddress: [initData.co.emailAddress, Validators.required],
      dateOfBirth: [initData.co.dateOfBirth, Validators.required],
    });

    this.residenceFormPrimary = this.formBuilder.group({
      residenceType: [initData.primary.residenceType, Validators.required],
      mortage: [initData.primary.mortage, Validators.required],
      streetAddress: [initData.primary.streetAddress],
      apt: [initData.primary.apt],
      city: [initData.primary.city, Validators.required],
      state: [initData.primary.state, Validators.required],
      zipCode: [initData.primary.zipCode, Validators.required],
    });

    this.residenceFormCo = this.formBuilder.group({
      residenceType: [initData.co.residenceType, Validators.required],
      mortage: [initData.co.mortage, Validators.required],
      streetAddress: [initData.co.streetAddress],
      apt: [initData.co.apt],
      city: [initData.co.city, Validators.required],
      state: [initData.co.state, Validators.required],
      zipCode: [initData.co.zipCode, Validators.required],
    });

    this.employmentFormPrimary = this.formBuilder.group({
      employerName: [initData.primary.employerName, Validators.required],
      employerAddress: [initData.primary.employerAddress, Validators.required],
      employerPhone: [initData.primary.employerPhone, Validators.required],
      grossIncome: [initData.primary.grossIncome, Validators.required],
    });

    this.employmentFormCo = this.formBuilder.group({
      employerName: [initData.co.employerName, Validators.required],
      employerAddress: [initData.co.employerAddress, Validators.required],
      employerPhone: [initData.co.employerPhone, Validators.required],
      grossIncome: [initData.co.grossIncome, Validators.required],
    });

    const securityNumber = new FormControl(initData.primary.securityNumber, [
      Validators.required,
      Validators.minLength(9),
    ]);
    const confirmSecurityNumber = new FormControl(
      initData.primary.securityNumber,
      [
        CustomValidators.equalTo(securityNumber),
        Validators.required,
        Validators.minLength(9),
      ]
    );

    this.identificationFormPrimary = this.formBuilder.group({
      securityNumber: securityNumber,
      confirmSecurityNumber: confirmSecurityNumber,
      driverLicenseState: [initData.primary.driverLicenseState],
      driverLicenseNumber: [
        initData.primary.driverLicenseNumber,
        Validators.required,
      ],
    });

    const coSecurityNumber = new FormControl(initData.co.securityNumber, [
      Validators.required,
      Validators.minLength(9),
    ]);
    const coConfirmSecurityNumber = new FormControl(
      initData.co.securityNumber,
      [
        CustomValidators.equalTo(coSecurityNumber),
        Validators.required,
        Validators.minLength(9),
      ]
    );

    this.identificationFormCo = this.formBuilder.group({
      securityNumber: coSecurityNumber,
      confirmSecurityNumber: coConfirmSecurityNumber,
      driverLicenseState: [initData.co.driverLicenseState],
      driverLicenseNumber: [
        initData.co.driverLicenseNumber,
        Validators.required,
      ],
    });
  }

  initSubHeader() {
    this.store$.dispatch(new UiActions.SetPrevPage(null));
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetShowNextLabel('Save + Next'));
    this.store$.dispatch(new UiActions.SetShowNextButton(true));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowRightBlock(true));
    this.store$.dispatch(new UiActions.SetCurrentPage(null));
  }

  getImage() {
    const medias: Array<IVehicleMediaitem> =
      this.selectedMyRequest.VehicleMedias || [];
    return medias.map(item => item.url_640).sort();
  }

  completed(step: string, currentStep: string) {
    if (!currentStep) {
      return false;
    }
    const _currentStep = this.steps.find(_step => _step.step === currentStep);
    if (!_currentStep) {
      return false;
    }
    const currentStepId = _currentStep.id;
    const completedSteps = this.steps.filter(_step => _step.id < currentStepId);
    return completedSteps.find(_step => _step.step === step) ? true : false;
  }

  onApplyingSelect(type: number) {
    this.wayOfApplying = type;
    if (type === 1) {
      this.segmentioService$.track(
        CLICK_ON_INDIVIDUAL.EVENT_NAME,
        CLICK_ON_INDIVIDUAL.PROPERTY_NAME,
        CLICK_ON_INDIVIDUAL.SCREEN_NAME,
        CLICK_ON_INDIVIDUAL.ACTION_NAME
      );
    } else if (type === 2) {
      this.segmentioService$.track(
        CLICK_ON_JOINT.EVENT_NAME,
        CLICK_ON_JOINT.PROPERTY_NAME,
        CLICK_ON_JOINT.SCREEN_NAME,
        CLICK_ON_JOINT.ACTION_NAME
      );
    }
  }

  onChangeResidenceType(e, type) {
    if (typeof e !== 'undefined') {
      if (type === 'primary') {
        const property_name = CLICK_ON_RESIDENCE_TYPE_INDIVIDUAL.PROPERTY_NAME.replace(
          '[?]',
          e.label
        );

        this.segmentioService$.track(
          CLICK_ON_RESIDENCE_TYPE_INDIVIDUAL.EVENT_NAME,
          property_name,
          CLICK_ON_RESIDENCE_TYPE_INDIVIDUAL.SCREEN_NAME,
          CLICK_ON_RESIDENCE_TYPE_INDIVIDUAL.ACTION_NAME
        );
      } else if (type === 'co') {
        const property_name = CLICK_ON_RESIDENCE_TYPE_JOINT.PROPERTY_NAME.replace(
          '[?]',
          e.label
        );

        this.segmentioService$.track(
          CLICK_ON_RESIDENCE_TYPE_JOINT.EVENT_NAME,
          property_name,
          CLICK_ON_RESIDENCE_TYPE_JOINT.SCREEN_NAME,
          CLICK_ON_RESIDENCE_TYPE_JOINT.ACTION_NAME
        );
      }
    }
  }

  onChangeResidenceState(e, type) {
    if (typeof e !== 'undefined') {
      if (type === 'primary') {
        const property_name = CLICK_ON_RESIDENCE_STATE_INDIVIDUAL.PROPERTY_NAME.replace(
          '[?]',
          e.id
        );

        this.segmentioService$.track(
          CLICK_ON_RESIDENCE_STATE_INDIVIDUAL.EVENT_NAME,
          property_name,
          CLICK_ON_RESIDENCE_STATE_INDIVIDUAL.SCREEN_NAME,
          CLICK_ON_RESIDENCE_STATE_INDIVIDUAL.ACTION_NAME
        );
      } else if (type === 'co') {
        const property_name = CLICK_ON_RESIDENCE_STATE_JOINT.PROPERTY_NAME.replace(
          '[?]',
          e.id
        );

        this.segmentioService$.track(
          CLICK_ON_RESIDENCE_STATE_JOINT.EVENT_NAME,
          property_name,
          CLICK_ON_RESIDENCE_STATE_JOINT.SCREEN_NAME,
          CLICK_ON_RESIDENCE_STATE_JOINT.ACTION_NAME
        );
      }
    }
  }

  onChangeDriverLicenseState(e, type) {
    if (typeof e !== 'undefined') {
      if (type === 'primary') {
        const property_name = CLICK_ON_DRIVER_LICENSE_STATE_INDIVIDUAL.PROPERTY_NAME.replace(
          '[?]',
          e.id
        );

        this.segmentioService$.track(
          CLICK_ON_DRIVER_LICENSE_STATE_INDIVIDUAL.EVENT_NAME,
          property_name,
          CLICK_ON_DRIVER_LICENSE_STATE_INDIVIDUAL.SCREEN_NAME,
          CLICK_ON_DRIVER_LICENSE_STATE_INDIVIDUAL.ACTION_NAME
        );
      } else if (type === 'co') {
        const property_name = CLICK_ON_DRIVER_LICENSE_STATE_JOINT.PROPERTY_NAME.replace(
          '[?]',
          e.id
        );

        this.segmentioService$.track(
          CLICK_ON_DRIVER_LICENSE_STATE_JOINT.EVENT_NAME,
          property_name,
          CLICK_ON_DRIVER_LICENSE_STATE_JOINT.SCREEN_NAME,
          CLICK_ON_DRIVER_LICENSE_STATE_JOINT.ACTION_NAME
        );
      }
    }
  }

  getSubTitle(type: string) {
    if (this.wayOfApplying === CREDIT_APPLICATION_CO) {
      if (type === 'primary') {
        return this.subTitle + ' (Primary Applicant)';
      } else {
        return this.subTitle + ' (Co-Applicant)';
      }
    }
    return this.subTitle;
  }

  onNavButtonClick(data: INavigator) {
    if (data.click) {
      this.store$.dispatch(new UiActions.ClearNavigateState());
      if (data.type === 'next') {
        this.goToNextStep();
      }
      if (data.type === 'previous') {
        this.store$.dispatch(new UiActions.ClearNavigateState());
        this.gotToPreviousStep();
      }
    }
  }

  goToPersonalStep() {
    this.segmentioService$.page(
      VIEW_CA_PERSONAL_INFO_PAGE.EVENT_NAME,
      VIEW_CA_PERSONAL_INFO_PAGE.PROPERTY_NAME,
      VIEW_CA_PERSONAL_INFO_PAGE.SCREEN_NAME,
      VIEW_CA_PERSONAL_INFO_PAGE.ACTION_NAME
    );
    this.store$.dispatch(new UiActions.SetShowNextLabel('Save + Next'));
    this.currentStep = CREDIT_APP_PERSONAL;
    this.subTitle = 'Personal Information';
    return true;
  }

  goToResidenceStep() {
    this.segmentioService$.page(
      VIEW_CA_RESIDENCE_INFO_PAGE.EVENT_NAME,
      VIEW_CA_RESIDENCE_INFO_PAGE.PROPERTY_NAME,
      VIEW_CA_RESIDENCE_INFO_PAGE.SCREEN_NAME,
      VIEW_CA_RESIDENCE_INFO_PAGE.ACTION_NAME
    );
    if (this.wayOfApplying === CREDIT_APPLICATION_PRIMARY) {
      if (!this.personalFormPrimary.valid) {
        this.formControlService$.validateAllFormFields(
          this.personalFormPrimary
        );
        return false;
      }
    } else if (this.wayOfApplying === CREDIT_APPLICATION_CO) {
      if (!this.personalFormPrimary.valid || !this.personalFormCo.valid) {
        this.formControlService$.validateAllFormFields(
          this.personalFormPrimary
        );
        this.formControlService$.validateAllFormFields(this.personalFormCo);
        return false;
      }
    } else {
      return false;
    }

    const data = {
      wayOfApplying: this.wayOfApplying,
      primary: {},
      co: {},
    };

    const primary_dob = moment(
      this.personalFormPrimary.value.dateOfBirth
    ).format('YYYY-MM-DD');
    data.primary = {
      firstName: this.personalFormPrimary.value.firstName,
      mi: this.personalFormPrimary.value.mi,
      lastName: this.personalFormPrimary.value.lastName,
      phoneNumber: this.personalFormPrimary.value.phoneNumber,
      emailAddress: this.personalFormPrimary.value.emailAddress,
      dateOfBirth: primary_dob,
    };
    if (this.wayOfApplying === CREDIT_APPLICATION_CO) {
      const co_dob = moment(this.personalFormCo.value.dateOfBirth).format(
        'YYYY-MM-DD'
      );
      data.co = {
        firstName: this.personalFormCo.value.firstName,
        mi: this.personalFormCo.value.mi,
        lastName: this.personalFormCo.value.lastName,
        phoneNumber: this.personalFormCo.value.phoneNumber,
        emailAddress: this.personalFormCo.value.emailAddress,
        dateOfBirth: co_dob,
      };
    }

    this.store$.dispatch(
      new creditApplicationAction.SetCreditApplicationData(data)
    );

    this.store$.dispatch(new UiActions.SetShowNextLabel('Save + Next'));
    this.currentStep = CREDIT_APP_RESIDENCE;
    this.subTitle = 'Residence Information';
    return true;
  }

  goToEmploymentStep() {
    this.segmentioService$.page(
      VIEW_CA_EMPLOYMENT_INFO_PAGE.EVENT_NAME,
      VIEW_CA_EMPLOYMENT_INFO_PAGE.PROPERTY_NAME,
      VIEW_CA_EMPLOYMENT_INFO_PAGE.SCREEN_NAME,
      VIEW_CA_EMPLOYMENT_INFO_PAGE.ACTION_NAME
    );
    if (this.wayOfApplying === CREDIT_APPLICATION_PRIMARY) {
      if (!this.residenceFormPrimary.valid) {
        this.formControlService$.validateAllFormFields(
          this.residenceFormPrimary
        );
        return false;
      }
    } else if (this.wayOfApplying === CREDIT_APPLICATION_CO) {
      if (!this.residenceFormPrimary.valid || !this.residenceFormCo.valid) {
        this.formControlService$.validateAllFormFields(
          this.residenceFormPrimary
        );
        this.formControlService$.validateAllFormFields(this.residenceFormCo);
        return false;
      }
    } else {
      return false;
    }

    const data = {
      primary: {},
      co: {},
    };

    data.primary = {
      residenceType: this.residenceFormPrimary.value.residenceType,
      apt: this.residenceFormPrimary.value.apt,
      mortage: this.residenceFormPrimary.value.mortage,
      streetAddress: this.residenceFormPrimary.value.streetAddress,
      city: this.residenceFormPrimary.value.city,
      state: this.residenceFormPrimary.value.state,
      zipCode: this.residenceFormPrimary.value.zipCode,
    };
    if (this.wayOfApplying === CREDIT_APPLICATION_CO) {
      data.co = {
        residenceType: this.residenceFormCo.value.residenceType,
        apt: this.residenceFormCo.value.apt,
        mortage: this.residenceFormCo.value.mortage,
        streetAddress: this.residenceFormCo.value.streetAddress,
        city: this.residenceFormCo.value.city,
        state: this.residenceFormCo.value.state,
        zipCode: this.residenceFormPrimary.value.zipCode,
      };
    }

    this.store$.dispatch(
      new creditApplicationAction.SetCreditApplicationData(data)
    );
    this.store$.dispatch(new UiActions.SetShowNextLabel('Save + Next'));
    this.currentStep = CREDIT_APP_EMPLOYMENT;
    this.subTitle = 'Employment Information';
    return true;
  }

  goToIdentificationStep() {
    this.segmentioService$.page(
      VIEW_CA_IDENTIFICATION_PAGE.EVENT_NAME,
      VIEW_CA_IDENTIFICATION_PAGE.PROPERTY_NAME,
      VIEW_CA_IDENTIFICATION_PAGE.SCREEN_NAME,
      VIEW_CA_IDENTIFICATION_PAGE.ACTION_NAME
    );
    if (this.wayOfApplying === CREDIT_APPLICATION_PRIMARY) {
      if (!this.employmentFormPrimary.valid) {
        this.formControlService$.validateAllFormFields(
          this.employmentFormPrimary
        );
        return false;
      }
    } else if (this.wayOfApplying === CREDIT_APPLICATION_CO) {
      if (!this.employmentFormPrimary.valid || !this.employmentFormCo.valid) {
        this.formControlService$.validateAllFormFields(
          this.employmentFormPrimary
        );
        this.formControlService$.validateAllFormFields(this.employmentFormCo);
        return false;
      }
    } else {
      return false;
    }

    const data = {
      primary: {},
      co: {},
    };

    data.primary = {
      employerName: this.employmentFormPrimary.value.employerName,
      employerAddress: this.employmentFormPrimary.value.employerAddress,
      employerPhone: this.employmentFormPrimary.value.employerPhone,
      grossIncome: this.employmentFormPrimary.value.grossIncome,
    };
    if (this.wayOfApplying === CREDIT_APPLICATION_CO) {
      data.co = {
        employerName: this.employmentFormCo.value.employerName,
        employerAddress: this.employmentFormCo.value.employerAddress,
        employerPhone: this.employmentFormCo.value.employerPhone,
        grossIncome: this.employmentFormCo.value.grossIncome,
      };
    }

    this.store$.dispatch(
      new creditApplicationAction.SetCreditApplicationData(data)
    );

    this.store$.dispatch(new UiActions.SetShowNextLabel('Save + Next'));
    this.currentStep = CREDIT_APP_IDENTIFICATION;
    this.subTitle = 'Identification';
    return true;
  }

  goToReviewStep() {
    this.segmentioService$.page(
      VIEW_CA_REVIEW_PAGE.EVENT_NAME,
      VIEW_CA_REVIEW_PAGE.PROPERTY_NAME,
      VIEW_CA_REVIEW_PAGE.SCREEN_NAME,
      VIEW_CA_REVIEW_PAGE.ACTION_NAME
    );
    if (this.wayOfApplying === CREDIT_APPLICATION_PRIMARY) {
      if (!this.identificationFormPrimary.valid) {
        this.formControlService$.validateAllFormFields(
          this.identificationFormPrimary
        );
        return false;
      }
    } else if (this.wayOfApplying === CREDIT_APPLICATION_CO) {
      if (
        !this.identificationFormPrimary.valid ||
        !this.identificationFormCo.valid
      ) {
        this.formControlService$.validateAllFormFields(
          this.identificationFormPrimary
        );
        this.formControlService$.validateAllFormFields(
          this.identificationFormCo
        );
        return false;
      }
    } else {
      return false;
    }

    const data = {
      primary: {},
      co: {},
    };

    data.primary = {
      driverLicenseState: this.identificationFormPrimary.value
        .driverLicenseState,
      driverLicenseNumber: this.identificationFormPrimary.value
        .driverLicenseNumber,
      securityNumber: this.identificationFormPrimary.value.securityNumber,
    };
    if (this.wayOfApplying === CREDIT_APPLICATION_CO) {
      data.co = {
        driverLicenseState: this.identificationFormCo.value.driverLicenseState,
        driverLicenseNumber: this.identificationFormCo.value
          .driverLicenseNumber,
        securityNumber: this.identificationFormCo.value.securityNumber,
      };
    }

    this.store$.dispatch(
      new creditApplicationAction.SetCreditApplicationData(data)
    );

    this.store$.dispatch(new UiActions.SetShowNextLabel('Submit Application'));
    this.currentStep = CREDIT_APP_REVIEW;
    this.subTitle = 'Review';
    return true;
  }

  submitApplication() {
    if (this.wayOfApplying === CREDIT_APPLICATION_PRIMARY) {
      if (
        !this.personalFormPrimary.valid ||
        !this.employmentFormPrimary.valid ||
        !this.residenceFormPrimary.valid ||
        !this.identificationFormPrimary.valid
      ) {
        this.formControlService$.validateAllFormFields(
          this.personalFormPrimary
        );
        this.formControlService$.validateAllFormFields(
          this.employmentFormPrimary
        );
        this.formControlService$.validateAllFormFields(
          this.residenceFormPrimary
        );
        this.formControlService$.validateAllFormFields(
          this.identificationFormPrimary
        );
        return false;
      }
    } else if (this.wayOfApplying === CREDIT_APPLICATION_CO) {
      if (
        !this.personalFormPrimary.valid ||
        !this.employmentFormPrimary.valid ||
        !this.residenceFormPrimary.valid ||
        !this.identificationFormPrimary.valid ||
        !this.personalFormCo.valid ||
        !this.employmentFormCo.valid ||
        !this.residenceFormCo.valid ||
        !this.identificationFormCo.valid
      ) {
        this.formControlService$.validateAllFormFields(
          this.personalFormPrimary
        );
        this.formControlService$.validateAllFormFields(
          this.employmentFormPrimary
        );
        this.formControlService$.validateAllFormFields(
          this.residenceFormPrimary
        );
        this.formControlService$.validateAllFormFields(
          this.identificationFormPrimary
        );
        this.formControlService$.validateAllFormFields(this.personalFormCo);
        this.formControlService$.validateAllFormFields(this.employmentFormCo);
        this.formControlService$.validateAllFormFields(this.residenceFormCo);
        this.formControlService$.validateAllFormFields(
          this.identificationFormCo
        );
        return false;
      }
    } else {
      return false;
    }

    this.requestConfirmationModalRef = this.modalService.show(
      this.requestConfirmationModal,
      {
        class: 'modal-dialog-centered credit-application-confirm-modal',
      }
    );
  }

  confirmSubmit() {
    if (this.requestConfirmationModalRef) {
      this.requestConfirmationModalRef.hide();
    }

    const primary_dob = moment(
      this.personalFormPrimary.value.dateOfBirth
    ).format('YYYY-MM-DD');
    const payload = {
      vehicle_request_id: this.selectedMyRequest.id,
      primary_applicant: {
        first_name: this.personalFormPrimary.value.firstName,
        middle_name: this.personalFormPrimary.value.mi,
        last_name: this.personalFormPrimary.value.lastName,
        phone: this.personalFormPrimary.value.phoneNumber,
        email_address: this.personalFormPrimary.value.emailAddress,
        date_of_birth: primary_dob,
        residence_type: this.residenceFormPrimary.value.residenceType,
        apt: this.residenceFormPrimary.value.apt,
        monthly_rent: this.residenceFormPrimary.value.mortage,
        street_address: this.residenceFormPrimary.value.streetAddress,
        city: this.residenceFormPrimary.value.city,
        state: this.residenceFormPrimary.value.state,
        zipcode: this.residenceFormPrimary.value.zipCode,
        employer_name: this.employmentFormPrimary.value.employerName,
        employer_address: this.employmentFormPrimary.value.employerAddress,
        employer_phone: this.employmentFormPrimary.value.employerPhone,
        gross_monthly_income: this.employmentFormPrimary.value.grossIncome,
        driver_licence_number: this.identificationFormPrimary.value
          .driverLicenseNumber,
        driver_licence_state: this.identificationFormPrimary.value
          .driverLicenseState,
        social_security_number: this.identificationFormPrimary.value
          .securityNumber,
      },
      co_applicant: null,
    };
    if (this.wayOfApplying === CREDIT_APPLICATION_CO) {
      const co_dob = moment(this.personalFormCo.value.dateOfBirth).format(
        'YYYY-MM-DD'
      );
      payload.co_applicant = {
        first_name: this.personalFormCo.value.firstName,
        middle_name: this.personalFormCo.value.mi,
        last_name: this.personalFormCo.value.lastName,
        phone: this.personalFormCo.value.phoneNumber,
        email_address: this.personalFormCo.value.emailAddress,
        date_of_birth: co_dob,
        residence_type: this.residenceFormCo.value.residenceType,
        apt: this.residenceFormCo.value.apt,
        monthly_rent: this.residenceFormCo.value.mortage,
        street_address: this.residenceFormCo.value.streetAddress,
        city: this.residenceFormCo.value.city,
        state: this.residenceFormCo.value.state,
        zipcode: this.residenceFormCo.value.zipCode,
        employer_name: this.employmentFormCo.value.employerName,
        employer_address: this.employmentFormCo.value.employerAddress,
        employer_phone: this.employmentFormPrimary.value.employerPhone,
        gross_monthly_income: this.employmentFormCo.value.grossIncome,
        driver_licence_number: this.identificationFormCo.value
          .driverLicenseNumber,
        driver_licence_state: this.identificationFormCo.value
          .driverLicenseState,
        social_security_number: this.identificationFormCo.value.securityNumber,
      };
    }

    this.segmentioService$.track(
      CLICK_ON_SBUMIT_CA.EVENT_NAME,
      CLICK_ON_SBUMIT_CA.PROPERTY_NAME,
      CLICK_ON_SBUMIT_CA.SCREEN_NAME,
      CLICK_ON_SBUMIT_CA.ACTION_NAME
    );

    this.store$.dispatch(new UiActions.SetLoadingStatus(true));
    this.creditApplicationService$
      .saveCreditApplication(payload)
      .pipe(
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(req => {
        this.store$.dispatch(new UiActions.SetLoadingStatus(false));
        if (req && req.success) {
          this.store$.dispatch(new UiActions.ClearNavigateState());
          this.store$.dispatch(
            new creditApplicationAction.ClearCreditApplicationData()
          );
          this.router$.navigate(['my-request']);
        }
      });
  }

  goToNextStep() {
    if (!this.wayOfApplying) {
      this.notificationService$.warning('Please select application type.');
      return;
    }
    switch (this.currentStep) {
      case CREDIT_APP_PERSONAL:
        this.goToResidenceStep();
        break;
      case CREDIT_APP_RESIDENCE:
        this.goToEmploymentStep();
        break;
      case CREDIT_APP_EMPLOYMENT:
        this.goToIdentificationStep();
        break;
      case CREDIT_APP_IDENTIFICATION:
        this.goToReviewStep();
        break;
      case CREDIT_APP_REVIEW:
        this.submitApplication();
        break;
      default:
        break;
    }
  }

  gotToPreviousStep() {}

  redirectTo(step) {
    if (!this.wayOfApplying) {
      this.notificationService$.warning('Please select application type.');
      return;
    }
    switch (step.step) {
      case CREDIT_APP_PERSONAL:
        return this.goToPersonalStep();
      case CREDIT_APP_RESIDENCE:
        return this.goToPersonalStep() && this.goToResidenceStep();
      case CREDIT_APP_EMPLOYMENT:
        return (
          this.goToPersonalStep() &&
          this.goToResidenceStep() &&
          this.goToEmploymentStep()
        );
      case CREDIT_APP_IDENTIFICATION:
        return (
          this.goToPersonalStep() &&
          this.goToResidenceStep() &&
          this.goToEmploymentStep() &&
          this.goToIdentificationStep()
        );
      case CREDIT_APP_REVIEW:
        return (
          this.goToPersonalStep() &&
          this.goToResidenceStep() &&
          this.goToEmploymentStep() &&
          this.goToIdentificationStep() &&
          this.goToReviewStep()
        );
      default:
        break;
    }
  }

  isPage(page) {
    return (
      (page === 'personal' && this.currentStep === CREDIT_APP_PERSONAL) ||
      (page === 'residence' && this.currentStep === CREDIT_APP_RESIDENCE) ||
      (page === 'employment' && this.currentStep === CREDIT_APP_EMPLOYMENT) ||
      (page === 'identification' &&
        this.currentStep === CREDIT_APP_IDENTIFICATION) ||
      (page === 'review' && this.currentStep === CREDIT_APP_REVIEW)
    );
  }

  getPrice(item: IRequest) {
    return kFormatter(item.min_price) + ' - ' + kFormatter(item.max_price);
  }

  onDismissConfirmModal() {
    if (this.requestConfirmationModalRef) {
      this.requestConfirmationModalRef.hide();
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
