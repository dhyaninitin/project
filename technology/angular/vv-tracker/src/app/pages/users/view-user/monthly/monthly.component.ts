import { Component, Input, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { AdminService } from "src/app/pages/shared/services/admin.service";
import { ViewScreenshotComponent } from "../view-screenshot/view-screenshot.component";
import { MatDialog } from "@angular/material/dialog";
import { fadeInItems } from "@angular/material/menu";

@Component({
  selector: "vex-monthly",
  templateUrl: "./monthly.component.html",
  styleUrls: ["./monthly.component.scss"],
})
export class MonthlyComponent implements OnInit {
  @Input() idOfUser: any;

  monthlyData: any[][] = [];
  groupedScreenshots: any;

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
    this.getUserMonthlyData(this.idOfUser)
  }

  toggleLoading = () => (this.isLoading = !this.isLoading);

  onScroll() {
    this.page++;
    this.appendData(this.userId);
  }

  getUserMonthlyData(id: any) {
    if (this.sorteData.length > 0) {
      return
    }
    this.userId = id;
    this._adminSer.getUserMonthlyData(id, this.page, this.size).subscribe({
      next: (response) => {
        this.monthlyData = response.monthlyData.filter(subArray => subArray.length > 0);
        this.sanitizeImageUrls(this.monthlyData);
      },
      error: (err) => console.log(err),
      complete: () => this.toggleLoading(),
    });
  }

  appendData(id: any) {
    this._adminSer.getUserMonthlyData(id, this.page, this.size).subscribe({
      next: (response) => {

        this.monthlyData = [...this.monthlyData, ...response.monthlyData];
        this.sanitizeImageUrls(this.monthlyData);
      },
      error: (err) => console.log(err),
      complete: () => this.toggleLoading(),
    });
  }

  sanitizeImageUrls(data: any[]): void {
    const groupedScreenshots: any[] = [];
    data.forEach((outerArray: any[]) => {
      outerArray.forEach((innerArray: any) => {
        const dataURI = innerArray.screen;
        innerArray.screen = dataURI
      });
      let payload = {
        date: outerArray[0].createdat,
        screenShots: outerArray
      }
      this.sorteData.push(payload)
    });
    this.groupedScreenshots = groupedScreenshots;
  }

  viewScreenShot(screenshot: any) {
    this.dialog.open(ViewScreenshotComponent, {
      width: "auto",
      height: "auto",
      data: screenshot,
    });
  }
}
