import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { startOfDay, addMonths, differenceInCalendarDays } from 'date-fns';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { CalendarView, CalendarMonthViewDay } from 'angular-calendar';
import { RatingService } from '../../../../shared-ui/service/rating.service';
import { WorkDiaryService } from '../../../../shared-ui/service/workDiary.service';
import { ToastrService } from 'ngx-toastr';
import { JobsService } from '../jobs/job-posts/jobs.service';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { currentUser } from '../../../../layouts/home-layout/user.model';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { OfferService } from '../../../../shared-ui/service/offer.service';
import { WorkDiary } from '../../../../shared-ui/modal/work-diary.modal';
import { StripeSource } from 'stripe-angular';
import { StripeService } from '../../../../shared-ui/service/stripe.service';
import { PaymentCardService } from '../../../../shared-ui/service/paymentCard.service';
import { Common } from '../../../../shared-ui/service/common.service';
import { Notification } from '../../../../shared-ui/modal/notification.modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { FirebaseService } from '../../../../shared-ui/service/firebase.service';
import { PaymentService } from '../../../../shared-ui/service/payment.service';
import { PaymentDetails } from '../../../../shared-ui/modal/payment.modal';
import { Subject } from 'rxjs';
import { PracticeAnalytics } from '../../../../shared-ui/modal/practice-analytics.modal';

@Component({
  selector: 'app-practice-dashboard',
  templateUrl: './practice-dashboard.component.html',
  styleUrls: ['./practice-dashboard.component.scss']
})
export class PracticeDashboardComponent implements OnInit {
  @ViewChild('timesheetPayModal', { static: false }) timesheetPayModal: ModalDirective;
  @ViewChild('confirmTimesheetModal', { static: false }) confirmTimesheetModal: ModalDirective;
  @ViewChild('stripeSource1', { static: false }) stripeSource1: StripeSource;
  @ViewChild('availabilityModal', { static: false })
  public availabilityModal: ModalDirective;
  jobLabel: any = environment.JOB_LABEL;
  contractStatus: any = environment.CONTRACT_STATUS;
  offerStatus = environment.OFFER_STATUS_NEW;
  order = 'createdAt';
  reverse = false;
  itemsPerPage = 3;
  contractsPerPage = 3;
  jobsPerPage = 3;
  offersPerPage = 3;
  timesheetPerPage = 3;
  pendingRatingsPerPage = 3;
  p: any;
  q: any = 0;
  r: any;
  s: any;
  t: any;
  selectedWork: any = new WorkDiary();
  selectedWorkIndex: any = -1;
  workDiaryPaymentType = environment.WORKDIARY_PAYMENT_TYPE;
  contractListStatusColor: any = environment.CONTRACT_LIST_STATUS_COLOR;
  previousTimesheetDetails: any;
  notification: any = new Notification();
  timeSheetPayment: Boolean = false;
  paymentDetails: any = new PaymentDetails();
  jobCalendarStatus = {
    OPEN: 'open',
    UPCOMING: 'upcoming'
  };
  viewDate: Date = new Date();
  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Month;
  // todayDate: Date = startOfDay(new Date()); // Current Date
  // futureDate: Date = startOfDay(addMonths(new Date(), 1)); // 1 month future date
  //showCalendarDate = (differenceInCalendarDays(this.futureDate, this.todayDate) + 1); //show custom calendar dates;
  //customCalendarDates: any = [];
  refresh: Subject<any> = new Subject();
  currentUser: currentUser = new currentUser();
  upcommingContracts = [];
  myPostedjobs = [];
  sentOffers = [];
  timesheet = [];
  pendingRatings = [];
  calendarDays = [];
  contractListStatus: any = environment.CONTRACT_LIST_STATUS;
  analytics = new PracticeAnalytics();
  workDiaryPaidStatus = environment.WORKDIARY_PAID_STATUS;
  profileStatus = environment.PROFILE_STATUS;
  paymentCardExists: boolean = false

