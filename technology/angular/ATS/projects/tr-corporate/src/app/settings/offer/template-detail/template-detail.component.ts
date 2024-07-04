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
  ChangeDetectorRef,
  ViewChild,
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
import { MatDrawer } from "@angular/material/sidenav";
import { DesignService } from "../../../utility/services/design.service";
import { TemplateComponent } from "../template/template.component";
import { ComponentsElement } from "../shared/interfaces/offer-component";
import { TEMPLATE_TYPE } from "../shared/enums/enums";

@Component({
  selector: "app-template-detail",
  templateUrl: "./template-detail.component.html",
  styleUrls: ["./template-detail.component.scss"],
  animations: [fadeAnimation],
})
export class TemplateDetailComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(TemplateComponent) template!:TemplateComponent;
  @Input() templateDetail: any;
  components: ComponentsElement[] = [];
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
      Component: "Basic Pay",
      typeOfComponent: "Informative",
      Rule: "Rule Added",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam diam erat et justo. A, eu, facilisis ornare fermentum, auctor. Est cras montes, ipsum, mi laoreet at quam egestas lacus. Magna volutpat ut ultricies ac pulvinar tempor.",
    },
    {
      Component: "HRA",
      typeOfComponent: "Postive",
      Rule: "",
    },
    {
      Component: "Transport Allowance",

      typeOfComponent: "Informative",
      Rule: "Rule Added",
    },
    {
      Component: "Provident Fund",

      typeOfComponent: "Postive",
      Rule: "",
    },
  ];
  expandedElement = {
    Component: "Basic Pay",
    typeOfComponent: "Informative",
    Rule: "Rule Added",
  };
  innerDisplayedColumns = [];
  columnsToDisplay = ["Component", "typeOfComponent", "hideIfZero", "Rule"];
  @Input() edit: boolean = false;
  @Input() userEmail!: string;
  @Input() isOpen: boolean = false;
  viewEdit: boolean = false;
  @ViewChild(MatDrawer, { static: false }) drawer!: MatDrawer;
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
    private cd: ChangeDetectorRef,
    public designService: DesignService,
    private snackBar: SnackBarService,
    private templateService: TemplateService
  ) {}
  onCategorySelection(role: any) {
    this.getaccountrole = role;
  }
  
  ngOnInit(): void {
    if(this.templateDetail.templatetype === TEMPLATE_TYPE.BASED_ON_OFFER) {
      this.columnsToDisplay = ["Component", "typeOfComponent", "hideIfZero"];
    }
    this.loadOfferComponents(this.templateDetail.templateid);
  }

  ngOnChanges(changes: SimpleChanges) {}


  prefillUser() {}

  editUser() {}

  statusChanged(status: number) {}

  userUpdated() {}

  reloadForm() {}

  ngOnDestroy() {}

  toggleRow(element: any) {
    this.cd.detectChanges();
  }

  applyFilter(filterValue: string) {}
  viewEditPage() {
    this.drawer.open();
    this.viewEdit = true;
  }
  toggleSideMenu() {
    this.drawer.close();
    this.viewEdit = false;
  }

  refreshOfferList(event:any) {
    this.viewEdit = false;
    this.drawer.close();
  }

  loadOfferComponents(templateid: string){
    this.templateService.getComponentsByTempId(templateid).subscribe( res => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.components = res.data;
      }
    })
  }
}
