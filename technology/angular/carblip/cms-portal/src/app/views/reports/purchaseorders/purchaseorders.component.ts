import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ReportsService } from 'app/shared/services/apis/reports.service';
import { ChartViewGenerateService } from 'app/shared/services/chart-view-generate.service';
import * as moment from 'moment-timezone';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { environment } from 'environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { ApexOptions } from '@vex/components/chart/chart.component';
import { defaultChartOptions } from '@vex/utils/default-chart-options';
@Component({
  selector: 'app-purchaseorders',
  templateUrl: './purchaseorders.component.html',
  styleUrls: ['./purchaseorders.component.scss', '../reports.component.scss'],
  animations: [
    fadeInRight400ms,
  ]
})
export class PurchaseordersComponent implements OnInit {
  @Input() view:any = [];
  public barChartData: { data: any[]; name: string; }[];
  private chartOptions: ApexOptions = null;

  public daterrange = {
    begin: null,
    end: null,
  };
  viewType = 'D';
  total: number;
  public selectedSource: any = [0];
  purchaseReport: any = [];

  public single = [];
  showCalendar: boolean = false;
  requestFilter: { start_date: string; end_date: string; source: any; };
  noDataMessage: string = '';

  constructor(
    private reportService: ReportsService,
    private chartViewGenerateService: ChartViewGenerateService,
    private _cdr: ChangeDetectorRef,
    private loader$: AppLoaderService,
    private snack$: MatSnackBar
  ) { }

  ngOnInit() { }

  getRegUsers() {
    this.noDataMessage = ''
    this.requestFilter = {
      start_date: moment(this.daterrange.begin).format('yyyy/MM/DD'),
      end_date: moment(this.daterrange.end).add(1, 'days').format('yyyy/MM/DD'),
      source: this.selectedSource.toString()
    };
    this.reportService.getPurchaseOrderReport(this.requestFilter).subscribe( res => {
      if(res.statusCode == 200 && res.data.length > 0){
        this.purchaseReport = res.data;
        this.purchaseReport = this.chartViewGenerateService.createChartData(this.purchaseReport, this.requestFilter.start_date, this.requestFilter.end_date);
        this.total = this.chartViewGenerateService.sum(this.purchaseReport);
        this.changeViewType(this.viewType);
        this._cdr.detectChanges();
      } else {
        this.purchaseReport = [];
        this.total = 0;
        this.noDataMessage = 'No Data Available';
        this._cdr.detectChanges();
      }
    }, error => {
      console.log("There are some errors. Please Check!",error);
    })
  }

  getSelectedDates(event) {
    this.daterrange = event;
    this.getRegUsers();
  }

  changeViewType(event) {
    if(this.purchaseReport.length > 0){
      if(event === 'D') {
        this.single = this.chartViewGenerateService.generateDayView(this.purchaseReport);
      } else if(event === 'W') {
        this.single = this.chartViewGenerateService.generateWeekView(this.purchaseReport);
      } else {
        this.single = this.chartViewGenerateService.generateMonthView(this.purchaseReport);
      }  
      this.createSingleChartData(this.single);
    }
    this.viewType = event;
  }

  createSingleChartData(data: any) {
    let fetchLabels = [];
    let set1 = [];
    data.map(item=> {
      fetchLabels.push(item.name);
      set1.push(item.series[0].value.toFixed(2))

    })
    this.initializeChart(fetchLabels);
    const array = [
      {data: set1, name: 'Value'},
    ]
    this.barChartData = array;
  }

  initializeChart(fetchLabels: Array<string>) {
    this.chartOptions = defaultChartOptions({
      grid: {
        show: true,
        strokeDashArray: 3,
        padding: {
          left: 16
        }
      },
      chart: {
        type: 'bar',
        height: 384,
        sparkline: {
          enabled: false
        },
        zoom: {
          enabled: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: fetchLabels,
        type: 'category',
        labels: {
          show: true
        }
      },
      yaxis: {
          labels: {
          show: true,
          formatter: function(val) {
            let dollarUSLocale = Intl.NumberFormat('en-US');
            return dollarUSLocale.format(Number(val)); 
          }
        },
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        x:{
          show: true
        },
        y: {
          formatter: function(val) {
            let dollarUSLocale = Intl.NumberFormat('en-US');
            return dollarUSLocale.format(Number(val)); 
          }
        },
        theme: 'dark'
      },
      legend: {
        show: true,
        itemMargin: {
          horizontal: 4,
          vertical: 4
        }
      }
    });
  }

  onExport(){
    let payload = {
      type: 'export-purchaseOrder',
      order_by: 'created_at',
      order_dir: 'desc',
      filter: JSON.stringify(this.requestFilter),
    };

    this.loader$.open();
    this.reportService.exportReportCharts(payload).subscribe( res => {
      this.loader$.close();
      if (res.data) {
        window.open(
          environment.apiUrl + '/export/download?token=' + res.data.token
        );
      } else {
        this.snack$.open('Something went wrong, Try again.', 'OK', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: ['snack-warning'],
        });
      }

    }, error => {
      console.log("There are some errors. Please Check!",error);
    });
  }
}
