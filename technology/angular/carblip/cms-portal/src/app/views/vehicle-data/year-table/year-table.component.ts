import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { AppState } from 'app/store';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';
import * as commonModels from 'app/shared/models/common.model';
import { Year } from 'app/shared/models/vehicledata.model';
import * as actions from 'app/store/vehicledata/vehicledata.actions';
import { dataSelector, didFetchSelector, metaSelector,brandMetaSelector,BrandDataSelector, brandDidFetchSelector, fetchingSelector} from 'app/store/vehicledata/vehicledata.selectors';
import { initialState } from 'app/store/vehicledata/vehicledata.states';
import * as deepEqual from 'deep-equal';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { VehicleDataService } from 'app/shared/services/apis/vehicle-data.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TablePagination } from 'app/shared/models/common.model';
import * as vehicleData from 'app/shared/models/vehicledata.model';
import { brandInitialState } from 'app/store/vehicledata/brand.states';
import * as logActions from 'app/store/vehicledatalogs/vehicledatalogs.actions';
import { Filter as LogFilter } from 'app/shared/models/log.model';
import { initialState as initialLogState } from 'app/store/vehicledatalogs/vehicledatalogs.states';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-year-table',
  templateUrl: './year-table.component.html',
  styleUrls: ['./year-table.component.scss'],
  animations: [fadeInUp400ms, stagger40ms, fadeInRight400ms,
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  ])],
})
export class YearTableComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() columnHeaders: Array<any>;
  private onDestroy$ = new Subject<void>();
  brandColumnHeaders: Array<{}> = [
    {key: 'name', label: 'Brand Name', visible: true},
    {key: 'image_url', label: 'Image', visible: true},
    {key: 'created_at', label: 'Created At', visible: true},
    {key: 'updated_at', label: 'Updated At', visible: true},
    {key: 'actions', label: 'Actions', visible: true},
  ];
  
  isBrandColumnAvailable: boolean = true;
  public meta$: Observable<any>;
  public yearList$: Observable<any>;
  public yearDidFetch$: Observable<any>;
  public yearList: Array<Year> = [];
  public logFilter: LogFilter = initialLogState.filter;
  columnsToDisplay = [];
  columnsToDisplayWithExpand = [];
  expandedElement: Year | null;

  public meta: commonModels.Meta = brandInitialState.meta;

  //  Brand
  public tablePagination: TablePagination = {
    length: brandInitialState.meta.total,
    pageIndex: brandInitialState.filter.page,
    pageSize: brandInitialState.filter.per_page,
    previousPageIndex: 0,
  };

  public brandMeta$: Observable<any>;
  public brandDidFetch$: Observable<any>;
  public brandMeta: commonModels.Meta = brandInitialState.meta;
  public brandFilter: vehicleData.Filter = brandInitialState.filter;
  
  selectedYear: number = null;

  constructor(
    private store$: Store<AppState>,
    private changeDetectorRefs: ChangeDetectorRef,
    public service$: VehicleDataService,
    private snack$: MatSnackBar,
  ) { 

    this.yearList$ = this.store$.select(dataSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.yearDidFetch$ = this.store$.select(didFetchSelector);
    // For Brand Data
    this.brandMeta$ = this.store$.select(brandMetaSelector);
    this.brandDidFetch$ = this.store$.select(brandDidFetchSelector);
  }

  ngAfterViewInit(): void {
    this.getDisplayedColumns();
    this.columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.yearList$
    .pipe(
      debounceTime(10),
      takeUntil(this.onDestroy$),
      tap(yearList => {
        if (!deepEqual(this.yearList, yearList)) {
          this.sortYear(yearList);
          this.refreshTable();
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
            this.refreshTable();
          }
        })
      )
      .subscribe();

      // For Brand

      this.brandMeta$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(brandMeta => {
          if (!deepEqual(this.brandMeta, brandMeta)) {
            this.brandMeta = brandMeta;
            this.initMeta();
          }
        })
      )
      .subscribe();

    this.brandDidFetch$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(brandDidFetch => !brandDidFetch && this.loadData())
      )
      .subscribe();
  }

  initMeta() {
    this.tablePagination.length = this.meta.total;
    this.tablePagination.pageIndex = this.meta.current_page - 1;
    this.tablePagination.pageSize = this.meta.per_page;
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  sortYear(years:Year[]) {
    const shortYears = [...years];
    shortYears.sort((a, b) => (a.year < b.year) ? 1 : -1);
     this.yearList = shortYears;
  }

  getDisplayedColumns() {
    let header = [...this.columnHeaders];
    this.columnsToDisplay = header.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }

  
  loadData() {
    var per_page_limit = localStorage.getItem('vehicle_brand_module_limit');
    var selected_order_dir = localStorage.getItem('vehicle_brand_module_order_dir');
    var selected_order_by = localStorage.getItem('vehicle_brand_module_order_by');
    var selected_page_no = localStorage.getItem('vehicle_brand_module_page_count');

    // Clone filter values
    this.brandFilter = {...this.brandFilter};

    //check base on previous select item
    {
      if(per_page_limit != undefined && per_page_limit != null){
        this.brandFilter.per_page = Number(per_page_limit);
      }else{
        this.brandFilter.per_page = 50;
      }
    
      if(selected_order_by != undefined && selected_order_by != null && selected_order_by != "" && selected_order_dir != undefined && selected_order_dir != null && selected_order_dir != ""){
        this.brandFilter.order_dir = selected_order_dir;
        this.brandFilter.order_by = selected_order_by;
      }else{
        this.brandFilter.order_dir = "desc";
        this.brandFilter.order_by = "created_at";
      }

      if(selected_page_no != undefined && selected_page_no != null){
        this.brandFilter.page = Number(selected_page_no);
      }else{
        this.brandFilter.page = 1;
      }
    }
    this.store$.dispatch(new actions.GetBrand());
  }

  onPaginateChange(event) {
    const data = {
      page: event.pageIndex + 1,
      per_page: event.pageSize,
    };

    //set value in local storage
    localStorage.setItem('vehicle_brand_module_limit', event.pageSize);
    localStorage.setItem('vehicle_brand_module_page_count', data.page);

    this.updateFilter(data);
  }

  updateFilter(data) {
    const updated_filter = {
      ...this.brandFilter,
      ...data,
    };
    this.store$.dispatch(new actions.UpdateFilter(updated_filter));
  }

  getSelectedYear(element:Year | null) {
    if(this.expandedElement==null || this.expandedElement != element){
      this.selectedYear = Number(element.year);
    }
    this.expandedElement = this.expandedElement === element ? null : element
  }

  changeYearStatus($event:any,id:number){
    const payload = {
      id: id,
      is_active: $event ? 1 : 0
    };
    this.store$.dispatch(new actions.UpdateYear(payload));
    this.store$.dispatch(new logActions.GetList(this.logFilter));
  }

  enableYearForScraper($event:any,id:number){
    const payload = {
      id: id,
      is_scrapable: $event ? 1 : 0
    };
    this.store$.dispatch(new actions.UpdateYear(payload));
    this.store$.dispatch(new logActions.GetList(this.logFilter));

  }

  changeDefaultYear($event:any,id:number){
    const defaultYearpayload = {
      id: id,
      is_default: $event ? 1 : 0
    };
    this.service$.updateYear(defaultYearpayload.id,defaultYearpayload).subscribe(({data}) => {
      this.yearList = this.yearList.map(item => {
        return {
              ...item, 
              is_default: item.id === data.id ? data.is_default : 0,
            };
      })
      this.refreshTable();
      let msg:string;
      if(data.is_default == 1){
        msg = data.year+" marked as default successfully"
      }else{
        msg = data.year+" removed from default successfully"
      }

      this.snack$.open(msg, 'OK', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: ['snack-success'],
      });
      this.store$.dispatch(new logActions.GetList(this.logFilter));
    });

  }
}
