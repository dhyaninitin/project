import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgxRolesService } from 'ngx-permissions';


import { VendorContact, Vendors, VendorsState } from 'app/shared/models/vendors.model';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { VendorsService } from 'app/shared/services/apis/vendors.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/vendors/vendors.actions';
import { VendorsEditComponent } from '../edit/edit.component';
import { VendorContactModalComponent } from 'app/shared/components/vendor-contact-modal/vendor-contact-modal.component';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { STATE_LIST } from 'app/core/constants';
import { State, TablePagination } from 'app/shared/models/common.model';
import { User } from 'app/shared/models/user.model';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { Location } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { GlobalService } from 'app/shared/services/apis/global.service';

@Component({
  selector: 'app-vendors-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  animations: [
    fadeInUp400ms,
    fadeInRight400ms,
    stagger40ms
  ]
})
export class VendorsDetailComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  columnHeaders: Array<{}> = [
    { key: 'name', label: 'Name', visible: true},
    { key: 'email', label: 'Email', visible: true},
    { key: 'phone', label: 'Phone', visible: true},
    { key: 'created_at', label: 'Created At', visible: true},
    { key: 'updated_at', label: 'Updated At', visible: true},
    { key: 'actions', label: 'Actions', visible: true},
  ];

  dataSource: any;
  private onDestroy$ = new Subject<void>();

  public vendorId: string;
  public isReady: boolean;
  public vendor: Vendors;
  public vendorContacts: Array<VendorContact> = [];
  public stateList: Array<State> = STATE_LIST;
  public state;
  public param: any = {
    vendor_id: null,
    order_by: 'created_at',
    order_dir: 'desc',
    page: 1,
    per_page: 10,
  };
  public tablePagination: TablePagination = {
    length: 0,
    pageIndex: 0,
    pageSize: 20,
    previousPageIndex: 0,
  };
  public totalContacts;
  public isAllowUpdate: boolean = false;
  selectedRecordDetail: any;
  index: number = 0;
  public itemForm: FormGroup;
  saving: boolean = false;
  public filteredStates: Array<State> = [];
  public stateFilterCtrl: FormControl = new FormControl();

  isColumnAvailable: boolean = false;
  private readonly sectionName: string = 'filter_vendors_contact_page';
  timeout: any;

  constructor(
    private store$: Store<AppState>,
    private route$: ActivatedRoute,
    private loader$: AppLoaderService,
    private service$: VendorsService,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private confirmService$: AppConfirmService,
    private rolesService$: NgxRolesService,
    private location: Location,
    private fb: FormBuilder,
    private globalService$: GlobalService
  ) { 
    // To fetch column filters values
    this.getFilteredColumns();
  }

  ngOnDestroy() {
    // this.service$.isEdit = false;
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.route$.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.vendorId = params.get('id');
      this.param.vendor_id = this.vendorId
      this.initData();
    });
    this.dataSource = new MatTableDataSource();
    this.checkUpdateAccess();
  }

  onPaginateChange(event) {
    this.param.page = event.pageIndex + 1;
    this.param.per_page = event.pageSize;
    this.initData();
  }

  initData() {
    setTimeout(() => {
      this.loader$.open();
    }, 10);

    combineLatest(
      this.service$.getById(this.vendorId),
      this.service$.getListContacts(this.param)
    )
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(([result, contacts]) => {
        this.loader$.close();
        this.vendor = result.data;
        this.state = this.filteredState(result.data.state)[0].value;
        this.vendorContacts = contacts ? contacts['data'] : [];
        this.initTable();
        this.isReady = true;
        this.showEdit();
        // if(this.service$.isEdit && !this.saving) {
        //   this.initState();
        //   this.buildItemForm(this.vendor);
        // }

        // if(this.service$.isEdit && this.saving) {
        //   this.service$.isEdit = false;
        // }
        this.changeDetectorRefs.detectChanges();
      });
  }

  filteredState(key) {
    return this.stateList.filter(vendor => vendor.value == key);
  }

  initTable() {
    this.dataSource.data = this.vendorContacts;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  checkUpdateAccess() {
    const roles = this.rolesService$.getRoles();
    if (roles['administrative'] || roles['admin'] || roles['superadmin']) {
      this.isAllowUpdate = true;
    }
  }

  onAddContact() {
    const title = 'Add New Contact';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      VendorContactModalComponent,
      {
        width: '768px',
        disableClose: true,
        data: {
          title: title,
          payload: {
            vendorId: this.vendorId,
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
      this.store$.dispatch(new actions.ClearDetail());
      this.initData();
      // this.getContactList(this.param);
    });
  }

  onEditVendor() {
    const title = 'Edit Vendor';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      VendorsEditComponent,
      {
        width: '720px',
        disableClose: false,
        data: { title: title, payload: this.vendor, type: 'edit' },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      }
      this.vendor = res;
      this.state = this.filteredState(this.vendor.state)[0].value;
      this.changeDetectorRefs.detectChanges();
      this.store$.dispatch(new actions.UpdateSuccess(res));
    });
  }

  onEdit(item: VendorContact, index: number) {
    const title = 'Edit Contact';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      VendorContactModalComponent,
      {
        width: '768px',
        disableClose: true,
        data: {
          title: title,
          payload: {
            vendorId: this.vendorId,
            data: item,
          },
          type: 'edit',
        },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      }
      this.store$.dispatch(new actions.ClearDetail());
      this.initData();
    });
  }

  onDelete(item: VendorContact, index: number) {
    this.confirmService$
      .confirm({
        message: `Are you sure you want to delete Dealer Contact?`,
      })
      .subscribe(res => {
        if (res) {
          this.loader$.open();
          this.service$
            .deleteContact(item.id.toString())
            .pipe(
              takeUntil(this.onDestroy$),
              map(result => result),
              catchError(err => {
                this.loader$.close();
                throw err;
              })
            )
            .subscribe(res1 => {
              this.loader$.close();
              this.store$.dispatch(new actions.ClearDetail());
              if (res1) {
                this.vendorContacts.splice(index, 1);
                this.initData();
              }
            });
        }
      });
  }

  showEdit() {
    // this.service$.isEdit = true;
    this.buildItemForm(this.vendor);
    this.initState();
  }

  initState() {
    // load the initial state list
    this.filteredStates = this.stateList.slice(0);

    // listen for search field value changes
      this.stateFilterCtrl.valueChanges
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.filterState();
      });
  }

  filterState() {
    if (!this.stateList) {
      return;
    }
    // get the search keyword
    let search = this.stateFilterCtrl.value;
    if (!search) {
      this.filteredStates = this.stateList.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredStates =
      this.stateList.filter(state => state.value.toLowerCase().indexOf(search) > -1);
  }

  buildItemForm(item: Vendors) {
    const formFields = {
      name: [item.name || '', Validators.required],
      city: [item.city || ''],
      street_address: [item.street_address || ''],
      website: [item.website || ''],
      zip: [item.zip || ''],
      company_phone: [item.company_phone],
      state: [item.state || ''],
    };
    this.itemForm = this.fb.group(formFields);
  }

  submit() {
    if (this.itemForm.valid && !this.itemForm.pristine) {
      this.saving = true;
      const companyPhone = formatPhoneNumber(this.itemForm.value.company_phone);
      const payload: Vendors = {
        name: this.itemForm.value.name,
        city: this.itemForm.value.city,
        state: this.itemForm.value.state,
        zip: this.itemForm.value.zip,
        street_address: this.itemForm.value.street_address,
        website: this.itemForm.value.website,
        company_phone: companyPhone['nationalNumber']
      };
        const vendorId = this.vendor.id;
        this.service$.update(vendorId, payload).pipe(
            takeUntil(this.onDestroy$),
            map(result => result),
            catchError(err => {
              return of(err);
            })
          ).subscribe(res => {
            if (!res.error) {
              const { data } = res;
              this.store$.dispatch(new actions.UpdateSuccess(data));
              this.saving = false;
              this.initData();
            }
          });
    }
  }

  cancelEdit() {
    // this.service$.isEdit = false;
  }
  
  getSelectedRecord(item: any, index: number) {
    this.selectedRecordDetail = item;
    this.index = index;
  }

  getDisplayedColumns(): string[] {
    if(this.isColumnAvailable) {
      return this.columnHeaders.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
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
        this.changeDetectorRefs.detectChanges();
      } else {
        this.isColumnAvailable = true;
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
