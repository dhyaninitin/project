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
import { forkJoin, fromEvent, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
  tap,
} from 'rxjs/operators';
import * as _ from 'underscore';

import { formatPhoneNumber } from 'app/shared/helpers/utils';
import * as commonModels from 'app/shared/models/common.model';
import { TablePagination } from 'app/shared/models/common.model';
import { Quote } from 'app/shared/models/quote.model';
import { AppState } from 'app/store/';
import * as actions from 'app/store/quotes/quotes.actions';
import {
  didFetchSelector,
  fetchingSelector,
  filterSelector,
  metaSelector,
} from 'app/store/quotes/quotes.selectors';
import { initialState } from 'app/store/quotes/quotes.states';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { NgxRolesService } from 'ngx-permissions';
import { GlobalService } from 'app/shared/services/apis/global.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { QuoteService } from 'app/shared/services/apis/quotes.service';
import { PortalUser } from 'app/shared/models/portaluser.model';
import { DateTimeService, IDateRangeSelection } from 'app/shared/services/date-time.service';
import * as moment from 'moment-timezone';
import * as quotesModels from 'app/shared/models/quote.model';
import { FilterService } from 'app/shared/services/filter.service';

@Component({
  selector: 'app-quotes',
  templateUrl: './quotes.component.html',
  styleUrls: ['./quotes.component.scss'],
  animations: [fadeInUp400ms]
})
export class QuotesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchInput') searchInput: ElementRef;

  columnHeaders: Array<{}> = [
    { key: 'id', label: 'Deal #', visible: true},
    { key: 'stock_no', label: 'Stock #', visible: true},
    { key: 'first_name', label: 'First Name', visible: true},
    { key: 'last_name', label: 'Last Name', visible: true},
    { key: 'year', label: 'Year', visible: true},
    { key: 'make', label: 'Make', visible: true},
    { key: 'model', label: 'Model', visible: true},
    { key: 'drive_off', label: 'Drive Off', visible: true},
    { key : 'mark_as_final', label: 'Final', visible: true},
    { key: 'created_at', label: 'Created At', visible: true},
    { key: 'updated_at', label: 'Updated At', visible: true},
    { key: 'actions', label: 'Actions', visible: true},
  ];
  isColumnAvailable: boolean = false;
  private readonly sectionName: string = 'filter_quotes_page';

  private onDestroy$ = new Subject<void>();

  public filter$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;
  public fetching$: Observable<any>;

  public filter: quotesModels.Filter = initialState.filter;
  public meta: commonModels.Meta = initialState.meta;
  public search = '';

  public tablePagination: TablePagination = {
    length: initialState.meta.total,
    pageIndex: initialState.filter.page,
    pageSize: initialState.filter.per_page,
    previousPageIndex: 0,
  };
  timeout: any;
  showFilterOptions: boolean = false;
  public filterForm: FormGroup;

  public RequestYears: any;
	public yearFilterCtrl: FormControl = new FormControl();
	public filteredYears: [any];
  public RequestMakes: any;
	public makeFilterCtrl: FormControl = new FormControl();
	public filteredMakes: [any];
  public RequestModels: any;
	public modelFilterCtrl: FormControl = new FormControl();
  public salespersons: Array<PortalUser>;
  public salespersonsFilterCtrl: FormControl = new FormControl();
  public filteredSalespersons: Array<PortalUser>;
	public filteredModels: [any];
  disableAllOptionInContactOwner: boolean = false;
  timeout1: any;

  public contractdaterrange = {
    begin: null,
    end: null,
  };

  public deliverydaterrange = {
    begin: null,
    end: null,
  };

  markAsFinal = [
    { label: 'Show All', value: -1},
    { label: 'Hide Final', value: 0},
    { label: 'Show only Final', value: 1}
  ]

  constructor(
    private store$: Store<AppState>,
    private dialog: MatDialog,
    private rolesService$: NgxRolesService,
    private _cdr: ChangeDetectorRef,
    private globalService$: GlobalService,
    private fb: FormBuilder,
    private quotesService$: QuoteService,
    private filterService:FilterService
  ) {
    // To fetch column filters values
    this.getFilteredColumns();

    this.filter$ = this.store$.select(filterSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.fetching$ = this.store$.select(fetchingSelector);

    this.filterForm = this.fb.group({
      year: null,
      make: null,
      model: null,
      salesperson: [''],
      final:-1
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

    //Clone Filter Variable
    this.filter = {...this.filter};
    const payload = {
      form:this.filterForm,
      filter:this.filter,
      common:'quotes_common_filter',
      advance:'quotes_filter'
    }
    const quotes_filter = this.filterService.getAdvanceFilter(payload, 'quotes')
    this.filterForm.patchValue(quotes_filter.form.value)
    this.filter = quotes_filter.filter
    this.search = this.filter.search

    if(this.filter.filter.contract_start_date && this.filter.filter.contract_end_date){
      let start_date: any = moment(this.filter.filter.contract_start_date);
      let end_date: any = moment(this.filter.filter.contract_end_date);
      this.contractdaterrange = {
        begin: start_date._d,
        end: end_date._d,
      }
    }

    if (this.filter.filter.delivery_start_date && this.filter.filter.delivery_end_date) {
      let start_date: any = moment(this.filter.filter.delivery_start_date);
      let end_date: any = moment(this.filter.filter.delivery_end_date);
      this.deliverydaterrange = {
        begin: start_date._d,
        end: end_date._d,
      }
    }

    this.store$.dispatch(new actions.ClearDetail());

    this.updateFilter(this.filter);
  }
  
  initData() {
    this.getFiltersData();

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
            this.filterService.setCommonFilter('quotes_common_filter', {search:data.search})
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

    // listen for search field value changes for year
		this.yearFilterCtrl.valueChanges
    .pipe(
      debounceTime(100),
      takeUntil(this.onDestroy$)
    )
    .subscribe(() => {
      this.filterYears();
    });

    // listen for search field value changes for make
		this.makeFilterCtrl.valueChanges
    .pipe(
      debounceTime(100),
      takeUntil(this.onDestroy$)
    )
    .subscribe(() => {
      this.filterMakes();
    });

    // listen for search field value changes for model
		this.modelFilterCtrl.valueChanges
    .pipe(
      debounceTime(100),
      takeUntil(this.onDestroy$)
    )
    .subscribe(() => {
      this.filterModels();
    });

    // listen for search field value changes for salesperson
    this.salespersonsFilterCtrl.valueChanges
    .pipe(
      debounceTime(10),
      takeUntil(this.onDestroy$)
    )
    .subscribe(() => {
      this.filterSalespersons();
    });
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

    this.filterService.setCommonFilter('quotes_common_filter', data)
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
        if(this.columnHeaders.length == res.data[0].table_column.length) {
          this.columnHeaders = res.data[0].table_column;
        }
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

  filterSubmit() {
    const newFilter = {
      filter: this.getRequestFilter(),
    };

    this.filterService.saveAdvanceFilter(this.getRequestFilter(), 'quotes_filter')
    this.updateFilter(newFilter);
  }

  getRequestFilter() {
    const quotesFilter: quotesModels.QuotesFilter = {};
    if (this.contractdaterrange.begin) {
      quotesFilter.contract_start_date = moment(this.contractdaterrange.begin).format('yyyy/MM/DD');
    }
    if (this.contractdaterrange.end) {
      quotesFilter.contract_end_date = moment(this.contractdaterrange.end).format('yyyy/MM/DD');
    }
    if (this.deliverydaterrange.begin) {
      quotesFilter.delivery_start_date = moment(this.deliverydaterrange.begin).format('yyyy/MM/DD');
    }
    if (this.deliverydaterrange.end) {
      quotesFilter.delivery_end_date = moment(this.deliverydaterrange.end).format('yyyy/MM/DD');
    }
    if (this.filterForm.value.salesperson) {
      quotesFilter.salesperson = this.filterForm.value.salesperson;
    }
    if (this.filterForm.value.year) {
      quotesFilter.year = this.filterForm.value.year;
    }
    if (this.filterForm.value.make) {
      quotesFilter.make = this.filterForm.value.make;
    }
    if (this.filterForm.value.model) {
      quotesFilter.model = this.filterForm.value.model;
    }
    quotesFilter.final = this.filterForm.value.final;
    return quotesFilter;
  }

  applyFilter($event) {
    this.disableAllOptionInContactOwner = false;
    if (this.filterForm.controls['salesperson'].value?.includes('0')) {
      this.filterForm.controls['salesperson'].value?.splice(0, 1)
      this.filterForm.get('salesperson').setValue($event.value)
    }
    clearTimeout(this.timeout1);
    this.timeout1 = setTimeout(() => {
      this.filterSubmit();
    }, 1200);
  }

  filterYears() {
		if (!this.RequestYears) {
			return;
		}
		// get the search keyword
		let search = this.yearFilterCtrl.value;
		if (!search) {
			this.filteredYears = this.RequestYears.slice(0);
			return;
		} else {
			search = search.toString();
		}
    
		// filter the years
		this.filteredYears = this.RequestYears.filter(
			item => item.toString().indexOf(search) > -1
		); 
	}

  filterMakes() {
		if (!this.RequestMakes) {
			return;
		}
		// get the search keyword
		let search = this.makeFilterCtrl.value;
		if (!search) {
			this.filteredMakes = this.RequestMakes.slice(0);
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the makes
		this.filteredMakes = this.RequestMakes.filter(
			item => item.toLowerCase().indexOf(search) > -1
		);
	}

  filterModels() {
		if (!this.RequestModels) {
			return;
		}
		// get the search keyword
		let search = this.modelFilterCtrl.value
		if (!search) {
			this.filteredModels = this.RequestModels.slice(0);
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the makes
		this.filteredModels = this.RequestModels.filter(
			item => item.toLowerCase().indexOf(search) > -1
		);
	}

  /** Filter Salespersons
   * @param PortalUser item
   * @return
   **/

  filterSalespersons() {
    if (!this.salespersons) {
      return;
    }
    // get the search keyword
    let search = this.salespersonsFilterCtrl.value;
    if (!search) {
      this.filteredSalespersons = this.salespersons.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredSalespersons = this.salespersons.filter(
      item => item.first_name.toLowerCase().indexOf(search) > -1
    );
  }

  checkAllContactOwner() {
    this.disableAllOptionInContactOwner = !this.disableAllOptionInContactOwner;
      let arr = this.filterForm.controls['salesperson'].value;
      if(this.disableAllOptionInContactOwner) {
        arr = ['0']
      }
      this.filterForm.patchValue({salesperson: arr})
  }

  onContractCalendarChange(selectedDateRange: IDateRangeSelection) {
    this.contractdaterrange = DateTimeService.getDateRangeFromSelection(
      selectedDateRange
    );
    this.filterSubmit()
  }

  onDeliveryCalendarChange(selectedDateRange: IDateRangeSelection) {
    this.deliverydaterrange = DateTimeService.getDateRangeFromSelection(
      selectedDateRange
    );
    this.filterSubmit()
  }

  getFiltersData() {
    forkJoin(this.quotesService$.getQuoteYears(), this.quotesService$.getQuoteMakes(), this.quotesService$.getQuoteModels(), this.quotesService$.getQuoteSalespersons())
    .subscribe(res => {
      if(res.length > 0) {
        if (!deepEqual(this.RequestYears, res[0].data)) {
          this.filteredYears = res[0].data;
        }
        this.RequestYears = res[0].data;

        if (!deepEqual(this.RequestMakes, res[1].data)) {
          this.filteredMakes = res[1].data;
        }
        this.RequestMakes = res[1].data;

        if (!deepEqual(this.RequestModels, res[2].data)) {
          this.filteredModels = res[2].data;
        }
        this.RequestModels = res[2].data;

        if (!deepEqual(this.salespersons, res[3].data)) {
          this.filteredSalespersons = res[3].data;
        }
        this.salespersons = res[3].data;
      }
    }, error => {
      console.log(error);
    })
  }
}
