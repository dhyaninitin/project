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
import { fromEvent, Observable, of, Subject } from 'rxjs';
import {
  catchError,
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
import { AppState } from 'app/store/';
import * as actions from 'app/store/cars-direct/cars-direct.actions';
import {
  didFetchSelector,
  fetchingSelector,
  filterSelector,
  metaSelector,
} from 'app/store/cars-direct/cars-direct.selectors';
import { initialState } from 'app/store/cars-direct/cars-direct.states';
import { GlobalService } from 'app/shared/services/apis/global.service';

@Component({
  selector: 'app-cars-direct',
  templateUrl: './cars-direct.component.html',
  styleUrls: ['./cars-direct.component.scss'],
  animations: egretAnimations,
})
export class CarsDirectComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchInput') searchInput: ElementRef;
  columnHeaders: Array<{}> = [
    { key: 'first_name', label: 'First Name', visible: true},
    { key: 'last_name', label: 'Last Name', visible: true},
    { key: 'year', label: 'Year', visible: true},
    { key: 'brand', label: 'Brand', visible: true},
    { key: 'model', label: 'Model', visible: true},
    { key: 'trim', label: 'Trim', visible: true},
    { key: 'contact_owner_email', label: 'Contact Owner', visible: true},
    { key: 'source', label: 'Source', visible: true},
    { key: 'created_at', label: 'Created At', visible: true},
    { key: 'actions', label: 'Actions', visible: true},
  ];
  isColumnAvailable: boolean = false;
  private readonly sectionName: string = 'filter_cars_direct_page';

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

  initFilter() {
    this.search = this.filter.search;
  }
  initMeta() {
    this.tablePagination.length = this.meta.total;
    this.tablePagination.pageIndex = this.meta.current_page - 1;
    this.tablePagination.pageSize = this.meta.per_page;
  }
  ngOnInit() {
    var per_page_limit = localStorage.getItem('cb2_module_limit');
    var selected_order_dir = localStorage.getItem('cb2_module_order_dir');
    var selected_order_by = localStorage.getItem('cb2_module_order_by');
    var selected_page_no = localStorage.getItem('cb2_module_page_count');
    var search_keyword = localStorage.getItem('cb2_module_search_keyword');

    // Clone Filter Variable Object 
    this.filter = {...this.filter};
    //check base on previous select item
    {
      if(per_page_limit != undefined && per_page_limit != null){
        this.filter.per_page = Number(per_page_limit);
      }else{
        this.filter.per_page = 20;
      }
    
      if(selected_order_by != undefined && selected_order_by != null && selected_order_by != "" && selected_order_dir != undefined && selected_order_dir != null && selected_order_dir != ""){
        this.filter.order_dir = selected_order_dir;
        this.filter.order_by = selected_order_by;
      }else{
        this.filter.order_dir = "desc";
        this.filter.order_by = "created_at";
      }

      if(selected_page_no != undefined && selected_page_no != null){
        this.filter.page = Number(selected_page_no);
      }else{
        this.filter.page = 1;
      }

      if(search_keyword != undefined && search_keyword != null){
        this.filter.search = search_keyword;
        this.search = search_keyword;
      }else{
        this.filter.search = "";
        this.search="";
      }

    }

    this.store$.dispatch(new actions.ClearDetail());

    this.updateFilter(this.filter);
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
            if(data.search != ""){
              localStorage.setItem("cb2_module_search_keyword", data.search);
            }else{
              localStorage.removeItem("cb2_module_search_keyword");
            }
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
  }

  updateFilter(data) {
    const updated_filter = {
      ...this.filter,
      ...data,
    };
    this.store$.dispatch(new actions.UpdateFilter(updated_filter));
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

  onPaginateChange(event) {
    const data = {
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    };
    
    //set value in local storage
    localStorage.setItem('cb2_module_limit', event.pageSize);
    localStorage.setItem('cb2_module_page_count', data.page);

    this.updateFilter(data);
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
