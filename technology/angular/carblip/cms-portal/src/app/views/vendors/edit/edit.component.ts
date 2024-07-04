import { Component, OnInit, ChangeDetectorRef, Inject, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {  Store } from '@ngrx/store';
import { combineLatest, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';

import { AppState } from 'app/store';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { VendorsService } from 'app/shared/services/apis/vendors.service';
import { Vendors, VendorsState } from 'app/shared/models/vendors.model';
import { STATE_LIST } from 'app/core/constants';
import { State } from 'app/shared/models/common.model';

@Component({
  selector: 'app-vendors-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class VendorsEditComponent implements OnInit {
  private onDestroy$ = new Subject<void>();

  public itemForm: FormGroup;
  public stateFilterCtrl: FormControl = new FormControl();
  public filteredState: Array<State> = [];
  public stateList: Array<State> = STATE_LIST;
  public type: string;
  public isActive: boolean;
  public saveButtonLabel;
  public saving: Boolean = false;
  public vendor: Vendors;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<VendorsEditComponent>,
    private changeDetectorRefs: ChangeDetectorRef,
    private fb: FormBuilder,
    private store$: Store<AppState>,
    private vendorService$: VendorsService,
  ) { }

  ngOnInit() {
    this.type = this.data.type;
    this.vendor = this.data.payload
    if (this.type === 'edit') {
      this.saveButtonLabel = 'SAVE';
    } else {
      this.saveButtonLabel = 'CREATE';
    }
    this.buildItemForm(this.vendor);

    // load the initial state list
    this.filteredState = this.stateList.slice(0);

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
      this.filteredState = this.stateList.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredState =
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
    if (this.itemForm.valid) {
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
      if (this.type === 'edit') {
      }
      else {
        this.vendorService$
          .create(payload)
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
  }
  refreshData() {
    this.changeDetectorRefs.detectChanges();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
