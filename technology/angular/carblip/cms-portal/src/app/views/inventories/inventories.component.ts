import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { environment } from 'environments/environment';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { combineLatest, fromEvent, Observable, of, Subject } from 'rxjs';
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

import { Router } from '@angular/router';
import { ROLE_LIST } from 'app/core/constants';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { getYearArray } from 'app/shared/helpers/utils';
import { getCookie, setCookie } from 'app/shared/helpers/utils';
import * as commonModels from 'app/shared/models/common.model';
import { TablePagination, Year } from 'app/shared/models/common.model';
import * as inventoriesModels from 'app/shared/models/inventory.model';
import { Inventory } from 'app/shared/models/inventory.model';
import { MDealer } from 'app/shared/models/mdealer.model';
import { Make } from 'app/shared/models/mmake.model';
import { Model } from 'app/shared/models/mmodel.model';
import { InventoryService } from 'app/shared/services/apis/inventories.service';
import { MDealerService } from 'app/shared/services/apis/mdealer.service';
import { MMakeService } from 'app/shared/services/apis/mmake.service';
import { MModelService } from 'app/shared/services/apis/mmodel.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/inventories/inventories.actions';
import {
  didFetchSelector,
  fetchingSelector,
  filterSelector,
  metaSelector,
} from 'app/store/inventories/inventories.selectors';
import { initialState } from 'app/store/inventories/inventories.states';
import { NgxRolesService } from 'ngx-permissions';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { GlobalService } from 'app/shared/services/apis/global.service';
import { FilterService } from 'app/shared/services/filter.service';

