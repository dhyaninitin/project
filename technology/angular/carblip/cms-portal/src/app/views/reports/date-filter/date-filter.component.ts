import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as commonModels from 'app/shared/models/common.model';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss', '../reports.component.scss']
})
export class DateFilterComponent implements OnInit {
  @Output() selectedDates = new EventEmitter<Object>();
  @Output() selectedViewType = new EventEmitter<Object>();

  public rangeOptions = [
    { id: 1, value : 'This Month'}, { id: 2, value : 'Last Month'}, { id: 3, value : 'This Year'}, { id: 4, value : 'Last Year'},
    { id: 8, value : 'This Week'}, { id: -7, value : 'Last Week'}, { id: 30, value : '30 Days'},
    { id: 5, value : 'Custom'}
  ]

  public selectedDate: any = '30 Days';
  showCalendar: boolean = false
  today = moment().format();
  calendarDateRange: commonModels.CalendarDateRange = {
    begin: this.today,
    end: this.today,
  };

  type: string = 'D';
  constructor() { }

  ngOnInit() {
   let last_30_days = this.calculateDateDifference('30 Days');
   this.selectedDates.emit(last_30_days);
   this.selectedViewType.emit(this.type);
  }


  onCustomDateRangeChange(){
    this.selectedDates.emit(this.calendarDateRange);
  }

  onPredefinedDateRangeChange(){
    if(this.selectedDate === 'Custom') {
      this.showCalendar = true;
    }else {
      this.showCalendar = false;
      this.calendarDateRange = this.calculateDateDifference(this.selectedDate);
      this.selectedDates.emit(this.calendarDateRange);
    }
  }

  changeViewType() {
    this.selectedViewType.emit(this.type);
  }

  calculateDateDifference(selectedDate: string) {
    let today = new Date();
    let priorDate;
    if( selectedDate === '7 Days') {
      priorDate = new Date(new Date().setDate(today.getDate() - 6));
    }else if( selectedDate === '30 Days') {
      priorDate = new Date(new Date().setDate(today.getDate() - 29));
    } else if( selectedDate === '60 Days') {
      priorDate = new Date(new Date().setDate(today.getDate() - 59));
    } else if( selectedDate === '90 Days') {
      priorDate = new Date(new Date().setDate(today.getDate() - 89));
    } else if ( selectedDate === 'This Week') {
      priorDate = moment().startOf('week').toDate();
    } else if ( selectedDate === 'Last Week') {
      today = moment().subtract(1, "week").endOf("week").toDate();
      priorDate = moment().subtract(1, "week").startOf("week").toDate();
    } else if ( selectedDate === 'This Month') {
      priorDate = moment().startOf('month').toDate();
    } else if ( selectedDate === 'Last Month') {
      today = moment().subtract(1, "months").endOf("months").toDate();
      priorDate = moment().subtract(1, "months").startOf("months").toDate();
    } else if ( selectedDate === 'This Year') {
      priorDate = moment().startOf('year').toDate();
    } else if ( selectedDate === 'Last Year') {
      today = moment().subtract(1, "year").endOf("year").toDate();
      priorDate = moment().subtract(1, "year").startOf("year").toDate();
    }
    this.calendarDateRange.begin = priorDate;
    this.calendarDateRange.end = today;
    return this.calendarDateRange;
  }
}
