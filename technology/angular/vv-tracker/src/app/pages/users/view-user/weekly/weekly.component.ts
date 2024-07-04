import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { AdminService } from "src/app/pages/shared/services/admin.service";
import { ViewScreenshotComponent } from "../view-screenshot/view-screenshot.component";

@Component({
  selector: "vex-weekly",
  templateUrl: "./weekly.component.html",
  styleUrls: ["./weekly.component.scss"],
})
export class WeeklyComponent implements OnInit {
  @Input() idOfUser: any;

  weeklyData: any[][] = [];
  groupedScreenshots: any;

  page: number = 1;
  size: number = 100;
  isLoading: boolean = false;
  userId: any;

  constructor(
    private _adminSer: AdminService,
    private _sanitizer: DomSanitizer,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void { 
    this.getUserWeeklyData(this.idOfUser);
  }

  toggleLoading = () => (this.isLoading = !this.isLoading);

  onScroll() {
    this.page++;
    this.appendData(this.userId);
  }

  getUserWeeklyData(id: any) {
    this.userId = id;
    this._adminSer.getUserWeeklyData(id, this.page, this.size).subscribe({
      next: (response) => {
        this.weeklyData = response.weeklyData;
        this.sanitizeImageUrls(this.weeklyData);
      },
      error: (err) => console.log(err),
      complete: () => this.toggleLoading(),
    });
  }

  appendData(id: any) {
    this._adminSer.getUserWeeklyData(id, this.page, this.size).subscribe({
      next: (response) => {
        this.weeklyData = [...this.weeklyData, ...response.weeklyData];
        this.sanitizeImageUrls(this.weeklyData);
      },
      error: (err) => console.log(err),
      complete: () => this.toggleLoading(),
    });
  }

  sanitizeImageUrls(data: any[]): void {
    const groupedScreenshots: any[] = [];
  
    data.forEach((outerArray: any[]) => {
      outerArray.forEach((innerArray: any[]) => {
        innerArray.forEach((item: any) => {
          const screenshotData = item.screen;
          const dataURI = screenshotData;
  
          const dateKey = new Date(item.createdat).toLocaleDateString();
  
          const existingGroupIndex = groupedScreenshots.findIndex(
            (group) => group.date === dateKey
          );
          if (existingGroupIndex !== -1) {
            groupedScreenshots[existingGroupIndex].screenshots.push({
              image: dataURI,
              mouseclicks: item.mouseclicks,
              keypresses: item.keypresses,
            });
          } else {
            groupedScreenshots.push({
              date: dateKey,
              screenshots: [
                {
                  image: dataURI,
                  mouseclicks: item.mouseclicks,
                  keypresses: item.keypresses,
                },
              ],
            });
          }
        });
      });
    });
  
    this.groupedScreenshots = groupedScreenshots;
  }  

  viewScreenShot(screenshot: any) {
    this.dialog.open(ViewScreenshotComponent, {
      width: "auto",
      height: "auto",
      data: screenshot.image,
    })
  }
}
