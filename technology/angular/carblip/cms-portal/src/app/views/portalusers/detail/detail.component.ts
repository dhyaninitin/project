import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';

import { ROLE_LIST } from 'app/core/constants';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { getBoolColor, getUserFullName } from 'app/shared/helpers/utils';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { PortalUser, UpdatePortalUser } from 'app/shared/models/portaluser.model';
import * as commonModels from 'app/shared/models/common.model';
import { Log, LogResponse } from 'app/shared/models/log.model';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/portalusers/portalusers.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/portalusers/portalusers.selectors';
import { initialState as initialLogState } from 'app/store/portalusers/portalusers.states';
import { NgxRolesService } from 'ngx-permissions';
import { PortalUsersEditModalComponent } from '../table/edit-modal/edit-modal.component';
import { TablePagination } from 'app/shared/models/common.model';
import { Location } from 'app/shared/models/location.model';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { scaleIn400ms } from '@vex/animations/scale-in.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Profile } from 'app/shared/models/user.model';
import { dataSelector as profileDataSelector } from 'app/store/auth/authentication.selector';
import { dataSelector as locationDataSelector } from 'app/store/locations/locations.selectors';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PhoneNumbersListService } from 'app/shared/services/apis/phone-numbers.service';
import { environment } from 'environments/environment';
@Component({
  selector: 'app-portaluser-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.style.scss'],
  animations: [
    fadeInUp400ms,
    fadeInRight400ms,
    scaleIn400ms,
    stagger40ms
  ]
})
export class PortalUsersDetailComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  public itemForm: FormGroup;
  public portaluserId: string;
  public isReady: boolean;
  public portaluser: PortalUser;
  public logs: Array<Log>;
  public logPagination: TablePagination = {
    length: initialLogState.meta.total,
    pageIndex: initialLogState.filter.page,
    pageSize: initialLogState.filter.per_page,
    previousPageIndex: 0,
  };

  public saving: Boolean = false;

  inputType: Array<String> = ['password', 'password'];
  visible: Array<boolean> = [false, false];

  public roles: Array<any> = [];
  public userProfile: Profile;
  public locations: Array<Location>;
	public locationFilterCtrl: FormControl = new FormControl();
	public filteredLocations: Array<Location>;
  
	rrweekdays=[
		{ id : 0, "value": 'Sun', status: false },
		{ id : 1, "value": 'Mon', status: false },
		{ id : 2, "value": 'Tue', status: false },
		{ id : 3, "value": 'Wed', status: false },
		{ id : 4, "value": 'Thu', status: false },
		{ id : 5, "value": 'Fri', status: false },
		{ id : 6, "value": 'Sat', status: false }
	];

	typeOfLimit = [
		  { "id" : 'D', "value": 'Day' },
		  { "id" : 'W', "value": 'Week' },
		  { "id" : 'M', "value": 'Month' },
	];
	countryCode: string = '1';
	carblipAssignedPhone: string = "";
	loadingPhones: boolean = false;
	listOfAvailablePhoneNumbers: Array<[]> = [];
	filteredListOfAvailablePhoneNumbers: Array<any> = [];
	public phoneFilterCtrl: FormControl = new FormControl();
	availableAreaCodes: Array<Number> = [818, 805];
	filteredAvailableAreaCodes: Array<Number> = this.availableAreaCodes;
	timeout: NodeJS.Timeout;
	emailPattern: string = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,64}";
	existedMail: any= [];
	isNumberReSelected: boolean = false;
	
	userHistorylog: any = {
		page: 1,
		per_page: 10,
	  };
	fetchingLogs:boolean = false;
	public emailEnvPrefix: string = '';
	

  constructor(
    private store$: Store<AppState>,
    private route$: ActivatedRoute,
    private router$: Router,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private loader$: AppLoaderService,
    private confirmService$: AppConfirmService,
    private service$: PortalUserService,
    private rolesService$: NgxRolesService,
    // private location: Location,
    private fb: FormBuilder,
	private snack$: MatSnackBar,
	private phoneService$: PhoneNumbersListService
  ) { }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
	this.service$.isRoundRobinAllow = false;
  }

  ngOnInit() {
    this.isReady = false;
    this.route$.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.portaluserId = params.get('id');
      if(this.service$.isRoundRobinAllow) {
        this.showRRSection = true;
      } else {
        this.showRRSection = false;
      }
      this.initData();
    });

	if (environment.name == 'development') {
		this.emailEnvPrefix = '-dev'
	} else if(environment.name == 'staging') {
		this.emailEnvPrefix = '-staging'
	} else if(environment.name == 'localhost'){
		this.emailEnvPrefix = '-local'
	} else {
		this.emailEnvPrefix = ''
	}
	
		// listen for phone filter changes
	this.phoneFilterCtrl.valueChanges
		.pipe(takeUntil(this.onDestroy$))
		.subscribe(() => {this.filterPhones();
	});
  }

  initData() {
    setTimeout(() => {
      this.loader$.open();
    }, 10);

    this.store$
			.select(profileDataSelector)
			.pipe(
				takeUntil(this.onDestroy$),
				tap((profile: Profile) => {
					this.userProfile = profile;
					const userRoleId = this.userProfile?.roles[0]?.id;
					this.roles = ROLE_LIST.filter(item => item.id >= userRoleId);
          this.changeDetectorRefs.detectChanges();
				})
			)
			.subscribe();
    
      this.store$
			.select(locationDataSelector)
			.pipe(
				takeUntil(this.onDestroy$),
				tap(data => {
					this.locations = data;
					this.filteredLocations = this.locations.slice(0);
          this.changeDetectorRefs.detectChanges();
				})
			)
			.subscribe();

    combineLatest(
      this.service$.getById(this.portaluserId)
    )
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(([result]) => {
        this.loader$.close();
        this.portaluser = result.data;
        if(this.portaluser.roundrobin) { this.showRRSection = true }
        this.isReady = true;
        this.buildItemForm(this.portaluser);
        this.changeDetectorRefs.detectChanges();
      });

	  this.getUserHistoryLogs();
  }

  initLogMeta(meta) {
    this.logPagination.length = meta.total;
    this.logPagination.pageIndex = meta.current_page - 1;
    this.logPagination.pageSize = meta.per_page;
  }

  toggleRR(item) { }

  /** Get Role Friendly Name from Role List
   * @param string name
   * @return string roleName
   **/

  getRoleName(name: string) {
    const obj = ROLE_LIST.find(item => item.name === name);
    return obj.label;
  }

  indirectShowDeleteButton() {
    const roles = this.rolesService$.getRoles();
    if (roles['admin'] || roles['superadmin'] || roles['manager']) {
      return true;
    } else {
      return false;
    }
  }

  indirectShowEditButton() {
    const roles = this.rolesService$.getRoles();
    if (roles['admin'] || roles['superadmin'] || roles['manager']) {
      return true;
    }
    else {
      return false;
    }
  }

  indirectDeleteDialogBox() {
    this.confirmService$
      .confirm({
        message: `Are you sure you want to delete the user '${this.portaluser.first_name
          }'?`,
      })
      .subscribe(res => {
        if (res) {
          const payload = {
            id: this.portaluser.id,
          };
          this.store$.dispatch(new actions.Delete(payload));
          this.router$.navigate(['/users']);
        }
      });
  }

  indirectEditDialogBox() {
    const title = 'Edit CarBlip Team Member';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      PortalUsersEditModalComponent,
      {
        width: '720px',
        disableClose: false,
        data: { title: title, payload: this.portaluser, type: 'edit' },
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

  toggleVisibility(index: number) {
		if (this.visible[index]) {
		  this.inputType[index] = 'password';
		  this.visible[index] = false;
		  this.changeDetectorRefs.markForCheck();
		} else {
		  this.inputType[index] = 'text';
		  this.visible[index] = true;
		  this.changeDetectorRefs.markForCheck();
		}
	}

  public showPromocodeEdit: boolean = false;
  public showPromocodeAdd: boolean = false;

  buildItemForm(item: PortalUser) {
		if(item.email) this.existedMail = item.email.split('@')
		let role = null,
			location = null;
		if (item.roles) {
			role = item.roles[0].name;
			this.showPromocodeEdit = (role == 'salesperson' || role == 'manager' || role == 'concierge') ? true : false;
		}
		if (item.location) {
			const locationIds = (<any>item.location).map((item: any) => item.id);
			location = locationIds;
		}

		/** If user role is manager, and modal is for `add` type,
			* Set default location and role
			*/

		const roles = this.rolesService$.getRoles();
		// this.showPromocodeAdd=(roles.salesperson || roles.manager) ? true :false;
		this.showPromocodeAdd = true;

		let password = new FormControl('', [
			Validators.required,
			Validators.minLength(6),
		]);
		password = new FormControl('', [Validators.minLength(6)]);
		const confirmPassword = new FormControl('', [
			CustomValidators.equalTo(password),
			Validators.minLength(6),
		]);
		this.getAllsource();
		const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
		let phoneNumber = "";
		if(item.phone != "" && item.phone != null) {
			phoneNumber = formatPhoneNumber(item.phone.toString());
			this.countryCode = phoneNumber['countryCallingCode'];
			phoneNumber = phoneNumber['nationalNumber'];
		}

		this.carblipAssignedPhone = item?.carblip_assigned_phone;

		const formFields = {
			first_name: [item.first_name || '', Validators.required],
			last_name: [item.last_name || ''],
			email: [item.email || '', Validators.required],
			personalemail: [item.personalemail],
			phone: [phoneNumber || ''],
			role: [role || '', Validators.required],
			location: [location || '', Validators.required],
			promo_code: [item.promo_code || ''],
			password: password,
			confirmPassword: confirmPassword,
			limit: [''],
			source: [''],
			typeoflimit: [''],
			days: [''],
			isDefault: [''],
			is_reset_password_required: [item.is_reset_password_required || ''],
			activate_round_robin: [item.roundrobin || ''],
			discord_url: [item.discord_url, Validators.pattern(urlRegex)],
			facebook_url: [item.facebook_url, Validators.pattern(urlRegex)],
			linkedin_url: [item.linkedin_url, Validators.pattern(urlRegex)],
			twitter_url: [item.twitter_url, Validators.pattern(urlRegex)],
			instagram_url: [item.instagram_url, Validators.pattern(urlRegex)],
			tiktok_url: [item.tiktok_url, Validators.pattern(urlRegex)],
			city:[item.city || ''],
			state:[item.state || ''],
			sales_license_expiry_date:[item.sales_license_expiry_date || ''],
			areacode: [item.areacode || ''],
			contains: [item.contains || null],
			carblip_assigned_phone:[''],
			last_active: [item.last_active || '']
		};
		this.itemForm = this.fb.group(formFields);
		if(role == 'concierge') {
			this.emailPattern = "[A-Z0-9a-z._%+-]{2,64}";
			this.itemForm.patchValue({ email: this.existedMail[0].toLowerCase() })
			if(item.carblip_assigned_phone) {
				this.displayCarblipAssignedPhone();
				this.getCarblipAssignedNumber();
			}
		}
		if(this.disabledField(roles)){
			this.itemForm.get('email').disable();
			this.itemForm.get('areacode').disable();
			this.itemForm.get('contains').disable();
			this.itemForm.get('carblip_assigned_phone').disable();
		}

		if(roles['manager']) {
			this.itemForm.get('location').disable();
			this.itemForm.get('role').disable();
		}
    	this.itemForm.get('role').valueChanges
		.subscribe((roleValue) => {
			if (roleValue == 'salesperson' || roleValue == 'manager' || roleValue == 'concierge') {
			this.itemForm.get('promo_code').enable();
			} else {
			this.itemForm.get('promo_code').disable();
			}
		});

		if (this.itemForm.value.role == 'salesperson' ||   this.itemForm.value.role == 'manager' || this.itemForm.value.role == 'concierge') {
			this.itemForm.get('promo_code').enable();
		} else {
			this.itemForm.get('promo_code').disable();
		}
		if(this.showRRSection) {
			this.itemForm.get('limit').setValidators(Validators.required);
			this.itemForm.get('source').setValidators(Validators.required);
			this.itemForm.get('typeoflimit').setValidators(Validators.required);
			this.itemForm.get('days').setValidators(Validators.required);

			this.service$.getrrSchedule(item.email).subscribe((res:any)=>{
				if(res.data.length) {
					let data = res.data[0];	
					this.totalAssigned = data.totalassigned;	
					this.itemForm.patchValue(
						{
							limit:data.limit, 
							source: data.source,  
							typeoflimit: data.typeoflimit,
							days: data.days,
							isDefault: data.isDefault
						})
						this.defaultUser = data.isDefault == 0 ? false : true;
						this.itemForm.setValue({source:data.source});
					} else{
				}
			});
	 }
	 
	 this.itemForm.patchValue({location:location})
	}

  getDays(id:any) {
		this.rrweekdays.map(val => { if(val.id == id) { val.status = true }})
	}

  listOfSources: [] = [];
	/** get all Source
	* @param
	* @return
	**/
	getAllsource(){
		this.service$.getsource().subscribe((res:any)=>{
			if(res.statusCode == 200 && res.data) {
				this.listOfSources = res.data;
			}
		});
	}

  /** Submit user input
		* @param
		* @return
		**/

  showRRSection: boolean = false;
  totalAssigned: number = 0;
	defaultUserEmail: any = '';
	defaultUser: boolean = false;

	submit() {
		const formsValue = this.itemForm.getRawValue();
		const roleSelected = this.roles.find(
			item => item.name === formsValue.role
		);
		const phoneNumber = formatPhoneNumber(formsValue.phone);
		if (this.itemForm.valid && !this.itemForm.pristine) {
			if (formsValue.promo_code && formsValue.promo_code.length > 0) {
				formsValue.promo_code = formsValue.promo_code.trim();
			}

			let payload: UpdatePortalUser = {
				first_name: formsValue.first_name,
				last_name: formsValue.last_name,
				email: formsValue.email,
				personalemail: formsValue.personalemail,
				role_id: roleSelected.id,
				location_id: formsValue.location,
				promo_code: (formsValue.promo_code).toString().toUpperCase(),
				is_reset_password_required: formsValue.is_reset_password_required ? 1 : 0,
				// new fields
				city:formsValue.city,
				state:formsValue.state,
				sales_license_expiry_date:formsValue.sales_license_expiry_date,
				phone:phoneNumber['number'],
			};

			if(formsValue.discord_url) {
				payload['discord_url'] = formsValue.discord_url;
			  }
			  if(formsValue.facebook_url) {
				payload['facebook_url'] = formsValue.facebook_url;
			  }
			  if(formsValue.instagram_url) {
				payload['instagram_url'] = formsValue.instagram_url;
			  }
			  if(formsValue.linkedin_url) {
				payload['linkedin_url'] = formsValue.linkedin_url;
			  }
			  if(formsValue.twitter_url) {
				payload['twitter_url'] = formsValue.twitter_url;
			  }
			  if(formsValue.tiktok_url) {
				payload['tiktok_url'] = formsValue.tiktok_url;
			  }

			//   new fields for concierge
			  if(formsValue.areacode) payload['areacode'] = formsValue.areacode;
			  if(formsValue.contains) payload['contains'] = formsValue.contains;
			  if(formsValue.carblip_assigned_phone) payload['carblip_assigned_phone'] = formsValue.carblip_assigned_phone;

			let rrPayload = {
				email: formsValue.email,
				limit: formsValue.limit,
				source: formsValue.source,
				typeoflimit: formsValue.typeoflimit,
				days: formsValue.days
			}

			if (formsValue.password) {
				payload = {
					...payload,
					password: formsValue.password,
					password_confirmation: formsValue.password_confirmation,
				};
			}
			if(payload.role_id == 6) {
				const emailInfoArray = payload.email.split('-');
				if (this.emailEnvPrefix[0] === '-') {
					this.emailEnvPrefix = this.emailEnvPrefix.substring(1);
				}
				if (this.emailEnvPrefix === emailInfoArray[emailInfoArray.length - 1]) {
					payload.email = payload.email + "@m.carblip.com";
				} else {
					if(this.emailEnvPrefix != "") {
						payload.email = payload.email + "-" + this.emailEnvPrefix + "@m.carblip.com";
					} else {
						payload.email = payload.email + this.emailEnvPrefix + "@m.carblip.com";
					}
				}
			}
			this.saving = true;
				const portalUserId = this.portaluser.id;
				if(this.showRRSection) {
					const payloadUpdateRR = {
						id: portalUserId,
						status: true,
					  };
					this.store$.dispatch(new actions.UpdateRR(payloadUpdateRR));
					setTimeout(() => {
						this.service$.updateRRSchedule(rrPayload).pipe(
							takeUntil(this.onDestroy$),
							map(result => result),
							catchError(err => {
								return of(err);
							})
						).subscribe(res => {
							if (!res.error) {
								if(this.defaultUserEmail !== '') {
									this.service$.makeAsDefaultUser(this.defaultUserEmail).pipe(
										takeUntil(this.onDestroy$),
										map(result => result),
										catchError(err => {
											return of(err);
										})
									)
									.subscribe(res => {
										if (!res.error) {
										}
									});
								}
								if(this.isNumberReSelected && payload.carblip_assigned_phone != "" && payload.role_id == 6) {
									this.addCarblipAssignedPhone(formsValue.carblip_assigned_phone, Number(this.portaluserId));
									this.claimAvailablePhoneNumbers(payload.carblip_assigned_phone);
								}
								this.service$
								.update(portalUserId, payload)
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
										this.saving = false;
										this.initData();
									}
								});
							}
						});
					}, 1000);
					
				} else {
					if(this.portaluser.roundrobin) {
						const payloadUpdateRR = {
							id: portalUserId,
							status: false,
						  };
						this.store$.dispatch(new actions.UpdateRR(payloadUpdateRR));
					}
					if(this.isNumberReSelected && payload.carblip_assigned_phone != "" && payload.role_id == 6) {
						this.addCarblipAssignedPhone(formsValue.carblip_assigned_phone, Number(this.portaluserId));
						this.claimAvailablePhoneNumbers(payload.carblip_assigned_phone);
					}
					this.service$
					.update(portalUserId, payload)
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
							this.snack$.open('User Updated!', 'OK', {
								duration: 4000,
								verticalPosition: 'top',
								panelClass: ['snack-success'],
							});
							this.store$.dispatch(new actions.UpdateSuccess(data));
							this.saving = false;
							this.initData();
						}
					});
				}	
		}
	}

  	onSetAsDefault($event: any) {
		let alertMsg = '';
		if ($event.checked) {
			this.itemForm.patchValue({isDefault: 1});	
			alertMsg = 'Are you sure you want to make this user as a default?';
		} else {
			alertMsg = 'Are you sure you want to remove default user?';
			this.itemForm.patchValue({isDefault: 0});
		}

		this.confirmService$.confirm({ message: alertMsg}).subscribe(res => {
			if (res) {
				if(this.itemForm.controls['isDefault'].value == 1 || this.itemForm.controls['isDefault'].value === "") {
					this.defaultUserEmail = this.itemForm.controls['email'].value;
				} else {
					this.defaultUserEmail = '';
				}
				this.itemForm.markAllAsTouched();
				this.itemForm.markAsDirty();
				this.changeDetectorRefs.detectChanges();
			} else {
				if(this.itemForm.controls['isDefault'].value == 1) {
					this.itemForm.patchValue({isDefault: 0});
				} else {
					this.itemForm.patchValue({isDefault: 1});
				}
			}
		});
	}

	checkDefault() {
		if(this.itemForm.controls['isDefault'].value == 1) {
			return true;
		} else {
			return false;
		}
	}

	showRRCheckbox(item) {
		return (
		  item && item.roles && (item.roles[0].id === 4 || item.roles[0].id === 5)
		);
	}

	roundRobinSettings($event: any) {
		if($event.checked) {
			this.showRRSection = true;
			this.itemForm.get('limit').setValidators(Validators.required);
			this.itemForm.get('source').setValidators(Validators.required);
			this.itemForm.get('typeoflimit').setValidators(Validators.required);
			this.itemForm.get('days').setValidators(Validators.required);
			this.itemForm.markAllAsTouched();
		} else {
			this.showRRSection = false;
			this.itemForm.get('limit').setErrors(null);
			this.itemForm.get('source').setErrors(null);
			this.itemForm.get('typeoflimit').setErrors(null);
			this.itemForm.get('days').setErrors(null);
		}
	}

	//new update for areacode & phone

	addPostFixForConcierge($event: any) {
		const { value } = this.itemForm;
		if(value.role === 'concierge') {
			this.emailPattern = "[A-Z0-9a-z._%+-]{2,64}";
			this.itemForm.get('carblip_assigned_phone').disable();
			this.itemForm.get('carblip_assigned_phone').reset();
			this.itemForm.get('areacode').reset();
			this.itemForm.get('contains').reset();

			this.itemForm.get('carblip_assigned_phone').setValidators([Validators.required]);
			this.itemForm.get('areacode').setValidators([Validators.required]);

			if(value.email == "") {
				const suggestedEmail = value.first_name.charAt(0) + value.last_name;
				this.itemForm.patchValue({ email: suggestedEmail.toLowerCase() })
			}
			if(this.existedMail){
				this.itemForm.patchValue({ email: this.existedMail[0].toLowerCase() })
			}
		} else {
			this.emailPattern = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,64}";
			this.itemForm.get('carblip_assigned_phone').clearValidators();
			this.itemForm.get('areacode').clearValidators();
			this.itemForm.get('carblip_assigned_phone').reset();
			this.itemForm.get('areacode').reset();
			this.itemForm.get('contains').reset();

			this.itemForm.patchValue({ email: this.existedMail.join("@").toLowerCase() })
		}

		this.itemForm.get('email').markAsTouched();
	}

	getSelectedAreaCode($event?: any) {
		this.loadingPhones = true;
		const value = $event ? $event.option.value : this.itemForm.get('areacode').value;
		this.getAvailablePhoneNumbers(value, this.itemForm.get('contains').value );
	}

	getAvailablePhoneNumbers(areacode: string, contains: string) {
		this.service$.getAvailablePhoneNumbers(areacode, contains).subscribe(res => {
			if(res) {
				if(res.data.length > 0) {
					this.listOfAvailablePhoneNumbers = res.data;
					this.filteredListOfAvailablePhoneNumbers = res.data;
					this.loadingPhones = false;
					this.itemForm.get('carblip_assigned_phone').enable();
					const roles = this.rolesService$.getRoles();
					if(this.disabledField(roles)) {
						this.itemForm.get('email').disable();
						this.itemForm.get('areacode').disable();
						this.itemForm.get('contains').disable();
						this.itemForm.get('carblip_assigned_phone').disable();
					}
					if(this.carblipAssignedPhone) {
						const index = this.filteredListOfAvailablePhoneNumbers.findIndex(item => item.phone_number == this.carblipAssignedPhone);
						if(index == -1) {
							this.filteredListOfAvailablePhoneNumbers.push({
								formatted_number: this.carblipAssignedPhone,
								iso_country: "US",
								phone_number: this.carblipAssignedPhone,
								postal_code: "91319",
							});
						}
					}
					this.changeDetectorRefs.detectChanges();
				} else {
					this.listOfAvailablePhoneNumbers = [];
					this.itemForm.get('carblip_assigned_phone').enable();
					this.loadingPhones = false;
					this.changeDetectorRefs.detectChanges();
				}
			}
		}, error=> {
			console.log(error);
		})
	}

	filterPhones() {
		if (!this.locations) {
			return;
		}
		let search = this.phoneFilterCtrl.value;
		if (!search) {
			this.filteredListOfAvailablePhoneNumbers = this.listOfAvailablePhoneNumbers.slice(0);
			return;
		} else {
			search = search.toLowerCase();
		}
		this.filteredListOfAvailablePhoneNumbers = this.listOfAvailablePhoneNumbers.filter(
			(item: any) => item.phone_number.toLowerCase().indexOf(search) > -1
		);
	}

	searchAvailableNumbers($event: any) {
		if($event.keyCode == 8 || $event.key == "0" || Number($event.key) && (this.itemForm.get('contains').value == null || this.itemForm.get('contains').value.length < 7)) {
			clearTimeout(this.timeout);
			this.timeout = setTimeout(() => {
				this.itemForm.get('carblip_assigned_phone').disable();
				this.loadingPhones = true;
				let value = this.itemForm.get('contains').value;
				if(this.itemForm.get('contains').value != null && this.itemForm.get('contains').value.length == 1) {
					value = value + "*";
				}
				this.getAvailablePhoneNumbers(this.itemForm.get('areacode').value, value);
			}, 1000)
		} else {
			if($event.keyCode != 8 && $event.keyCode != 37 && $event.keyCode != 39) {
				return $event.preventDefault();
			}
		}
	}

	searchAvailableNumbersByAreaCode($event: any) {
		if(Number($event.key) && (this.itemForm.get('areacode').value == null || this.itemForm.get('areacode').value.length < 3)) {
			const filterValue = $event.target.value == "" ? $event.key : $event.target.value+$event.key;
    		this.filteredAvailableAreaCodes = this.availableAreaCodes.filter(value => value.toString().includes(filterValue));
			
			clearTimeout(this.timeout);
			this.timeout = setTimeout(() => {
				if(this.filteredAvailableAreaCodes.length == 0) {
					this.itemForm.get('carblip_assigned_phone').disable();
					this.loadingPhones = true;
					this.getAvailablePhoneNumbers(this.itemForm.get('areacode').value, this.itemForm.get('contains').value);
				}
			}, 1000)
		} else {
			if($event.keyCode != 8 && $event.keyCode != 37 && $event.keyCode != 39) {
				return $event.preventDefault();
			}
			if($event.keyCode == 8) {
				const filterValue = $event.target.value.slice(0, -1);
    			this.filteredAvailableAreaCodes = this.availableAreaCodes.filter(value => value.toString().includes(filterValue));
			}
		}
	}

	getCarblipAssignedNumber() {
		this.phoneService$.showAssignedNumber(this.portaluserId).subscribe(res => {
		  if(res.data) {
			this.carblipAssignedPhone = res.data.phone;
			this.itemForm.patchValue({carblip_assigned_phone:this.carblipAssignedPhone})
			this.changeDetectorRefs.detectChanges();
		  } else {
			this.carblipAssignedPhone = null;
		  }
		})
	  }

	  claimAvailablePhoneNumbers(phoneNumber: string) {
		this.service$.claimAvailablePhoneNumbers(phoneNumber).subscribe(res => {
			if(res) {
			}
		}, error=> {
			console.log(error);
		})
	}

	
	addCarblipAssignedPhone(phone: string, userid: number) {
		this.service$.storeCarblipAssignedNumber(phone, userid).subscribe();
	}

	onNumberSelection(event){
		if(event) this.isNumberReSelected = true;
	}

	disabledField(roles) {
		if (roles['admin'] || roles['superadmin']) return false;
		else return true;
	}

	onLogPaginateChange(event) {
		this.userHistorylog.page = event.pageIndex + 1;
		this.userHistorylog.per_page = event.pageSize;
		this.getUserHistoryLogs();
	}

	  
	getUserHistoryLogs() {
		this.fetchingLogs = true
		combineLatest(
			this.service$.getLogsById(this.portaluserId, this.userHistorylog)
		)
			.pipe(
				takeUntil(this.onDestroy$),
				map(result => result),
				catchError(err => {
					return of(err);
				})
			)
			.subscribe(([result]) => {
				this.fetchingLogs = false;
				this.logs = result.data;
				this.initLogMeta(result.meta);
				this.changeDetectorRefs.detectChanges();
			});
	}

	displayCarblipAssignedPhone() {
		if(this.carblipAssignedPhone) {
			this.loadingPhones = true;
			if (this.carblipAssignedPhone.length > 2) {
				const areacode = this.carblipAssignedPhone.substring(2, 5);
				this.itemForm.patchValue({areacode: areacode});
				this.getAvailablePhoneNumbers(areacode, this.itemForm.get('contains').value );
			}
		}
	}

	disabledButton(){
		if(this.itemForm.invalid || this.itemForm.pristine) return true;
		return false;
	}
}
