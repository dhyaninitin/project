import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { Observable, Subject, fromEvent } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  skip,
  takeUntil,
  tap,
} from 'rxjs/operators';
import * as _ from 'underscore';

import { Filter as LogFilter, Log } from 'app/shared/models/log.model';
import { initialState as initialLogState } from 'app/store/workflow-settings/workflowSettings.states';
import {
  dataSelector as logDataSelector,
  didFetchSelector as logDidFetchSelector,
  fetchingSelector as logFetchingSelector,
  filterSelector as logFilterSelector,
  metaSelector as logMetaSelector,
} from 'app/store/workflow-settings/workflowSettings.selectors';
import * as logActions from 'app/store/workflow-settings/workflowSettings.actions';

import { formatLogMessage } from 'app/shared/helpers/utils';
import { TablePagination } from 'app/shared/models/common.model';
import * as commonModels from 'app/shared/models/common.model';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { AppState } from 'app/store/';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';

@Component({
  selector: 'app-workflow-settings',
  templateUrl: './workflow-settings.component.html',
  styleUrls: ['./workflow-settings.component.css'],
  animations: [fadeInUp400ms]
})
export class WorkflowSettingsComponent implements OnInit {

  private onDestroy$ = new Subject<void>();

  enrollNumber: number = 10;
  settingsForm: FormGroup;

  public filteredUsers: Array<any>;
  public owners: Array<any>;
  portalUsers = [];

  offset: number = 1;
  totalPages: number = 0;
  loading: boolean = false;

  public userFilterCtrl: FormControl = new FormControl();
  workflowSettings: any;

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
  @ViewChild('searchLogInput') searchLogInput: ElementRef;

  public logSearch = '';
  formatLogMessage = formatLogMessage;
  public search = '';
  filter: any ={};

  constructor(private fb: FormBuilder, private service$: WorkflowService,
    private changeDetectorRefs: ChangeDetectorRef, private snack$: MatSnackBar,
    private userService: PortalUserService,
    private store$: Store<AppState>,) {
    // For logs
    this.logs$ = this.store$.select(logDataSelector);
    this.logFilter$ = this.store$.select(logFilterSelector);
    this.logMeta$ = this.store$.select(logMetaSelector);
    this.logDidFetch$ = this.store$.select(logDidFetchSelector);
    this.logFetching$ = this.store$.select(logFetchingSelector);
  }

  ngAfterViewInit(): void {
    this.initLogData();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      enrollment_number: ['', Validators.required],
      portal_users: ['', Validators.required]
    });
    this.getWorkflowSettings();
    this.filterUsers();

    this.userFilterCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        skip(1),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.offset = 1;
        this.portalUsers = [];
        this.filterUsers();
      });



  }

  save() {
    const { enrollment_number, portal_users } = this.settingsForm.value;
    const payload = {
      enrollment_number,
      portal_users,
      id: this.workflowSettings?.id ? this.workflowSettings.id : null
    }
    if (this.settingsForm.valid) {
      this.service$.saveWorkflowSettings(payload).subscribe(res => {
        const message = this.workflowSettings?.id ? 'Updated' : 'Added';
        this.snack$.open(`${message} successfully`, 'OK', {
          duration: 2000,
          verticalPosition: 'top',
          panelClass: ['snack-success'],
        });
        this.getWorkflowSettings();
        this.store$.dispatch(new logActions.GetList(this.logFilter));
        this.refreshTable();
      }, err => {
        this.snack$.open(err, 'OK', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: ['snack-warning'],
        });
      })
    }
  }

  getNextBatch() {
    this.loading = true;
    this.offset = this.offset + 1;
    this.filterUsers();
  }

  filterUsers() {
    this.portalUsers = [];
    const search = this.userFilterCtrl.value || '';

    const ownerParam: any = {
      order_by: 'created_at',
      order_dir: 'desc',
      page: this.offset,
      per_page: 20,
      filter: { roles: "1,2" },
      search,
    };

    this.userService.getList(ownerParam).subscribe(({ data, meta }) => {
      this.portalUsers.push(...data);
      this.owners = this.portalUsers;
      this.totalPages = meta.last_page;
      this.filteredUsers = this.owners.slice(0);
      this.loading = false;
      this.refreshTable();
    });
  }

  getWorkflowSettings() {
    this.service$.getWorkflowSettings().subscribe(res => {
      this.workflowSettings = res.data;
      if (this.workflowSettings) {
        const formValue = {
          "enrollment_number": this.workflowSettings.enrollment_number,
          "portal_users": this.workflowSettings.portal_users
        }
        this.settingsForm.patchValue(formValue);
      }
    })
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  initLogData() {
    // for logs
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

  onLogPaginateChange(event) {
    const data = {
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    };
    this.updateLogFilter(data);
  }

  loadLogs() {
    this.store$.dispatch(new logActions.GetList(this.logFilter));
  }
  
  initLogMeta() {
    this.logPagination.length = this.logMeta.total;
    this.logPagination.pageIndex = this.logMeta.current_page - 1;
    this.logPagination.pageSize = this.logMeta.per_page;
  }

  onLogFilterChange() {
    console.log(this.logSearch)
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

  onClearFilterSearch($event: any) {
    if($event == "") {
      this.onLogFilterChange();
    }
  }

  updateLogFilter(data) {
    const updated_filter = {
      ...this.logFilter,
      ...data,
    };
    this.store$.dispatch(new logActions.UpdateFilter(updated_filter));
  }
}
