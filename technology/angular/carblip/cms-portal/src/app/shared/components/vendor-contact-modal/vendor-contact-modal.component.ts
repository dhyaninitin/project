import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { NewVendorContact, VendorContact } from 'app/shared/models/vendors.model';
import { VendorsService } from 'app/shared/services/apis/vendors.service';
import { AppState } from 'app/store';
import { NgxRolesService } from 'ngx-permissions';
import { combineLatest, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-vendor-contact-modal',
  templateUrl: './vendor-contact-modal.component.html',
  styleUrls: ['./vendor-contact-modal.component.scss']
})
export class VendorContactModalComponent implements OnInit {
  private onDestroy$ = new Subject<void>();

  public itemForm: FormGroup;
  public vendorContact: VendorContact = {};
  public saving: Boolean = false;
  private vendorId;
  public saveButtonLabel;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<VendorContactModalComponent>,
    private fb: FormBuilder,
    private store$: Store<AppState>,
    private route$: ActivatedRoute,
    private rolesService$: NgxRolesService,
    private changeDetectorRefs: ChangeDetectorRef,
    private vendorService$: VendorsService,
    private snack$: MatSnackBar
  ) { }

  ngOnInit() {
    this.vendorId = this.data.payload.vendorId;
    if (this.data.type === 'edit') {
      this.saveButtonLabel = 'SAVE';
      this.vendorContact = this.data.payload.data;
      this.buildItemForm(this.vendorContact);
    }
    else {
      this.saveButtonLabel = 'CREATE';
      this.buildItemForm(this.vendorContact);
    }
  }

  buildItemForm(item: VendorContact) {
    const formFields = {
      name: [item.name || '', Validators.required],
      email: [item.email || '', [Validators.required, Validators.email]],
      phone: [item.phone || '', Validators.required],
    };
    this.itemForm = this.fb.group(formFields);
  }

  submit() {
    if (this.itemForm.valid) {
      const phoneNumber = formatPhoneNumber(this.itemForm.value.phone);
      if (this.data.type === 'add') {
        const param: VendorContact = {
          target_id: this.vendorId,
          ...this.itemForm.value,
          phone: phoneNumber['nationalNumber'],
        };
        this.saving = true;
        this.vendorService$
          .createContact(param)
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
      } else {
        const param: VendorContact = {
          ...this.itemForm.value,
          phone: phoneNumber['number'],
        };
        this.saving = true;
        this.vendorService$
          .updateContact(this.vendorContact.id, param)
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
