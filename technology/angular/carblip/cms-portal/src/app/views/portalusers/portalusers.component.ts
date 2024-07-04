import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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

import { egretAnimations } from 'app/shared/animations/egret-animations';

import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { PortalUser, UpdatePortalUser } from 'app/shared/models/portaluser.model';
import { TablePagination } from 'app/shared/models/common.model';
import * as commonModels from 'app/shared/models/common.model';
import {
  Filter as LogFilter,
  Log,
  LogResponse,
} from 'app/shared/models/log.model';
import { AppState } from 'app/store/';
import * as logActions from 'app/store/portaluserlogs/portaluserlogs.actions';
import {
  dataSelector as logDataSelector,
  didFetchSelector as logDidFetchSelector,
  fetchingSelector as logFetchingSelector,
  filterSelector as logFilterSelector,
  metaSelector as logMetaSelector,
} from 'app/store/portaluserlogs/portaluserlogs.selectors';
import { initialState as initialLogState } from 'app/store/portaluserlogs/portaluserlogs.states';
import * as actions from 'app/store/portalusers/portalusers.actions';
import {
  didFetchSelector,
  fetchingSelector,
  filterSelector,
  metaSelector,
} from 'app/store/portalusers/portalusers.selectors';
import { initialState } from 'app/store/portalusers/portalusers.states';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { PortalUsersEditModalComponent } from './table/edit-modal/edit-modal.component';
import { ROLE_LIST } from 'app/core/constants';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as portalusersModels from 'app/shared/models/portaluser.model';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { GlobalService } from 'app/shared/services/apis/global.service';
import { FilterService } from 'app/shared/services/filter.service';

