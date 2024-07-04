import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxRolesService } from 'ngx-permissions';
import { combineLatest, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';

import { ROLE_LIST } from 'app/core/constants';
import { filterPortalUsersBasedOnLocation, formatPhoneNumber } from 'app/shared/helpers/utils';
import { PortalUser } from 'app/shared/models/portaluser.model';
import { Profile } from 'app/shared/models/user.model';
import { UpdateUser, User } from 'app/shared/models/user.model';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';
import { UserService } from 'app/shared/services/apis/users.service';
import { AppState } from 'app/store';
import {
  dataSelector as authDataSelector,
  didFetchSelector as authDidFetchSelector,
} from 'app/store/auth/authentication.selector';
import { GetList as portalUsersGetList } from 'app/store/portalusers/portalusers.actions';
import { didFetchSelector as portalUserDidFetch } from 'app/store/portalusers/portalusers.selectors';
import { initialState as portalUserInitialState } from 'app/store/portalusers/portalusers.states';

import * as logActions from 'app/store/userlogs/userlogs.actions';
import { initialState as initialLogState } from 'app/store/userlogs/userlogs.states';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-users-table-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss'],
  animations: [fadeInUp400ms, stagger40ms],
})
export class UsersEditModalComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public itemForm: FormGroup;
  public isActive: boolean;
  public type: string;
  public portalUsers: Array<PortalUser> = [];
  public portalUserFilterCtrl: FormControl = new FormControl();
  public filteredPortalUsers: Array<PortalUser> = [];
  public userProfile: Profile;
  public salespersonId: Number;
  public saving: Boolean = false;
  public saveButtonLabel;
  public contactOnwerIds: Array<Number>;
  public showCarsdirectFields:Boolean = false;
  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  phoneRegex = /^\d{3}[- ]?\d{3}[- ]?\d{4}$/;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UsersEditModalComponent>,
    public changeDetectorRefs: ChangeDetectorRef,
    private fb: FormBuilder,
    private store$: Store<AppState>,
    private rolesService$: NgxRolesService,
    private service$: UserService,
    private portalUserServicer$: PortalUserService,
    private snack$: MatSnackBar
  ) {
    const contactOwnerRoles = ROLE_LIST.filter(
      item => item.name === 'salesperson' || item.name === 'concierge' || item.name === 'manager'
    );
    this.contactOnwerIds = contactOwnerRoles.map(item => item.id);
  }
  ngOnInit() {
    this.type = this.data.type;
    if (this.type === 'edit') {
      this.showCarsdirectFields=true;
      this.isActive = this.data.payload.is_active;
      this.saveButtonLabel = 'SAVE';
    } else {
      this.showCarsdirectFields=false;
      this.saveButtonLabel = 'CREATE';
      this.isActive = true;
    }
    this.buildItemForm(this.data.payload);

    this.store$
      .select(portalUserDidFetch)
      .pipe(
        takeUntil(this.onDestroy$),
        tap(
          didFetch =>
            !didFetch &&
            this.store$.dispatch(
              new portalUsersGetList(portalUserInitialState.filter)
            )
        )
      )
      .subscribe();

    this.store$
      .select(authDataSelector)
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(profile => {
        if (profile) {
          this.userProfile = profile;
          this.buildItemForm(this.data.payload);
        }
      });

    // listen for search field value changes
    this.portalUserFilterCtrl.valueChanges
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.filterPortalUsers();
      });

    this.initPortalUsers();
  }

  initPortalUsers() {
    this.store$.select(authDataSelector).pipe(
      debounceTime(10),
      takeUntil(this.onDestroy$)).subscribe(profile => {
        if (profile) {
          let search = this.portalUserFilterCtrl.value || '';
          this.userProfile = profile;
          if(this.userProfile.roles[0].id == 5 || this.userProfile.roles[0].id == 6) {
            this.contactOnwerIds = [this.userProfile.roles[0].id]
            search = this.userProfile.email
          }
          this.portalUsers = [];
          // get the search keyword
          
          const portalUserParam = {
            roles: this.contactOnwerIds,
            search,
          };
      
          this.portalUserServicer$
            .getListByFilter(portalUserParam)
            .subscribe(({ data }) => {
              this.portalUsers = data;
              this.portalUsers = this.portalUsers.filter((portalUser:any) => {
                return portalUser.is_active == 1
              })
              this.filteredPortalUsers = this.portalUsers.slice(0);
              if(this.userProfile.roles[0].id == 5 || this.userProfile.roles[0].id == 6) {
                if (this.type !== 'edit')  {
                  this.itemForm.get('contact_owner_email').setValue(this.userProfile.email); 
                }
              } else if (this.userProfile.roles[0].id == 4) {
                if (this.type !== 'edit')  {
                  this.itemForm.get('contact_owner_email').setValue(this.userProfile.email); 
                }
                let profile : any = this.userProfile;
                this.portalUsers = this.portalUsers.filter((portalUser:any) => {
                  if(filterPortalUsersBasedOnLocation(portalUser.location, profile.location)) {
                    return portalUser;
                  }
                  // return portalUser.location_id == profile.location_id
                })
                this.filteredPortalUsers = this.portalUsers.slice(0);
              }
              this.refreshData();
            });
          }
      });
    // filter the makes
    }

  /** Filter Portal Users
   * @param
   * @return
   **/

  filterPortalUsers() {
    if (!this.portalUsers) {
      return;
    }
    // get the search keyword
    let search = this.portalUserFilterCtrl.value;
    if (!search) {
      this.filteredPortalUsers = this.portalUsers.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter
    this.filteredPortalUsers = this.portalUsers.filter(item => {
      const fullname = item.full_name.toLowerCase();
      const email = item.email.toLowerCase();
      const searchLowerCase = search.toLowerCase();
      return fullname.indexOf(searchLowerCase) > -1 || email.indexOf(searchLowerCase) > -1;
    });
  }

  buildItemForm(item: User) {
    const phoneNumber = formatPhoneNumber(item.phone);
    const formFields = {
      first_name: [item.first_name || '', Validators.required],
      last_name: [item.last_name || ''],
      phone: [phoneNumber['nationalNumber'], Validators.required],
      email_address: [item.email_address || '', Validators.required],
      contact_owner_email: [
        item.contact_owner_email || '',
        Validators.required,
      ],
      phone_preferred_contact: [item.phone_preferred_contact || ''],
      phone_preferred_time: [item.phone_preferred_time || ''],
      phone_preferred_type: [item.phone_preferred_type || ''],
      street_address: [item.street_address || ''],
      city: [item.city || ''],
      state: [item.state || ''],
      zip: [item.zip || ''],
      type: [item.type || ''],
      concierge_state: [item.concierge_state || ''],
      over18: [item.over18 || ''],
      secondary_emails: [item.secondary_emails || [], Validators.pattern(this.emailRegex)],
      secondary_phone: [item.secondary_phone || [], Validators.pattern(this.phoneRegex)],
    };
    this.itemForm = this.fb.group(formFields);
  }

  getFullName(item: PortalUser) {
    return item.full_name;
  }

  submit() {
    if (this.itemForm.valid) {
      this.saving = true;

      const phoneNumber = formatPhoneNumber(this.itemForm.value.phone);

      const payload: User = {
        first_name: this.itemForm.value.first_name,
        last_name: this.itemForm.value.last_name,
        phone: phoneNumber['number'],
        email_address: this.itemForm.value.email_address,
        contact_owner_email: this.itemForm.value.contact_owner_email,
        phone_preferred_contact:this.itemForm.value.phone_preferred_contact,
        phone_preferred_time: this.itemForm.value.phone_preferred_time,
        phone_preferred_type: this.itemForm.value.phone_preferred_type,
        street_address: this.itemForm.value.street_address,
        city: this.itemForm.value.city,
        state:this.itemForm.value.state,
        zip: this.itemForm.value.zip,
        type: this.itemForm.value.type,
        concierge_state: this.itemForm.value.concierge_state,
        over18: this.itemForm.value.over18,
        secondary_emails: this.itemForm.value.secondary_emails,
        secondary_phone: this.itemForm.value.secondary_phone,
      };
      if (this.type === 'edit') {
      } else {
        payload.source = 3;
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
              this.snack$.open('Contact Added!', 'OK', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: ['snack-success'],
              });
              this.store$.dispatch(new logActions.GetList(initialLogState.filter));
              this.dialogRef.close(data);
            }
          });
      }
    }
  }

  isSalsPerson() {
    const roles = this.rolesService$.getRoles();
    return roles['salesperson'];
  }

  refreshData() {
    this.changeDetectorRefs.detectChanges();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  addSecondaryEmail(event: MatChipInputEvent): void {
    if (this.emailRegex.test(event.value)) {
      const primaryEmail = [this.itemForm.value.email_address];
      const secondaryEmails = this.itemForm.value.secondary_emails;
        if (!secondaryEmails.includes(event.value) && !primaryEmail.includes(event.value)) {
          const payload:any = {
            email: event.value,
          };
          this.service$.checkContactSecondaryEmail(payload).pipe(
            debounceTime(10),
            takeUntil(this.onDestroy$)
          ).subscribe(response=> {
            if(response) {
              if(response.data) {
                this.itemForm.controls['secondary_emails'].setErrors({ 'duplicate': true });
                this.changeDetectorRefs.detectChanges();
              } else {
                secondaryEmails.push(event.value);
                this.itemForm.patchValue({
                  secondary_emails: secondaryEmails
                });
                event.chipInput!.clear();
                this.itemForm.controls['secondary_emails'].setErrors(null);
              }
            }
            this.changeDetectorRefs.detectChanges();
          });
        }else{
          this.itemForm.controls['secondary_emails'].setErrors({'duplicate': true});
        }
    } else {
      this.itemForm.controls['secondary_emails'].setErrors({'incorrect': true});
    }
  }

  removeChipValue(value:string): void {
    const secondaryEmails = this.itemForm.value.secondary_emails;
    const index = secondaryEmails.indexOf(value);
    if(index >= 0){
      secondaryEmails.splice(index, 1);
    }
    this.itemForm.patchValue({
      secondary_emails: secondaryEmails
    });
  } 

  addSecondaryPhone(event: MatChipInputEvent): void {
    if (this.phoneRegex.test(event.value)) {
      const secondaryPhones = this.itemForm.value.secondary_phone.map(phone => {
        const formattedPhoneNumber = formatPhoneNumber(phone);
        return formattedPhoneNumber['nationalNumber'];
      });
      const primaryPhoneNumber = [formatPhoneNumber(this.itemForm.value.phone)['number']];

      const phoneNumber = formatPhoneNumber(event.value);
        if (!secondaryPhones.includes(phoneNumber['number']) && !primaryPhoneNumber.includes(phoneNumber['number'])) {
          const payload: {phone_number: string} = {
            phone_number: phoneNumber['number'],
          };
          this.service$.checkContactSecondaryPhoneNumber(payload).pipe(
            debounceTime(10),
            takeUntil(this.onDestroy$)
          ).subscribe(response=> {
            if(response) {
              if(response.data) {
                this.itemForm.controls['secondary_phone'].setErrors({ 'duplicate': true });
                this.changeDetectorRefs.detectChanges();
              } else {
                secondaryPhones.push(event.value);
                this.itemForm.patchValue({
                  secondary_phone: secondaryPhones
                });
                event.chipInput!.clear();
                this.itemForm.controls['secondary_phone'].setErrors(null);
              }
            }
            this.changeDetectorRefs.detectChanges();
          });
        }else{
          this.itemForm.controls['secondary_phone'].setErrors({'duplicate': true});
        }
    } else {
      this.itemForm.controls['secondary_phone'].setErrors({'incorrect': true});
    }
  }

  removePhoneChipValue(value:string): void {
    const secondaryPhones = this.itemForm.value.secondary_phone;
    const index = secondaryPhones.indexOf(value);
    if(index >= 0){
      secondaryPhones.splice(index, 1);
    }
    this.itemForm.patchValue({
      secondary_phone: secondaryPhones
    });
  } 

  checkErrorforEmailIsValid(event: MatChipInputEvent){
    if(event.value == undefined){
      this.itemForm.controls['secondary_emails'].setErrors(null);
    }else{
      this.itemForm.controls['secondary_emails'].setErrors({'incorrect': true});
    }
  }

  checkErrorforPhoneIsValid(event: MatChipInputEvent){
    if(event.value == undefined){
      this.itemForm.controls['secondary_phone'].setErrors(null);
    }else{
      this.itemForm.controls['secondary_phone'].setErrors({'incorrect': true});
    }
  }
}
