import { Router } from "@angular/router";
import { getUserDeatils, getUserEmail } from "./../../../utility/store/selectors/user.selector";
import { MatSort } from "@angular/material/sort";
import { Store } from "@ngrx/store";
import { MatDrawer } from "@angular/material/sidenav";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";

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

import { merge, of as observableOf } from "rxjs";
import { catchError, map, startWith, switchMap } from "rxjs/operators";
import { getRoles } from "../../../utility/store/selectors/roles.selector";
import { ConfirmationComponent } from "../../../utility/components/confirmation/confirmation.component";
import { SETTINGS_LN } from "../../shared/settings.lang";
import { ROUTE_CONFIGS } from "../../../utility/configs/routerConfig";
import { DesignService } from "../../../utility/services/design.service";
import { UtilityService } from "../../../utility/services/utility.service";
import { LibraryService } from "../shared/services/library.service";
import { UploadImageService } from "../../../account/shared/upload-image.service";
@Component({
  selector: "app-create-offer-final",
  templateUrl: "./create-offer-final.component.html",
  styleUrls: ["./create-offer-final.component.scss"],
})
export class CreateOfferFinalComponent implements OnInit {
  @Output() docFromLibrary = new EventEmitter<any>();
  ln = SETTINGS_LN;
  route_conf = ROUTE_CONFIGS;
  event: any;
  toggle = false;
  isEditEnable: boolean = true; // to show and hide the edit button
  fileSize: any;
  documentname: string = '';

  status = [
    { value: "", viewValue: this.ln.TXT_ALL },
    { value: "0", viewValue: this.ln.TXT_DEACTIVE },
    { value: "1", viewValue: this.ln.TXT_ACTIVE },
    { value: "2", viewValue: this.ln.TXT_PENDING },
  ];
  sorts = [
    { value: "pdf", viewValue: this.ln.TXT_PDF },
    { value: "jpg", viewValue: this.ln.TXT_JPG },
    { value: "svg", viewValue: this.ln.TXT_CSV },
  ];
  sortByDocs = [
    { value: "name", viewValue: this.ln.TXT_NAME },
    { value: "status", viewValue: this.ln.TXT_STATUS },
    { value: "roletypeid", viewValue: this.ln.TXT_ROLE },
  ];

  emails: string[] = [];

  role!: any[];

