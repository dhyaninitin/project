import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';

import { egretAnimations } from 'app/shared/animations/egret-animations';
import { collapseSection, expandSection, filterPortalUsersBasedOnLocation, formatLogMessage, formatPhoneNumber, getBoolColor } from 'app/shared/helpers/utils';
import { Log } from 'app/shared/models/log.model';
import { Request } from 'app/shared/models/request.model';
import { User } from 'app/shared/models/user.model';
import { Profile } from 'app/shared/models/user.model';
import { RequestService } from 'app/shared/services/apis/requests.service';
import { UserService } from 'app/shared/services/apis/users.service';
import { VehicleService } from 'app/shared/services/apis/vehicle.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/users/users.actions';
import { dataSelector as profileDataSelector } from 'app/store/auth/authentication.selector';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/users/users.selectors';
import { initialState as initialLogState } from 'app/store/users/users.states';
import { initialState as initialReqState } from 'app/store/requests/requests.states';
import { NgxRolesService } from 'ngx-permissions';
import { UsersRequestModalComponent } from './request-modal/request-modal.component';
import { WholesaleQuote } from 'app/shared/models/wholesale-quote.model';
import { WholesaleQuoteService } from 'app/shared/services/apis/wholesale-quote.service';
import * as wholesaleactions from 'app/store/wholesale-quote/wholesale-quote.actions';
import { UsersEditModalComponent } from '../table/edit-modal/edit-modal.component';
import { TablePagination } from 'app/shared/models/common.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { scaleIn400ms } from '@vex/animations/scale-in.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { Location } from '@angular/common';
import {
  dataSelector as authDataSelector,
  didFetchSelector as authDidFetchSelector,
} from 'app/store/auth/authentication.selector';
import { PortalUser } from 'app/shared/models/portaluser.model';
import { ROLE_LIST } from 'app/core/constants';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';
import * as logActions from 'app/store/userlogs/userlogs.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-users-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.style.scss'],
  animations: [
    fadeInUp400ms,
    fadeInRight400ms,
    scaleIn400ms,
    stagger40ms
  ]
})
export class UsersDetailComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('secondaryEmailsMenu', { read: MatMenuTrigger, static: false}) SecondaryEmailsMenu: MatMenuTrigger;
  @ViewChild('secondaryphonesMenu', { read: MatMenuTrigger, static: false}) SecondaryPhoneMenu: MatMenuTrigger;
  public itemForm: FormGroup;

  columnHeaders: string[] = [
    'srNo',
    'year',
    'brand',
    'model',
    'trim',
    'contact_owner',
    'referral_code',
    'source',
    'created_at',
    'actions',
  ];

  gender: Array<{}> = [
    { value: 'M', title: 'Male' },
    { value: 'F', title: 'Female' },
  ];

  columnHeadersWholesale: string[] = [
    'id',
    'wholesale_stock_no',
    'client_name',
    'year',
    'make',
    'model',
    'created_at',
    'updated_at',
    'actions',
  ];

  private onDestroy$ = new Subject<void>();

  public getBoolColor = getBoolColor;

  public userId: string;
  public isReady: boolean;
  public user: User;
  public logs: Array<Log>;
  public requests: Array<Request>;
  public quotes: Array<Request>;
  public wholesaleQuotes: Array<WholesaleQuote> = [];
  public didFetch$: Observable<any>;
  offset = 1;
  public userProfile: Profile;
  public logPagination: TablePagination = {
    length: initialLogState.meta.total,
    pageIndex: initialLogState.filter.page,
    pageSize: initialLogState.filter.per_page,
    previousPageIndex: 0,
  };
 
  public showDatalastPage: boolean = true;
  public LogParam: any = {
		order_by: 'created_at',
		order_dir: 'desc',
		page: 1,
		per_page: 10,
	};

  layoutCtrl = new FormControl('fullwidth');
  public portalUserFilterCtrl: FormControl = new FormControl();
  public filteredPortalUsers: Array<PortalUser> = [];
  public portalUsers: Array<PortalUser> = [];
  public contactOnwerIds: Array<Number>;
  saving: boolean = false;
  showEmailSection: boolean = false;
  public formatLogMessage = formatLogMessage;
  secondaryEmailMenuClosed: boolean = false;
  secondaryPhoneMenuClosed: boolean = false;
  
  constructor(
    private store$: Store<AppState>,
    private route$: ActivatedRoute,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private loader$: AppLoaderService,
    private confirmService$: AppConfirmService,
    private service$: UserService,
    private vehicleService$: VehicleService,
    private rolesService$: NgxRolesService,
    private requestService$: RequestService,
    private wholesaleService$: WholesaleQuoteService,
    private router$: Router,
    public location: Location,
    private fb: FormBuilder,
    private portalUserServicer$: PortalUserService,
    private snack$: MatSnackBar
  ) {
    this.didFetch$ = this.store$.select(didFetchSelector);
    const contactOwnerRoles = ROLE_LIST.filter(
      item => item.name === 'salesperson' || item.name === 'concierge' || item.name === 'manager'
    );
    this.contactOnwerIds = contactOwnerRoles.map(item => item.id);
  }

  ngOnDestroy() {
    // this.service$.isEdit = false;
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.isReady = false;
    this.route$.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.userId = params.get('id');
      this.initData();
    });

    this.store$
      .select(profileDataSelector)
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap((profile: Profile) => {
          this.userProfile = profile;
        })
      )
      .subscribe();
    this.loader$.close();
  }
  
  onLogPaginateChange(event) {
		this.showDatalastPage = !this.paginator.hasNextPage();
		this.LogParam.page = event.pageIndex + 1;
		this.LogParam.per_page = event.pageSize;
		/* if not use then comment this line */
		this.logPaginationData(this.LogParam);
		/* if not use then comment this line */
	} 


  logPaginationData(event) {
    setTimeout(() => {
      this.loader$.open();
    }, 10);

    combineLatest(
      this.service$.getLogsByUserId(this.userId,event)
    )
    .pipe(
      takeUntil(this.onDestroy$),
      map(result => result),
      catchError(err => {
        return of(err);
      })
    )
    .subscribe(([logResonse]) => {
      setTimeout(() => {
        this.loader$.close();
      }, 15);
      this.initLogMeta(logResonse.meta);

      this.logs = logResonse.data;
      this.isReady = true;
      this.changeDetectorRefs.detectChanges();
    });
  }
  
  

  initData() {
    setTimeout(() => {
      this.loader$.open();
    }, 10);

    combineLatest(
      this.service$.getById(this.userId),
      this.service$.getLogsById(this.userId),
    )
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(([result, logResonse]) => {
        setTimeout(() => {
          this.loader$.close();
        }, 15);
        if(result.data.length == 0) {
          this.snack$.open("This action is unauthorized", 'OK', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snack-warning'],
          });
          this.router$.navigateByUrl('/contacts');
          return;
        }
        this.user = result.data;
        this.logs = logResonse.data;
        this.initLogMeta(logResonse.meta);

        this.isReady = true;
        this.showEdit();
        this.buildItemForm(this.user);
        this.changeDetectorRefs.detectChanges();
      });
  }

  initLogMeta(meta) {
    this.logPagination.length = meta.total;
    this.logPagination.pageIndex = meta.current_page - 1;
    this.logPagination.pageSize = meta.per_page;
  }

  indirectShowDeleteButton() {
    const roles = this.rolesService$.getRoles();
    if (roles['admin'] || roles['superadmin']) {
      return true;
    } else {
      return false;
    }
  }

  indirectShowEditButton() {
    const roles = this.rolesService$.getRoles();
    // if (!roles['salesperson'] || this.user.contact_owner_email == this.userProfile.email) {
    //   return true;
    // }
    // else {
    //   return false;
    // }
    return true;
  }

  indirectDeleteDialogBox() {
    this.confirmService$
      .confirm({
        message: `Are you sure you wish to delete this contact '${this.user.first_name
          }'? This is permanent and cannot be undone.`,
      })
      .subscribe(res => {
        if (res) {
          const payload = {
            id: this.user.id,
          };
          this.store$.dispatch(new actions.Delete(payload));
          this.router$.navigate(['/contacts'])
        }
      });
  }

  indirectEditDialogBox() {
    const title = 'Edit Contact';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      UsersEditModalComponent,
      {
        width: '720px',
        disableClose: false,
        data: { title: title, payload: this.user, type: 'edit' },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      }

      this.store$.dispatch(new actions.UpdateSuccess(res));
      this.initData();
    });
  }

  buildItemForm(item: User) {
    const phoneNumber = formatPhoneNumber(item.phone || '');
    const concatenatedEmails = item.secondary_emails.map(emailObj => emailObj.email).join(', ');
    const concatenatedPhones = item.secondary_phone.map(phoneObj => phoneObj.phone).join(', ');

    const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
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
      over18: [item.over18 || null],
      linkedin_profile: [item.linkedin_profile, Validators.pattern(urlRegex)],
      concierge_source: [item.concierge_source || ''],
      interview_scheduled: [item.interview_scheduled || ''],
      sales_license_status: [item.sales_license_status || ''],
      sales_license: [item.sales_license || ''],
      intake_questionaire_1: [item.intake_questionaire_1 || ''],
      intake_questionaire_2: [item.intake_questionaire_2 || ''],
      intake_questionaire_3: [item.intake_questionaire_3 || ''],
      w2_sgned_date: [item.w2_sgned_date || ''],
      onboarded_date: [item.onboarded_date || ''],
      works_at_dealership: [item.works_at_dealership || ''],
      physical_sales_license_received: [item.physical_sales_license_received || ''],
      concierge_referral_url: [item.concierge_referral_url || ''],
      close_date: [item.close_date || ''],
      opted_out_email_important_update: [item.opted_out_email_important_update || false],
      opted_out_email_marketing_information: [item.opted_out_email_marketing_information || false],
      opted_out_email_one_to_one: [item.opted_out_email_one_to_one || false],

      fico_score: [item.fico_score || ''],
      hhi: [item.hhi || ''],
      sex: [item.sex || ''],
      secondary_emails: [concatenatedEmails || ''],
      secondary_phone: [concatenatedPhones || ''],
    };
    this.itemForm = this.fb.group(formFields);
  }

  showEdit() {
    // this.service$.isEdit = true;
    // listen for search field value changes
    this.portalUserFilterCtrl.valueChanges
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.filterPortalUsers();
      });

    this.initPortalUsers();
    // this.buildItemForm(this.user);
  }

  cancelEdit() {
    // this.service$.isEdit = false;
  }

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
    // filter the banks
    this.filteredPortalUsers = this.portalUsers.filter(item => {
      const fullname = item.full_name.toLowerCase();
      const email = item.email.toLowerCase();
      const searchLowerCase = search.toLowerCase();
      return fullname.indexOf(searchLowerCase) > -1 || email.indexOf(searchLowerCase) > -1;
    });
  }

  initPortalUsers() {
    const type = 'edit';
    this.store$.select(authDataSelector).pipe(
      debounceTime(10),
      takeUntil(this.onDestroy$)).subscribe(profile => {
        if (profile) {
          let search = this.portalUserFilterCtrl.value || '';
          this.userProfile = profile;
          if(this.userProfile.roles[0]?.id == 5 || this.userProfile.roles[0]?.id == 6) {
            this.contactOnwerIds = [this.userProfile.roles[0].id]
            search = this.userProfile.email
          }
          // this.checkIsZimbraUser();
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
              // this.portalUsers = this.portalUsers.filter((portalUser:any) => {
              //   return portalUser.is_active == 1
              // })
              this.filteredPortalUsers = this.portalUsers.slice(0);
              if(this.userProfile.roles[0].id == 5 || this.userProfile.roles[0].id == 6) {
                if (type !== 'edit')  {
                  this.itemForm.get('contact_owner_email').setValue(this.userProfile.email); 
                }
              } else if (this.userProfile.roles[0].id == 4) {
                if (type !== 'edit')  {
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

  submit() {
    if (this.itemForm.valid && !this.itemForm.pristine) {
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
        concierge_state: this.itemForm.value.type == 0 ? null : this.itemForm.value.concierge_state,
        over18: this.itemForm.value.type == null ? null : this.itemForm.value.over18,
        linkedin_profile: this.itemForm.value.linkedin_profile,
        concierge_source: this.itemForm.value.concierge_source,
        interview_scheduled: this.itemForm.value.interview_scheduled,
        sales_license_status: this.itemForm.value.sales_license_status,
        sales_license: this.itemForm.value.sales_license,
        intake_questionaire_1: this.itemForm.value.intake_questionaire_1,
        intake_questionaire_2: this.itemForm.value.intake_questionaire_2,
        intake_questionaire_3: this.itemForm.value.intake_questionaire_3,
        onboarded_date: this.itemForm.value.onboarded_date,
        w2_sgned_date:  this.itemForm.value.w2_sgned_date,
        works_at_dealership: this.itemForm.value.works_at_dealership,
        physical_sales_license_received: this.itemForm.value.physical_sales_license_received,
        fico_score: this.itemForm.value.fico_score,
        hhi: this.itemForm.value.hhi,
        sex: this.itemForm.value.sex,
        concierge_referral_url: this.itemForm.value.concierge_referral_url,
        close_date: this.itemForm.value.close_date,
        opted_out_email_important_update: this.itemForm.value.opted_out_email_important_update,
        opted_out_email_marketing_information: this.itemForm.value.opted_out_email_marketing_information,
        opted_out_email_one_to_one: this.itemForm.value.opted_out_email_one_to_one,
        secondary_emails: this.itemForm.value.secondary_emails,
        secondary_phone: this.itemForm.value.secondary_phone
      };
      const userId = this.user.id;
      this.service$
        .update(userId, payload)
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
            this.store$.dispatch(new actions.UpdateSuccess(data));
            this.snack$.open('Contact Edited!', 'OK', {
              duration: 4000,
              verticalPosition: 'top',
              panelClass: ['snack-success'],
            });
            this.saving = false;
            this.store$.dispatch(new logActions.GetList(initialLogState.filter));
            this.initData();
          }else{
            this.saving = false;
          }
      });
    }
  }

  refreshData() {
    this.changeDetectorRefs.detectChanges();
  }
  

  salesLicenseFileUpload($event: FileList): void {
    if ($event.length) {
      const fileData = $event[0];
      const fileName = fileData.name.split('.');
      const fileExtention = fileName[fileName.length-1];
    
      if(this.isFileAllowed(fileExtention)) {
        this.portalUserServicer$.uploadfiles(this.user.email_address,'contacts',fileExtention, fileData).subscribe(response=> {
          if(response.filename) {
            this.itemForm.patchValue({sales_license:`${response.filename}`});
          }
        });
      }else {
        this.snack$.open("File type is not allowed", 'OK', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['snack-warning'],
        });
      }

    }
  }

  isFileAllowed(fileExtention: string) {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'svg', 'HEIF', 'HEVC','pdf'];
    if(allowedExtensions.includes(fileExtention)) {
      return true;
    } else {
      return false;
    }
  }

  isFileSizeAllowed(fileSize: number) {
    const sizeInKb = fileSize / 1024;
    const sizeInMb = sizeInKb / 1024;
    if(sizeInMb < 5) {
      return true
    } else {
      return false;
    }
  }

  isCollapsedContactSection: boolean = false;
  collapseContactSection() {
    const contactSection = document.getElementById('contactSection');
    if (contactSection && this.isCollapsedContactSection) {
      collapseSection(contactSection, 500);
    } else {
      expandSection(contactSection, 500);
    }
  }

  isCollapsedHistorySection: boolean = false;
  collapseHistorySection() {
    const contactHistorySection = document.getElementById('contactHistorySection');
    if (contactHistorySection && this.isCollapsedHistorySection) {
      collapseSection(contactHistorySection, 500);
    } else {
      expandSection(contactHistorySection, 500);
    }
  }

  closeMenu(closeEvent: any): void {
    if(closeEvent){
      const concatenatedEmails = closeEvent.secondary_emails.map(email => email).join(', ');
      this.itemForm.patchValue({
        email_address:closeEvent.primary_email,
        secondary_emails:concatenatedEmails,
      });
      this.itemForm.markAsDirty();
      this.itemForm.markAllAsTouched();
    }
    if (this.SecondaryEmailsMenu && this.SecondaryEmailsMenu.menuOpen) {
      this.SecondaryEmailsMenu.closeMenu();
      this.secondaryEmailMenuClosed = false;
    }
  }

  phoneCloseMenu(phoneNumberCloseEvent: any): void {
    if(phoneNumberCloseEvent){
      const concatenatedphones = phoneNumberCloseEvent.secondary_phone.map(phone => {
        const formattedPhoneNumber = formatPhoneNumber(phone);
        return formattedPhoneNumber['nationalNumber'];
      }).join(', ');
      this.itemForm.patchValue({
        phone:phoneNumberCloseEvent.primary_phone,
        secondary_phone:concatenatedphones,
      });
      this.itemForm.markAsDirty();
      this.itemForm.markAllAsTouched();
    }
    if (this.SecondaryPhoneMenu && this.SecondaryPhoneMenu.menuOpen) {
      this.SecondaryPhoneMenu.closeMenu();
      this.secondaryPhoneMenuClosed = false;
    }
  }
}

