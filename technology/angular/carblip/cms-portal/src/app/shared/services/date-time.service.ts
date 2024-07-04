import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';

export interface IDateRange {
  begin: string | Date;
  end: string | Date;
}

export interface IDateRangeSelection {
  start_date: string | Date;
  end_date: string | Date;
}

@Injectable({
  providedIn: 'root',
})
export class DateTimeService {
  constructor() {}
  startDateFormat = 'YYYY-MM-DD 00:00:00';
  endDateFormat = 'YYYY-MM-DD 23:59:59';

  static getDateRangeFromSelection(
    dateRangeSelection: IDateRangeSelection
  ): IDateRange {
    return {
      begin: dateRangeSelection.start_date
        ? moment(dateRangeSelection.start_date).toDate()
        : undefined,
      end: dateRangeSelection.end_date
        ? moment(dateRangeSelection.end_date).toDate()
        : undefined,
    };
  }

  getDefaultDateRange(): IDateRange {
    return {
      begin: moment().format(this.startDateFormat),
      end: moment().format(this.endDateFormat),
    };
  }

  getFormattedStartDate(date: string | Date): string {
    return moment(date).format(this.startDateFormat);
  }

  getFormattedEndDate(date: string | Date): string {
    return moment(date).format(this.endDateFormat);
  }

  getFormattedDateRangeSelection(dateRange: IDateRange): IDateRangeSelection {
    return {
      start_date: this.getFormattedStartDate(dateRange.begin),
      end_date: this.getFormattedEndDate(dateRange.end),
    };
  }
}
