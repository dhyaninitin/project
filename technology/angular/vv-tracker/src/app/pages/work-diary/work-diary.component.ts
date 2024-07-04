import { Component, OnInit, SecurityContext, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, UntypedFormControl, Validators } from "@angular/forms";
import { AdminService } from "../shared/services/admin.service";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DomSanitizer, SafeHtml, SafeStyle } from "@angular/platform-browser";
import { MatDrawer } from "@angular/material/sidenav";
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime } from "rxjs";
import { SortDirection } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";

@Component({
  selector: "vex-work-diary",
  templateUrl: "./work-diary.component.html",
  styleUrls: ["./work-diary.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class WorkDiaryComponent implements OnInit {
  layoutCtrl = new UntypedFormControl("boxed");
  @ViewChild("drawer") drawer: MatDrawer;
  @ViewChild(MatPaginator) logsPaginator!: MatPaginator;
  searchCtrlOfLogs = new UntypedFormControl();

  showFiller = false;
  panelOpenState = false;
  totalDataCount: number = 0;
  userData: any;

  page: number = 1;
  size: number = 30;
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
  logType: number = 3;

  isLoading: boolean = false;
  userDataArray: any[] = [];
  dataSource = [];
  columnsToDisplay = ["empid", "firstname", "lastname"];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, "expand"];
  expandedElement: any | null;
  isSpinnerLoading: boolean = false;
  control = new FormControl();
  public sortKey: string;
  sortDirection: SortDirection = '';
  history: any[] = [];
  showNoLogsText: boolean = false;
  timeout: NodeJS.Timeout;

  constructor(
    private _adminSer: AdminService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private spinnerSer: NgxSpinnerService,
    private fb: FormBuilder
  ) { this.filterLogsForm = this.fb.group({ logsfrom: [''], logsto: [''] }); }

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

    this.control.valueChanges
    .pipe(debounceTime(100))
    .subscribe((value) => {
      if (value.from && value.to) {
        this.userDataArray = [];
        this.spinnerSer.show(undefined, {
          type: 'square-jelly-box',
          size: 'medium',
        });
  
        setTimeout(() => {
          this.spinnerSer.hide();
        }, 300);
      }
    });

    const currentDate = new Date();
    const startDate = this.calculateStartOfWeek(currentDate);
    const endDate = this.calculateEndOfWeek(currentDate);

    this.control.setValue({
      from: startDate,
      to: endDate,
    });
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

  calculateStartOfWeek(currentDate: Date): Date {
    const firstDayOfWeek = 0;
    const dayOfWeek = currentDate.getDay();
    const diff = (7 + (dayOfWeek - firstDayOfWeek)) % 7;
    currentDate.setDate(currentDate.getDate() - diff);
    currentDate.setHours(0, 0, 0, 0);
    return currentDate;
  }

  calculateEndOfWeek(currentDate: Date): Date {
    const startOfWeek = this.calculateStartOfWeek(currentDate);
    const endDate = new Date(startOfWeek);
    endDate.setDate(startOfWeek.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  }

  toggleLoading = () => (this.isLoading = !this.isLoading);

  onScroll() {
    this.page++;
    this.appendData();
  }

  appendData() {
    this._adminSer
      .getUsers(this.page, this.size, this.search, this.orderBy, this.orderDir)
      .subscribe({
        next: (response) => {
          this.dataSource = [...this.dataSource, ...response.data];
        },
        error: (err) => console.log(err),
        complete: () => this.toggleLoading(),
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
      .getUsers(page, size, search, orderBy, orderDir)
      .subscribe((res: any) => {
        if (res) {
          this.dataSource = [...res.data]
        }
      });
  }

  sortData(event: any) {
    this.orderBy = event.active || 'createdAt';
    this.orderDir = event.direction || 'asc';
    this.getUsers(this.page, this.size, this.search, this.orderBy, this.orderDir);
  }

  getProgressWidth(totalHours: number): SafeStyle {
    const width = totalHours * 10 + "%";
    return this.sanitizer.bypassSecurityTrustStyle(`width: ${width}`);
  }

  onExpandRow(id: any) {
    if (this.expandedElement) {
      this.isSpinnerLoading = true;
      let utcTimestampFrom  =  new Date(this.control.value.from); 
      let From = new Date(utcTimestampFrom.getTime() + (5 * 60 + 30) * 60000);
      let utcTimestampTo  =  new Date(this.control.value.to); 
      let To = new Date(utcTimestampTo.getTime() + (5 * 60 + 30) * 60000);
      To.setTime(To.getTime() + 24 * 60 * 60 * 1000);

      const payload = {
        id: id,
        from: From.toISOString(),
        to: To.toISOString(),
      };
      this._adminSer.getUsersFromTo(payload).subscribe((res: any) => {
        setTimeout(async () => {
          if ((await res.data.length) >= 1) {
            this.userDataArray = res.data;
            this.isSpinnerLoading = false;
          } else {
            this.userDataArray = [];
            this.isSpinnerLoading = false;
            this.snackBar.open("No data found", "cancel", {
              duration: 3000,
              panelClass: ["error-snackbar"],
            });
          }
        }, 1000);
      });
    } else {
      this.isSpinnerLoading = false;
    }
  }

  onCardClick(data: any, date: any) {
    const payload = {
      date: date,
      data: data,
    };
    this.userData = payload;
    this.drawer.open();
    this._adminSer.refreshDailyDiaryComSubject.next(true);
  }

  onDeleteItem(deletedItemIds: string[]) {
    deletedItemIds.forEach((deletedItemId) => {
      this.userDataArray.forEach((data, index) => {
        data = data.filter((item: any) => item._id !== deletedItemId);
        this.userDataArray[index] = data;
      });
    });
    this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
  }  

  convertDecimalToHoursMinutes(decimalHours: number): string {
    const hours = Math.floor(decimalHours);
    const minutes = (decimalHours - hours) * 60;
    return `${hours} h ${Math.round(minutes)} m`;
  }

  onPageChangeOfLogs(event: any) {
    this.logsPage = event.pageIndex + 1;
    this.logsSize = event.pageSize;
    this.getHistory(this.logsPage, this.logsSize, this.logsFrom, this.logsTo, this.logType, this.logsSearch);
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
