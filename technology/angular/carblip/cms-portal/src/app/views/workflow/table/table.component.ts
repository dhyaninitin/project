import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { fadeInUp400ms } from "@vex/animations/fade-in-up.animation";
import { stagger40ms } from "@vex/animations/stagger.animation";
import { Workflow } from "app/shared/models/workflow.model";
import { AppConfirmService } from "app/shared/services/app-confirm/app-confirm.service";
import { AppState } from 'app/store/';
import * as actions from 'app/store/workflows/workflows.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/workflows/workflows.selectors';
import { debounceTime, Observable, Subject, takeUntil, tap } from "rxjs";
import * as commonModels from 'app/shared/models/common.model';
import * as deepEqual from 'deep-equal';
import { WorkflowStatusConfirmationModalComponent } from "../workflow-status-confirmation-modal/workflow-status-confirmation-modal.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { WorkflowSettingModalComponent } from "../workflow-setting-modal/workflow-setting-modal.component";
import { Router } from "@angular/router";
import { initialState } from "app/store/workflows/workflows.states";
import { FilterService } from "app/shared/services/filter.service";
import { WorkflowEnrollWarningModalComponent } from "app/views/workflow-settings/workflow-enroll-warning-modal/workflow-enroll-warning-modal.component";
import { WorkflowService } from "app/shared/services/apis/workflow.service";

@Component({
  selector: 'app-workflows-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  animations: [fadeInUp400ms, stagger40ms]
})
export class WorkflowsTableComponent implements OnInit {
  @Output('parentFun') refreshWorkflowLogTable: EventEmitter<any> = new EventEmitter();
  @Input() columnHeaders: Array<{}>;
  private onDestroy$ = new Subject<void>();
  public workflows$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;

  public sortKey: string;
  public sortDirection: string;
  selectedRecordDetail: any;
  public workflows: Array<Workflow> = [];
  public meta: commonModels.Meta;
  public offset: number;

  constructor(
    private _cdr: ChangeDetectorRef,
    private confirmService$: AppConfirmService,
    private store$: Store<AppState>,
    private dialog: MatDialog,
    private router: Router,
    private service$: WorkflowService
  ) {
    this.workflows$ = this.store$.select(dataSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.offset = 1;

    this.sortKey = localStorage.getItem("workflow_module_order_by");
    this.sortDirection = localStorage.getItem("workflow_module_order_dir");
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.store$.dispatch(new actions.ClearDetail());
    this.workflows$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(workflows => {
          if (!deepEqual(this.workflows, workflows)) {
            this.workflows = workflows;
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
  }

  refreshTable() {
    this._cdr.detectChanges();
  }

  // toggleIsWorkflowActive(e, item: Workflow) {
  //     const is_active = item.is_active;
  //     if (is_active == 0) {
  //     e.source.checked = true;
  //       this.confirmService$
  //         .confirm({
  //           message: `Are you sure you want to deactivate this workflow '${item.title
  //             }'?`,
  //         })
  //         .subscribe(res => {
  //           if (res) {
  //             this.toggleWorkflow(item);
  //           }
  //         });
  //     } else {

  //     }
  // }

  toggleIsWorkflowActive($event: any, item: Workflow) {
    const is_active = item.is_active;
    if (is_active == 1) {
      $event.source.checked = false;
      const dialogRef: MatDialogRef<any> = this.dialog.open(
        WorkflowStatusConfirmationModalComponent,
        {
          width: '500px',
          disableClose: true,
          data: { title: 'Confirm', value: item , workflowId:item.id},
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
          this.toggleWorkflow(itemInfo);
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
            this.toggleWorkflow(item);
          }
        });
    }

  }

  toggleWorkflow(item: Workflow) {
    const is_active = item.is_active == 1 ? 0 : 1;
    const payload = {
      // id: item.id,
      data: {
        id: item.id,
        is_active: is_active,
        activation_for: item.activation == null ? 0 : item.activation
      },
    };

    this.store$.dispatch(new actions.Toggle(payload));
    this.refreshWorkflowLogTable.emit();

  }

  deleteWorkflow(item: Workflow) {
    this.confirmService$
      .confirm({
        message: `Are you sure you want to delete this workflow '${item.title
          }'?`,
      })
      .subscribe(res => {
        if (res) {
          const payload = {
            id: item.id,
          };

          this.store$.dispatch(new actions.Delete(payload));
          this.refreshWorkflowLogTable.emit();
        }
      });
  }

  getSelectedRecord(item: any) {
    this.selectedRecordDetail = item;
  }

  getDisplayedColumns(): string[] {
    return this.columnHeaders.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }

  settingWorkflow(item: any) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      WorkflowSettingModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: { title: 'Workflow Setting', value: item },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      } else {

        this.store$.dispatch(new actions.UpdateSuccess(res.data));
        this.refreshWorkflowLogTable.emit();
      }
    });
  }

  cloneWorkflow(details) {
    this.service$.setCloneWorkflowId = details.id;
    this.router.navigate(['/workflows/create']);
  }

  sortData(event) {
    let orderBy = event.active;
    if (event.active === 'type') {
      orderBy = 'trigger_type'
    }
    if (event.active === 'name') {
      orderBy = 'wf_name'
    }
    if (event.active === 'status') {
      orderBy = 'is_active'
    }

    const updated_filter = {
      order_by: orderBy ? orderBy : initialState.filter.order_by,
      order_dir: event.direction
        ? event.direction
        : initialState.filter.order_dir,
    };
    localStorage.setItem('workflow_module_order_dir', updated_filter.order_dir);
    localStorage.setItem('workflow_module_order_by', updated_filter.order_by);
    this.store$.dispatch(new actions.UpdateFilter(updated_filter));
  }

}