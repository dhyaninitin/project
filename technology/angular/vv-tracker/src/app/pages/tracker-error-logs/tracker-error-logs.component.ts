import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AdminService } from '../shared/services/admin.service';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../shared/delete-dialog/delete-dialog.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-tracker-error-logs',
  templateUrl: './tracker-error-logs.component.html',
  styleUrls: ['./tracker-error-logs.component.scss']
})
export class TrackerErrorLogsComponent implements OnInit {

  panelOpenState = false;
  maxLength: number = 70;
  logsPage: number = 1;
  logsSize: number = 10;
  logsOrderBy: any = "";
  logsOrderDir: any = "";
  logsSearch: string = "";
  logsTotalDataCount: number = 0
  trackerErrorLogs: any = [];
  searchCtrlOfLogs = new UntypedFormControl();
  timeout: NodeJS.Timeout;
  allChecked: boolean = false;
  selectedIds = [];

  constructor(private _adminSer: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.getTrackerErrorLogs(this.logsPage, this.logsSize, this.logsSearch);

    this.searchCtrlOfLogs.valueChanges.pipe().subscribe(value => {
      this.logsSearch = value;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.getTrackerErrorLogs(this.logsPage, this.logsSize, this.logsSearch);
      }, 800)
    });
  }


  getTruncatedMessage(message: string): string {
    return message.length > this.maxLength ?
      message.substring(0, this.maxLength) + '...' :
      message;
  }

  openPanel(data: any, userid: string) {
    this.panelOpenState = true;
    this.markLogAsRead(data, userid);
  }

  markLogAsRead(data: any, userid: string) {
    let payload = {
      id: data._id,
      userid: userid
    }
    if (!data.markAsRead) {
      this._adminSer.trackerMarkAsRead(payload).subscribe((res: any) => {
        if (res) {
          let index = this.trackerErrorLogs.findIndex(el => el._id == res.data._id)
          this.trackerErrorLogs[index].markAsRead = res.data.markAsRead;
        }
      })
    }
  }

  closePanel(id: string) {
    this.panelOpenState = false;
  }

  getTrackerErrorLogs(
    page: number,
    size: number,
    search: string
  ) {
    this._adminSer.getTrackerErrorLogs(page, size, search).subscribe((res: any) => {
      if (res.data.length >= 1) {
        this.trackerErrorLogs = [...res.data];
        this.trackerErrorLogs.map(el => {
          return el.checked = false;
        })
        this.selectedIds = this.trackerErrorLogs.filter(log => log?.checked).map(log => log._id);
        this.allChecked = this.allObjectsChecked();
        this.logsTotalDataCount = res.totalDataCount;
      } else {
        this.trackerErrorLogs = [];
        this.logsTotalDataCount = 0;
      }
    });
  }

  onPageChangeOfLogs(event: any) {
    this.logsPage = event.pageIndex + 1;
    this.logsSize = event.pageSize;
    this.getTrackerErrorLogs(this.logsPage, this.logsSize, this.logsSearch);
  }

  selectProperty(row: any, event: MatCheckboxChange) {
    const checkbox = event.source;
    const checked = checkbox.checked;
    const index = this.trackerErrorLogs.findIndex(el => el._id == row._id);
    if (index > -1) {
      this.trackerErrorLogs[index].checked = checked
    }
    this.allChecked = this.allObjectsChecked();
    this.selectedIds = this.trackerErrorLogs.filter(log => log.checked).map(log => log._id);
  }

  allObjectsChecked(): boolean {
    return this.trackerErrorLogs.every(log => log.checked);
  }

  selectAllProperties(event: MatCheckboxChange): void {
    const checkbox = event.source;
    const checked = checkbox.checked;
    this.trackerErrorLogs.map((el: any) => {
      return el.checked = checked
    })
    this.allChecked = this.allObjectsChecked();
    this.selectedIds = this.trackerErrorLogs.filter(log => log.checked).map(log => log._id);
  }


  openDelDialog() {
    this.selectedIds = this.trackerErrorLogs.filter(log => log.checked).map(log => log._id);
    let data: string;
    if (this.selectedIds.length > 1) {
      data = "all selected Logs";
    } else {
      data = "this Log";
    }
    this.dialog.open(DeleteDialogComponent, {
      width: "350px",
      height: "auto",
      disableClose: true,
      data: data,
      panelClass: "confirm-dialog-container",
    }).afterClosed().subscribe((res) => {
      if (res == true) {
        let data = {
          ids: this.selectedIds
        }
        this._adminSer.deleteLogByIds(data).subscribe((res: any) => {

          if (res) {
            this.snackBar.open(res.message, "Cancel", {
              duration: 3000,
              panelClass: ["success-snackbar"],
            });
            this.getTrackerErrorLogs(this.logsPage, this.logsSize, this.logsSearch);
          }
        });
      }
    });
  }

}
