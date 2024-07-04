import { getBusinessVerticle } from "../../../utility/store/selectors/business-vertical.selector";
import { Store } from "@ngrx/store";
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { fadeAnimation } from "../../../animations";
import { ValidationConstants } from "../../../utility/configs/app.constants";
import { SnackBarService } from "../../../utility/services/snack-bar.service";
//import { UserService } from '../shared/services/user.service';
import { TemplateService } from "../shared/services/template.service";
import { State } from "../../../utility/store/reducers";
import { getDefaultAccountId } from "../../../utility/store/selectors/account.selector";
import { Irole } from "../../../utility/store/interfaces/role";
import { getRoles } from "../../../utility/store/selectors/roles.selector";
import { SETTINGS_LN } from "../../shared/settings.lang";
//import { GetUser_response } from './../shared/interfaces/get-user';
import { GetUser_response } from "../../permission/shared/interfaces/get-user";
import { getUserEmail } from "../../../utility/store/selectors/user.selector";
import { Subscription } from "rxjs";

import { CountryCodes } from "../../../auth/register/countrycodes";
import { MatOptionSelectionChange } from "@angular/material/core";

@Component({
  selector: "app-add-custom-field-template",
  templateUrl: "./add-custom-field-template.component.html",
  styleUrls: ["./add-custom-field-template.component.scss"],
  animations: [fadeAnimation],
})
export class AddCustomField implements OnInit, OnChanges, OnDestroy {
  editUserForm!: FormGroup;
  newUser!: any;
  isLoading = false;
  selected2 = "pankaj";
  roles: Irole[] = [];
  businessverticals!: any[];
  countrycodes = CountryCodes;
  rolesData: any;
  rolesArray: any;
  dataSource = [
    {
      DummyKey1: "Dummy Data",
      DummyKey2: "Dummy Data2",
    },
  ];
  displayedColumns = ["Component", "typeOfComponent", "hideIfZero", "Rule"];
  @Input() edit: boolean = false;
  @Input() userEmail!: string;
  @Input() isOpen: boolean = false;

  @Output() statusChange = new EventEmitter();
  @Output() userUpdate = new EventEmitter();

  getaccountrole: any;
  user!: GetUser_response["data"] | null;
  accountID!: string;
  isCurrentUser!: boolean;

  ln = SETTINGS_LN;

  isDisabled = false;
  userAPISubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private userServ: TemplateService,
    private snackBar: SnackBarService,
    private store: Store<State>
  ) {}
  onCategorySelection(role: any) {
    this.getaccountrole = role;
  }
  initForm() {
    this.editUserForm = this.fb.group({
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
          Validators.required,
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
      roletypeid: [""],
      accountroleid: [""],
      designationname: [""],
      businessverticalid: [""],
      practicename: [""],
      mobilenumber: [
        "",
        [
          Validators.required,
          Validators.minLength(
            ValidationConstants.userAccountStrategy.PHONE_MIN_LENGTH
          ),
          Validators.pattern(
            ValidationConstants.userAccountStrategy.PHONE_PATTERN
          ),
        ],
      ],
      locationname: [""],
      isd: ["", [Validators.required]],
    });
  }

  get firstname(): AbstractControl {
    return this.editUserForm.get("firstname") as FormControl;
  }
  get middlename(): AbstractControl {
    return this.editUserForm.get("middlename") as FormControl;
  }
  get lastname(): AbstractControl {
    return this.editUserForm.get("lastname") as FormControl;
  }
  get email(): AbstractControl {
    return this.editUserForm.get("email") as FormControl;
  }
  get roletypeid(): AbstractControl {
    return this.editUserForm.get("roletypeid") as FormControl;
  }
  get designationname(): AbstractControl {
    return this.editUserForm.get("designationname") as FormControl;
  }
  get businessverticalid(): AbstractControl {
    return this.editUserForm.get("businessverticalid") as FormControl;
  }
  get practicename(): AbstractControl {
    return this.editUserForm.get("practicename") as FormControl;
  }
  get mobilenumber(): AbstractControl {
    return this.editUserForm.get("mobilenumber") as FormControl;
  }
  get locationname(): AbstractControl {
    return this.editUserForm.get("locationname") as FormControl;
  }
  get isd(): AbstractControl {
    return this.editUserForm.get("isd") as FormControl;
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {}

  prefillUser() {}

  editUser() {}

  statusChanged(status: number) {}

  userUpdated() {}

  reloadForm() {}

  ngOnDestroy() {}
}
