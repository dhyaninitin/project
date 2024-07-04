import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { fromEvent, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
  tap,
} from 'rxjs/operators';
import * as _ from 'underscore';
import * as commonModels from 'app/shared/models/common.model';
import { TablePagination } from 'app/shared/models/common.model';
import * as usersModels from 'app/shared/models/user.model';
import { AppState } from 'app/store/';
import * as actions from 'app/store/users/users.actions';
import {
  didFetchSelector,
  fetchingSelector,
  filterSelector,
  metaSelector,
} from 'app/store/users/users.selectors';
import {
  dataSelector as logDataSelector,
  didFetchSelector as logDidFetchSelector,
  fetchingSelector as logFetchingSelector,
  filterSelector as logFilterSelector,
  metaSelector as logMetaSelector,
} from 'app/store/userlogs/userlogs.selectors';
import { initialState } from 'app/store/users/users.states';
import { NgxRolesService } from 'ngx-permissions';
import { UsersEditModalComponent } from './table/edit-modal/edit-modal.component';
import { DateTimeService, IDateRangeSelection } from 'app/shared/services/date-time.service';
import { PortalUser } from 'app/shared/models/portaluser.model';
import { ROLE_LIST } from 'app/core/constants';
import { UserService } from 'app/shared/services/apis/users.service'
import { initialState as initialLogState } from 'app/store/userlogs/userlogs.states';
import { Log, Filter as LogFilter, } from 'app/shared/models/log.model';
import * as logActions from 'app/store/userlogs/userlogs.actions';
import * as moment from 'moment-timezone';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';
import { VehicleService } from 'app/shared/services/apis/vehicle.service';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { GlobalService } from 'app/shared/services/apis/global.service';
import { formatLogMessage } from 'app/shared/helpers/utils';
import { FilterService } from 'app/shared/services/filter.service';
import { ExportService } from 'app/shared/services/apis/export.service';
import { environment } from 'environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [fadeInUp400ms, stagger40ms]
})
export class UsersComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('searchLogInput') searchLogInput: ElementRef;

  columnHeaders: Array<any> = [
    { key: 'full_name', label: 'Full Name', visible: true},
    { key: 'first_name', label: 'First Name', visible: true},
    { key: 'last_name', label: 'Last Name', visible: true},
    { key: 'phone', label: 'Phone', visible: true},
    { key: 'email_address', label: 'Email', visible: true},
    { key: 'contact_owner', label: 'Owner', visible: true},
    { key: 'source', label: 'Source', visible: true},
    { key: 'city', label: 'City', visible: true},
    { key: 'state', label: 'State', visible: true},
    { key: 'zip', label: 'Zip', visible: true},
    { key: 'type', label: 'Type', visible: true},
    { key: 'created_at', label: 'Created At', visible: true},
    { key: 'updated_at', label: 'Updated At', visible: true},
    { key: 'is_active', label: 'Active', visible: true},
    { key: 'actions', label: 'Actions', visible: true}
  ];
  private readonly sectionName: string = 'filter_register_user_page';
  isColumnAvailable: boolean = false;

  private onDestroy$ = new Subject<void>();

  public filter$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;
  public fetching$: Observable<any>;

  public filter: commonModels.Filter = initialState.filter;
  public meta: commonModels.Meta = initialState.meta;
  public search = '';
  public salespersonId: Number;
  public tablePagination: TablePagination = {
    length: initialState.meta.total,
    pageIndex: initialState.filter.page,
    pageSize: initialState.filter.per_page,
    previousPageIndex: 0,
  };
  public daterrange = {
    begin: null,
    end: null,
  };
  public portalUsers: Array<PortalUser>;
  public portalUserFilterCtrl: FormControl = new FormControl();
  public filteredPortalUsers: Array<PortalUser>;
  public filterForm: FormGroup;
  eddate: string | Date
  stdate: string | Date
  
  // daterrange: import("/var/www/html/portal-web/src/app/shared/services/date-time.service").IDateRange;

  public logs$: Observable<any>;
  public logFilter$: Observable<any>;
  public logMeta$: Observable<any>;
  public logDidFetch$: Observable<any>;
  public logFetching$: Observable<any>;
  public yearFetching$: Observable<any>;

  public createdBy: any;
	public createdByFilterCtrl: FormControl = new FormControl();
	public filteredCreatedBy: [any];

  public logFilter: LogFilter = initialLogState.filter;
  public logMeta: commonModels.Meta = initialLogState.meta;
  public logSearch = '';
  public logs: Array<Log>;

  public logPagination: TablePagination = {
    length: initialLogState.meta.total,
    pageIndex: initialLogState.filter.page,
    pageSize: initialLogState.filter.per_page,
    previousPageIndex: 0,
  };
  
  public sources: any;
  public sourceFilterCtrl: FormControl = new FormControl();
  public localData: Array<any>;
  public filteredSourcess: [any];
  disableAllOptionInSource: boolean = false;

  showFilterOptions: boolean = false;
  timeout: any;
  timeout1: any;

  public formatLogMessage = formatLogMessage;


  constructor(
    private store$: Store<AppState>,
    private dialog: MatDialog,
    private rolesService$: NgxRolesService,
    private fb: FormBuilder,
    private userService$: UserService,
    private changeDetectorRefs: ChangeDetectorRef,
    private portalUserService$: PortalUserService,
    private vehicleService$: VehicleService,
    private globalService$: GlobalService,
    private filterService:FilterService,
    private exportService$: ExportService,
    private snack$: MatSnackBar,
   ) {
    // To fetch column filters values
    this.getFilteredColumns();
    
    this.filter$ = this.store$.select(filterSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.fetching$ = this.store$.select(fetchingSelector);
    this.logs$ = this.store$.select(logDataSelector);
    this.logFilter$ = this.store$.select(logFilterSelector);
    this.logMeta$ = this.store$.select(logMetaSelector);
    this.logDidFetch$ = this.store$.select(logDidFetchSelector);
    this.logFetching$ = this.store$.select(logFetchingSelector);

    this.filterForm = this.fb.group({
      contact_owner: [''],
      start_date: null,
      end_date: null,
      first_name: null,
      last_name: null,
      phone: null,
      source: null,
      created_by: null,
      type: [10],
    });
    const salespersonObj = ROLE_LIST.find(item => item.name === 'salesperson' || item.name === 'concierge');
    this.salespersonId = salespersonObj.id;
  }

  ngAfterViewInit(): void {
    this.initData();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.store$.dispatch(new logActions.ClearDetail());
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
        takeUntil(this.onDestroy$),
        tap(data => {
          if (!deepEqual(this.filter, data)) {
            this.filterService.setCommonFilter('contacts_common_filter', {search:data.search})
            
            this.filter = data;
            this.initFilter();
          }
        })
      )
      .subscribe();

    this.meta$
      .pipe(
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
    
  
      this.portalUserService$.getOwnerListByRole(1).subscribe(res=>{
        if(res){
          this.portalUsers = res.data;
          this.filteredPortalUsers = this.portalUsers.slice(0);
        }
      }, error => {
        console.log("There are some errors. Please Check!", error);
      });  

          //srouces for filter dropdown
    this.vehicleService$
      .getAlRequestSources()
      .subscribe(data => {
        this.sources = data.data || [];
        this.filteredSourcess = this.sources.slice(0);
        this.filteredSourcess.sort((a, b) => a.name.localeCompare(b.name));
        
      });

    //listen for search field value changes for portal user
    this.portalUserFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterPortalUsers();
      });

    //createdby for filter dropdown
    this.userService$
      .getCreatedByList()
      .subscribe(data => {
        this.createdBy = data.data || [];
        this.filteredCreatedBy = this.createdBy.slice(0);
        
      });

    //listen for search field value changes for source
    this.createdByFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterCreatedByUsers();
      });
  }

  /** Filter Created by Users
   * @param PortalUser item
   * @return
   **/

   filterCreatedByUsers() {
    if (!this.createdBy) {
      return;
    }
    //get the search keyword
    let search = this.createdByFilterCtrl.value;
    if (!search) {
      this.filteredCreatedBy = this.createdBy.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredCreatedBy = this.createdBy.filter(
      item => item.full_name.toLowerCase().indexOf(search) > -1 || item.email.toLowerCase().indexOf(search) > -1
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
    //get the search keyword
    let search = this.portalUserFilterCtrl.value;

    if (!search) {
      this.filteredPortalUsers = this.portalUsers.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    //filter the banks
    this.filteredPortalUsers = this.portalUsers.filter(
      item => item.full_name.toLowerCase().indexOf(search) > -1 || item.email.toLowerCase().indexOf(search) > -1
    );


     // listen for search field value changes for source
     this.sourceFilterCtrl.valueChanges
     .pipe(
       debounceTime(10),
       takeUntil(this.onDestroy$)
     )
     .subscribe(() => {
       this.filterSources();
     });
  }

  loadData() {

    // Clone filter values
    this.filter = {...this.filter};
    
    const payload = {
      form:this.filterForm,
      filter:this.filter,
      common:'contacts_common_filter',
      advance:'contacts_filter'
    }
    const contacts_filter = this.filterService.getAdvanceFilter(payload)
    this.filterForm.patchValue(contacts_filter.form.value)
    this.filter = contacts_filter.filter
    this.search = this.filter.search

    if(this.filter['filter']['start_date'] && this.filter['filter']['end_date']){
      let start_date: any = moment(this.filter['filter']['start_date']);
      let end_date: any = moment(this.filter['filter']['end_date']);
      this.daterrange = {
        begin: start_date._d,
        end: end_date._d,
      }
    }

    this.store$.dispatch(new actions.GetList(this.filter));
  }

  initMeta() {
    this.tablePagination.length = this.meta.total;
    this.tablePagination.pageIndex = this.meta.current_page - 1;
    this.tablePagination.pageSize = this.meta.per_page;
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

  onLogPaginateChange(event) {
    const data = {
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    };
    this.updateLogFilter(data);
  }

  updateLogFilter(data) {
    const updated_filter = {
      ...this.logFilter,
      ...data,
    };
    this.store$.dispatch(new logActions.UpdateFilter(updated_filter));
  }

  initLogMeta() {
    this.logPagination.length = this.logMeta.total;
    this.logPagination.pageIndex = this.logMeta.current_page - 1;
    this.logPagination.pageSize = this.logMeta.per_page;
  }

  loadLogs() {
    this.store$.dispatch(new logActions.GetList(this.logFilter));
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
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

  updateFilter(data) {
    const updated_filter = {
      ...this.filter,
      ...data,
    };
    this.store$.dispatch(new actions.UpdateFilter(updated_filter));
  }

  onPaginateChange(event) {
    const data = {
      page: event.pageIndex + 1,
      per_page: event.pageSize
    };


    this.filterService.setCommonFilter('contacts_common_filter', data)
    this.updateFilter(data);
  }

  getRequestFilter() {
    const requestFilter: usersModels.RequestFilter = {};

    if (this.filterForm.value.contact_owner) {
      requestFilter.contact_owner = this.filterForm.value.contact_owner;
    }
    if (this.filterForm.value.created_by) {
      requestFilter.created_by = this.filterForm.value.created_by;
    }
    if (this.filterForm.value.first_name) {
      requestFilter.first_name = this.filterForm.value.first_name;
    }
    if (this.filterForm.value.last_name) {
      requestFilter.last_name = this.filterForm.value.last_name;
    }
    if (this.filterForm.value.source) {
      requestFilter.source = this.filterForm.value.source;
    }
    if (this.filterForm.value.phone) {
      requestFilter.phone = this.filterForm.value.phone;
    }
    if (this.daterrange.begin) {
      requestFilter.start_date = this.daterrange.begin;
    }
    if (this.daterrange.end) {
      requestFilter.end_date = this.daterrange.end;
    }
    if (this.filterForm.value.type == 0 || this.filterForm.value.type) {
      requestFilter.type = this.filterForm.value.type;
    }

    return requestFilter;
  }

  filterSubmit() {
    const newFilter = {
      filter: this.getRequestFilter(),
    };

    this.filterService.saveAdvanceFilter(this.getRequestFilter(), 'contacts_filter')
    this.updateFilter(newFilter);
  }

  onCalendarChange(selectedDateRange: IDateRangeSelection) {
    if(selectedDateRange.start_date == undefined && selectedDateRange.end_date == undefined) {
      localStorage.removeItem('advance_user_filter_start_date');
      localStorage.removeItem('advance_user_filter_end_date');
    }
    this.daterrange = DateTimeService.getDateRangeFromSelection(
      selectedDateRange
    );
    this.filterSubmit()
  }
  onAddItem() {
    const title = 'Add Contact';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      UsersEditModalComponent,
      {
        width: '720px',
        disableClose: false,
        data: { title: title, payload: {}, type: 'add' },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      }
      // const phoneNumber = formatPhoneNumber(res.phone);

      // const payload: User = {
      //   first_name: res.first_name,
      //   last_name: res.last_name,
      //   email_address: res.email_address,
      //   contact_owner_email: res.contact_owner_email,
      //   phone: phoneNumber['number'],
      //   phone_verified: 1,
      //   lease_captured: 0,
      // };

      this.store$.dispatch(new actions.CreateSuccess(res));
    });
  }

  checkAllSource() {
    this.disableAllOptionInSource = !this.disableAllOptionInSource;
      let arr = this.filterForm.controls['source'].value;
      if(this.disableAllOptionInSource) {
        arr = ['10']
      }
      this.filterForm.patchValue({source: arr})
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
    if (type && this.filterForm.controls['source'].value?.includes("10")) {
      this.filterForm.controls['source'].value?.splice(0, 1)
      this.filterForm.get('source').setValue($event.value)
    }
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.filterSubmit();
    }, 1200);
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

  reset(event){
    if(event.key == 'Backspace'){
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.filterSubmit();
      }, 1200);
    }
  }

  onContactExport(){
    const filterParam: usersModels.ExportFilter = {
      type: 'contact',
      search: this.search,
      filter: this.getRequestFilter(),
      order_by: this.filter.order_by,
      order_dir: this.filter.order_dir,
    };

    this.exportService$.postContact(filterParam).subscribe(result => {
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
      }else{
        this.snack$.open('Something went wrong, Try again.', 'OK', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: ['snack-warning'],
        });
      }
    });
  }
}