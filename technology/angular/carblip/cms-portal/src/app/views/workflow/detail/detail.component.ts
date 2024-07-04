import { Location } from "@angular/common";
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { fadeInRight400ms } from "@vex/animations/fade-in-right.animation";
import { fadeInUp400ms } from "@vex/animations/fade-in-up.animation";
import { initialState as initialLogState } from 'app/store/workflowslogs/workflowslogs.states';
import { debounceTime, distinctUntilChanged, filter, fromEvent, map, Observable, skip, Subject, takeUntil, tap } from "rxjs";
import { Log, Filter as LogFilter, } from 'app/shared/models/log.model';
import * as commonModels from 'app/shared/models/common.model';
import { TablePagination } from 'app/shared/models/common.model';
import { AppState } from "app/store";
import { Store } from '@ngrx/store';
import {
    dataSelector as logDataSelector,
    didFetchSelector as logDidFetchSelector,
    fetchingSelector as logFetchingSelector,
    filterSelector as logFilterSelector,
    metaSelector as logMetaSelector,
} from 'app/store/workflowslogs/workflowslogs.selectors';
import * as deepEqual from 'deep-equal';
import * as logActions from 'app/store/workflowslogs/workflowslogs.actions';
import * as actions from 'app/store/workflows/workflows.actions';
import { ActivatedRoute, Router } from "@angular/router";
import { formatLogMessage } from "app/shared/helpers/utils";
import { AppConfirmService } from "app/shared/services/app-confirm/app-confirm.service";

