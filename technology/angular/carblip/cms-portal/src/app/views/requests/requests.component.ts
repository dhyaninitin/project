import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { environment } from 'environments/environment';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { fromEvent, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
  tap,
} from 'rxjs/operators';
import * as _ from 'underscore';

import { Router } from '@angular/router';
import { ROLE_LIST } from 'app/core/constants';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { PortalUser } from 'app/shared/models/portaluser.model';
import { TablePagination } from 'app/shared/models/common.model';
import * as commonModels from 'app/shared/models/common.model';
import { Location } from 'app/shared/models/location.model';
import {
  Filter as LogFilter,
  Log,
  LogResponse,
} from 'app/shared/models/log.model';
import { Request } from 'app/shared/models/request.model';
import * as requestsModels from 'app/shared/models/request.model';
import { ExportService } from 'app/shared/services/apis/export.service';
import { RequestService } from 'app/shared/services/apis/requests.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import {
  DateTimeService,
  IDateRangeSelection,
} from 'app/shared/services/date-time.service';
import { AppState } from 'app/store/';
import { dataSelector as portalUserDataSelector } from 'app/store/portalusers/portalusers.selectors';
import { dataSelector as locationDataSelector } from 'app/store/locations/locations.selectors';
import * as logActions from 'app/store/requestlogs/requestlogs.actions';
import {
  dataSelector as logDataSelector,
  didFetchSelector as logDidFetchSelector,
  fetchingSelector as logFetchingSelector,
  filterSelector as logFilterSelector,
  metaSelector as logMetaSelector,
} from 'app/store/requestlogs/requestlogs.selectors';
import { initialState as initialLogState } from 'app/store/requestlogs/requestlogs.states';
import * as actions from 'app/store/requests/requests.actions';
import {
  didFetchSelector,
  fetchingSelector,
  filterSelector,
  metaSelector,
  YearsDataSelector,
  YearsDataSelector as yearselector,
} from 'app/store/requests/requests.selectors';
import { initialState } from 'app/store/requests/requests.states';
import { NgxRolesService } from 'ngx-permissions';
import { Brand, DealStage, Model } from 'app/shared/models/vehicle.model';
import { VModelService } from 'app/shared/services/apis/vmodel.service';
import { VBrandService } from 'app/shared/services/apis/vbrand.service';
import { VehicleService } from 'app/shared/services/apis/vehicle.service';
import * as moment from 'moment-timezone';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { GlobalService } from 'app/shared/services/apis/global.service';
import { FilterService } from 'app/shared/services/filter.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
  animations: [fadeInUp400ms]
})
export class RequestsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('searchLogInput') searchLogInput: ElementRef;

  columnHeaders: Array<any> = [
    { key: 'full_name', label: 'Full Name', visible: true},
    { key: 'first_name', label: 'First Name', visible: true},
    { key: 'last_name', label: 'Last Name', visible: true},
    { key: 'year', label: 'Year', visible: true},
    { key: 'brand', label: 'Brand', visible: true},
    { key: 'model', label: 'Model', visible: true},
    { key: 'trim', label: 'Trim', visible: true},
    { key: 'contact_owner', label: 'Contact Owner', visible: true},
    { key: 'referral_code', label: 'Referral Code', visible: true},
    { key: 'source', label: 'Source', visible: true},
    { key: 'deal_stage', label: 'Hubspot Deal Stage', visible: true},
    { key: 'portal_deal_stage', label: 'Portal Deal Stage', visible: true},
    { key: 'closed_won', label: 'Closed Won', visible: true},
    { key: 'trade_in', label: 'Trade In', visible: true},
    { key: 'contract_date', label: 'Contract Date', visible: true},
    { key: 'created_at', label: 'Created At', visible: true},
    { key: 'actions', label: 'Actions', visible: true},
  ];

  isColumnAvailable: boolean = false;
  private readonly sectionName: string = 'filter_requests_page';

  private onDestroy$ = new Subject<void>();

  public filter$: Observable<any>;
  public yearFilter$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;
  public fetching$: Observable<any>;

  public logs$: Observable<any>;
  public logFilter$: Observable<any>;
  public logMeta$: Observable<any>;
  public logDidFetch$: Observable<any>;
  public logFetching$: Observable<any>;
  public yearFetching$: Observable<any>;
  public isSubscribedToEmailsMessage : Observable<any>;
  public filter: commonModels.Filter = initialState.filter;
  public meta: commonModels.Meta = initialState.meta;
  public search = '';

  public logFilter: LogFilter = initialLogState.filter;
  public logMeta: commonModels.Meta = initialLogState.meta;
  public logSearch = '';

  public tablePagination: TablePagination = {
    length: initialState.meta.total,
    pageIndex: initialState.filter.page,
    pageSize: initialState.filter.per_page,
    previousPageIndex: 0,
  };

  public logPagination: TablePagination = {
    length: initialLogState.meta.total,
    pageIndex: initialLogState.filter.page,
    pageSize: initialLogState.filter.per_page,
    previousPageIndex: 0,
  };

  public daterrange = {
    begin: null,
    end: null,
  };
  public filterForm: FormGroup;

  public locations: Array<Location>;
  public locationFilterCtrl: FormControl = new FormControl();
  public filteredLocations: Array<Location>;

  public portalUsers: Array<PortalUser>;
  public portalUserFilterCtrl: FormControl = new FormControl();
  public filteredPortalUsers: Array<PortalUser>;
  public logs: Array<Log>;
  public isLogLoading: Boolean = false;
  public salespersonId: Number;

  public RequestYears: any;
	public yearFilterCtrl: FormControl = new FormControl();
	public filteredYears: [any];

  public dealStageFilterCtrl: FormControl = new FormControl();
	public filteredDealStage: Array<DealStage>;
  public dealStage: Array<DealStage>;

  public makes: Array<Brand>;
	public makeFilterCtrl: FormControl = new FormControl();
	public filteredMakes: Array<Brand>;

	public models: Array<Model>;
	public modelFilterCtrl: FormControl = new FormControl();
	public filteredModels: Array<Model>;
  public yearFilter: any;

  public sources: any;
	public sourceFilterCtrl: FormControl = new FormControl();
	public filteredSourcess: [any];
  disableAllOptionInContactOwner: boolean = false;
  disableAllOptionInSource: boolean = false;
  disableAllOptionInDealStagePipeline: boolean = false;

  showFilterOptions: boolean = false;
  timeout: any;
  timeout1: any;
  defaultYear: boolean = false;
  defaultMake: boolean = false;
  boardView: boolean = false;
  public dealStageName:string = 'Sales Pipeline';

  dealBoardViewFilters: any = null;
  dealBoardViewSearch: any = null;

  public dealStagePipeline: any;
	public dealStagePipelineFilterCtrl: FormControl = new FormControl();
	public filtereddealStagePipeline: [any];
  public requestParams: any = {
    order_by: 'created_at',
    order_dir: 'desc',
    page: 1,
    per_page: 20,
  };

  constructor(
    private store$: Store<AppState>,
    private dialog: MatDialog,
    private rolesService$: NgxRolesService,
    private fb: FormBuilder,
    private service$: RequestService,
    private exportService$: ExportService,
    private changeDetectorRefs: ChangeDetectorRef,
    private snack$: MatSnackBar,
    private router$: Router,
    private loader$: AppLoaderService,
    private modelService$: VModelService,
    private brandService$: VBrandService,
    private vehicleService$: VehicleService,
    private portalUserService$: PortalUserService,
    private globalService$: GlobalService,
    private filterService:FilterService
  ) {
    const viewType = localStorage.getItem('deal_view') || undefined;
    // To fetch column filters values
    if(viewType == undefined || viewType === 'table') {
      this.getFilteredColumns();
    }
    
    this.filter$ = this.store$.select(filterSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.fetching$ = this.store$.select(fetchingSelector);

    this.logs$ = this.store$.select(logDataSelector);
    this.logFilter$ = this.store$.select(logFilterSelector);
    this.logMeta$ = this.store$.select(logMetaSelector);
    this.logDidFetch$ = this.store$.select(logDidFetchSelector);
    this.logFetching$ = this.store$.select(logFetchingSelector);
    this.yearFetching$ = this.store$.select(yearselector);

    this.filterForm = this.fb.group({
      location: [''],
      contact_owner: [''],
      year: null,
      make: null,
      model: null,
      source: null,
      referrals: null,
      closedwon: null,
      deal_stage_pipeline: null
    });

    const salespersonObj = ROLE_LIST.find(item => item.name === 'salesperson' || item.name === 'concierge');
    this.salespersonId = salespersonObj.id;
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngAfterViewInit(): void {
    this.initData();
  }

  ngOnInit() {
    this.store$.dispatch(new actions.ClearDetail());
  }

  initData() {

    fromEvent(this.searchInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => {
          return event.target.value;
        }),
        filter(res => res.length > 2 || !res.length),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.onFilterChange();
      });

    fromEvent(this.searchLogInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => {
          return event.target.value;
        }),
        filter(res => res.length > 2 || !res.length),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.onLogFilterChange();
      });

    this.filter$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(data => {
          if (!deepEqual(this.filter, data)) {
            this.filterService.setCommonFilter('deals_common_filter', {search:data.search})

            this.filter = data;
            this.initFilter();
          }
        })
      )
      .subscribe();

    this.meta$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(meta => {
          if (!deepEqual(this.meta, meta)) {
            this.meta = meta;
            this.initMeta();
          }
        })
      )
      .subscribe();

    this.didFetch$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(didFetch => !didFetch && this.loadData())
      )
      .subscribe();

    this.logFilter$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(data => {
          if (!deepEqual(this.logFilter, data)) {
            if(data.search != ""){
              localStorage.setItem("requests_log_module_search_keyword", data.search);
            }else{
              localStorage.removeItem("requests_log_module_search_keyword");
            }
            
            this.logFilter = data;
            this.search = this.filter.search;
          }
        })
      )
      .subscribe();

    this.logMeta$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(meta => {
          if (!deepEqual(this.logMeta, meta)) {
            this.logMeta = meta;
            this.initLogMeta();
          }
        })
      )
      .subscribe();

    this.logDidFetch$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(didFetch => !didFetch && this.loadLogs())
      )
      .subscribe();

    this.logs$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(logs => {
          if (!deepEqual(this.logs, logs)) {
            this.logs = logs;
            this.refreshTable();
          }
        })
      )
      .subscribe();
    
    
    this.store$
      .select(locationDataSelector)
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(data => {
          this.locations = data;
          this.filteredLocations = this.locations.slice(0);
        })
      )
      .subscribe();
    
      //srouces for filter dropdown
    this.vehicleService$
      .getAlRequestSources()
      .subscribe(data => {
        this.sources = data.data || [];
        this.filteredSourcess = this.sources.slice(0);
        this.filteredSourcess.sort((a, b) => a.name.localeCompare(b.name));
        
      });
    // listen for search field value changes for location
    this.locationFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterLocations();
      }); 

    this.portalUserService$.getOwnerListByRole(2).subscribe(res=>{
      if(res){
        // this.portalUsers = res.data.filter(x =>{
        //   if(x.roles){
        //       return x['roles'][0].id === this.salespersonId
        //   }
        // });
        this.portalUsers = res.data;
        this.filteredPortalUsers = this.portalUsers.slice(0);
      }
    }, error => {
      console.log("There are some errors. Please Check!", error);
    }); 
 
    this.yearFetching$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(RequestYears => {
          if (!deepEqual(this.RequestYears, RequestYears)) {
            this.filteredYears = RequestYears;
          }
          this.RequestYears = RequestYears;
        })
      )
      .subscribe();

    // listen for search field value changes for portal user
    this.portalUserFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterPortalUsers();
      });

    // listen for search field value changes for year
		this.yearFilterCtrl.valueChanges
      .pipe(
        debounceTime(100),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterYears();
      });

      this.dealStageFilterCtrl.valueChanges
      .pipe(
        debounceTime(100),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterDealStage();
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

    // listen for search field value changes for model
    this.modelFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterModels();
      });

    // listen for search field value changes for source
    this.sourceFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterSources();
      });

      this.vehicleService$
      .getDealsStagepipeline(this.requestParams)
      .subscribe(data => {
        this.dealStagePipeline = data.data || [];
        this.filtereddealStagePipeline = this.dealStagePipeline.slice(0);
        this.filtereddealStagePipeline.sort((a, b) => a.pipeline.localeCompare(b.pipeline));

        // for board view
        this.dealStage = data.data || [];
        this.dealStage.sort((a, b) => {
          return a.pipeline.localeCompare(b.pipeline);
        });
        this.filteredDealStage = this.dealStage.slice(0);
      });

      this.dealStagePipelineFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterDealStagePipeline();
      });
  }

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

  filterDealStage() {
		if (!this.dealStage) {
			return;
		}
		// get the search keyword
		let search = this.dealStageFilterCtrl.value;
		if (!search) {
			this.filteredDealStage = this.dealStage.slice(0);
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the makes
		this.filteredDealStage = this.dealStage.filter(
			item => item.pipeline.toLowerCase().indexOf(search) > -1
		);
	}

	filterModels() {
		if (!this.models) {
			return;
		}
		// get the search keyword
		let search = this.makeFilterCtrl.value
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

  filterSources() {
		if (!this.sources) {
			return;
		}
		// get the search keyword
		let search = this.sourceFilterCtrl.value
		if (!search) {
			this.filteredSourcess = this.sources.slice(0);
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the makes
		this.filteredSourcess = this.sources.filter(
			item => item.toLowerCase().indexOf(search) > -1
		);
	}

  filterDealStagePipeline(){
    if (!this.dealStagePipeline) {
			return;
		}
		// get the search keyword
		let search = this.dealStagePipelineFilterCtrl.value
		if (!search) {
			this.filtereddealStagePipeline = this.dealStagePipeline.slice(0);
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the makes
		this.filtereddealStagePipeline = this.dealStagePipeline.filter(
			item => item.toLowerCase().indexOf(search) > -1
		);
  }

	/** Filter years
		* @param Number item
		* @return
		**/

	filterYears() {
		if (!this.RequestYears) {
			return;
		}
		// get the search keyword
		let search = this.yearFilterCtrl.value;
		if (!search) {
			this.filteredYears = this.RequestYears.slice(0);
			return;
		} else {
			search = search.toString();
		}
    
		// filter the years
		this.filteredYears = this.RequestYears.filter(
			item => item.toString().indexOf(search) > -1
		);
    
	}
  selectedYear(data){
    this.defaultYear = true;
    this.defaultMake = false;
    if(data.value){
      this.initMakeFilter(data.value);
    }
    
  }
  selectedMake(data){
    this.defaultMake = true;
    if(data.value){
      this.initModelFilter();
    }
    
  }
  initMakeFilter(selectedYear) {
		this.makes = [];
		this.models = [];
		this.filteredMakes = [];
		this.filteredModels = [];

		const yearItem = selectedYear;
		if (yearItem) {
			this.vehicleService$
				.getAllBrandsByYear({
					year: selectedYear,
				})
				.subscribe(data => {
					this.makes = data.data || [];
					this.makes.sort((a, b) => {
						return a.name.localeCompare(b.name);
					});
					this.filteredMakes = this.makes.slice(0);
				});
		}
	}
  initModelFilter() {
		this.models = [];
		this.filteredModels = [];
		const makeItem =  this.filterForm.controls['make'].value;
		if (makeItem) {
			this.vehicleService$
				.getAllByModelsByBrandYear({
					brand_id: makeItem,
					year: this.filterForm.controls['year'].value,
				})
				.subscribe(data => {
					this.models = data.data || [];
					this.models.sort((a, b) => {
						return a.name.localeCompare(b.name);
					});
					this.filteredModels = this.models.slice(0);
				});
		}
	}

  /** Filter locations
   * @param Location item
   * @return
   **/

  filterLocations() {
    if (!this.locations) {
      return;
    }
    // get the search keyword
    let search = this.locationFilterCtrl.value;
    if (!search) {
      this.filteredLocations = this.locations.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredLocations = this.locations.filter(
      item => item.name.toLowerCase().indexOf(search) > -1
    );
  }

  /** Filter Portal Users
   * @param PortalUser item
   * @return
   **/

  filterPortalUsers() {
    if (!this.portalUsers) {
      return;
    }
    // get the search keyword
    let search = this.portalUserFilterCtrl.value;
    if (!search) {
      this.filteredPortalUsers = this.portalUsers.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredPortalUsers = this.portalUsers.filter(
      item => item.full_name.toLowerCase().indexOf(search) > -1 || item.email.toLowerCase().indexOf(search) > -1
    );
  }

  loadData() {

    // Clone filter values
    this.filter = {...this.filter};
    
    const payload = {
      form:this.filterForm,
      filter:this.filter,
      common:'deals_common_filter',
      advance:'deals_filter'
    }
    const deals_filter = this.filterService.getAdvanceFilter(payload)
    this.filterForm.patchValue(deals_filter.form.value)
    this.filter = deals_filter.filter
    this.search = this.filter.search

    if(this.filter['filter']['start_date'] && this.filter['filter']['end_date']){
      let start_date: any = moment(this.filter['filter']['start_date']);
      let end_date: any = moment(this.filter['filter']['end_date']);
      this.daterrange = {
        begin: start_date._d,
        end: end_date._d,
      }
    }

    if (!this.defaultYear && this.filterForm.value.year) this.initMakeFilter(this.filterForm.value.year)
    if(!this.defaultMake && this.filterForm.value.make) this.initModelFilter();

    this.loadLogs();

    const viewType = localStorage.getItem('deal_view') || undefined;
    // To fetch column filters values
    if(viewType == undefined || viewType === 'table') {
      this.boardView = false;
    } else if (viewType === 'board') {
      this.getListOfYears();
      this.boardView = true;
    }
    this.dealBoardViewFilters = this.filter['filter'];
    this.dealBoardViewSearch = this.filter['search'];
    
    if(!this.boardView) {
      this.store$.dispatch(new actions.GetList(this.filter));
    }
  }

  loadLogs() {
    var per_page_limit = localStorage.getItem('requests_log_module_limit');
    var selected_page_no = localStorage.getItem('requests_log_module_page_count');
    var log_search_keyword = localStorage.getItem('requests_log_module_search_keyword');

    this.logFilter = {...this.logFilter};

    //check base on previous select item
    {
      if(per_page_limit != undefined && per_page_limit != null){
        this.logFilter.per_page = Number(per_page_limit);
      }else{
        this.logFilter.per_page = 20;
      }

      if(selected_page_no != undefined && selected_page_no != null){
        this.logFilter.page = Number(selected_page_no);
      }else{
        this.logFilter.page = 1;
      }

      if(log_search_keyword != undefined && log_search_keyword != null){
        this.logFilter.search = log_search_keyword;
        this.logSearch = log_search_keyword;
      }else{
        this.logFilter.search = "";
        this.logSearch = "";
        this.updateLogFilter(this.logFilter);
      }
    }
    this.store$.dispatch(new logActions.GetList(this.logFilter));
  }

  initMeta() {
    this.tablePagination.length = this.meta.total;
    this.tablePagination.pageIndex = this.meta.current_page - 1;
    this.tablePagination.pageSize = this.meta.per_page;
  }

  initLogMeta() {
    this.logPagination.length = this.logMeta.total;
    this.logPagination.pageIndex = this.logMeta.current_page - 1;
    this.logPagination.pageSize = this.logMeta.per_page;
  }

  initFilter() {
    this.search = this.filter.search;
  }

  onFilterChange() {
    let data = {
      search: this.search,
    };
    if (this.search) {
      data = _.extend(data, {
        page: 1,
      });
    }
    this.updateFilter(data);
  }

  onLogFilterChange() {
    let data = {
      search: this.logSearch,
    };
    if (this.logSearch) {
      data = _.extend(data, {
        page: 1,
      });
    }
    this.updateLogFilter(data);
  }

  updateFilter(data) {
    const updated_filter = {
      ...this.filter,
      ...data,
    };
    if(this.boardView) {
      this.dealBoardViewFilters = data.filter;
      this.dealBoardViewSearch = data.search;
      this.changeDetectorRefs.detectChanges();
    } else {
      this.store$.dispatch(new actions.UpdateFilter(updated_filter));
    }
  }

  onPaginateChange(event) {
    const data = {
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    };

    this.filterService.setCommonFilter('deals_common_filter', data)
 
    this.updateFilter(data);
  }

  onLogPaginateChange(event) {
    const data = {
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    };
    
    //set value in local storage
    localStorage.setItem('requests_log_module_limit', event.pageSize);
    localStorage.setItem('requests_log_module_page_count', data.page);

    this.updateLogFilter(data);
  }

  updateLogFilter(data) {
    const updated_filter = {
      ...this.logFilter,
      ...data,
    };
    this.store$.dispatch(new logActions.UpdateFilter(updated_filter));
  }

  getRequestFilter() {
    const requestFilter: requestsModels.RequestFilter = {};
    if (this.daterrange.begin) {
      requestFilter.start_date = moment(this.daterrange.begin).format('yyyy/MM/DD');
    }
    if (this.daterrange.end) {
      requestFilter.end_date = moment(this.daterrange.end).format('yyyy/MM/DD');
    }
    if (this.filterForm.value.contact_owner) {
      requestFilter.contact_owner = this.filterForm.value.contact_owner;
    }
    if (this.filterForm.value.year) {
      requestFilter.year = this.filterForm.value.year;
    }
    if (this.filterForm.value.make) {
      requestFilter.make = this.filterForm.value.make;
    }
    if (this.filterForm.value.model) {
      requestFilter.model = this.filterForm.value.model;
    }
    if (this.filterForm.value.source) {
      requestFilter.source = this.filterForm.value.source;
    }
    if (this.filterForm.value.referrals) {
      requestFilter.referrals = this.filterForm.value.referrals;
    }
    if (this.filterForm.value.closedwon) {
      requestFilter.closedwon = this.filterForm.value.closedwon;
    }
    if (this.filterForm.value.deal_stage_pipeline) {
      requestFilter.deal_stage_pipeline = this.filterForm.value.deal_stage_pipeline;
    }
    return requestFilter;
  }

  filterSubmit() {
    const newFilter = {
      filter: this.getRequestFilter(),
    };

    this.filterService.saveAdvanceFilter(this.getRequestFilter(), 'deals_filter')
    this.updateFilter(newFilter);
  }

  onCalendarChange(selectedDateRange: IDateRangeSelection) {
    this.daterrange = DateTimeService.getDateRangeFromSelection(
      selectedDateRange
    );
    this.filterSubmit()
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  onExport() {
    const filterParam: requestsModels.ExportFilter = {
      type: 'request',
      search: this.search,
      filter: this.getRequestFilter(),
      order_by: this.filter.order_by,
      order_dir: this.filter.order_dir,
    };
    this.loader$.open();
    this.exportService$
      .postRequest(filterParam)
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(result => {
        this.loader$.close();
        if (result && result.data) {
          if(result.open_url){
            window.open(
              environment.apiUrl + '/export/download?token=' + result.data.token
            );
          }else{
            this.snack$.open(result.data, 'OK', {
              duration: 4000,
              verticalPosition: 'top',
              panelClass: ['snack-success'],
            });
          }
          
        } else {
          this.snack$.open('Something went wrong, Try again.', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-warning'],
          });
        }
      });
    return false;
  }

  setRefCheckBox($event: any) {
    if($event) {
      this.filterForm.patchValue({referrals: ['WithRef']});
    } else {
      this.filterForm.controls['referrals'].patchValue(null);
    }
  }

  setClosedWonCheckBox($event: any) {
    if($event) {
      this.filterForm.patchValue({closedwon: 'closedWon'});
    } else {
      this.filterForm.controls['closedwon'].patchValue(null);
    }
  }

  checkAllContactOwner($event:number) {
    this.disableAllOptionInContactOwner = !this.disableAllOptionInContactOwner;
      let arr = this.filterForm.controls['contact_owner'].value;
      if(this.disableAllOptionInContactOwner) {
        arr = ['0']
      }

      this.filterForm.patchValue({contact_owner: arr})
  }

  checkAllSource() {
    this.disableAllOptionInSource = !this.disableAllOptionInSource;
      let arr = this.filterForm.controls['source'].value;
      if(this.disableAllOptionInSource) {
        arr = ['10']
      }
      this.filterForm.patchValue({source: arr})
  }

  checkAllDealStagePipeline() {
    this.disableAllOptionInDealStagePipeline = !this.disableAllOptionInDealStagePipeline;
      let arr = this.filterForm.controls['deal_stage_pipeline'].value;
      if(this.disableAllOptionInDealStagePipeline) {
        arr = ['10']
      }
      this.filterForm.patchValue({deal_stage_pipeline: arr})
  }

  onClearSearch($event: any) {
    if($event == "") {
      this.onFilterChange();
    }
  }
  
  onClearFilterSearch($event: any) {
    if($event == "") {
      this.onLogFilterChange();
    }
  }

  applyFilter($event, type?:string) {
    this.disableAllOptionInSource = false
    this.disableAllOptionInContactOwner = false;
    this.disableAllOptionInDealStagePipeline = false;
    if (!type && this.filterForm.controls['source'].value?.includes("10")) {
      this.filterForm.controls['source'].value?.splice(0, 1)
      this.filterForm.get('source').setValue($event.value)
    }
    
    if (type && this.filterForm.controls['contact_owner'].value?.includes("0")) {
      this.filterForm.controls['contact_owner'].value?.splice(0, 1)
      this.filterForm.get('contact_owner').setValue($event.value)
    }
    if(this.filterForm.value.model) this.defaultYear = true;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.filterSubmit();
    }, 1200);

    if (!type && this.filterForm.controls['deal_stage_pipeline'].value?.includes("10")) {
      this.filterForm.controls['deal_stage_pipeline'].value?.splice(0, 1)
      this.filterForm.get('deal_stage_pipeline').setValue($event.value)
    }
  }

  toggleColumnVisibility(column, event) {
    if(column.key == 'full_name') {
      column.visible = !column.visible;
      if(column.visible) {
        this.columnHeaders[1].visible = true;
        this.columnHeaders[2].visible = true;
      } else {
        this.columnHeaders[1].visible = false;
        this.columnHeaders[2].visible = false;
      }
    } else if(column.key == 'first_name' || column.key == 'last_name') {
      column.visible = !column.visible;
      if(this.columnHeaders[1].visible && this.columnHeaders[2].visible) {
        this.columnHeaders[0].visible = true;
      } else {
        this.columnHeaders[0].visible = false;
      }
    } else {
      column.visible = !column.visible;
    }
    clearTimeout(this.timeout1);
    this.timeout1 = setTimeout(() => {
      this.addOrUpdateColumnFilter();
    }, 1000);
  }

  getFilteredColumns() {
    this.globalService$.getByIdAndName(this.sectionName).subscribe(res=> {
      if(res.data.length > 0) {
        this.isColumnAvailable = true;
        if(this.columnHeaders.length == res.data[0].table_column.length) {
          this.columnHeaders = res.data[0].table_column;
        }
        this.changeDetectorRefs.detectChanges();
      } else {
        this.isColumnAvailable = true;
      }
    })
  }

  addOrUpdateColumnFilter() {
    const payload = {
      filter_section_name: this.sectionName,
      column: this.columnHeaders
    };
    this.globalService$.createAndUpdate(payload).pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe();
  }

  toggleView() {
    if (!this.boardView) {
      localStorage.setItem("deal_view", 'board');
      this.boardView = true;
      this.getListOfYears();
    } else {
      localStorage.setItem("deal_view", 'table');
      this.boardView = false;
      this.getFilteredColumns();
      this.store$.dispatch(new actions.GetList(this.filter));
    }
  }

  selectedDealStage(data){
    if(data.value){
      this.dealStageName = data.value;
    }
  }

  getDealStagePipeline(){
    const payload = {
      page: 1,
      per_page: 20,
      order_by: 'created_at',
      order_dir: 'desc',
      filter:{}
    }
    this.vehicleService$.getDealsStagepipeline(payload).subscribe(data => {
        this.dealStage = data.data || [];
        this.dealStage.sort((a, b) => {
          return a.pipeline.localeCompare(b.pipeline);
        });
        this.filteredDealStage = this.dealStage.slice(0);
      });
  }

  getListOfYears() {
    if(this.RequestYears == undefined || this.RequestYears.length == 0) {
      this.service$.getYears().subscribe(RequestYears => {
        if(RequestYears) {
          if (!deepEqual(this.RequestYears, RequestYears)) {
            this.filteredYears = RequestYears;
            this.store$.dispatch(new actions.GetListYears(RequestYears));
          }
          this.RequestYears = RequestYears;
        }
      });
    }
  }

}
