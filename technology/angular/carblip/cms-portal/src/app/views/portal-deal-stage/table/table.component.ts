import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { DealStage } from 'app/shared/models/deal.model';
import { AppState } from 'app/store/';
import * as actions from 'app/store/dealstage/dealstage.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/dealstage/dealstage.selectors';
import { initialState } from 'app/store/dealstage/dealstage.states';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import * as commonModels from 'app/shared/models/common.model';
import { Store } from '@ngrx/store';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as deepEqual from 'deep-equal';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { DealStageAddEditModalComponent } from './add-edit-modal/add-edit-modal.component';
import * as logActions from 'app/store/dealstagelogs/dealstagelogs.actions';
import { initialState as initialLogState } from 'app/store/dealstagelogs/dealstagelogs.states';

@Component({
  selector: 'app-dealstage-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  animations: [fadeInUp400ms, stagger40ms],
})
export class TableComponent implements OnInit {
  @Input() columnHeaders: Array<{}>;
  private onDestroy$ = new Subject<void>();

  public dealstages$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;

  public dealstages: Array<DealStage> = [];
  public meta: commonModels.Meta;
  public offset: number;
  selectedRecordDetail: any;
  constructor(
    private store$: Store<AppState>,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private confirmService$: AppConfirmService,
  ) {
    this.dealstages$ = this.store$.select(dataSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.offset = 0;
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.dealstages$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(dealstages => {
          if (!deepEqual(this.dealstages, dealstages)) {
            this.dealstages = dealstages;
            this.refreshTable();
          }
        })
      )
      .subscribe();

    this.meta$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(meta => {
          this.meta = meta;
          this.offset = meta.from;
          this.refreshTable();
        })
      )
      .subscribe();
  }

  sortData(event) {
    const updated_filter = {
      order_by: event.active ? event.active : initialState.filter.order_by,
      order_dir: event.direction
        ? event.direction
        : initialState.filter.order_dir,
    };
    this.store$.dispatch(new actions.UpdateFilter(updated_filter));
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  getDisplayedColumns(): string[] {
    return this.columnHeaders.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }

  getSelectedRecord(item: any) {
    this.selectedRecordDetail = item;
  }

  onDelete(dealStageId: number,) {
    this.confirmService$
      .confirm({
        message: `Are you sure you want to delete this Deal Stage?`,
      })
      .subscribe(res => {
        if (res) {
          const payload = {
            id: dealStageId,
          };
          this.store$.dispatch(new actions.Delete(payload));
          this.store$.dispatch(new logActions.GetList(initialLogState.filter));
        }
      });
  }

  
  onEditItem(item: any) {
    const title = 'Edit Deal Stage';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      DealStageAddEditModalComponent,
      {
        width: '720px',
        disableClose: false,
        data: { title: title, payload: {id: item.id, label: item.label, pipeline: item.pipeline}, type: 'edit' },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      }
      this.store$.dispatch(new logActions.GetList(initialLogState.filter));
    });
  }
}