import * as enrollmentHistoryActions from 'app/store/enrollment-history/enrollment-history.actions';
import {
    didFetchSelector as enrollmentHistoryDidFetchSelector,
    fetchingSelector as enrollmentHistoryFetchingSelector,
    filterSelector as enrollmentHistoryFilterSelector,
    metaSelector as enrollmentHistoryMetaSelector,
} from 'app/store/enrollment-history/enrollment-history.selectors';
import { initialState } from "app/store/enrollment-history/enrollment-history.states";
import * as _ from 'underscore';
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { WorkflowService } from "app/shared/services/apis/workflow.service";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { WorkflowStatusConfirmationModalComponent } from "../workflow-status-confirmation-modal/workflow-status-confirmation-modal.component";
import { Workflow } from "app/shared/models/workflow.model";
import { CreateComponent } from "../create/create.component";
@Component({
    selector: 'app-workflows-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    animations: [fadeInUp400ms, fadeInRight400ms]
})
export class WorkflowDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    private onDestroy$ = new Subject<void>();
    @ViewChild('appCreateComponent') appCreateComponent: CreateComponent;

    public logs$: Observable<any>;
    public logFilter$: Observable<any>;
    public logMeta$: Observable<any>;
    public logDidFetch$: Observable<any>;
    public logFetching$: Observable<any>;

    public logFilter: LogFilter = initialLogState.filter;
    public logMeta: commonModels.Meta = initialLogState.meta;

    public logs: Array<Log>;
    public search = '';
    workflowId: number;

    public logPagination: TablePagination = {
        length: initialLogState.meta.total,
        pageIndex: initialLogState.filter.page,
        pageSize: initialLogState.filter.per_page,
        previousPageIndex: 0,
    };

    isEdit: boolean = false;
    public formatLogMessage = formatLogMessage;

    // enrollment history

    public enrollmentHistoryFilter$: Observable<any>;
    public enrollmentHistoryMeta$: Observable<any>;
    public enrollmentHistoryDidFetch$: Observable<any>;
    public enrollmentHistoryFetching$: Observable<any>;


    public enrollmentHistoryFilter: commonModels.Filter = initialState.filter;
    public enrollmentHistoryMeta: commonModels.Meta = initialState.meta;
    public enrollmentHistorySearch = '';

    public enrollmentHistoryPagination: TablePagination = {
        length: initialState.meta.total,
        pageIndex: initialState.filter.page,
        pageSize: initialState.filter.per_page,
        previousPageIndex: 0,
    };

    @ViewChild('searchInput') searchInput: ElementRef;
    public enrolledFilterCtrl: FormControl = new FormControl();

    enrollmentType = [
        { label: 'Enrolled Contact', value: 0 },
        { label: 'Enrolled Deal', value: 1 }
    ]

    public filterForm: FormGroup;
    enrolledOffset: number = 1;
    totalEnrolledPages: number = 0;
    loadingEnrolled: boolean = false;
    totalEnrolled = [];
    enrollmentList = [];
    filteredEnrolledList: any[];
    newfilter = {};
    workflow_data: Workflow;

    columnHeaders: Array<{}> = [
        { key: 'contact', label: 'Contact' },
        { key: 'event', label: 'Event' },
        { key: 'action_title', label: 'Title' },
        { key: 'status', label: 'Status' },
        { key: 'time', label: 'Time' },
    ];

    constructor(
        public location: Location,
        private store$: Store<AppState>,
        private changeDetectorRefs: ChangeDetectorRef,
        private route: ActivatedRoute,
        private confirmService$: AppConfirmService,
        private router: Router,
        private fb: FormBuilder,
        private workflowService: WorkflowService,
        private dialog: MatDialog,
    ) {
        this.logs$ = this.store$.select(logDataSelector);
        this.logFilter$ = this.store$.select(logFilterSelector);
        this.logMeta$ = this.store$.select(logMetaSelector);
        this.logDidFetch$ = this.store$.select(logDidFetchSelector);
        this.logFetching$ = this.store$.select(logFetchingSelector);


        this.enrollmentHistoryFilter$ = this.store$.select(enrollmentHistoryFilterSelector);
        this.enrollmentHistoryMeta$ = this.store$.select(enrollmentHistoryMetaSelector);
        this.enrollmentHistoryDidFetch$ = this.store$.select(enrollmentHistoryDidFetchSelector);
        this.enrollmentHistoryFetching$ = this.store$.select(enrollmentHistoryFetchingSelector);

        this.filterForm = this.fb.group({
            enrolledType: [this.enrollmentType[0].value],
            search: '-1',
        });
    }

    ngOnInit() {
        this.route.params.subscribe(res => {
            if (res.id) {
                this.workflowId = res.id
                this.isEdit = true;
                this.store$.dispatch(new logActions.ClearDetail());
                this.store$.dispatch(new enrollmentHistoryActions.ClearDetail());
            } else {
                this.isEdit = false;
            }
        })
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        this.store$.dispatch(new enrollmentHistoryActions.ClearDetail());

        localStorage.removeItem('enrollment_history_limit');
        localStorage.removeItem('enrollment_history_page_count');
    }

    ngAfterViewInit(): void {
        if (this.isEdit) {
            this.initData();
        }
    }

    initData() {
        this.logFilter$
            .pipe(
                debounceTime(10),
                takeUntil(this.onDestroy$),
                tap(data => {
                    if (!deepEqual(this.logFilter, data)) {
                        this.logFilter = data;
                        this.search = this.logFilter.search;
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


    initLogMeta() {
        this.logPagination.length = this.logMeta.total;
        this.logPagination.pageIndex = this.logMeta.current_page - 1;
        this.logPagination.pageSize = this.logMeta.per_page;
    }

    loadLogs() {

        const workflowLogsPayload = {
            id: this.workflowId,
            filter: this.logFilter
        }
        this.store$.dispatch(new logActions.GetListById(workflowLogsPayload));
    }

    refreshTable() {
        this.changeDetectorRefs.detectChanges();
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

    deleteWorkflow() {
        this.confirmService$
            .confirm({
                message: `Are you sure you want to delete this workflow?`,
            })
            .subscribe(res => {
                if (res) {
                    const payload = {
                        id: this.workflowId,
                    };

                    this.store$.dispatch(new actions.Delete(payload));
                    this.router.navigateByUrl('/workflows');
                }
            });
    }

    ontabChange($event: any) {
        if(this.isEdit) {
            const data = {
                page: 1,
                per_page: 10,
            };
            if ($event.index === 0) {
                this.updateLogFilter(data);
            }
            else if ($event.index === 1) {
                this.initEnrollmentData();
                this.filterEnrollmentHistory();
                this.updateEnrollmentFilter(data)
            }
        }
    }



    // @desc Enrollment history

    initEnrollmentData() {

        this.enrollmentHistoryMeta$
            .pipe(
                takeUntil(this.onDestroy$),
                tap(enrollmentHistoryMeta => {
                    if (!deepEqual(this.enrollmentHistoryMeta, enrollmentHistoryMeta)) {
                        this.enrollmentHistoryMeta = enrollmentHistoryMeta;
                        this.initEnrollmentMeta();
                    }
                })
            )
            .subscribe();

        this.enrollmentHistoryDidFetch$
            .pipe(
                debounceTime(10),
                takeUntil(this.onDestroy$),
                tap(enrollmentHistoryDidFetch$ => !enrollmentHistoryDidFetch$ && this.loadEnrollmentData())
            )
            .subscribe();

        this.enrolledFilterCtrl.valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                skip(1),
                takeUntil(this.onDestroy$)
            )
            .subscribe(() => {
                this.enrolledOffset = 1;
                this.totalEnrolled = [];
                // if( this.enrolledFilterCtrl.value == '' || this.enrolledFilterCtrl.value.length >= 3){
                    this.filterEnrollmentHistory();
                // }
            });
    }

    updateEnrollmentFilter(data) {
        const updated_filter = {
            ...this.enrollmentHistoryFilter,
            ...data,
        };
        this.store$.dispatch(new enrollmentHistoryActions.UpdateFilter(updated_filter));
    }

    initEnrollmentFilter() {
        this.search = this.enrollmentHistoryFilter.search;
    }

    initEnrollmentMeta() {
        this.enrollmentHistoryPagination.length = this.enrollmentHistoryMeta.total;
        this.enrollmentHistoryPagination.pageIndex = this.enrollmentHistoryMeta.current_page - 1;
        this.enrollmentHistoryPagination.pageSize = this.enrollmentHistoryMeta.per_page;
    }

    loadEnrollmentData() {
        var per_page_limit = localStorage.getItem('enrollment_history_limit');
        var selected_page_no = localStorage.getItem('enrollment_history_page_count');

        this.enrollmentHistoryFilter = { ...this.enrollmentHistoryFilter };
        {
            if (per_page_limit != undefined && per_page_limit != null) {
                this.enrollmentHistoryFilter.per_page = Number(per_page_limit);
            } else {
                this.enrollmentHistoryFilter.per_page = 20;
            }

            if (selected_page_no != undefined && selected_page_no != null) {
                this.enrollmentHistoryFilter.page = Number(selected_page_no);
            } else {
                this.enrollmentHistoryFilter.page = 1;
            }

            if (this.filterForm.value.enrolledType >= 0) {
                this.enrollmentHistoryFilter.type = this.filterForm.value.enrolledType
            }

            this.enrollmentHistoryFilter.group_by = 0

        }

        const enrollmentPayload = {
            id: this.workflowId,
            filter: this.enrollmentHistoryFilter,
            newFilter: this.newfilter
        }
        this.store$.dispatch(new enrollmentHistoryActions.GetList(enrollmentPayload));
    }

    onPaginateChange(event) {
        const data = {
            page: event.pageIndex + 1,
            per_page: event.pageSize,
        };

        localStorage.setItem('enrollment_history_limit', data.per_page.toString());
        localStorage.setItem('enrollment_history_page_count', data.page.toString());
        
        this.updateEnrollmentFilter(data);
    }

    filterEnrollmentHistory(val = null) {
        this.enrollmentList = [];
        const search = this.enrolledFilterCtrl.value || '';
        const ownerParam = {
            page: this.enrolledOffset,
            per_page: 20,
            type: val ? val : this.filterForm.value.enrolledType,
            group_by: 1,
            search
        };

        this.workflowService.getDropdownList(ownerParam, this.workflowId, {}).subscribe(({ data, meta }) => {
            this.totalEnrolled.push(...data);
            this.enrollmentList = this.totalEnrolled;
            this.totalEnrolledPages = meta.last_page;
            this.filteredEnrolledList = this.enrollmentList.slice(0);
            this.loadingEnrolled = false;
            this.refreshTable();
        });
    }

    onFilterChange(val) {
        if (val) {

            this.filterForm.patchValue({
                search: val,
            });
            const enrolled = this.filteredEnrolledList.find(ele => ele.id === val);
            if (enrolled) {
                this.newfilter = {
                    first_name: enrolled.first_name,
                    last_name: enrolled.last_name,
                    email_address: enrolled.email_address,
                };
            }

            if (val === '-1') {
                this.newfilter = {}
            }

            const enrollmentPayload = {
                id: this.workflowId,
                filter: this.enrollmentHistoryFilter,
                newFilter: this.newfilter,
            }
            this.updateEnrollmentFilter(enrollmentPayload);
        }


    }

    getNextBatch() {
        this.loadingEnrolled = true;
        this.enrolledOffset = this.enrolledOffset + 1
        this.filterEnrollmentHistory();

    }

    formatText(item) {
        if (this.filterForm.value.enrolledType === 0) {
            return item.first_name + ' ' + item.last_name + ' ( ' + item.email_address + ' ) ';
        } else {
            return item.deal?.brand?.name + ' ' + item?.deal?.model?.name + ' ' + item?.deal?.trim;
        }
    }

    onEnrolledType(val) {
        this.totalEnrolled = [];
        this.filterForm.patchValue({ search: '-1' });
        this.filterForm.patchValue({ enrolledType: val });
        this.newfilter = {};
        this.filterEnrollmentHistory(val);


        if (val === 0) {
            this.columnHeaders[0] = { key: 'contact', label: 'Contact' };
        } else {
            this.columnHeaders[0] = { key: 'deal', label: 'Deal' };
        }

        const enrollmentPayload = {
            id: this.workflowId,
            filter: this.enrollmentHistoryFilter
        }
        this.updateEnrollmentFilter(enrollmentPayload);
        this.changeDetectorRefs.detectChanges();
    }

    workflowData(data: any) {
        this.workflow_data = data;
    }

    changeWorkflowStatus($event: any, item: Workflow) {
        const is_active = item?.is_active;
        if (is_active == 1) {
            $event.source.checked = false;
            const dialogRef: MatDialogRef<any> = this.dialog.open(
                WorkflowStatusConfirmationModalComponent,
                {
                    width: '500px',
                    disableClose: true,
                    data: { title: 'Confirm', value: item, workflowId: item.id },
                }
            );
            dialogRef.afterClosed().subscribe(res => {
                if (!res) {
                    // If user press cancel
                    return;
                } else {
                    $event.source.checked = false;
                    let itemInfo = { ...item };
                    itemInfo.activation = Number(res.activation_for);
                    this.changeStatus(itemInfo);
                }
            });
        } else {
            $event.source.checked = true;
            this.confirmService$
                .confirm({
                    message: `Are you sure you want to deactivate this workflow '${item.title
                        }'?`,
                })
                .subscribe(res => {
                    if (res) {
                        this.changeStatus(item);
                    }
                });
        }

    }

    changeStatus(item: Workflow) {
        const is_active = item.is_active == 1 ? 0 : 1;
        const payload = {
            data: {
                id: item.id,
                is_active: is_active,
                activation_for: item.activation == null ? 0 : item.activation
            },
        };
        this.store$.dispatch(new actions.Toggle(payload));
        this.appCreateComponent.ngOnInit();
        this.changeDetectorRefs.detectChanges();
    }
}