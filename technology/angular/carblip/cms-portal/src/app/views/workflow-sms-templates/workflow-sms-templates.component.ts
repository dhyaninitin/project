import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GlobalService } from 'app/shared/services/apis/global.service';
import { debounceTime, distinctUntilChanged, filter, fromEvent, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { SmstemplateModalComponent } from './sms-template-modal/sms-template-modal.component';
import { AppState } from 'app/store/';
import * as actions from 'app/store/sms-templates/sms-templates.actions';
import {
  didFetchSelector,
  fetchingSelector,
  filterSelector,
  metaSelector,
} from 'app/store/sms-templates/sms-templates.selectors';
import { initialState } from "app/store/sms-templates/sms-templates.states";
import { Store } from "@ngrx/store";
import * as _ from 'underscore';
import * as deepEqual from 'deep-equal';
import * as commonModels from 'app/shared/models/common.model';
import { TablePagination } from 'app/shared/models/common.model';

@Component({
  selector: 'app-workflow-smstemplates',
  templateUrl: './workflow-sms-templates.component.html',
  styleUrls: ['./workflow-sms-templates.component.scss']
})
export class WorkflowSmstemplatesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchInput') searchInput: ElementRef;
  columnHeaders: Array<{}> = [
    { key: 'message', label: 'Name', visible: true},
    { key: 'title', label: 'Title', visible: true},
    { key: 'added_by', label: 'Added By', visible: true},
    { key: 'is_active', label: 'Status', visible: true},
    { key: 'created_at', label: 'Created At', visible: true},
    { key: 'updated_at', label: 'Updated At', visible: true},
    { key: 'actions', label: 'Actions', visible: true}
  ];

  isColumnAvailable: boolean = false;
  private readonly sectionName: string = 'filter_workflows_sms_templates_page';

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
    private globalService$: GlobalService,
    private _cdr: ChangeDetectorRef
  ) { 
    // To fetch column filters values
    this.getFilteredColumns();

    this.filter$ = this.store$.select(filterSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.fetching$ = this.store$.select(fetchingSelector);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngAfterViewInit(): void {
    this.initData();
  }

  ngOnInit() {
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
              localStorage.setItem("sms_template_module_search_keyword", data.search);
            }else{
              localStorage.removeItem("sms_template_module_search_keyword");
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

      this.didFetch$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(didFetch => !didFetch && this.loadData())
      )
      .subscribe();
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

  initFilter() {
    this.search = this.filter.search;
  }

  initMeta() {
    this.tablePagination.length = this.meta.total;
    this.tablePagination.pageIndex = this.meta.current_page - 1;
    this.tablePagination.pageSize = this.meta.per_page;
  }
  
  loadData() {
    var per_page_limit = localStorage.getItem('sms_template_module_limit');
    var selected_order_dir = localStorage.getItem('sms_template_module_order_dir');
    var selected_order_by = localStorage.getItem('sms_template_module_order_by');
    var selected_page_no = localStorage.getItem('sms_template_module_page_count');
    var search_keyword = localStorage.getItem('sms_template_module_search_keyword');
    // Clone filter values
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
    this.store$.dispatch(new actions.GetList(this.filter));
  }

  
  addTemplates(){
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      SmstemplateModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: { title: 'Create Sms Template', isEdit:false },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
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

  onPaginateChange(event) {
    const data = {
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    };

    //set value in local storage
    localStorage.setItem('sms_template_module_limit', event.pageSize);
    localStorage.setItem('sms_template_module_page_count', data.page);

    this.updateFilter(data);
  }
}