  constructor(
    private globalService: GlobalService,
    private ratingService: RatingService,
    private workDiaryService: WorkDiaryService,
    private jobsService: JobsService,
    private jwtService: JwtService,
    private toastr: ToastrService,
    private offerService: OfferService,
    private stripeService: StripeService,
    private common: Common,
    private spinner: NgxSpinnerService,
    private firebaseService: FirebaseService,
    private paymentService: PaymentService,
    private PaymentCardService: PaymentCardService,
    private router: Router,
  ) {
    this.globalService.topscroll();
  }

  ngOnInit() {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    // this.getUpcommingContracts();
    this.getPostedJobs();
    this.getSentOffers();
    this.getTimesheet();
    this.getPendingRatings();
    this.getJobsForAnalytics();
    let customer = JSON.parse(localStorage.getItem('currentUser'));
    this.getPaymentCardDetail(customer.email);
  }

  getPaymentCardDetail(email) {
    this.PaymentCardService.getPaymentCardDetail({ email }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.paymentCardExists = true
          }
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  navigateTosavePaymentCard() {
    this.router.navigate(['practice/profile/2']);
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  /* checkAvailability() {
    this.availabilityModal.show();
  } */
  closeModel() {
    this.availabilityModal.hide();
  }



  // setView(view: CalendarView) {
  //   this.view = view;
  // }



  // selectCustomcalendarDates() {

  // }

  beforeMonthViewRender({
    body
  }: {
    body: CalendarMonthViewDay[]
  }): void {
    body.forEach(day => {
      // console.log(day);
      // console.log('-------------------------------------------')
      // if (this.dateIsValid(day.date)) {
      let dateData = this.checkAvailability(day.date);
      // console.log(dateData);
      if (dateData) {
        day.cssClass = dateData['cssClass'];
        day.events.push(dateData);
      }
      // }
    });
  }

  checkAvailability(date: Date) {
    const index = this.calendarDays.findIndex((day) => {
      // console.log(startOfDay(date),moment(startOfDay(date)).isSame(startOfDay(day.start)));
      //  return moment(startOfDay(date)).isSame(startOfDay(day.start));
      return (differenceInCalendarDays(day.start, startOfDay(date)) === 0) ? true : false;
    });
    if (index > -1) {
      return this.calendarDays[index];
    }
  }

  // dateIsValid(date: Date): boolean {
  //   return date >= this.todayDate && date <= this.futureDate;
  // }

  /* -------------------------------  Upcomming Contracts ----------------------------------------------- */
  // getUpcommingContracts() {
  //   const condition = {
  //     contractStatus :  'inprogress',
  //     practiceId  : this.currentUser._id,
  //   };
  //   this.offerService.upcommingContracts({condition}).pipe(map(data => {
  //     data.data = data.data.filter(contract => {
  //       return contract.jobPostId;
  //     });
  //     return data;
  //   })).subscribe( data => {
  //     if (data.status === 200) {
  //       if (data.data.length) {
  //         this.upcommingContracts = data.data;
  //       }
  //     } else {
  //       this.toastr.error(
  //         'There are some server error please check connection.',
  //         'Error'
  //       );
  //     }
  //   });
  // }
  /* --------------------------------------------------------------------------------------------------- */

  /* ------------------------------- My Posted Jobs ---------------------------------------------------- */
  getPostedJobs() {
    // const now = new Date();
    // const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const condition = {
      draft: false,
      // createdAt : {$gte: today},
      createdBy: this.currentUser._id,
      $or: [
        { status: environment.JOB_STATUS.OPEN },
        { status: environment.JOB_STATUS.CLOSED },
        { status: environment.JOB_STATUS.CONTRACT }
      ]
    };
    this.jobsService.getJobsWithContractDetails({ condition }).subscribe(data => {
      if (data.status === 200) {
        this.myPostedjobs = data.data;
        this.setOrder('createdAt');
        this.updateJobPostList();
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

  getJobsForAnalytics() {
    // const now = new Date();
    // const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const condition = {
      draft: false,
      // createdAt : {$gte: today},
      createdBy: this.currentUser._id,
      status: {
        '$in': [
          environment.JOB_STATUS.COMPLETED,
          environment.JOB_STATUS.CONTRACT,
        ]
      }
    };
    this.jobsService.getJobsWithContractDetails({ condition }).subscribe(data => {
      if (data.status === 200) {
        if (data.data.length) {
          this.createJobsAnalytics(data.data);
        }
        console.log(data.data);
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

  updateJobPostList() {
    let isReturn = false;
    this.myPostedjobs.forEach((job, index) => {
      // if(job.status === environment.JOB_STATUS.OPEN || job.status === environment.JOB_STATUS.CLOSED ||
      // job.status === environment.JOB_STATUS.CONTRACT) {
      var calendarDay;
      if (job.status === environment.JOB_STATUS.OPEN || job.status === environment.JOB_STATUS.CONTRACT) {
        calendarDay = {
          // '_id' : '',
          // 'startTime' : '',
          // 'endTime' : '',
          'start': job.jobDate,
          'title': job.jobTitle.toUpperCase(),
          //   'available' : true,
          // 'day' : 1,
          'status': this.jobCalendarStatus.OPEN,
          'cssClass': 'cal-day-booked'
        };
        // console.log(calendarDay);
      }
      if (job.status === environment.JOB_STATUS.CONTRACT && job.contractId) {
        switch (job.contractId.contractStatus) {
          case this.contractStatus.UPCOMING:
            this.myPostedjobs[index].contractId['contractListStatus'] = this.contractListStatus.PAYTOACTIVATE;
            if (calendarDay) {
              calendarDay['cssClass'] = '';
            }
            break;

          case this.contractStatus.INPROGRESS:
            // const startofToday = moment().startOf('day');
            const dateTime = this.globalService.mergejobDatestartTime(job.jobDate.jobDate,
              job.jobDate.startTime);
            if (moment().isAfter(dateTime)) {
              this.myPostedjobs[index].contractId['contractListStatus'] = this.contractListStatus.INPROGRESS;
              if (calendarDay) {
                calendarDay['cssClass'] = '';
              }
            } else {
              this.myPostedjobs[index].contractId['contractListStatus'] = this.contractListStatus.UPCOMING;
              this.upcommingContracts.push(job);
              if (calendarDay) {
                calendarDay['cssClass'] = 'cal-day-available';
              }
            }
            /* const endofToday = moment().endOf('day');
            if (moment(job.jobDate).isBefore(endofToday)) {
              this.myPostedjobs[index].contractId['contractListStatus'] = this.contractListStatus.INPROGRESS;
              if (calendarDay) {
                calendarDay['cssClass'] = '';
              }
            } else {
              this.myPostedjobs[index].contractId['contractListStatus'] = this.contractListStatus.UPCOMING;
              this.upcommingContracts.push(job);
              if (calendarDay) {
                calendarDay['cssClass'] = 'cal-day-available';
              }
            } */
            // console.log(this.myPostedjobs[index].contractId['contractListStatus'])
            break;

          case this.contractStatus.COMPLETED:
            this.myPostedjobs[index].contractId['contractListStatus'] = this.contractStatus.COMPLETED;
            if (calendarDay) {
              calendarDay['cssClass'] = '';
            }
            // this.myPostedjobs[index].contractId['contractListStatus'] = this.contractListStatus.FILLED;
            break;

          case this.contractStatus.CANCELLED:
            this.myPostedjobs[index].contractId['contractListStatus'] = this.contractListStatus.CANCELLED;
            if (calendarDay) {
              calendarDay['cssClass'] = '';
            }
            break;
        }
      }
      if (calendarDay) {
        this.calendarDays.push(calendarDay);
      }
      if (index === (this.myPostedjobs.length - 1)) {
        isReturn = true;
      }
      //  console.log(this.calendarDays);
    });
    if (isReturn) {
      // this.calendarDays = JSON.parse(JSON.stringify(this.calendarDays));
      this.refresh.next();
    }
  }
  /* --------------------------------------------------------------------------------------------------- */

  /* -------------------------------  Sent Offers ------------------------------------------------------ */
  getSentOffers() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const condition = {
      $or: [
        { status: environment.OFFER_STATUS_NEW.OFFER },
        { status: environment.OFFER_STATUS_NEW.DECLINE },
      ],
      practiceId: this.currentUser._id,
      sendOfferByPractice: true,
      createdAt: { $gte: today },
    };
    this.offerService.getAllOffers({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          this.sentOffers = data.data;
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
      ratedBy: environment.USER_TYPE.STAFF
    };
    /* const condition = {
      condition1: {
        // status: environment.RATING_STATUS.DONE,
        practiceId: this.currentUser._id
      },
      condition2: {
        // practiceId:  this.currentUser._id,
        ratedBy: environment.USER_TYPE.STAFF
        // $or: [
        //   { ratedBy: environment.USER_TYPE.STAFF }
        // ]
        // $and: [
        //   {
        //     $or: [
        //       { ratedBy: environment.USER_TYPE.STAFF },
        //       {
        //         $and: [
        //           { ratedBy: environment.USER_TYPE.PRACTICE },
        //           { status: environment.RATING_STATUS.PENDING }
        //         ]
        //       }
        //     ]
        //   }
        // ],
      }
    }; */
    this.ratingService.upcomingRatings(condition).subscribe(data => {
      if (data.status === 200) {
        if (data.data.length) {
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
    });
  }
  /* --------------------------------------------------------------------------------------------------- */

  /* ---------------------------------------- Timesheet -------------------------------------------- */
  getTimesheet() {
    // const now = new Date();
    // const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const condition = {
      // createdAt : {$gte: today},
      practiceId: this.currentUser._id
    };
    // const populate = environment.USER_TYPE.STAFF;
    this.workDiaryService.getworkDiaryDetails({ condition }).subscribe(data => {
      if (data.status === 200) {
        if (data.data.length > 0) {
          const array = data.data.filter(item => item.timeClockStatus === 'Submitted, pending Approval');
          this.createTimesheetAnalytics(array);
          // this.timesheet = data.data;
          // console.log(this.timesheet);
          // console.log(this.timesheet);
          // console.log(this.isWeekly('2020-06-07T18:30:00.000Z'));
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
      if (work.contractId && work.contractId.jobPostId && work.paidStatus === environment.WORKDIARY_PAID_STATUS.PAID) {
        const date = moment(work.date).format('DD-MM-YYYY');
        if (this.isWeekly(work.createdAt)) {
          // const startOfWeek
          this.analytics.totalHoursHired.weekly += +(this.calTotalHours(work.totalTime));
          if (this.analytics.totalDaysHired.weekly.indexOf(date) === -1) {
            this.analytics.totalDaysHired.weekly.push(date);
          }
          // this.analytics.totalDaysHired.weekly += 1;
          this.analytics.totalWagesPaid.weekly += +work.totalAmount;
        }
        if (this.isMonthly(work.createdAt)) {
          this.analytics.totalHoursHired.monthly += +(this.calTotalHours(work.totalTime));
          // this.analytics.totalDaysHired.monthly += 1;
          if (this.analytics.totalDaysHired.monthly.indexOf(date) === -1) {
            this.analytics.totalDaysHired.monthly.push(date);
          }
          this.analytics.totalWagesPaid.monthly += +work.totalAmount;
        }
        if (this.isYearly(work.createdAt)) {
          this.analytics.totalHoursHired.annual += +(this.calTotalHours(work.totalTime));
          // this.analytics.totalDaysHired.annual += 1;
          if (this.analytics.totalDaysHired.annual.indexOf(date) === -1) {
            this.analytics.totalDaysHired.annual.push(date);
          }
          this.analytics.totalWagesPaid.annual += (+work.totalAmount) ? +work.totalAmount : 0;
        }
      }

      if (work.contractId && work.contractId.jobPostId && this.isToday(work.createdAt)) {
        this.timesheet.push(work);
      }
    });
  }

  createJobsAnalytics(jobList) {
    jobList.map(job => {
      if (job.contractId && this.isWeekly(job.contractId.createdAt)) {
        this.analytics.totalStaffHired.weekly += 1;
      }
      if (job.contractId && this.isMonthly(job.contractId.createdAt)) {
        this.analytics.totalStaffHired.monthly += 1;
      }
      if (job.contractId && this.isYearly(job.contractId.createdAt)) {
        this.analytics.totalStaffHired.annual += 1;
      }
    });
    console.log(this.analytics, 'All Analytics');
  }

  calTotalHours(totalTime) {
    let mintues = 0;
    if (totalTime.minutes) {
      mintues = +((totalTime.minutes / 60).toFixed(1));
    }
    return (totalTime.hours + mintues)
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


  timesheetAmountCal(time, amount) {
    const minCal = (time.hours > 0) ? (time.hours * amount) : 0;
    const hourCal = (time.minutes > 0) ? ((amount * time.minutes) / 60) : 0;
    return Number((minCal + hourCal).toFixed(2));
  }

  showModal(work?: any, selectedWorkIndex?: Number) {
    this.selectedWork = JSON.parse(JSON.stringify(work));
    console.log(this.selectedWork, '-----------------------------')
    this.selectedWorkIndex = selectedWorkIndex;
    //----- Added Condition for edit mode
    if (this.selectedWork.paymentDetails.paymentType !== this.workDiaryPaymentType.ONLINE) {
      this.previousTimesheetDetails = JSON.parse(JSON.stringify(this.selectedWork.paymentDetails));
      this.timesheetPayModal.show();
    } else {
      this.toastr.success(
        'Already Payment had done',
        'Succcess');
    }
  }

  setStripeSource(source: StripeSource) {
    this.spinner.show();
    const postObject = {
      source: source['id'],
    }; //.
    // For workDiary payment
    const workdiaryAmount = this.timesheetAmountCal(this.selectedWork.totalTime, this.selectedWork.contractId.finalRate)
    let amount = this.globalService.stripeTotalAmt(workdiaryAmount);
    // For workDiary payment Add stripe Id of staff
    if (this.selectedWork.staffId.stripeId) {
      postObject['destination'] = this.selectedWork.staffId.stripeId;
    } else {
      this.toastr.success('Please Check Connection.', 'Success');
    }
    postObject['amount'] = amount;
    this.stripeService.createCharge(postObject).subscribe(
      async data => {
        if (data['status'] === 200) {
          this.paymentDetails.payerUserId = this.currentUser._id;
          this.paymentDetails.receiverUserId = this.selectedWork.staffId._id;
          // this.paymentDetails.payerUserId = this.selectedWork.contractId.practiceId._id;
          this.paymentDetails.transactionId = data['data']['balance_transaction'];
          this.paymentDetails.amount = (data['data']['amount']) / 100;
          this.paymentDetails.mode = data['data']['source.type '];
          this.paymentDetails.status = data['data']['status'];
          this.paymentDetails.destination = data['data']['transfer_data']['destination'];
          this.paymentDetails.receiptURL = data['data']['receipt_url'];
          if (this.timeSheetPayment) {
            this.paymentDetails.actionStatus = environment.PAYMENT_STATUS_TYPE.WORKDIARY;
          } else {
            this.paymentDetails.actionStatus = environment.PAYMENT_STATUS_TYPE.CONTRACT;
          }
          await this.addPaymentDetails();
          this.toastr.success('Payment has been made.', 'Success');
        }
        this.spinner.hide();
      }
    );
  }

  addPaymentDetails() {
    this.paymentService.savePaymentDetails(this.paymentDetails).subscribe(data => {
      if (data.status === 200) {
        this.selectedWork.paymentDetails['paymentId'] = data.data._id;
        this.submitWorkDiary();
      } else {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(
        'There are some server Please check connection.',
        'Error'
      );
    });
  }

  submitTimesheetPayment() {
    if (this.selectedWork.paymentDetails.paymentType === this.workDiaryPaymentType.OFFLINE) {
      this.submitWorkDiary();
    } else {
      this.timeSheetPayment = true;
      this.stripeSource1.createSource();
    }
  }

  submitWorkDiary() {
    if (this.selectedWork.paymentDetails.paymentType === this.workDiaryPaymentType.ONLINE) {
      this.selectedWork.paymentDetails.paymentDesc = '';
    }
    const ischanged = JSON.stringify(this.previousTimesheetDetails) !== JSON.stringify(this.selectedWork.paymentDetails);
    if (!ischanged) {
      this.timesheetPayModal.hide();
      return false;
    }
    this.selectedWork.paidStatus = environment.WORKDIARY_PAID_STATUS.PAID;
    this.selectedWork.paidDate = new Date();
    this.workDiaryService.addWork(this.selectedWork).subscribe(data => {
      this.timeSheetPayment = false;
      if (data.status === 200) {
        this.spinner.hide();
        this.timesheetPayModal.hide();
        if (this.selectedWorkIndex > -1) {
          this.timesheet[this.selectedWorkIndex] = this.selectedWork;
        };
        this.sendNotification('workDiaryPayment');
        // Add WorkDiary Hours
        let totalHours = 0;
        totalHours = this.selectedWork.totalTime.hours + (Number((this.selectedWork.totalTime.minutes / 60).toFixed(1)));
        const newDetails = (new WorkDiary()).paymentDetails;
        delete newDetails['paymentId'];
        // const isFirstTimeDetails = (JSON.stringify(newDetails) ===
        //                   JSON.stringify(this.previousTimesheetDetails)
        //               );
        // console.log(this.selectedWork);
        // return false
        // if (ischanged && isFirstTimeDetails ) {
        //   this.common.incDecUsersCount(this.selectedWork.staffId._id, 'hours', true, totalHours);
        //   this.common.incDecUsersCount(this.currentUser, 'hours', true, totalHours);
        // }

        this.toastr.success(
          'Timesheet has been updated.',
          'Success'
        );
      } else {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(
        'There are some server Please check connection.',
        'Error'
      );
    });
  }


  sendNotification(type = '') {
    if (!type) {
      return false;
    }
    const checkType = ['rating'];
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    let title = (this.selectedWork.contractId.jobPostId.jobTitle) ? this.selectedWork.contractId.jobPostId.jobTitle.toString() : '';
    title = this.globalService.titleCase(title);
    const jobId = this.selectedWork.contractId.jobPostId._id;
    const message = '';
    const currentTime = new Date().getTime();
    const notification = environment.notification;
    const id = (checkType.indexOf(type) > -1) ? this.selectedWork.staffId._id : this.selectedWork.contractId._id;
    this.notification = {
      senderId: this.currentUser._id,
      receiverId: this.selectedWork.staffId._id,
      message: notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
      redirectLink: notification[type].staffLink + id,
      type: notification[type].type,
      offerId: id,
      jobId: jobId,
      staff: { sentOffer: 0, receivedOffer: 0, contract: 1 },
      practice: { sentOffer: 0, receivedOffer: 0, contract: 0 },
      createdAt: currentTime,
      updatedAt: currentTime,
      status: environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
  }
  /* ------------------------------------------------------------------------------------------------- */

  // getAlloffers() {
   
  //     const condition = { 
  //       practiceId :practice.practiceId._id,
  //       contractStatus: { $exists: true, $ne: 'revoke' },
  //     };
  //     this.offerService.getAllOffers({ condition}).subscribe( data => {
  //       if (data && data.status === 200) {
  //          practice.hiredCounts = data.data.length;
  //       } else {
  //         this.toastr.error(
  //           'There are some server Please check connection.',
  //           'Error'
  //         );
  //       }
  //     })
    
  // }

}
