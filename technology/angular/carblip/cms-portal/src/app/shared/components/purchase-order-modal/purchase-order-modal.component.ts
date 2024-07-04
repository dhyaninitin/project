import { Component, OnInit, ChangeDetectorRef, Inject, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, skip, takeUntil, tap } from 'rxjs/operators';
import { DatePipe, Location, TitleCasePipe } from '@angular/common';
import { diff } from 'deep-diff';
import * as deepEqual from 'deep-equal';


import { AppState } from 'app/store';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { PurchaseOrderService } from 'app/shared/services/apis/purchase-order.service';
import { PurchaseOrder, PurchaseOrderState } from 'app/shared/models/purchase-order.model';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TablePagination } from 'app/shared/models/common.model';
import * as actions from 'app/store/purchase-order/purchase-order.actions';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { initialState as initialLogState } from 'app/store/purchase-order-logs/purchase-order-logs.states';
import {
  Filter as LogFilter,
} from 'app/shared/models/log.model';
import * as commonModels from 'app/shared/models/common.model';
import { Quote } from 'app/shared/models/quote.model';
import { QuoteService } from 'app/shared/services/apis/quotes.service';
import { VendorsService } from 'app/shared/services/apis/vendors.service';
import { NgxRolesService } from 'ngx-permissions';
import { Profile } from 'app/shared/models/user.model';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';
import { VendorsEditComponent } from 'app/views/vendors/edit/edit.component';
import { VendorContactModalComponent } from 'app/shared/components/vendor-contact-modal/vendor-contact-modal.component';
import { ROLE_LIST } from 'app/core/constants';


@Component({
  selector: 'app-purchase-order-modal',
  templateUrl: './purchase-order-modal.component.html',
  styleUrls: ['./purchase-order-modal.component.scss'],
  animations: egretAnimations,
})
export class PurchaseOrderModalComponent implements OnInit {
  private onDestroy$ = new Subject<void>();

  public itemForm: FormGroup;
  public quoteFilterCtrl: FormControl = new FormControl();
  public filteredQuote: Array<Quote>;
  public quoteList: Array<Quote>;

  public vendorFilterCtrl: FormControl = new FormControl();
  public filteredVendor: Array<PurchaseOrderState> = [];
  public vendorList: Array<PurchaseOrderState>;

  public vendorContactFilterCtrl: FormControl = new FormControl();
  public filteredVendorContact: Array<PurchaseOrderState> = [];
  public vendorContactList: Array<PurchaseOrderState>;

  public requestApprovalFilterCtrl: FormControl = new FormControl();
  public filteredRequestApproval: Array<Profile> = [];
  public requestApprovalList: Array<Profile>;

  public type: string;
  public isActive: boolean;
  public saveButtonLabel;
  public saving: Boolean = false;
  public orderId;
  public isEdit: Boolean = false;
  public purchaseOrder: PurchaseOrder;
  public showHistory = [];
  public orderLogParam: any = {
    order_by: 'created_at',
    order_dir: 'desc',
    page: 1,
    per_page: 10,
  };
  public isReady: boolean = false;
  public userProfile: any;

  public quotes: Array<Quote> = [];
  public quotes$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;
  public offset: number;
  public meta: commonModels.Meta;
  public quoteId: string;
  public vendorId: string;
  public vendorContactId: string;
  public requestApprovalId: string;
  public isAllowUpdate: boolean = false;
  public allData;
  public dialogData;
  public quoteData: any;

  vendorsOffset: number = 1;
	totalVendorsPages: number = 0;
	loadingVendors: boolean = false;
	searchedVendorsText: string = "";
	totalVendors = [];

	searchedDealApprovalText: string = "";
  public page: string;

