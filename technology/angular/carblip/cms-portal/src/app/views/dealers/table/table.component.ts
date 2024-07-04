import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import { DealersModalComponent } from 'app/shared/components/dealer-modal/dealer-modal.component';
import * as commonModels from 'app/shared/models/common.model';
import { Dealer } from 'app/shared/models/dealer.model';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/dealers/dealers.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/dealers/dealers.selectors';
import { initialState } from 'app/store/dealers/dealers.states';
import { NgxRolesService } from 'ngx-permissions';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
@Component({
  selector: 'app-dealers-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.style.scss'],
  animations: [fadeInUp400ms, stagger40ms],
})
export class DealersTableComponent implements OnInit, OnDestroy {
  @Input() columnHeaders: Array<any>;
  private onDestroy$ = new Subject<void>();

  public dealers$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;

  public dealers: Array<Dealer> = [];
  public meta: commonModels.Meta;
  public offset: number;
  public sortKey:string;
  public sortDirection:string;
  selectedRecordDetail: any;
  index: number = 0;
  constructor(
    private store$: Store<AppState>,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private confirmService$: AppConfirmService,
    private rolesService$: NgxRolesService
  ) {
    this.dealers$ = this.store$.select(dataSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.offset = 1;
    this.sortKey = localStorage.getItem("suppliers_module_order_by");
    this.sortDirection=localStorage.getItem("suppliers_module_order_dir");
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.dealers$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(dealers => {
          if (!deepEqual(this.dealers, dealers)) {
            this.dealers = dealers;
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

    this.didFetch$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(didFetch => !didFetch && this.loadData())
      )
      .subscribe();
  }

  loadData() {
    this.store$.dispatch(new actions.GetList());
  }

  sortData(event) {
    //set arrow direction in local storage
    localStorage.setItem("suppliers_module_order_by", event.active);
    localStorage.setItem("suppliers_module_order_dir", event.direction);

    const updated_filter = {
      order_by: event.active ? event.active : initialState.filter.order_by,
      order_dir: event.direction
        ? event.direction
        : initialState.filter.order_dir,
    };
    this.store$.dispatch(new actions.UpdateFilter(updated_filter));
  }

  /** Handler when Edit icon in table row is clicked
   ** This function get portal user item as parameter, show modal to edit content,
   ** buid logic after modal is closed.
   * @param PortalUser item
   * @return
   **/

  onEdit(item: Dealer) {
    const title = 'Edit Dealer';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      DealersModalComponent,
      {
        width: '720px',
        disableClose: false,
        data: { title: title, payload: item, type: 'edit' },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      }

      this.store$.dispatch(new actions.UpdateSuccess(res));
    });
  }

  onDelete(item: Dealer, index: number) {
    this.confirmService$
      .confirm({
        message: `Are you sure you want to delete this Item?`,
      })
      .subscribe(res => {
        if (res) {
          if (res) {
            const payload = {
              id: item.id.toString(),
            };
            this.store$.dispatch(new actions.Delete(payload));
          }
        }
      });
  }

  getSelectedRecord(item: any, index: number) {
    this.selectedRecordDetail = item;
    this.index = index;
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  getDisplayedColumns(): string[] {
    return this.columnHeaders.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }
}
