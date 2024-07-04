import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store';
import { Observable, Subject } from 'rxjs';
import * as deepEqual from 'deep-equal';
import { didFetchSelector, metaSelector, fetchingSelector} from 'app/store/vehicledata/vehicledata.selectors';
import * as commonModels from 'app/shared/models/common.model';
import { initialState } from 'app/store/vehicledata/vehicledata.states';
import { TablePagination } from 'app/shared/models/common.model';
import { debounceTime,distinctUntilChanged,filter,map,takeUntil,tap,} from 'rxjs/operators';
import * as vehicleData from 'app/shared/models/vehicledata.model';
import * as actions from 'app/store/vehicledata/vehicledata.actions';

import { Filter as LogFilter, Log, ScraperFilter } from 'app/shared/models/log.model';
import { initialState as initialLogState } from 'app/store/vehicledatalogs/vehicledatalogs.states';
import { dataSelector as logDataSelector, didFetchSelector as logDidFetchSelector,fetchingSelector as logFetchingSelector,
  filterSelector as logFilterSelector, metaSelector as logMetaSelector, } from 'app/store/vehicledatalogs/vehicledatalogs.selectors';
import * as logActions from 'app/store/vehicledatalogs/vehicledatalogs.actions';
import { formatLogMessage } from 'app/shared/helpers/utils';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import * as _ from 'underscore';
import { VehicleDataService } from 'app/shared/services/apis/vehicle-data.service';

@Component({
  selector: 'app-vehicle-data',
  templateUrl: './vehicle-data.component.html',
  styleUrls: ['./vehicle-data.component.scss'],
  animations: [fadeInUp400ms, stagger40ms],
})
export class VehicleDataComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchLogInput') searchLogInput: ElementRef;
  
  private onDestroy$ = new Subject<void>();
  columnHeaders: Array<{}> = [
    {key: 'year', label: 'Year', visible: true},
    {key: 'is_active', label: 'For Shop', visible: true},
    {key: 'is_scrapable', label: 'For Scraper', visible: true},
    {key: 'is_default', label: 'Default Year', visible: true},
    {key: 'created_at', label: 'Created At', visible: true},
    {key: 'updated_at', label: 'Updated At', visible: true},
  ];
  
  isColumnAvailable: boolean = true;

  public filter$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;
  public fetching$: Observable<any>;

  public tablePagination: TablePagination = {
    length: initialState.meta.total,
    pageIndex: initialState.filter.page,
    pageSize: initialState.filter.per_page,
    previousPageIndex: 0,
  };

  public filter: vehicleData.Filter = initialState.filter;
  public meta: commonModels.Meta = initialState.meta;

  // Logs

  public logs$: Observable<any>;
  public logFilter$: Observable<any>;
  public logMeta$: Observable<any>;
  public logDidFetch$: Observable<any>;
  public logFetching$: Observable<any>;

  public logFilter: LogFilter = initialLogState.filter;
  public logMeta: commonModels.Meta = initialLogState.meta;

  public logPagination: TablePagination = {
    length: initialLogState.meta.total,
    pageIndex: initialLogState.filter.page,
    pageSize: initialLogState.filter.per_page,
    previousPageIndex: 0,
  };
  public logs: Array<Log>;
  public status: Array<any> = [];

  formatLogMessage = formatLogMessage;
  public logSearch = '';
  public search = '';


  tabs = [
    { label: 'Year', index: 0 },
    { label: 'Brand', index: 1 },
    { label: 'Model', index: 2 },
    { label: 'Trim', index: 3 },
    { label: 'Media', index: 4 },
  ]

  constructor(
    private store$: Store<AppState>,
    private changeDetectorRefs: ChangeDetectorRef,
    private service$: VehicleDataService,
  ) {
    // For Data
    // this.filter$ = this.store$.select(filterSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.fetching$ = this.store$.select(fetchingSelector);

    // For logs
    this.logs$ = this.store$.select(logDataSelector);
    this.logFilter$ = this.store$.select(logFilterSelector);
    this.logMeta$ = this.store$.select(logMetaSelector);
    this.logDidFetch$ = this.store$.select(logDidFetchSelector);
    this.logFetching$ = this.store$.select(logFetchingSelector);
   }
  

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngAfterViewInit(): void {
    this.initData();
    
  }

  ngOnInit(): void {
    this.store$.dispatch(new actions.ClearDetail());
    this.store$.dispatch(new logActions.ClearDetail());
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  initData() {
    this.getStatus();
    
    this.didFetch$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(didFetch => !didFetch && this.loadData())
      )
      .subscribe();

      // Logs

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
      
  }

  initMeta() {
    this.tablePagination.length = this.meta.total;
    this.tablePagination.pageIndex = this.meta.current_page - 1;
    this.tablePagination.pageSize = this.meta.per_page;
  }

  loadData() {
    var per_page_limit = localStorage.getItem('vehicle_years_module_limit');
    var selected_order_dir = localStorage.getItem('vehicle_years_module_order_dir');
    var selected_order_by = localStorage.getItem('vehicle_years_module_order_by');
    var selected_page_no = localStorage.getItem('vehicle_years_module_page_count');

    // Clone filter values
    this.filter = {...this.filter};

    //check base on previous select item
    {
      if(per_page_limit != undefined && per_page_limit != null){
        this.filter.per_page = Number(per_page_limit);
      }else{
        this.filter.per_page = 10;
      }
    
      if(selected_order_by != undefined && selected_order_by != null && selected_order_by != "" && selected_order_dir != undefined && selected_order_dir != null && selected_order_dir != ""){
        this.filter.order_dir = selected_order_dir;
        this.filter.order_by = selected_order_by;
      }else{
        this.filter.order_dir = "desc";
        this.filter.order_by = "created_at";
      }

      if(selected_page_no != undefined && selected_page_no != null){
        this.filter.page = Number(selected_page_no);
      }else{
        this.filter.page = 1;
      }
    }
    this.store$.dispatch(new actions.GetList());
  }
  
  initLogMeta() {
    this.logPagination.length = this.logMeta.total;
    this.logPagination.pageIndex = this.logMeta.current_page - 1;
    this.logPagination.pageSize = this.logMeta.per_page;
  }

  loadLogs() {
    this.store$.dispatch(new logActions.GetList(this.logFilter));
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

  getStatus(){
    this.service$.getStatus().subscribe(res=> {
      if(res) {
        this.status = res.data;
      }
    });
  }


  getCurrentStatus(type: number) {
    if(this.status?.length > 0) {
      let index = this.status.findIndex(item => item.status == type);
      if(index != -1) {
        if(this.status[index].is_running == 1) {
          return true;
        }
      }
    }
    return false;
  }

  ontabCnange($event:any){
    const data = {
      page: 1,
      per_page:10,
      type: $event.index,
    };
    this.updateLogFilter(data);
  }

}
