import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, skip, takeUntil, tap } from 'rxjs/operators';
import { diff } from 'deep-diff';
import { DatePipe } from '@angular/common';
import { TitleCasePipe } from '@angular/common';
import { ROLE_LIST, STATE_LIST } from 'app/core/constants';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { DealerContactModalComponent } from 'app/shared/components/dealer-contact-modal/dealer-contact-modal.component';
import { DealersModalComponent } from 'app/shared/components/dealer-modal/dealer-modal.component';
import { getYearArrayFrom } from 'app/shared/helpers/utils';
import { PortalUser } from 'app/shared/models/portaluser.model';
import { State, Year } from 'app/shared/models/common.model';
import * as commonModels from 'app/shared/models/common.model';
import { Dealer, DealerContact } from 'app/shared/models/dealer.model';
import { NewQuote, Quote } from 'app/shared/models/quote.model';
import { Request } from 'app/shared/models/request.model';
import { Brand, Model } from 'app/shared/models/vehicle.model';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';
import { DealerService } from 'app/shared/services/apis/dealer.service';
import { ExportService } from 'app/shared/services/apis/export.service';
import { QuoteService } from 'app/shared/services/apis/quotes.service';
import { RequestService } from 'app/shared/services/apis/requests.service';
import { VBrandService } from 'app/shared/services/apis/vbrand.service';
import { VModelService } from 'app/shared/services/apis/vmodel.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/quotes/quotes.actions';
import { didFetchSelector, fetchingSelector } from 'app/store/quotes/quotes.selectors';
import { environment } from 'environments/environment';
import { TablePagination } from 'app/shared/models/common.model';
import { initialState as initialLogState } from 'app/store/quotelogs/quotelog.states';
import { Filter as LogFilter, } from 'app/shared/models/log.model';
import { PurchaseOrder } from 'app/shared/models/purchase-order.model';
import { PurchaseOrderService } from 'app/shared/services/apis/purchase-order.service';
import { PurchaseOrderModalComponent } from 'app/shared/components/purchase-order-modal/purchase-order-modal.component';
import { VendorsService } from 'app/shared/services/apis/vendors.service';
import { UserService } from 'app/shared/services/apis/users.service';
import { dataSelector as profileDataSelector } from 'app/store/auth/authentication.selector';
import { Profile } from 'app/shared/models/user.model';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { NgxRolesService } from 'ngx-permissions';

