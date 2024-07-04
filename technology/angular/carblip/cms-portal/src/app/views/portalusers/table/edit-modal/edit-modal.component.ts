import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { dataSelector as locationDataSelector } from 'app/store/locations/locations.selectors';
import { CustomValidators } from 'ng2-validation';
import { NgxRolesService } from 'ngx-permissions';
import { of, Subject } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';

import { ROLE_LIST } from 'app/core/constants';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { PortalUser, UpdatePortalUser } from 'app/shared/models/portaluser.model';
import { Role } from 'app/shared/models/portaluser.model';
import { Location } from 'app/shared/models/location.model';
import { Profile } from 'app/shared/models/user.model';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';
import { AppState } from 'app/store';
import { dataSelector as profileDataSelector } from 'app/store/auth/authentication.selector';
import { GetList as locationsGetList } from 'app/store/locations/locations.actions';
import * as logActions from 'app/store/portaluserlogs/portaluserlogs.actions';
import { initialState as initialLogState } from 'app/store/portaluserlogs/portaluserlogs.states';
import * as actions from 'app/store/portalusers/portalusers.actions';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';

@Component({
	selector: 'app-portalusers-table-edit-modal',
	templateUrl: './edit-modal.component.html',
	styleUrls: ['./edit-modal.component.scss'],
})

/**
	** Component for Add/Edit Portal User
	**/
export class PortalUsersEditModalComponent implements OnInit, OnDestroy {
	private onDestroy$ = new Subject<void>();

	public itemForm: FormGroup;
	public isActive: boolean;
	public type: string;
	public roles: Array<any> = [];
	public locations: Array<Location>;
	public locationFilterCtrl: FormControl = new FormControl();
	public phoneFilterCtrl: FormControl = new FormControl();
	public filteredLocations: Array<Location>;
	public userProfile: Profile;
	public saving: Boolean = false;
	public saveButtonLabel;
	public showPromocodeAdd: boolean = false;
	public showPromocodeDisable: boolean = false;
	public showPromocodeEdit: boolean = false;
	public emailEnvPrefix: string = '';

	inputType: Array<String> = ['password', 'password'];
  	visible: Array<boolean> = [false, false];

