import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { fromEvent, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
  tap,
} from 'rxjs/operators';
import * as _ from 'underscore';

import { egretAnimations } from 'app/shared/animations/egret-animations';

import { TablePagination } from 'app/shared/models/common.model';
import * as commonModels from 'app/shared/models/common.model';
import { Location } from 'app/shared/models/location.model';
import { AppState } from 'app/store/';
import * as actions from 'app/store/locations/locations.actions';
import {
  didFetchSelector,
  fetchingSelector,
  filterSelector,
  metaSelector,
} from 'app/store/locations/locations.selectors';
import { initialState } from 'app/store/locations/locations.states';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { LocationsEditModalComponent } from './table/edit-modal/edit-modal.component';
import { GlobalService } from 'app/shared/services/apis/global.service';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
  animations: egretAnimations,
})
export class LocationsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchInput') searchInput: ElementRef;
  columnHeaders: Array<{}> = [
    { key: 'name', label: 'Name', visible: true},
    { key: 'street_address', label: 'Street Address', visible: true},
    { key: 'city', label: 'City', visible: true},
    { key: 'zip_code', label: 'Zip Code', visible: true},
    { key: 'actions', label: 'Actions', visible: true},
  ];
  isColumnAvailable: boolean = false;
  private readonly sectionName: string = 'filter_locations_page';


  private onDestroy$ = new Subject<void>();

  public filter$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;
  public fetching$: Observable<any>;

  public filter: commonModels.Filter = initialState.filter;
  public meta: commonModels.Meta = initialState.meta;
  public search = '';

  public tablePagination: TablePagination = {
    length: initialState.meta.total,
    pageIndex: initialState.filter.page,
    pageSize: initialState.filter.per_page,
    previousPageIndex: 0,
  };
  timeout: any;

  constructor(
    private store$: Store<AppState>, 
    private dialog: MatDialog,
    private _cdr: ChangeDetectorRef,
    private globalService$: GlobalService
    ) {
      // To fetch column filters values
      this.getFilteredColumns();

      this.filter$ = this.store$.select(filterSelector);
      this.meta$ = this.store$.select(metaSelector);
      this.didFetch$ = this.store$.select(didFetchSelector);
      this.fetching$ = this.store$.select(fetchingSelector);
  }
  
  ngAfterViewInit(): void {
    this.initData();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.store$.dispatch(new actions.ClearDetail());
  }
  
  initData() {
    fromEvent(this.searchInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => {
          return event.target.value;
        }),
        filter(res => res.length > 2 || !res.length),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.onFilterChange();
      });

    this.filter$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => {
          if (!deepEqual(this.filter, data)) {
            this.filter = data;
            this.initFilter();
          }
        })
      )
      .subscribe();

    this.meta$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(meta => {
          if (!deepEqual(this.meta, meta)) {
            this.meta = meta;
            this.initMeta();
          }
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
    this.store$.dispatch(new actions.GetList(this.filter));
  }

  initMeta() {
    this.tablePagination.length = this.meta.total;
    this.tablePagination.pageIndex = this.meta.current_page - 1;
    this.tablePagination.pageSize = this.meta.per_page;
  }

  initFilter() {
    this.search = this.filter.search;
  }

  onFilterChange() {
    let data = {
      search: this.search,
    };
    if (this.search) {
      data = _.extend(data, {
        page: 1,
      });
    }
    this.updateFilter(data);
  }

  updateFilter(data) {
    const updated_filter = {
      ...this.filter,
      ...data,
    };
    this.store$.dispatch(new actions.UpdateFilter(updated_filter));
  }

  onPaginateChange(event) {
    const data = {
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    };
    this.updateFilter(data);
  }

  onAddItem() {
    const title = 'Add Location';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      LocationsEditModalComponent,
      {
        width: '720px',
        disableClose: false,
        data: { title: title, payload: {}, type: 'add' },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      }

      this.store$.dispatch(new actions.CreateSuccess(res));
    });
  }

  onClearSearch($event: any) {
    if($event == "") {
      this.onFilterChange();
    }
  }

  toggleColumnVisibility(column, event) {
    column.visible = !column.visible;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.addOrUpdateColumnFilter();
    }, 1000);
  }

  getFilteredColumns() {
    this.globalService$.getByIdAndName(this.sectionName).subscribe(res=> {
      if(res.data.length > 0) {
        this.isColumnAvailable = true;
        this.columnHeaders = res.data[0].table_column;
        this._cdr.detectChanges();
      } else {
        this.isColumnAvailable = true;
        this._cdr.detectChanges();
      }
    })
  }

  addOrUpdateColumnFilter() {
    const payload = {
      filter_section_name: this.sectionName,
      column: this.columnHeaders
    };
    this.globalService$.createAndUpdate(payload).pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe();
  }
}
