import { Component, OnInit, ViewChild,Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { differenceInHours } from 'date-fns';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StripeSource } from 'stripe-angular';
import * as moment from 'moment';

import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { DisputeService } from '../../../../../shared-ui/service/disputes.service';
import { WorkDiaryService } from '../../../../../shared-ui/service/workDiary.service';
import { PaymentService } from '../../../../../shared-ui/service/payment.service';
import { StripeService } from '../../../../../shared-ui/service/stripe.service';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';
import { RatingService } from '../../../../../shared-ui/service/rating.service';
import { UsersService } from '../../../../../shared-ui/service/users.service';
import { EventEmitterService } from '../../../../../shared-ui/service/event-emitter.service';
import { OfferService } from '../../../../../shared-ui/service/offer.service';
import { PositionTypeService } from '../../../../../shared-ui/service/positionType.service';
import { JobsService } from '../../jobs/job-posts/jobs.service';
import { TimesheetService } from '../../../../../shared-ui/service/timesheet.service';
import { environment } from '../../../../../../environments/environment';
import { Dispute } from '../../../../../shared-ui/modal/dispute.modal';
import { WorkDiary } from '../../../../../shared-ui/modal/work-diary.modal';
import { PaymentDetails } from '../../../../../shared-ui/modal/payment.modal';
import { Notification } from '../../../../../shared-ui/modal/notification.modal';
import { Rating } from '../../../../../shared-ui/modal/rating.modal';
import { Offer } from '../../../../../shared-ui/modal/offer.modal';
import { JobNewPost } from '../../../../../shared-ui/modal/job.modal';
import { currentUser } from '../../../../../layouts/home-layout/user.model';
import { AddEditPostComponent } from '../../../../../shared-ui/add-edit-post/add-edit-post.component';

@Component({
  selector: 'app-contract-details',
  templateUrl: './contract-details.component.html',
  styleUrls: ['./contract-details.component.scss']
})

export class ContractDetailsComponent implements OnInit {
  @ViewChild('disputeModal', { static: false }) disputeModal: ModalDirective;
  @ViewChild('timesheetPayModal', { static: false }) timesheetPayModal: ModalDirective;
  @ViewChild('viewTimesheet', { static: false }) viewTimesheet: ModalDirective;
  @ViewChild('endContractModal', { static: false }) endContractModal: ModalDirective;
  @ViewChild('cancelContractModal', { static: false }) cancelContractModal: ModalDirective;
  @ViewChild('confirmTimesheetModal', { static: false }) confirmTimesheetModal: ModalDirective;
  @ViewChild('stripeModal', { static: false }) stripeModal: ModalDirective;
  @ViewChild('stripeSource', { static: false }) stripeSource: StripeSource;
  @ViewChild('stripeSource1', { static: false }) stripeSource1: StripeSource;
  @ViewChild('viewBreakDetail', { static: false }) public viewBreakDetail: ModalDirective;