@Component({
  selector: 'app-inventories',
  templateUrl: './inventories.component.html',
  styleUrls: ['./inventories.component.scss'],
  animations: [fadeInUp400ms],
})
export class InventoriesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchInput') searchInput: ElementRef;

  columnHeaders: Array<{}> = [
    { key: 'dealer', label: 'Dealer', visible: true},
    { key: 'stock_no', label: 'Stock #', visible: true},
    { key: 'year', label: 'Year', visible: true},
    { key: 'make', label: 'Make', visible: true},
    { key: 'model', label: 'Model', visible: true},
    { key: 'desc', label: 'Description', visible: true},
    { key: 'exterior_color', label: 'Exterior Color', visible: true},
    { key: 'interior_color', label: 'Interior Color', visible: true},
    { key: 'model_number', label: 'Model#', visible: true},
    { key: 'invoice', label: 'Cost', visible: true},
    { key: 'actions', label: 'Actions', visible: true},
  ];
  isColumnAvailable: boolean = false;
  private readonly sectionName: string = 'filter_inventory_page';

  private onDestroy$ = new Subject<void>();

  public filter$: Observable<any>;
  public meta$: Observable<any>;
  public fetching$: Observable<any>;

  public filter: inventoriesModels.Filter = initialState.filter;
  public meta: commonModels.Meta = initialState.meta;
  public search = '';

  public tablePagination: TablePagination = {
    length: initialState.meta.total,
    pageIndex: initialState.filter.page,
    pageSize: initialState.filter.per_page,
    previousPageIndex: 0,
  };

  public filterForm: FormGroup;
  public isLogLoading: Boolean = false;

  public dealers: Array<MDealer>;
  public dealerFilterCtrl: FormControl = new FormControl();
  public filteredDealers: Array<MDealer>;

  public years: Array<Year> = getYearArray(-50);
  public yearFilterCtrl: FormControl = new FormControl();
  public filteredYears: Array<Year>;

  public makes: Array<Make>;
  public makeFilterCtrl: FormControl = new FormControl();
  public filteredMakes: Array<Make>;

  public models: Array<Model>;
  public modelFilterCtrl: FormControl = new FormControl();
  public filteredModels: Array<Model>;

  public trims: Array<Inventory>;
  public trimFilterCtrl: FormControl = new FormControl();
  public filteredTrims: Array<Inventory>;

  private isSubmitted = false;

  showFilterOptions: boolean = false;
  timeout: any;
  timeout1: any;

  constructor(
    private store$: Store<AppState>,
    private dialog: MatDialog,
    private rolesService$: NgxRolesService,
    private fb: FormBuilder,
    private service$: InventoryService,
    private dealerService$: MDealerService,
    private makeService$: MMakeService,
    private modelService$: MModelService,
    private changeDetectorRefs: ChangeDetectorRef,
    private snack$: MatSnackBar,
    private router$: Router,
    private loader$: AppLoaderService,
    private globalService$: GlobalService,
    private filterService:FilterService
  ) {
    // To fetch column filters values
    this.getFilteredColumns();

    this.filter$ = this.store$.select(filterSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.fetching$ = this.store$.select(fetchingSelector);

    this.filterForm = this.fb.group({
      year: [''],
      dealer: [''],
      make: [''],
      model: [''],
      trim: [''],
    });
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
    
    //Clone filter variable
    this.filter = {...this.filter};
    
    const payload = {
      form:this.filterForm,
      filter:this.filter,
      common:'inventories_common_filter',
      advance:'inventories_filter'
    }
    const inventories_filter = this.filterService.getAdvanceFilter(payload)
    this.filterForm.patchValue(inventories_filter.form.value)
    this.filter = inventories_filter.filter
    this.search = this.filter.search
    if(this.filterForm.value.make){
      this.onMakeFilterChange(this.filterForm.value.make);
    }
    if(this.filterForm.value.model){
      this.onModelFilterChange(this.filterForm.value.model);
    }

    this.updateFilter(this.filter);

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

    combineLatest(
      this.filter$,
      this.dealerService$.getAll(),
      this.makeService$.getAll()
    )
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(([filterData, dealerData, makeData]) => {
        this.initDealerFilter(dealerData);
        this.initMakeFilter(makeData);
        if (!deepEqual(this.filter, filterData)) {
          this.filterService.setCommonFilter('inventories_common_filter', {search:filterData.search})
          
          this.filter = filterData;
          this.initFilter();
        }
      });

    this.meta$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(meta => {
          if (!deepEqual(this.meta, meta)) {
            this.meta = meta;
            this.initMeta();
          }
        })
      )
      .subscribe();

    // listen for search field value changes for dealer
    this.dealerFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterDealers();
      });

    // listen for search field value changes for make
    this.makeFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterMakes();
      });

    // listen for search field value changes for make
    this.modelFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterModels();
      });

    // listen for search field value changes for trim
    this.trimFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterTrims();
      });

    // listen for search field value changes for year
    this.yearFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterYears();
      });

    this.initYearFilter();
  }

  initDealerFilter(dealerData) {
    if (!deepEqual(this.dealers, dealerData.data)) {
      this.dealers = dealerData.data;
      this.dealers.unshift({
        id: undefined,
        name: 'None',
      });
      this.filteredDealers = this.dealers.slice(0);
    }
  }

  initMakeFilter(makeData) {
    if (!deepEqual(this.makes, makeData.data)) {
      this.makes = makeData.data;
      this.makes.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      this.makes.unshift({
        id: undefined,
        name: 'None',
      });
      this.filteredMakes = this.makes.slice(0);
    }
  }

  initModelFilter(make) {
    this.filteredModels = [];
    this.filteredTrims = [];
    this.modelService$
      .getAll({
        make: make,
      })
      .subscribe(data => {
        this.models = data.data;
        this.models.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        this.models.unshift({
          id: undefined,
          name: 'None',
        });
        this.filteredModels = this.models.slice(0);
      });
  }

  initTrimFilter(model) {
    this.filteredTrims = [];
    this.service$
      .getAll({
        model: model,
      })
      .subscribe(data => {
        this.trims = data.data;
        this.trims.unshift({
          id: undefined,
          desc: 'None',
        });
        this.filteredTrims = this.trims.slice(0);
      });
  }

  initYearFilter() {
    this.years.unshift({
      id: undefined,
      name: 'None',
    });
    this.filteredYears = this.years.slice(0);
  }

  /** Filter dealers
   * @param Dealer item
   * @return
   **/

  filterDealers() {
    if (!this.dealers) {
      return;
    }
    // get the search keyword
    let search = this.dealerFilterCtrl.value;
    if (!search) {
      this.filteredDealers = this.dealers.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the dealers
    this.filteredDealers = this.dealers.filter(
      item => item.name.toLowerCase().indexOf(search) > -1
    );
    this.refreshTable();
  }

  /** Filter makes
   * @param Make item
   * @return
   **/

  filterMakes() {
    if (!this.makes) {
      return;
    }
    // get the search keyword
    let search = this.makeFilterCtrl.value;
    if (!search) {
      this.filteredMakes = this.makes.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the makes
    this.filteredMakes = this.makes.filter(
      item => item.name.toLowerCase().indexOf(search) > -1
    );
    this.refreshTable();
  }

  /** Filter trims
   * @param Make item
   * @return
   **/

  filterTrims() {
    if (!this.trims) {
      return;
    }
    // get the search keyword
    let search = this.trimFilterCtrl.value;
    if (!search) {
      this.filteredTrims = this.trims.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the makes
    this.filteredTrims = this.trims.filter(
      item => item.desc.toLowerCase().indexOf(search) > -1
    );
    this.refreshTable();
  }

  /** Filter models
   * @param Make item
   * @return
   **/

  filterModels() {
    this.filteredModels = [];
    if (!this.models) {
      return;
    }
    // get the search keyword
    let search = this.modelFilterCtrl.value;
    if (!search) {
      this.filteredModels = this.models.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the makes
    this.filteredModels = this.models.filter(
      item => item.name.toLowerCase().indexOf(search) > -1
    );
    this.refreshTable();
  }

  /** Filter years
   * @param Number item
   * @return
   **/

  filterYears() {
    if (!this.years) {
      return;
    }
    // get the search keyword
    let search = this.yearFilterCtrl.value;
    if (!search) {
      this.filteredYears = this.years.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }

    // filter the banks
    this.filteredYears = this.years.filter(
      item => item.name.toLowerCase().indexOf(search) > -1
    );
    this.refreshTable();
  }

  initMeta() {
    this.tablePagination.length = this.meta.total;
    this.tablePagination.pageIndex = this.meta.current_page - 1;
    this.tablePagination.pageSize = this.meta.per_page;
    this.changeDetectorRefs.detectChanges();
  }

  initFilter() {
    this.search = this.filter.search;
    // this.filterForm.patchValue({
    //   year: this.filter.filter.year,
    //   dealer: this.filter.filter.dealer,
    //   make: this.filter.filter.make,
    //   model: this.filter.filter.model,
    //   trim: this.filter.filter.trim,
    // });
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
    this.filterService.setCommonFilter('inventories_common_filter', data)

    this.updateFilter(data);
  }

  getInventoryFilter() {
    const inventoryFilter: inventoriesModels.InventoryFilter = {};
    if (this.filterForm.value.dealer) {
      inventoryFilter.dealer = this.filterForm.value.dealer;
    }
    if (this.filterForm.value.year) {
      inventoryFilter.year = this.filterForm.value.year;
    }
    if (this.filterForm.value.make) {
      inventoryFilter.make = this.filterForm.value.make;
    }
    if (this.filterForm.value.model) {
      inventoryFilter.model = this.filterForm.value.model;
    }
    if (this.filterForm.value.trim) {
      inventoryFilter.trim = this.filterForm.value.trim;
    }
    return inventoryFilter;
  }

  filterSubmit() {
    this.isSubmitted = true;
    const newFilter = {
      filter: this.getInventoryFilter(),
    };
 
    this.filterService.saveAdvanceFilter(this.getInventoryFilter(), 'inventories_filter')
    this.updateFilter(newFilter);
  }

  onMakeFilterChange(val) {
    this.initModelFilter(val);
  }

  onModelFilterChange(val) {
    this.initTrimFilter(val);
  }

  onResetFilter() {
    this.filterForm.patchValue({
      year: '',
      dealer: '',
      make: '',
      model: '',
      trim: '',
    });
    this.filterSubmit();
  }

  isResetAvailable() {
    return (
      this.isSubmitted &&
      (this.filterForm.value.dealer ||
        this.filterForm.value.year ||
        this.filterForm.value.make ||
        this.filterForm.value.model ||
        this.filterForm.value.trim)
    );
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  onRefresh() {
    this.loader$.open();
    setCookie('inventory-refresh', '1', 1);
    this.service$
      .fetchData()
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(result => {
        this.loader$.close();
        if (result && result.data.message) {
          this.snack$.open(result.data.message, 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
        }
      });
    return false;
  }

  showRefreshButton() {
    const roles = this.rolesService$.getRoles();
    if (
      roles['admin'] ||
      roles['superadmin'] ||
      roles['administrative'] ||
      roles['manager']
    ) {
      return true;
    } else if ((roles['salesperson'] || roles['concierge']) && getCookie('inventory-refresh')) {
      return true;
    } else {
      return false;
    }
  }

  onClearSearch($event: any) {
    if($event == "") {
      this.onFilterChange();
    }
  }

  applyFilter($event) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.filterSubmit();
    }, 1200);
  }

  toggleColumnVisibility(column, event) {
    column.visible = !column.visible;
    clearTimeout(this.timeout1);
    this.timeout1 = setTimeout(() => {
      this.addOrUpdateColumnFilter();
    }, 1000);
  }

  getFilteredColumns() {
    this.globalService$.getByIdAndName(this.sectionName).subscribe(res=> {
      if(res.data.length > 0) {
        this.isColumnAvailable = true;
        this.columnHeaders = res.data[0].table_column;
        this.refreshTable();
      } else {
        this.isColumnAvailable = true;
        this.refreshTable();
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
