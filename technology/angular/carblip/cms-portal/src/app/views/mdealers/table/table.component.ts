import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import * as commonModels from 'app/shared/models/common.model';
import { MDealer } from 'app/shared/models/mdealer.model';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/mdealers/mdealers.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/mdealers/mdealers.selectors';
import { initialState } from 'app/store/mdealers/mdealers.states';
import { NgxRolesService } from 'ngx-permissions';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';

@Component({
  selector: 'app-mdealers-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.style.scss'],
  animations: [fadeInUp400ms, stagger40ms],
})
export class MDealersTableComponent implements OnInit, OnDestroy {
  @Input() columnHeaders: Array<any>;

  private onDestroy$ = new Subject<void>();

  public dealers$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;

  public dealers: Array<MDealer> = [];
  public meta: commonModels.Meta;
  public offset: number;
  public sortKey:string;
  public sortDirection:string;
  selectedRecordDetail: any;
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
    this.sortKey = localStorage.getItem("m_portal_dealers_module_order_by");
    this.sortDirection=localStorage.getItem("m_portal_dealers_module_order_dir");
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
    //set arrow direction in localstorage
    localStorage.setItem("m_portal_dealers_module_order_by", event.active);
    localStorage.setItem("m_portal_dealers_module_order_dir", event.direction);

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

  getSelectedRecord(item: any) {
    this.selectedRecordDetail = item;
  }

  getDisplayedColumns(): string[] {
    return this.columnHeaders.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }
}
