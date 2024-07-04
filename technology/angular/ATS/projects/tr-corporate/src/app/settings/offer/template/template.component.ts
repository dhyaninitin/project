import { Router } from "@angular/router";
import { MatSort } from "@angular/material/sort";
import { MatDrawer } from "@angular/material/sidenav";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
} from "ngx-file-drop";
// Mat table
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";

// Mat modal
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { AddNewTemplateComponent } from "../add-new-template/add-new-template.component";
// Services
import { SnackBarService } from "../../../utility/services/snack-bar.service";
import { TemplateService } from "../shared/services/template.service";
import { fadeAnimation } from "../../../animations";

import { ConfirmationComponent } from "../../../utility/components/confirmation/confirmation.component";
import { SETTINGS_LN } from "../../shared/settings.lang";
import { ROUTE_CONFIGS } from "../../../utility/configs/routerConfig";
import { DesignService } from "../../../utility/services/design.service";
import { UtilityService } from "../../../utility/services/utility.service";

// enums
import { TemplateListService } from '../shared/services/template-list.service';
import { OfferPayload } from "../shared/interfaces/offer-template";
import { LibraryService } from "../shared/services/library.service";
import { UploadImageService } from "../../../account/shared/upload-image.service";

export interface TemplateElement {
  templatename: string;
  templateid: string;
  templatetype: string;
  isActive: number;
}

const ELEMENT_DATA: TemplateElement[] = [];
@Component({
  selector: "app-template",
  templateUrl: "./template.component.html",
  styleUrls: ["./template.component.scss"],
  animations: [fadeAnimation],
})
export class TemplateComponent implements OnInit {
  addComponent: boolean = false;
  editOfferDetails: OfferPayload | undefined;
  templateInfo: [] = []

  templates = ELEMENT_DATA;
  totalTemplates: number = 0;
  pageSize = 5;
  templateid: string = '';
  currentLimit: number = 5; 
  currentPage : number = 1;

  ln = SETTINGS_LN;
  route_conf = ROUTE_CONFIGS;

  toggle = false;

  status = [
    { value: "", viewValue: this.ln.TXT_ALL },
    { value: "0", viewValue: this.ln.TXT_DEACTIVE },
    { value: "1", viewValue: this.ln.TXT_ACTIVE },
    { value: "2", viewValue: this.ln.TXT_PENDING },
  ];

  sorts = [
    { value: "", viewValue: 'None' },
    { value: "templatename", viewValue: this.ln.TXT_TEMPLATE },
    { value: "status", viewValue: this.ln.TXT_STATUS },
  ];

  emails: string[] = [];

  role!: any[];
  isShown: boolean = false;
  selectedStatus!: number;
  selectedRole!: number;
  selectedSort = "";
  displayedColumns: string[] = [
    "check",
    "name",
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
  viewDetail: boolean = false;
  viewOffers: boolean = false;
  viewEdit: boolean = false;
  viewActivity: boolean = false;
  showForm: boolean = false;
  public showQuestionnaireView: boolean = false;
  public editTemplateData: any = {};
  viewLibrary: boolean = false;
  viewAssociate: boolean = false;
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatDrawer, { static: false }) drawer!: MatDrawer;
  @ViewChild("modalRefElement", { static: false }) modalRefElement!: ElementRef;

  @ViewChild("dialogRef")
  dialogRef!: TemplateRef<any>;

  @ViewChild("dialogRefs")
  dialogRefs!: TemplateRef<any>;
  myFooList = [
    "Some Item",
    "Item Second",
    "Other In Row",
    "What to write",
    "Blah To Do",
  ];
  deletePopupText = "Offer Template";

  // Mobile View
  isLoadingMore: boolean = false;
  isRateLimitReached: boolean = true;

  searchText: string = "";
  timeout : any;
  documentInfo: any;
  closeAssociateDrawer: boolean = false;
  verifyOfferDetails: any;
  isUploadJson: boolean = false;
  extension: any;

  constructor(
    private templatelistService: TemplateListService,
    private templateService: TemplateService,
    private libraryService: LibraryService,
    private uploadImageService: UploadImageService,
    public dialog: MatDialog,
    private snackBar: SnackBarService,
    public designService: DesignService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private util: UtilityService,
  ) {}

