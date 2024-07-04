import { Router } from "@angular/router";
import { getUserEmail } from "./../../../utility/store/selectors/user.selector";
import { MatSort } from "@angular/material/sort";
import { Store } from "@ngrx/store";
import { MatDrawer } from "@angular/material/sidenav";
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  QueryList,
  ViewChildren,
  TemplateRef,
  Renderer2,
} from "@angular/core";
import { MatTable } from "@angular/material/table";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";

// ngrx
import { State } from "../../../utility/store/reducers";
import { getDefaultAccountId } from "../../../utility/store/selectors/account.selector";

// Mat table
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";

// Mat modal
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
//import { AddUserComponent } from '../add-user/add-user.component';
import { AddNewTemplateComponent } from "../add-new-template/add-new-template.component";
// Services
import { SnackBarService } from "../../../utility/services/snack-bar.service";
//import { UserListService } from '../shared/services/user-list.service';
import { TFilterComponent } from "../TFilterComponent/t-filter.component";
import { TemplateService } from "../shared/services/template.service";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { fadeAnimation } from "../../../animations";
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  FileSystemDirectoryEntry,
} from "ngx-file-drop";

import { SETTINGS_LN } from "../../shared/settings.lang";
import { ROUTE_CONFIGS } from "../../../utility/configs/routerConfig";
import { DesignService } from "../../../utility/services/design.service";
import { UtilityService } from "../../../utility/services/utility.service";
import { TranslatePipe } from "@cloudtalentrecruit/ng-core";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
// enums
//import { checStatus } from '../shared/interfaces/delete-user';
//import { userStatus } from '../shared/interfaces/update-user-status';
import { TemplateListService } from "../shared/services/template-list.service";
import { LibraryService } from "../shared/services/library.service";
import { Get_CustomFields_Response } from "../shared/interfaces/custom-fields";
import { ConditionalExpr } from "@angular/compiler";
import { DocumentI, ReviseDoc } from "../shared/interfaces/documents";
import { UploadImageService } from "../../../account/shared/upload-image.service";
import { v1 as uuidv1 } from "uuid";
import { DomSanitizer } from "@angular/platform-browser";
@Component({
  selector: "app-offer-library",
  templateUrl: "./offer-library.component.html",
  styleUrls: ["./offer-library.component.scss"],
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
export class OfferLibraryComponent implements OnInit {
  ln = SETTINGS_LN;
  route_conf = ROUTE_CONFIGS;
  event: any;
  toggle = false;
  isShowDivIf = false;
  isEditEnable: boolean = true; // to show and hide the edit button
  selected = new FormControl(0);
  totalTemplates: number = 0;
  pageSize = 5;
  templateid: string = "";
  currentLimit: number = 5;
  currentPage: number = 1;
  isEditView: any;
  customFieldResponse: Get_CustomFields_Response[] = [];
  documentsList: DocumentI[] = [];
  totalDocuments: number = 0;
  customFieldsForm!: FormGroup;
  searchText: string = "";
  selectedCustomSort = "";
  isEditDocName: any;
  addCustomFields!: FormGroup;

  status = [
    { value: "", viewValue: this.ln.TXT_ALL },
    { value: "0", viewValue: this.ln.TXT_DEACTIVE },
    { value: "1", viewValue: this.ln.TXT_ACTIVE },
    { value: "2", viewValue: this.ln.TXT_PENDING },
  ];
  sorts = [
    { value: "", viewValue: "None" },
    { value: "pdf", viewValue: this.ln.TXT_PDF },
    { value: "jpg", viewValue: "JPG" },
  ];
  sortByDocs = [
    { value: "", viewValue: "None" },
    { value: "name", viewValue: this.ln.TXT_NAME },
    { value: "active", viewValue: "Active" },
    { value: "non-active", viewValue: "Non-Active" },
  ];

  sortByCustom = [
    { value: "", viewValue: "None" },
    { value: "fieldname", viewValue: "Field Name" },
    { value: "status", viewValue: this.ln.TXT_STATUS },
  ];

  emails: string[] = [];

  role!: any[];
  isShown: boolean = false;
  selectedStatus!: number;
  selectedRole!: number;
  selectedDocTypeSort = "";
  selectedDocSort = "";
  searchDocument: string = "";
  displayedColumns: string[] = [
    "check",
    "document",
    "email",
    "lastupdated",
    "action",
  ];
  displayedColumn: string[] = [
    "checks",
    "fieldName",
    "inputType",
    "parentField",
    "templateFor",
    "mandatory",
    "status",
    "actions",
  ];
  innerDisplayedColumns = ["documentname", "mail", "action"];
  reviseDocs: ReviseDoc[] = [];
  expandedElement: any | null;
  dataSource!: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
  addUserModalRef!: MatDialogRef<AddNewTemplateComponent>;
  totalUsers: number = 0;
  currentUser!: any;
  associate!: any;
  associateuser!: boolean;
  currentUserEdit!: boolean;
  viewLibrary: boolean = false;
  viewCustom: boolean = false;
  isEditCustomField: any;

  viewLibraryTemplates: boolean = false;
  hideUserActionMenu = true;
  isActionDoing = false;
  isLoading = false;
  action: string = "";
  accountID!: string;
  actions: any = [
    { value: "0", viewValue: this.ln.TXT_DEACTIVATE },
    { value: "1", viewValue: this.ln.TXT_ACTIVATE },
    { value: "1", viewValue: this.ln.TXT_DELETE },
  ];
  loggedinUserEmail!: string;
  @ViewChild("dialogRef")
  dialogRef!: TemplateRef<any>;
  myFooLists = [
    "Some Item",
    "Item Second",
    "Other In Row",
    "What to write",
    "Blah To Do",
  ];
  @ViewChild("dialogRefs")
  dialogRefs!: TemplateRef<any>;
  deleteCustomFieldText = "Custom Fields";

  @ViewChild("dialogDocument")
  dialogDocument!: TemplateRef<any>;
  deleteDocumentText = "Document";

  myFooList = [
    "Some Item",
    "Item Second",
    "Other In Row",
    "What to write",
    "Blah To Do",
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatDrawer, { static: false }) drawer!: MatDrawer;
  @ViewChild("modalRefElement", { static: false }) modalRefElement!: ElementRef;
  // @ViewChildren('innerSort') innerSort: QueryList<MatSort>;

  // @ViewChildren('innerTables') innerTables: QueryList<MatTable<Inner>>;
  // Mobile View
  isLoadingMore: boolean = false;
  isRateLimitReached: boolean = true;
  customfieldid: string = "";
  offerdocumentid: string = "";
  totalCustomFields: number = 0;
  ismandatory: any = 0;
  isactive: any = 0;
  isEditForm: boolean = false;
  files!: NgxFileDropEntry[];
  droppedDocumentName!: any;
  droppedDocumentExtention: any;
  droppedDocumentSize: any;
  timeout: any;
  templateList: any = [];
  documentNameInput: string = "";
  selectedDocumentDetail: any;
  extension: any;
  uploadReviseDoc: boolean = false;
  offerDocPayload: any;
  allCustomFieldsList: any;
  caseTitle: string = "";
  caseTitle2: string = "";
  data: any;
  configDropdown: boolean = false;
  configText: boolean = false;
  masterDropDownValues: any;
  constructor(
    private userlistServ: TemplateListService,
    private store: Store<State>,
    public dialog: MatDialog,
    private snackBar: SnackBarService,
    private translater: TranslatePipe,
    private _bottomSheet: MatBottomSheet,
    public designService: DesignService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private util: UtilityService,
    private cd: ChangeDetectorRef,
    private libraryServ: LibraryService,
    private _cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private templatelistService: TemplateListService,
    private templateService: TemplateService,
    private uploadImageService: UploadImageService,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.getDocuments(
      this.currentPage,
      this.currentLimit,
      this.searchDocument,
      this.selectedDocSort,
      this.selectedDocTypeSort
    );
  }

  initForm() {
    this.customFieldsForm = this.fb.group({
      fieldname: ["", [Validators.required]],
      fieldtype: ["", [Validators.required]],
      parentid: [""],
      offertemplateid: ["", [Validators.required]],
      ismandatory: 0,
      isactive: 0,
    });
  }

  get fieldname(): AbstractControl {
    return this.customFieldsForm.get("fieldname") as FormControl;
  }
  get fieldtype(): AbstractControl {
    return this.customFieldsForm.get("fieldtype") as FormControl;
  }
  get parentid(): AbstractControl {
    return this.customFieldsForm.get("parentid") as FormControl;
  }
  get offertemplateid(): AbstractControl {
    return this.customFieldsForm.get("offertemplateid") as FormControl;
  }

  public offerDocFile: File | undefined;
  public offerDocUrl: string = "";

  public dropped(files: NgxFileDropEntry[]) {
    this.getFileInfo(files);
  }

  public fileOver(event: any) {
    console.log(event);
  }

  public fileLeave(event: any) {
    console.log(event);
  }
  toggleDisplayDivIf() {
    this.isShowDivIf = !this.isShowDivIf;
  }
  ngAfterViewInit(): void {}

  preventDefault(e: Event) {
    e.preventDefault();
  }

  // Mobile filter & sorting
  openBottomSheet(): void {}

  // Mobile floating icon
  toggleFab() {
    this.toggle = !this.toggle;
  }

  addUserModal() {
    this.addUserModalRef = this.dialog.open(AddNewTemplateComponent, {
      autoFocus: false,
      panelClass: "modal",
    });
    this.addUserModalRef.afterClosed();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.filter(
      (user) => user.roletypeid !== 1
    ).length;
    return numSelected === numRows;
  }

  // Select all

  masterToggle() {}

  deactivate() {}
  activate() {}

  delete() {}

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${
      row.position + 1
    }`;
  }

  loadUsers(accountId: string) {
    // If the user changes the sort order, reset back to the first page.
  }

  deactivateUsers(emails: string[]) {
    this.toggleUserActionMenu();
  }

  // for activate - Bulk action
  activateUsers(emails: string[]) {}

  // for bulk delete

  deleteUsers(emails: string[], i: number) {}

  deleteUser(email: any, i: number) {}

  // deactivate for single user
  deactivateUser(email: any) {}

  // activate for single user

  activateUser(email: any) {}

  reinviteUser(email: any) {}

  // Desktop more btn
  toggleUserActionMenu() {
    this.hideUserActionMenu = false;
    setTimeout(() => {
      this.hideUserActionMenu = true;
    }, 100);
  }

  viewTemplate(element: any) {
    this.selectedDocumentDetail = element;
    this.drawer.open();
    this.viewLibrary = true;
    this.viewLibraryTemplates = false;
    this.viewCustom = false;
  }
  viewLibraryTemplate() {
    this.router.navigate(["/dashboard/settings/offer/library/template"]);
  }
  viewCustomTemp() {
    this.drawer.open();
    this.viewLibraryTemplates = false;
    this.viewLibrary = false;
    this.viewCustom = true;
  }

  onEditConfirm(customfieldid: string) {
    this.customFieldsForm.markAllAsTouched();
    this.customFieldsForm.markAsDirty();
    if (this.customFieldsForm.valid) {
      const { value } = this.customFieldsForm;
      const payload = {
        fieldname: value.fieldname,
        fieldtype: value.fieldtype,
        parentid: value.parentid,
        offertemplateid: value.offertemplateid,
        ismandatory: this.ismandatory,
        isactive: this.isactive,
        customfieldid: customfieldid,
      };
      this.libraryServ.updateCustomFields(payload).subscribe((res) => {
        if (res.error) {
          this.snackBar.open(res.message);
        } else {
          this.snackBar.open(res.message);
          this.getCustomFields(
            this.currentPage,
            this.currentLimit,
            this.searchText,
            this.selectedCustomSort
          );
        }
      });
      this.isEditForm = false;
    }
  }

  onEdit() {}

  editDocument(element: any) {
    this.isEditEnable = !this.isEditEnable;
    this.isEditDocName = element;
    this.documentNameInput = element.documentoriginalname;
  }

  onEditCancel() {
    this.isEditEnable = !this.isEditEnable;
    this.isEditDocName = {};
  }

  onEditConfirmForDoc(element: any) {
    this.isEditEnable = !this.isEditEnable;
    this.isEditDocName = {};
    const payload = {
      offerdocumentid: element.offerdocumentid,
      documentoriginalname: this.documentNameInput,
    };
    this.updateDocument(payload);
  }

  changeDocumentStatus(offerdocumentid: string, status: number) {
    status = status == 1 ? 0 : 1;
    const payload = {
      offerdocumentid: offerdocumentid,
      status: status,
    };
    this.updateDocument(payload);
  }

  updateDocument(payload: any) {
    this.libraryServ.updateDocumentById(payload).subscribe((res) => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.getDocuments(
          this.currentPage,
          this.currentLimit,
          this.searchDocument,
          this.selectedDocSort,
          this.selectedDocTypeSort
        );
      }
    });
  }

  onCross() {
    this.isEditCustomField = false;
    this.isEditForm = false;
  }

  isMandatoryStatus(customfieldid: string, ismandatory: number) {
    ismandatory = ismandatory == 1 ? 0 : 1;
    this.ismandatory = ismandatory;
    if (!this.isEditForm) {
      const payload = {
        customfieldid: customfieldid,
        ismandatory: ismandatory,
      };
      this.libraryServ.updateCustomFields(payload).subscribe((res) => {
        if (res.error) {
          this.snackBar.open(res.message);
        } else {
          this.getCustomFields(
            this.currentPage,
            this.currentLimit,
            this.searchText,
            this.selectedCustomSort
          );
        }
      });
    }
  }

  isActiveStatus(customfieldid: string, isactive: number) {
    isactive = isactive == 1 ? 0 : 1;
    this.isactive = isactive;
    if (!this.isEditForm) {
      const payload = {
        customfieldid: customfieldid,
        isactive: isactive,
      };
      this.libraryServ.updateCustomFields(payload).subscribe((res) => {
        if (res.error) {
          this.snackBar.open(res.message);
        } else {
          this.getCustomFields(
            this.currentPage,
            this.currentLimit,
            this.searchText,
            this.selectedCustomSort
          );
        }
      });
    }
  }

  editUser(element: any, evt?: Event) {
    this.currentUserEdit = true;
    // this.viewUserPermission = false;
    this.drawer.open();
    this.designService.setDrawerOpen(true);
  }

  toggleShow() {
    this.isShown = !this.isShown;
  }

  onHeaderSort() {
    this.getCustomFields(
      this.currentPage,
      this.currentLimit,
      this.searchText,
      this.selectedCustomSort
    );
  }

  onSelectedDocSort() {
    this.getDocuments(
      this.currentPage,
      this.currentLimit,
      this.searchDocument,
      this.selectedDocSort,
      this.selectedDocTypeSort
    );
  }

  changeStatus(emitted: any) {}

  // User update drawer closed
  userUpdated(emitted: any) {
    this.drawer.close();
  }

  // User add drawer closed
  userAdded() {
    return;
  }

  toggleSideMenu() {
    this.designService.setDrawerOpen(false);
  }

  contentScrollYEvt() {
    if (window.innerWidth < 250) {
      if (
        !this.isRateLimitReached &&
        !this.isLoadingMore &&
        this.util.isMobile()
      ) {
        this.paginator.pageIndex++;
        this.isLoadingMore = true;
        this.loadUsers(this.accountID);
        this.cdRef.detectChanges();
      }
    }
  }

  toggleRow(element: any) {
    if (this.expandedElement === element) {
      this.expandedElement = null;
      return;
    }
    this.expandedElement = element;
    this.cd.detectChanges();
    if (this.expandedElement) {
      this.getReviseDocuments(element.offerdocumentid);
    }
  }

  getReviseDocuments(offerdocumentid: string) {
    this.libraryServ.getReviseDocument(offerdocumentid).subscribe((res) => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.snackBar.open(res.message);
        this.reviseDocs = res.data;
        if (res.data.length <= 0) {
          this.expandedElement = null;
        }
      }
    });
  }

  upload(id: string) {
    this.offerdocumentid = id;
    this.uploadReviseDoc = true;
    const myTempDialog = this.dialog.open(this.dialogRef, {
      data: this.myFooLists,
    });
  }

  applyFilter(filterValue: string) {}
  exportCsv() {
    return;
  }
  exportExcel() {
    return;
  }
  exportPdf() {
    return;
  }

  checkTemplates = false;
  onCustomFieldClick($event: any) {
    this.currentPage = 1;
    this.currentLimit = 5;
    if ($event.index == 1) {
      this.searchText = "";
      this.checkTemplates = true;
      this.getCustomFields(1, 5, this.searchText, "");
      this.getAllTemplates(1, 1000, "active", "");
    } else {
      this.checkTemplates = false;
      this.getDocuments(
        this.currentPage,
        this.currentLimit,
        this.searchDocument,
        this.selectedDocSort,
        this.selectedDocTypeSort
      );
    }
  }

  searchTemplates() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.getCustomFields(
        this.currentPage,
        this.currentLimit,
        this.searchText,
        this.selectedCustomSort
      );
    }, 1000);
  }

  onEditCustomField(element: any) {
    this.isEditForm = true;
    this.isEditCustomField = element;
    this.customFieldsForm.patchValue(element);
  }

  deleteDocument(id: string) {
    this.offerdocumentid = id;
    const myTempDialog = this.dialog.open(this.dialogRefs, {
      data: this.myFooList,
    });
  }

  removeDocument(event: any) {
    if (event) {
      this.libraryServ
        .deleteDocumentById(this.offerdocumentid)
        .subscribe((res) => {
          if (res.error) {
            this.snackBar.open(res.message);
          } else {
            this.snackBar.open(res.message);
            this.deleteAllReviseDocs(this.offerdocumentid);
            this.getDocuments(
              this.currentPage,
              this.currentLimit,
              this.searchDocument,
              this.selectedDocSort,
              this.selectedDocTypeSort
            );
            this.dialog.closeAll();
          }
        });
    }
  }

  deleteAllReviseDocs(offerdocumentid: string) {
    this.libraryServ
      .deleteAllReviseDocs(this.offerdocumentid)
      .subscribe((res) => {
        if (res.error) {
          this.snackBar.open(res.message);
        }
      });
  }

  deleteCustomField(id: string) {
    this.customfieldid = id;
    const myTempDialog = this.dialog.open(this.dialogDocument, {
      data: this.myFooList,
    });
  }

  removeCustomField(event: any) {
    if (event) {
      this.libraryServ
        .deleteCustomFieldById(this.customfieldid)
        .subscribe((res) => {
          if (res.error) {
            this.snackBar.open(res.message);
          } else {
            this.getCustomFields(
              this.currentPage,
              this.currentLimit,
              this.searchText,
              this.selectedCustomSort
            );
            this.dialog.closeAll();
          }
        });
    }
  }

  loadItems(event: any) {
    if (event) {
      this.getCustomFields(
        this.currentPage,
        this.currentLimit,
        this.searchText,
        this.selectedCustomSort
      );
    }
    this.viewCustom = false;
    this.drawer.close();
  }

  changePage(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.currentLimit = event.pageSize;
    this.getCustomFields(
      this.currentPage,
      this.currentLimit,
      this.searchText,
      this.selectedCustomSort
    );
  }

  changeDocumentPage(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.currentLimit = event.pageSize;
    this.getDocuments(
      this.currentPage,
      this.currentLimit,
      this.searchDocument,
      this.selectedDocSort,
      this.selectedDocTypeSort
    );
  }

  getDocuments(
    pageNumber: number,
    limit: number,
    searchText: string,
    sortBy: string,
    sortByDocType: string
  ) {
    this.libraryServ
      .getDocument(pageNumber, limit, searchText, sortBy, sortByDocType)
      .subscribe((res: any) => {
        if (res.error) {
          this.snackBar.open(res.message);
        } else {
          this.documentsList = res.data;
          this.getDocumentCounts();
        }
      });
  }

  getDocumentCounts() {
    this.libraryServ
      .getOfferDocumentsCount(this.searchDocument)
      .subscribe((res: any) => {
        if (res.error) {
          this.snackBar.open(res.message);
        } else {
          this.totalDocuments = res.data[0].count;
          this.snackBar.open(res.message);
        }
      });
  }

  getCustomFields(
    pageNumber: number,
    limit: number,
    searchText: string,
    sortBy: string
  ) {
    this.libraryServ
      .getCustomFields(pageNumber, limit, searchText, sortBy)
      .subscribe((res: any) => {
        if (res.error) {
          this.snackBar.open(res.message);
          this.totalCustomFields = 0;
        } else {
          this.customFieldResponse = res.data;
          this.getCustomFieldsCount();
          this.getAllActiveCustomFields(1, 0, "", "");
        }
      });
  }

  getCustomFieldsCount() {
    this.libraryServ
      .getCustomFieldsCount(this.searchText)
      .subscribe((res: any) => {
        if (res.error) {
          this.snackBar.open(res.message);
          this.totalCustomFields = 0;
        } else {
          this.totalCustomFields = res.data[0].count;
          this.snackBar.open(res.message);
        }
      });
  }

  getAllTemplates(
    pageNumber: number,
    limit: number,
    searchText: string,
    sortBy: string
  ) {
    this.templatelistService
      .getTemaplteList(pageNumber, limit, searchText, sortBy)
      .subscribe((res) => {
        if (res.error) {
          // error from api
          this.snackBar.open(res.message);
          this.templateList = [];
          this.libraryServ.templatesList.next(this.templateList);
        } else {
          // success from api
          this.snackBar.open(res.message);
          this.templateList = res.data;
          this.libraryServ.templatesList.next(this.templateList);
        }
      });
  }

  filterTemplates(templates: []) {
    if (this.templateList.length > 0) {
      let nameOfTemplate = "";
      templates.forEach((element) => {
        this.templateList.map((template: any) => {
          if (template.templateid == element) {
            nameOfTemplate = nameOfTemplate + ", " + template.templatename;
          }
        });
      });
      return nameOfTemplate.substring(1, nameOfTemplate.length);
    }
    return "";
  }

  getFileInfo(files: NgxFileDropEntry[]) {
    const droppedFile = files[0];
    if (
      droppedFile.fileEntry.isFile &&
      this.isFileAllowed(droppedFile.fileEntry.name)
    ) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        if (this.libraryServ.isFileSizeAllowed(file.size)) {
          const fileSize = this.libraryServ.formatBytes(file.size);
          this.extension = this.extension[1];

          // Genreate Presigned URL
          this.templateService.fileLocalPath = droppedFile.relativePath;
          this.libraryServ
            .generatePresignedURL(this.extension)
            .subscribe((res) => {
              if (res.error) {
                this.snackBar.open(res.message);
              } else {
                const payload = {
                  offerdocumentid: uuidv1(),
                  documentname: res.data.fileName,
                  documentoriginalname: droppedFile.fileEntry.name,
                  extension: this.extension,
                  documentpath: res.data.bucketPath,
                  size: fileSize,
                };

                if (!this.uploadReviseDoc) {
                  this.uploadImageService
                    .upload(res.data.url, file)
                    .subscribe((res: any) => {
                      this.saveOfferDocument(payload);
                    });
                } else {
                  this.offerDocPayload = payload;
                  this.offerDocFile = file;
                  this.offerDocUrl = res.data.url;
                }
                this.snackBar.open(res.message);
              }
            });
        } else {
          this.snackBar.open(
            "Max size of a file allowed is 10 MB, files with size more than 1mb are discarded."
          );
        }
      });
    } else {
      this.snackBar.open(
        "Only files in '.pdf, .docx, .doc, .jpg' format are accepted and directories are not allowed."
      );
    }
  }

  isFileAllowed(fileName: string) {
    let isFileAllowed = false;
    const allowedFiles = [".pdf", ".jpg", ".doc", ".docx"];
    const regex = /(?:\.([^.]+))?$/;
    this.extension = regex.exec(fileName);
    if (undefined !== this.extension && null !== this.extension) {
      for (const ext of allowedFiles) {
        if (ext === this.extension[0]) {
          isFileAllowed = true;
        }
      }
    }
    return isFileAllowed;
  }

  saveOfferDocument(documentInfo: any) {
    documentInfo.status = documentInfo.status = 0;
    documentInfo.latestversionid = "";
    (documentInfo.offerdocumentid = documentInfo.offerdocumentid),
      this.libraryServ.createOfferDocument(documentInfo).subscribe((res) => {
        if (res.error) {
          this.snackBar.open(res.message);
        } else {
          this.snackBar.open(res.message);
          this.getDocuments(
            this.currentPage,
            this.currentLimit,
            this.searchDocument,
            this.selectedDocSort,
            this.selectedDocTypeSort
          );
        }
      });
  }

  downloadDocument(element: any) {
    this.libraryServ
      .download(element.documentpath, element.documentname)
      .subscribe((res) => {
        if (res.error) {
        } else {
          const link = this.renderer.createElement("a");
          link.setAttribute("target", "_blank");
          link.setAttribute("href", res.data.url);
          link.setAttribute("download", res.data.url);
          link.click();
          link.remove();
        }
      });
  }

  searchDocuments() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.getDocuments(
        this.currentPage,
        this.currentLimit,
        this.searchDocument,
        this.selectedDocSort,
        this.selectedDocTypeSort
      );
    }, 1000);
  }

  uploadConfirm(element: any) {
    this.uploadReviseDoc = false;
    this.uploadImageService
      .upload(this.offerDocUrl, this.offerDocFile)
      .subscribe((res: any) => {
        this.offerDocPayload.offerdocumentid = this.offerdocumentid;
        this.updateOfferDocument(this.offerDocPayload);
        this.saveOfferReviseDocument(element);
      });
  }

  updateOfferDocument(payload: any) {
    this.libraryServ.updateDocumentById(payload).subscribe((res) => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.offerDocUrl = "";
      }
    });
  }

  saveOfferReviseDocument(documentInfo: any) {
    const payload = {
      documentname: documentInfo.documentname,
      documentoriginalname: documentInfo.documentoriginalname,
      extension: documentInfo.extension,
      documentpath: documentInfo.documentpath,
      size: documentInfo.size,
      offerdocumentid: documentInfo.offerdocumentid,
      latestversionid: "",
      status: 0,
    };

    this.libraryServ.createOfferReviseDocument(payload).subscribe((res) => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.snackBar.open(res.message);
        this.offerDocUrl = "";
      }
    });
  }

  downloadPlaceholders() {
    this.libraryServ.getAllPlaceholders().subscribe((res) => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.snackBar.open(res.message);
        this.downloadJson(res.data);
      }
    });
  }

  downloadJson(data: any) {
    let placeholders = "";
    data.map((res: any) => {
      placeholders = res.placeholder + "\n" + placeholders;
    });
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/json;charset=UTF-8," + encodeURIComponent(placeholders)
    );
    element.setAttribute("download", "placeholders.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  getAllActiveCustomFields(
    pageNumber: number,
    limit: number,
    searchText: string,
    sortBy: string
  ) {
    this.libraryServ
      .getCustomFields(pageNumber, limit, searchText, sortBy)
      .subscribe((res: any) => {
        if (res.error) {
          this.snackBar.open(res.message);
        } else {
          this.allCustomFieldsList = res.data;
        }
      });
  }

  filterCustomFields(customfieldid: string) {
    if (
      this.allCustomFieldsList !== undefined &&
      this.allCustomFieldsList.length > 0
    ) {
      let nameOfCustomField = "";
      this.allCustomFieldsList.map((customField: any) => {
        if (customField.customfieldid == customfieldid) {
          nameOfCustomField = nameOfCustomField + ", " + customField.fieldname;
        }
      });
      return nameOfCustomField.substring(1, nameOfCustomField.length);
    }
    return "";
  }

  destroy() {
    if (!this.drawer.opened) {
      this.viewLibrary = false;
      this.viewCustom = false;
      this.uploadReviseDoc = false;
      this.offerDocUrl = "";
    }
  }
  getConfigurationValues(data: any) {
    this.configDropdown = false;
    this.data = data;
    this.drawer.close();
  }
  //  masterDropDownValues: any;

  getConfigureMasterValues(data: any) {
    if (data.fieldtype == "Drop-Down") {
      this.masterDropDownValues = data;
    } else {
      this.masterDropDownValues = undefined;
    }
  }
  onSave() {
    this.addCustomFields.markAllAsTouched();
    const { value } = this.addCustomFields;
    const payload = {
      offertemplateid: value.offertemplateid,
      fieldname: value.fieldname,
      fieldtype: value.fieldtype,
      parentid: value.parentid,
      helptext: value.helptext,
      ismandatory: value.ismandatory ? 1 : 0,
      isactive: value.isactive ? 1 : 0,
      configuration: this.data == undefined ? {} : this.data,
    };
    this.libraryServ.createCustomFields(payload).subscribe((res) => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.snackBar.open(res.message);
      }
    });
  }
  configure(element: any) {
    console.log("chck", element.fieldtype);

    this.caseTitle = element.fieldtype;
    this.caseTitle2 = element.parentid;
    if (element.fieldtype == "Text-Box") {
      this.drawer.open();
      this.configDropdown = false;
      this.configText = true;
      this.caseTitle = element.fieldtype;
    } else if (element.fieldtype == "Drop-Down") {
      this.drawer.open();
      this.configDropdown = true;
      this.configText = false;
      this.caseTitle = element.fieldtype;
    } else if (element.fieldtype && element.parentid > 0) {
      this.drawer.open();
      this.configDropdown = true;
      this.configText = false;
      this.caseTitle = element.fieldtype;
      this.caseTitle2 = element.parentid;
    }
  }
}