  public contactOnwerIds: Array<Number>;
  showWholesale: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PurchaseOrderModalComponent>,
    private changeDetectorRefs: ChangeDetectorRef,
    private fb: FormBuilder,
    private store$: Store<AppState>,
    private purchaseOrderService$: PurchaseOrderService,
    private route$: ActivatedRoute,
    private location$: Location,
    public titleCasePipe: TitleCasePipe,
    private authService$: AuthService,
    private quoteService$: QuoteService,
    private vendorService$: VendorsService,
    public datepipe: DatePipe,
    public loader$: AppLoaderService,
    private router$: Router,
    private rolesService$: NgxRolesService,
    private portalService$: PortalUserService,
    private dialog: MatDialog,
  ) {
    const contactOwnerRoles = ROLE_LIST.filter(
			item => item.name === 'superadmin' || item.name === 'admin' || item.name === 'administrative'
		);
		this.contactOnwerIds = contactOwnerRoles.map(item => item.id);
  }

  ngOnInit() {
    this.getUserInfo();
    this.type = this.data.type;
    this.purchaseOrder = this.data.payload;
    this.quoteData = this.data.quoteData;
    this.page = this.data.page
    if(this.page == 'wholesale'){
      this.showWholesale = true
    } else {
      this.showWholesale = false
    }
    if (this.type === 'edit') {
      this.isEdit = true;
      this.saveButtonLabel = 'SAVE';
      this.orderId = this.purchaseOrder.id
      this.buildItemForm(this.purchaseOrder);
      this.allData = this.itemForm.value;
    } else {
      this.isEdit = false;
      this.saveButtonLabel = 'CREATE';
      this.buildItemForm(this.purchaseOrder);
      this.allData = this.itemForm.value;
    }
    //start listen for search field value changes
    // this.quoteFilterCtrl.valueChanges
    //   .pipe(
    //     debounceTime(500),
    //     takeUntil(this.onDestroy$))
    //   .subscribe(() => {
    //     this.filterQuote();
    //   });

    this.vendorFilterCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        skip(1),
        takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.searchedVendorsText = this.vendorFilterCtrl.value;
        // if(this.searchedVendorsText != "") {
          this.vendorsOffset = 1;
          this.totalVendors = [];
          this.filterVendor();
        // }
      });

    this.vendorContactFilterCtrl.valueChanges
      .pipe(debounceTime(500),takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.filterVendorContact();
      });

    this.requestApprovalFilterCtrl.valueChanges
      .pipe(debounceTime(500), takeUntil(this.onDestroy$))
      .subscribe(() => {
        if(this.searchedDealApprovalText != ""){
          this.filterRequestApproval();
        }
        this.searchedDealApprovalText = this.requestApprovalFilterCtrl.value;
      });
    //end  of search event
  }

  onBackClick() {
    this.location$.back();
  }
  initData() {
    if (this.isEdit) {
      // setTimeout(() => {
      this.loader$.open();
      // }, 30);
      combineLatest(this.purchaseOrderService$.getById(this.orderId))
        .pipe(
          takeUntil(this.onDestroy$),
          map(result => result),
          catchError(err => {
            return of(err);
          })
        )
        .subscribe(([result]) => {
          this.purchaseOrder = result.data;
          this.buildItemForm(this.purchaseOrder);
          this.allData = this.itemForm.value;
          this.loader$.close();
          this.isReady = true;
        });
    } else {
      this.buildItemForm(null);
      this.loader$.close();
      this.allData = this.itemForm.value;
      this.isReady = true;
    }
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }
  showEditDeleteButton() {
    const roles = this.rolesService$.getRoles();
    if (roles['administrative'] || roles['admin'] || roles['superadmin']) {
      this.isAllowUpdate = true;
    }
  }

  filterQuote(newId = null) {
    this.quoteList = [];
    let search = this.quoteFilterCtrl.value || '';
    const quoteParam = {
      order_by: 'created_at',
      order_dir: 'desc',
      page: 1,
      per_page: 20,
      search,
    };

    this.quoteService$.getList(quoteParam).subscribe(({ data }) => {
      this.quoteList = data;
      this.filteredQuote = this.quoteList.slice(0);
      this.onQuoteFilterChange(newId);
    });
  }

  onQuoteFilterChange(val) {
    if (val) {
      this.itemForm.patchValue({
        quote: val,
      });
    }
    this.quoteId = this.itemForm.value.quote;
    this.refreshData();
  }
  onVendorFilterChange(val) {
    if (val) {
      this.itemForm.patchValue({
        vendor_id: val,
        vendor_contact_id: 0,
      });
    }
    this.vendorId = this.itemForm.value.vendor_id;
    this.filterVendorContact();
    this.refreshData();
  }

  onVendorContactFilterChange(val) {
    if (val) {
      this.itemForm.patchValue({
        vendor_contact_id: val,
      });
    }
    this.vendorContactId = this.itemForm.value.vendor_contact_id;
    this.refreshData();
  }
  onRequestApprovalFilterChange(val) {
    if (val) {
      this.itemForm.patchValue({
        request_approval_from: val,
      });
    }
    this.requestApprovalId = this.itemForm.value.request_approval_from;
    this.refreshData();
  }
  filterVendor(newId = null) {
    this.vendorList = [];
    let search = this.vendorFilterCtrl.value || '';
    let vendor_id = null;
		if(this.itemForm.get('vendor_id').value != "") {
			vendor_id = this.itemForm.get('vendor_id').value;
		}
    const quoteParam = {
      order_by: 'created_at',
      order_dir: 'desc',
      page: this.vendorsOffset,
      per_page: 20,
      search,
    };

    this.vendorService$.getList(quoteParam, vendor_id).subscribe(({ data, meta }) => {
      // this.vendorList = data;
      this.totalVendors.push(...data);
      this.vendorList = this.totalVendors;
      this.totalVendorsPages = meta.last_page

      this.filteredVendor = this.vendorList.slice(0);
      this.onVendorFilterChange(newId);
      this.refreshData();
      this.loadingVendors = false;
    });
  }
  filterVendorContact(newId = null) {
    this.vendorContactList = [];
    let search = this.vendorContactFilterCtrl.value || '';
    const quoteParam = {
      vendor_id: this.itemForm.value.vendor_id,
      order_by: 'created_at',
      order_dir: 'desc',
      page: 1,
      per_page: 100,
      search,
    };

    this.vendorService$.getListContacts(quoteParam).subscribe(({ data }) => {
      this.vendorContactList = data;
      this.filteredVendorContact = this.vendorContactList.slice(0);
      this.onVendorContactFilterChange(newId);
      this.refreshData();
    });
  }
  filterRequestApproval(newId = null) {
    this.requestApprovalList = [];
    let search = this.requestApprovalFilterCtrl.value || '';
    // const quoteParam = {
    //   order_by: 'created_at',
    //   order_dir: 'desc',
    //   page: this.dealApprovalOffset,
    //   per_page: 20,
    //   search,
    // };

    const portalUserParam = {
			roles: this.contactOnwerIds,
			search,
		};

    this.portalService$.getListByFilter(portalUserParam).subscribe(({ data, meta }) => {
      ///// Filter data based on role to show/////
      let filteredRoleData = data;
      this.requestApprovalList = filteredRoleData.filter(role => (role.roles[0]['name'] == 'superadmin' || role.roles[0]['name'] == 'admin' || role.roles[0]['name'] == 'administrative'));
      this.filteredRequestApproval = this.requestApprovalList.slice(0);
      this.onRequestApprovalFilterChange(newId);
    });
  }

  getTitle() {
    if (this.isEdit) {
      return `Purchase order ${this.purchaseOrder.id} Edit`;
    } else {
      return `Add Purchase order`;
    }
  }

  buildItemForm(item: any) {
    let formFields = {};
    if (this.isEdit) {
      this.vendorId = item.vendor_contact;
      formFields = {
        purchase_order_number: [item.id || ''],
        quote_id: [this.quoteData.quoteName || ''],
        vendor_id: [item.vendor_id || ''],
        vendor_contact_id: [item.vendor_contact_id || ''],
        description: [item.description || '', Validators.required],
        amount: [Number(item.amount).toFixed(2) || ''],
        request_approval_from: [item.request_approval_from || ''],
        category: [item.category || ''],
        payment_date: [item.payment_date || ''],
        approved: [item.approved || ''],
        wholesale_id: [this.quoteData.quoteName || ''],
      };
    }
    else {
      formFields = {
        purchase_order_number: [''],
        quote_id: [this.quoteData.quoteName, ''],
        vendor_id: [''],
        vendor_contact_id: [''],
        description: ['', Validators.required],
        amount: [''],
        request_approval_from: [''],
        category: [''],
        payment_date: [''],
        approved: [''],
        wholesale_id: [this.quoteData.quoteName, ''],
      };
    }

    this.itemForm = this.fb.group(formFields);
    // this.filterQuote();
    this.filterVendor();
    // this.filterVendorContact();
    this.filterRequestApproval();
  }

  getUserInfo() {
    this.authService$.getUserInfo().pipe(
      takeUntil(this.onDestroy$),
      map(result => result),
      catchError(err => {
        return of(err);
      })
    )
      .subscribe(result => {
        this.userProfile = result.data;
      });
  }

  transformKey(item) {
    item = item.replace(/_/g, ' ');
    return this.titleCasePipe.transform(item);
  }
  generateLogMsg(item) {
    if (item.kind == 'A') {
      if (item.item.kind == 'A') { }
      else if (item.item.kind == 'E') { }
      else if (item.item.kind == 'D') { }
      else if (item.kind == 'E') {
        if (item.lhs == "" || item.lhs == null) {
          if (item.path[0] == 'approved') {
            return `${'Approve added'}`;
          }
          else if (item.path[0] == 'quote_id') {
            let quoteName = this.filteredQuote.filter(i => i.id == item.rhs);
            if (quoteName.length > 0) {
              return `Quote added to ${quoteName[0].first_name}`;
            }
          }
          else if (item.path[0] == 'vendor_contact_id') {
            let vendorContactName = this.filteredVendorContact.filter(i => i.id == item.rhs);
            if (vendorContactName.length > 0) {
              return `Vendor Contact added to ${vendorContactName[0].name}`;
            }
          }
          else {
            return `${this.transformKey(item.path[0])} added to ${item.rhs}`;
          }
        }
        else {
          if (item.rhs == "") {
            return `${this.transformKey(item.path[0])} removed`;
          }
          else if (item.path[0] == 'vendor_id') {
            let vendorName = this.filteredVendor.filter(i => i.id == item.rhs);
            if (vendorName.length > 0) {
              return `Vendor updated to ${vendorName[0].name}`;
            }
          }
          else if (item.path[0] == 'vendor_contact_id') {
            let vendorContactName = this.filteredVendorContact.filter(i => i.id == item.rhs);
            if (vendorContactName.length > 0) {
              return `Vendor Contact updated to ${vendorContactName[0].name}`;
            }
          }
          else if (item.path[0] == 'request_approval_from') {
            let approverName = this.filteredRequestApproval.filter(i => i.id == item.rhs);
            if (approverName.length > 0) {
              return `Deal approval updated to ${approverName[0].first_name}`;
            }
          }
          else if (item.path[0] == 'approved') {
            return `updated to approved`;
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
    else if (item.kind == 'E') {
      if (item.lhs == "" || item.lhs == null) {
        if (item.path[0] == 'approved') {
          return `${'Approve added'}`;
        }
        else if (item.path[0] == 'quote_id') {
          let quoteName = this.filteredQuote.filter(i => i.id == item.rhs);
          if (quoteName.length > 0) {
            return `Quote added to ${quoteName[0].first_name}`;
          }
        }
        else if (item.path[0] == 'vendor_contact_id') {
          let vendorContactName = this.filteredVendorContact.filter(i => i.id == item.rhs);
          if (vendorContactName.length > 0) {
            return `Vendor Contact added to ${vendorContactName[0].name}`;
          }
        }
        else {
          return `${this.transformKey(item.path[0])} added to ${item.rhs}`;
        }
      }
      else {
        if (item.rhs == "") {
          return `${this.transformKey(item.path[0])} removed`;
        }
        else if (item.path[0] == 'vendor_id') {
          let vendorName = this.filteredVendor.filter(i => i.id == item.rhs);
          if (vendorName.length > 0) {
            return `Vendor updated to ${vendorName[0].name}`;
          }
        }
        else if (item.path[0] == 'vendor_contact_id') {
          let vendorContactName = this.filteredVendorContact.filter(i => i.id == item.rhs);
          if (vendorContactName.length > 0) {
            return `Vendor Contact updated to ${vendorContactName[0].name}`;
          }
        }
        else if (item.path[0] == 'request_approval_from') {
          let approverName = this.filteredRequestApproval.filter(i => i.id == item.rhs);
          if (approverName.length > 0) {
            return `Deal approval updated to ${approverName[0].first_name}`;
          }
        }
        else if (item.path[0] == 'approved') {
          return `updated to approved`;
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
    else if (item.kind == 'D') { return `${this.transformKey(item.path[0])} deleted`; }
    else {
      return `${this.transformKey(item.path[0])} added to ${item.rhs}`;
    }
  }

  saveHistoryLog(temp, quote) {
    let editedData = diff(temp, quote);
    if (editedData !== undefined) {
      const copyObj = {
        target_id: null,
        target_type: 'App\\Model\\PurchaseOrder',
        content: '',
        action: 'updated',
        portal_user_id: '',
        portal_user_name: '',
        category: 'portal'
      };
      copyObj.target_id = this.purchaseOrder.id;
      copyObj.portal_user_id = this.userProfile.id;
      copyObj.portal_user_name = this.userProfile.full_name;
      let logMsgArray = [];
      editedData.forEach(item => {
        logMsgArray.push(this.generateLogMsg(item));
      });
      copyObj.content = logMsgArray.join(', ');
      //Need to call create History APi
      this.createHistory(copyObj);
    }
  }
  createHistory(payload) {
    this.purchaseOrderService$
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
          this.dialogRef.close(this.dialogData);
          this.refreshData();
        }
      });
  }
  addNewVendor() {
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
      this.filterVendor(res.id);
      this.refreshData();
    });
  }

  addNewVendorContact() {
    const title = 'Add New Vendor Contact';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      VendorContactModalComponent,
      {
        width: '768px',
        disableClose: true,
        data: {
          title: title,
          payload: {
            vendorId: this.itemForm.value.vendor_id,
          },
          type: 'add',
        },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      }
      this.filterVendorContact(res.id);
      this.refreshData();
    });
  }

  updateOrder(order: PurchaseOrder, callback) {
    if (this.itemForm.valid) {
      this.purchaseOrderService$
        .update(this.orderId, order)
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
            const { data } = res;
            this.dialogData = data;
            const temp: PurchaseOrder = {
              quote_id: this.allData.quote_id,
              vendor_id: this.allData.vendor_id,
              vendor_contact_id: this.allData.vendor_contact_id,
              description: this.allData.description,
              amount: this.allData.amount,
              request_approval_from: this.allData.request_approval_from,
              category: this.allData.category,
              payment_date: this.allData.payment_date,
              approved: this.allData.approved,
              wholesale_id: this.allData.wholesale_id,
            }
            this.saveHistoryLog(temp, order);
            this.allData = this.itemForm.value;
            this.itemForm.markAsPristine();
            if (callback) {
              callback();
            }
            this.refreshData();
          }
        });
    }
  }

  createOrder(order: PurchaseOrder, callback) {
    if (this.itemForm.valid) {
      this.purchaseOrderService$
        .create(order)
        .pipe(
          takeUntil(this.onDestroy$),
          map(result => result),
          catchError(err => {
            return of(err);
          })
        )
        .subscribe(res => {
          this.saving = false;
          if (!res.error) {
            const { data } = res;
            this.dialogRef.close(data);
          }
        });
    }
  }
  submit(callback?: Function) {
    if (this.itemForm.valid) {
      this.saving = true;
      const payload: PurchaseOrder = {
        // purchase_order_number: this.itemForm.value.purchase_order_number,
        quote_id: this.quoteData.quoteId,
        vendor_id: this.itemForm.value.vendor_id != undefined ? this.itemForm.value.vendor_id : null ,
        vendor_contact_id: this.itemForm.value.vendor_contact_id,
        description: this.itemForm.value.description,
        amount: this.itemForm.value.amount,
        request_approval_from: this.itemForm.value.request_approval_from,
        category: this.itemForm.value.category,
        payment_date: this.itemForm.value.payment_date,
        approved: this.itemForm.value.approved,
        wholesale_id: this.quoteData.wholesale_id,
      };
      if (this.isEdit) {
        this.updateOrder(payload, callback);
      }
      else {
        this.createOrder(payload, callback)
      }
    }
  }
  refreshData() {
    this.changeDetectorRefs.detectChanges();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getNextBatchOfVendors(){
    this.loadingVendors = true;
    this.vendorsOffset = this.vendorsOffset + 1
    this.filterVendor();
  }
}
