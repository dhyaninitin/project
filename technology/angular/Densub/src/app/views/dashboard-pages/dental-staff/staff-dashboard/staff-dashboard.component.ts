import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarView, CalendarMonthViewDay } from 'angular-calendar';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { SimpleTimer } from 'ng2-simple-timer';
import { startOfDay, addMonths, differenceInCalendarDays } from 'date-fns';

import { GlobalService } from '../../../../shared-ui/service/global.service';
import { RatingService } from '../../../../shared-ui/service/rating.service';
import { WorkDiaryService } from '../../../../shared-ui/service/workDiary.service';
import { TimesheetService } from '../../../../shared-ui/service/timesheet.service';
import { OfferService } from '../../../../shared-ui/service/offer.service';
import { UsersService } from '../../../../shared-ui/service/users.service';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { SortService } from '../../../../shared-ui/service/sort.service';
import { currentUser } from '../../../../layouts/home-layout/user.model';
import { WorkDiary } from '../../../../shared-ui/modal/work-diary.modal';
import { Offer } from '../../../../shared-ui/modal/offer.modal';
import { StaffAnalytics } from '../../../../shared-ui/modal/staff-analytics.modal';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-staff-dashboard',
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.scss']
})

export class StaffDashboardComponent implements OnInit {
  @ViewChild("availabilityModal", { static: false })
  @ViewChild('timeSheetModal', { static: false }) timeSheetModal: ModalDirective;

  public availabilityModal: ModalDirective;

  viewDate: Date = new Date();
  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Month;
  todayDate: Date = startOfDay(new Date()); // Current Date
  futureDate: Date = startOfDay(addMonths(new Date(), 1)); // 1 month future date
  showCalendarDate = (differenceInCalendarDays(this.futureDate, this.todayDate) + 1); //show custom calendar dates;
  customCalendarDates: any = [];
  currentUser: currentUser = new currentUser();
  upcommingContracts = [];
  myPostedjobs = [];
  sentOffers = [];
  timesheet = [];
  pendingRatings = [];
  p: any;
  q: any;
  x: any;
  offerStatus = environment.OFFER_STATUS_NEW;
  profileStatus = environment.PROFILE_STATUS;
  contractStatus: any = environment.CONTRACT_STATUS;
  offerList = [];
  contractsPerPage = 3;
  offerPerPage = 3;
  timesheetPerPage = 3;
  pendingRatingsPerPage = 3;
  calendarDays: any = [];
  customCalStartIndex = 0;
  analytics = new StaffAnalytics();
  counter2 = 0;
  timer2Id: string;
  timer2Name: string = '';
  timer2button = 'Clock In Now';
  totalTime = '';
  durations = '';
  getTime = '';
  totalSeconds: number = undefined;
  isNewDay: boolean = false;
  localTime: any;
  workDiary = new WorkDiary();
  contract: any;
  contractExists: boolean = false;
  contractDetail: any = new Offer();
  workDiaryIndex: any = -1;
  startTime: any;
  endTime: any;

  constructor(
    private globalService: GlobalService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private ratingService: RatingService,
    private workDiaryService: WorkDiaryService,
    private timesheetService: TimesheetService,
    private offerService: OfferService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private sortService: SortService,
    private st: SimpleTimer
  ) {
    this.globalService.topscroll();
    this.currentUser = this.jwtService.currentLoggedUserInfo;
  }

