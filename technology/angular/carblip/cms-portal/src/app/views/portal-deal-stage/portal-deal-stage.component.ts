import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { TablePagination } from 'app/shared/models/common.model';
import * as commonModels from 'app/shared/models/common.model';
import { DealStageService } from 'app/shared/services/apis/dealstage.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/dealstage/dealstage.actions';
import {
  didFetchSelector,
  fetchingSelector,
  filterSelector,
  metaSelector,
} from 'app/store/dealstage/dealstage.selectors';
import { initialState } from 'app/store/dealstage/dealstage.states';
import { GlobalService } from 'app/shared/services/apis/global.service';
import { DealStageAddEditModalComponent } from './table/add-edit-modal/add-edit-modal.component';
import { initialState as initialLogState } from 'app/store/dealstagelogs/dealstagelogs.states';

import * as logActions from 'app/store/dealstagelogs/dealstagelogs.actions';
import {
  Filter as LogFilter,
  Log
} from 'app/shared/models/log.model';

import {
  dataSelector as logDataSelector,
  didFetchSelector as logDidFetchSelector,
  fetchingSelector as logFetchingSelector,
  filterSelector as logFilterSelector,
  metaSelector as logMetaSelector,
} from 'app/store/dealstagelogs/dealstagelogs.selectors';

@Component({
  selector: 'app-portal-deal-stage',
  templateUrl: './portal-deal-stage.component.html',
  styleUrls: ['./portal-deal-stage.component.scss']
})
export class PortalDealStageComponent implements OnInit {
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('searchLogInput') searchLogInput: ElementRef;
  columnHeaders: Array<{}> = [
    { key: 'label', label: 'Name', visible: true},
    { key: 'pipeline', label: 'Pipeline Name', visible: true},
    { key: 'actions', label: 'Actions', visible: true}
  ];
  isColumnAvailable: boolean = false;
  private readonly sectionName: string = 'filter_portal_deal_stages_page';

  private onDestroy$ = new Subject<void>();

  public filter$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;
  public fetching$: Observable<any>;

  public filter: commonModels.Filter = initialState.filter;
  public meta: commonModels.Meta = initialState.meta;
  public search = '';

  public logFilter: LogFilter = initialLogState.filter;
  public logMeta: commonModels.Meta = initialLogState.meta;
  public logSearch = '';
  public logs: Array<Log>;

  public logs$: Observable<any>;
  public logFilter$: Observable<any>;
  public logMeta$: Observable<any>;
  public logDidFetch$: Observable<any>;
  public logFetching$: Observable<any>;

  public logPagination: TablePagination = {
    length: initialLogState.meta.total,
    pageIndex: initialLogState.filter.page,
    pageSize: initialLogState.filter.per_page,
    previousPageIndex: 0,
  };

  public isRefreshing = false;

  public tablePagination: TablePagination = {
    length: initialState.meta.total,
    pageIndex: initialState.filter.page,
    pageSize: initialState.filter.per_page,
    previousPageIndex: 0,
  };
  timeout: any;

  constructor(
    private store$: Store<AppState>,
    private dealstageService$: DealStageService,
    private snack$: MatSnackBar,
    private dialog: MatDialog,
    private _cdr: ChangeDetectorRef,
    private globalService$: GlobalService
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
  }

  ngAfterViewInit(): void {
    this.initData();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.store$.dispatch(new actions.ClearDetail()); // Need to remove once deal stage module is removed
    this.store$.dispatch(new logActions.ClearDetail());
  }

  ngOnInit() {
    
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
            if(data.search != ""){
              localStorage.setItem("deal_stage_log_module_search_keyword", data.search);
            }else{
              localStorage.removeItem("deal_stage_log_module_search_keyword");
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
    this.store$.dispatch(new actions.GetPortalDealStageList(this.filter));
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

  refreshTable() {
    this._cdr.detectChanges();
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
      per_page: event.pageSize,
    };
    this.updateFilter(data);
  }

  onRefresh() {
    this.isRefreshing = true;
    this.dealstageService$.refresh().subscribe(data => {
      this.isRefreshing = false;
      if (data && data.result) {
        this.snack$.open(data.result, 'OK', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: ['snack-success'],
        });
        this.store$.dispatch(new actions.ClearDetail());
      }
    });
  }

  onClearSearch($event: any) {
    if($event == "") {
      this.onFilterChange();
    }
  }

  toggleColumnVisibility(column, event) {
    column.visible = !column.visible;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
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
        this._cdr.detectChanges();
      } else {
        this.isColumnAvailable = true;
        this._cdr.detectChanges();
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

  onAddItem() {
    const title = 'Add New Deal Stage';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      DealStageAddEditModalComponent,
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
      this.store$.dispatch(new logActions.GetList(initialLogState.filter));
    });
  }

  loadLogs() {
    var per_page_log_limit = localStorage.getItem('deal_stages_log_module_limit');
    var selected_page_log_no = localStorage.getItem('deal_stages_log_module_page_count');
    var search_log_keyword = localStorage.getItem('deal_stage_log_module_search_keyword');

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

  
  onClearFilterSearch($event: any) {
    if($event == "") {
      this.onLogFilterChange();
    }
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
    
    //set value in local storage
    localStorage.setItem('deal_stages_log_module_limit', event.pageSize);
    localStorage.setItem('deal_stages_log_module_page_count', data.page);

    this.updateLogFilter(data);
  }

  updateLogFilter(data) {
    const updated_filter = {
      ...this.logFilter,
      ...data,
    };
    this.store$.dispatch(new logActions.UpdateFilter(updated_filter));
  }
}