  selectedStatus!: number;
  selectedRole!: number;
  selectedSort = "pdf";
  selectedDocSort = "name";
  displayedColumns: string[] = [
    "check",
    "document",
    "email",
    "lastupdated",
    "action",
  ];
  dataSource!: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
  addUserModalRef!: MatDialogRef<AddNewTemplateComponent>;
  totalUsers: number = 0;
  currentUser!: any;
  associate!: any;
  associateuser!: boolean;
  currentUserEdit!: boolean;
  viewLibrary = false;
  viewLibraryUpload = false;

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
  selectedDocumentDetail: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatDrawer, { static: false }) drawer!: MatDrawer;
  @ViewChild("modalRefElement", { static: false }) modalRefElement!: ElementRef;
  @ViewChild("dialogRefs")
  dialogRefs!: TemplateRef<any>;
  myFooList = [
    "Some Item",
    "Item Second",
    "Other In Row",
    "What to write",
    "Blah To Do",
  ];
  // Mobile View
  isLoadingMore: boolean = false;
  isRateLimitReached: boolean = true;
  extension: any;
  showFileDropOption: boolean = true;
  deletePopupText = "Offer Document";
  docPath: string = '';
  docModifiedName: string = '';

  constructor(
    public dialog: MatDialog,
    private snackBar: SnackBarService,
    public designService: DesignService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private util: UtilityService,
    private templateService: TemplateService,
    private libraryService: LibraryService,
    private store: Store,
    private uploadImageService: UploadImageService
  ) {}

  ngOnInit(): void {
    
  }

  documentList(name: string, originalName: string, extension: string, fileSize: string) {
    let uploadedBy = localStorage.getItem('userEmail');
    let doc = originalName.split('.');
    let docname = doc[0];
    this.documentname = docname;
    const data = [
      {
        documentname: docname,
        extention: extension.toUpperCase(),
        size: fileSize,
        status: true,
        email: uploadedBy,
      },
    ];
    this.dataSource = new MatTableDataSource(data);

    const payload = {
      documentname: name,
      documentoriginalname: originalName,
      extension: data[0].extention,
      documentpath: this.docPath,
      size: data[0].size,
    }
    this.templateService.finalForm.next(payload);
    this.showFileDropOption = false;
  }

  public files: NgxFileDropEntry[] = [];
  public dropped(files: NgxFileDropEntry[]) {
    this.getFileInfo(files);
  }

  removeConfirmation(event: any) {
    if(event) {
      this.showFileDropOption = true;
      this.dataSource.data = []
      this.templateService.finalForm.next({});
      this.documentname = '';
      this.templateService.enableFinish = false;
    }
    this.dialog.closeAll();
  }

  getFileInfo(files: NgxFileDropEntry[]) {
      this.templateService.enableFinish = true;
      const droppedFile = files[0]
        if (droppedFile.fileEntry.isFile && this.isFileAllowed(droppedFile.fileEntry.name)) {
          const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
          fileEntry.file((file: File) => {

            if (this.libraryService.isFileSizeAllowed(file.size)) {
              this.fileSize = file.size;
              this.fileSize = this.libraryService.formatBytes(this.fileSize);
              this.extension = this.extension[1];

              // Genreate Presigned URL 
              this.templateService.fileLocalPath = droppedFile.relativePath;
              this.libraryService.generatePresignedURL(this.extension).subscribe(res => {
                if (res.error) {
                  this.snackBar.open(res.message);
                } else {
                  this.docPath = res.data.bucketPath;
                  this.docModifiedName = res.data.fileName;
                  this.uploadImageService.upload(res.data.url, file).subscribe((res) => {
                    const payload = {
                      createdtime: new Date(),
                      documentname: this.docModifiedName,
                      documentoriginalname: droppedFile.fileEntry.name,
                      documentpath: this.docPath,
                      extension: this.extension,
                      latestversionid: "",
                      modifiedtime: new Date(),
                      offerdocumentid: '',
                      size: this.fileSize,
                      status: 1,
                      userInfo: {
                      email: localStorage.getItem('userEmail'),
                      imageUrl: '',
                      picturename: 'test',
                      userid: 0
                      }
                    }
                    this.selectedDocumentDetail = payload;
                  });
                  this.documentList(this.docModifiedName, droppedFile.fileEntry.name, this.extension, this.fileSize);
                  this.snackBar.open(res.message);
                }
              }) 
            } else {
              this.snackBar.open("Max size of a file allowed is 10 MB, files with size more than 1mb are discarded.");
            }
          });
        } else {
          this.snackBar.open("Only files in '.pdf, .docx, .doc, .jpg' format are accepted and directories are not allowed.");
        }
  }

  
  isFileAllowed(fileName: string) {
    let isFileAllowed = false;
    const allowedFiles = ['.pdf', '.jpg', '.doc', '.docx'];
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

  public fileOver(event: any) {
    //console.log(event);
  }

  public fileLeave(event: any) {
    //console.log("file leave",event);
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
  }
  onEdit() {
    this.isEditEnable = !this.isEditEnable;
    this.documentList(this.docModifiedName, this.documentname, this.extension, this.fileSize);
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

  deleteBox() {
    const myTempDialog = this.dialog.open(this.dialogRefs, {
      data: this.myFooList,
    });
  }
  delete() {
    this.selection.selected.forEach((user) => {
      if (user.status !== 1) {
        this.emails.push(user.email);
      }
    });

    if (this.emails.length === 0) {
      this.snackBar.open("Only Deactivated users can be deleted");
    }
  }

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

    if (this.isActionDoing) {
      this.snackBar.open(this.ln.TXT_PLEASE_WAIT, this.ln.TXT_OK);
      return;
    }

    this.isActionDoing = true;
  }

  // for activate - Bulk action
  activateUsers(emails: string[]) {
    this.toggleUserActionMenu();
    if (this.isActionDoing) {
      this.snackBar.open(this.ln.TXT_PLEASE_WAIT, this.ln.TXT_OK);
      return;
    }

    this.isActionDoing = true;
  }

  // for bulk delete

  deleteUsers(emails: string[], i: number) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: "500px",
    });
  }

  deleteUser(email: any, i: number) {
    this.deleteUsers(email, 1);
  }

  // deactivate for single user
  deactivateUser(email: any) {
    this.toggleUserActionMenu();

    if (this.isActionDoing) {
      this.snackBar.open(this.ln.TXT_PLEASE_WAIT, this.ln.TXT_OK);
      return;
    }

    this.isActionDoing = true;
  }

  // activate for single user

  activateUser(email: any) {
    this.toggleUserActionMenu();

    if (this.isActionDoing) {
      this.snackBar.open(this.ln.TXT_PLEASE_WAIT, this.ln.TXT_OK);
      return;
    }

    this.isActionDoing = true;
  }

  reinviteUser(email: any) {
    const body = {
      email: email,
    };
  }

  // Desktop more btn
  toggleUserActionMenu() {
    this.hideUserActionMenu = false;
    setTimeout(() => {
      this.hideUserActionMenu = true;
    }, 100);
  }

  viewPermission(element: any) {
    this.router.navigate([ROUTE_CONFIGS.VIEW_ROLE, element.accountroleid]);
  }

  viewOffer() {
    this.drawer.open();
    this.viewLibrary = true;
    this.viewLibraryUpload = false;
  }
  uploadJson() {
    this.drawer.open();
  }
  verifyOffer() {
    this.drawer.open();
  }
  editUser(element: any, evt?: Event) {
    this.currentUser = element;
    this.currentUserEdit = true;
    // this.viewUserPermission = false;
    this.drawer.open();
    this.designService.setDrawerOpen(true);
  }
  viewLibraryTemp() {
    this.drawer.open();
    this.viewLibraryUpload = true;
    this.viewLibrary = false;
  }
  onHeaderSort() {}

  changeStatus(emitted: any) {}

  // User update drawer closed
  userUpdated(emitted: any) {}

  // User add drawer closed
  userAdded() {
    this.paginator.pageIndex = 0;
    this.selectedRole = 0;
    this.selectedStatus = 0;
    this.selectedSort = "lastupdated";
  }

  toggleSideMenu() {
    this.designService.setDrawerOpen(false);
  }

  contentScrollYEvt() {
    if (window.innerWidth < 750) {
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

  addDocumentFromLib($event: any) {
    this.templateService.enableFinish = true;
    this.docFromLibrary.emit($event);
    this.selectedDocumentDetail = $event;
    this.documentList($event.documentname, $event.documentoriginalname, $event.extension, $event.size);
    this.viewLibraryUpload = false;
    this.drawer.close();
  }

  exportCsv() {
    return;
  }
  exportExcel() {
    return;
  }
  exportPdf() {
    return;
  }

  destroy() {
    if (!this.drawer.opened) {
      this.viewLibraryUpload = false;
    }
  }  
}
