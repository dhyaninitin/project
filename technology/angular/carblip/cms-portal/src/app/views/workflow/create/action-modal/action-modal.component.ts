import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ACTION, CONDITION, DELAY, EMAILLIST, PROPERTY, TYPE } from 'app/shared/enums/enums';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { debounceTime, distinctUntilChanged, filter, skip, Subject, takeUntil } from 'rxjs';
import { TriggerModalComponent } from '../trigger-modal/trigger-modal.component';
import { PortalUser } from 'app/shared/models/portaluser.model';
import { Profile } from 'app/shared/models/user.model';
import { AppState } from 'app/store';
import { Store } from '@ngrx/store';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';

import { Year } from 'app/shared/models/common.model';
import { DealStage } from 'app/shared/models/deal.model';
import { NewRequest } from 'app/shared/models/request.model';
import { Request } from 'app/shared/models/request.model';
import { Brand, Model, Vehicle } from 'app/shared/models/vehicle.model';
import { DealStageService } from 'app/shared/services/apis/dealstage.service';
import { RequestService } from 'app/shared/services/apis/requests.service';
import { VBrandService } from 'app/shared/services/apis/vbrand.service';
import { VehicleService } from 'app/shared/services/apis/vehicle.service';
import { VModelService } from 'app/shared/services/apis/vmodel.service';
import { getYearArray } from 'app/shared/helpers/utils';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'app-action-modal',
  templateUrl: './action-modal.component.html',
  styleUrls: ['./action-modal.component.scss']
})
export class ActionModalComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  public itemForm: FormGroup;
  actionList: Array<{}> = [
    { id: 1, value: 'Delay' },
    { id: 2, value: 'Branch' },
    { id: 3, value: 'Send Marketing/Transactional Email' },
    { id: 4, value: 'Send SMS' },
    { id: 5, value: 'Enrollment' },
    { id: 6, value: 'Update Property' },
    { id: 7, value: 'Send Direct Email' },
    { id: 8, value: 'Create Deal' },
    { id: 9, value: 'Send a Webhook' },
  ];

  creditScoreValueList: Array<{}> = [
    { id: 1, value: 'Excellent' },
    { id: 2, value: 'Good' },
    { id: 3, value: 'Fair' },
    { id: 4, value: 'Poor' },
  ];

  phonePreferredTimeValueList: Array<{}> = [
    { id: 1, value: 'Day' },
    { id: 2, value: 'Evening' },
  ];

  // conditionSourceValueList: Array<{}> = [
  //   { id: 1, value: 'Web' },
  //   { id: 2, value: 'Mobile' },
  //   { id: 3, value: 'Direct' },
  //   { id: 4, value: 'CB2' },
  //   { id: 5, value: 'CB3' },
  //   { id: 6, value: 'CB2AZ' },
  //   { id: 7, value: 'Jotform' },
  //   { id: 8, value: 'Hubspot' },
  // ];

  conditionSourceValueList: Array<{}> = [];

  // for Deal Stage
  public RequestParam: any = {
    order_by: 'created_at',
    order_dir: 'desc',
    page: 0,
    per_page: 500,
  };

  delayList: Array<{}> = [
    { delay_id: 1, value: 'Delay for a set amount of time' },
    // { delay_id: 2, value: 'Delay until a day or time' },
  ];

  conditionList: Array<{}> = [
    { id: 1, value: 'Equals' },
    { id: 2, value: 'Does not equal' },
    { id: 3, value: 'known' },
    { id: 4, value: 'unknown' },
  ];
  public loadingemail: Boolean = true;
  public isSmslistEnabled: Boolean = true;
  public isConditionEnable: Boolean = false;

  actionValue: number;
  delayValue: number;
  typeList: any;
  propertyList: any;
  emailTemplateList = [];
  conditionVal: any;
  smsTemplates: any;

  
  propertyFilterCtrl: FormControl = new FormControl();
  propertyChnageValue: string;
  filteredProperties: Array<{}> = [];

  conditionSelectOptionFilterCtrl: FormControl = new FormControl();
  public selectOptionValue: Boolean = false;
  conditionOptionValue: Array<{}> = [];
  filteredConditionSelectOption: Array<{}> = [];

  dealStageFilterCtrl: FormControl = new FormControl();
  filteredDealStageSelectOption: Array<{}> = [];
  public dealstageValue: Boolean = true;
  public portalDealStageValue: Boolean = true;
  dealStageValue: Array<{}> = [];


  public autoComplete: Boolean = false;
  autoCompleteValue: Array<{}> = [];
  public textField: Boolean = false;
  actionConditionValue: any;
  actionConditionBackendValue:any;

  editAction: any;
  timeout: any;

  propertyType: string = "";
  propertyId: number = 0;

  sentSmsFromList: Array<{}> = [
    { id: 1001, value: 'Carblip' },
    { id: 1002, value: 'Contact owner' },
    // { id: 1003, value: 'Concierge' },
  ];
  directEmailTemplateList: any;
  templateOffset: number = 1;
  
  public templateFilterCtrl: FormControl = new FormControl();
  public marketingTemplateFilterCtrl: FormControl = new FormControl();
  totalTemplates = [];
  totalTemplatesPages: number = 0;
  filteredTemplates = [];

  assignList: Array<{}> = [
    { id: 1, value: 'An existing owner of the contact' },
    { id: 2, value: 'Specific User' }
  ]
  assigneeType: number;
  public portalUsers: Array<PortalUser> = [];
  public portalUserFilterCtrl: FormControl = new FormControl();
  public filteredPortalUsers: Array<PortalUser> = [];
  public userProfile: Profile;
  contactOnwerIds: number[];

  public years: Array<Year> = getYearArray(-2);
  public yearFilterCtrl: FormControl = new FormControl();
  public filteredYears: Array<Year>;

  public makes: Array<Brand>;
  public makeFilterCtrl: FormControl = new FormControl();
  public filteredMakes: Array<Brand>;

  public models: Array<Model>;
  public modelFilterCtrl: FormControl = new FormControl();
  public filteredModels: Array<Model>;

  public trims: Array<Vehicle>;
  public trimFilterCtrl: FormControl = new FormControl();
  public filteredTrims: Array<Vehicle>;

  public dealStages: Array<DealStage> = [];
  public dealStageCtrl: FormControl = new FormControl();
  public filteredDealStages: Array<DealStage>;
  
  public loadingFilter: Boolean = false;

  public loadingProperty:Boolean = false;
  public loadingMake:Boolean = false;
  public loadingModel:Boolean = false;
  public loadingTrim:Boolean = false;

  public portalDealStagesOffset: number = 1;
	public totalPortalDealStagesPages: number = 0;
	public loadingPortalDealStages: boolean = false;
  public filteredPortalDealStages:Array<any> = [];
	public totalPortalDealStage = [];
  public portalDealStageList: any = [];
  
  public portalDealStageFilterCtrl: FormControl = new FormControl();

  typeValueList: Array<{}> = [
    { id: 0, value: '' },
    { id: 1, value: 'Concierge' },
    { id: 2, value: 'Concierge (Test)' }
  ];

  over18ValueList: Array<{}> = [
    { id: 1, value: 'Yes' },
    { id: 2, value: 'No' }
  ];

  totalMarketingTemplatePages: number = 0;
  templatesListOffset: number = 0;
  emailTemplates = [];

  requestTypes: Array<{ id: string, name: string }> = [
    { id: 'get', name: 'GET' },
    { id: 'post', name: 'POST' }
  ];

  isWebhookSendForTest: boolean = false;
  isWebhookAuthorized: number = 0;

  urlRegex = /^[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

  conciergeStatesList: Array<{}> = [
    { id: 'CA', value: 'California' },
    { id: 'AZ', value: 'Arizona' }
  ];
  

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private service$: WorkflowService,
    public dialogRef: MatDialogRef<ActionModalComponent>,
    private snackBar: MatSnackBar,
    private _cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private store$: Store<AppState>,
    private portalUserServicer$: PortalUserService,
    private brandService$: VBrandService,
    private modelService$: VModelService,
    private vehicleService$: VehicleService,
    private requestService$: RequestService,
    private dealStageService$: DealStageService
  ) {
    this.initform();
  }

  

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.getAllsource();
    this.filterportalDealStage();
    // property Filter Control
    this.propertyFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterProperty();
      });

    // condition SelectOption filter control
    this.conditionSelectOptionFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterConditionSelectOption();
      });

    // Deal stage selectOption filter controls
    this.dealStageFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterDealStageSelectOption();
      });

      this.templateFilterCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        skip(1),
        takeUntil(this.onDestroy$)
      )
      .subscribe((res) => {
        this.templateOffset = 1;
        this.totalTemplates = [];
        this.getTemplateList();
      });

      this.marketingTemplateFilterCtrl.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.onDestroy$)
      )
      .subscribe((res) => {
        if (res == '') {
          this.emailTemplateList = [...this.emailTemplates];
        } else if (res.length > 2){
          this.emailTemplateList = this.emailTemplates.filter( obj =>
            obj.name.toLowerCase().includes(res.toLowerCase())
          );
        }
      });

    if (this.data.isEdit) {
      this.editAction = this.data.data;
      // if(this.editAction.action.id == 2 || this.editAction.action.id == 6) {
        if(this.editAction.action.id == 6){
        if(this.data?.isAdd == false) {
          this.propertyId = this.editAction.property[this.data.propertyIndex].id;
        } else {
          this.propertyId = this.editAction.property.id;
        }
      }

      if(this.editAction.action.id == 2) {
        this.propertyId = this.editAction.groupValues[0][0].property.id;
      }
      this.onActionchange(this.editAction.action.id);

      switch (this.editAction.actionName) {
        case 'Delay':
          this.itemForm.patchValue({
            actioname: this.editAction.action.id,
            delayaction: this.editAction.delay.id,
            days: this.editAction.days,
            hours: this.editAction.hours,
            minutes: this.editAction.minutes,
            seconds: this.editAction.seconds
          });
          this.onDelaychange(this.editAction.delay.id);
          break;
        case 'Send Marketing/Transactional Email':
          this.itemForm.patchValue({
            actioname: this.editAction.action.id,
            emailtemp: this.editAction.email.id,
          });
          break;
        case 'Send SMS':
          this.itemForm.patchValue({
            actioname: this.editAction.action.id,
            sms_template: this.editAction.smspayload.id,
            send_from:this.editAction.send_sms_from
          });
          break;
        case 'Branch':

          this.itemForm.patchValue({
            actioname: this.editAction.action.id,
            branch_name: this.editAction.ifbranchname,
            condition: this.editAction.groupValues[0][0].condition.id,
            condition_value: this.editAction.groupValues[0][0].conditionvalue,
          });

          this.onConditionchange(this.editAction.groupValues[0][0].condition.id);
          break;
        
        case 'Update Property':
          this.itemForm.patchValue({
            actioname: this.editAction.action.id,
            property: this.editAction.property[this.data.propertyIndex].id,
            condition_value: this.editAction.property[this.data.propertyIndex].conditionvalue,
          });
          this.itemForm.controls['actioname'].disable();
          break;
        
        case 'Send Direct Email':
          this.itemForm.patchValue({
            actioname: this.editAction.action.id,
            directEmailTemp: this.editAction.email.id,
          });
          break;

        case 'Create Deal':
          this.itemForm.patchValue({
            actioname: this.editAction.action.id,
            dealName:this.editAction.dealsPayload.dealName,
            assignTo:this.editAction.dealsPayload.assignTo,
            specificUser:this.editAction.dealsPayload.specificUser,
            year:this.editAction.dealsPayload.year,
            make:this.editAction.dealsPayload.make.length === 0 ? '-1' : this.editAction.dealsPayload.make.id,
            model:this.editAction.dealsPayload.model.length === 0 ? '-1' : this.editAction.dealsPayload.model.id,
            trim:this.editAction.dealsPayload.trim.length === 0 ? '-1' : this.editAction.dealsPayload.trim.id,
            dealStage:this.editAction.dealsPayload.dealStage,
            portalDealStage:this.editAction.dealsPayload.portalDealStage
          });
          this.assigneeType = this.editAction.dealsPayload.assignTo;
          this.onYearFilterChange(this.editAction.dealsPayload.year);
          this.onMakeFilterChange(this.editAction.dealsPayload.make.id);
          this.onModelFilterChange(this.editAction.dealsPayload.model.id);
          break;
        
        case 'Send a Webhook':
          this.itemForm.patchValue({
            actioname: this.editAction.action.id,
            request_type: this.editAction.webhook.request_type,
            webhook_url: this.editAction.webhook.webhook_url,
            authentication_type: this.editAction.webhook.authentication_type?.type,
            api_key: this.editAction.webhook.authentication_type?.secret?.key,
            api_value: this.editAction.webhook.authentication_type?.secret?.value,
            api_key_location: this.editAction.webhook.authentication_type?.api_key_location,
            request_body: this.editAction.webhook?.request_body_type,
            static_properties: this.setValuesForProperties(this.editAction.webhook?.static_properties, 0),
            dynamic_properties: this.setValuesForProperties(this.editAction.webhook?.dynamic_property, 1)
          });
          break;

      }
    } else {
      if(this.data?.isAdd) {
        this.onActionchange(6);
        this.itemForm.patchValue({
          actioname: 6
        });
        this.itemForm.controls['actioname'].disable();
      }
    }

     // listen for search field value changes
     this.portalUserFilterCtrl.valueChanges
     .pipe(takeUntil(this.onDestroy$))
     .subscribe(() => {
       this.filterPortalUsers();
     });

   this.initPortalUsers();
   this.getVehicleDetails();

   this.portalDealStageFilterCtrl.valueChanges
   .pipe(
     debounceTime(500),
     distinctUntilChanged(),
     skip(1),
     takeUntil(this.onDestroy$))
   .subscribe(() => {
    //  if (this.portalDealStageFilterCtrl.value != '') {
       this.portalDealStagesOffset = 1;
       this.totalPortalDealStage = [];
       this.filterportalDealStage();
    //  }
   });
  }

  close() {
    this.dialogRef.close(null);
  }

  initform() {
    this.itemForm = this.fb.group({
      actioname: ['', Validators.required],
      delayaction: ['', Validators.required],
      days: [0,Validators.pattern("^[0-9]*$")],
      hours: [0,Validators.pattern("^[0-9]*$")],
      minutes: [0,Validators.pattern("^[0-9]*$")],
      seconds: [0,Validators.pattern("^[0-9]*$")],
      date: null,
      timeofday: null,
      // type: null,
      property: null,
      condition: null,
      condition_value: null,
      emailtemp: ['', Validators.required],
      branch_name: null,
      sms_template:['', Validators.required],
      send_from:['', Validators.required],
      directEmailTemp: ['', Validators.required],

      dealName:[''],
      assignTo:['',Validators.required],
      specificUser:[''],
      year:['',Validators.required],
      make:[{ value: '', disabled: true },Validators.required],
      model:[{ value: '', disabled: true },Validators.required],
      trim:[{ value: '', disabled: true },Validators.required],
      dealStage:['',Validators.required],
      portalDealStage:['',Validators.required],
      
      request_type: ['get', Validators.required],
      webhook_url: ['', Validators.pattern(this.urlRegex)],
      authentication_type: ['', Validators.required],
      api_key: [''],
      api_value: [''],
      api_key_location: ['req_header'],
      request_body: ['', Validators.required],
      static_properties: this.fb.array([]),
      dynamic_properties: this.fb.array([])
    });

    this.itemForm.get('emailtemp').disable();
    this.itemForm.get('sms_template').disable();
    this.itemForm.get('send_from').disable();
    this.itemForm.get('directEmailTemp').disable();

    // Initially add an empty property
    this.addStaticProperty();
    this.addDynamicProperty();
  }

  onActionchange($event: number) {
    // this.itemForm.reset();
    // this.itemForm.patchValue({actioname: $event});
    this.actionValue = $event
    if ($event == 2 || $event == 6 || $event == 8) {
     this.getProperty();
    }
    
    else if ($event == 3) {
      const payload = {
        per_page: 20,
        page: this.templatesListOffset
      }
      if(this.editAction?.email?.id) {
        payload['id'] = this.editAction.email.id;
      }
      this.service$.getSendingBlueTemplate(payload).subscribe((res: any) => {
        if (res) {
          this.emailTemplates.push(...res.data);
          this.emailTemplates = this.emailTemplates.filter((obj, index, self) => index === self.findIndex(el => el['id'] === obj['id']));
          this.emailTemplateList = [...this.emailTemplates]
          this.totalMarketingTemplatePages = res?.meta?.last_page;
          this.loadingemail = false;
          this.itemForm.get('emailtemp').enable();
        }
      });
    }

    else if ($event == 7) {
      this.getTemplateList()
    }

    else if ($event == 4) {
      this.service$.getSmsTemplate().subscribe((res: any) => {
        if (res) {
          this.smsTemplates = res.data;
          this.isSmslistEnabled = false;
          this.itemForm.get('sms_template').enable();
          this.itemForm.get('send_from').enable();
        }
      });
    } else if ($event == 5) {
      // open enrollment action
      this.openEnrollmentTrigger();
    } else if ($event == 9) {
      this.getProperty();
    }
  }

  onDelaychange($event: number) {
    this.delayValue = $event;
  }

  getNextBatchOfTemplates() {
    this.loadingemail = true;
    this.templateOffset = this.templateOffset + 1;
    this.getTemplateList();
  }

  getTemplateList(){
    this.directEmailTemplateList = [];
    const search = this.templateFilterCtrl.value || '';
    const templateParam = {
      order_by: 'created_at',
      order_dir: 'desc',
      page: this.templateOffset,
      per_page: 20,
      search,
    };

    let templateId = null;
    if(this.editAction?.email?.id) {
      templateId = this.editAction?.email?.id;
    }

    this.service$.getEmailTemplateList(templateParam, templateId).subscribe((res: any) => {
      if (res) {
        this.loadingemail = false;
        this.totalTemplates.push(...res.data);
        this.totalTemplates = this.totalTemplates.filter((obj, index, self) => index === self.findIndex(el => el['id'] === obj['id']));
        this.directEmailTemplateList = this.totalTemplates;
        this.totalTemplatesPages = res.meta.last_page;
        this.filteredTemplates = this.directEmailTemplateList.slice(0);
        this.itemForm.get('directEmailTemp').enable();
        this._cdr.detectChanges();
      }
    });
  }

  getProperty() {
    this.loadingProperty = true;
    this.service$.getpropertyColumns().subscribe((res: any) => {
      if (res) {
        this.propertyList = res.data;
        this.filteredProperties = res.data;
        if(this.actionValue === 8){
          const filtereData = res.data.filter(item => item.table_id < 3);
          this.propertyList = filtereData;
          this.filteredProperties = filtereData;
          this.loadingProperty = false;
        }
        if (this.data.isEdit) {
          this.itemForm.patchValue({
            property: this.propertyId
          })
          if(this.actionValue != 8 && this.actionValue != 9) {
            this.onPropertychange(this.propertyId);
          }
        }
      }
    })
  }

  onPropertychange($event: any) {
    if ($event != '') {
      this.isConditionEnable = true;
    }

    const property = this.propertyList.filter(property => property.field_id == this.itemForm.value.property);

    if (property[0]?.field_type == "autoComplete") {
      if (this.propertyChnageValue !== $event) {
        this.itemForm.patchValue({
          condition_value: ''
        });
        this.conditionvaluenames = [];
      }
      this.propertyChnageValue = $event;

      this.autoComplete = true;
      this.selectOptionValue = false;
      this.textField = false;
      this.dealstageValue = false;
      this.portalDealStageValue = false;

    } else if (property[0]?.field_type == "selectOption") {
      if (property[0].field_name == "source" || property[0].field_name == "source_utm") {
        this.filteredConditionSelectOption = this.conditionSourceValueList;
        this.conditionOptionValue = this.conditionSourceValueList;
      } else if (property[0].field_name == "phone_preferred_time") {
        this.filteredConditionSelectOption = this.phonePreferredTimeValueList;
        this.conditionOptionValue = this.phonePreferredTimeValueList;
      } else if (property[0].field_name == "credit_score") {
        this.filteredConditionSelectOption = this.creditScoreValueList;
        this.conditionOptionValue = this.creditScoreValueList;
      } else if (property[0].field_name == "deal_stage") {
        this.service$.getDealStageList(this.RequestParam).subscribe((res: any) => {
          if (res) {
            this.autoComplete = false;
            this.selectOptionValue = false;
            this.textField = false;
            this.dealstageValue = true;
            this.portalDealStageValue = false;
            this.dealStageValue = res.data;
            this.filteredDealStageSelectOption = res.data;
            this._cdr.detectChanges();
          }
        });
      } else if (property[0].field_name == "portal_deal_stage") {
        this.service$.getPortalDealStageList(this.RequestParam).subscribe((res: any) => {
          if (res) {
            this.autoComplete = false;
            this.selectOptionValue = false;
            this.textField = false;
            this.dealstageValue = false;
            this.portalDealStageValue = true;
            this.dealStageValue = res.data;
            this.filteredDealStageSelectOption = res.data;
            this._cdr.detectChanges();
          }
        });
      } else if(property[0].field_name == "type") {
        this.filteredConditionSelectOption = this.typeValueList;
        this.conditionOptionValue = this.typeValueList;
      } else if(property[0].field_name == "concierge_state") {
        this.filteredConditionSelectOption = this.conciergeStatesList;
        this.conditionOptionValue = this.conciergeStatesList;
      }
      this.autoComplete = false;
      this.selectOptionValue = true;
      this.textField = false;
      this.dealstageValue = false;
      this.portalDealStageValue = false;
    } else {
      if(property[0].field_name == "over18") {
        this.filteredConditionSelectOption = this.over18ValueList;
        this.conditionOptionValue = this.over18ValueList;
        this.autoComplete = false;
        this.selectOptionValue = true;
        this.textField = false;
        this.dealstageValue = false;
        this.portalDealStageValue = false;
      }
      else {
        this.autoComplete = false;
        this.selectOptionValue = false;
        this.textField = true;
        this.dealstageValue = false;
        this.portalDealStageValue = false;
      }
    }

  }

  onConditionchange($event: any) {
    this.conditionVal = $event;
  }

  actionSave() {
    let actionObject = {};
    const actionId = this.itemForm.get('actioname').value;
    switch (ACTION[actionId]) {
      case 'Delay':
        actionObject = {
          actionName: ACTION[this.itemForm.value.actioname],
          action: {
            id: this.itemForm.value.actioname,
            value: ACTION[this.itemForm.value.actioname],
          },
          delay: {
            id: this.itemForm.value.delayaction,
            value: DELAY[this.itemForm.value.delayaction],
          },
          days: this.itemForm.value.days,
          hours: this.itemForm.value.hours,
          minutes: this.itemForm.value.minutes,
          seconds: this.itemForm.value.seconds,
          date: this.itemForm.value.date,
          timeofday: this.itemForm.value.timeofday,
          parentContainer: null,
          event_master_id: 102
        }
        break;

      case 'Branch':
        const property = this.propertyList.filter(property => property.field_id == this.itemForm.value.property);
        if(CONDITION[this.itemForm.value.condition] != 'known' && CONDITION[this.itemForm.value.condition] != 'unknown' ){
          if (property[0].field_name == "source" || property[0].field_name == "source_utm") {
            const sourceFilter: Array<any> = this.conditionSourceValueList.filter((s: { id: number, value: string }) => s.id == this.itemForm.value.condition_value);
            this.actionConditionValue = sourceFilter[0].value;
            this.actionConditionBackendValue = sourceFilter[0].id;
          } else if (property[0].field_name == "phone_preferred_time") {
            const sourceFilter: Array<any> = this.phonePreferredTimeValueList.filter((s: { id: number, value: string }) => s.id == this.itemForm.value.condition_value);
            this.actionConditionValue = sourceFilter[0].value;
            this.actionConditionBackendValue = sourceFilter[0].id;
          } else if (property[0].field_name == "credit_score") {
            const sourceFilter: Array<any> = this.creditScoreValueList.filter((s: { id: number, value: string }) => s.id == this.itemForm.value.condition_value);
            this.actionConditionValue = sourceFilter[0].value;
            this.actionConditionBackendValue = sourceFilter[0].id;
          } else if (property[0].field_name == "deal_stage") {
            const dealstageValue: Array<any> = this.dealStageValue.filter((x: any) => x.stage_id == this.itemForm.value.condition_value);
            this.actionConditionValue = dealstageValue[0].label;
            this.actionConditionBackendValue = dealstageValue[0].stage_id;
          } else if (property[0].field_name == "portal_deal_stage") {
            const dealstageValue: Array<any> = this.dealStageValue.filter((x: any) => x.id == this.itemForm.value.condition_value);
            this.actionConditionValue = dealstageValue[0].label;
            this.actionConditionBackendValue = dealstageValue[0].id;
          } else if (property[0].field_name == 'state' || property[0].field_name == 'city' || property[0].field_name == 'street_address' || property[0].field_name == 'zip') {
            this.actionConditionValue = (this.itemForm.value.condition_value).replace(/[^,a-zA-Z0-9 ]/g, '');
            this.actionConditionBackendValue = (this.itemForm.value.condition_value).replace(/[^,a-zA-Z0-9 ]/g, '');
          } else if (property[0].field_name == "type"){
            const sourceFilter: Array<any> = this.typeValueList.filter((s: { id: number, value: string }) => s.id == this.itemForm.value.condition_value);
            this.actionConditionValue = sourceFilter[0].value;
            this.actionConditionBackendValue = sourceFilter[0].id;
          } else if (property[0].field_name == "concierge_state"){
            const conciergeStateFilter: Array<any> = this.conciergeStatesList.filter((s: { id: number, value: string }) => s.id == this.itemForm.value.condition_value);
            this.actionConditionValue = conciergeStateFilter[0].value;
            this.actionConditionBackendValue = conciergeStateFilter[0].id;
          } else {
            this.actionConditionValue = this.itemForm.value.condition_value;
            this.actionConditionBackendValue = this.itemForm.value.condition_value;
          }
        }else{
          this.actionConditionValue = '';
          this.actionConditionBackendValue = '';
        }

        const branchListItem = this.propertyList.filter(list => list.field_id == this.itemForm.value.property);

        actionObject = {
          actionName: ACTION[this.itemForm.value.actioname],
          groupValues: [
            [
              {
              type: {
                id: branchListItem[0].table_id,
                value: TYPE[branchListItem[0].table_id],
              },
              property: {
                id: branchListItem[0].field_id,
                title: (branchListItem[0].fields).replace(/[^\w\s]/gi, ""),
                value: branchListItem[0].field_name,
              },
              condition: {
                id: this.itemForm.value.condition,
                value: CONDITION[this.itemForm.value.condition],
              },
              conditionvalue: this.actionConditionBackendValue,
              condition_value: this.actionConditionValue
            }
            ]
          ],
          action: {
            id: this.itemForm.value.actioname,
            value: ACTION[this.itemForm.value.actioname],
          },

          ifbranchname: this.itemForm.value.branch_name,
          ifbranchdata: [],
          thenbranchname: null,
          thenbranchdata: [],
          parentContainer: null,
          event_master_id: 103

        }
        break;

      case 'Send Marketing/Transactional Email':
        if(this.itemForm.value.emailtemp == "") {
          this.snackBar.open("Please select email template", 'OK', {
            verticalPosition: 'top',
            panelClass: ['snack-warning'],
            duration: 5000,
          });
          return;
        }
        const emailListItem = this.emailTemplateList.filter(list => list.id == this.itemForm.value.emailtemp);
        actionObject = {
          actionName: ACTION[this.itemForm.value.actioname],
          action: {
            id: this.itemForm.value.actioname,
            value: ACTION[this.itemForm.value.actioname],
          },
          email: {
            id: emailListItem[0].id,
            value: emailListItem[0].name,
            senderName: emailListItem[0].senderName,
            senderEmail: emailListItem[0].senderEmail,
          },
          parentContainer: null,
          event_master_id: 104
        }
        break;

      case 'Send SMS':
        if(this.itemForm.value.sms_template == "") {
          this.snackBar.open("Please select sms template", 'OK', {
            verticalPosition: 'top',
            panelClass: ['snack-warning'],
            duration: 5000,
          });
          return;
        }
        const SmsListItem = this.smsTemplates.filter(list => list.id == this.itemForm.value.sms_template);
        actionObject = {
          actionName: ACTION[this.itemForm.value.actioname],
          action: {
            id: this.itemForm.value.actioname,
            value: ACTION[this.itemForm.value.actioname],
          },
          smspayload: {
            id: SmsListItem[0].id,
            value: SmsListItem[0].title,
          },
          parentContainer: null,
          event_master_id: 105,
          send_sms_from:this.itemForm.value.send_from
        }

        break;

      case 'Update Property':
        const propertyResult = this.propertyList.filter(property => property.field_id == this.itemForm.value.property);
        if (propertyResult[0].field_name == "source" || propertyResult[0].field_name == "source_utm") {
          const sourceFilter: Array<any> = this.conditionSourceValueList.filter((s: { id: number, value: string }) => s.id == this.itemForm.value.condition_value);
          this.actionConditionValue = sourceFilter[0].value;
          this.actionConditionBackendValue = sourceFilter[0].id;
        } else if (propertyResult[0].field_name == "phone_preferred_time") {
          const sourceFilter: Array<any> = this.phonePreferredTimeValueList.filter((s: { id: number, value: string }) => s.id == this.itemForm.value.condition_value);
          this.actionConditionValue = sourceFilter[0].value;
          this.actionConditionBackendValue = sourceFilter[0].id;
        } else if (propertyResult[0].field_name == "credit_score") {
          const sourceFilter: Array<any> = this.creditScoreValueList.filter((s: { id: number, value: string }) => s.id == this.itemForm.value.condition_value);
          this.actionConditionValue = sourceFilter[0].value;
          this.actionConditionBackendValue = sourceFilter[0].id;
        } else if (propertyResult[0].field_name == "deal_stage") {
          const dealstageValue: Array<any> = this.dealStageValue.filter((x: any) => x.stage_id == this.itemForm.value.condition_value);
          this.actionConditionBackendValue = this.itemForm.value.condition_value;
          this.actionConditionValue = dealstageValue[0].label;
        } else if (propertyResult[0].field_name == "portal_deal_stage") {
          const dealstageValue: Array<any> = this.dealStageValue.filter((x: any) => x.id == this.itemForm.value.condition_value);
          this.actionConditionBackendValue = this.itemForm.value.condition_value;
          this.actionConditionValue = dealstageValue[0].label;
        } else if (propertyResult[0].field_name == 'state' || propertyResult[0].field_name == 'city' || propertyResult[0].field_name == 'street_address' || propertyResult[0].field_name == 'zip') {
          this.actionConditionValue = (this.itemForm.value.condition_value).replace(/[^,a-zA-Z0-9 ]/g, '');
          this.actionConditionBackendValue = (this.itemForm.value.condition_value).replace(/[^,a-zA-Z0-9 ]/g, '');
        }else if (propertyResult[0].field_name == "type"){
          const sourceFilter: Array<any> = this.typeValueList.filter((s: { id: number, value: string }) => s.id == this.itemForm.value.condition_value);
          this.actionConditionValue = sourceFilter[0].value;
          this.actionConditionBackendValue = sourceFilter[0].id;
        } else if (propertyResult[0].field_name == 'concierge_state') {
          const stateFilter: Array<any> = this.conciergeStatesList.filter((s: { id: number, value: string }) => s.id == this.itemForm.value.condition_value);
          this.actionConditionValue = stateFilter[0].value;
          this.actionConditionBackendValue = stateFilter[0].id;
        } else {
          this.actionConditionValue = this.itemForm.value.condition_value;
          this.actionConditionBackendValue = this.itemForm.value.condition_value;
        }
        let propertyPayload = [{
          id: this.itemForm.value.property,
          value: propertyResult[0].fields,
          conditionvalue: this.actionConditionBackendValue,
          condition_value: this.actionConditionValue,
          fieldname: propertyResult[0].field_name,
          tableid: propertyResult[0].table_id
        }];
        if(this.data?.isAdd) {
          propertyPayload = [...this.data.data.property, ...propertyPayload];
        } else if(!isNaN(this.data.propertyIndex) && !this.data?.isAdd) {
          this.data.data.property[this.data.propertyIndex] = propertyPayload[0];
          propertyPayload = [...this.data.data.property];
        }
      
        actionObject = {
          actionName: ACTION[actionId],
          action: {
            id: actionId,
            value: ACTION[actionId],
          },
          property: propertyPayload,
          parentContainer: null,
          event_master_id: 106
        }
        break;
        
      case 'Send Direct Email':
        if(this.itemForm.value.emailtemp == "") {
          this.snackBar.open("Please select email template", 'OK', {
            verticalPosition: 'top',
            panelClass: ['snack-warning'],
            duration: 5000,
          });
          return;
        }
        const directEmailListItem = this.filteredTemplates.filter(list => list.id == this.itemForm.value.directEmailTemp);
        actionObject = {
          actionName: ACTION[this.itemForm.value.actioname],
          action: {
            id: this.itemForm.value.actioname,
            value: ACTION[this.itemForm.value.actioname],
          },
          email: {
            id: directEmailListItem[0].id,
            value: directEmailListItem[0].title,
            senderName: directEmailListItem[0].senderName,
            subject: directEmailListItem[0].subject,
            body:directEmailListItem[0].body
          },
          parentContainer: null,
          event_master_id: 107
        }
        break;

      case 'Create Deal':
        let filteredData = []
        if(this.itemForm.value.dealName){
          filteredData = this.propertyList.filter(item => this.itemForm.value.dealName.includes(item.field_id));
        }
        
        const userDetails =  this.filteredPortalUsers.filter(user => user.email == this.itemForm.value.specificUser);
        const makes = this.filteredMakes.filter(make => make.id === this.itemForm.value.make);
        const models = this.filteredModels.filter(model => model.id === this.itemForm.value.model);
        const trims = this.filteredTrims.filter(trim => trim.id === this.itemForm.value.trim);
        actionObject = {
          actionName: ACTION[this.itemForm.value.actioname],
          action: {
            id: this.itemForm.value.actioname,
            value: ACTION[this.itemForm.value.actioname],
          },
          dealsPayload: {
            dealName:this.itemForm.value.dealName,
            assignTo:this.itemForm.value.assignTo,
            specificUser:this.itemForm.value.specificUser,
            userDetails:{
              id:userDetails[0]?.id,
              email:userDetails[0]?.email,
              name:userDetails[0]?.full_name
            },
            year: this.itemForm.value.year,
            make: { id: makes[0]?.id, value: makes[0]?.name },
            model: { id: models[0]?.id, value: models[0]?.name },
            trim: { id: trims[0]?.id, value: trims[0]?.trim },
            dealStage: this.itemForm.value.dealStage,
            portalDealStage:this.itemForm.value.portalDealStage
          },
          dealPropertyPayload:filteredData,
          parentContainer: null,
          event_master_id: 109,
        }
        break;

      case 'Send a Webhook':
        actionObject = {
          actionName: ACTION[this.itemForm.value.actioname],
          action: {
            id: this.itemForm.value.actioname,
            value: ACTION[this.itemForm.value.actioname],
          },
          webhook: {
            request_type: this.itemForm.value.request_type,
            webhook_url: this.itemForm.value.webhook_url,
            authentication_type: {
              type: this.itemForm.value.authentication_type,
              secret: {
                key: this.itemForm.value.api_key,
                value: this.itemForm.value.api_value
              },
              api_key_location: this.itemForm.value.api_key_location
            },
            request_body_type: this.itemForm.value.request_body,
            static_properties: this.staticProperties.value,
            dynamic_property: this.dynamicProperties.value        
          },
          parentContainer: null,
          event_master_id: 110
        }
        break;
      }

      if(!this.data.isEdit && !this.data?.isAdd) {
        actionObject['id'] = uuidv4();
      } else {
        if(this.data?.isAdd && !this.editAction?.id) {
          actionObject['id'] = this.data?.data?.id;
        } else {
          actionObject['id'] = this.editAction?.id;
        }
      }
      
      this.dialogRef.close(actionObject);
  }

  
  filterProperty() {
    if (!this.propertyList) {
      return;
    }
    //get the search keyword
    let search = this.propertyFilterCtrl.value;

    if (!search) {
      this.filteredProperties = this.propertyList.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    //filter the banks
    this.filteredProperties = this.propertyList.filter(
      item => item.fields.toLowerCase().indexOf(search) > -1
    );
  }

  filterConditionSelectOption() {
    if (!this.conditionOptionValue) {
      return;
    }
    //get the search keyword
    let search = this.conditionSelectOptionFilterCtrl.value;

    if (!search) {
      this.filteredConditionSelectOption = this.conditionOptionValue.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    //filter the banks
    this.filteredConditionSelectOption = this.conditionOptionValue.filter(
      (item: any) => item.value.toLowerCase().indexOf(search) > -1
    );
  }


  filterDealStageSelectOption() {
    if (!this.dealStageValue) {
      return;
    }
    //get the search keyword
    let search = this.dealStageFilterCtrl.value;

    if (!search) {
      this.filteredDealStageSelectOption = this.dealStageValue.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    //filter the banks
    this.filteredDealStageSelectOption = this.dealStageValue.filter(
      (item: any) => item.label.toLowerCase().indexOf(search) > -1
    );
  }

  
  // auto Complete Functions
  conditionvaluenames = [];

  removeChipOnboarding(value: string): void {
    const index = this.conditionvaluenames.indexOf(value);
    if (index >= 0) {
      this.conditionvaluenames.splice(index, 1);
      // this.onboardingids.splice(index, 1);
      this.itemForm.patchValue({
        condition_value: JSON.stringify(this.conditionvaluenames)
      });
      if (this.conditionvaluenames.length == 0) {
        this.itemForm.get('condition_value').setErrors({ incorrect: true });
      }
    }
    if (this.conditionvaluenames.length == 0) {
      this.itemForm.patchValue({
        condition_value: ''
      });
    }
  }


  searchOnboardingFunction(event: any) {
    const conditionvalue = event.target.value;
    const getPropertyFieldName = this.propertyList.filter(property => property.field_id == this.propertyChnageValue);

    if (getPropertyFieldName[0].field_name == 'state' || getPropertyFieldName[0].field_name == 'city' || getPropertyFieldName[0].field_name == 'street_address' || getPropertyFieldName[0].field_name == 'zip') {
      const payload = {
        field_name: getPropertyFieldName[0].field_name,
        table_id: getPropertyFieldName[0].table_id,
        inputValue: conditionvalue
      }
      clearTimeout(this.timeout);
      if(conditionvalue != "") {
        this.timeout = setTimeout(() => {
          this.service$.getPropertyAutoCompleteValue(payload).subscribe((res: any) => {
            if (res) {
              this.autoCompleteValue = res.data;
            }
          });
        }, 1000);
      }
    }
  }

  valueChangedFunction(value: any) {
    if (!this.conditionvaluenames.includes(value.field_name)) {
      this.conditionvaluenames.push(value.field_name);
      this.itemForm.get('condition_value').setErrors(null);
      this.itemForm.patchValue({
        condition_value: JSON.stringify(this.conditionvaluenames)
      });
    }
  }
  
  openEnrollmentTrigger(conditionval?) {
    const title = 'Create Enrollment Trigger';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      TriggerModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: { title: title, conditionval: conditionval, isEdit: false },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (res != null) { 
        const actionObject = {
          actionName: ACTION[this.itemForm.value.actioname],
          action: {
            id: this.itemForm.value.actioname,
            value: ACTION[this.itemForm.value.actioname],
          },
          parentContainer: null,
          event_master_id: 106,
          sequence_id: 0,
          id: uuidv4()
        }
        this.dialogRef.close({...actionObject, ...res});
      }
    })
  }

  /** get all Source
	* @param
	* @return
	**/
	getAllsource(){
		this.service$.getsource().subscribe((res:any)=>{
			if(res.statusCode == 200 && res.data) {
				this.conditionSourceValueList = res.data;
			}
		});
	}

  onAssigneechange(val:number){
    this.assigneeType = val;
    if(val === 2){
      this.itemForm.get('specificUser').addValidators([Validators.required]);
    } else {
      this.itemForm.patchValue({specificUser:''});
      this.itemForm.get('specificUser').clearValidators();
    }
  }

  filterPortalUsers() {
    if (!this.portalUsers) {
      return;
    }
    let search = this.portalUserFilterCtrl.value;
    if (!search) {
      this.filteredPortalUsers = this.portalUsers.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredPortalUsers = this.portalUsers.filter(item => {
      const fullname = item.full_name;
      return fullname.toLowerCase().indexOf(search) > -1;
    });
  }

  initPortalUsers() {
    const portalUserParam = {
      roles: [4, 5, 6]
    };

    this.portalUserServicer$
      .getListByFilter(portalUserParam)
      .subscribe(({ data }) => {
        this.portalUsers = data;
        // this.portalUsers = this.portalUsers.filter((portalUser: any) => {
        //   return portalUser.is_active == 1
        // })
        this.filteredPortalUsers = this.portalUsers.slice(0);

        this._cdr.detectChanges();
      });
  }

  // get year, make, model & trim

  getVehicleDetails(){
    this.dealStageService$.getAll().subscribe(data => {
      this.dealStages = data.data;
      this.filteredDealStages = this.dealStages.slice(0);
    });

    // listen for search field value changes for year
    this.yearFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterYears();
      });

    // listen for search field value changes for make
    this.makeFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterMakes();
      });

    // listen for search field value changes for make
    this.modelFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterModels();
      });

    // listen for search field value changes for trim
    this.trimFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterTrims();
      });

    // listen for search field value changes for dealstage
    this.dealStageFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterDealStages();
      });

    this.initYearFilter();
  }

  initYearFilter() {
    this.loadingMake = false;
    this.years.unshift({
      id: undefined,
      name: 'None',
    });
    this.filteredYears = this.years.slice(0);
    this.initMakeFilter();
  }

  initMakeFilter() {
    this.filteredMakes = [];
    this.filteredModels = [];
    this.filteredTrims = [];
    this.brandService$
      .getAll({
        year: this.itemForm.value.year,
      })
      .subscribe(data => {
        this.makes = data.data;
        this.filteredMakes = this.makes.slice(0);
        this.filteredMakes.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        this.filteredMakes.unshift({
          id: undefined,
          name: 'None',
        });
        this.loadingMake = false;
      });
  }

  initModelFilter(make_id) {
    this.filteredModels = [];
    this.filteredTrims = [];
    this.loadingFilter = true;
    this.loadingModel = false;
    this.modelService$
      .getAll({
        brand_id: make_id,
        year: this.itemForm.value.year,
      })
      .subscribe(data => {
        this.loadingFilter = false;
        this.models = data.data;
        this.models.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        this.models.unshift({
          id: undefined,
          name: 'None',
        });
        this.filteredModels = this.models.slice(0);
      });
  }

  initTrimFilter(model_id) {
    this.filteredTrims = [];
    this.loadingFilter = true;
    this.vehicleService$
      .getAll({
        model_id: model_id,
      })
      .subscribe(data => {
        this.loadingFilter = false;
        this.trims = data.data;
        this.trims.unshift({
          id: undefined,
          trim: 'None',
        });
        this.filteredTrims = this.trims.slice(0);
        this.loadingTrim = false;
      });
  }

  /** Filter models
   * @param Make item
   * @return
   **/

  filterModels() {
    this.filteredModels = [];
    if (!this.models) {
      return;
    }
    // get the search keyword
    let search = this.modelFilterCtrl.value;
    if (!search) {
      this.filteredModels = this.models.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the makes
    this.filteredModels = this.models.filter(
      item => item.name.toLowerCase().indexOf(search) > -1
    );
  }

  /** Filter years
   * @param Number item
   * @return
   **/

  filterYears() {
    if (!this.years) {
      return;
    }
    // get the search keyword
    let search = this.yearFilterCtrl.value;
    if (!search) {
      this.filteredYears = this.years.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }

    // filter the banks
    this.filteredYears = this.years.filter(
      item => item.name.toLowerCase().indexOf(search) > -1
    );
    this.refreshData();
  }

  /** Filter makes
   * @param Make item
   * @return
   **/

  filterMakes() {
    if (!this.makes) {
      return;
    }
    // get the search keyword
    let search = this.makeFilterCtrl.value;
    if (!search) {
      this.filteredMakes = this.makes.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the makes
    this.filteredMakes = this.makes.filter(
      item => item.name.toLowerCase().indexOf(search) > -1
    );
  }

  /** Filter trims
   * @param Make item
   * @return
   **/

  filterTrims() {
    if (!this.trims) {
      return;
    }
    // get the search keyword
    let search = this.trimFilterCtrl.value;
    if (!search) {
      this.filteredTrims = this.trims.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the makes
    this.filteredTrims = this.trims.filter(
      item => item.trim.toLowerCase().indexOf(search) > -1
    );
  }

  /** Filter dealStages
   * @param Number item
   * @return
   **/

  filterDealStages() {
    if (!this.dealStages) {
      return;
    }
    // get the search keyword
    let search = this.dealStageFilterCtrl.value;
    if (!search) {
      this.filteredDealStages = this.dealStages.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }

    // filter the dealStaes
    this.filteredDealStages = this.dealStages.filter(
      item => item.label.toLowerCase().indexOf(search) > -1
    );
    this.refreshData();
  }

  onYearFilterChange(val:number, type?:string) {
    this.loadingMake = true;
    this.itemForm.value.year = val;
    this.initMakeFilter();
    this.itemForm.get('make').enable();
    if(type){
      this.itemForm.patchValue({make:''});
      this.itemForm.patchValue({model:''});
      this.itemForm.patchValue({trim:''});
    }
  }

  onMakeFilterChange(val) {
    this.loadingMake = false;
    this.loadingModel = true;
    this.initModelFilter(val);
    this.itemForm.get('model').enable();
  }

  onModelFilterChange(val) {
    this.loadingModel = false;
    this.loadingTrim = true;
    this.initTrimFilter(val);
    this.itemForm.get('trim').enable();
  }

  refreshData(){
    this._cdr.detectChanges();
  }

  checkMissingFields() {
    if (this.actionValue === 8) {
      const requiredFiles = ['assignTo', 'specificUser', 'year', 'make', 'model', 'trim', 'dealStage', 'portalDealStage']
      const missingFields = requiredFiles.filter(key => !this.itemForm.value[key]);
      if (this.itemForm.value.assignTo === 1) {
        const index = missingFields.indexOf('specificUser');
        if (index !== -1) {
          missingFields.splice(index, 1);
        }
      } else if (this.itemForm.value.assignTo === 2 && !this.itemForm.value.specificUser) {
        missingFields.push('specificUser');
      }

      if (missingFields.length > 0) {
        return true;
      }
      return false;
    } else if (this.actionValue === 9) {
      let requiredFiles = ['request_type', 'webhook_url', 'authentication_type', 'api_key_location'];
      if(this.itemForm.value.authentication_type === 'api_key') {
        requiredFiles.push('api_key');
        requiredFiles.push('api_value');
      } else if (this.itemForm.value.request_type == 'post') {
        requiredFiles.push('request_body');
      }
      const missingFields = requiredFiles.filter(key => !this.itemForm.value[key]);
      if(this.itemForm.value.webhook_url) {
        const regex = new RegExp(this.urlRegex);
        const isValid = regex.test(this.itemForm.value.webhook_url);
        if(!isValid) {
          return true;
        }
      }
      if (missingFields.length > 0) {
        return true;
      }
    } else {
      return false;
    }
  }

  getNextBatchOfPortalDealStages() {
    this.loadingPortalDealStages = true;
    this.portalDealStagesOffset = this.portalDealStagesOffset + 1
    this.filterportalDealStage();
  }

  filterportalDealStage(newId = null) {
    this.portalDealStageList = [];
    let search = this.portalDealStageFilterCtrl.value || '';
    const portalDealStageParam = {
      order_by: 'created_at',
      order_dir: 'desc',
      page: this.portalDealStagesOffset,
      per_page: 20,
      search,
    };
    
    let portalDealStageId = null;
    if(this.data?.data?.dealsPayload?.portalDealStage) {
      portalDealStageId = this.data?.data?.dealsPayload?.portalDealStage;
    }

    this.dealStageService$.getDealStageList(portalDealStageParam, portalDealStageId).subscribe(({ data, meta }) => {
      this.totalPortalDealStage.push(...data);
      this.portalDealStageList = this.totalPortalDealStage;
      this.totalPortalDealStagesPages = meta.last_page;

      this.filteredPortalDealStages = this.portalDealStageList.slice(0);
      this.onPortalDealStageFilterChange(newId);
      this.loadingPortalDealStages = false;
    });
  }

  onPortalDealStageFilterChange(val) {
    if (val) {
      this.itemForm.patchValue({
        portalDealStage: val,
      });
    }
  }

  getNextBatchOfMarketingEmailTemplates() {
    this.templatesListOffset = this.templatesListOffset + 1;
    this.loadingemail = true;
    this.onActionchange(3);
  }

  get staticProperties(): FormArray {
    return this.itemForm.get('static_properties') as FormArray;
  }

  get dynamicProperties(): FormArray {
    return this.itemForm.get('dynamic_properties') as FormArray;
  }

  createProperty(key: string = '', value: string = ''): FormGroup {
    return this.fb.group({
      key: [key, Validators.required],
      value: [value, Validators.required],
    });
  }

  addDynamicProperty(): void {
    this.dynamicProperties.push(this.createProperty());
  }

  removeDynamicProperty(index: number): void {
    this.dynamicProperties.removeAt(index);
  }

  addStaticProperty(): void {
    this.staticProperties.push(this.createProperty());
  }

  removeStaticProperty(index: number): void {
    this.staticProperties.removeAt(index);
  }

  setProperty(value: any, index: number) {
    const property = this.propertyList.filter(property => property.field_id == value);
    if(property.length) {
      const control = (this.dynamicProperties.at(index) as FormGroup).get('key');
      control.setValue(property[0].field_name);
    }
  }

  onChangeMethod(Value: any) {
    while (this.staticProperties.length !== 0) {
      this.staticProperties.removeAt(0);
    }
    while (this.dynamicProperties.length !== 0) {
      this.dynamicProperties.removeAt(0);
    }

    this.addStaticProperty();
    this.addDynamicProperty();
  }

  setValuesForProperties(values: any[], propertyType: number): void {
    let formArray = null;
    if(propertyType == 0) {
      formArray = this.itemForm.get('static_properties') as FormArray;
    } else if (propertyType == 1) {
      formArray = this.itemForm.get('dynamic_properties') as FormArray;
    }
  
    // Clear existing controls if any
    formArray.clear();
  
    // Loop through values and push controls to the form array
    values.forEach((value) => {
      formArray.push(this.createProperty(value.key, value.value));
    });
  }

  testWebhookUrl() {
    const payload: {method: string, webhook_url: string} = {
      method: this.itemForm.value.request_type,
      webhook_url: this.itemForm.value.webhook_url
    };
    this.service$.testWebhookUrl(payload).subscribe(res => {
      if(res) {
        this.isWebhookSendForTest = true;
        if(res.result == 200 || res.result == 500) {
          this.isWebhookAuthorized = 1;
        } else if (res.result == 0) {
          this.isWebhookAuthorized = 0;
        } else {
          this.isWebhookAuthorized = 2;
        }
      } else {
        this.isWebhookSendForTest = false;
      }
    })
  }
}
