import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/email-templates/email-templates.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/email-templates/email-templates.selectors';
import { debounceTime, Observable, Subject, takeUntil, tap } from "rxjs";
import * as commonModels from 'app/shared/models/common.model';
import * as deepEqual from 'deep-equal';
import { Store } from '@ngrx/store';
import { EmailTemplate } from 'app/shared/models/email-templates.model';
import { EmailTemplateModalComponent } from '../email-template-modal/email-template-modal.component';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { FROMEMAILTEMPLATE} from 'app/shared/enums/enums';
import { emailTemplateState } from 'app/store/email-templates/email-templates.states';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { initialState } from "app/store/email-templates/email-templates.states";
import * as logActions from 'app/store/email-template-log/email-template-log.actions';
import { Filter as LogFilter, Log, ScraperFilter } from 'app/shared/models/log.model';
import { initialState as initialLogState } from 'app/store/email-template-log/email-template-log.state';
import { filterSelector as logFilterSelector} from 'app/store/email-template-log/email-template-log.selectors';
@Component({
  selector: 'app-email-template-table',
  templateUrl: './email-template-table.component.html',
  styleUrls: ['./email-template-table.component.css'],
  animations: [fadeInUp400ms, stagger40ms]
})
export class EmailTemplateTableComponent implements  OnInit, OnDestroy {
  @Input() columnHeaders: Array<{}>;
  private onDestroy$ = new Subject<void>();
  public emailTemplates$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;
  public filter: commonModels.Filter = initialState.filter;
  public sortKey:string;
  public sortDirection:string;
  public emailTemplates: Array<EmailTemplate> = [];
  public meta: commonModels.Meta;
  public offset: number;
  selectedRecordDetail: any;

  public logFilter$: Observable<any>;
  public logFilter: LogFilter = initialLogState.filter;

  constructor(
    private _cdr: ChangeDetectorRef,
    private confirmService$: AppConfirmService,
    private dialog: MatDialog,
    private store$: Store<AppState>,
    private service$: WorkflowService,
  ) { 

    this.emailTemplates$ = this.store$.select(dataSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.offset = 1;

    this.sortKey = localStorage.getItem("email_template_module_order_by");
    this.sortDirection = localStorage.getItem("email_template_module_order_dir");
    this.logFilter$ = this.store$.select(logFilterSelector);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.emailTemplates$
    .pipe(
      debounceTime(10),
      takeUntil(this.onDestroy$),
      tap(emailTemplates => {
        if (!deepEqual(this.emailTemplates, emailTemplates)) {
          this.emailTemplates = emailTemplates;
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

  toggleIEmailTemplateActive(e, item: EmailTemplate) {
    const is_active = item.is_active;
    if (is_active == 0) {
    e.source.checked = true;
      this.confirmService$
        .confirm({
          message: `Are you sure you want to deactivate this Email Template '${item.title
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

  toggleWorkflow(item: EmailTemplate) {
    const is_active = item.is_active == 1 ? 0: 1;
    const payload = {
      id: item.id,
      data: {
        is_active: is_active,
      },
    };
    
    this.store$.dispatch(new actions.Toggle(payload));
  }


  deleteTemplate(item: EmailTemplate){
    this.confirmService$
        .confirm({
          message: `Are you sure you want to delete this Email Template '${item.title
            }'?`,
        })
        .subscribe(res => {
          if (res) {
            const payload = {
              id: item.id,
            };
            this.store$.dispatch(new logActions.GetList(this.logFilter));
            this.store$.dispatch(new actions.Delete(payload));
          }
        });
  }

  editTemplates($item){
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      EmailTemplateModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: { title: 'Edit Email Template', isEdit:true, data:$item },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
      this.store$.dispatch(new logActions.GetList(this.logFilter));
    });
  }

  getSelectedRecord(item: any) {
    this.selectedRecordDetail = item;
  }

  getDisplayedColumns(): string[] {
    return this.columnHeaders.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }

  toggleIsEmailTemplateActive(e, item: EmailTemplate){
    const is_active = item.is_active;
    if (is_active == 0) {
      e.source.checked = true;
      this.confirmService$
        .confirm({
          message: `Are you sure you want to deactivate this Email Template '${item.title
            }'?`,
        })
        .subscribe(res => {
          if (res) {
            this.toggleEmailTemplate(item);
          }
      });
    }else{
      e.source.checked = false;
      this.toggleEmailTemplate(item);
    }
  }

  toggleEmailTemplate(item: EmailTemplate){
    const is_active = item.is_active == 1 ? 0: 1;
    const payload = {
        is_active: is_active,
    };
    this.service$.updateEmailTemplate(payload, item.id).subscribe((res: any) => {
      if (res) {
        this.store$.dispatch(new logActions.GetList(this.logFilter));
        this.store$.dispatch(new actions.GetList(this.filter)); 
      }
    });
  }

  emailTemplatesSendFrom(item:number){
    return FROMEMAILTEMPLATE[item];
  }

  textTruncate(text:string){
    if(text) {
      if(text.length > 60) {
        return text.substring(0, 60) + "...";
      } else {
        return text;
      }
    }
    return "";
  }

  showBody(item:string){
    return item.replace(/<[^>]*>/g, ' ');
  }
}
