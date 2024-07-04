import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';

import { ROLE_LIST } from 'app/core/constants';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { getYearArray } from 'app/shared/helpers/utils';
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
import { AppState } from 'app/store';
import { initialState as portalUserInitialState } from 'app/store/portalusers/portalusers.states';
import { NgxRolesService } from 'ngx-permissions';
import { combineLatest, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, skip, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-users-request-modal',
  templateUrl: './request-modal.component.html',
  styleUrls: ['./request-modal.component.scss'],
})
export class UsersRequestModalComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public itemForm: FormGroup;

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
  public dealStageFilterCtrl: FormControl = new FormControl();
  public filteredDealStages: Array<DealStage>;

  public saving: Boolean = false;
  private userId: string = undefined;
  public userType: number = null;

  public loadingFilter: Boolean = false;

  public portalDealStagesOffset: number = 1;
	public totalPortalDealStagesPages: number = 0;
	public loadingPortalDealStages: boolean = false;
  public filteredPortalDealStages:Array<any> = [];
	public totalPortalDealStage = [];
  public portalDealStageList: any = [];
  
  public portalDealStageFilterCtrl: FormControl = new FormControl();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UsersRequestModalComponent>,
    private fb: FormBuilder,
    private store$: Store<AppState>,
    private route$: ActivatedRoute,
    private rolesService$: NgxRolesService,
    private changeDetectorRefs: ChangeDetectorRef,
    private brandService$: VBrandService,
    private modelService$: VModelService,
    private vehicleService$: VehicleService,
    private requestService$: RequestService,
    private dealStageService$: DealStageService,
    
  ) {}

  ngOnInit() {
    this.userId = this.data.payload.userId;
    this.userType = this.data.payload.type;
    this.buildItemForm();

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

    this.portalDealStageFilterCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        skip(1),
        takeUntil(this.onDestroy$))
      .subscribe(() => {
        // if (this.portalDealStageFilterCtrl.value != '') {
          this.portalDealStagesOffset = 1;
          this.totalPortalDealStage = [];
          this.filterportalDealStage();
        // }
      });
  }

  initYearFilter() {
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
    if(this.itemForm.value.year === null){
      this.itemForm.patchValue({
        make:'',
        model:'',
        trim:''
      })
    }
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
      });
  }

  initModelFilter(make_id) {
    this.filteredModels = [];
    this.filteredTrims = [];
    this.loadingFilter = true;
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

  buildItemForm() {
    const currentYear = new Date().getFullYear();
    const formFields = {
      year: [currentYear, Validators.required],
      make: [''],
      model: ['', Validators.required],
      trim: ['', Validators.required],
      dealStage: ['', Validators.required],
      portalDealStage:['', Validators.required]
    };
    this.itemForm = this.fb.group(formFields);
    this.filterportalDealStage();
  }

  submit() {
    if (this.itemForm.valid) {
      const param: NewRequest = {
        user_id: this.userId,
        vehicle_id: this.itemForm.value.trim,
        dealstage_id: this.itemForm.value.dealStage,
        portal_deal_stage: this.itemForm.value.portalDealStage,
      };
      this.saving = true;
      if (this.itemForm.value.year == "-1" && this.itemForm.value.make == "-1") {
        this.syncAndStoreDeal(param);
      } else {
        this.requestService$
          .create(param)
          .pipe(
            takeUntil(this.onDestroy$),
            map(result => result),
            catchError(err => {
              return of(err);
            })
          )
          .subscribe(res => {
            this.saving = false;
            if (!res.error) {
              this.dialogRef.close(param);
            }
          });
      }
    }
  }

  syncAndStoreDeal(param) {
    this.requestService$
      .syncAndStoreDeal(param)
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(res => {
        this.saving = false;
        if (!res.error) {
          this.dialogRef.close(param);
        }
      });
  }

  onYearFilterChange(val) {
    this.itemForm.value.year = val;
    this.initMakeFilter();
  }

  onMakeFilterChange(val) {
    this.initModelFilter(val);
  }

  onModelFilterChange(val) {
    this.initTrimFilter(val);
  }

  refreshData() {
    this.changeDetectorRefs.detectChanges();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
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

    this.dealStageService$.getDealStageList(portalDealStageParam).subscribe(({ data, meta }) => {
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
}
