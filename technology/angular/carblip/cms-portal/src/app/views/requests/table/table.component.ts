import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import { egretAnimations } from 'app/shared/animations/egret-animations';
import { getBoolColor, setNameAsNAForDeals } from 'app/shared/helpers/utils';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import * as commonModels from 'app/shared/models/common.model';
import { Request } from 'app/shared/models/request.model';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/requests/requests.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/requests/requests.selectors';
import { initialState } from 'app/store/requests/requests.states';
import { NgxRolesService } from 'ngx-permissions';
import { SelectionModel } from '@angular/cdk/collections';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { GlobalService } from 'app/shared/services/apis/global.service';
import { FilterService } from 'app/shared/services/filter.service';

@Component({
  selector: 'app-requests-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.style.scss'],
  animations: [fadeInUp400ms, stagger40ms],
})
export class RequestsTableComponent implements OnInit, OnDestroy {
  @Output() getSelectedRows = new EventEmitter<number>();
  selection = new SelectionModel<any>(true, []);
  @Input() columnHeaders: Array<any>;
  
  private onDestroy$ = new Subject<void>();

  public requests$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;

  public requests: Array<Request> = [];
  public meta: commonModels.Meta;
  public offset: number;
  public sortKey:string;
  public sortDirection:string;

  public selectedRecordDetail: any;

  public setNameAsNAForDeals = setNameAsNAForDeals;

  constructor(
    private store$: Store<AppState>,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private confirmService$: AppConfirmService,
    private rolesService$: NgxRolesService,
    private filterService:FilterService
    
  ) {
    this.requests$ = this.store$.select(dataSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.offset = 1;
    const filter = this.filterService.getSortingDirection('deals_common_filter')
    this.sortKey = filter?.order_by;
    this.sortDirection = filter?.order_dir;
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.requests$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(requests => {
          if (!deepEqual(this.requests, requests)) {
            this.requests = requests;
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

  sortData(event) {

    const updated_filter = {
      order_by: event.active ? event.active : initialState.filter.order_by,
      order_dir: event.direction
        ? event.direction
        : initialState.filter.order_dir,
    };
    this.filterService.setCommonFilter('deals_common_filter',updated_filter)
    this.store$.dispatch(new actions.UpdateFilter(updated_filter));
  }

  getActiveColor(is_active: number) {
    switch (is_active) {
      case 0:
        return 'warn';
      case 1:
      default:
        return 'accent';
    }
  }

  onDelete(item: Request) {
    this.confirmService$
      .confirm({
        message: `Are you sure you want to delete deal?`,
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

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  showEditButton(item: Request) {
    const roles = this.rolesService$.getRoles();
    if (roles['administrative']) {
      return false;
    } else {
      return true;
    }
  }

  showDeleteButton(item: Request) {
    const roles = this.rolesService$.getRoles();
    if (roles['admin'] || roles['superadmin']) {
      return true;
    } else {
      return false;
    }
  }

  checkRequestQuotesHasContractDate(quotes: any) {
    let index = quotes.findIndex(x=> x.contract_date !== null);
    if(index !== -1) {
      return true;
    }
  }

   /** Whether the number of selected elements matches the total number of rows. */
   isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.requests.length;
    this.getSelectedRows.emit(numSelected);
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.requests.forEach(row => this.selection.select(row));
      this.getSelectedRows.emit(0);
  }

  clear($event: any) { 
   const numSelected = this.selection.selected.length;
   this.getSelectedRows.emit(numSelected);
  }

  getSelectedRecord(item: any) {
    this.selectedRecordDetail = item;
  }
  
  getDisplayedColumns(): string[] {
    let header = [...this.columnHeaders];
    header = header.filter((col: any) => {
      if(col.key !== 'full_name') {
        return col;
      }
    })
    return header.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }
}