  ngOnInit() {
    this.getUpcommingContracts();
    this.getOfferList();
    this.getTimesheet();
    this.getPendingRatings();
    this.getUsersData();
    // Check if any contract available on todays date.
    // If available show tracker and send timesheet to that practice.
    // Else disable time tracker
    const condition = {
      status: environment.OFFER_STATUS_NEW.CONTRACT,
      staffId: this.currentUser._id,
      contractStatus: { $ne: this.contractStatus.REVOKE },
    };
    const sort = { updatedAt: -1 };
    this.offerService.getAllOffers({ condition, sort }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.contract = data.data[0];
            const array = data.data.filter(arr => {
              const t1 = new Date(arr.date);
              const d1 = t1.getFullYear() + '-' + (t1.getMonth() + 1) + '-' + t1.getDate();
              const t2 = new Date(moment(new Date()).toISOString())
              const d2 = t2.getFullYear() + '-' + (t2.getMonth() + 1) + '-' + t2.getDate();
              return Date.parse(d1) === Date.parse(d2)
            });
            if (array && array.length && array.length > 0) {
              this.contract = array[0];
              this.contractExists = true;
              this.getDetails();
            }
          }
        }
      }
    )
  }

  getDetails() {
    const data = JSON.parse(window.localStorage.getItem('time'));
    if (data) {
      this.counter2 = data;
      this.totalTime = new Date(this.counter2 * 1000).toISOString().substr(11, 8);
      window.localStorage.removeItem('time')
    }
    else {
      const value = JSON.parse(window.localStorage.getItem('timetracker'));
      if (value && value.seconds) {
        this.localTime = value.seconds;
      }
      this.timesheetService.getTimesheetDetails({ staffId: this.currentUser._id }).subscribe(data => {
        const array = data.data.filter(arr => {
          const t1 = new Date(arr.date);
          const d1 = t1.getFullYear() + '-' + (t1.getMonth() + 1) + '-' + t1.getDate();
          const t2 = new Date(moment(new Date()).toISOString())
          const d2 = t2.getFullYear() + '-' + (t2.getMonth() + 1) + '-' + t2.getDate();
          return arr.clockOutTime !== "" && arr.timeDuration !== "" && Date.parse(d1) === Date.parse(d2)
        });
        if (array.length > 0) {
          this.durations = array && array.length && array.length > 0 && array[0].timeDuration;
          this.getTime = this.durations;
          var a = this.getTime.split(':');
          var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
          this.totalSeconds = seconds + 1;
          this.isNewDay = false;
          if (this.getTime !== "") {
            this.totalTime = this.getTime;
          }
        } else {
          this.isNewDay = true;
          this.totalTime = '00:00:00';
          this.startTime = moment(new Date()).toISOString();
        }
        if (this.localTime) {
          const tempArray = [new Date(this.localTime * 1000).toISOString().substr(11, 8)];
          const totalDurations = tempArray.slice(1).reduce((prev, cur) => moment.duration(cur).add(prev), moment.duration(tempArray[0]));
          this.getTime = moment.utc(totalDurations.asMilliseconds()).format("HH:mm:ss");;
          this.totalTime = this.getTime;
          var a = this.totalTime.split(':');
          var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
          this.counter2 = seconds + 1;
          this.timer2Id = this.st.subscribe(this.timer2Name, () => this.timer2callback());
          this.timer2button = 'Clock Out Now';
        } else {
          this.getTime = this.durations;
          this.totalTime = this.getTime
        }
      })
    }
    this.st.newTimer(this.timer2Name, 1, true);
  }

  stopTimer() {
    this.st.delTimer(this.timer2Name);
    this.endTime = moment(new Date()).toISOString();
    // submit the timesheet to practice
    if (this.timesheet.length === 0) {
      this.submitWorkDiary();
    } else {
      this.toastr.error("Today's Timesheet is already submitted", 'Error');
    }
  }

  subscribeTimer2() {
    let object = {};
    if (this.timer2Id) {
      this.st.unsubscribe(this.timer2Id);
      window.localStorage.removeItem('timetracker');
      this.timer2Id = undefined;
      this.timer2button = 'Clock In Now';
      object = { staffId: this.currentUser._id, date: moment(new Date()).toISOString(), clockInTime: '', clockOutTime: new Date().toLocaleTimeString(), timeDuration: this.totalTime };
    } else {
      if (this.totalSeconds && !this.isNewDay) {
        this.counter2 = this.totalSeconds;
      }
      this.timer2Id = this.st.subscribe(this.timer2Name, () => this.timer2callback());
      this.timer2button = 'Clock Out Now';
      object = { staffId: this.currentUser._id, date: moment(new Date()).toISOString(), clockInTime: new Date().toLocaleTimeString(), clockOutTime: '', timeDuration: '' };
    }
    // make entry in timehseet table
    this.timesheetService.addTimesheet(object).subscribe(data => {
      this.durations = data.data.timeDuration;
      this.getTime = this.durations;
      var a = this.getTime.split(':');
      var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
      this.totalSeconds = seconds + 1;
      this.isNewDay = false;
      if (this.getTime !== "") {
        this.totalTime = this.getTime;
      }
      if (data.status === 200) {
        this.toastr.success('Clock In/Out event is submitted to practice', 'Success');
      } else {
        this.toastr.error('There are some server Please check connection.', 'Error');
      }
    })
  }

  timer2callback(): void {
    window.localStorage.setItem('timetracker', JSON.stringify({ seconds: this.counter2, timer2Id: this.timer2Id }));
    this.totalTime = new Date(this.counter2 * 1000).toISOString().substr(11, 8);
    this.counter2++;
  }

  timesheetAmountCal(time, amount) {
    const minCal = (time.hours > 0) ? (time.hours * amount) : 0;
    const hourCal = (time.minutes > 0) ? ((amount * time.minutes) / 60) : 0;
    return ((minCal + hourCal).toFixed(2));
  }

  submitWorkDiary() {
    if (this.workDiary.date) {
      this.workDiary.date = moment(this.workDiary.date).toISOString();
    }
    const temp = this.totalTime.split(':');
    const totalTimeObject = { hours: temp[0], minutes: temp[1] };
    this.workDiary.date = new Date(moment(new Date()).toISOString());
    this.workDiary.totalTime = totalTimeObject;
    this.workDiary.startTime = this.startTime;
    this.workDiary.endTime = this.endTime;
    this.workDiary.totalAmount = +(this.timesheetAmountCal(totalTimeObject, this.contract.finalRate));
    this.workDiary.contractId = this.contract._id;
    this.workDiary.practiceId = this.contract.practiceId._id;
    this.workDiary.staffId = this.contract.staffId._id;
    delete this.workDiary.paymentDetails['paymentId'];
    let workDiary = JSON.parse(JSON.stringify(this.workDiary));
    this.workDiaryService.addWork(workDiary).subscribe(data => {
      if (data.status === 200) {
        let message = 'Timesheet has been submitted.';
        this.toastr.success(message, 'Success');
      } else {
        this.toastr.error('There are some server Please check connection.', 'Error');
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error('There are some server Please check connection.', 'Error');
    });
  }


  getUsersData() {
    const self = this;
    this.usersService
      .getUserInfo({
        _id: this.jwtService.currentLoggedUserInfo._id
      })
      .subscribe(
        async data => {
          if (data.status === 200) {
            const userData = data.data;
            if (userData.availableDays && userData.availableDays.length) {
              userData.availableDays = userData.availableDays;
              self.calendarDays = userData.availableDays;
              self.calendarDays.map(function (obj) {
                obj.start = startOfDay(obj.start);
                return obj;
              });
              this.updateCustCalDates();
            }
          }
        },
        error => {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      );
  }

  /* checkAvailability(){
    this.availabilityModal.show()
  } */

  closeModel() {
    this.availabilityModal.hide()
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  updateCustCalDates() {
    let showCalendarDateIndex = 0;
    // find index of current Date in 365 days
    this.customCalStartIndex = this.calendarDays.findIndex((day) => {
      return (differenceInCalendarDays(day.start, this.todayDate) === 0) ? true : false;
    });
    showCalendarDateIndex = this.calendarDays.findIndex((day) => {
      return (differenceInCalendarDays(day.start, this.futureDate) === 0) ? true : false;
    });
    showCalendarDateIndex++;
    // increase the indexing of removing data with future date
    if (this.customCalStartIndex > -1) {
      this.customCalendarDates = this.calendarDays.slice(this.customCalStartIndex, showCalendarDateIndex);
    }
  }

  selectCustomcalendarDates() {
    let customCalStartIndex = 0;
    // find index of current Date in 365 days
    // increase the indexing of removing data for future date
    this.showCalendarDate = this.showCalendarDate + customCalStartIndex;
    if (customCalStartIndex > -1) {
    }

    if (this.customCalendarDates.length > 0) {
      // update element from starting index
      this.calendarDays.splice(customCalStartIndex, this.customCalendarDates.length, ...this.customCalendarDates);
    }
  }

  beforeMonthViewRender({
    body
  }: {
    body: CalendarMonthViewDay[]
  }): void {
    body.forEach(day => {
      if (this.dateIsValid(day.date)) {
        let dateData = this.checkAvailability(day.date);
        if (dateData) {
          if (dateData.status == 'booked') {
            day.cssClass = 'cal-day-booked';
          } else if (dateData.status == 'available' && dateData.available) {
            day.cssClass = 'cal-day-available';
          } else {
            day.cssClass = 'cal-day-unavailable';
          }
        }
      }
    });
  }

  checkAvailability(date: Date) {
    const index = this.calendarDays.findIndex((day) => {
      return (differenceInCalendarDays(day.start, startOfDay(date)) === 0) ? true : false;
    });
    if (index > -1) {
      return this.calendarDays[index];
    }
  }

  dateIsValid(date: Date): boolean {
    return date >= this.todayDate && date <= this.futureDate;
  }

  /* -------------------------------  Upcomming Contracts ----------------------------------------------- */

  getUpcommingContracts() {
    const condition = {
      contractStatus: 'inprogress',
      staffId: this.currentUser._id,
    };
    this.offerService.upcommingContracts({ condition }).pipe(map(data => {
      data.data = data.data.filter(contract => {
        const endofToday = moment().endOf('day');
        if (contract.jobPostId) {
          if (!moment(contract.jobPostId.jobDate).isBefore(endofToday)) {
            return contract.jobPostId;
          }
        }
      });
      return data;
    })).subscribe(data => {
      if (data.status === 200) {
        if (data.data.length) {
          this.upcommingContracts = data.data;
        }
      } else {
        this.toastr.error(
          'There are some server error please check connection.',
          'Error'
        );
      }
    });
  }

  /* --------------------------------------------------------------------------------------------------- */
  /* -------------------------------  Sent Offers ------------------------------------------------------ */

  getOfferList() {
    this.spinner.show();
    const condition = {
      $or: [
        { status: environment.OFFER_STATUS_NEW.OFFER },
        { status: environment.OFFER_STATUS_NEW.DECLINE },
      ],
      staffId: this.currentUser._id,
      sendOfferByPractice: true,
    };

    this.offerService.getAllOffers({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.offerList = data.data;
          }
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  /* --------------------------------------------------------------------------------------------------- */
  /* -------------------------------  Pending Ratings -------------------------------------------------- */

  getContract(contractId) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const condition = {
      _id: contractId,
      status: this.offerStatus.CONTRACT,
      contractStatus: this.contractStatus.COMPLETED,
      //  contractEndTime : {$gte: today}
    };
    this.offerService.getOffer({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data) {
            console.log('end');
          }

        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  getPendingRatings() {
    const condition = {
      userId: this.currentUser._id,
      ratedBy: environment.USER_TYPE.PRACTICE
    };
    // const condition = {
    //   condition1: {
    //     // status: environment.RATING_STATUS.DONE,
    //     staffId: this.currentUser._id
    //   },
    //   condition2: {
    //     // staffId: { $eq : this.currentUser._id },
    //     ratedBy: environment.USER_TYPE.PRACTICE
    //     // $or: [
    //     //   {  }
    //     // ]
    //     // $and: [
    //     //   {
    //     //     $or: [
    //     //       { ratedBy: environment.USER_TYPE.PRACTICE },
    //     //       {
    //     //         $and: [
    //     //           { ratedBy: environment.USER_TYPE.STAFF },
    //     //           { status: environment.RATING_STATUS.PENDING }
    //     //         ]
    //     //       }
    //     //     ]
    //     //   }
    //     // ],
    //   }
    // };
    this.ratingService.upcomingRatings(condition).subscribe(data => {
      if (data.status === 200) {
        if (data.data && data.data.length) {
          this.pendingRatings = data.data;
        }
      } else {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    }, error => {
      this.toastr.error(
        'There are some server Please check connection.',
        'Error'
      );
    })
  }

  /* --------------------------------------------------------------------------------------------------- */
  /* ---------------------------------------- Timesheet -------------------------------------------- */

  getTimesheet() {
    const condition = {
      staffId: this.currentUser._id
    };
    this.workDiaryService.getworkDiaryDetails({ condition }).subscribe(data => {
      if (data.status === 200) {
        if (data.data.length > 0) {
          this.createTimesheetAnalytics(data.data);
          // this.timesheet = data.data;
        }
      } else {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    }, error => {
      this.toastr.error(
        'There are some server Please check connection.',
        'Error'
      );
    });
  }

  createTimesheetAnalytics(timesheet) {
    timesheet.map(work => {
      if (!work.contractId || !work.contractId.jobPostId || work.paidStatus === environment.WORKDIARY_PAID_STATUS.PENDING) {
        return false;
      }
      const distance = (this.sortService.calulateDistance(
        work.staffId.location.lat,
        work.staffId.location.lng,
        work.contractId.jobPostId.locationLatLng.latitude,
        work.contractId.jobPostId.locationLatLng.longitude, 'M'));
      const date = moment(work.date).format('DD-MM-YYYY');
      if (this.isWeekly(work.createdAt)) {
        this.analytics.totalHoursWorked.weekly += +(this.calTotalHours(work.totalTime));
        if (this.analytics.totalDaysWorked.weekly.indexOf(date) === -1) {
          this.analytics.totalDaysWorked.weekly.push(date);
        }
        // this.analytics.totalDaysWorked.weekly += 1;
        this.analytics.totalWages.weekly += +work.totalAmount;
        this.analytics.totalMilesTravelled.weekly += Math.round(+distance);
        this.analytics.averageHourRate.weekly = (this.analytics.totalWages.weekly) ?
          +(this.analytics.totalWages.weekly / this.analytics.totalHoursWorked.weekly).toFixed(1) : 0;

      }
      if (this.isMonthly(work.createdAt)) {
        this.analytics.totalHoursWorked.monthly += +(this.calTotalHours(work.totalTime));
        // this.analytics.totalDaysWorked.monthly += 1;
        if (this.analytics.totalDaysWorked.monthly.indexOf(date) === -1) {
          this.analytics.totalDaysWorked.monthly.push(date);
        }
        this.analytics.totalWages.monthly += +work.totalAmount;
        this.analytics.totalMilesTravelled.monthly += Math.round(+distance);
        this.analytics.averageHourRate.monthly = (this.analytics.totalWages.monthly) ?
          +(this.analytics.totalWages.monthly / this.analytics.totalHoursWorked.monthly).toFixed(1) : 0;

      }
      if (this.isYearly(work.createdAt)) {
        this.analytics.totalHoursWorked.annual += +(this.calTotalHours(work.totalTime));
        // this.analytics.totalDaysWorked.annual += 1;
        if (this.analytics.totalDaysWorked.annual.indexOf(date) === -1) {
          this.analytics.totalDaysWorked.annual.push(date);
        }
        this.analytics.totalWages.annual += (+work.totalAmount) ? +work.totalAmount : 0;
        this.analytics.totalMilesTravelled.annual += Math.round(+distance);
        this.analytics.averageHourRate.annual = (this.analytics.totalWages.annual) ?
          +(this.analytics.totalWages.annual / this.analytics.totalHoursWorked.annual).toFixed(1) : 0;
      }
      if (this.isToday(work.createdAt)) {
        this.timesheet.push(work);
      }
    });

    /* self.sortService.calulateDistance(  self.FilterStaffList['location'].latitude,
        self.FilterStaffList['location'].longitude,
        staff.location.latitude,
        staff.location.longitude
      ); */
  }

  calTotalHours(totalTime) {
    let mintues = 0;
    if (totalTime.minutes) {
      mintues = +((totalTime.minutes / 60).toFixed(1));
    }
    return (totalTime.hours + mintues);
  }

  isWeekly(date) {
    const startDate = moment().startOf('W').format('YYYY-MM-DD');   // Monday
    const endDate = moment().endOf('W').add(1, 'd').format('YYYY-MM-DD'); // Next Monday
    const compareDate = moment(date);
    return compareDate.isBetween(startDate, endDate);
  }

  isMonthly(date) {
    const startDate = moment().startOf('M').format('YYYY-MM-DD');
    const endDate = moment().endOf('M').add(1, 'd').format('YYYY-MM-DD');
    const compareDate = moment(date);
    return compareDate.isBetween(startDate, endDate);
  }

  isYearly(date) {
    const year = moment().format('YYYY');
    const compareYear = moment(date).format('YYYY');
    return (+compareYear === +year);
  }

  isToday(date) {
    const startDate = moment().startOf('d');
    const compareDate = moment(date).startOf('d');
    return moment(startDate).isSame(compareDate);
  }

}
