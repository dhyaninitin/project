import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
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
import { fromEvent, Observable, Subject } from 'rxjs';
import {
  didFetchSelector,
  fetchingSelector,
  filterSelector,
  metaSelector,
} from 'app/store/vendors/vendors.selectors';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as deepEqual from 'deep-equal';


import * as commonModels from 'app/shared/models/common.model';
import { TablePagination } from 'app/shared/models/common.model';
import { AppState } from 'app/store/';
import { initialState } from 'app/store/vendors/vendors.states';
import { VendorsEditComponent } from './edit/edit.component';
import * as actions from 'app/store/vendors/vendors.actions';
import { GlobalService } from 'app/shared/services/apis/global.service';
@Component({
  selector: 'app-vendors',
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss'],
  animations: egretAnimations,
})
export class VendorsComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput: ElementRef;

  columnHeaders: Array<{}> = [
    { key: 'name', label: 'Name', visible: true},
    { key: 'street_address', label: 'Address', visible: true},
    { key: 'city', label: 'City', visible: true},
    { key: 'state', label: 'State', visible: true},
    { key: 'zip', label: 'Zip', visible: true},
    { key: 'website', label: 'Website', visible: true},
    { key: 'company_phone', label: 'Company Phone Number', visible: true},
    { key: 'actions', label: 'Actions', visible: true},
  ];

  isColumnAvailable: boolean = false;
  private readonly sectionName: string = 'filter_vendors_page';

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
    var per_page_limit = localStorage.getItem('vendor_module_limit');
    var selected_order_dir = localStorage.getItem('vendor_module_order_dir');
    var selected_order_by = localStorage.getItem('vendor_module_order_by');
    var selected_page_no = localStorage.getItem('vendor_module_page_count');
    var search_keyword = localStorage.getItem('vendor_module_search_keyword');

    //Clone Filter Varibale
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
              localStorage.setItem("vendor_module_search_keyword", data.search);
            }else{
              localStorage.removeItem("vendor_module_search_keyword");
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

    //set value in local storage
    localStorage.setItem('vendor_module_limit', event.pageSize);
    localStorage.setItem('vendor_module_page_count', data.page);

    this.updateFilter(data);
  }

  onAddItem() {
    const title = 'Add Vendor';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      VendorsEditComponent,
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
