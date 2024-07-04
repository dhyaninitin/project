import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';

import { Location, UpdateLocation } from 'app/shared/models/location.model';
import { LocationService } from 'app/shared/services/apis/locations.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-locations-table-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss'],
})
export class LocationsEditModalComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  public itemForm: FormGroup;
  public type: string;
  public saving: Boolean = false;
  public saveButtonLabel;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<LocationsEditModalComponent>,
    private fb: FormBuilder,
    private service$: LocationService,
    private snack$: MatSnackBar
  ) {}
  ngOnInit() {
    this.type = this.data.type;
    if (this.type === 'edit') {
      this.saveButtonLabel = 'SAVE';
    } else {
      this.saveButtonLabel = 'CREATE';
    }
    this.buildItemForm(this.data.payload);
  }
  buildItemForm(item: Location) {
    const formFields = {
      name: [item.name || '', Validators.required],
      street_address: [item.street_address || '', Validators.required],
      city: [item.city, Validators.required],
      state: [item.state || '', Validators.required],
      zip_code: [item.zip_code || '', Validators.required],
    };
    this.itemForm = this.fb.group(formFields);
  }

  submit() {
    if (this.itemForm.valid) {
      this.saving = true;

      const payload: UpdateLocation = {
        name: this.itemForm.value.name,
        street_address: this.itemForm.value.street_address,
        city: this.itemForm.value.city,
        state: this.itemForm.value.state,
        zip_code: this.itemForm.value.zip_code,
      };

      if (this.type === 'edit') {
        const locationId = this.data.payload.id;

        this.service$
          .update(locationId, payload)
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
              this.snack$.open('Location successfully edited!', 'OK', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: ['snack-success'],
              });
              this.dialogRef.close(data);
            }
          });
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
              this.snack$.open('Location successfully added!', 'OK', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: ['snack-success'],
              });
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
