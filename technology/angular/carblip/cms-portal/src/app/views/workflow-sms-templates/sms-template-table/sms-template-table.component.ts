import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { SmstemplateModalComponent } from '../sms-template-modal/sms-template-modal.component';
import { AppState } from 'app/store/';
import * as actions from 'app/store/sms-templates/sms-templates.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/sms-templates/sms-templates.selectors';
import { debounceTime, Observable, Subject, takeUntil, tap } from "rxjs";
import * as commonModels from 'app/shared/models/common.model';
import * as deepEqual from 'deep-equal';
import { SmsTemplate } from "app/shared/models/sms-templates.model";
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-sms-template-table',
  templateUrl: './sms-template-table.component.html',
  styleUrls: ['./sms-template-table.component.scss'],
  animations: [fadeInUp400ms, stagger40ms]
})
export class SmstemplateTableComponent implements OnInit, OnDestroy {
  @Input() columnHeaders: Array<{}>;
  private onDestroy$ = new Subject<void>();
  public smsTemplates$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;
  
  public sortKey:string;
  public sortDirection:string;
  public smsTemplates: Array<SmsTemplate> = [];
  public meta: commonModels.Meta;
  public offset: number;
  selectedRecordDetail: any;

  constructor(
    private _cdr: ChangeDetectorRef,
    private confirmService$: AppConfirmService,
    private dialog: MatDialog,
    private store$: Store<AppState>,
  ) { 

    this.smsTemplates$ = this.store$.select(dataSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.offset = 1;

    this.sortKey = localStorage.getItem("sms_template_module_order_by");
    this.sortDirection = localStorage.getItem("sms_template_module_order_dir");
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.smsTemplates$
    .pipe(
      debounceTime(10),
      takeUntil(this.onDestroy$),
      tap(smsTemplates => {
        if (!deepEqual(this.smsTemplates, smsTemplates)) {
          this.smsTemplates = smsTemplates;
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

  toggleIsSmsTemplateActive(e, item: SmsTemplate) {
    const is_active = item.is_active;
    if (is_active == 0) {
    e.source.checked = true;
      this.confirmService$
        .confirm({
          message: `Are you sure you want to deactivate this Sms Template '${item.title
            }'?`,
        })
        .subscribe(res => {
          if (res) {
            this.toggleWorkflow(item);
          }
        });
    } else {
      e.source.checked = false;
      this.toggleWorkflow(item);
    }
  }

  toggleWorkflow(item: SmsTemplate) {
    const is_active = item.is_active == 1 ? 0: 1;
    const payload = {
      id: item.id,
      data: {
        is_active: is_active,
      },
    };
    
    this.store$.dispatch(new actions.Toggle(payload));
  }

  deleteTemplate(item: SmsTemplate){
    this.confirmService$
        .confirm({
          message: `Are you sure you want to delete this Sms Template '${item.title
            }'?`,
        })
        .subscribe(res => {
          if (res) {
            const payload = {
              id: item.id,
            };
            this.store$.dispatch(new actions.Delete(payload));
          }
        });
  }

  editTemplates($item){
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      SmstemplateModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: { title: 'Edit Sms Template', isEdit:true, data:$item },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      }
    });
  }

  getSelectedRecord(item: any) {
    this.selectedRecordDetail = item;
  }

  getDisplayedColumns(): string[] {
    return this.columnHeaders.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }
}
