import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ROLE_LIST } from 'app/core/constants';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { Dealer } from 'app/shared/models/dealer.model';
import { DealerService } from 'app/shared/services/apis/dealer.service';
import { AppState } from 'app/store';
import {
  dataSelector as authDataSelector,
  didFetchSelector as authDidFetchSelector,
} from 'app/store/auth/authentication.selector';
import { combineLatest, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-dealers-modal',
  templateUrl: './dealer-modal.component.html',
  styleUrls: ['./dealer-modal.component.scss'],
})
export class DealersModalComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public itemForm: FormGroup;
  public type: string;
  public dealer: Dealer;
  public saving: Boolean = false;
  public saveButtonLabel;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DealersModalComponent>,
    private fb: FormBuilder,
    private store$: Store<AppState>,
    private service$: DealerService
  ) {}
  ngOnInit() {
    this.type = this.data.type;
    this.dealer = this.data.payload;
    if (this.type === 'edit') {
      this.saveButtonLabel = 'SAVE';
    } else {
      this.saveButtonLabel = 'CREATE';
    }
    this.buildItemForm(this.dealer);
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
    if (this.itemForm.valid) {
      const phoneNumber = formatPhoneNumber(this.itemForm.value.phone);

      const payload: Dealer = {
        name: this.itemForm.value.name,
        street: this.itemForm.value.street,
        city: this.itemForm.value.city,
        state: this.itemForm.value.state,
        zip_code: this.itemForm.value.zip_code,
        phone: phoneNumber['number'],
        website: this.itemForm.value.website,
      };

      this.saving = true;
      if (this.type === 'edit') {
      } else {
        this.service$
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

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