@Component({
  selector: 'app-portalusers',
  templateUrl: './portalusers.component.html',
  styleUrls: ['./portalusers.component.scss'],
  animations: [fadeInUp400ms, stagger40ms],
})
export class PortalUsersComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('searchLogInput') searchLogInput: ElementRef;
  columnHeaders: Array<{}> = [
    { key: 'profile_image', label: 'Profile Image', visible: true},
    { key: 'first_name', label: 'First Name', visible: true},
    { key: 'last_name', label: 'Last Name', visible: true},
    { key: 'email', label: 'Email', visible: true},
    { key: 'phone', label: 'Phone', visible: true},
    { key: 'role', label: 'Role', visible: true},
    { key: 'location', label: 'Location', visible: true},
    { key: 'roundrobin', label: 'RoundRobin', visible: true},
    { key: 'is_active', label: 'Active', visible: true},
    { key: 'actions', label: 'Actions', visible: true},
  ];
  isColumnAvailable: boolean = false;
  private readonly sectionName: string = 'filter_portal_users_page';

  private onDestroy$ = new Subject<void>();

  public filter$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;
  public fetching$: Observable<any>;

  public logs$: Observable<any>;
  public logFilter$: Observable<any>;
  public logMeta$: Observable<any>;
  public logDidFetch$: Observable<any>;
  public logFetching$: Observable<any>;

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

  public logs: Array<Log>;
  public isLogLoading: Boolean = false;

  public roles: Array<any> = ROLE_LIST;
  public filterForm: FormGroup;
  disableAllOptionInSource: boolean = false;

  showFilterOptions: boolean = false;
  timeout: any;
  timeout1: any;

  constructor(
    private store$: Store<AppState>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private changeDetectorRefs: ChangeDetectorRef,
    private globalService$: GlobalService,
    private filterService:FilterService
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
      roles: null,
      isroundrobin: null,
      isactive: null,
      isinactive: null
    });
  }

  ngAfterViewInit(): void {
    this.initData();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
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
            this.filterService.setCommonFilter('portalusers_common_filter', {search:data.search})
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
            console.log(data.search, this.logFilter);
            if(data.search != ""){
              localStorage.setItem("portal_users_log_module_search_keyword", data.search);
            }else{
              localStorage.removeItem("portal_users_log_module_search_keyword");
            }
            this.logFilter = data;
            this.logSearch = this.logFilter.search;
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
  }

  loadData() {

    //Clone Filter variable
    this.filter = {...this.filter};

    const payload = {
      form:this.filterForm,
      filter:this.filter,
      common:'portalusers_common_filter',
      advance:'portalusers_filter'
    }
    const portalusers_filter = this.filterService.getAdvanceFilter(payload)
    this.filterForm.patchValue(portalusers_filter.form.value)
    this.filter = portalusers_filter.filter
    this.search = this.filter.search

    this.filterForm.get('isactive').setValue(Number(this.filter['filter'].isactive) == 1 ? true : false)
    this.filterForm.get('isroundrobin').setValue(Number(this.filter['filter'].isroundrobin) == 1 ? true : false)
    this.filterForm.get('isinactive').setValue(Number(this.filter['filter'].isinactive) == 1 ? true : false)
      this.loadLogs();

    this.store$.dispatch(new actions.GetList(this.filter));
  }

  loadLogs() {
    var per_page_log_limit = localStorage.getItem('portal_users_log_module_limit');
    var selected_page_log_no = localStorage.getItem('portal_users_log_module_page_count');
    var search_log_keyword = localStorage.getItem('portal_users_log_module_search_keyword');

    //Clone log Filter
    this.logFilter = {...this.logFilter};
    //check base on previous select item
    {
      if(per_page_log_limit != undefined && per_page_log_limit != null){
        this.logFilter.per_page = Number(per_page_log_limit);
      }else{
        this.logFilter.per_page = 20;
      }

      if(selected_page_log_no != undefined && selected_page_log_no != null){
        this.logFilter.page = Number(selected_page_log_no);
      }else{
        this.logFilter.page = 1;
      }

      if(search_log_keyword != undefined && search_log_keyword != null){
        this.logFilter.search = search_log_keyword;
        this.logSearch = search_log_keyword;
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

  onLogPaginateChange(event) {
    const data = {
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    };
    localStorage.setItem('portal_users_log_module_limit', event.pageSize);
    localStorage.setItem('portal_users_log_module_page_count', data.page);
    
    this.updateLogFilter(data);
  }

  updateLogFilter(data) {
    const updated_filter = {
      ...this.logFilter,
      ...data,
    };
    this.store$.dispatch(new logActions.UpdateFilter(updated_filter));
  }

  updateFilter(data) {
    const updated_filter = {
      ...this.filter,
      ...data,
    };
    this.store$.dispatch(new actions.UpdateFilter(updated_filter));
    
    this.filterService.setCommonFilter('portalusers_common_filter', data)
  }

  onPaginateChange(event) {
    const data = {
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    };

    
    this.filterService.setCommonFilter('portalusers_common_filter', data)

    this.updateFilter(data);
  }

  onAddItem() {
    const title = 'Add CarBlip Team Member';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      PortalUsersEditModalComponent,
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

      this.store$.dispatch(new actions.CreateSuccess(res));
    });
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  filterSubmit() {
    const newFilter = {
      filter: this.getRequestFilter(),
    };
    // newFilter.filter.roles = newFilter.filter.roles == undefined ? '0' : newFilter.filter.roles.toString();
    newFilter.filter.isroundrobin = newFilter.filter.isroundrobin ? '1' : '0';
    newFilter.filter.isactive = newFilter.filter.isactive ? '1' : '0';
    newFilter.filter.isinactive = newFilter.filter.isinactive ? '1' : '0';

    let portalUsersFilter = {
      roles:newFilter.filter.roles != undefined ? newFilter.filter.roles : null,
      isroundrobin:newFilter.filter.isroundrobin,
      isactive:newFilter.filter.isactive,
      isinactive:newFilter.filter.isinactive
    }
    this.filterService.saveAdvanceFilter(portalUsersFilter, 'portalusers_filter')
    this.updateFilter(newFilter);
    this.refreshTable();  
  }

  getRequestFilter() {
    const requestFilter: portalusersModels.RequestFilter = {};

    if (this.filterForm.value.roles) {
      requestFilter.roles = this.filterForm.value.roles;
    }
    if (this.filterForm.value.isactive) {
      requestFilter.isactive = this.filterForm.value.isactive;
    }
    if (this.filterForm.value.isinactive) {
      requestFilter.isinactive = this.filterForm.value.isinactive;
    }
    if (this.filterForm.value.isroundrobin) {
      requestFilter.isroundrobin = this.filterForm.value.isroundrobin;
    }
    return requestFilter;
  }

  checkAllSource() {
    this.disableAllOptionInSource = !this.disableAllOptionInSource;
      let arr = this.filterForm.controls['roles'].value;
      if(this.disableAllOptionInSource) {
        arr = ["0"]
      }
      this.filterForm.patchValue({roles: arr});
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

  applyFilter($event) {
    this.disableAllOptionInSource = false;
    if (this.filterForm.controls['roles'].value?.includes("0")) {
      this.filterForm.controls['roles'].value.splice(0, 1)
      this.filterForm.get('roles').setValue($event.value)
    }
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.filterSubmit();
    }, 1200);
  }

  toggleColumnVisibility(column, event) {
    column.visible = !column.visible;
    clearTimeout(this.timeout1);
    this.timeout1 = setTimeout(() => {
      this.addOrUpdateColumnFilter();
    }, 1000);
  }

  getFilteredColumns() {
    this.globalService$.getByIdAndName(this.sectionName).subscribe(res=> {
      if(res.data.length > 0) {
        this.isColumnAvailable = true;
        this.columnHeaders = res.data[0].table_column;
        this.changeDetectorRefs.detectChanges();
      } else {
        this.isColumnAvailable = true;
        this.changeDetectorRefs.detectChanges();
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
}
