import { Component, OnInit, SecurityContext, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, UntypedFormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { AddUserComponent } from "./add-user/add-user.component";
import { AdminService } from "../shared/services/admin.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "../shared/delete-dialog/delete-dialog.component";
import { MatPaginator } from "@angular/material/paginator";
import { MatCheckbox, MatCheckboxChange } from "@angular/material/checkbox";
import { ViewUserComponent } from "./view-user/view-user.component";
import { ExportModalComponent } from "./export-modal/export-modal.component";
import { SortDirection } from "@angular/material/sort";
import { AuthService } from "../shared/services/auth.service";
import { StatusChangeDialogComponent } from "../shared/status-change-dialog/status-change-dialog.component";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: "vex-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatPaginator) logsPaginator!: MatPaginator;

  layoutCtrl = new UntypedFormControl("boxed");

  users: any[] = [];
  searchCtrl = new UntypedFormControl();
  searchCtrlOfLogs = new UntypedFormControl();

  displayedColumns: string[] = [
    "id",
    "empid",
    "firstname",
    "lastname",
    "email",
    "phone",
    "assignedhours",
    "assigneddays",
    "status",
    "actions",
  ];
  page: number = 1;
  size: number = 20;
  orderBy: any = "";
  orderDir: any = "";
  search: string = "";
  totalDataCount: number = 0;

  logsPage: number = 1;
  logsSize: number = 20;
  logsOrderBy: any = "";
  logsOrderDir: any = "";
  logsSearch: string = "";
  logsTotalDataCount: number = 0;

  selectedIds: string[] = [];
  showDelAllIcon: boolean = false;
  selectedProperties: number;
  timeout: NodeJS.Timeout;
  public sortKey: string;
  sortDirection: SortDirection = '';
  role: any;
  adminId: any;
  history: any[] = [];

  filterLogsForm: FormGroup;
  logsFrom: string = "";
  logsTo: string = "";
  logType: number = 1;
  showNoLogsText: boolean = false;
  createdAtFormatted: any;

  constructor(
    private dialog: MatDialog,
    private _adminSer: AdminService,
    private snackBar: MatSnackBar,
    private _authSer: AuthService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getUsers(this.page, this.size, this.search, this.orderBy, this.orderDir);
    this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);

    this.refreshTableSubject();
    this.getAdminDetails();

    this.searchCtrl.valueChanges.pipe().subscribe(value => {
      this.search = value;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.getUsers(this.page, this.size, this.search, this.orderBy, this.orderDir);
      }, 800)
    });

    this.searchCtrlOfLogs.valueChanges.pipe().subscribe(value => {
      this.logsSearch = value;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
      }, 800)
    });

    if (this.role == 1) {
      this.displayedColumns = [
        "id",
        "empid",
        "firstname",
        "lastname",
        "email",
        "phone",
        "assignedhours",
        "assigneddays",
        "status",
        "actions",
      ];
    } else if (this.role == 2) {
      this.displayedColumns = [
        "empid",
        "firstname",
        "lastname",
        "email",
        "phone",
        "assignedhours",
        "assigneddays",
        "status",
      ];
    }
  }

  initForm() {
    this.filterLogsForm = this.fb.group({ logsfrom: [""], logsto: [""] })
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
        } else {
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

  getAdminDetails() {
    this._authSer.tokenDecoder(null);
    this.role = this._authSer.role;
    this.adminId = this._authSer.adminId
  }

  refreshTableSubject() {
    this._adminSer.refreshUserTableSubject.subscribe((x) => {
      if (x == true) {
        this.getUsers(this.page, this.size, this.search, this.orderBy, this.orderDir);
        this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
      }
    });
  }

  getDayLabel(dayValues: string[] | number[]): string {
    const dayMappings = {
      Mo: "Monday",
      Tu: "Tuesday",
      We: "Wednesday",
      Th: "Thursday",
      Fr: "Friday",
      Sa: "Saturday",
      Su: "Sunday"
    };

    if (Array.isArray(dayValues)) {
      return dayValues
        .map((dayName: any) => {
          const matchingNumber = Object.keys(dayMappings).find(
            (key) => dayMappings[key] === dayName
          );
          return matchingNumber || "";
        })
        .join(", ");
    } else if (dayMappings[dayValues]) {
      return dayMappings[dayValues];
    } else {
      return "";
    }
  }

  getUsers(page: number, size: number, search: string, orderBy: string, orderDir: string) {
    this._adminSer.getUsers(page, size, search, orderBy, orderDir).subscribe((res: any) => {
      if (res) {
        this.users = [...res.data];
        this.totalDataCount = res.totalDataCount;
      }
    });
  }

  addUser() {
    this.dialog.open(AddUserComponent, {
      data: []
    }).afterClosed().subscribe(updatedCustomer => { })
  }

  editUser(row: any) {
    this.dialog.open(AddUserComponent, {
      data: [row]
    }).afterClosed().subscribe(updatedCustomer => { })
  }

  sendEmail(row: any) {
    let paylaod = {
      id: row._id,
      email: row.email
    }
    this._adminSer.sendEmail(paylaod, this.adminId).subscribe((res: any) => {
      if (res) {
        this.snackBar.open(res.message, "Cancel", {
          duration: 3000,
          panelClass: ["success-snackbar"],
        });
        this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
      }
    })
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.size = event.pageSize;
    this.getUsers(this.page, this.size, this.search, this.orderBy, this.orderDir);
  }

  onPageChangeOfLogs(event: any) {
    this.logsPage = event.pageIndex + 1;
    this.logsSize = event.pageSize;
    this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
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
          this._adminSer.deleteUser(id, this.adminId).subscribe((res: any) => {
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
                  .getUsers(this.page, this.size, this.search, '', '')
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
                this.getUsers(this.page, this.size, this.search, this.orderBy, this.orderDir);
              }

              this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
            }
          });
        }
      });
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

  onView(id: any) {
    this.dialog.open(ViewUserComponent, {
      width: "1100px",
      height: "650px",
      data: id,
      disableClose: true,
    });
  }

  toggleStatus(event: any, row: any) {
    event.preventDefault();
    if (this.role == 1) {
      const status = row.status === 1 ? 0 : 1;
      let data: string = status === 1 ? 'activate' : 'deactivate';

      this.dialog.open(StatusChangeDialogComponent, {
        width: '350px',
        height: 'auto',
        data: data,
        disableClose: true,
        panelClass: 'confirm-dialog-container',
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
    this._adminSer.updateUserStatus(row._id, status, this.adminId).subscribe((res: any) => {
      if (res) {
        this.snackBar.open(res.message, "Cancel", {
          duration: 3000,
          panelClass: ["success-snackbar"],
        });
        this.getUsers(this.page, this.size, this.search, this.orderBy, this.orderDir);
        this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
      }
    });
  }

  export() {
    this.dialog.open(ExportModalComponent, {
      width: "450px",
      height: "auto",
      // data: row,
    }).afterClosed().subscribe(res => {
      if (res == true) {
        this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
      }
    })
  }

  sortData(event: any) {
    this.orderBy = event.active || 'createdAt';
    this.orderDir = event.direction || 'asc';
    this.getUsers(this.page, this.size, this.search, this.orderBy, this.orderDir);
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
    if (this.logsFrom && this.logsTo) {
      this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
    } else {
      this.snackBar.open("First choose date range", "cancel", {
        duration: 3000,
        panelClass: ["error-snackbar"]
      })
    }
  }

  logoutUser(row: any) {
    let payload = {
      id: row._id,
      email: row.email,
      admin: this.adminId
    };
  
    this._adminSer.logoutUser(payload).subscribe(
      (res: any) => {
        if (res) {
          this.snackBar.open(res.message, "cancel", {
            duration: 3000,
            panelClass: ["success-snackbar"]
          });
          this.getUsers(this.page, this.size, this.search, this.orderBy, this.orderDir);
          this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
        }
      },
      (error: any) => {
        this.snackBar.open("An error occurred while logging out", "cancel", {
          duration: 3000,
          panelClass: ["error-snackbar"]
        });
      }
    );
  }

}
