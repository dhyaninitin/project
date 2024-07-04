import { SelectionModel } from "@angular/cdk/collections";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatDrawer } from "@angular/material/sidenav";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { TranslatePipe } from "@cloudtalentrecruit/ng-core";
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  FileSystemDirectoryEntry,
} from "ngx-file-drop";
import { merge, of as observableOf } from "rxjs";
import { State } from "../../../utility/store/reducers";

import { startWith, switchMap, map, catchError } from "rxjs/operators";
import { ConfirmationComponent } from "../../../utility/components/confirmation/confirmation.component";
import { ROUTE_CONFIGS } from "../../../utility/configs/routerConfig";
import { DesignService } from "../../../utility/services/design.service";
import { SnackBarService } from "../../../utility/services/snack-bar.service";
import { UtilityService } from "../../../utility/services/utility.service";
import { getDefaultAccountId } from "../../../utility/store/selectors/account.selector";
import { getRoles } from "../../../utility/store/selectors/roles.selector";
import { getUserEmail } from "../../../utility/store/selectors/user.selector";
import { checStatus } from "../../permission/shared/interfaces/delete-user";
import { userStatus } from "../../permission/shared/interfaces/update-user-status";
import { SETTINGS_LN } from "../../shared/settings.lang";
import { AddNewTemplateComponent } from "../add-new-template/add-new-template.component";
import { TemplateListService } from "../shared/services/template-list.service";
import { TemplateService } from "../shared/services/template.service";
import { TFilterComponent } from "../TFilterComponent/t-filter.component";

@Component({
  selector: "app-library-template",
  templateUrl: "./library-template.component.html",
  styleUrls: ["./library-template.component.scss"],
})
export class LibraryTemplateComponent implements OnInit {
  @Input() isOpen: boolean = false;
  ln = SETTINGS_LN;
  route_conf = ROUTE_CONFIGS;
  event: any;
  toggle = false;

  status = [
    { value: "", viewValue: this.ln.TXT_ALL },
    { value: "0", viewValue: this.ln.TXT_DEACTIVE },
    { value: "1", viewValue: this.ln.TXT_ACTIVE },
    { value: "2", viewValue: this.ln.TXT_PENDING },
  ];
  sorts = [
    { value: "pdf", viewValue: this.ln.TXT_PDF },
    { value: "jpg", viewValue: this.ln.TXT_JPG },
    { value: "svg", viewValue: this.ln.TXT_SVG },
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
  viewDetail = false;
  viewAssociate = false;
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

  // Mobile View
  isLoadingMore: boolean = false;
  isRateLimitReached: boolean = true;

  constructor(
    private userlistServ: TemplateListService,
    private userServ: TemplateService,
    private store: Store<State>,
    public dialog: MatDialog,
    private snackBar: SnackBarService,
    public designService: DesignService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private util: UtilityService
  ) {}

  ngOnInit(): void {}
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

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
  }

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

    if (this.isActionDoing) {
      this.snackBar.open(this.ln.TXT_PLEASE_WAIT, this.ln.TXT_OK);
      return;
    }
  }

  // for activate - Bulk action
  activateUsers(emails: string[]) {
    this.toggleUserActionMenu();
  }

  // for bulk delete

  deleteUsers(emails: string[], i: number) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: "500px",
    });
  }

  deleteUser(email: any, i: number) {}

  // deactivate for single user
  deactivateUser(email: any) {
    this.toggleUserActionMenu();
  }

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

  viewPermission(element: any) {
    this.router.navigate([ROUTE_CONFIGS.VIEW_ROLE, element.accountroleid]);
  }

  viewDetails(element: any) {
    this.currentUser = element;
    this.currentUserEdit = false;
    this.viewDetail = true;
    this.drawer.open();
    this.designService.setDrawerOpen(true);
  }
  associateUser() {
    this.drawer.open();
    this.viewAssociate = true;
    this.viewDetail = false;
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

  onHeaderSort() {}

  changeStatus(emitted: any) {}

  // User update drawer closed
  userUpdated(emitted: any) {
    this.drawer.close();
  }

  // User add drawer closed
  userAdded() {
    this.paginator.pageIndex = 0;
    this.selectedRole = 0;
    this.selectedStatus = 0;
    this.selectedSort = "lastupdated";
    this.loadUsers(this.accountID);
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

  exportCsv() {}
  exportExcel() {}
  exportPdf() {}
}
