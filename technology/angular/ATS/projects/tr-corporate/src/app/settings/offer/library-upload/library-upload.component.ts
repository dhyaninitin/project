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
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Observable, of } from "rxjs";

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
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ROUTE_CONFIGS } from "../../../utility/configs/routerConfig";
import { MatTableDataSource } from "@angular/material/table";

import { CountryCodes } from "../../../auth/register/countrycodes";
import { MatOptionSelectionChange } from "@angular/material/core";
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  FileSystemDirectoryEntry,
} from "ngx-file-drop";
import { Router } from "@angular/router";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { LibraryService } from "../shared/services/library.service";
import { DocumentI } from "../shared/interfaces/documents";
@Component({
  selector: "app-library-upload",
  templateUrl: "./library-upload.component.html",
  styleUrls: ["./library-upload.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class LibraryUploadComponent implements OnInit {
  documentsList: DocumentI[] = [];
  reviseDocsList: DocumentI[] = [];
  @Output() closeDrwaer = new EventEmitter<boolean>(false);
  @Output() addDocumentFromLib = new EventEmitter<{}>();

  editUserForm!: FormGroup;
  newUser!: any;
  isLoading = false;
  selected2 = "pankaj";
  roles: Irole[] = [];
  businessverticals!: any[];
  route_conf = ROUTE_CONFIGS;
  countrycodes = CountryCodes;
  rolesData: any;
  rolesArray: any;
  @Input() edit: boolean = false;
  @Input() userEmail!: string;
  @Input() isOpen: boolean = false;
  dataimage: any;

  @ViewChild("fileInput")
  fileInput!: ElementRef;
  fileAttr = "";
  @Output() statusChange = new EventEmitter();
  @Output() userUpdate = new EventEmitter();

  getaccountrole: any;
  user!: GetUser_response["data"] | null;
  accountID!: string;
  isCurrentUser!: boolean;
  displayedColumns = ["document", "uploadedBy", "action"];

  innerDisplayedColumns = ["docs", "mailId", "actionBtn"];
  expandedElement: any | null;
  dataSource!: MatTableDataSource<any>;
  ln = SETTINGS_LN;

  isDisabled = false;
  userAPISubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private libraryService: LibraryService,
    private snackBar: SnackBarService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cd: ChangeDetectorRef,

    private store: Store<State>
  ) {}

  onCategorySelection(role: any) {
    this.getaccountrole = role;
  }
 

  uploadFileEvt(imgFile: any) {}

  ngOnInit(): void {
    this.getDocuments();
  }
 
  ngOnChanges(changes: SimpleChanges) {}
  toggleRow(element: any) {
    if (this.expandedElement === element) {
      this.expandedElement = null;
      return;
    }
    this.expandedElement = element;
    if(this.expandedElement){
      this.getReviseDocuments(element.offerdocumentid);
    }
    this.cd.detectChanges();
  }

  prefillUser() {
    this.isDisabled = true;
  }

  editUser() {
    this.editUserForm.markAllAsTouched();
  }

  statusChanged(status: number) {}

  userUpdated() {}

  public files: NgxFileDropEntry[] = [];

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
  }

  public fileOver(event: any) {
    console.log(event);
  }

  public fileLeave(event: any) {
    console.log(event);
  }

  getDocuments() {
    this.libraryService.getDocument(0, 0, 'allnonactive', '', '').subscribe((res: any) => {
      if (res.error) {
        this.snackBar.open(res.message)
      } else {
        this.documentsList = res.data
      }
    })
  }

  getReviseDocuments(offerdocumentid: string){
    this.libraryService.getReviseDocument(offerdocumentid).subscribe(res => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.snackBar.open(res.message);
        this.reviseDocsList = res.data;
        if(res.data.length <= 0){
          this.expandedElement = null
        }
      }
    })
  }

  addDocumentToOffer(element: any) {
    this.addDocumentFromLib.emit(element);
    this.close();
  }

  close() {
    this.closeDrwaer.emit(true)
  }

   reloadForm() {}

  ngOnDestroy() {}
}