	rrweekdays=[
		{ "id" : 0, "value": 'Sun', status: false },
		{ "id" : 1, "value": 'Mon', status: false },
		{ "id" : 2, "value": 'Tue', status: false },
		{ "id" : 3, "value": 'Wed', status: false },
		{ "id" : 4, "value": 'Thu', status: false },
		{ "id" : 5, "value": 'Fri', status: false },
		{ "id" : 6, "value": 'Sat', status: false }
	  ];
	  typeOfLimit = [
		  { "id" : 'D', "value": 'Day' },
		  { "id" : 'W', "value": 'Week' },
		  { "id" : 'M', "value": 'Month' },
		];
	defaultUserEmail: any = '';
	defaultUser: boolean = false;
	emailPattern: string = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,64}";
	listOfAvailablePhoneNumbers: Array<[]> = [];
	filteredListOfAvailablePhoneNumbers: Array<[]> = [];
	loadingPhones: boolean = false;
	availableAreaCodes: Array<Number> = [818, 805];
	filteredAvailableAreaCodes: Array<Number> = this.availableAreaCodes;
	timeout: NodeJS.Timeout;
	countryCode: string = "1";
	peronalEmailPattern: string = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,64}";

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<PortalUsersEditModalComponent>,
		private fb: FormBuilder,
		private store$: Store<AppState>,
		private rolesService$: NgxRolesService,
		private service$: PortalUserService,
		private _cdr: ChangeDetectorRef,
		private snack$: MatSnackBar
	) { }
	ngOnInit() {
		this.type = this.data.type;
		if (this.type === 'edit') {
			this.saveButtonLabel = 'SAVE';
		} else {
			this.saveButtonLabel = 'CREATE';
		}

		if (environment.name == 'development') {
			this.emailEnvPrefix = '-dev'
		} else if(environment.name == 'staging') {
			this.emailEnvPrefix = '-staging'
		} else if(environment.name == 'localhost'){
			this.emailEnvPrefix = '-local'
		} else {
			this.emailEnvPrefix = ''
		}
		
		this.store$
			.select(profileDataSelector)
			.pipe(
				takeUntil(this.onDestroy$),
				tap((profile: Profile) => {
					this.userProfile = profile;
					const userRoleId = this.userProfile.roles[0].id;
					this.roles = ROLE_LIST.filter(item => item.id >= userRoleId);
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
					this.buildItemForm(this.data.payload);
				})
			)
			.subscribe();

		// listen for search field value changes
		this.locationFilterCtrl.valueChanges
			.pipe(takeUntil(this.onDestroy$))
			.subscribe(() => {
				this.filterLocations();
			});

		// listen for phone filter changes
		this.phoneFilterCtrl.valueChanges
			.pipe(takeUntil(this.onDestroy$))
			.subscribe(() => {
				this.filterPhones();
		});
	}

	/** Filter locations
		* @param PortalUser item
		* @return
		**/

	filterLocations() {
		if (!this.locations) {
			return;
		}
		// get the search keyword
		let search = this.locationFilterCtrl.value;
		if (!search) {
			this.filteredLocations = this.locations.slice(0);
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the banks
		this.filteredLocations = this.locations.filter(
			item => item.name.toLowerCase().indexOf(search) > -1
		);
	}

	filterPhones() {
		if (!this.locations) {
			return;
		}
		// get the search keyword
		let search = this.phoneFilterCtrl.value;
		if (!search) {
			this.filteredListOfAvailablePhoneNumbers = this.listOfAvailablePhoneNumbers.slice(0);
			return;
		} else {
			search = search.toLowerCase();
		}
		// filter the banks
		this.filteredListOfAvailablePhoneNumbers = this.listOfAvailablePhoneNumbers.filter(
			(item: any) => item.phone_number.toLowerCase().indexOf(search) > -1
		);
	}

	onRoleChange(value) {
		(value == 'salesperson' || value == 'concierge' || value == 'manager') ? this.itemForm.get('promo_code').enable() : this.itemForm.get('promo_code').disable();
	}

	/** Build form validation from input
		** This funciton is genreate from group object which is used to validation form elements,
		** set default values to form elements. We use custom validatior for password and password_confirm.
		* @param PortalUser item
		* @return
		**/

	buildItemForm(item: PortalUser) {
		let role = null,
			location = null;
		if (item.roles) {
			role = item.roles[0].name;
			this.showPromocodeEdit = (role == 'salesperson' || role == 'manager' || role == 'concierge') ? true : false;
		}
		if (item.location) {
			location = item.location.id;
		}

		/** If user role is manager, and modal is for `add` type,
			* Set default location and role
			*/

		const roles = this.rolesService$.getRoles();
		// this.showPromocodeAdd=(roles.salesperson || roles.manager) ? true :false;
		this.showPromocodeAdd = true;
		if (roles.manager && this.type !== 'edit') {
			location = this.userProfile.location.map(item => item.id);
			role = 'salesperson'; // Default role id for salesperson
		}

		let password = new FormControl('', [
			Validators.required,
			Validators.minLength(6),
		]);

		const confirmPassword = new FormControl('', [
			CustomValidators.equalTo(password),
			Validators.minLength(6),
		]);
		
		const formFields = {
			first_name: [item.first_name || '', Validators.required],
			last_name: [item.last_name || ''],
			phone: [item.phone || ''],
			areacode: [''],
			contains: [''],
			email: [item.email || '', Validators.required],
			personalemail: [item.email || ''],
			role: [role || '', Validators.required],
			location: [location || '', Validators.required],
			promo_code: [item.promo_code || ''],
			city:[item.city || ''],
			state:[item.state || ''],
			sales_license_expiry_date:[item.sales_license_expiry_date || ''],
			password: password,
			confirmPassword: confirmPassword,
		};
		this.itemForm = this.fb.group(formFields);
    	this.itemForm.get('role').valueChanges
		.subscribe((roleValue) => {
			if (roleValue == 'salesperson' || roleValue == 'manager' || roleValue == 'concierge') {
			this.itemForm.get('promo_code').enable();
			} else {
			this.itemForm.get('promo_code').disable();
			}
		});

		if ( this.itemForm.value.role == 'salesperson' ||   this.itemForm.value.role == 'manager' || this.itemForm.value.role == 'concierge') {
			this.itemForm.get('promo_code').enable();
		} else {
			this.itemForm.get('promo_code').disable();
		}
	}

	/** Submit user input
		* @param
		* @return
		**/

	submit() {
		const formsValue = this.itemForm.getRawValue();
		const roleSelected = this.roles.find(
			item => item.name === formsValue.role
		);

		if (this.itemForm.valid) {
			if (formsValue.promo_code && formsValue.promo_code.length > 0) {
				formsValue.promo_code = formsValue.promo_code.trim();
			}
			let payload: UpdatePortalUser = {
				first_name: formsValue.first_name,
				last_name: formsValue.last_name,
				email: formsValue.email,
				personalemail: formsValue.personalemail,
				// phone: formsValue.phone,
				role_id: roleSelected.id,
				location_id: formsValue.location,
				promo_code: (formsValue.promo_code).toString().toUpperCase(),
				city:formsValue.city,
				state:formsValue.state,
				sales_license_expiry_date:formsValue.sales_license_expiry_date,
			};

			if (formsValue.password) {
				payload = {
					...payload,
					password: formsValue.password,
					password_confirmation: formsValue.password_confirmation,
				};
			}

			this.saving = true;
			if (this.type === 'edit') {
				
			} else {
				if(payload.role_id == 6) {
					payload.email = payload.email + this.emailEnvPrefix + "@m.carblip.com";
				}
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
							this.snack$.open('User Added!', 'OK', {
								duration: 4000,
								verticalPosition: 'top',
								panelClass: ['snack-success'],
							});
							if(payload.phone != "" && payload.role_id == 6) {
								this.addCarblipAssignedPhone(formsValue.phone, data.id);
								this.claimAvailablePhoneNumbers(formsValue.phone);
							}
							this.dialogRef.close(data);
						}
					});
			}
			this.store$.dispatch(new logActions.GetList(initialLogState.filter));
		}
	}

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

	toggleVisibility(index: number) {
		if (this.visible[index]) {
		  this.inputType[index] = 'password';
		  this.visible[index] = false;
		  this._cdr.markForCheck();
		} else {
		  this.inputType[index] = 'text';
		  this.visible[index] = true;
		  this._cdr.markForCheck();
		}
	}

	addPostFixForConcierge($event: any) {
		const { value } = this.itemForm;
		if(value.role === 'concierge') {
			this.emailPattern = "[A-Z0-9a-z._%+-]{2,64}";
			this.itemForm.get('phone').disable();
			this.itemForm.get('phone').reset();
			this.itemForm.get('areacode').reset();
			this.itemForm.get('contains').reset();

			this.itemForm.get('phone').setValidators([Validators.required]);
			this.itemForm.get('areacode').setValidators([Validators.required]);

			if(value.email == "") {
				const suggestedEmail = value.first_name.charAt(0) + value.last_name;
				this.itemForm.patchValue({ email: suggestedEmail.toLowerCase() })
			}
		} else {
			this.emailPattern = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,64}";
		}
		this.itemForm.get('email').markAsTouched();
	}

	getAvailablePhoneNumbers(areacode: string, contains: string) {
		this.service$.getAvailablePhoneNumbers(areacode, contains).subscribe(res => {
			if(res) {
				if(res.data.length > 0) {
					this.listOfAvailablePhoneNumbers = res.data;
					this.filteredListOfAvailablePhoneNumbers = res.data;
					this.loadingPhones = false;
					this.itemForm.get('phone').enable();
					this._cdr.detectChanges();
				} else {
					this.listOfAvailablePhoneNumbers = [];
					this.itemForm.get('phone').enable();
					this.loadingPhones = false;
					this._cdr.detectChanges();
				}
			}
		}, error=> {
			console.log(error);
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

	getSelectedAreaCode($event: any) {
		this.loadingPhones = true;
		this.getAvailablePhoneNumbers($event.option.value, this.itemForm.get('contains').value);
	}

	searchAvailableNumbers($event: any) {
		if($event.keyCode == 8 || $event.key == "0" || Number($event.key) && (this.itemForm.get('contains').value == null || this.itemForm.get('contains').value.length < 7)) {
			clearTimeout(this.timeout);
			this.timeout = setTimeout(() => {
				this.itemForm.get('phone').disable();
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
					this.itemForm.get('phone').disable();
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

	addCarblipAssignedPhone(phone: string, userid: number) {
		this.service$.storeCarblipAssignedNumber(phone, userid).subscribe();
	}
}
