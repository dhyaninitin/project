import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';

import { egretAnimations } from 'app/shared/animations/egret-animations';
import { DealerContactModalComponent } from 'app/shared/components/dealer-contact-modal/dealer-contact-modal.component';
import { DealersModalComponent } from 'app/shared/components/dealer-modal/dealer-modal.component';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { getBoolColor, getUserFullName } from 'app/shared/helpers/utils';
import * as commonModels from 'app/shared/models/common.model';
import {
  Dealer,
  DealerContact,
  DealerResponse,
} from 'app/shared/models/dealer.model';
import { Log, LogResponse } from 'app/shared/models/log.model';
import { DealerService } from 'app/shared/services/apis/dealer.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/dealers/dealers.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/dealers/dealers.selectors';
import { initialState } from 'app/store/dealers/dealers.states';
import { NgxRolesService } from 'ngx-permissions';
import { Location } from '@angular/common';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { scaleIn400ms } from '@vex/animations/scale-in.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalService } from 'app/shared/services/apis/global.service';

@Component({
  selector: 'app-dealers-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.style.scss'],
  animations: [
    fadeInUp400ms,
    fadeInRight400ms,
    scaleIn400ms,
    stagger40ms
  ]
})
export class DealersDetailComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private onDestroy$ = new Subject<void>();

  public dealerId: string;
  public isReady: boolean;
  public dealer: Dealer;

  public getBoolColor = getBoolColor;

  columnHeaders: Array<{}> = [
    { key: 'name', label: 'Name', visible: true},
    { key: 'title', label: 'Title', visible: true},
    { key: 'email', label: 'Email', visible: true},
    { key: 'phone', label: 'Phone', visible: true},
    { key: 'created_at', label: 'Created At', visible: true},
    { key: 'updated_at', label: 'Updated At', visible: true},
    { key: 'actions', label: 'Actions', visible: true},
  ];

  dataSource: any;

  public contacts: Array<DealerContact>;
  selectedRecordDetail: any;
  index: number = 0;

  public itemForm: FormGroup;
  saving: boolean = false;

  isColumnAvailable: boolean = false;
  private readonly sectionName: string = 'filter_dealers_contact_page';
  timeout: any;

  constructor(
    private store$: Store<AppState>,
    private route$: ActivatedRoute,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private loader$: AppLoaderService,
    private confirmService$: AppConfirmService,
    private service$: DealerService,
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
    this.isReady = false;
    this.route$.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.dealerId = params.get('id');
      this.initData();
    });

    this.dataSource = new MatTableDataSource();
  }

  initData() {
    setTimeout(() => {
      this.loader$.open();
    }, 10);

    combineLatest(this.service$.getById(this.dealerId))
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(([result]) => {
        this.loader$.close();
        this.dealer = result.data;
        this.contacts = this.dealer ? this.dealer['contacts'] : [];
        this.initTable();
        this.isReady = true;
        
        this.showEdit();

        this.changeDetectorRefs.detectChanges();
      });
  }

  initTable() {
    this.dataSource.data = this.contacts;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onAddContact() {
    const title = 'Add New Contact';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      DealerContactModalComponent,
      {
        width: '768px',
        disableClose: true,
        data: {
          title: title,
          payload: {
            dealerId: this.dealerId,
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
    });
  }

  onEditDealer() {
    const title = 'Edit Dealer';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      DealersModalComponent,
      {
        width: '720px',
        disableClose: false,
        data: { title: title, payload: this.dealer, type: 'edit' },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      }
      this.dealer = res;
      this.changeDetectorRefs.detectChanges();
      this.store$.dispatch(new actions.UpdateSuccess(res));
    });
  }

  onEdit(item: DealerContact, index: number) {
    const title = 'Edit Contact';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      DealerContactModalComponent,
      {
        width: '768px',
        disableClose: true,
        data: {
          title: title,
          payload: {
            dealerId: this.dealerId,
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

  onDelete(item: DealerContact, index: number) {
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
                this.contacts.splice(index, 1);
                this.initTable();
              }
            });
        }
      });
  }

  buildItemForm(item: Dealer) {
    const phoneNumber = formatPhoneNumber(item.phone);
    const formFields = {
      name: [item.name || '', Validators.required],
      street: [item.street || ''],
      city: [item.city || ''],
      state: [item.state || ''],
      zip_code: [item.zip_code || ''],
      phone: [phoneNumber['nationalNumber'], Validators.required],
      website: [item.website || ''],
    };
    this.itemForm = this.fb.group(formFields);
  }

  submit() {
    if (this.itemForm.valid && !this.itemForm.pristine) {
      const phoneNumber = formatPhoneNumber(this.itemForm.value.phone);
      this.saving = true;
      const payload: Dealer = {
        name: this.itemForm.value.name,
        street: this.itemForm.value.street,
        city: this.itemForm.value.city,
        state: this.itemForm.value.state,
        zip_code: this.itemForm.value.zip_code,
        phone: phoneNumber['number'],
        website: this.itemForm.value.website,
      };

     
        this.service$
          .update(this.dealer.id, payload)
          .pipe(
            takeUntil(this.onDestroy$),
            map(result => result),
            catchError(err => {
              return of(err);
            })
          )
          .subscribe(res => {
            if (!res.error) {
              const { data } = res;
              this.dealer = data;
              this.changeDetectorRefs.detectChanges();
              this.store$.dispatch(new actions.UpdateSuccess(data));
              this.saving = false;
              this.initData();
            }
          });
    }
  }

  showEdit() {
    // this.service$.isEdit = true;
    this.buildItemForm(this.dealer);
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
