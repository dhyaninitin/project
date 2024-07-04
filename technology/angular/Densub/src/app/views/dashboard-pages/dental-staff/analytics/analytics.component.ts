import { Component, OnInit } from '@angular/core';
import { currentUser } from '../../../home-pages/job-details/user.model';
import { WorkDiaryService } from '../../../../shared-ui/service/workDiary.service';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SortService } from '../../../../shared-ui/service/sort.service';
import { environment } from '../../../../../environments/environment';
import { ExcelService } from '../../../../shared-ui/service/excel.service';
import * as moment from 'moment';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  timesheet = [];
  order: any = '';
  reverse: Boolean = false;
  itemsPerPage = 10;
  jobLabel = environment.JOB_LABEL;
  currentUser: currentUser = new currentUser();
  dataFilter: any = {
    name: '',
    jobType: '',
    positionType: '',
    jobDates: []
  };
  setDataFilter: any;
  total = {
    hours : 0,
    wages : 0
  };
  excelExportSheet = [];
  jobTypes: any = environment.JOB_TYPE;
  PositionTypeData: any = [];
  rangeDatepickerConfig = {
    rangeInputFormat : 'MMMM DD YYYY',
    containerClass: 'theme-dark-blue',
    isAnimated: true,
    adaptivePosition: true
  };
  tempTimesheet = [];
  totalPositionType = [];

  Highcharts = Highcharts;
  chartOptions = {
    chart: { type: 'column' },
    title: { text: 'Analysis' },
    xAxis: { type: 'category', title: { text: 'Position Type' } },
    yAxis: { title: { text: 'Total Amount' } },
    legend: { enabled: false },
    accessibility: {
      announceNewData: {
        enabled: true
      }
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '${point.y:.1f}'
        }
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>${point.y:.2f}</b> of total<br/>'
    },
    series: [
      {
        name: "Position Type",
        colorByPoint: true,
        data: []
      }
    ]
  };

  constructor(
    private workDiaryService: WorkDiaryService,
    private globalService: GlobalService,
    private jwtService: JwtService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private sortService: SortService,
    private excelService: ExcelService
  ) {
    this.globalService.topscroll();
    this.currentUser = this.jwtService.currentLoggedUserInfo;
  }

  // analytics: any[];

  ngOnInit() {
    this.getAnalytics();
    this.PositionTypeData = this.globalService.positionTypeData;
  }

  setOrder(value: string) {
    if (this.order === value) {
        this.reverse = !this.reverse;
    }
    this.order = value;
  }

  /** This method will reset filter criteria*/
  resetFilter() {
    this.dataFilter = {
                        name: '',
                        jobType: '',
                        positionType: '',
                        jobDates: []
                      };
    this.filterAnalytics();
  }

  getAnalytics() {
    const condition = {
      staffId : this.currentUser._id,
      paidStatus : environment.WORKDIARY_PAID_STATUS.PAID
    };
    this.spinner.show();
    this.workDiaryService.getworkDiaryDetails({condition}).subscribe(data => {
      this.spinner.hide();
      if (data.status === 200) {
        if (data.data.length > 0) {
          this.PositionTypeData.map( type => {
            this.totalPositionType[type] = 0;
          });

          this.createTimesheetAnalytics(data.data);
        }

      } else {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    }, error => {
      this.spinner.hide();
        this.toastr.error( 'There are some server error, Please check connection.', 'Error' );
    });
  }

  createTimesheetAnalytics(timesheetList) {
    // this.timesheet = timesheetList;
    // tempTimesheet
    timesheetList.map( (work,i) => {
      work['totalHoursWorked'] = this.calTotalHours(work.totalTime);
      work['jobTypeLabel'] = this.jobLabel[work.contractId.jobPostId.jobType];
      work['distanceTravelled'] = this.sortService.calulateDistance(
                                work.staffId.location.latitude,
                                work.staffId.location.longitude,
                                work.contractId.jobPostId.locationLatLng.latitude,
                                work.contractId.jobPostId.locationLatLng.longitude, 'M');

      this.total.hours += work['totalHoursWorked'];
      this.total.wages += work['totalAmount'];
      this.totalPositionType[work.contractId.jobPostId.positionType] += work['totalAmount'];
      this.timesheet.push(work);
      this.tempTimesheet.push(work);
        /* ----- Excel Export Array ----- */
        this.createExportArray(work);
        if(i === (timesheetList.length - 1)){
          this.createGraphData();

        }
      // let exportData = {};
      // exportData['Assignment ID'] = work.contractId._id;
      // exportData['Assignment Date'] =  moment(work.contractId.jobPostId.jobDate).format('MMM DD,YYYY');
      // exportData['Job Type'] = work.jobTypeLabel;
      // exportData['Position Type'] = work.contractId.jobPostId.positionType;
      // exportData['Practice Name'] = work.practiceId.firstName + ' ' + work.practiceId.lastName;
      // exportData['Location'] = work.contractId.jobPostId.location ;
      // exportData['Distance Traveled (RT)'] = work.distanceTravelled.toFixed(2) ;
      // exportData['Total Wages'] = '$' + work.totalAmount ;

      // exportData['Total Hrs Worked'] = work.totalHoursWorked;
      // exportData['Hourly Rate'] = work.contractId.finalRate;
      // this.excelExportSheet.push(exportData);

    });
  }

  createExportArray(work) {
    let exportData = {};
      exportData['Assignment ID'] = work.contractId._id;
      exportData['Job Date'] =  moment(work.contractId.jobPostId.jobDate).format('MMM DD,YYYY');
      exportData['Job Type'] = work.jobTypeLabel;
      exportData['Position Type'] = work.contractId.jobPostId.positionType;
      exportData['Practice Name'] = work.practiceId.firstName + ' ' + work.practiceId.lastName;
      exportData['Location'] = work.contractId.jobPostId.location ;
      exportData['Distance Traveled (RT)'] = work.distanceTravelled.toFixed(2) ;
      exportData['Total Wages'] = '$' + work.totalAmount ;

      exportData['Total Hrs Worked'] = work.totalHoursWorked;
      exportData['Hourly Rate'] = work.contractId.finalRate;
    this.excelExportSheet.push(exportData);
  }

  filterAnalytics() {
    this.timesheet = [];
    this.excelExportSheet = [];
    this.PositionTypeData.map( type => {
      this.totalPositionType[type] = 0;
    });
    this.total = {
      hours : 0,
      wages : 0
    };
    for(let i = 0; i < this.tempTimesheet.length; i++ ) {
      var work = this.tempTimesheet[i];
      var pushCond = false;
      if(this.dataFilter.name !== ''){
        var fullName = (work.practiceId.firstName + ' ' + work.practiceId.lastName).toLowerCase();
        pushCond =  (fullName.includes(this.dataFilter.name.toLowerCase()));
      }
      if(this.dataFilter.jobType !== ''){
        pushCond =  (this.dataFilter.jobType  === work.contractId.jobPostId.jobType)
      }
      if(this.dataFilter.positionType !== ''){
        pushCond = (this.dataFilter.positionType  === work.contractId.jobPostId.positionType)
      }
      if( this.dataFilter.jobDates.length > 0){
        let jobDate = moment(work.contractId.jobPostId.jobDate);
        let jobDateSame = moment(work.contractId.jobPostId.jobDate).format('YYYY-MM-DD');
        let startDate = moment(this.dataFilter.jobDates[0]).format('YYYY-MM-DD');
        let endDate = moment(this.dataFilter.jobDates[1]).format('YYYY-MM-DD');

        pushCond = (
                      ( moment(jobDateSame).isSame(startDate,'day') ||
                        moment(jobDateSame).isSame(endDate,'day')   ||
                        jobDate.isBetween(startDate, endDate)
                      )
                    );

      }
      if(this.dataFilter.name === '' && this.dataFilter.jobType === '' && this.dataFilter.positionType === '' && this.dataFilter.jobDates.length === 0) {
        pushCond = true;
      }

      if(pushCond){
        this.total.hours += work['totalHoursWorked'];
        this.total.wages += work['totalAmount'];
        this.totalPositionType[work.contractId.jobPostId.positionType] += work['totalAmount'];
        this.timesheet.push(this.tempTimesheet[i]);
        this.createExportArray(work);
        if(i === (this.tempTimesheet.length - 1)){
          this.createGraphData();

        }
      }
    }
  };

  createGraphData() {
    let tempValue = [];
    console.log(this.totalPositionType);
    for (var key in this.totalPositionType) {
      var value = this.totalPositionType[key];
      tempValue.push({
        name: key,
        y: value
      });
    }
    let newChartOptions = JSON.parse(JSON.stringify(this.chartOptions));
    newChartOptions.series[0].data = tempValue;

    this.chartOptions = newChartOptions;
  }

  calTotalHours(totalTime) {
    let mintues = 0;
    if (totalTime.minutes) {
      mintues = +((totalTime.minutes / 60).toFixed(1));
      }
    return (totalTime.hours + mintues);
  }

  exportAsXLSX() {
    this.excelService.exportAsExcelFile(this.excelExportSheet, 'Densub Analytics');
  }
}
