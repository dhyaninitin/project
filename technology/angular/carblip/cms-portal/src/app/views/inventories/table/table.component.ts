import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import * as commonModels from 'app/shared/models/common.model';
import { Inventory } from 'app/shared/models/inventory.model';
import { AppState } from 'app/store/';
import * as actions from 'app/store/inventories/inventories.actions';
import {
  dataSelector,
  didFetchSelector,
  filterSelector,
  metaSelector,
} from 'app/store/inventories/inventories.selectors';
import { initialState } from 'app/store/inventories/inventories.states';
import { NgxRolesService } from 'ngx-permissions';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { FilterService } from 'app/shared/services/filter.service';

@Component({
  selector: 'app-inventories-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.style.scss'],
  animations: [fadeInUp400ms, stagger40ms],
})
export class InventoriesTableComponent implements OnInit, OnDestroy {
  @Input() columnHeaders: Array<any>;
  private onDestroy$ = new Subject<void>();

  public inventories$: Observable<any>;
  public meta$: Observable<any>;
  public filter$: Observable<any>;
  public didFetch$: Observable<any>;

  public inventories: Array<Inventory> = [];
  public meta: commonModels.Meta;
  public offset: number;

  public sortKey:string;
  public sortDirection:string;
  selectedRecordDetail: any;

  constructor(
    private store$: Store<AppState>,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private rolesService$: NgxRolesService,
    private filterService:FilterService
  ) {    
    this.inventories$ = this.store$.select(dataSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.filter$ = this.store$.select(filterSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.offset = 0;
    const filter = this.filterService.getSortingDirection('inventories_common_filter')
    this.sortKey = filter?.order_by;
    this.sortDirection = filter?.order_dir;
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.inventories$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(inventories => {
          if (!deepEqual(this.inventories, inventories)) {
            this.inventories = inventories;
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

    const updated_filter = {
      order_by: event.active ? event.active : initialState.filter.order_by,
      order_dir: event.direction
        ? event.direction
        : initialState.filter.order_dir,
    };
    this.filterService.setCommonFilter('inventories_common_filter', updated_filter)
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

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  showEditButton(item: Request) {
    const roles = this.rolesService$.getRoles();
    if (roles['admin'] || roles['superadmin']) {
      return true;
    } else {
      return false;
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

  getSelectedRecord(item: any) {
    this.selectedRecordDetail = item;
  }

  getDisplayedColumns(): string[] {
    return this.columnHeaders.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }
}