@Component({
  selector: 'app-quotes-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.style.scss'],
  animations: [
    fadeInRight400ms,
  ]
})
export class QuotesEditComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  private onDestroy$ = new Subject<void>();

  public isEdit: Boolean = false;

  public quoteId: any = '';
  public requestId: string;
  public userId: string;
  public isReady: boolean;
  public quote: Quote;
  public itemForm: FormGroup;
  public saving: Boolean = false;
  public showExtraExpense: Boolean = false;

  public request: Request;
  public loadingMake: Boolean = false;
  public loadingModel: Boolean = false;
  public loadingWsMake: Boolean = false;
  public loadingWsModel: Boolean = false;

  public dealerId: string;

  public dealers: Array<Dealer>;

  public dealerFilterCtrl: FormControl = new FormControl();

  public filteredDealers: Array<Dealer>;

  public dealerContacts: Array<DealerContact>;
  public dealerContactFilterCtrl: FormControl = new FormControl();
  public filteredDealerContacts: Array<DealerContact>;

  public portalUsers: Array<PortalUser>;
  public portalUserFilterCtrl: FormControl = new FormControl();
  public filteredPortalUsers: Array<PortalUser>;

  public purchaseOrder: Array<PurchaseOrder>;
  public purchaseOrderFilterCtrl: FormControl = new FormControl();
  public filteredPurchaseOrder: Array<PurchaseOrder>;
  public purchaseOrderId: number;
  public purchaseOrderTotal;

  public states: Array<State> = STATE_LIST;
  public stateFilterCtrl: FormControl = new FormControl();
  public filteredStates: Array<State>;

  public years: Array<Year> = getYearArrayFrom(2011);
  public yearFilterCtrl: FormControl = new FormControl();
  public filteredYears: Array<Year>;

  public makes: Array<Brand>;
  public makeFilterCtrl: FormControl = new FormControl();
  public filteredMakes: Array<Brand>;

  public models: Array<Model>;
  public modelFilterCtrl: FormControl = new FormControl();
  public filteredModels: Array<Model>;

  public wsYears: Array<Year> = getYearArrayFrom(2011);
  public wsYearFilterCtrl: FormControl = new FormControl();
  public wsFilteredYears: Array<Year>;

  public wsMakes: Array<Brand>;
  public wsMakeFilterCtrl: FormControl = new FormControl();
  public wsFilteredMakes: Array<Brand>;

  public wsModels: Array<Model>;
  public wsModelFilterCtrl: FormControl = new FormControl();
  public wsFilteredModels: Array<Model>;

  public contactOnwerIds: Array<Number>;

  public dealerContactInfo: DealerContact;

  public onClose: Subject<boolean>;

  public showHistory = [];
  public userProfile: any = {};
  public userData: any;
  public didFetch$: Observable<any>;
  public fetching$: Observable<any>;
  public allData;
  public oldPurchaseOrderIds;
  public logFilter: LogFilter = initialLogState.filter;
  public logMeta: commonModels.Meta = initialLogState.meta;
  public logPagination: TablePagination = {
    length: initialLogState.meta.total,
    pageIndex: initialLogState.filter.page,
    pageSize: initialLogState.filter.per_page,
    previousPageIndex: 0,
  };
  public quoteLogParam: any = {
    order_by: 'created_at',
    order_dir: 'desc',
    page: 1,
    per_page: 10,
  };

  public purchaseOrderInfo: any = {}
  public vendorInfo;
  public fetchPurchaseOrder;
  public disablePurchaseOrderId = null;
  public addHistoryData;
  public showDatalastPage: boolean = true;
  public wholesaleData: any;
  offset: number = 1;
  totalDealersPages: number = 0;
  loadingDealers: boolean = false;
  timeout: NodeJS.Timeout;
  totalDealers = [];

  purchaseoffset: number = 1;
  totalpurchasePages: number = 0;
  loadingpurchases: boolean = false;
  totalPurchses = [];
  salesOptions = [
    {label:'Delivery', value:0},
    {label:'Pickup', value:1}
  ]
  markAsFinal:number;
  loadingContact: boolean = true;

  constructor(
    private store$: Store<AppState>,
    private route$: ActivatedRoute,
    private authService$: AuthService,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private loader$: AppLoaderService,
    private confirmService$: AppConfirmService,
    private service$: QuoteService,
    private brandService$: VBrandService,
    private modelService$: VModelService,
    private dealerServicer$: DealerService,
    private portalUserServicer$: PortalUserService,
    private exportService$: ExportService,
    private requestService$: RequestService,
    private fb: FormBuilder,
    private location$: Location,
    private snack$: MatSnackBar,
    public datepipe: DatePipe,
    public titleCasePipe: TitleCasePipe,
    private purchaseOrderServicer$: PurchaseOrderService,
    private vendorService$: VendorsService,
    private router: Router,
    private userService$: UserService,
    private rolesService$: NgxRolesService,

  ) {
    const contactOwnerRoles = ROLE_LIST.filter(
      item => item.name === 'salesperson' || item.name === 'manager' || item.name === 'concierge'
    );
    this.contactOnwerIds = contactOwnerRoles.map(item => item.id);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.fetching$ = this.store$.select(fetchingSelector);
  }

  public canDeactivate() {
    if(this.itemForm == undefined) {
      return true;
    }
    return !this.itemForm.dirty;
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    return false;
  }

  ngOnInit() {
    this.store$
    .select(profileDataSelector)
    .pipe(
      takeUntil(this.onDestroy$),
      tap((profile: Profile) => {
        this.userProfile = profile;
      })
    )
    .subscribe();

    this.onClose = new Subject();
    this.isReady = false;
    this.quote = {};
    // this.quote.first_name='Null';
    // this.quote.id=null;
    this.route$.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      setTimeout(() => {
        this.loader$.open();
      }, 10);

      if (params.get('id')) {
        this.quoteId = params.get('id');
        this.isEdit = true;
        this.getHistoryList(this.quoteLogParam);
      }

      this.requestId = params.get('requestId');
      if (this.requestId) {
        this.requestService$
          .getById(this.requestId)
          .pipe(
            takeUntil(this.onDestroy$),
            map(result => result),
            catchError(err => {
              return of(err);
            })
          )
          .subscribe(({ data }) => {
            this.request = data;
            this.userId = this.request.user_id;
            this.filterPurchaseOrder(null, () => {
              //this.setPurchaseOrderInForm();
              this.initData();
              this.getUserById();

            });
          });
      } else {
        this.filterPurchaseOrder(null, () => {
          //this.setPurchaseOrderInForm();
          this.initData();
        });
      }
    });

    // listen for search field value changes for dealer
    this.portalUserFilterCtrl.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterPortalUsers();
      });

    // listen for search field value changes for dealer
    this.dealerFilterCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        skip(1),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.offset = 1;
        this.totalDealers = [];
        this.filterDealers();
      });

    // listen for search field value changes for dealer contact
    this.dealerContactFilterCtrl.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterDealerContacts();
      });

    // listen for search field value changes for dealer
    this.purchaseOrderFilterCtrl.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.purchaseoffset = 1;
        this.totalPurchses = [];
        this.filterPurchaseOrder();
      });

    // listen for search field value changes for state
    this.stateFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterStates();
      });

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
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterMakes();
      });

    // listen for search field value changes for model
    this.modelFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterModels();
      });

    // listen for search field value changes for whole sale year
    this.wsYearFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.wsFilterYears();
      });

    // listen for search field value changes for whole sale make
    this.wsMakeFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.wsFilterMakes();
      });

    // listen for search field value changes for whole sale model
    this.wsModelFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.wsFilterModels();
      });

  }

  initLogMeta(meta) {
    this.logPagination.length = meta.total;
    this.logPagination.pageIndex = meta.current_page - 1;
    this.logPagination.pageSize = meta.per_page;
  }

  onLogPaginateChange(event) {
    this.showDatalastPage = !this.paginator.hasNextPage();
    this.quoteLogParam.page = event.pageIndex + 1;
    this.quoteLogParam.per_page = event.pageSize;
    this.getHistoryList(this.quoteLogParam);
  }

  getHistoryList(quotePage) {
    quotePage = this.quoteLogParam;
    combineLatest(
      this.service$.getHistory(this.quoteId, quotePage),
    )
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(([result]) => {
        this.loader$.close();
        this.showHistory = result.data;
        this.initLogMeta(result.meta);
        this.refreshData();
      });
  }
  initData() {
    if (this.isEdit) {
      this.getWholesaleQuote(this.quoteId);
      combineLatest(this.service$.getById(this.quoteId))
        .pipe(
          takeUntil(this.onDestroy$),
          map(result => result),
          catchError(err => {
            return of(err);
          })
        )
        .subscribe(([result]) => {
          let flag = true;
          if(result.data.length == 0) {
            this.snack$.open("This action is unauthorized", 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snack-warning'],
            });
            this.router.navigateByUrl('/quotes');
            return; 
          }
          this.quote = result.data;
          this.requestId = this.quote.request_id;
          this.userId = this.quote.user_id;
          const convertedDate = this.datepipe.transform(`${this.quote.created_at}`, 'dd/MM/yy ,h:mm a');
          const splitDateTime = convertedDate.split(',');
          // this.addHistoryData = `Version 1 ${this.userProfile.full_name} created quote ${this.quote.id} on ${splitDateTime[0]} at ${splitDateTime[1]}`;
          this.buildItemForm(this.quote);
          if (this.wholesaleData != undefined || this.wholesaleData != null) {
            if(this.wholesaleData.newCarAllowance !== null) { 
              this.wholesaleData.newCarAllowance.map( newCarAllowance => {
                if(newCarAllowance.quote_id == this.quote.id) {
                  flag = false;
                  this.itemForm.patchValue({
                    allowance_wholesale: newCarAllowance.allowance_to_new,
                  });
                } 
              })
            } else {
              this.itemForm.patchValue({
                allowance_wholesale: this.wholesaleData.allowance_to_new,
              });
            }
            if(flag) {
              this.itemForm.patchValue({
                allowance_wholesale: this.wholesaleData.allowance_to_new,
              });
            }
          }
          else {
            this.itemForm.patchValue({
              allowance_wholesale: 0
            });
          }

          this.purchaseOrderTotal = this.getTotalPurchaseOrderCost() + this.getTotalActualCost();
          this.allData = this.itemForm.value;
          this.isReady = true;
          this.loader$.close();
          this.getUserById();
          this.getRequest();
        });
    } else {
      this.buildItemForm(null);
      this.allData = this.itemForm.value;
      this.isReady = true;
      this.loader$.close();
    }
  }

  onPortalUserFilterChange() {
    this.refreshData();
  }

  filterPortalUsers() {
    this.portalUsers = [];
    // get the search keyword
    const search = this.portalUserFilterCtrl.value || '';
    const portalUserParam = {
      roles: this.contactOnwerIds,
      search,
    };

    this.portalUserServicer$
      .getListByFilter(portalUserParam)
      .subscribe(({ data }) => {
        this.portalUsers = data;
        this.filteredPortalUsers = this.portalUsers.slice(0);
        this.onPortalUserFilterChange();
      });
    // filter the makes
  }

  filterPurchaseOrder(newId = null, callback = null) {
    this.purchaseOrder = [];
    // get the search keyword
    const search = this.purchaseOrderFilterCtrl.value || '';
    // const search =newId || '';

    const purchaseOrderParam = {
      order_by: 'created_at',
      order_dir: 'desc',
      page: this.purchaseoffset,
      per_page: 20,
      search,
      quote_id: this.quoteId
    };

    this.purchaseOrderServicer$.getPurchaseOrder(purchaseOrderParam).subscribe(({ data, meta }) => {
      this.totalPurchses.push(...data);
      this.purchaseOrder = this.totalPurchses
      this.totalpurchasePages = meta.last_page

      this.filteredPurchaseOrder = this.purchaseOrder.slice(0);
      this.onPurchaseOrderFilterChange(newId);
      this.loadingpurchases = false;
      if (callback) callback();
    });
    // filter the makes
  }
  onSearch(searchValue) {
    const search = searchValue || '';
    const purchaseOrderParam = {
      order_by: 'id',
      order_dir: 'desc',
      page: 1,
      per_page: 100,
      search,
      quote_id: this.quoteId
    };
    clearTimeout(this.timeout);
    this.timeout = setTimeout(()=> {
      this.purchaseOrderServicer$.getPurchaseOrder(purchaseOrderParam).subscribe(({ data }) => {
        this.purchaseOrder = data;
        this.filteredPurchaseOrder = this.purchaseOrder.slice(0);
        this.onPurchaseOrderFilterChange(searchValue);
        // if (callback) callback();
      });
    }, 700);
  }
  getPurchaseOrderFilterById(value) {
    let filteredDataByPurchaseOrderId = this.purchaseOrder.filter((o) => value.includes(o.id));
    return filteredDataByPurchaseOrderId;
  }

  onPurchaseOrderFilterChange(val) {
    if ((val != null || val != undefined) && this.itemForm != undefined) {
      const temp = this.filteredPurchaseOrder.filter((item) => {
        return this.itemForm.value['purchaseOrderList'].some(selected => selected['purchase_order']['id'] == item.id)
      })
      this.filteredPurchaseOrder.map(item => temp.includes(item) ? item['selected'] = true : item['selected'] = false);
      // this.filteredPurchaseOrder.map(item=>(item.id===val.id || item.selected==true) ? item['selected']=true : item['selected']=false);
    }
    this.purchaseOrderTotal = this.getTotalPurchaseOrderCost() + this.getTotalActualCost();
    this.refreshData();
  }

  getPurchaseOrderGroup(data: any) {
    if (data.length) {
      return data.map(item => {
        return this.fb.group({
          purchase_order: [item || ''],
        });
      });
    }
    return [
      this.fb.group({
        purchase_order: '',
      }),
    ];
  }

  addPurchaseOrderGroup() {
    const fg = this.createPurchaseOrderGroup();
    this.purchaseOrderList.push(fg);
  }

  deletePurchaseOrderGroup(idx: number) {
    if (idx == 0 && this.purchaseOrderList.controls.length == 1) {
      this.addPurchaseOrderGroup();
    }
    this.purchaseOrderList.removeAt(idx);
    this.onPurchaseOrderFilterChange(idx);
    this.itemForm.markAsDirty();
  }

  createPurchaseOrderGroup() {
    return this.fb.group({
      purchase_order: [''],
    });
  }

  onDealerFilterChange(val) {
    if (val) {
      this.itemForm.patchValue({
        dealer_id: val,
        dealer_contact_id: null,
      });
    }
    this.dealerId = this.itemForm.value.dealer_id;
    this.filterDealerContacts();
    this.refreshData();
  }

  /** Filter Dealers
   * @return
   **/
  filterDealers(newId = null) {
    this.dealers = [];
    // get the search keyword
    const search = this.dealerFilterCtrl.value || '';
    let dealer_id = null;
    if(this.itemForm.get('dealer_id').value != "") {
      dealer_id = this.itemForm.get('dealer_id').value;
    }
    const dealerParam = {
      order_by: 'created_at',
      order_dir: 'desc',
      page: this.offset,
      per_page: 20,
      search,
    };

    this.dealerServicer$.getList(dealerParam, dealer_id).subscribe(({ data, meta }) => {
      // this.dealers = data;
      this.totalDealers.push(...data);
      this.dealers = this.totalDealers;
      this.totalDealersPages = meta.last_page;

      this.filteredDealers = this.dealers.slice(0);
      if (this.quote.dealer_info) {
        const currentItem = this.filteredDealers.find(item => item.id == this.quote.dealer_info['id']);
        if (currentItem == null) {
          this.filteredDealers.push(this.quote.dealer_info)
        }
      }
      this.onDealerFilterChange(newId);
      this.loadingDealers = false;
    });
    // filter the makes
  }

  onDealerContactFilterChange(val) {
    if (val) {
      this.itemForm.patchValue({
        dealer_contact_id: val,
      });
    }
    this.dealerContactInfo = this.dealerContacts.find(
      item => item.id === this.itemForm.value.dealer_contact_id
    );
    this.refreshData();
  }

  filterDealerContacts(newId = null) {
    this.dealerContacts = [];
    const search = this.dealerContactFilterCtrl.value || '';
    const contactParam = {
      dealer_id: this.itemForm.value.dealer_id,
      order_by: 'created_at',
      order_dir: 'desc',
      page: 1,
      per_page: 30,
      search,
    };

    this.dealerServicer$.getListContacts(contactParam).subscribe(({ data }) => {
      this.dealerContacts = data;
      this.filteredDealerContacts = this.dealerContacts.slice(0);

      this.onDealerContactFilterChange(newId);
    });
  }

  initStateFilter() {
    this.filteredStates = this.states.slice(0);
  }

  onStateFilterChange() { }

  /** Filter states
   * @param Number item
   * @return
   **/

  filterStates() {
    if (!this.states) {
      return;
    }
    // get the search keyword
    let search = this.stateFilterCtrl.value;
    if (!search) {
      this.filteredStates = this.states.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }

    // filter the states
    this.filteredStates = this.states.filter(
      item => item.label.toLowerCase().indexOf(search) > -1
    );
    this.refreshData();
  }

  initYearFilter() {
    this.filteredYears = this.years.slice(0);
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
      search = search.toString().toLowerCase();
    }

    // filter the banks
    this.filteredYears = this.years.filter(
      item => item.name.toLowerCase().indexOf(search) > -1
    );
    this.refreshData();
    this.initMakeFilter();
  }

  initMakeFilter() {
    this.makes = [];
    this.models = [];
    this.filteredMakes = [];
    this.filteredModels = [];
    this.loadingMake = true;

    const yearItem = this.years.find(
      item =>
        item.name ===
        (this.yearFilterCtrl.value ? this.yearFilterCtrl.value.toString() : '')
    );
    if (yearItem) {
      this.brandService$
        .getAllByYear({
          year: this.yearFilterCtrl.value,
        })
        .subscribe(data => {
          this.makes = data.data || [];
          this.makes.sort((a, b) => {
            return a.name.localeCompare(b.name);
          });
          this.filteredMakes = this.makes.slice(0);
          this.initModelFilter();
          this.loadingMake = false;
          this.refreshData();
        });
    } else {
      this.loadingMake = false;
      this.refreshData();
    }
  }

  onMakeFilterChange(val) {
    this.initModelFilter();
  }

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
    this.onMakeFilterChange(search);
    this.refreshData();
  }

  initModelFilter() {
    this.models = [];
    this.filteredModels = [];
    this.loadingModel = true;
    const makeItem = this.makes.find(
      item => item.name === this.makeFilterCtrl.value
    );

    if (makeItem) {
      this.modelService$
        .getAllByBrandYear({
          brand_id: makeItem.id,
          year: this.yearFilterCtrl.value,
        })
        .subscribe(data => {
          this.models = data.data || [];
          this.models.sort((a, b) => {
            return a.name.localeCompare(b.name);
          });
          this.filteredModels = this.models.slice(0);
          this.loadingModel = false;
          this.refreshData();
        });
    } else {
      this.loadingModel = false;
      this.refreshData();
    }
  }

  filterModels() {
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
    this.refreshData();
  }

  wsInitYearFilter() {
    this.wsFilteredYears = this.wsYears.slice(0);
  }

  /** Filter WS years
   * @param Number item
   * @return
   **/

  wsFilterYears() {
    if (!this.wsYears) {
      return;
    }
    // get the search keyword
    let search = this.wsYearFilterCtrl.value;
    if (!search) {
      this.wsFilteredYears = this.wsYears.slice(0);
      return;
    } else {
      search = search.toString().toLowerCase();
    }

    // filter the banks
    this.wsFilteredYears = this.wsYears.filter(
      item => item.name.toLowerCase().indexOf(search) > -1
    );
    this.wsInitMakeFilter();
    this.refreshData();
  }

  wsInitMakeFilter() {
    this.wsMakes = [];
    this.wsModels = [];
    this.wsFilteredMakes = [];
    this.wsFilteredModels = [];

    this.loadingWsMake = true;

    const yearItem = this.wsYears.find(
      item =>
        item.name ===
        (this.wsYearFilterCtrl.value
          ? this.wsYearFilterCtrl.value.toString()
          : '')
    );
    if (yearItem) {
      this.brandService$
        .getAllByYear({
          year: this.itemForm.value.year_wholesale,
        })
        .subscribe(data => {
          this.wsMakes = data.data || [];
          this.wsFilteredMakes = this.wsMakes.slice(0);
          this.wsInitModelFilter();
          this.loadingWsMake = false;
          this.refreshData();
        });
    } else {
      this.loadingWsMake = false;
      this.refreshData();
    }
  }

  onWsMakeFilterChange(val) {
    this.wsInitModelFilter();
  }

  wsFilterMakes() {
    if (!this.wsMakes) {
      return;
    }
    // get the search keyword
    let search = this.wsMakeFilterCtrl.value;
    if (!search) {
      this.wsFilteredMakes = this.wsMakes.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the makes
    this.wsFilteredMakes = this.wsMakes.filter(
      item => item.name.toLowerCase().indexOf(search) > -1
    );
    this.onWsMakeFilterChange(search);
    this.refreshData();
  }

  wsInitModelFilter() {
    this.wsModels = [];
    this.wsFilteredModels = [];

    this.loadingWsModel = true;

    const makeItem = this.wsMakes.find(
      item => item.name === this.wsMakeFilterCtrl.value
    );

    if (makeItem) {
      this.modelService$
        .getAllByBrandYear({
          brand_id: makeItem.id,
          year: this.itemForm.value.year_wholesale,
        })
        .subscribe(data => {
          this.wsModels = data.data || [];
          this.wsFilteredModels = this.wsModels.slice(0);
          this.loadingWsModel = false;
          this.refreshData();
        });
    } else {
      this.loadingWsModel = false;
      this.refreshData();
    }
  }

  wsFilterModels() {
    if (!this.wsModels) {
      return;
    }
    // get the search keyword
    let search = this.wsModelFilterCtrl.value;
    if (!search) {
      this.wsFilteredModels = this.wsModels.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the makes
    this.wsFilteredModels = this.wsModels.filter(
      item => item.name.toLowerCase().indexOf(search) > -1
    );
    this.refreshData();
  }

  get customersWholeSale(): FormArray {
    return this.itemForm.get('customersWholeSale') as FormArray;
  }

  get expenseChargedClient(): FormArray {
    return this.itemForm.get('expenseChargedClient') as FormArray;
  }

  get expenseChargedDealer(): FormArray {
    return this.itemForm.get('expenseChargedDealer') as FormArray;
  }

  get expenseVendor(): FormArray {
    return this.itemForm.get('expenseVendor') as FormArray;
  }

  get purchaseOrderList(): FormArray {
    return this.itemForm.get('purchaseOrderList') as FormArray;
  }

  buildItemForm(item: Quote) {
    const currentYear = new Date().getFullYear();
    let formFields = {};
    const defaultYear = this.request ? Number(this.request.year) : '',
      defaultMake = this.request ? this.request.brand : '',
      defaultModel = this.request ? this.request.model : '',
      defaultContactOwernId = this.request ? this.request.contact_owner_id : '',
      defaultFirstName = this.request ? this.request.first_name : '',
      defaultLastName = this.request ? this.request.last_name : '';
    if (this.isEdit) {
      if (item.purchase_order_ids != null || item.purchase_order_ids != undefined) {
        this.fetchPurchaseOrder = this.getPurchaseOrderFilterById(item.purchase_order_ids);
        this.oldPurchaseOrderIds = this.oldPurchaseOrderId();
      }
      else {
        this.fetchPurchaseOrder = [{}];
      }
      this.dealerId = item.dealer_id;
      formFields = {
        stock_no: [item.stock_no, Validators.required],
        portal_user_id: [item.portal_user_id || ''],
        dealer_id: [item.dealer_id || ''],
        dealer_contact_id: [item.dealer_contact_id || ''],
        purchaseOrderList: this.fb.array(
          this.getPurchaseOrderGroup(this.fetchPurchaseOrder),
          []
        ),
        first_name: [item.first_name],
        last_name: [item.last_name],
        address: [item.address],
        city: [item.city],
        state: [item.state],
        zip: [item.zip],
        contract_date: [item.contract_date],
        year: [item.year],
        make: [item.make],
        model: [item.model],
        dealer: [item.dealer],
        delivery_date: [item.delivery_date],
        lead: [item.lead],
        vin: [item.vin],
        business_manager: [item.business_manager],
        drive_off: [item.drive_off],
        notes: [item.notes],
        allowance_wholesale: [item.allowance_wholesale],
        year_wholesale: [item.year_wholesale],
        make_wholesale: [item.make_wholesale],
        model_wholesale: [item.model_wholesale],
        vin_wholesale: [item.vin_wholesale],
        type_wholesale: [
          item.type_wholesale ? item.type_wholesale.toString() : '',
        ],
        notes_wholesale: [item.notes_wholesale],
        customersWholeSale: this.fb.array(
          this.getCustomerWholeSaleGroup(item.customersWholeSale),
          []
        ),
        total_customer_payment: [item.total_customer_payment],
        expenseChargedClient: this.fb.array(
          this.getExpenseChargedClientGroup(item.expenseChargedClient),
          []
        ),
        expenseChargedDealer: this.fb.array(
          this.getExpenseChargedDealerGroup(item.expenseChargedDealer),
          []
        ),
        allowance_chargedclient: [item.allowance_chargedclient],
        remaining_payments_chargedclient: [
          item.remaining_payments_chargedclient,
        ],
        payment_chargedclient: [item.payment_chargedclient],
        total_payment_chargedclient: [item.total_payment_chargedclient],
        total_chargedclient: [item.total_chargedclient],
        total_chargeddealer: [item.total_chargeddealer],
        expenseVendor: this.fb.array(
          this.getExpenseVendorGroup(item.expenseVendor),
          []
        ),
        total_expensevendor: [item.total_expensevendor],
        brokeer_fee_dealer_expensevendor: [
          item.brokeer_fee_dealer_expensevendor,
        ],
        brokeer_fee_customer_expensevendor: [
          item.brokeer_fee_customer_expensevendor,
        ],
        paid_by_expensevendor: [
          item.paid_by_expensevendor
            ? item.paid_by_expensevendor.toString()
            : '',
        ],
        adds_expensevendor: [item.adds_expensevendor],
        gross_expensevendor: [item.gross_expensevendor],
        expense_actual_expensevendor: [item.expense_actual_expensevendor],
        pack_expensevendor: [item.pack_expensevendor],
        net_expensevendor: [item.net_expensevendor],
        net_deal_expensevendor: [
          item.net_deal_expensevendor == 0 || item.net_deal_expensevendor == 1
            ? item.net_deal_expensevendor.toString()
            : '',
        ],
        comission_percent_expensevendor: [item.comission_percent_expensevendor],
        comission_amount_expensevendor: [item.comission_amount_expensevendor],
        company_net_expensevendor: [item.company_net_expensevendor],
        invoice_dealer_expensevendor: [item.invoice_dealer_expensevendor],
        invoice_client_expensevendor: [item.invoice_client_expensevendor],
        check_to_dealer_expensevendor: [item.check_to_dealer_expensevendor],
        dealer_date_paid_expensevendor: [item.dealer_date_paid_expensevendor],
        dealer_check_number_expensevendor: [
          item.dealer_check_number_expensevendor,
        ],
        check_to_client_expensevendor: [item.check_to_client_expensevendor],
        client_date_paid_expensevendor: [item.client_date_paid_expensevendor],
        client_check_number_expensevendor: [
          item.client_check_number_expensevendor,
        ],
        tax_rate: [item.tax_rate],
        license_fee: [item.license_fee],
        profit_due: [item.profit_due],
        delivery_or_pickup:[item.delivery_or_pickup],
        msrp:[item.msrp],
        maturity_date:[item.maturity_date],
        mileage_allotment:[item.mileage_allotment],
        monthly_payment:[item.monthly_payment],
        residual_value:[item.residual_value],
        sale_price:[item.sale_price],
        term:[item.term],
        sales_tax:[item.sales_tax],
        mark_as_final:[item.mark_as_final]
      };
      this.markAsFinal = item.mark_as_final
    } else {
      formFields = {
        stock_no: ['', Validators.required],
        portal_user_id: [defaultContactOwernId],
        dealer_id: [''],
        dealer_contact_id: [''],
        purchaseOrderList: this.fb.array(
          this.getPurchaseOrderGroup([{}]),
          []
        ),
        first_name: [defaultFirstName],
        last_name: [defaultLastName],
        address: [''],
        city: [''],
        state: [''],
        zip: [''],
        contract_date: [''],
        year: [defaultYear],
        make: [defaultMake],
        model: [defaultModel],
        dealer: [''],
        delivery_date: [''],
        lead: [''],
        vin: [''],
        business_manager: [''],
        drive_off: [''],
        notes: [''],
        allowance_wholesale: [''],
        year_wholesale: [''],
        make_wholesale: [''],
        model_wholesale: [''],
        vin_wholesale: [''],
        type_wholesale: [''],
        notes_wholesale: [''],
        customersWholeSale: this.fb.array(
          this.getCustomerWholeSaleGroup([{}]),
          []
        ),
        total_customer_payment: [''],
        expenseChargedClient: this.fb.array(
          this.getExpenseChargedClientGroup([{}]),
          []
        ),
        expenseChargedDealer: this.fb.array(
          this.getExpenseChargedDealerGroup([{}]),
          []
        ),
        allowance_chargedclient: [''],
        remaining_payments_chargedclient: [''],
        payment_chargedclient: [''],
        total_payment_chargedclient: [''],
        total_chargedclient: [''],
        total_chargeddealer: [''],
        expenseVendor: this.fb.array(this.getExpenseVendorGroup([{}]), []),
        total_expensevendor: [''],
        brokeer_fee_dealer_expensevendor: [''],
        brokeer_fee_customer_expensevendor: [''],
        paid_by_expensevendor: [''],
        adds_expensevendor: [''],
        gross_expensevendor: [''],
        expense_actual_expensevendor: [''],
        pack_expensevendor: [''],
        net_expensevendor: [''],
        net_deal_expensevendor: [''],
        comission_percent_expensevendor: [''],
        comission_amount_expensevendor: [''],
        company_net_expensevendor: [''],
        invoice_dealer_expensevendor: [''],
        invoice_client_expensevendor: [''],
        check_to_dealer_expensevendor: [''],
        dealer_date_paid_expensevendor: [''],
        dealer_check_number_expensevendor: [''],
        check_to_client_expensevendor: [''],
        client_date_paid_expensevendor: [''],
        client_check_number_expensevendor: [''],
        tax_rate: [''],
        license_fee: [''],
        profit_due: [''],
        delivery_or_pickup:[''],
        msrp:[''],
        maturity_date:[''],
        mileage_allotment:[''],
        monthly_payment:[''],
        residual_value:[''],
        sale_price:[''],
        term:[''],
        sales_tax:[''],
        mark_as_final:['']
      };
    }
    this.itemForm = this.fb.group(formFields);
    this.itemForm.value.mark_as_final = this.markAsFinal;
    this.itemForm.controls['allowance_wholesale'].disable();
    this.initStateFilter();
    this.initYearFilter();
    this.wsInitYearFilter();

    if (this.isEdit) {
      if (item.make) {
        this.makeFilterCtrl.setValue(item.make);
      }

      if (item.model) {
        this.modelFilterCtrl.setValue(item.model);
      }

      if (item.year) {
        this.yearFilterCtrl.setValue(item.year);
        this.initMakeFilter();
      }

      if (item.make_wholesale) {
        this.wsMakeFilterCtrl.setValue(item.make_wholesale);
        this.wsInitMakeFilter();
      }

      if (item.model_wholesale) {
        this.wsModelFilterCtrl.setValue(item.model_wholesale);
      }

      if (item.year_wholesale) {
        this.wsYearFilterCtrl.setValue(item.year_wholesale);
        this.wsInitMakeFilter();
      }

    } else {
      if (defaultYear) {
        this.yearFilterCtrl.setValue(defaultYear);
        this.initMakeFilter();
      }

      if (defaultMake) {
        this.makeFilterCtrl.setValue(defaultMake);
        this.initMakeFilter();
      }

      if (defaultModel) {
        this.modelFilterCtrl.setValue(defaultModel);
      }
    }

    this.filterDealers();
    this.filterPortalUsers();
    const roles = this.rolesService$.getRoles();
    if(roles['concierge']) {
			this.itemForm.disable();
			this.yearFilterCtrl.disable();
			this.makeFilterCtrl.disable();
			this.modelFilterCtrl.disable();
      this.wsYearFilterCtrl.disable();
			this.wsMakeFilterCtrl.disable();
			this.wsModelFilterCtrl.disable();
		}
  }

  setPurchaseOrderInForm() {
    if (this.itemForm && this.itemForm.get('purchaseOrderList')) {
      const fetchPurchaseOrder = this.getPurchaseOrderFilterById(this.quote.purchase_order_ids);
      const formPurchaseOrderList = fetchPurchaseOrder.map(item => { return { purchase_order: item } })
      if (formPurchaseOrderList && formPurchaseOrderList.length > 0) {
        this.itemForm.get('purchaseOrderList').setValue(formPurchaseOrderList);
        this.purchaseOrderTotal = this.getTotalPurchaseOrderCost() + this.getTotalActualCost();
      }
    }
  }

  // Extra Expenses Vendor Name
  createExpenseVendorGroup() {
    return this.fb.group({
      name: [''],
      po_number: [''],
      amount: [''],
    });
  }

  getExpenseVendorGroup(data: any) {
    if (data.length > 0 && (data[0].name != null || data[0].po_number != null || data[0].amount > 0)) {
      this.showExtraExpense = true;
    }
    else {
      this.showExtraExpense = false;
    }
    if (data.length) {
      return data.map(item => {
        return this.fb.group({
          name: [item['name'] || ''],
          po_number: [item['po_number'] || ''],
          amount: [Number(item['amount']).toFixed(2) || ''],
        });
      });
    }
    return [
      this.fb.group({
        name: '',
        po_number: '',
        amount: '',
      }),
    ];
  }

  addExpenseVendorGroup() {
    const fg = this.createExpenseVendorGroup();
    this.expenseVendor.push(fg);
  }
  deleteExpenseVendorGroup(idx: number) {
    this.expenseVendor.removeAt(idx);
    this.onPurchaseOrderFilterChange(idx);

  }

  // Extra Expenses Charged Client
  createExpenseChargedClientGroup() {
    return this.fb.group({
      item: [''],
      charge: [''],
    });
  }

  // Extra Expenses Charged Dealer
  createExpenseChargedDealerGroup() {
    return this.fb.group({
      item: [''],
      charge: [''],
    });
  }

  getExpenseChargedClientGroup(data: Array<object>) {
    if (data.length) {
      return data.map(item => {
        return this.fb.group({
          item: [item['item'] || ''],
          charge: [item['charge'] || ''],
        });
      });
    }
    return [
      this.fb.group({
        item: '',
        charge: '',
      }),
    ];
  }

  addExpenseChargedClientGroup() {
    const fg = this.createExpenseChargedClientGroup();
    this.expenseChargedClient.push(fg);
  }
  deleteExpenseChargedClientGroup(idx: number) {
    this.expenseChargedClient.removeAt(idx);
  }

  getExpenseChargedDealerGroup(data: Array<object>) {
    if (data.length) {
      return data.map(item => {
        return this.fb.group({
          item: [item['item'] || ''],
          charge: [item['charge'] || ''],
        });
      });
    }
    return [
      this.fb.group({
        item: '',
        charge: '',
      }),
    ];
  }

  addExpenseChargedDealerGroup() {
    const fg = this.createExpenseChargedDealerGroup();
    this.expenseChargedDealer.push(fg);
  }
  deleteExpenseChargedDealerGroup(idx: number) {
    this.expenseChargedDealer.removeAt(idx);
  }

  // Whole Sale
  createCustomerWholeSaleGroup() {
    return this.fb.group({
      amount: [''],
      paid_to: [''],
      date: [''],
      payment_type: [''],
      check_number: [''],
      notes: [''],
    });
  }

  getCustomerWholeSaleGroup(data: Array<object>) {
    if (data.length) {
      return data.map(item => {
        return this.fb.group({
          amount: [item['amount'] || ''],
          paid_to: [item['paid_to'] || ''],
          date: [item['date'] || ''],
          payment_type: [item['payment_type'] || ''],
          check_number: [item['check_number'] || ''],
          notes: [item['notes'] || ''],
        });
      });
    }
    return [
      this.fb.group({
        amount: '',
        paid_to: '',
        date: '',
        payment_type: '',
        check_number: '',
        notes: '',
      }),
    ];
  }

  addCustomerWholeSaleGroup() {
    const fg = this.createCustomerWholeSaleGroup();
    this.customersWholeSale.push(fg);
  }
  deleteCustomerWholeSaleGroup(idx: number) {
    this.customersWholeSale.removeAt(idx);
  }

  addNewDealer() {
    const title = 'Add New Supplier';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      DealersModalComponent,
      {
        width: '768px',
        disableClose: true,
        data: {
          title: title,
          payload: {},
          type: 'add',
        },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
      this.filterDealers(res.id);
    });
  }

  addNewDealerContact() {
    const title = 'Add New Supplier Contact';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      DealerContactModalComponent,
      {
        width: '768px',
        disableClose: true,
        data: {
          title: title,
          payload: {
            dealerId: this.itemForm.value.dealer_id,
          },
          type: 'add',
        },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
      this.filterDealerContacts(res.id);
    });
  }

  addNewPurchaseOrder() {
    const title = 'Add New Purchase order';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      PurchaseOrderModalComponent,
      {
        width: '768px',
        disableClose: true,
        data: {
          title: title,
          payload: {},
          quoteData: { quoteName: this.itemForm.value.stock_no, quoteId: this.quote.id },
          type: 'add',
          page:'quotes'
        },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
      else {
        this.purchaseoffset = 1;
        this.filterPurchaseOrder(res.id, () => {
          const itemList = this.itemForm.value.purchaseOrderList
          const lastItem = itemList[itemList.length - 1];
          if(itemList.length > 1 && lastItem && lastItem.purchase_order == ''){
            this.purchaseOrderList.removeAt(itemList.length - 1);
          }
          const ids = this.itemForm.value.purchaseOrderList.filter(item => item.purchase_order.id)
            .map(item => item.purchase_order.id);
          ids.push(res.id);
          this.fetchPurchaseOrder = this.getPurchaseOrderFilterById(ids);
          const formPurchaseOrderList = this.fetchPurchaseOrder.map(item => { return { purchase_order: item } })
          const uniqueArray = this.removeDuplicates(formPurchaseOrderList)
          if (ids.length > 1) {
            this.addPurchaseOrderGroup();
          }
          this.itemForm.get('purchaseOrderList').setValue(uniqueArray);
          this.purchaseOrderTotal = this.getTotalPurchaseOrderCost() + this.getTotalActualCost();
        });
        this.refreshData();
      }

    });
  }
  numberWithCommas(x) {
    let n = parseFloat(x).toFixed(2);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  editPurchaseOrderGroup(item, i) {
    const title = 'Edit Purchase order';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      PurchaseOrderModalComponent,
      {
        width: '768px',
        disableClose: true,
        data: {
          title: title,
          payload: item,
          quoteData: { quoteName: this.itemForm.value.stock_no, quoteId: this.quote.id },
          type: 'edit',
        },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      
      if (!res) {
        return;
      }
      this.itemForm.controls['purchaseOrderList'].value[i].purchase_order = res;
      this.onPurchaseOrderFilterChange(res);
      this.refreshData();
    });
  }

  getWholesaleQuote(id: any) {
    this.service$.getWholesaleQuoteById(id).pipe(
      takeUntil(this.onDestroy$),
      map(result => result),
      catchError(err => {
        return of(err);
      })
    )
      .subscribe(result => {
        this.wholesaleData = result.data[0];
      });
  }

  getUserById() {
    if(this.userId){
      this.userService$.getById(this.userId).pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
        .subscribe(result => {
          this.userData = result.data;
        });
    }
  }

  getRequest() {
    if(this.requestId){
      this.requestService$
        .getById(this.requestId)
        .pipe(
          takeUntil(this.onDestroy$),
          map(result => result),
          catchError(err => {
            return of(err);
          })
        )
        .subscribe(({ data }) => {
          this.request = data;
          this.userId = this.request.user_id;
          this.loadingContact = false;
        });
    } else{
      this.loadingContact = false;
    }
  }
  transformKey(item) {
    item = item.replace(/_/g, ' ');
    return this.titleCasePipe.transform(item);
  }
  generateAddHistoryMsg(item) {
    if (item.kind == 'E') {
      if (item.path[0] == 'customersWholeSale') {
        if (item.rhs == "") {
          return `${this.transformKey(item.path[0])} removed`;
        }
        else if (item.path[2] == 'paid_to') {
          return `Customer payment ${this.transformKey(item.path[2])} added to ${item.rhs == '1' ? 'Paid To Dealer' : 'Paid To Carblip'}`;
        }
        else if (item.path[2] == 'payment_type') {
          return `Customer payment ${this.transformKey(item.path[2])} added to ${item.rhs == '1' ? 'Check' : item.rhs == '2' ? 'Credit Card' : item.rhs == '3' ? 'Cash' : 'Wire'}`;
        }
        else if (item.path[2] == 'date') {
          let convertedDate = this.datepipe.transform(`${item.rhs}`, 'yyyy-MM-dd');
          return `Customer payment ${this.transformKey(item.path[2])} added to ${convertedDate}`;
        }
        else {
          return `Customer payment ${this.transformKey(item.path[2])} added to ${item.rhs}`;
        }
      }
      else if (item.path[0] == 'expenseChargedClient' || item.path[0] == 'expenseChargedDealer') {
        if (item.rhs == "") {
          return `${this.transformKey(item.path[0])} removed`;
        }
        else if (item.path[2] == 'item') {
          return `Extra Expenses Charged Client Name added to ${item.rhs}`;
        }
        else if (item.path[2] == 'charge') {
          return `Extra Expenses Charged Client Charge added to ${item.rhs}`;
        }
      }
      else if (item.path[0] == 'expenseVendor') {
        if (item.rhs == "") {
          return `${this.transformKey(item.path[0])} removed`;
        }
        else if (item.path[2] == 'name') {
          return `Extra Expenses Charged Client Name added to ${item.rhs}`;
        }
        else if (item.path[2] == 'po_number') {
          return `Extra Expenses Charged Client PO Number added to ${item.rhs}`;
        }
        else {
          return `Extra Expenses Charged Client Amount added to ${item.rhs}`;
        }
      }
      else if (item.path[0] == 'purchase_order_ids' && (item.lhs != undefined || item.lhs != null)) {
        let ids = [];
        ids.push(item.rhs);
        let data = this.getPurchaseOrderFilterById(ids);
        return `Purchase order updated to ${item.rhs}, Description :${data[0].description}, Amount:${data[0].amount} `;
      }
      else if (item.path[0] == 'dealer_id') {
        let dealerName = this.filteredDealers.filter(i => i.id == item.rhs);
        if (dealerName.length > 0) {
          return `Suplier added to ${dealerName[0].name}`;
        }
      }
      else if (item.path[0] == 'dealer_contact_id') {
        let dealerContact = this.filteredDealerContacts.filter(i => i.id == item.rhs);
        if (dealerContact.length > 0) {
          return `Suplier Contact added to ${dealerContact[0].name}`;
        }
      }
      else {
        if (item.rhs == "") {
          if(item.path[0] == 'mark_as_final'){
						return 'Quotes un-marked from final';
					} else {
            if(item.path[0] == "purchase_order_ids" && item.rhs.length == 0){
              return;
            } else {
              return `${this.transformKey(item.path[0])} removed`;
            }
					}
        }
        else {
          if (typeof (item.rhs) == 'object') {
            let convertedDate = this.datepipe.transform(`${item.rhs}`, 'yyyy-MM-dd');
            return `${this.transformKey(item.path[0])} added to ${convertedDate}`;
          }
          else {
            if(item.path[0] == 'mark_as_final'){
							return 'Marked as final';
						} else {
							return `${this.transformKey(item.path[0])} added to ${item.rhs}`;
						}
          }
        }
      }
    }
  }

  generateLogMsg(item) {
    if (item.kind == 'A') {
      if (item.item.kind == 'A') { }
      else if (item.item.kind == 'E') { }
      else if (item.item.kind == 'D') {
        if (item.path[0] == 'customersWholeSale') {
          let convertedDate = this.datepipe.transform(`${item.item.lhs.date}`, 'yyyy-MM-dd');
          return `Customer payment deleted  Amount:${item.item.lhs.amount}, Date Paid:${convertedDate}, Paid To:${item.item.lhs.paid_to == '1' ? 'Paid To Dealer' : 'Paid To Carblip'}, Pyment Type:${item.item.lhs.payment_type == '1' ? 'Check' : item.item.lhs.payment_type == '2' ? 'Credit Card' : item.item.lhs.payment_type == '3' ? 'Cash' : 'Wire'} `;
        }
        else if (item.path[0] == 'expenseChargedDealer' || item.path[0] == 'expenseChargedClient') {
          return `${this.transformKey(item.path[0])} deleted Charge:${item.item.lhs.charge}, Name:${item.item.lhs.item}`;
        }
        else if (item.path[0] == 'expenseVendor') {
          return `Extra Expenses Charged Client deleted Name:${item.item.lhs.name}, Amount:${item.item.lhs.amount}, PO Number:${item.item.lhs.po_number}`;
        }
        else if (item.path[0] == 'purchase_order_ids') {
          let ids = [];
          ids.push(item.item.lhs);
          let data = this.getPurchaseOrderFilterById(ids);
          return `Purchase order deleted to ${item.item.lhs}, Description :${data[0].description}, Amount:${data[0].amount} `;
        }
      }
      else {
        if (item.path[0] == 'customersWholeSale') {
          let convertedDate = this.datepipe.transform(`${item.item.rhs.date}`, 'yyyy-MM-dd');
          return `Customer payment added to Amount:${item.item.rhs.amount}, Date Paid:${convertedDate}, Paid To:${item.item.rhs.paid_to == '1' ? 'Paid To Dealer' : 'Paid To Carblip'}, Pyment Type:${item.item.rhs.payment_type == '1' ? 'Check' : item.item.rhs.payment_type == '2' ? 'Credit Card' : item.item.rhs.payment_type == '3' ? 'Cash' : 'Wire'} `;
        }
        else if (item.path[0] == 'expenseChargedDealer' || item.path[0] == 'expenseChargedClient') {
          return `${this.transformKey(item.path[0])} added to Charge:${item.item.rhs.charge}, Name:${item.item.rhs.item} `;
        }
        else if (item.path[0] == 'expenseVendor') {
          return `Extra Expenses Charged Client added to Name:${item.item.rhs.name}, Amount:${item.item.rhs.amount}, PO Number:${item.item.rhs.po_number}`;
        }
        else if (item.path[0] == 'purchase_order_ids' && (item.item.rhs != undefined || item.item.rhs != null)) {
          let ids = [];
          ids.push(item.item.rhs);
          let data = this.getPurchaseOrderFilterById(ids);
          return `Purchase order added to ${item.item.rhs}, Description :${data[0].description}, Amount:${data[0].amount} `;
        }
      }
    }
    else if (item.kind == 'E') {
      if (item.lhs == "" || item.lhs == null || item.lhs == undefined) {
        return this.generateAddHistoryMsg(item)
      }
      else if (item.path[0] == 'purchase_order_ids' && (item.lhs != undefined || item.lhs != null)) {
        let ids = [];
        ids.push(item.rhs);
        let data = this.getPurchaseOrderFilterById(ids);
        return `Purchase order updated to ${item.rhs}, Description :${data[0].description}, Amount:${data[0].amount} `;
      }
      else if (item.path[0] == 'customersWholeSale') {
        if (item.rhs == "") {
          return `${this.transformKey(item.path[0])} removed`;
        }
        else if (item.path[2] == 'paid_to') {
          return `Customer payment ${this.transformKey(item.path[2])} updated to ${item.rhs == '1' ? 'Paid To Dealer' : 'Paid To Carblip'}`;
        }
        else if (item.path[2] == 'payment_type') {
          return `Customer payment ${this.transformKey(item.path[2])} updated to ${item.rhs == '1' ? 'Check' : item.rhs == '2' ? 'Credit Card' : item.rhs == '3' ? 'Cash' : 'Wire'}`;
        }
        else if (item.path[2] == 'date') {
          let convertedDate = this.datepipe.transform(`${item.rhs}`, 'yyyy-MM-dd');
          return `Customer payment ${this.transformKey(item.path[2])} updated to ${convertedDate}`;
        }
        else {
          return `Customer payment ${this.transformKey(item.path[2])} updated to ${item.rhs}`;
        }
      }
      else if (item.path[0] == 'expenseChargedClient' || item.path[0] == 'expenseChargedDealer') {
        if (item.rhs == "") {
          return `${this.transformKey(item.path[0])} removed`;
        }
        else if (item.path[2] == 'item') {
          return `Extra Expenses Charged Client Name updated to ${item.rhs}`;
        }
        else if (item.path[0] == 'expenseChargedDealer' && item.path[2] == 'charge') {
          return `Extra Expenses Charged Dealer Charge updated to ${item.rhs}`;
        }
        else if (item.path[2] == 'charge') {
          return `Extra Expenses Charged Client Charge updated to ${item.rhs}`;
        }
      }
      else if (item.path[0] == 'expenseVendor') {
        if (item.rhs == "") {
          return `${this.transformKey(item.path[0])} removed`;
        }
        else if (item.path[2] == 'name') {
          return `Extra Expenses Charged Client Name updated to ${item.rhs}`;
        }
        else if (item.path[2] == 'po_number') {
          return `Extra Expenses Charged Client PO Number updated to ${item.rhs}`;
        }
        else {
          return `Extra Expenses Charged Client Amount updated to ${item.rhs}`;
        }
      }
      else if (item.path[0] == 'dealer_id') {
        let dealerName = this.filteredDealers.filter(i => i.id == item.rhs);
        if (dealerName.length > 0) {
          return `Suplier updated to ${dealerName[0].name}`;
        }
      }
      else if (item.path[0] == 'dealer_contact_id') {
        let dealerContact = this.filteredDealerContacts.filter(i => i.id == item.rhs);
        if (dealerContact.length > 0) {
          return `Suplier Contact updated to ${dealerContact[0].name}`;
        }
      }
      else {
        if (item.rhs == "") {
          return `${this.transformKey(item.path[0])} removed`;
        }
        else {
          if (typeof (item.rhs) == 'object') {
            let convertedDate = this.datepipe.transform(`${item.rhs}`, 'yyyy-MM-dd');
            return `${this.transformKey(item.path[0])} updated to ${convertedDate}`;
          }
          else {
            return `${this.transformKey(item.path[0])} updated to ${item.rhs}`;
          }
        }
      }
    }
    else if (item.kind == 'D') {
      return `${this.transformKey(item.path[0])} deleted`;
    }
    else {
      return `${this.transformKey(item.path[0])} added to ${item.rhs}`;
    }
  }

  createHistoryLogs(quoteid: number) {
      const copyObj = {
        target_id: quoteid,
        target_type: 'App\\Model\\Quote',
        content: 'created a quote',
        action: 'created',
        portal_user_id: this.userProfile.id,
        portal_user_name: this.userProfile.full_name,
        category: 'portal'
      };
      this.service$.createHistory(copyObj)
      .subscribe(res => {})
  }

  saveHistoryLog(temp, quote) {
    delete quote['allowance_wholesale'];
    let editedData = diff(temp, quote);
    if (editedData !== undefined) {
      const copyObj = {
        target_id: null,
        target_type: 'App\\Model\\Quote',
        content: '',
        action: 'updated',
        portal_user_id: '',
        portal_user_name: '',
        category: 'portal'
      };
      copyObj.target_id = this.quote.id;
      copyObj.portal_user_id = this.userProfile.id;
      copyObj.portal_user_name = this.userProfile.full_name;
      let logMsgArray = [];
      editedData.forEach(item => {
        logMsgArray.push(this.generateLogMsg(item));
      });
      const newArray = logMsgArray.filter(value => value !== undefined);
      copyObj.content = newArray.join(', ');
      //Need to call create History APi
      this.createHistory(copyObj);
    }
  }

  createHistory(payload) {
    this.loader$.open();
    this.service$
      .createHistory(payload)
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(res => {
        this.saving = false;
        if (res) {
          // const { data } = res;
          res.created_at = (new Date()).toISOString();
          this.showHistory.unshift(res);
          this.logPagination.length += 1;
          this.refreshData();
          this.loader$.close();
        }
      });
    this.refreshData();
  }

  getPurchaseOrderId() {
    let orderList = [];
    this.itemForm.value['purchaseOrderList'].map((item) => {
      orderList.push(item['purchase_order']['id']);
    }
    );
    return orderList;
  }
  oldPurchaseOrderId() {
    let orderList = [];
    this.fetchPurchaseOrder.map((item) => {
      orderList.push(item['id']);
    }
    );
    return orderList;
  }
  submit(callback?: Function) {

    // return;
    this.itemForm.controls.year.setValue(this.yearFilterCtrl.value);
    this.itemForm.controls.year_wholesale.setValue(this.wsYearFilterCtrl.value);
    this.itemForm.controls.make.setValue(this.makeFilterCtrl.value);
    this.itemForm.controls.model.setValue(this.modelFilterCtrl.value);
    this.itemForm.controls.make_wholesale.setValue(this.wsMakeFilterCtrl.value);
    this.itemForm.controls.model_wholesale.setValue(this.wsModelFilterCtrl.value);
    const quote: Quote = {
      ...this.itemForm.value,
      purchase_order_ids: this.getPurchaseOrderId(),
      allowance_wholesale: this.itemForm.getRawValue().allowance_wholesale,
      make: this.makeFilterCtrl.value,
      model: this.modelFilterCtrl.value,
      make_wholesale: this.wsMakeFilterCtrl.value,
      model_wholesale: this.wsModelFilterCtrl.value,
      total_payment_chargedclient: this.getTotalPaymentChargedClient(),
      total_chargedclient: this.getTotalChargedClientAll(),
      total_chargeddealer: this.getTotalChargedDealerAll(),
      total_expensevendor: this.purchaseOrderTotal,
      total_purchase_order: this.getTotalPurchaseOrderCost(),
      gross_expensevendor: this.getGross(),
      net_expensevendor: this.getNet(),
      comission_amount_expensevendor: this.getComission(),
      company_net_expensevendor: this.getCompanyNet(),
      total_customer_payment: this.getTotalCustomerPayment(''),
      invoice_dealer_expensevendor: this.getInvoiceDealer(),
      invoice_client_expensevendor: this.getInvoiceClient(),
      check_to_dealer_expensevendor: this.getCheckToDealer(),
      check_to_client_expensevendor: this.getCheckToClient(),
      mark_as_final :this.markAsFinal ? 1 : 0
    };
    delete quote['purchaseOrderList'];
    if (this.isEdit) {
      const param: Quote = { ...quote };
      this.updateQuote(param, callback);
    } else {
      const param: NewQuote = {
        request_id: this.requestId,
        data: quote,
      };
      this.createQuote(param, callback);
    }
  }


  updateQuote(quote: Quote, callback) {
    if (quote['purchase_order_ids'].includes(undefined)) {
      quote['purchase_order_ids'] = quote['purchase_order_ids'].filter(element => element !== undefined);
    }
    if (this.itemForm.valid) {
      this.saving = true;
      this.loader$.open();
      this.service$
        .update(this.quoteId, quote)
        .pipe(
          takeUntil(this.onDestroy$),
          map(result => result),
          catchError(err => {
            return of(err);
          })
        )
        .subscribe(res => {
          this.saving = false;
          this.loader$.close();
          if (res.success) {
            const temp: Quote = {
              ...this.allData,
              purchase_order_ids: this.oldPurchaseOrderIds,
              make: this.makeFilterCtrl.value,
              model: this.modelFilterCtrl.value,
              make_wholesale: this.wsMakeFilterCtrl.value,
              model_wholesale: this.wsModelFilterCtrl.value,
              total_payment_chargedclient: this.getTotalPaymentChargedClient(),
              total_chargedclient: this.getTotalChargedClientAll(),
              total_chargeddealer: this.getTotalChargedDealerAll(),
              total_expensevendor: this.purchaseOrderTotal,
              total_purchase_order: this.getTotalPurchaseOrderCost(),
              gross_expensevendor: this.getGross(),
              net_expensevendor: this.getNet(),
              comission_amount_expensevendor: this.getComission(),
              company_net_expensevendor: this.getCompanyNet(),
              total_customer_payment: this.getTotalCustomerPayment(''),
              invoice_dealer_expensevendor: this.getInvoiceDealer(),
              invoice_client_expensevendor: this.getInvoiceClient(),
              check_to_dealer_expensevendor: this.getCheckToDealer(),
              check_to_client_expensevendor: this.getCheckToClient(),
              // mark_as_final :this.markAsFinal ? 0 : 1
            };
            delete temp['purchaseOrderList'];
            this.saveHistoryLog(temp, quote);
            this.allData = this.itemForm.value;
            this.oldPurchaseOrderIds = res.data.purchase_order_ids;
            this.itemForm.markAsPristine();
            this.store$.dispatch(new actions.GetList());
            if (callback) {
              callback();
            }
            this.refreshData();
          }
        });
    }
  }

  createQuote(quote: NewQuote, callback) {
    if (quote['data']['purchase_order_ids'].includes(undefined)) {
      quote['data']['purchase_order_ids'] = quote['data']['purchase_order_ids'].filter(element => element !== undefined);
    }
    if (this.itemForm.valid) {
      this.saving = true;
      this.loader$.open();
      this.service$
        .create(quote)
        .pipe(
          takeUntil(this.onDestroy$),
          map(result => result),
          catchError(err => {
            return of(err);
          })
        )
        .subscribe(res => {
          this.saving = false;
          this.loader$.close();
          if (res.success) {
            let quoteid = res.data.id;
            this.createHistoryLogs(quoteid);
            this.itemForm.markAsPristine();
            this.store$.dispatch(new actions.GetList());
            if (callback) {
              callback();
            }
            setTimeout(() => {
              // this.location$.back();
              this.router.navigate([`/quotes/${quoteid}/edit`]);
            }, 100);
          }
        });
    }
  }

  getTitle() {
    if (this.isEdit) {
      return `Quote ${this.quote.id} Edit`;
    } else {
      return `Add Quote`;
    }
  }

  redirectToRequest() {
    this.router.navigate([`/deals/${this.requestId}`]);
  }
  redirectToUser() {
    this.router.navigate([`/contacts/${this.userId}`]);
  }
  getTotalPaymentChargedClient() {
    return (
      this.itemForm.value.remaining_payments_chargedclient *
      this.itemForm.value.payment_chargedclient
    );
  }

  getTotalChargedClient() {
    const data = this.itemForm.value.expenseChargedClient;
    if (!data) {
      return 0;
    }
    return data.reduce((total, item) => {
      return total + Number(item['charge']);
    }, 0);
  }

  getTotalChargedClientAll() {
    return (
      Number(this.getTotalPaymentChargedClient()) +
      Number(this.getTotalChargedClient()) +
      Number(this.itemForm.value.allowance_chargedclient)
    );
  }

  getTotalChargedDealer() {
    const data = this.itemForm.value.expenseChargedDealer;
    if (!data) {
      return 0;
    }
    return data.reduce((total, item) => {
      return total + Number(item['charge']);
    }, 0);
  }

  getTotalChargedDealerAll() {
    return Number(this.getTotalChargedDealer());
  }

  getTotalCustomerPayment(type) {
    const data = this.itemForm.value.customersWholeSale;
    if (!data) {
      return 0;
    }
    return data.reduce((total, item) => {
      let amount = 0;
      if (
        (type === 'dealer' && item['paid_to'] === '1') ||
        (type === 'carblip' && item['paid_to'] === '2') ||
        !type
      ) {
        amount = Number(item['amount']);
      }
      return total + amount;
    }, 0);
  }

  getTotalActualCost() {
    let data = null;
    if (this.itemForm != undefined) {
      data = this.itemForm.value.expenseVendor;
    }
    if (!data) {
      return 0;
    }
    return data.reduce((total, item) => {
      const parsedNumber = Number(item['amount']);
      if (isNaN(parsedNumber)) return total;
      return total + parsedNumber;
    }, 0);
  }

  getTotalPurchaseOrderCost() {
    let data = null;
    if (this.itemForm != undefined) {
      data = this.itemForm.value.purchaseOrderList;
    }
    if (!data) {
      return 0;
    }
    return data.reduce((total, item) => {
      if (Object.keys(item['purchase_order']).length) {
        return total + Number(item['purchase_order']['amount']);
      }
      else {
        return total + Number(0);
      }
    }, 0);
  }
  displayFn(id?: Quote): number | undefined {
    return id ? id.id : undefined;
  }
  getGross() {
    return (
      Number(this.getTotalChargedClientAll()) +
      Number(this.itemForm.value.brokeer_fee_dealer_expensevendor) +
      Number(this.itemForm.value.brokeer_fee_customer_expensevendor) +
      this.getTotalChargedDealerAll()
      - Number(this.itemForm.value.allowance_chargedclient)
    );
  }

  getNet() {
    // return Number(this.getGross()) - Number(this.getTotalActualCost());
    return Number(this.getGross()) - this.purchaseOrderTotal;
  }

  getComission() {
    const net = Number(this.getNet()),
      pack = Number(this.itemForm.value.pack_expensevendor),
      percent = Number(this.itemForm.value.comission_percent_expensevendor);
    let value = ((net - pack) * percent) / 100;

    if (value < 0) {
      value = 0;
    }
    return value;
  }

  getCompanyNet() {
    const net = Number(this.getNet());
    return net - this.getComission();
  }

  getInvoiceDealer() {
    let value =
      this.getTotalChargedDealerAll() +
      Number(this.itemForm.value.brokeer_fee_dealer_expensevendor);

    if (Number(this.itemForm.value.net_deal_expensevendor)) {
      value = value - Number(this.itemForm.value.drive_off);
    }
    if (value < 0) {
      value = 0;
    }

    return value;
  }

  getInvoiceClient() {
    let value =
      Number(this.itemForm.value.drive_off) -
      Number(this.getTotalCustomerPayment('carblip')) -
      Number(this.getTotalCustomerPayment('dealer')) +
      this.getTotalChargedClientAll() -
      Number(this.itemForm.getRawValue().allowance_wholesale) +
      Number(this.itemForm.value.brokeer_fee_customer_expensevendor) +
      Number(this.itemForm.value.sales_tax);

    if (value < 0) {
      value = 0;
    }

    return value;
  }

  getCheckToDealer() {
    let value = Number(this.itemForm.value.drive_off);
    if (Number(this.itemForm.value.net_deal_expensevendor)) {
      value =
        value -
        Number(this.itemForm.value.brokeer_fee_dealer_expensevendor) -
        this.getTotalChargedDealerAll();
    }

    value = value - Number(this.getTotalCustomerPayment('dealer'));

    if (value < 0) {
      value = 0;
    }

    return value;
  }

  getCheckToClient() {
    let value =
      -Number(this.itemForm.value.drive_off) +
      Number(this.itemForm.getRawValue().allowance_wholesale) +
      Number(this.getTotalCustomerPayment('carblip')) +
      Number(this.getTotalCustomerPayment('dealer')) -
      this.getTotalChargedClientAll() -
      Number(this.itemForm.value.brokeer_fee_customer_expensevendor);

    if (value > 0) {
      value =
        value <
          Number(this.itemForm.getRawValue().allowance_wholesale) +
          Number(this.getTotalCustomerPayment('carblip'))
          ? value
          : Number(this.itemForm.getRawValue().allowance_wholesale) +
          Number(this.getTotalCustomerPayment('carblip'));
    }

    if (value < 0) {
      value = 0;
    }

    return value;
  }

  onBackClick() {
    this.location$.back();
  }

  onExport() {
    if (this.itemForm.dirty) {
      this.confirmService$
        .confirm({
          message: `You have updates, Do you want to save data before export?`,
        })
        .subscribe(res => {
          if (res) {
            this.submit(() => {
              this.downloadFile();
            });
          } else {
            // this.downloadFile();
          }
        });
    } else {
      this.downloadFile();
    }
  }

  downloadFile() {
    const param = {
      type: 'quote',
      id: this.quoteId,
    };
    this.loader$.open();
    this.exportService$
      .postQuote(param)
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(result => {
        this.loader$.close();
        if (result && result.data && result.data.token) {
          window.open(
            environment.apiUrl + '/export/download?token=' + result.data.token
          );
        } else {
          this.snack$.open('Something went wrong, Try again.', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-warning'],
          });
        }
      });
  }

  onPrint() {
    if (this.itemForm.dirty) {
      this.confirmService$
        .confirm({
          message: `You have updates, Do you want to save data before export?`,
        })
        .subscribe(res => {
          if (res) {
            this.submit(() => {
              this.downloadPrintFile();
            });
          } else {
            // this.downloadPrintFile();
          }
        });
    } else {
      this.downloadPrintFile();
    }
  }

  downloadPrintFile() {
    const param = {
      type: 'quote-print',
      id: this.quoteId,
    };
    this.loader$.open();
    this.exportService$
      .postQuotePrint(param)
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(result => {
        this.loader$.close();
        if (result && result.data && result.data.token) {
          window.open(
            environment.apiUrl + '/export/download?token=' + result.data.token
          );
        } else {
          this.snack$.open('Something went wrong, Try again.', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-warning'],
          });
        }
      });
  }

  refreshData() {
    this.changeDetectorRefs.detectChanges();
  }

  getNextBatchOfDealers() {
    this.loadingDealers = true;
    this.offset = this.offset + 1;
    this.filterDealers();
  }

  getNextBatchOfPurchaseOrders() {
    if(this.purchaseoffset != this.totalpurchasePages) {
      this.loadingpurchases = true;
      this.purchaseoffset = this.purchaseoffset + 1;
      this.filterPurchaseOrder();
    }
  }

  removeDuplicates(arr: any) {
    const seenIds = {}; 
    return arr.filter(obj => {
      if (!seenIds[obj.purchase_order.id]) {
        seenIds[obj.purchase_order.id] = true; 
        return true;
      }
      return false;
    });
  }

  toggleFinal(event:any){
    this.itemForm.get('mark_as_final').setValue(event.checked ? 1 : 0);
		this.itemForm.markAllAsTouched();
    this.itemForm.markAsDirty();
		this.changeDetectorRefs.detectChanges();
	}

  finalTooltipText(){
    return  this.markAsFinal ? 'Un-marked From Final' : 'Mark As Final';
  }
}
