import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { AppState } from 'app/store';
import { Observable, Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, skip, takeUntil, tap } from 'rxjs/operators';
import * as commonModels from 'app/shared/models/common.model';
import { Task, TaskLog, TaskOwner } from 'app/shared/models/tasks.model';
import * as actions from 'app/store/tasks/tasks.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/tasks/tasks.selectors';
import { initialState } from 'app/store/tasks/tasks.states';
import * as deepEqual from 'deep-equal';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TasksService } from 'app/shared/services/apis/tasks.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxRolesService } from 'ngx-permissions';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { formatLogMessage } from 'app/shared/helpers/utils';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as logActions from 'app/store/taskslogs/tasklogs.actions';
import { initialState as initialLogState } from 'app/store/taskslogs/tasklogs.states';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import * as authActions from 'app/store/auth/authentication.action';
import { AuthService } from 'app/shared/services/auth/auth.service';

@Component({
  selector: 'app-tasks-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  animations: [fadeInUp400ms, stagger40ms, fadeInRight400ms,
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  ])],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline'
      } as MatFormFieldDefaultOptions
    }
  ]
})
export class TableComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() columnHeaders: Array<any>;
  public selectedRecordDetail: any;
  public sortKey:string;
  public sortDirection:string;
  public taskForm: FormGroup;
  private onDestroy$ = new Subject<void>();

  public tasks$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;

  public tasks: Array<Task> = [];
  public meta: commonModels.Meta;
  public offset: number;

  ownerOffset: number = 1;
  totalOwnersPages: number = 0;
  loadingOwners: boolean = false;
  public ownersFilterCtrl: FormControl = new FormControl();
  
  public filteredOwners: Array<TaskOwner>;
  public owners: Array<TaskOwner>;
  totalOwners = [];

  columnsToDisplay = [];
  columnsToDisplayWithExpand = [];
  expandedElement: Task | null;
  
  formatLogMessage = formatLogMessage;
  userProfile: any;
  selectedTask: any;

  constructor(
    private fb: FormBuilder,
    private store$: Store<AppState>,
    private changeDetectorRefs: ChangeDetectorRef,
    public service$: TasksService,
    private rolesService$: NgxRolesService,
    private snack$: MatSnackBar,
    private loader$: AppLoaderService,
    private authService$: AuthService,
  ) { 
          
    this.initform();
    this.tasks$ = this.store$.select(dataSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.offset = 1;

    this.sortKey = localStorage.getItem("tasks_module_order_by");
    this.sortDirection=localStorage.getItem("tasks_module_order_dir");
  }
  ngAfterViewInit(): void {
    this.getDisplayedColumns();
    this.columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.getUserInfo()
    this.tasks$
    .pipe(
      debounceTime(10),
      takeUntil(this.onDestroy$),
      tap(tasks => {
        if (!deepEqual(this.tasks, tasks)) {
          this.tasks = tasks;
          this.refreshTable();
        }
      })
    )
    .subscribe();

    this.meta$
    .pipe(
      debounceTime(10),
      takeUntil(this.onDestroy$),
      tap(meta => {
        this.meta = meta;
        this.offset = meta.from;
        this.refreshTable();
      })
    )
    .subscribe();

    // listen for search field value changes for owner
    this.ownersFilterCtrl.valueChanges
    .pipe(
      debounceTime(500),
      distinctUntilChanged(),
      skip(1),
      takeUntil(this.onDestroy$)
    )
    .subscribe(() => {
      this.offset = 1;
      this.totalOwners = [];
      this.filterOwners();
    });
  }

  
  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  initform() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      due_date: [''],
      task_owner: [''],
      description: ['']
    });

    this.isAllowChangeTaskOwner();
  }

  showTaskDetails(item:Task | null){
    if(this.expandedElement==null || this.expandedElement != item){
      this.filterOwners(item.task_owner_id);
      this.taskForm.patchValue({
        title: item.title,
        due_date: item.due_date,
        task_owner: item.task_owner_id,
        description: item.description
      });
  
      if(item.task_status == 1) {
        this.taskForm.disable();
      } else {
        this.taskForm.enable();
      }
    }
    this.expandedElement = this.expandedElement === item ? null : item
    this.isAllowChangeTaskOwner();
  }

  sortData(event) {
    localStorage.setItem("tasks_module_order_by", event.active);
    localStorage.setItem("tasks_module_order_dir", event.direction);

    const updated_filter = {
      order_by: event.active ? event.active : initialState.filter.order_by,
      order_dir: event.direction
        ? event.direction
        : initialState.filter.order_dir,
    };
    this.store$.dispatch(new actions.UpdateFilter(updated_filter));
  }

  changeTaskStatus(event: any, id: number) {
    const payload = {
      id: id,
      data: {
        task_status: event.checked ? 1 : 0 
      }
    };
    this.updateTasks(payload, 'status')
    // this.store$.dispatch(new actions.Update(payload));
  }
  
  textTruncate(text: string) {
    if(text) {
      if(text.length > 60) {
        return text.substring(0, 60) + "...";
      } else {
        return text;
      }
    }
    return "";
  }

  getNextBatchOfOwners() {
    this.loadingOwners = true;
    this.ownerOffset = this.ownerOffset + 1;
    this.filterOwners();
  }

  filterOwners(newId = null) {
    this.owners = [];
    const search = this.ownersFilterCtrl.value || '';
    let ownerid = newId;
    if(this.taskForm.get('task_owner').value != "") {
      ownerid = this.taskForm.get('task_owner').value;
    }
    const ownerParam = {
      order_by: 'created_at',
      order_dir: 'desc',
      page: this.ownerOffset,
      per_page: 20,
      search,
    };

    this.service$.getListOfOwners(ownerParam, ownerid).subscribe(({ data, meta }) => {
      this.totalOwners.push(...data);
      this.owners = this.totalOwners;
      this.totalOwnersPages = meta.last_page;
      this.filteredOwners = this.owners.slice(0);
      this.loadingOwners = false;
      this.refreshTable();
    });
  }
  
  updateTask(task: Task) {
    if(this.taskForm.valid) {
      this.loader$.open()
      const {value} = this.taskForm;
      let updatedData = {};
      for(const controlName in this.taskForm.controls) {
        if(this.taskForm.controls[controlName].dirty) {
          updatedData[controlName] = value[controlName];
        }
      }
      const payload = {
        id: task.id,
        data: updatedData
      }
      this.updateTasks(payload)
      // this.store$.dispatch(new actions.Update(payload));
    }
  }

  addTask($event: any) {
    const title = $event.target.value;
    if(title) {
      const payload = {
        title: title
      }
      // this.store$.dispatch(new actions.Create(payload));
      
      this.service$.isEnableAddNewTaskBtn = false;
      this.service$.create(payload).subscribe(({data}) => {
          this.snack$.open('Task added!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          this.tasks = [data , ...this.tasks]
          this.showTaskDetails(data)
          this.refreshTable();
          this.store$.dispatch(new logActions.GetList(initialLogState.filter));
      })
    } else {
    }
    // this.service$.isEnableAddNewTaskBtn = false;
  }

  createLogsMessage(item: TaskLog[]){
    if(item) {
      let message = "";
      item.map((msg) =>{
        message += '\u2022' + " " + msg.content.replace(/<[^>]*>/g, '') + '\n';
      });
      return message
    }
    return '';
  }

  isAllowChangeTaskOwner() {
    const roles = this.rolesService$.getRoles();
    if(roles['manager']){
      return false;
    }
    this.taskForm.controls['task_owner'].disable();
    return true
  }

  getDisplayedColumns() {
    let header = [...this.columnHeaders];
    this.columnsToDisplay = header.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }
  
  sortFunc(task_logs): any[] {
    return task_logs.slice().sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  getUserInfo() {
    this.authService$.getUserInfo().pipe(
      takeUntil(this.onDestroy$),
      map(result => result),
      catchError(err => {
        return of(err);
      })
    )
      .subscribe(result => {
        this.userProfile = result.data;
      });
  }

  updateTasks(payload, type?:string){
    this.service$.update(payload.id,payload.data).subscribe(({data}) => {
      if(!type){
        this.tasks = this.tasks.map(el => {
          return el = el.id === data.id ? data : el;
        })
        // this.tasks = this.tasks.filter(item => item.task_owner_id == this.userProfile.id)
        this.loader$.close()
        this.showTaskDetails(data)
        this.taskForm.markAsPristine()
        this.snack$.open('Task Updated!', 'OK', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: ['snack-success'],
        });
      } else {
        let msg = payload.data.task_status == 1 ? "Task is marked as completed": "Task is marked as incomplete"
        this.snack$.open(`${msg}`, 'OK', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: ['snack-success'],
        });
        const newArray = this.tasks.filter((item) => item.id !== payload.id);
        this.tasks = newArray;
      }
      this.refreshTable()
      this.store$.dispatch(new logActions.GetList(initialLogState.filter));
  })
  }
  
}