  contractStatus: any = environment.CONTRACT_STATUS;
  contractDetail: any = new Offer();
  disputeDetail: any = new Dispute();
  ratingDetail: any = new Rating();
  paymentMethod: any = environment.PAYEMENT_METHOD;
  jobTypeLabel = environment.JOB_LABEL;
  offerStatus = environment.OFFER_STATUS_NEW;
  jobType = environment.JOB_TYPE;
  /*  editorConfig: any = {
     editable: true,
     spellcheck: true,
     height: '290px',
     translate: 'yes',
     enableToolbar: false,
     showToolbar: false,
     toolbar: [
       [
         'bold',
         'italic',
         'underline',
         'orderedList',
         'unorderedList'
       ],
     ]
   }; */
  ckeConfig: any = {
    //allowedContent: false,
    forcePasteAsPlainText: true,
    height: 200,
    toolbarGroups: [
      { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
      { name: 'paragraph', groups: ['list'] },
    ],
    removeButtons: 'Source,Save,NewPage,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Undo,Redo,Find,Replace,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Strike,Subscript,Superscript,CopyFormatting,RemoveFormat,Outdent,Indent,CreateDiv,Blockquote,BidiLtr,BidiRtl,Language,Unlink,Anchor,Image,Flash,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,Maximize,ShowBlocks,About',
  };
  timesheet: any = [];
  workDiaryPaymentType = environment.WORKDIARY_PAYMENT_TYPE;
  comissionAmount: any = 0;
  isRated: any = {
    practice: false,
    staff: false,
  };
  ratedList: Rating[] = [];
  selectedWork: any = new WorkDiary();
  selectedWorkIndex: any = -1;
  timeSheetPayment: Boolean = false;
  paymentDetails: any = new PaymentDetails();
  commissions: any = [];
  currentUser: currentUser = new currentUser;
  notification: any = new Notification();
  previousTimesheetDetails: any;
  cancelContractDetail: any = { reason: '', cancelTime: '', cancelBy: '' };
  closeResult: String;
  jobList: any = [];
  declineStaffList: any = [];
  ratedDetails = {
    practice: new Rating(),
    staff: new Rating()
  };
  isContractRevoke = false;
  workDiaryPaidStatus = environment.WORKDIARY_PAID_STATUS;
  adminId: any;
  totalBreakTime: any = {};
  breakTimeTillnow: any;
  clockInTimesheet: any;
  breakTime: any;
  timesheet1 = [];
  timesheetWorkDiary = [];
  durations: any = [];

  constructor(
    private globalService: GlobalService,
    private spinner: NgxSpinnerService,
    private offerService: OfferService,
    private disputeService: DisputeService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private workDiaryService: WorkDiaryService,
    private paymentService: PaymentService,
    private positionTypeService: PositionTypeService,
    private stripeService: StripeService,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
    private ratingService: RatingService,
    private usersService: UsersService,
    private jobsService: JobsService,
    private timesheetService: TimesheetService,
    private eventEmitterService: EventEmitterService
  ) { }
  @Input() data : any;
  ngOnInit() {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    this.route.params.subscribe((res) => {
      this.getContract(res.contractId);
      this.getAdminInfo();
    });
    console.log(this.data);
    // this.showModal(this.data.t,this.data.w,this.data.i);
  }

  getAdminInfo() {
    this.usersService.getAdminInfo({}).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data) {
            this.adminId = data.data._id;
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
      }
    );
  }

  getContract(contractId) {
    this.spinner.show();
    const condition = {
      _id: contractId,
      status: this.offerStatus.CONTRACT
    };
    this.offerService.getOffer({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data) {
            this.contractDetail = data.data;
            this.checkAndUpdateNotification();
            this.contractDetail['duration'] = this.getContractDuration();
            this.getCommissionAmount();
            this.getTimesheet();
            this.getRating();
            // this.declinedContractList();
          } else {
            this.router.navigate(['practice/contracts']);
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

  checkAndUpdateNotification() {
    const senderId = this.contractDetail.staffId._id;
    const receiverId = this.contractDetail.practiceId._id;
    const offerId = this.contractDetail._id;
    const status = environment.notificationStatus.UNREAD;
    this.firebaseService.getAndUpdateNotification(senderId, receiverId, offerId, status);
  }

  getCommissionAmount() {
    const condition = {
      name: { '$eq': this.contractDetail.jobPostId.positionType }
    };
    this.positionTypeService.getPositionType({ condition }).subscribe(data => {
      if (data.status === 200) {
        if (data.data.length > 0) {
          this.commissions = data.data;
          this.comissionAmount = data.data[0]['amount'];
        } else {
          console.log("Didnt Get Comission Amount");
        }
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

  getTimesheet() {
    const condition = {
      contractId: this.contractDetail._id,
    };
    this.workDiaryService.getworkDiary({ condition }).subscribe(data => {
      if (data.status === 200) {
        if (data.data.length > 0) {
          this.timesheet = data.data.filter(item => item.timeClockStatus === 'Submitted, pending Approval');

          this.workDiaryService.getworkDiaryDetails({ practiceId: this.currentUser._id }).subscribe(data => {
            if (data.status === 200) {
              if (data.data.length > 0) {
                const array = data.data.filter(arr => {
                  const t1 = new Date(arr.date);
                  const d1 = t1.getFullYear() + '-' + (t1.getMonth() + 1) + '-' + t1.getDate();
                  const t2 = new Date(moment(new Date()).toISOString())
                  const d2 = t2.getFullYear() + '-' + (t2.getMonth() + 1) + '-' + t2.getDate();
                  return Date.parse(d1) === Date.parse(d2);
                });
                this.timesheetWorkDiary = array.filter(arr => arr.jobPostId === this.contractDetail.jobPostId._id) || [];
                let clockOuts = [], clockIns = [];
                this.timesheetWorkDiary.map(sheet => {
                  if (sheet.timeClockStatus === 'In progress - On break') {
                    clockOuts.push(sheet.clockOutTime.split(' ')[0]);
                  }
                  if (sheet.timeClockStatus === 'In progress - Clocked In') {
                    clockIns.push(sheet.clockInTime.split(' ')[0]);
                  }
                });
                clockIns.reverse();
                clockOuts.reverse();
                for (let i = 0; i < this.timesheetWorkDiary.length; i++) {
                  if (clockOuts[i] !== undefined && clockIns[i + 1] !== undefined) {
                    const diff = clockOuts[i].split(':').map((item, index) => Math.abs(clockIns[i + 1].split(':')[index] - item)).join(':');
                    var temp = diff.split(':');
                    const seconds = (+temp[0]) * 60 * 60 + (+temp[1]) * 60 + (+temp[2]);
                    const hour = Math.floor(seconds / 3600);
                    const minute = Math.floor(seconds / 60);
                    this.durations.push({ clockIn: clockIns[i + 1], clockOut: clockOuts[i], duration: { hour, minute } });
                  }
                }
              }
            } else {
              this.toastr.error('There are some server Please check connection.', 'Error');
            }
          }, error => {
            this.toastr.error(
              'There are some server Please check connection.', 'Error');
          });

        }
      } else {
        this.toastr.error('There are some server Please check connection.', 'Error');
      }
    }, error => {
      this.toastr.error(
        'There are some server Please check connection.', 'Error');
    });
  }

  getContractDuration() {
    const diffTime = differenceInHours(this.contractDetail.jobPostId.endTime, this.contractDetail.jobPostId.startTime);
    if (this.jobType.TEMPORARY !== this.contractDetail.jobPostId.jobType) {
      const selectedDays = this.contractDetail.jobPostId.availableDays.filter((day) => {
        return day.available;
      });
      return diffTime * selectedDays.length;
    } else {
      return diffTime;
    }
  }

  showModal(type: string, work?: any, selectedWorkIndex?: Number) {
    console.log("opne");
    console.log(type);
    console.log(work);
    console.log(selectedWorkIndex);
    if (type === 'dispute') {
      this.disputeModal.show();
    } else if (type === 'timesheet') {
      this.selectedWork = JSON.parse(JSON.stringify(work));
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
    } else if (type === 'viewTimesheet') {
      this.selectedWork = JSON.parse(JSON.stringify(work));
      this.viewTimesheet.show();
    }
  }

  updateOfferStatus(message: string, type?: String) {
    this.offerService.addOffer(this.contractDetail).subscribe(
      data => {
        this.spinner.hide();
        this.stripeModal.hide();
        if (data.status === 200) {
          if (type === 'activateContract') {
            this.sendNotification('activateContract');
          } else if (type === 'cancelContract') {
            this.sendNotification('cancelContract');
          } else if (type === 'endContract') {
            this.sendNotification('endContract');
          }
          this.toastr.success(
            message,
            'Success'
          );
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      });
  }

  addDisputes() {
    this.spinner.show();
    this.disputeDetail.contractId = this.contractDetail._id;
    this.disputeDetail.disputeUserId = this.contractDetail.practiceId._id;
    this.disputeDetail.status = environment.DISPUTE_STATUS.NEW;
    this.disputeService.addDispute(this.disputeDetail).subscribe(data => {
      this.disputeDetail = new Dispute();
      this.sendNotificationToAdmin('adminDisputes');
      this.disputeModal.hide();
      this.spinner.hide();
      this.toastr.success(
        'Disputed has been submtted to Administrator for reveiw.',
        'Success'
      );
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

  closeModal() {
    this.cancelContractModal.hide();
    this.endContractModal.hide();
    this.disputeModal.hide();
    this.timesheetPayModal.hide();
    this.timeSheetPayment = false;
  }

  onStripeInvalid(error: Error) {
    console.log('Validation Error', error);
  }

  setStripeSource(source: StripeSource) {
    this.spinner.show();
    const postObject = {
      source: source['id'],
    };
    // For workDiary payment
    const workdiaryAmount = this.selectedWork.totalAmount;
    let amount = this.globalService.stripeTotalAmt(workdiaryAmount);

    if (!this.timeSheetPayment) {
      // Activate Contract Amount
      amount = this.globalService.stripeTotalAmt(this.comissionAmount);
    } else {
      // For workDiary payment Add stripe Id of staff
      if (this.contractDetail.staffId.stripeId) {
        postObject['destination'] = this.contractDetail.staffId.stripeId;
      } else {
        this.toastr.success('Please Check Connection.', 'Success');
      }
    }
    postObject['amount'] = amount;
    this.stripeService.createCharge(postObject).subscribe(
      async data => {
        if (data['status'] === 200) {
          this.paymentDetails.payerUserId = this.contractDetail.practiceId._id;
          this.paymentDetails.transactionId = data['data']['balance_transaction'];
          this.paymentDetails.amount = (data['data']['amount']) / 100;
          this.paymentDetails.mode = data['data']['source.type '];
          this.paymentDetails.status = data['data']['status'];
          this.paymentDetails.destination = data['data']['transfer_data']['destination'];
          this.paymentDetails.receiptURL = data['data']['receipt_url'];
          this.paymentDetails.jobPostId = this.contractDetail.jobPostId._id;
          if (this.timeSheetPayment) {
            this.stripeModal.hide()
            this.paymentDetails.actionStatus = environment.PAYMENT_STATUS_TYPE.WORKDIARY;
            this.paymentDetails.receiverUserId = this.contractDetail.staffId._id;
          } else {
            this.paymentDetails.actionStatus = environment.PAYMENT_STATUS_TYPE.CONTRACT;
            if (this.adminId) {
              this.paymentDetails.receiverUserId = this.adminId;
            }
          }
          await this.addPaymentDetails();
          this.toastr.success('Payment has been made.', 'Success');
        }
        this.spinner.hide();
      }
    );
  }

  onStripeError(error: Error) {
    console.error('Stripe error', error);
  }

  addPaymentDetails() {
    this.paymentService.savePaymentDetails(this.paymentDetails).subscribe(async data => {
      if (data.status === 200) {
        if (this.timeSheetPayment) {
          this.selectedWork.paymentDetails['paymentId'] = data.data._id;
          this.submitWorkDiary();
        } else {
          this.contractDetail['paymentId'] = data.data._id;
          this.contractDetail.contractStatus = this.contractStatus.INPROGRESS;

          // this.declineOtherOffers();
          /* -----------Update Contract Id in job Details */
          this.contractDetail.jobPostId['contractId'] = this.contractDetail._id;
          this.contractDetail.jobPostId['status'] = environment.JOB_STATUS.CONTRACT;
          const jobData = {
            _id: this.contractDetail.jobPostId._id,
            contractId: this.contractDetail._id,
            // ---- Added On 30 after contract created contract status filled
            status: environment.JOB_STATUS.CONTRACT
          };
          await this.updateJobDetails(jobData);
          // ------------------- Create Connection For Message App-----------
          // this.checkPreviousRecipents();
          await this.sendNotificationToAdmin('adminPayment');
          await this.updateCalendar(environment.CALENDAR_STATUS.BOOKED);
          await this.declinedOfferList();
        }
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

  updateCalendar(status) {
    let whereObj = {
      jobDate: this.contractDetail.jobPostId.jobDate,
      staffId: this.contractDetail.staffId._id,
      status: status
    }
    this.usersService.updateCalendar(whereObj).subscribe(
      data => {
        if (data.status === 200) { } else {
          this.toastr.error(
            'There are some server error please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server error please check connection.',
          'Error'
        );
      }
    );
  }

  declinedOfferList() {
    // this.spinner.show();
    const condition = {
      _id: { $ne: this.contractDetail._id },
      jobPostId: this.contractDetail.jobPostId._id,
      $or: [
        { status: this.offerStatus.OFFER },
        { status: this.offerStatus.CONTRACT }
      ],
    };
    this.offerService.getAllOffers({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.declineStaffList = data.data;
          }
          this.declineOtherOffers();
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

  declineOtherOffers() {
    const offerDecline = {
      reason: 'Job is no longer available',
      declineTime: moment().toISOString(),
      declineBy: environment.USER_TYPE.PRACTICE,
    };
    const updateDetails = {
      status: this.offerStatus.DECLINE,
      offerDecline: offerDecline
    };
    const condition = {
      _id: { $ne: this.contractDetail._id },
      $or: [
        { status: this.offerStatus.OFFER },
        { status: this.offerStatus.CONTRACT }
      ],
      jobPostId: this.contractDetail.jobPostId._id
    };
    this.offerService.updateMultipleOffer({ condition, updateDetails }).subscribe(
      data => {
        if (data.status === 200) {
          this.sendDeclinedNotification('decline', offerDecline.reason);
          // this.common.incDecUsersCount(this.contractDetail.practiceId, 'staffHired', true);
          // this.common.incDecUsersCount(this.contractDetail.staffId, 'jobs', true);
          this.updateOfferStatus('Contract has been activated.', 'activateContract');
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      });
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
    this.contractDetail.contractStatus = environment.CONTRACT_STATUS.COMPLETED;
    this.contractDetail.jobPostId.status = environment.JOB_STATUS.COMPLETED;
    const jobData = {
      _id: this.contractDetail.jobPostId._id,
      status: environment.JOB_STATUS.COMPLETED
    };
    this.updateJobDetails(jobData);
    this.updateOfferContractStatus(environment.JOB_STATUS.COMPLETED);
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
        // if (ischanged && isFirstTimeDetails ) {
        //   this.common.incDecUsersCount(this.contractDetail.staffId, 'hours', true, totalHours);
        //   this.common.incDecUsersCount(this.contractDetail.practiceId, 'hours', true, totalHours);
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

  timesheetAmountCal(time, amount) {
    const minCal = (time.hours > 0) ? (time.hours * amount) : 0;
    const hourCal = (time.minutes > 0) ? ((amount * time.minutes) / 60) : 0;
    return Number((minCal + hourCal).toFixed(2));
  }

  // sendNotification(type?: String) {
  //     const name = this.currentUser.firstName + ' ' + this.currentUser.lastName ;
  //     const jobTitle = this.contractDetail.jobPostId.jobTitle.toString();
  //     if (type === 'timesheet'){
  //       // When payment for timesheet
  //       this.notification.message = environment.notificationMessage.workDiaryPaymentPractice.
  //       replace('#TITLE', jobTitle).replace('#NAME', name);
  //       this.notification.redirectLink = environment.notificationLink.workDiaryPaymentPractice + this.contractDetail._id;
  //     } else if (type === 'activateContract'){
  //       // Activate Contract
  //       this.notification.message = environment.notificationMessage.contractPaymentPractice.
  //       replace('#TITLE', jobTitle).replace('#NAME', name);
  //       this.notification.redirectLink = environment.notificationLink.contractPaymentPractice + this.contractDetail._id;
  //     } else if ( type === 'cancelContract'){
  //       // tslint:disable-next-line: max-line-length
  //       this.notification.message = environment.notificationMessage.cancelContract.replace('#TITLE', jobTitle).replace('#NAME', name).replace('#MESSAGE', this.cancelContractDetail.reason);
  //       this.notification.redirectLink = environment.notificationLink.cancelContractPractice + this.contractDetail._id;
  //     } else if (type === 'endContract') {
  //       this.notification.message = environment.notificationMessage.endContract.replace('#TITLE', jobTitle).replace('#NAME', name);
  //       this.notification.redirectLink = environment.notificationLink.endContractPractice + this.contractDetail._id;
  //     } else if (type === 'rating') {
  //       this.notification.message = environment.notificationMessage.endContract.replace('#TITLE', jobTitle).replace('#NAME', name);
  //       this.notification.redirectLink = environment.notificationLink.ratingPractice + this.contractDetail.staffId._id;
  //     }

  //   this.notification.senderId = this.currentUser._id;
  //   this.notification.receiverId = this.contractDetail.staffId._id;
  //   // this.notification.createdAt = new Date();
  //   this.firebaseService.createNotification(this.notification);

  // }


  sendNotification(type = '') {
    if (!type) {
      return false;
    }
    const checkType = ['rating'];
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const title = this.globalService.titleCase(this.contractDetail.jobPostId.jobTitle.toString());
    const jobId = this.contractDetail.jobPostId._id;
    const message = this.cancelContractDetail.reason;
    const currentTime = new Date().getTime();
    const notification = environment.notification;
    const id = (checkType.indexOf(type) > -1) ? this.contractDetail.staffId._id : this.contractDetail._id;
    this.notification = {
      senderId: this.currentUser._id,
      receiverId: this.contractDetail.staffId._id,
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

  sendNotificationToAdmin(type) {
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const notification = environment.notification;
    const currentTime = new Date().getTime();
    this.notification = {
      senderId: this.currentUser._id,
      receiverId: this.adminId,
      message: notification[type].msg.replace('#NAME', fullName),
      redirectLink: notification[type].link,
      type: notification[type].type,
      admin: (type === 'adminDisputes') ? { payment: 0, disputes: 1 } : { payment: 1, disputes: 0 },
      jobId: this.contractDetail.jobPostId._id,
      createdAt: currentTime,
      updatedAt: currentTime,
      status: environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
  }

  sendDeclinedNotification(type = '', message) {
    if (!type) {
      return false;
    }
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const title = this.contractDetail.jobPostId.jobTitle.toString();
    const jobId = this.contractDetail.jobPostId._id;
    // const message = this.cancelContractDetail.reason;
    const currentTime = new Date().getTime();
    const notification = environment.notification;
    this.declineStaffList.map(value => {
      const menuCount = (value.sendOfferByPractice) ? ({ sentOffer: 0, receivedOffer: 1, contract: 0 }) :
        ({ sentOffer: 1, receivedOffer: 0, contract: 0 });
      const id = value._id;
      this.notification = {
        senderId: this.currentUser._id,
        receiverId: value.staffId._id,
        message: notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
        redirectLink: notification[type].staffLink + id,
        type: notification[type].type,
        offerId: id,
        jobId: jobId,
        staff: menuCount,
        practice: { sentOffer: 0, receivedOffer: 0, contract: 0 },
        createdAt: currentTime,
        updatedAt: currentTime,
        status: environment.notificationStatus.UNREAD
      };
      this.firebaseService.createNotification(this.notification);
    });
  }

  getStripeAmount(amount) {
    return this.globalService.stripeTotalAmt((amount)) / 100;
  }

  submitRating(isRateLater: Boolean) {
    this.spinner.show();
    this.ratingDetail.staffId = this.contractDetail.staffId._id;
    this.ratingDetail.practiceId = this.currentUser._id;
    this.ratingDetail.contractId = this.contractDetail._id;
    this.ratingDetail.ratedBy = environment.USER_TYPE.PRACTICE;
    if (isRateLater) {
      this.ratingDetail.status = environment.RATING_STATUS.PENDING;
    } else {
      this.isRated.staff = true;
      this.ratingDetail.status = environment.RATING_STATUS.DONE;
      this.ratedDetails.staff = this.ratingDetail;
      this.addRatingToStaffProfile();
    }
    this.ratingService.saveRating(this.ratingDetail).subscribe(data => {
      if (data.status === 200) {
        this.endContractModal.hide();
        this.spinner.hide();
        // -------   Update End Job Status ------------
        if (this.contractDetail.contractStatus !== environment.CONTRACT_STATUS.COMPLETED) {
          this.contractDetail['endContract'] = {
            endTime: new Date(),
            endBy: environment.USER_TYPE.STAFF
          };
          this.contractDetail.contractStatus = environment.CONTRACT_STATUS.COMPLETED;
          this.contractDetail.jobPostId.status = environment.JOB_STATUS.COMPLETED;
          this.updateOfferStatus('Contract has ended.', 'endContract');
          const jobData = {
            _id: this.contractDetail.jobPostId._id,
            status: this.contractDetail.jobPostId.status
          };
          this.updateJobDetails(jobData);
        } else if (this.isRated.staff) {
          // ---- When contract is already end by Practice
          this.toastr.success(
            'Rating has been submitted.',
            'Success'
          );
        }
        // -------   Update End Job Status ------------
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

  getRating() {
    const condition = {
      staffId: { $eq: this.contractDetail.staffId._id },
      practiceId: { $eq: this.currentUser._id },
      contractId: { $eq: this.contractDetail._id },
    }
    this.ratingService.getRatings({ condition: condition }).subscribe(data => {
      if (data.status === 200) {
        if (data.data.length) {
          const self = this;
          const ratedList = data.data;
          ratedList.map(value => {
            if (environment.USER_TYPE.PRACTICE === value.ratedBy) {
              if (value.status === environment.RATING_STATUS.DONE) {
                self.isRated.staff = true;
                self.ratedDetails.staff = value;
              } else {
                self.ratingDetail = value;
                // self.ratedDetails.practice = value;
              }
            }
            if ((value.status === environment.RATING_STATUS.DONE) && (environment.USER_TYPE.STAFF === value.ratedBy)) {
              self.isRated.practice = true;
              self.ratedDetails.practice = value;
            }
          });
        }
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

  addRatingToStaffProfile() {
    var updateDetails = {
      _id: this.contractDetail.staffId._id,
    }
    updateDetails['avgRating'] = (this.contractDetail.staffId.avgRating && this.contractDetail.staffId.avgRating > 0)
      ? ((this.ratingDetail.rating + this.contractDetail.staffId.avgRating) / 2).toFixed(1)
      : this.ratingDetail.rating;

    this.usersService.saveUserData(updateDetails).subscribe(
      data => {
        if (data.status === 200) {
          // if(this.isRated.job) {
          //   this.sendNotification('rating');
          // }
        } else {
          this.toastr.error(
            'There are some server error please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server error please check connection.',
          'Error'
        );
      }
    );
  }

  cancelContract() {
    this.cancelContractDetail.cancelTime = new Date();
    this.cancelContractDetail.cancelBy = environment.USER_TYPE.PRACTICE;
    this.contractDetail['cancelContract'] = this.cancelContractDetail;
    this.contractDetail.contractStatus = environment.CONTRACT_STATUS.CANCELLED;
    if (this.isContractRevoke) {
      this.contractDetail.contractStatus = environment.CONTRACT_STATUS.REVOKE;
    }
    this.firebaseService.updateStatusInFBDB(this.currentUser._id, this.contractDetail.staffId._id,
      this.contractDetail.jobPostId._id);
    // this.common.incDecUsersCount(this.contractDetail.staffId, 'jobs', false);
    this.updateOfferStatus('Contract has been cancelled.', 'cancelContract');
    this.updateCalendar(environment.CALENDAR_STATUS.AVAILABLE);
    if (!this.isContractRevoke) {
      this.contractDetail.jobPostId.status = environment.JOB_STATUS.CANCELLED;
      const jobData = {
        _id: this.contractDetail.jobPostId._id,
        status: environment.JOB_STATUS.CANCELLED
      };
      this.updateJobDetails(jobData);
    }
    this.closeModal();
  }

  updateOfferContractStatus(status) {
    this.spinner.show();
    const condition = {
      practiceId: this.currentUser._id,
      jobPostId: this.contractDetail.jobPostId._id,
    };
    this.offerService.getAllOffers({ condition }).subscribe(data => {
      if (data.status === 200) {
        const offer = data.data[0];
        offer.contractStatus = status;
        this.offerService.addOffer(offer).subscribe(data => {
          if (data.status === 200) {
            this.toastr.success('Job status updated successfully', 'Success');
          } else {
            this.toastr.error('There are some server. Please check connection.', 'Error');
          }
        })
      }
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      this.toastr.error('There are some server. Please check connection.', 'Error');
    });
  }

  updateJobDetails(jobData) {
    this.jobsService.saveJob(jobData).subscribe(
      data => {
        if (data.status === 200) {
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
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

  createRepostJobArray() {
    let jobDetails = { ...this.contractDetail.jobPostId };
    jobDetails['jobDates'] = [];
    // delete jobDetails._id;
    jobDetails.status = (new JobNewPost).status;
    jobDetails.visibility = (new JobNewPost).visibility;
    jobDetails.total = (new JobNewPost).total;
    // jobDetails.visibility = (new JobNewPost).expireDate;
    // jobDetails.offerCount = (new JobNewPost).offerCount;
    // jobDetails.createdBy = (new JobNewPost).createdBy;
    delete jobDetails.createdAt;
    delete jobDetails.updatedAt;
    delete jobDetails.contractId;
    // jobDetails['declineStaffList'] = this.declineStaffList;
    const jobDate = moment(jobDetails.jobDate).endOf('d');
    if (moment().isAfter(jobDate)) {
      jobDetails.jobDate = '';
    }
    if (jobDetails.expireDate && moment().isSameOrAfter(jobDetails.expireDate)) {
      jobDetails.expireDate = (new JobNewPost).expireDate;
      jobDetails.paymentId = (new JobNewPost).paymentId;
      jobDetails.activeMonthRate = (new JobNewPost).activeMonthRate;
      // jobDetails.status = environment.JOB_STATUS.EXPIRED;
    }
    jobDetails['repostJob'] = true;
    return jobDetails;
  }

  repostJob() {
    const jobDetails = this.createRepostJobArray();
    const modalRef = this.modalService.open(
      AddEditPostComponent,
      { centered: true, backdrop: true, keyboard: true },
    );
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
    });
    setTimeout(() => {
      modalRef.componentInstance.setData(JSON.stringify(jobDetails),
        '/practice/contracts/details/' + this.contractDetail._id,
        jobDetails.jobType);
    }, 200);
  }

  /*
    checkPreviousRecipents() {
      const s = this.firebaseService.GetDataList('UserMessageRecipient')
      s.snapshotChanges().subscribe(data => {
        data.forEach(item => {
          const a = item.payload.toJSON();
          const keys = Object.keys(a['recipients']);
          if(keys[keys.indexOf(this.currentUser._id)] === this.currentUser._id){
            keys.splice(keys.indexOf(this.currentUser._id), 1);
            const partnerID = keys[0];
            if(partnerID === this.contractDetail.staffId._id){
              this.getMessagesThread(a);
            }
          }
        });
      });
    }

    getMessagesThread(thread) {
      const s = this.firebaseService.GetData('UserMessage', thread.$key)
      s.snapshotChanges().subscribe(data => {
        if (!data) {
          this.createRecipents();
        }
      });
    }

    createRecipents() {
      const userMessageRecipient = {
        created_at: new Date().getTime(),
        group: {
                group_id: 53,
                image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQEYoP0Qy_MnbnHVhnBDrQFarbKj6qDJj0FuI7pyOHL2V1Y-5_E&usqp=CAU',
                image_id: 1311,
                title: 'Looking Job for Dental Practice'
              },
        is_attachment: false,
        item: {
              item_id: 53,
              module: 'common\\models\\UserService'
        },
        message: {
                   created_at: new Date().getTime(),
                   is_attachment: false,
                   recipients: {
                                  [this.contractDetail.staffId._id]: {
                                                                    id: this.contractDetail.staffId._id,
                                                                    status: 'unread',
                                                                    unread: 0
                                  },
                                  [this.currentUser._id]: {
                                                            id: this.currentUser._id,
                                                            status: 'read',
                                                            unread: 0
                                                          }
                                },
                    sender: this.currentUser._id,
                    text: 'Let\'s Start Chat on Densub!',
                    updated_at: new Date().getTime()
                  },
        recipients: {
                      [this.contractDetail.staffId._id]: {
                                  avatar: (this.contractDetail.staffId['profilePhoto'].length) ?
                                            this.contractDetail.staffId['profilePhoto'][0] : '',
                                  fullName: this.contractDetail.staffId.firstName + ' ' + this.contractDetail.staffId.lastName,
                                  id: this.contractDetail.staffId._id,
                                  status: 'unread',
                                  unread: 0
                                },
                      [this.currentUser._id]: {
                                  avatar: (this.currentUser['profilePhoto'].length) ? this.currentUser['profilePhoto'][0] : '',
                                  fullName: this.currentUser.firstName + ' ' + this.currentUser.lastName,
                                  id: this.currentUser._id,
                                  status: 'read',
                                  unread: 0
                                }
                    },
        updated_at: new Date().getTime()
      };

      const userMessage = {
                            created_at: new Date().getTime(),
                            is_attachment: false,
                            recipients: {
                                          [this.contractDetail.staffId._id]: {
                                                                            id: this.contractDetail.staffId._id,
                                                                            status: 'unread'
                                                                          },
                                          [this.currentUser._id]: {
                                                                    id: this.currentUser._id,
                                                                    status: 'read'
                                                                  }
                                        },
                            sender: this.currentUser._id,
                            text: 'Let\'s Start Chat on Densub!',
                            updated_at: new Date().getTime()
      };

      const postData = {
        userMessageRecipient: userMessageRecipient,
        userMessage: userMessage
      };
      this.firebaseService.InsertUserMessageRecipient(postData); // Submit data
      this.toastr.success(
        'Message has been sent.',
        'Success'
      );
    } */

  numToArrConverter(i: number) {
    return new Array(i);
  }

  openRevokeModal() {
    this.isContractRevoke = true;
    this.cancelContractModal.show()
  }

  tempStr: any = '';
  onEditorChange() {
    this.tempStr = this.disputeDetail.detail;
    if ((this.tempStr === null) || (this.tempStr === '')) {
      this.tempStr = this.tempStr.replace('&nbsp;', '');
      return false;
    } else {
      this.tempStr = this.tempStr.toString();
      this.tempStr = this.tempStr.replace(/(<([^>]+)>)/ig, '');
      this.tempStr = this.tempStr.replace('&nbsp;', '');
      if (this.tempStr.length > 1000) {
        this.toastr.warning('You can not enter more then 1000 characters.', 'Warning');
        this.tempStr = this.tempStr.slice(0, 1000);
        this.disputeDetail.detail = this.tempStr;
        return false;
      }
    }
  }

}
