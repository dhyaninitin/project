import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { fromEvent, Observable, Subject } from 'rxjs';
import * as commonModels from 'app/shared/models/common.model';
import * as taskModels from 'app/shared/models/tasks.model';
import { TablePagination } from 'app/shared/models/common.model';
import { initialState } from 'app/store/tasks/tasks.states';
import * as actions from 'app/store/tasks/tasks.actions';
import {
  didFetchSelector,
  fetchingSelector,
  filterSelector,
  metaSelector,
} from 'app/store/tasks/tasks.selectors';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store';
import * as deepEqual from 'deep-equal';
import * as _ from 'underscore';
import { TasksService } from 'app/shared/services/apis/tasks.service';
import { Filter as LogFilter, Log } from 'app/shared/models/log.model';
import { initialState as initialLogState } from 'app/store/taskslogs/tasklogs.states';
import {
  dataSelector as logDataSelector,
  didFetchSelector as logDidFetchSelector,
  fetchingSelector as logFetchingSelector,
  filterSelector as logFilterSelector,
  metaSelector as logMetaSelector,
} from 'app/store/taskslogs/tasklogs.selectors';
import * as logActions from 'app/store/taskslogs/tasklogs.actions';
import { formatLogMessage } from 'app/shared/helpers/utils';
import { GlobalService } from 'app/shared/services/apis/global.service';
import { NgxRolesService } from 'ngx-permissions';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  animations: [fadeInUp400ms, stagger40ms],
})
export class TasksComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('searchLogInput') searchLogInput: ElementRef;
  columnHeaders: Array<any> = [
    { key: 'title', label: 'Title', visible: true},
    { key: 'description', label: 'Description', visible: true},
    { key: 'due_date', label: 'Due Date', visible: true},
    { key: 'task_owner', label: 'Task Owner', visible: true},
    // { key: 'actions', label: 'Actions', visible: true}
  ];
  isColumnAvailable: boolean = false;
  private readonly sectionName: string = 'filter_tasks_page';

  public search = '';
  public logSearch = '';

  showFilterOptions: boolean = false;

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

  public logFilter: LogFilter = initialLogState.filter;
  public logMeta: commonModels.Meta = initialLogState.meta;

  public filter: taskModels.Filter = initialState.filter;
  public meta: commonModels.Meta = initialState.meta;
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
  showCompleted: boolean = false;

  formatLogMessage = formatLogMessage;
  
  constructor(
    private store$: Store<AppState>,
    private service$: TasksService,
    private changeDetectorRefs: ChangeDetectorRef,
    private globalService$: GlobalService,
    private rolesService$: NgxRolesService,
  ) {
    // To fetch column filters values
    this.getFilteredColumns();

    // For Data
    this.filter$ = this.store$.select(filterSelector);
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

  ngAfterViewInit(): void {
    this.initData();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.store$.dispatch(new actions.ClearDetail());
    this.store$.dispatch(new logActions.ClearDetail());
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
            if(data.search != ""){
              localStorage.setItem("tasks_module_search_keyword", data.search);
            }else{
              localStorage.removeItem("tasks_module_search_keyword");
            }
            
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
  }

  onClearSearch($event: any) {
    if($event == "") {
      this.onFilterChange();
    }
  }

  onPaginateChange(event) {
    const data = {
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    };

    //set value in local storage
    localStorage.setItem('tasks_module_limit', event.pageSize);
    localStorage.setItem('tasks_module_page_count', data.page);

    this.updateFilter(data);
  }

  onClearFilterSearch($event: any) {
    if($event == "") {
      this.onLogFilterChange();
    }
  }

  onLogPaginateChange(event) {
    const data = {
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    };
    this.updateLogFilter(data);
  }

  
  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  initFilter() {
    this.search = this.filter.search;
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

  loadData() {
    var per_page_limit = localStorage.getItem('tasks_module_limit');
    var selected_order_dir = localStorage.getItem('tasks_module_order_dir');
    var selected_order_by = localStorage.getItem('tasks_module_order_by');
    var selected_page_no = localStorage.getItem('tasks_module_page_count');
    var search_keyword = localStorage.getItem('tasks_module_search_keyword');
    var show_completed = localStorage.getItem('tasks_module_show_completed');

    // Clone filter values
    this.filter = {...this.filter};

    //check base on previous select item
    {
      if(per_page_limit != undefined && per_page_limit != null){
        this.filter.per_page = Number(per_page_limit);
      }else{
        this.filter.per_page = 20;
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

      if(search_keyword != undefined && search_keyword != null){
        this.filter.search = search_keyword;
        this.search = search_keyword;
      }else {
        this.filter.search = "";
        this.search="";
      }

      if(show_completed != undefined && show_completed != null){
        this.filter.show_completed = Number(show_completed);
        this.showCompleted = this.filter.show_completed ? true : false;
      }else{
        this.filter.show_completed = 0;
      }
    }

    this.store$.dispatch(new actions.GetList(this.filter));
  }

  loadLogs() {
    this.store$.dispatch(new logActions.GetList(this.logFilter));
  }

  addNewTask() {
    this.service$.isEnableAddNewTaskBtn = !this.service$.isEnableAddNewTaskBtn;
  }

  showCompletedTask($event: any) {
    const data = {
      show_completed: $event.checked ? 1 : 0
    };

    //set value in local storage
    localStorage.setItem('tasks_module_show_completed', data.show_completed.toString());
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

  updateLogFilter(data) {
    const updated_filter = {
      ...this.logFilter,
      ...data,
    };
    this.store$.dispatch(new logActions.UpdateFilter(updated_filter));
  }

  getFilteredColumns() {
    this.globalService$.getByIdAndName(this.sectionName).subscribe(res=> {
      if(res.data.length > 0) {
        this.isColumnAvailable = true;
        this.columnHeaders = res.data[0].table_column;
        this.getDisplayedColumns();
        this.changeDetectorRefs.detectChanges();
      } else {
        this.isColumnAvailable = true;
        this.getDisplayedColumns();
      }
    })
  }

  isAllowChangeTaskOwner() {
    const roles = this.rolesService$.getRoles();
    if(roles['salesperson'] || roles['concierge']) {
      return true;
    }
    return false;
  }

  getDisplayedColumns() {
    if(this.isAllowChangeTaskOwner() && this.columnHeaders) {
      const index = this.columnHeaders.findIndex(item => item.key == 'task_owner');
      if(index != -1) {
        this.columnHeaders.splice(index, 1);
      }
    }
  }
}