  ngOnInit(): void {
    this.searchText = "";
    this.getAllTemplates(1,5,this.searchText,'');
    localStorage.removeItem('templateid');
  }

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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.filter(
      (user) => user.roletypeid !== 1
    ).length;
    return numSelected === numRows;
  }

  // Select all

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.dataSource.data.forEach((selection) => {
      if (selection.roletypeid !== 1) {
        this.selection.select(selection);
      }
    });
  }

  deactivate() {
    this.selection.selected.forEach((user) => this.emails.push(user.email));
    this.deactivateUsers(this.emails);
  }
  activate() {}

  delete() {}

  checkboxLabel(row?: any) {
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

    this.isActionDoing = true;
  }

  // for activate - Bulk action
  activateUsers(emails: string[]) {
    this.toggleUserActionMenu();

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
  }

  // activate for single user

  activateUser(email: any) {
    this.toggleUserActionMenu();
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

  viewDetails(template: any) {
    this.drawer.open();
    this.viewEdit = false;
    this.viewDetail = true;
    this.viewAssociate = false;
    this.viewLibrary = false;
    this.viewOffers = false;
    this.viewActivity = false;
    this.templateInfo = template;
  }
  editOffer(template: OfferPayload) {
    this.drawer.open();
    this.showForm = true;
    this.viewEdit = true;
    this.viewDetail = false;
    this.viewAssociate = false;
    this.viewLibrary = false;
    this.viewOffers = false;
    this.viewActivity = false;
    this.editOfferDetails = template;
    this.addComponent = true;
  }
  associateDocument(documentInfo: any, templateid: string,) {
    this.templateid = templateid;
    this.documentInfo = documentInfo;
    this.drawer.open();
    this.viewEdit = false;
    this.viewDetail = false;
    this.viewAssociate = true;
    this.viewLibrary = false;
    this.viewOffers = false;
    this.viewActivity = false;
  }
  uploadLibrary() {
    this.drawer.open();
    this.viewEdit = false;
    this.viewDetail = false;
    this.viewAssociate = false;
    this.viewLibrary = true;
    this.viewOffers = false;
    this.viewActivity = false;
  }
  verifyOffers(element: any) {
    this.verifyOfferDetails = element;
    this.drawer.open();
    this.viewEdit = false;
    this.viewDetail = false;
    this.viewAssociate = false;
    this.viewLibrary = false;
    this.viewOffers = true;
    this.viewActivity = false;
  }
  viewActvities(templateid: string) {
    this.drawer.open();
    this.viewActivity = true;
    this.viewEdit = false;
    this.viewDetail = false;
    this.viewAssociate = false;
    this.viewLibrary = false;
    this.viewOffers = false;
    this.templateid = templateid
  }

  uploadJson(templateid: string) {
    const myTempDialog = this.dialog.open(this.dialogRef, {
      data: this.myFooList,
    });
    this.templateid = templateid;
    this.isUploadJson = false
  }

  deleteBox(templateid: string) {
    this.templateid = templateid;
    const myTempDialog = this.dialog.open(this.dialogRefs, {
      data: this.myFooList,
    });
  }

  toggleShow() {
    this.isShown = !this.isShown;
  }

  uploadJsonFile() {
    this.getFileInfo(this.files);
  }

  public files: NgxFileDropEntry[] = [];

  public dropped(files: NgxFileDropEntry[]) {
    this.isUploadJson = true;
    this.files = files;
  }

  getFileInfo(files: NgxFileDropEntry[]) {
    const droppedFile = files[0]
      if (droppedFile.fileEntry.isFile && this.isFileAllowed(droppedFile.fileEntry.name)) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          if (this.libraryService.isFileSizeAllowed(file.size)) {
            this.extension = this.extension[1];
            // Genreate Presigned URL 
            this.templateService.fileLocalPath = droppedFile.relativePath;
            this.libraryService.generatePresignedURL(this.extension).subscribe(res => {
              if (res.error) {
                this.snackBar.open(res.message);
              } else {
                const payload = {
                  offertemplateid: this.templateid,
                  documentname: res.data.fileName,
                  documentoriginalname: droppedFile.fileEntry.name,
                  documentpath: res.data.bucketPath,
                }
                  this.uploadImageService.upload(res.data.url, file).subscribe((res: any) => {
                    this.createOfferJson(payload);
                  });
                this.snackBar.open(res.message);
              }
            }) 
          } else {
            this.snackBar.open("Max size of a file allowed is 10 MB, files with size more than 1mb are discarded.");
          }
        });
      } else {
        this.snackBar.open("Only files in '.json' format are accepted.");
      }
  }


  isFileAllowed(fileName: string) {
    let isFileAllowed = false;
    const allowedFiles = ['.json'];
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

  createOfferJson(data: any) {
    this.libraryService.createOfferUploadJson(data).subscribe( (res) => {
      if (res.error) {
       this.snackBar.open(res.message);
      } else {
        this.snackBar.open(res.message);
      }
    })
  }

  public fileOver(event: any) {
    console.log(event);
  }

  public fileLeave(event: any) {
    console.log(event);
  }
  verifyOffer() {
    this.drawer.open();
  }
  editUser(element: any, evt?: Event) {
    this.drawer.open();
    this.designService.setDrawerOpen(true);
  }

  onHeaderSort() {
    this.getAllTemplates(this.currentPage, this.currentLimit, this.searchText, this.selectedSort);
  }

  changeStatus(emitted: any) {}

  // User update drawer closed

  addQuestionnaireTemplate() {
    this.showForm = true;
  }
  toggleSideMenu() {
    this.designService.setDrawerOpen(false);
  }
  hideForm() {
    this.showForm = false;
    this.editTemplateData = {};
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
        // this.loadUsers(this.accountID);
        this.cdRef.detectChanges();
      }
    }
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

  getTotalOfferTemplates() {
    this.templatelistService.getTemaplteCount(this.searchText).subscribe( (count) => {
      if (count.error) {
        this.totalTemplates = 0;
      } else {
        this.totalTemplates = count.data[0].count;
      }
    })
  }

  getAllTemplates(pageNumber: number, limit: number, searchText: string, sortBy: string) {
    this.templatelistService.getTemaplteList(pageNumber,limit,searchText,sortBy).subscribe( (res) => {
        if (res.error) {
          // error from api
          this.snackBar.open(res.message);
          this.templates = []
        } else {
          // success from api
          this.snackBar.open(res.message);
          this.getTotalOfferTemplates();
          this.templates = res.data;
        }
    })
  }

  changePage(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.currentLimit = event.pageSize;
    this.getAllTemplates(this.currentPage, this.currentLimit, this.searchText, this.selectedSort);
  }

  refreshOfferList(event: any) {
    if(event){
      this.getAllTemplates(this.currentPage, this.currentLimit, this.searchText, this.selectedSort);
    }
    this.drawer.close();
    this.designService.setDrawerOpen(false);
    this.addComponent = false;
  }

  removeConfirmation(event: any) {
    if (event) {
      this.templatelistService.deleteTemplateById(this.templateid).subscribe(res => {
        if (res.error) {
          this.snackBar.open(res.message);
        } else {
          this.snackBar.open(res.message);
          this.getAllTemplates(this.currentPage, this.currentLimit, this.searchText, this.selectedSort);
          this.removeAllActivities(this.templateid);
          this.removeAllComponents(this.templateid);
          this.dialog.closeAll();
        }
      });
    }
  }

  removeAllComponents(templateid: string) {
    this.templateService.deleteAllComponentsById(templateid).subscribe(res => {
      if (res.error) {
        this.snackBar.open(res.message);
      }
    })
  }

  removeAllActivities(templateid: string) {
    this.templateService.deleteAllOfferActivity(templateid).subscribe(res => {
      if (res.error) {
        this.snackBar.open(res.message);
      }
    })
  }

  updateStatus(templateid: string, isActive: number) {
    isActive = isActive == 0 ? 1 : 0;
    const payload = {
      templateid: templateid,
      isActive: isActive
    }
    this.templatelistService.updateTemplateById(payload).subscribe(res => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.getAllTemplates(this.currentPage, this.currentLimit, this.searchText, this.selectedSort);
      }
    });
  }

  searchTemplates() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.getAllTemplates(this.currentPage, this.currentLimit, this.searchText, this.selectedSort);
    }, 1000);
  }

  updateDocConfirm($event: any) {
    if($event) {
      this.closeAssociateDrawer = true;
    }
  } 

  closeDrawer($event: any) {
    this.drawer.close();
    this.viewOffers = false;
  }

  destroy() {
    if (!this.drawer.opened) {
      this.addComponent = false;
      this.viewActivity = false;
      this.viewDetail = false;
      this.editOfferDetails = undefined;
      if(this.viewAssociate && this.closeAssociateDrawer) {
        this.getAllTemplates(this.currentPage, this.currentLimit, this.searchText, this.selectedSort);
      }
      this.closeAssociateDrawer = false;
      this.viewAssociate = false;
      this.viewLibrary = false;
      this.viewOffers = false;
      this.isUploadJson = false;
    }
  }
}
