import { Component, Input, OnInit } from "@angular/core";
import { AdminService } from "src/app/pages/shared/services/admin.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { MatDialog } from "@angular/material/dialog";
import { ViewScreenshotComponent } from "../view-screenshot/view-screenshot.component";

@Component({
  selector: "vex-daily",
  templateUrl: "./daily.component.html",
  styleUrls: ["./daily.component.scss"],
})
export class DailyComponent implements OnInit {
  @Input() idOfUser: any;
  todayData: any[] = [];

  page: number = 1;
  size: number = 100;
  isLoading: boolean = false;
  userId: any;
  sorteData: any[] = [];

  constructor(
    private _adminSer: AdminService,
    private _sanitizer: DomSanitizer,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getUserDailyData(this.idOfUser)
  }

  toggleLoading = () => (this.isLoading = !this.isLoading);

  onScroll() {
    this.page++;
    this.appendData(this.userId);
  }

  getUserDailyData(id: any) {
    if (this.sorteData.length > 0) {
      return
    }
    this.userId = id;
    this._adminSer.getUserDailyData(id, this.page, this.size).subscribe({
      next: (response) => {
        const groupedData = {};
        response.todayData.forEach(obj => {
          const timerstartedat = obj.timerstartedat;
          if (!groupedData[timerstartedat]) {
            groupedData[timerstartedat] = [];
          }
          groupedData[timerstartedat].push(obj);
        });
        const groupedArray = Object.values(groupedData);
        groupedArray.sort((a, b) => {
          const aDate: any = new Date(a[0].timerstartedat);
          const bDate: any = new Date(b[0].timerstartedat);
          return aDate - bDate;
        });
        this.todayData = groupedArray;
        this.sanitizeImageUrls();
      },
      error: (err) => console.log(err),
      complete: () => this.toggleLoading(),
    });
  }

  appendData(id: any) {
    this._adminSer.getUserDailyData(id, this.page, this.size).subscribe({
      next: (response) => {
        this.todayData = [...this.todayData, ...response.todayData];
        this.sanitizeImageUrls();
      },
      error: (err) => console.log(err),
      complete: () => this.toggleLoading(),
    });
  }

  sanitizeImageUrls(): void {
    this.todayData.map((outerArray: any) => {
      outerArray.map((innerArray: any) => {
        const dataURI = innerArray.screen;
        innerArray.screen = dataURI;
      });
      let data = {
        from: outerArray[0].timerstartedat,
        to: this.calculateTime(outerArray[0].timerstartedat, outerArray.length),
        screenShots: outerArray
      }
      this.sorteData.push(data)
    });
  }

  calculateTime(timeStartTime: string, totalRecords: any) {
    const originalDate = new Date(timeStartTime);
    originalDate.setMinutes(originalDate.getMinutes() + (totalRecords*10));
    return originalDate.toISOString();
  }

  viewScreenShot(screenshot: any) {
    this.dialog.open(ViewScreenshotComponent, {
      width: "auto",
      height: "auto",
      data: screenshot,
    });
  }
}
