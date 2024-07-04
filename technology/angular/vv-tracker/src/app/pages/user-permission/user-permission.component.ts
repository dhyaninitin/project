import { Component, OnInit, SecurityContext, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, UntypedFormControl } from "@angular/forms";
import { AdminService } from "../shared/services/admin.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { DeleteDialogComponent } from "../shared/delete-dialog/delete-dialog.component";
import { MatPaginator } from "@angular/material/paginator";
import { AddUserPermissionComponent } from "./add-user-permission/add-user-permission.component";
import { SortDirection } from "@angular/material/sort";
import { MatCheckbox, MatCheckboxChange } from "@angular/material/checkbox";
import { AuthService } from "../shared/services/auth.service";
import { StatusChangeDialogComponent } from "../shared/status-change-dialog/status-change-dialog.component";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: "vex-user-permission",
  templateUrl: "./user-permission.component.html",
  styleUrls: ["./user-permission.component.scss"],
})
export class UserPermissionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatPaginator) logsPaginator!: MatPaginator;

  users: any[] = [];
  layoutCtrl = new UntypedFormControl("boxed");
  showDelAllIcon: boolean = false;
  selectedIds: string[] = [];
  totalDataCount: number = 0;

  page: number = 1;
  size: number = 20;
  orderBy: any = "";
  orderDir: any = "";
  search: string = "";

  logsPage: number = 1;
  logsSize: number = 20;
  logsOrderBy: any= "";
  logsOrderDir: any = "";
  logsSearch: string = "";
  logsTotalDataCount: number = 0;

  filterLogsForm: FormGroup;
  logsFrom: string = "";
  logsTo: string = "";
  logType: number = 2;

  searchCtrl = new UntypedFormControl();
  searchCtrlOfLogs = new UntypedFormControl();

  public sortKey: string;
  sortDirection: SortDirection = "";
  selectedProperties: number;
  timeout: NodeJS.Timeout;
  adminId: any;
  history: any[] = [];
  showNoLogsText: boolean = false;

  displayedColumns: string[] = [
    "id",
    "firstname",
    "lastname",
    "email",
    "phone",
    "role",
    "status",
    "actions",
  ];

  constructor(
    private _adminSer: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _authSer: AuthService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
  ) { this.filterLogsForm = this.fb.group({ logsfrom: [''], logsto: [''] });}

  ngOnInit(): void {
    this.getUsers(
      this.page,
      this.size,
      this.search,
      this.orderBy,
      this.orderDir
    );
    this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);

    this.searchCtrlOfLogs.valueChanges.pipe().subscribe(value => {
      this.logsSearch = value;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
      },800)
    });

    this.refreshTableSubject();
    this.searchCtrl.valueChanges.pipe().subscribe((value) => {
      this.search = value;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.getUsers(
          this.page,
          this.size,
          this.search,
          this.orderBy,
          this.orderDir
        );
      }, 800);
    });
    this.getAdminDetails();
  }

  getAdminDetails() {
    this._authSer.tokenDecoder(null);
    this.adminId = this._authSer.adminId;
  }

  getHistory(
    page: number, 
    size: number,
    from: any,
    to: any,
    type: number,
    search: string
  ) {
    this._adminSer
      .getHistory(page, size, from, to, type, search)
      .subscribe((res: any) => {
        if (res.data.length >= 1) {
          this.history = [...res.data];
          this.logsTotalDataCount = res.totalDataCount;
          this.showNoLogsText = false;
          this.history.forEach(item => {
            const formattedDate = this._adminSer.formatUtcAccordingToTimezone('Asia/Kolkata', item.createdat)
            item.message = this.sanitizer.bypassSecurityTrustHtml(`${item.message} on ${formattedDate}`);
            });
          
          if (search !== "") {
            this.history.forEach(item => {
              item.message = this.highlightSearch(item.message, search);
            });
          }
        }else {
          this.showNoLogsText = true;
          this.history = [];
          this.logsTotalDataCount = 0;
        }
      });
  }

  highlightSearch(message: SafeHtml, search: string): SafeHtml {
    const searchRegex = new RegExp(search, 'gi');
    const originalMessage = this.sanitizer.sanitize(SecurityContext.HTML, message);
    const highlightedMessage = originalMessage.replace(searchRegex, (match: any) =>
      `<span style="background-color: yellow; font-weight: bold;">${match}</span>`
    );
  
    return this.sanitizer.bypassSecurityTrustHtml(highlightedMessage);
  }

  refreshTableSubject() {
    this._adminSer.refreshUserTableSubject.subscribe((x) => {
      if (x == true) {
        this.getUsers(
          this.page,
          this.size,
          this.search,
          this.orderBy,
          this.orderDir
        );
        this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
      }
    });
  }

  getUsers(
    page: number,
    size: number,
    search: string,
    orderBy: string,
    orderDir: string
  ) {
    this._adminSer
      .getUsersPermission(page, size, search, orderBy, orderDir)
      .subscribe((res: any) => {
        if (res) {
          (this.users = [...res.data]),
            (this.totalDataCount = res.totalDataCount);
        }
      });
  }

  addUser() {
    this.dialog
      .open(AddUserPermissionComponent, {
        data: [],
      })
      .afterClosed()
      .subscribe((updatedCustomer) => { });
  }

  toggleStatus(event: any, row: any) {
    event.preventDefault();
    if (row._id !== this.adminId) {
      const status = row.status === 1 ? 0 : 1;
      let data: string = status === 1 ? "activate" : "deactivate";

      this.dialog
        .open(StatusChangeDialogComponent, {
          width: "350px",
          height: "auto",
          data: data,
          disableClose: true,
          panelClass: "confirm-dialog-container",
        })
        .afterClosed()
        .subscribe((res) => {
          if (res === true) {
            this.updateStatus(row, status);
          }
        });
    }
  }

  updateStatus(row: any, status: number) {
    this._adminSer
      .updateUserStatusInPermission(row._id, status, this.adminId)
      .subscribe((res: any) => {
        if (res) {
          this.snackBar.open(res.message, "Cancel", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.getUsers(
            this.page,
            this.size,
            this.search,
            this.orderBy,
            this.orderDir
          );
          this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
        }
      });
  }

  editUser(row: any) {
    this.dialog
      .open(AddUserPermissionComponent, {
        data: [row],
      })
      .afterClosed()
      .subscribe((updatedCustomer) => { });
  }

  openDelDialog(id: any) {
    let data: string;
    if (id.length > 1) {
      data = "all selected users";
    } else {
      data = "this user";
    }
    this.dialog
      .open(DeleteDialogComponent, {
        width: "350px",
        height: "auto",
        disableClose: true,
        data: data,
        panelClass: "confirm-dialog-container",
      })
      .afterClosed()
      .subscribe((res) => {
        if (res == true) {
          this._adminSer
            .deleteUserPermission(this.adminId, id)
            .subscribe((res: any) => {
              if (res) {
                this.snackBar.open(res.message, "Cancel", {
                  duration: 3000,
                  panelClass: ["success-snackbar"],
                });
                this.showDelAllIcon = false;
                this.selectedIds.length = 0;
                if (this.page >= 2 && this.users.length == 1) {
                  let previousPage = this.page - 1;
                  this.page = previousPage;
                  this._adminSer
                    .getUsers(this.page, this.size, this.search, "", "")
                    .subscribe((res: any) => {
                      if (res) {
                        this.users = [...res.data];
                        this.totalDataCount = res.totalDataCount;

                        if (this.paginator) {
                          if (this.paginator.pageIndex === 0) {
                            this.paginator.firstPage();
                          }
                          this.paginator.pageSize = this.size;
                          this.paginator.pageIndex = 0;
                        }
                      }
                    });
                } else {
                  this.getUsers(
                    this.page,
                    this.size,
                    this.search,
                    this.orderBy,
                    this.orderDir
                  );
                }
                this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
              }
            });
        }
      });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.size = event.pageSize;
    this.getUsers(
      this.page,
      this.size,
      this.search,
      this.orderBy,
      this.orderDir
    );
  }

  onPageChangeOfLogs(event: any) {
    this.logsPage = event.pageIndex + 1;
    this.logsSize = event.pageSize;
    this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
  }

  sendEmail(row: any) {
    if (row.status == 1) {
      let paylaod = {
        id: row._id,
        email: row.email,
      };
      this._adminSer
        .sendEmailToUserPermission(paylaod, this.adminId)
        .subscribe((res: any) => {
          if (res) {
            this.snackBar.open(res.message, "Cancel", {
              duration: 3000,
              panelClass: ["success-snackbar"],
            });
            this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
          }
        });
    } else {
      this.snackBar.open("First enable the status to send email !", "Cancel", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      });
    }
  }

  sortData(event: any) {
    this.orderBy = event.active || "createdAt";
    this.orderDir = event.direction || "asc";
    this.getUsers(
      this.page,
      this.size,
      this.search,
      this.orderBy,
      this.orderDir
    );
  }

  selectAllProperties(event: MatCheckboxChange): void {
    const checkbox = event.source;
    const checked = checkbox.checked;

    this.selectedIds = [];

    if (this.users.length > 0) {
      this.users.forEach((row) => {
        row.selected = checked;

        if (checked) {
          this.selectedIds.push(row._id.toString());
        }
      });

      this.selectedProperties = checked ? this.users.length : 0;
      this.showDelAllIcon = checked;
    }
  }

  selectProperty(row: any): void {
    row.selected = !row.selected;

    if (row.selected) {
      this.selectedIds.push(row._id.toString());
    } else {
      const index = this.selectedIds.indexOf(row._id.toString());
      if (index > -1) {
        this.selectedIds.splice(index, 1);
      }
    }

    const allSelected = this.users.every((row) => row.selected);
    const headerCheckbox = document.querySelector(
      "th.mat-header-cell mat-checkbox"
    ) as unknown as MatCheckbox;
    headerCheckbox.checked = allSelected;
    headerCheckbox.indeterminate = !allSelected && this.selectedIds.length > 0;

    this.showDelAllIcon = this.selectedIds.length > 0;
    this.selectedProperties = this.selectedIds.length;
  }

  resetLogsFilter() {
    this.logsFrom = "";
    this.logsTo = "";
    this.filterLogsForm.reset();
    this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
  }

  onFilterLogs() {
    this.logsFrom = this.filterLogsForm.value.logsfrom;
    this.logsTo = this.filterLogsForm.value.logsto;
    if(this.logsFrom && this.logsTo) {
    this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
    }else {
      this.snackBar.open("First choose date range", "cancel" ,{
        duration: 3000,
        panelClass: ["error-snackbar"]
      })
    }
  }
}
