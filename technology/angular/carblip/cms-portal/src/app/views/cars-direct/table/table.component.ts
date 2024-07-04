import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import * as commonModels from 'app/shared/models/common.model';
import { CarsDirect } from 'app/shared/models/cars-direct.model';
import { AppState } from 'app/store/';
import * as actions from 'app/store/cars-direct/cars-direct.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/cars-direct/cars-direct.selectors';
import { initialState } from 'app/store/cars-direct/cars-direct.states';
import { NgxRolesService } from 'ngx-permissions';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';

@Component({
  selector: 'app-cars-direct-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.style.scss'],
  animations: [fadeInUp400ms, stagger40ms],
})
export class CarsDirectTableComponent implements OnInit, OnDestroy {
  @Input() columnHeaders: Array<{}>;

  private onDestroy$ = new Subject<void>();

  public requests$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;

  public requests: Array<CarsDirect> = [];
  public meta: commonModels.Meta;
  public offset: number;

  public sortKey:string;
  public sortDirection:string;
  selectedRecordDetail: any;

  constructor(
    private store$: Store<AppState>,
    private changeDetectorRefs: ChangeDetectorRef
  ) {
    this.requests$ = this.store$.select(dataSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.offset = 1;
    this.sortKey = localStorage.getItem("cb2_module_order_by");
    this.sortDirection=localStorage.getItem("cb2_module_order_dir");
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
    localStorage.setItem("cb2_module_order_by", event.active);
    localStorage.setItem("cb2_module_order_dir", event.direction);
 
    const updated_filter = {
      order_by: event.active ? event.active : initialState.filter.order_by,
      order_dir: event.direction
        ? event.direction
        : initialState.filter.order_dir,
    };
    this.store$.dispatch(new actions.UpdateFilter(updated_filter));
  }


  // onDelete(item: CarsDirect) {
  //   this.confirmService$
  //     .confirm({
  //       message: `Are you sure you want to delete deal?`,
  //     })
  //     .subscribe(res => {
  //       if (res) {
  //         const payload = {
  //           id: item.id,
  //         };
  //         this.store$.dispatch(new actions.Delete(payload));
  //       }
  //     });
  // }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  // showEditButton(item: CarsDirect) {
  //   const roles = this.rolesService$.getRoles();
  //   if (roles['administrative']) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // }

  // showDeleteButton(item: CarsDirect) {
  //   const roles = this.rolesService$.getRoles();
  //   if (roles['admin'] || roles['superadmin']) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  getSelectedRecord(item: any) {
    this.selectedRecordDetail = item;
  }

  getDisplayedColumns(): string[] {
    return this.columnHeaders.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }
}
