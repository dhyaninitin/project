import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  EventEmitter,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ScreenshotDetailsComponent } from "../screenshot-details/screenshot-details.component";
import { DeleteDialogComponent } from "../../shared/delete-dialog/delete-dialog.component";
import { AdminService } from "../../shared/services/admin.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../../shared/services/auth.service";

@Component({
  selector: "vex-daily-diary",
  templateUrl: "./daily-diary.component.html",
  styleUrls: ["./daily-diary.component.scss"],
})
export class DailyDiaryComponent implements OnInit, OnChanges {
  sortedData: any[];
  selectedScreenshots: any[] = [];
  showDeleteAllSSIcon: boolean = false;
  selectedScreenshotsLength: number;
  role: any;
  adminId: any;
  todayDate: string = "";

  @Input() userData: any;
  @Output() closeDrawer = new EventEmitter<boolean>();
  @Output() deleteItem = new EventEmitter<any>();

  constructor(
    private dialog: MatDialog,
    private _adminSer: AdminService,
    private snackBar: MatSnackBar,
    private _authSer: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.userData && this.userData) {
      this.todayDate = this.userData.date;
      this.convertBasedOnTimeStarted(this.userData);
    }
  }

  ngOnInit(): void {
    this._adminSer.refreshDailyDiaryComSubject.subscribe((x) => {
      if (x == true) {
        this.showDeleteAllSSIcon = false;
        this.selectedScreenshotsLength = 0;
        this.selectedScreenshots = [];
      }
    });
    this.getAdminDetails();
  }

  getAdminDetails() {
    this._authSer.tokenDecoder(null);
    this.role = this._authSer.role;
    this.adminId = this._authSer.adminId;
  }

  goBack() {
    this.closeDrawer.emit(true);
  }

  calculateDuration(startDateStr: string, endDateStr: string): number {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 0;
    }

    const diff = Math.abs(startDate.getTime() - endDate.getTime());
    const minutes = Math.floor(diff / 1000 / 60);
    return minutes;
  }

  convertBasedOnTimeStarted(data: any) {
    const groupedData = data.data.reduce(
      (result: { [x: string]: any[] }, item: { timerstartedat: any }) => {
        const timerStartedAt = item.timerstartedat;
        if (!result[timerStartedAt]) {
          result[timerStartedAt] = [];
        }
        result[timerStartedAt].push(item);
        return result;
      },
      {}
    );
    this.sortedData = Object.values(groupedData);
  }

  viewScreenShot(screenshot: any) {
    const payload = {
      date: this.todayDate,
      screenshot: screenshot
    }
    
    this.dialog
      .open(ScreenshotDetailsComponent, {
        width: "400px",
        height: "auto",
        data: payload,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res) {
          this.sortedData.forEach((subArray, index) => {
            this.sortedData[index] = subArray.filter(
              (item: any) => item._id !== res[0]
            );
          });

          this.userData.data = this.userData.data.filter(
            (item: any) => item._id !== res[0]
          );

          if (
            this.sortedData.every((subArray) => subArray.length === 0) &&
            this.userData.data.length === 0
          ) {
            this.closeDrawer.emit(true);
          }

          this.deleteItem.emit(res);
        }
      });
  }

  convertMinutesToHHMM(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const hoursStr = hours < 10 ? `0${hours}` : hours.toString();
    const minutesStr =
      remainingMinutes < 10
        ? `0${remainingMinutes}`
        : remainingMinutes.toString();

    return `${hoursStr}:${minutesStr}`;
  }

  convertDecimalToHoursMinutes(decimalHours: number): string {
    const hours = Math.floor(decimalHours);
    const minutes = (decimalHours - hours) * 60;
    return `${hours} hrs ${Math.round(minutes)} min`;
  }

  onCheckboxChange(event: any, item: any) {
    if (event.target.checked) {
      this.showDeleteAllSSIcon = true;
      this.selectedScreenshots.push(item);
    } else {
      const index = this.selectedScreenshots.findIndex((s) => s === item);
      if (index !== -1) {
        this.selectedScreenshots.splice(index, 1);
      }
    }
    this.selectedScreenshotsLength = this.selectedScreenshots.length;

    if (this.selectedScreenshots.length == 0) {
      this.showDeleteAllSSIcon = false;
    }
  }

  deleteSelectedScreenshots() {
    let data: string;
    if (this.selectedScreenshots.length == 1) {
      data = "this screenshot";
    } else {
      data = "these screenshots";
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
        if (res === true) {
          this._adminSer
            .deleteUserScreehshot(this.adminId, this.selectedScreenshots, this.todayDate)
            .subscribe((res: any) => {
              if (res) {
                this.snackBar.open(res.message, "Cancel", {
                  duration: 3000,
                  panelClass: ["success-snackbar"],
                });

                this.sortedData.forEach((subArray, index) => {
                  this.sortedData[index] = subArray.filter(
                    (data: any) => !res.deletedScreenshotIds.includes(data._id)
                  );
                });

                this.userData.data = this.userData.data.filter(
                  (data: any) => !res.deletedScreenshotIds.includes(data._id)
                );

                if (
                  this.sortedData.every((subArray) => subArray.length === 0) &&
                  this.userData.data.length === 0
                ) {
                  this.closeDrawer.emit(true);
                }

                this.deleteItem.emit(res.deletedScreenshotIds);
                this.showDeleteAllSSIcon = false;
                this.selectedScreenshotsLength = 0;
                this.selectedScreenshots = [];
              }
            });
        }
      });
  }
}
