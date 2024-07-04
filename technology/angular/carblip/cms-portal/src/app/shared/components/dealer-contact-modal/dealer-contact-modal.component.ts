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
import * as deepEqual from 'deep-equal';

import { ROLE_LIST } from 'app/core/constants';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { getYearArray } from 'app/shared/helpers/utils';
import { Year } from 'app/shared/models/common.model';
import {
  DealerContact,
  NewDealerContact,
} from 'app/shared/models/dealer.model';
import { Brand, Model, Vehicle } from 'app/shared/models/vehicle.model';
import { DealerService } from 'app/shared/services/apis/dealer.service';
import { AppState } from 'app/store';
import { initialState as portalUserInitialState } from 'app/store/portalusers/portalusers.states';
import { NgxRolesService } from 'ngx-permissions';
import { combineLatest, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-dealer-contact-modal',
  templateUrl: './dealer-contact-modal.component.html',
  styleUrls: ['./dealer-contact-modal.component.scss'],
})
export class DealerContactModalComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public itemForm: FormGroup;
  public dealerContact: DealerContact = {};

  public saving: Boolean = false;
  private dealerId: number;
  private dealerContactId: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DealerContactModalComponent>,
    private fb: FormBuilder,
    private store$: Store<AppState>,
    private route$: ActivatedRoute,
    private rolesService$: NgxRolesService,
    private changeDetectorRefs: ChangeDetectorRef,
    private dealerService$: DealerService,
    private snack$: MatSnackBar
  ) {}

  ngOnInit() {
    this.dealerId = this.data.payload.dealerId;
    if (this.data.type === 'edit') {
      this.dealerContact = this.data.payload.data;
    }
    this.buildItemForm();
  }

  buildItemForm() {
    const { name, title, email, phone } = this.dealerContact;
    const phoneNumber = formatPhoneNumber(phone);
    const currentYear = new Date().getFullYear();
    const formFields = {
      name: [name || '', Validators.required],
      title: [title || ''],
      email: [email || '', Validators.required],
      phone: [phoneNumber['nationalNumber'] || '', Validators.required],
    };
    this.itemForm = this.fb.group(formFields);
  }

  submit() {
    if (this.itemForm.valid) {
      const phoneNumber = formatPhoneNumber(this.itemForm.value.phone);

      if (this.data.type === 'add') {
        const param: NewDealerContact = {
          dealer_id: this.dealerId,
          ...this.itemForm.value,
          phone: phoneNumber['number'],
        };
        this.saving = true;
        this.dealerService$
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
        const param: DealerContact = {
          ...this.itemForm.value,
          phone: phoneNumber['number'],
        };
        this.saving = true;
        this.dealerService$
          .updateContact(this.dealerContact.id, param)
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

  onModelFilterChange(val) {}

  refreshData() {
    this.changeDetectorRefs.detectChanges();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
