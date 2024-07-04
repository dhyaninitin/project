import { getBusinessVerticle } from "./../../../utility/store/selectors/business-vertical.selector";
import { Store } from "@ngrx/store";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { ValidationConstants } from "../../../utility/configs/app.constants";
import { SnackBarService } from "../../../utility/services/snack-bar.service";
import { fadeAnimation } from "../../../animations";
import { MatDialogRef } from "@angular/material/dialog";
import { State } from "../../../utility/store/reducers";
import { getDefaultAccountId } from "../../../utility/store/selectors/account.selector";
import { getRoles } from "../../../utility/store/selectors/roles.selector";
import { SETTINGS_LN } from "../../shared/settings.lang";
import { CountryCodes } from "../../../auth/register/countrycodes";
import { TemplateService } from "../shared/services/template.service";
export interface User {
  //name: string;

  [x: string]: boolean;
}

interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: "app-add-new-template",
  templateUrl: "./add-new-template.component.html",
  styleUrls: ["./add-new-template.component.scss"],
})
export class AddNewTemplateComponent implements OnInit {
  addUserForm!: FormGroup;
  newUser!: any;
  isLoading = false;
  designationData: any;
  practiceData: any;
  ln = SETTINGS_LN;
  searchValue: any;
  searchPracticeValue: any;

  @Output() userAdded = new EventEmitter();
  countrycodes = CountryCodes;
  isd: any;

  // getting countrycode value

  getCountryCode(value: string) {
    this.isd = value;
  }
  constructor(
    private fb: FormBuilder,
    private userServ: TemplateService,
    private snackBar: SnackBarService,
    public dialogRef: MatDialogRef<AddNewTemplateComponent>,
    private store: Store<State>
  ) {}

  // selecter
  foods: Food[] = [
    { value: "steak-0", viewValue: "Designation" },
    { value: "pizza-1", viewValue: "Admin" },
    { value: "tacos-2", viewValue: "Practice" },
  ];

  // autocompleet
  myControl = new FormControl();
  /* options: User[] = [
    { name: "" },
    { name: '' },
    { name: '' }
  ];*/
  filteredOptions: Observable<User[]> | undefined;
  accountID!: string;
  roles!: any[];
  rolesData: any;
  businessverticals!: any[];

  ngOnInit() {}

  displayFn(user: User) {
    //return user && user.name ? user.name : '';
  }

  private _filter(name: string) {
    const filterValue = name.toLowerCase();

    //return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  initForm() {
    this.addUserForm = this.fb.group({
      firstname: [
        "",
        [
          Validators.required,
          Validators.minLength(
            ValidationConstants.userAccountStrategy.NAME_MIN_LENGTH
          ),
          Validators.maxLength(
            ValidationConstants.userAccountStrategy.NAME_MAX_LENGTH
          ),
        ],
      ],
      middlename: [
        "",
        [
          Validators.minLength(
            ValidationConstants.userAccountStrategy.NAME_MIN_LENGTH
          ),
          Validators.maxLength(
            ValidationConstants.userAccountStrategy.NAME_MAX_LENGTH
          ),
        ],
      ],
      lastname: [
        "",
        [
          Validators.minLength(
            ValidationConstants.userAccountStrategy.NAME_MIN_LENGTH
          ),
          Validators.maxLength(
            ValidationConstants.userAccountStrategy.NAME_MAX_LENGTH
          ),
        ],
      ],
      email: [
        "",
        [
          Validators.required,
          Validators.pattern(
            ValidationConstants.userEmailStrategy.EMAIL_PATTERN
          ),
        ],
      ],
      roletypeid: ["", [Validators.required]],
      designationname: [""],
      businessverticalid: [""],
      practicename: [""],
      isd: [""],
      mobilenumber: [
        "",
        [
          Validators.minLength(
            ValidationConstants.userAccountStrategy.PHONE_MIN_LENGTH
          ),
          Validators.pattern(
            ValidationConstants.userAccountStrategy.PHONE_PATTERN
          ),
        ],
      ],
      locationname: [""],
    });
  }

  get firstname(): AbstractControl {
    return this.addUserForm.get("firstname") as FormControl;
  }
  get middlename(): AbstractControl {
    return this.addUserForm.get("middlename") as FormControl;
  }
  get lastname(): AbstractControl {
    return this.addUserForm.get("lastname") as FormControl;
  }
  get email(): AbstractControl {
    return this.addUserForm.get("email") as FormControl;
  }
  get roletypeid(): AbstractControl {
    return this.addUserForm.get("roletypeid") as FormControl;
  }
  get designationname(): AbstractControl {
    return this.addUserForm.get("designationname") as FormControl;
  }
  get businessverticalid(): AbstractControl {
    return this.addUserForm.get("businessverticalid") as FormControl;
  }
  get practicename(): AbstractControl {
    return this.addUserForm.get("practicename") as FormControl;
  }

  get mobilenumber(): AbstractControl {
    return this.addUserForm.get("mobilenumber") as FormControl;
  }
  get locationname(): AbstractControl {
    return this.addUserForm.get("locationname") as FormControl;
  }
  get isdCode(): AbstractControl {
    return this.addUserForm.get("isd") as FormControl;
  }

  addUser() {}
  autoSearchDesignation() {}

  autoSearchPractice() {}
}
