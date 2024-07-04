import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { differenceInHours, differenceInMinutes } from 'date-fns';
import * as moment from 'moment';
import { PaymentService } from '../../../../../shared-ui/service/payment.service';
import { environment } from '../../../../../../environments/environment';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { DisputeService } from '../../../../../shared-ui/service/disputes.service';
import { WorkDiaryService } from '../../../../../shared-ui/service/workDiary.service';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';
import { RatingService } from '../../../../../shared-ui/service/rating.service';
import { UsersService } from '../../../../../shared-ui/service/users.service';
import { OfferService } from '../../../../../shared-ui/service/offer.service';
import { AlertConfirmService } from '../../../../../shared-ui/service/alertConfirm.service';
import { AlertService } from '../../../../../shared-ui/alert/alert.service';
import { JobsService } from '../../../dental-practice/jobs/job-posts/jobs.service';
import { Dispute } from '../../../../../shared-ui/modal/dispute.modal';
import { WorkDiary } from '../../../../../shared-ui/modal/work-diary.modal';
import { Notification } from '../../../../../shared-ui/modal/notification.modal';
import { Rating } from '../../../../../shared-ui/modal/rating.modal';
import { Offer } from '../../../../../shared-ui/modal/offer.modal';
import { AlertConfirm } from '../../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { currentUser } from '../../../../../layouts/home-layout/user.model';
import { IDatePickerConfig } from 'ng2-date-picker/date-picker/date-picker-config.model';
import { runInThisContext } from 'vm';
declare var $: any;

@Component({
  selector: 'app-assignment-details',
  templateUrl: './assignment-details.component.html',
  styleUrls: ['./assignment-details.component.scss']
})

export class AssignmentDetailsComponent implements OnInit {
  @ViewChild('disputeModal', { static: false }) disputeModal: ModalDirective;
  @ViewChild('timeSheetModal', { static: false }) timeSheetModal: ModalDirective;
  @ViewChild('endContractModal', { static: false }) endContractModal: ModalDirective;
  @ViewChild('deleteTimesheetModal', { static: false }) deleteTimesheetModal: ModalDirective;
  @ViewChild('cancelConfirmModal', { static: false }) cancelConfirmModal: ModalDirective;
  @ViewChild('cancelContractModal', { static: false }) cancelContractModal: ModalDirective;
  @ViewChild('viewTimesheet', { static: false }) viewTimesheet: ModalDirective;
  @ViewChild('revisionReason', { static: false }) revisionReason: ModalDirective;
  @ViewChild('rejectRequest', { static: false }) rejectRequest: ModalDirective;
  @ViewChild('jobDescription', { static: false }) jobDescription: ModalDirective;


  contractStatus: any = environment.CONTRACT_STATUS;
  contractDetail: any = new Offer();
  disputeDetail: any = new Dispute();
  paymentMethod: any = environment.PAYEMENT_METHOD;
  jobTypeLabel = environment.JOB_LABEL;
  offerStatus = environment.OFFER_STATUS_NEW;
  jobType = environment.JOB_TYPE;
  currentJobDescription:any;
  timeSheetStatus = environment.TIMESHEET_STATUS;
  rejectRequestReason = {
    message: '',
    saved_on: undefined
  };
  jobTabsNew: any = [{
    _id: 0,
    lable: 'Timesheet'
  },
  {
    _id: 1,
    lable: 'Payment'
  }];
  selectedJobTab = this.jobTabsNew[0]._id;
  // editorConfig: any = {
  //   editable: true,
  //   spellcheck: true,
  //   height: '290px',
  //   translate: 'yes',
  //   enableToolbar: false,
  //   showToolbar: false,
  //   toolbar: [
  //     [
  //       'bold',
  //       'italic',
  //       'underline',
  //       'orderedList',
  //       'unorderedList'
  //     ],
  //   ]
  // };
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
  datePickerConfig2: IDatePickerConfig = {
    disableKeypress: true,
    // min: moment(new Date()).subtract(7, 'd').format('MMM DD,YYYY'),
    // max: moment(new Date()).format('MMM DD,YYYY'),
    max: moment(this.contractDetail.contractStartTime).add(moment.duration({ 'days': 13 })).format('MMM DD,YYYY'),
    min: moment(this.contractDetail.jobPostId && this.contractDetail.jobPostId.jobDate).format('MMM DD,YYYY'),
    format: 'MMM DD,YYYY'
  };
  workDiary = new WorkDiary();
  requiredValidateWork: any = {
    date: '',
    startTime: '',
    endTime: '',
    paidStatus: ''
  };
  workDiaryIndex: any = -1;
  breakTime = {
    hours: new Array(1),
    min: new Array(1)
  };
  currentUser: currentUser = new currentUser;
  notification: any = new Notification();
  savePreviousWork: any;
  isRated: any = {
    practice: false,
    job: false   // For staff
  };
  ratedDetails = {
    practice: new Rating(),
    staff: new Rating()
  };
  paymentDetailss = [];
  ratingDetail: any = new Rating();
  cancelContractDetail: any = { reason: '', cancelTime: '', cancelBy: '' };
  isContractRevoke: Boolean = false;
  showTimesheetButton: Boolean = false;
  workDiaryPaidStatus = environment.WORKDIARY_PAID_STATUS;
  adminId: any;
  alertDetails: AlertConfirm = new AlertConfirm();
  workDiaryFireBaseStatus = false;
  workDiaryNotifications: any;
  currentWorkDiaryStartTime: any;
  currentWorkDiaryEndTime: any;
  revisionData={ rejected: [], requested:[]};
  currnetDateTime :any = moment();
  rateFlag: boolean = false;
  markAsPaidRequest: boolean = false;
  enableMarkAsPaid: boolean = false;

  constructor(
    private globalService: GlobalService,
    private spinner: NgxSpinnerService,
    private offerService: OfferService,
    private disputeService: DisputeService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private workDiaryService: WorkDiaryService,
    private alertService: AlertService,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
    private ratingService: RatingService,
    private usersService: UsersService,
    private jobsService: JobsService,
    private alertConfirmService: AlertConfirmService,
    private paymentService: PaymentService
  ) { }

  ngOnInit() {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    this.route.params.subscribe((res) => {
      console.log('contract-Id', res)
      this.getContract(res.contractId);
      this.getAdminInfo();
      // this.getPaymentDetails();
      $(()=>{
        $('[data-toggle="tooltip"]').tooltip()
      })
    });
  }

  
  getPaymentDetails(){
    if(!this.contractDetail) return;    
    this.paymentService.getPaymentDetails({ practiceId: this.contractDetail.practiceId._id,jobId:this.contractDetail.jobPostId._id }).subscribe(
      data => {
        if (data.status === 200) {

          // this.paymentDetailss = data.data[0];
          console.log('details data',data.data[0])
          if(data.data.length > 0){
          const paymentDetailssArray = data.data.filter(obj => {            
            return obj && obj.receiverUserId;
          });
          if(paymentDetailssArray.length > 0){
            this.paymentDetailss = paymentDetailssArray[0];
            console.log('de',this.paymentDetailss)
          }else if(data.data.length > 0){
            const paymentDetailssArray = data.data.filter(obj => {            
              // console.log(obj);
            });
          }
          console.log(this.paymentDetailss);
          //this.paymentDetailss = this.paymentDetailss.length > 1 ? this.paymentDetailss[this.paymentDetailss.length -1]: this.paymentDetailss;
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

  selectATab(tabValue: string) {
    if (tabValue == this.jobTabsNew[0]._id) {
      //this.dataFilter.changedJobStatus = 'open';
    } else if (tabValue == this.jobTabsNew[1]._id) {
  
      this.getPaymentDetails()
      //this.dataFilter.changedJobStatus = 'expired';
    }
    this.selectedJobTab = tabValue;
  }

  getContract(contractId) {

    // const notifications = this.firebaseService.getAllNotificationw("60443f8bdad44c07ac1249a8");
    // console.log(notifications);
    // return 0;
    this.spinner.show();
    const condition = {
      _id: contractId,
      status: this.offerStatus.CONTRACT,
    };
    this.offerService.getOffer({ condition }).subscribe(
      async data => {
        if (data.status === 200) {
          console.log('data-data',data.data);
          if (data.data) {
            this.contractDetail = data.data;
            this.changeTheTab(this.contractDetail);            

            const jobEndDateTime = new Date(this.contractDetail.offerSteps[this.contractDetail.offerStatus].endTime);
            const currntDateTime = new Date(this.currnetDateTime._d);
           
            if(jobEndDateTime < currntDateTime){
              this.rateFlag = true;
            }else{
              this.rateFlag = false;
            }

            this.showAndHideMarkAsPaid();   

            //await this.getWorkDiaryNotifications(this.contractDetail);
            this.getPaymentDetails();
            if (this.contractDetail.jobPostId) {
              const dateTime = this.globalService.mergejobDatestartTime(this.contractDetail.jobPostId.jobDate,
                this.contractDetail.jobPostId.startTime);
              if (moment().isAfter(dateTime)) {
                this.showTimesheetButton = true;
                const startDay = moment(this.contractDetail.jobPostId.jobDate).startOf('d');
                const currentDay = moment().startOf('d');
                const diffInDays = currentDay.diff(startDay, 'd');
                if (diffInDays <= 7) {
                  this.datePickerConfig2.min = moment(this.contractDetail.jobPostId.jobDate).format('MMM DD,YYYY');
                  var duration = moment.duration({ 'days': 13 });
                  this.datePickerConfig2.max = moment(this.contractDetail.contractStartTime).add(duration).format('MMM DD,YYYY')
                } else {
                  this.datePickerConfig2.min = moment(new Date()).subtract(6, 'd').format('MMM DD,YYYY');
                  var duration = moment.duration({ 'days': 13 });
                  this.datePickerConfig2.max = moment(this.contractDetail.contractStartTime).add(duration).format('MMM DD,YYYY')
                }
                this.datePickerConfig2 = JSON.parse(JSON.stringify(this.datePickerConfig2));
              } else {
                this.showTimesheetButton = false;
              }
            }
            this.checkAndUpdateNotification();
            this.contractDetail['duration'] = this.getContractDuration();
            this.getTimesheet();
            this.getRating();
          } else {
            this.router.navigate(['staff/assignments']);
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
  changeTheTab(contractDetail: any) {
    if(contractDetail.contractStatus === this.contractStatus.COMPLETED){
      this.selectedJobTab = 1;
    }
  }

  async getWorkDiaryNotifications(contractDetail){
    this.workDiaryNotifications = await this.firebaseService.getContractNotifications(contractDetail._id);
    await console.log(this.workDiaryNotifications);
     
  }
  checkAndUpdateNotification() {
    const receiverId = this.contractDetail.staffId._id;
    const senderId = this.contractDetail.practiceId._id;
    const offerId = this.contractDetail._id;
    const status = environment.notificationStatus.UNREAD;
    this.firebaseService.getAndUpdateNotification(senderId, receiverId, offerId, status);
  }

  isTimePassed(expireDate){
  const dateString = expireDate;
  return !(new Date(dateString).getTime() < new Date().getTime()) ;
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

  showModal(type: string) {
    if (type === 'dispute') {
      this.disputeModal.show();
    }
    /* else if(type === 'rating') {
    } */
  }

  // payToActivateJob() {
  //   this.contractDetail.contractStatus = this.contractStatus.INPROGRESS;
  //   this.updateBidStatus('Contract has been activated.');
  // }

  updateOfferStatus(message: string, type?: String) {
    this.offerService.addOffer(this.contractDetail).subscribe(
      data => {
        this.spinner.hide();
        if (data.status === 200) {
          if (type === 'cancelContract') {
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
      this.sendNotificationToAdmin();
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

  editTimesheet(work, index) {
    this.workDiary = JSON.parse(JSON.stringify(work));
    this.savePreviousWork = JSON.parse(JSON.stringify(work));
    this.currentWorkDiaryStartTime = work.startTime;
    this.currentWorkDiaryEndTime = work.endTime;
    this.workDiaryIndex = index;
    this.timeSheetModal.show();
  }

  viewTimesheetDetail(work) {
    this.workDiary = JSON.parse(JSON.stringify(work));
    this.viewTimesheet.show();
  }

  closeTimesheetModal() {
    this.markAsPaidRequest = false;
    this.timeSheetModal.hide();
    this.deleteTimesheetModal.hide();
    this.resetTimesheet();
  }

  resetTimesheet() {
    this.workDiaryIndex = -1;
    this.workDiary = new WorkDiary();
    this.breakTime = {
      hours: new Array(1),
      min: new Array(1)
    };
  }

  submitWorkDiary() {
    // -------------------------- Validation Start ----------------------------------------
    if (this.workDiary.date) {
      this.workDiary.date = moment(this.workDiary.date).toISOString();
    }
    const objectKeys = Object.keys(this.requiredValidateWork);
    const self = this;
    let alertMsg = '';
    const found = objectKeys.filter(function (obj) {
      return Array.isArray(self.workDiary[obj])
        ? !self.workDiary[obj].length
        : !self.workDiary[obj];
    });
    const dateTime = this.globalService.mergejobDatestartTime(this.contractDetail.jobPostId.jobDate,
      this.contractDetail.jobPostId.startTime);
   // const matchDateTime = (moment(this.contractDetail.jobPostId.jobDate).isSame(this.workDiary.date, 'date') &&
     // dateTime.isSameOrAfter(this.workDiary.startTime)
    //);
    if (found.length) {
      alertMsg = 'Please fill all mandatory fields!';
    } else if (this.workDiary.startTime === this.workDiary.endTime) {
      alertMsg = 'Start time and End time should not be same';
    } else if (this.workDiary.totalTime.minutes === 0) {
      if (this.workDiary.totalTime.hours === 0) {
        alertMsg = 'Total Time should not be 0.';
      }
    }
    // if (matchDateTime) {
    //   alertMsg = 'Time should be greater than job start time.';
    // }
    if (alertMsg) {
      this.alertService.clear();
      this.alertService.error(alertMsg);
      setTimeout(() => {
        this.alertService.clear();
      }, 5000);
      return false;
    }
    // -------------------------- Validation End ----------------------------------------
    console.log((this.timesheetAmountCal(this.workDiary.totalTime, this.contractDetail.finalRate)));
    this.workDiary.totalAmount = +(this.timesheetAmountCal(this.workDiary.totalTime, this.contractDetail.finalRate));
    console.log(this.workDiary.totalAmount);
    this.workDiary.contractId = this.contractDetail._id;
    this.workDiary.practiceId = this.contractDetail.practiceId._id;
    this.workDiary.staffId = this.contractDetail.staffId._id;
    this.workDiary.timeClockStatus = environment.TIMESHEET_STATUS.SPA;
    delete this.workDiary.paymentDetails['paymentId'];
    let workDiary = JSON.parse(JSON.stringify(this.workDiary));
    // workDiary.date = moment(workDiary.date).toISOString();
    this.workDiaryService.addWork(workDiary).subscribe(data => {
      if (data.status === 200) {
        //worksheet code 
        let message = 'Timesheet has been submitted.';
        data.data.date = moment(data.data.date).format('MMM DD,YYYY');
        if (this.workDiary._id && this.workDiaryIndex > -1) {
          // if (this.workDiaryIndex > -1) {
          message = 'Timesheet has updated.';
          this.timesheet[this.workDiaryIndex] = data.data;
          //this.timesheet[this.workDiaryIndex] = this.workDiary;
          this.sendNotification('workDiaryUpdated');
          this.timesheet['timeSheetStatus']=""
          // }
          // else {
          //   this.sendNotification('AddWorkdiary');
          // }
        } else {
          if(!this.markAsPaidRequest){
            this.sendNotification('workDiaryAdded');
          }
          this.timesheet.unshift(data.data);
          // this.timesheet.unshift(this.workDiary);
          //this.timesheet.push(this.workDiary);
        }
        this.resetTimesheet();
        this.getTimesheet();
        this.timeSheetModal.hide();
       if(!this.markAsPaidRequest){
        this.toastr.success(
          message,
          'Success'
        );
       }
        //worksheet code end
        



        //update contract status
        const updateDetails = {
          contractStatus:  this.markAsPaidRequest ? environment.JOB_STATUS.MARKASPAIDSTAFF : environment.JOB_STATUS.PAYTOACTIVATE,
          isRead : false,          
        };
        const condition = {
          _id: this.contractDetail._id,           
          practiceId: this.contractDetail.practiceId._id
        };
        
        this.offerService.updateMultipleOffer({ condition, updateDetails }).subscribe(
          data => {
            if (data.status === 200) {

              //Update job status

                  const newJob = {
                    _id: this.contractDetail.jobPostId,
                    status: this.markAsPaidRequest ? environment.JOB_STATUS.MARKASPAIDSTAFF : environment.JOB_STATUS.PAYTOACTIVATE
                  };
              
                this.jobsService.saveJob(newJob).subscribe(
                  data => {
                    if (data.status === 200) {
                       
                    }
                  });
              //Update Job Status end
            }
          });
        } else {
        this.timeSheetModal.hide();
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

  rejectsRequestSubmit(){
    console.log("timesheet", this.timesheet);
    if(this.timesheet.length>0){
      this.rejectRequestReason.saved_on = new Date();
      const updateDetails = {
        rejectRevisionStatus:this.rejectRequestReason
      }
      const condition = {
        _id: this.timesheet[0].contractId._id,
        practiceId: this.timesheet[0].contractId.practiceId
      };
      this.offerService.rejectRequestRevisionReason({ condition, updateDetails }).subscribe(
        data => {
            if (data.status === 200) {
            this.timesheet[0].timeClockStatus = environment.TIMESHEET_STATUS.REJECTED;
                this.workDiaryService.addWork(this.timesheet[0]).subscribe(data => {
                    if (data.status === 200) {
                      //send notification to practice 
                      this.sendNotification('workDiaryRevised');
                    console.log('Revision Rejected Successfully');
                    this.closeModel();
                    }
                });
            }
      });
    }
  }

  closeModel(){
    this.rejectRequest.hide();
  }

  getTimesheet() {
    const condition = { contractId: this.contractDetail._id };
    this.workDiaryService.getworkDiary({ condition }).subscribe(data => {
      if (data.status === 200 && data.data.length > 0) {
        this.timesheet = data.data;
        //this.timesheet = data.data.filter(item => item.timeClockStatus === 'Submitted, pending Approval');
        for (let i = 0; i < this.timesheet.length; i++) {
          const expirationDate = moment(this.timesheet[i].date).format('MMM DD,YYYY');
          this.timesheet[i].date = expirationDate;
        }
        if(this.markAsPaidRequest){
        this.markAsPaidOfflinePayment();
        }
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(
        'There are some server Please check connection.',
        'Error'
      );
    });
  }

  deleteTimesheet() {
    this.spinner.show();
    this.workDiaryService.deleteworkDiary({ _id: this.workDiary._id }).subscribe(data => {
      if (data.status === 200) {
        
        //update contract status
        const updateDetails = {
          contractStatus: environment.JOB_STATUS.INPROGRESS,
          isRead : false,          
        };
        const condition = {
          _id: this.contractDetail._id,           
          practiceId: this.contractDetail.practiceId._id
        };
        
        this.offerService.updateMultipleOffer({ condition, updateDetails }).subscribe(
          data => {
            if (data.status === 200) {

              //Update job status

                  const newJob = {
                    _id: this.contractDetail.jobPostId,
                    status: environment.JOB_STATUS.INPROGRESS
                  };
              
                this.jobsService.saveJob(newJob).subscribe(
                  data => {
                    if (data.status === 200) {
                      this.showTimesheetButton =true;
                      this.contractDetail.contractStatus = environment.JOB_STATUS.INPROGRESS;
                    }
                  });
              //Update Job Status end
            }
          });
          

        if (this.workDiaryIndex > -1) {
          this.timesheet.splice(this.workDiaryIndex, 1);
        }
        this.closeTimesheetModal();
        this.spinner.hide();
        this.toastr.success(
          'Timesheet has been deleted.',
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
    })
  }

  timeValidation(type) {
    // let timeIsValid = false;
    const otherType = (type === 'startTime') ? 'endTime' : 'startTime';
    if (this.workDiary.endTime && this.workDiary.startTime && (this.workDiary.endTime !== this.workDiary.startTime)) {
      if (this.workDiary.startTime < this.workDiary.endTime) {
        //   timeIsValid = true;
      } else {
        if (type === 'startTime') {
          this.workDiary[otherType] = this.workDiary[type];
        } else {
          setTimeout(() => {
            this.workDiary[type] = this.workDiary[otherType];
          }, 100);
        }
        // timeIsValid = false;
      }
    } else {
      this.workDiary[otherType] = this.workDiary[type];
      //timeIsValid = false;
    }
    this.selBreakTimeValues();
    this.workDiaryTotalTime();
  }

  workDiaryTotalTime() {
    let diffTime = differenceInMinutes(this.workDiary.endTime, this.workDiary.startTime);
    diffTime = diffTime - (Number(this.workDiary.breakTime.hours) * 60 + Number(this.workDiary.breakTime.minutes));
    const hours = Math.floor(diffTime / 60);
    const minutes = diffTime - (hours * 60);
    this.workDiary.totalTime.hours = hours;
    this.workDiary.totalTime.minutes = minutes;
  }

  selBreakTimeValues() {
    const diffTime = differenceInMinutes(this.workDiary.endTime, this.workDiary.startTime);
    const hours = Math.floor(diffTime / 60);
    const minutes = diffTime - (hours * 60);
    if (diffTime > 0) {
      this.breakTime = {
        hours: (hours > 0) ? new Array(hours) : new Array(1),
        min: (hours > 0) ? new Array(60) : (minutes > 0) ? new Array(minutes) : new Array(1)
      };
    }

  }

  closeModal() {
    this.endContractModal.hide();
    this.disputeModal.hide();
    this.cancelContractModal.hide();
  }

  timesheetAmountCal(time, amount) {
    const minCal = (time.hours > 0) ? (time.hours * amount) : 0;
    const hourCal = (time.minutes > 0) ? ((amount * time.minutes) / 60) : 0;
    return ((minCal + hourCal).toFixed(2));
  }

  // sendNotification(type?: String) {
  //   const name = this.currentUser.firstName + ' ' + this.currentUser.lastName ;
  //   const jobTitle = this.contractDetail.jobPostId.jobTitle.toString();
  //     // Woarkdiary
  //   if (type === 'updateWorkdiary') {
  //     this.notification.redirectLink = environment.notificationLink.workDiaryAddedStaff + this.contractDetail._id;
  //     this.notification.message = environment.notificationMessage.workDiaryUpdatedStaff.replace('#TITLE', jobTitle).replace('#NAME', name);
  //   } else if (type === 'AddWorkdiary'){
  //     this.notification.redirectLink = environment.notificationLink.workDiaryAddedStaff + this.contractDetail._id;
  //     this.notification.message = environment.notificationMessage.workDiaryAddedStaff.replace('#TITLE', jobTitle).replace('#NAME', name);
  //   } else if ( type === 'cancelContract') {
  //     this.notification.message = environment.notificationMessage.cancelContract.replace('#TITLE', jobTitle).replace('#NAME', name).replace('#MESSAGE', this.cancelContractDetail.reason);
  //     this.notification.redirectLink = environment.notificationLink.cancelContractStaff + this.contractDetail._id;
  //   } else if (type === 'endContract') {
  //     this.notification.message = environment.notificationMessage.endContract.replace('#TITLE', jobTitle).replace('#NAME', name);
  //     this.notification.redirectLink = environment.notificationLink.endContractStaff + this.contractDetail._id;
  //   } else if (type === 'rating') {
  //     this.notification.message = environment.notificationMessage.endContract.replace('#TITLE', jobTitle).replace('#NAME', name);
  //     this.notification.redirectLink = environment.notificationLink.ratingStaff + this.contractDetail.practiceId._id;
  //   }
  //   //  else if ( type === 'endContract') {
  //   //   this.notification.message = environment.notificationMessage.endContract.replace('#TITLE', jobTitle).replace('#NAME', name);
  //   //   this.notification.redirectLink = environment.notificationLink.endContractStaff + this.contractDetail._id;
  //   // };

  //   this.notification.senderId = this.currentUser._id;
  //   this.notification.receiverId = this.contractDetail.practiceId._id;
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
    let id = (checkType.indexOf(type) > -1) ? this.contractDetail.practiceId._id : this.contractDetail._id;
    if(type=="workDiaryUpdated" || type=="workDiaryAdded"){
      id=this.contractDetail.jobPostId._id;
    }
    let notificationCustomMessage;
    if(type == 'workDiaryAdded'){
      notificationCustomMessage = 'Timesheet has been submitted by <strong>#NAME</strong> for <strong>#TITLE</strong>';
    }else if(type == "workDiaryUpdated"){
      notificationCustomMessage = '<strong>#TITLE</strong> time sheet was edited by <strong>#NAME</strong>';
    }else if(type == "workDiaryRevised"){
      notificationCustomMessage = 'Revision for <strong>#TITLE</strong> has been rejected by <strong>#NAME</strong>'
      id = this.contractDetail.jobPostId._id;
    }else if(type === "cancelContract"){
      id = this.contractDetail.jobPostId._id;
      notificationCustomMessage = notification[type].msg;
    }
    else{
      notificationCustomMessage = notification[type].msg;
    }
    this.notification = {
      senderId: this.currentUser._id,
      receiverId: this.contractDetail.practiceId._id,
      message: notificationCustomMessage.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
      redirectLink: notification[type].practiceLink + id,
      type: notification[type].type,
      offerId: id,
      jobId: jobId,
      staff: { sentOffer: 0, receivedOffer: 0, contract: 0 },
      practice: { sentOffer: 0, receivedOffer: 0, contract: 1 },
      createdAt: currentTime,
      updatedAt: currentTime,
      status: environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
  }

  submitRating(isRateLater: Boolean) {
    this.spinner.show();
    this.ratingDetail.staffId = this.currentUser._id;
    this.ratingDetail.practiceId = this.contractDetail.practiceId._id;
    this.ratingDetail.contractId = this.contractDetail._id;
    this.ratingDetail.ratedBy = environment.USER_TYPE.STAFF;
    if (isRateLater) {
      this.ratingDetail.status = environment.RATING_STATUS.PENDING;
    } else {
      this.isRated.practice = true;
      this.ratingDetail.status = environment.RATING_STATUS.DONE;
      this.ratedDetails.practice = this.ratingDetail;
      this.addRatingToPracticeProfile();
    }

    this.ratingService.saveRating(this.ratingDetail).subscribe(data => {
      if (data.status === 200) {
        this.endContractModal.hide();
        this.spinner.hide();
        // -------   Update End Job Status ------------
        // if (this.contractDetail.contractStatus !== environment.CONTRACT_STATUS.COMPLETED) {
        //   this.contractDetail['endContract'] = {
        //     endTime: new Date(),
        //     endBy: environment.USER_TYPE.STAFF
        //   };
        //   this.contractDetail.contractStatus = environment.CONTRACT_STATUS.COMPLETED;
        //   this.contractDetail.jobPostId.status = environment.JOB_STATUS.COMPLETED;
        //   // this.sendNotification('endContract');
        //   this.updateOfferStatus('Contract has ended.', 'endContract');
        //   this.updateJobStatus();
        // } else 
        if (this.isRated.practice) {
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
    var condition = {
      staffId: { $eq: this.currentUser._id },
      practiceId: { $eq: this.contractDetail.practiceId._id },
      contractId: { $eq: this.contractDetail._id },
    }
    this.ratingService.getRatings({ condition: condition }).subscribe(data => {
      if (data.status === 200) {
        if (data.data.length) {
          const self = this;
          const ratedList = data.data;
          ratedList.map(value => {
            if ((value.status === environment.RATING_STATUS.DONE) &&
              (environment.USER_TYPE.STAFF === value.ratedBy)) {
              self.isRated.practice = true;
              self.ratedDetails.practice = value;
            }
            if (environment.USER_TYPE.PRACTICE === value.ratedBy) {
              if (value.status === environment.RATING_STATUS.DONE) {
                self.isRated.staff = true;
                self.ratedDetails.staff = value;
              } else {
                self.ratingDetail = value;
              }
            }
          });

          // if (data.data[0].status === environment.RATING_STATUS.DONE){
          //   this.isRated = true;
          // } else {
          //   this.ratingDetail = data.data[0];
          // }
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

  addRatingToPracticeProfile() {
    const updateDetails = {
      _id: this.contractDetail.practiceId._id,
    };
    updateDetails['avgRating'] = (this.contractDetail.practiceId.avgRating &&
      this.contractDetail.practiceId.avgRating > 0)
      ? ((this.ratingDetail.rating + this.contractDetail.practiceId.avgRating) / 2).toFixed(1)
      : this.ratingDetail.rating;

    this.usersService.saveUserData(updateDetails).subscribe(
      data => {
        if (data.status === 200) {
          // if(this.isRated) {
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
    this.cancelContractDetail.cancelBy = environment.USER_TYPE.STAFF;
    this.contractDetail['cancelContract'] = this.cancelContractDetail;
    this.contractDetail.contractStatus = environment.CONTRACT_STATUS.CANCELLED;
    if (this.isContractRevoke) {
      this.contractDetail.contractStatus = environment.CONTRACT_STATUS.REVOKE;
    } else {
      this.contractDetail.jobPostId.status = environment.JOB_STATUS.CANCELLED;
    }
    this.firebaseService.updateStatusInFBDB(this.currentUser._id, this.contractDetail.practiceId._id,
      this.contractDetail.jobPostId._id);
    // this.common.incDecUsersCount(this.contractDetail.staffId, 'cancelContract', true);
    this.updateOfferStatus('Assignment Cancelled successfully.', 'cancelContract');
    if (!this.isContractRevoke) {
      this.contractDetail.jobPostId.status = environment.JOB_STATUS.CANCELLED;
      this.updateJobStatus();
    }
    this.closeModal();
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

  sendNotificationToAdmin() {
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const notification = environment.notification;
    // ----------------------------
    const currentTime = new Date().getTime();
    this.notification = {
      senderId: this.currentUser._id,
      receiverId: this.adminId,
      message: notification['adminDisputes'].msg.replace('#NAME', fullName),
      redirectLink: notification['adminDisputes'].link,
      type: notification['adminDisputes'].type,
      admin: { payment: 0, disputes: 1 },
      jobId: this.contractDetail.jobPostId._id,
      createdAt: currentTime,
      updatedAt: currentTime,
      status: environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
  }

  updateJobStatus() {
    const jobData = {
      _id: this.contractDetail.jobPostId._id,
      status: this.contractDetail.jobPostId.status
    };
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

  numToArrConverter(i: number) {
    return new Array(i);
  }

  openRevokeModal() {
    this.isContractRevoke = true;
    this.cancelContractModal.show()
  }

  showAddNewTimesheetBtn() {
    return this.contractDetail.contractStatus === this.contractStatus.INPROGRESS &&
      this.showTimesheetButton // According to time and date
      && (
        this.contractDetail.jobPostId &&
        this.contractDetail.jobPostId.jobType === this.jobType.TEMPORARY &&
        this.timesheet.length === 0
      )
  }
  getRevisionReason(){
    this.revisionReason.show();
      //to get rejected Revision  
      if(this.contractDetail.rejectRevisionStatus){
          if(this.contractDetail.rejectRevisionStatus.length > 0){           
            this.revisionData['rejected'].push(this.contractDetail);
          }
        }
      //to get requested Revision
      if(this.contractDetail.requestRevisionStatus){
        if(this.contractDetail.requestRevisionStatus.length > 0){          
          this.revisionData['requested'].push(this.contractDetail);
        }
      }      
  }

  addNewTimeSheet() {
    if (this.timesheet.length) {
      this.alertDetails = {
        title: 'Alert',
        message: { show: true, message: 'Timesheet is already submitted!' },
        cancelButton: { show: true, name: 'Close' },
        confirmButton: { show: false, name: '' },
      };
      this.alertConfirmService.openPopup(this.alertDetails).subscribe(data => {
        return false;
      });
    } else {
      this.workDiary.date = moment(new Date()).format('MMM DD,YYYY');
      this.timeSheetModal.show();
    }
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

  showDescripton(jobDescription){
    this.currentJobDescription = jobDescription;
    this.jobDescription.show();
  }

  markAsPaidOfflinePayment(){
    //this.selectedWork.paymentDetails.paymentType = this.workDiaryPaymentType.OFFLINE;
    this.submitWorkDiary1(true);
  }

  workDiaryPaymentType = environment.WORKDIARY_PAYMENT_TYPE;
  submitWorkDiary1(paymentFlag) {
    this.timesheet[0].paymentDetails.paymentType = this.workDiaryPaymentType.OFFLINE;
    this.timesheet[0].paymentDetails.paymentDesc = '';
    this.spinner.show();
    this.contractDetail.contractStatus = environment.CONTRACT_STATUS.MARKASPAIDSTAFF;
    this.contractDetail.jobPostId.status = environment.JOB_STATUS.MARKASPAIDSTAFF;

    this.timesheet[0].paidStatus = environment.WORKDIARY_PAID_STATUS.PAID;
    this.timesheet[0].timeClockStatus = environment.TIMESHEET_STATUS.APPROVED;
   
    this.updateJobDetails(this.contractDetail.jobPostId._id);
    this.updateOfferContractStatus(environment.CONTRACT_STATUS.MARKASPAIDSTAFF);
    //this.getPaymentDetails();
    this.timesheet[0].paidDate = new Date();
    this.workDiaryService.addWork(this.timesheet[0]).subscribe(data => {
      
      if (data.status === 200) {
        this.spinner.hide();
        this.selectedJobTab = 1;
  
         const condition = {
          _id: this.timesheet[0].contractId._id,                  
        };

        this.offerService.getOffer({condition}).subscribe(
          data=>{
            if(data.status ===200){
            
            }
          }
        );

        // Add WorkDiary Hours
        let totalHours = 0;
        totalHours = this.timesheet[0].totalTime.hours + (Number((this.timesheet[0].totalTime.minutes / 60).toFixed(1)));
        const newDetails = (new WorkDiary()).paymentDetails;
        delete newDetails['paymentId'];
        
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

  updateJobDetails(id) {
    const jobData = {
      _id: id,
      status: environment.JOB_STATUS.MARKASPAIDSTAFF 
    };
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

  updateOfferContractStatus(status) {
    this.spinner.show();
    const condition = {
      practiceId: this.currentUser._id,
      jobPostId: this.contractDetail.jobPostId._id,
    };

    this.offerService.addOffer(this.contractDetail).subscribe(data=>{
      if(data.status === 200){
        this.sendNotificationApproveAndPay('timesheetMarkAsPaid');
      }
    })
    this.offerService.getAllOffers({ condition }).subscribe(data => {
      if (data.status === 200) {
        const offer = data.data[0];
        //offer.contractStatus = status;
        this.offerService.addOffer(offer).subscribe(data => {
          if (data.status === 200) {
            this.toastr.success('assignment was marked as paid successfully.', 'Success');
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

  sendNotificationApproveAndPay(type){
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const title = this.globalService.titleCase(this.contractDetail.jobPostId.jobTitle.toString());
    const jobId = this.contractDetail.jobPostId._id;
    const currentTime = new Date().getTime();
    const currentDate = moment(new Date).format('MMMM DD, YYYY');
    const notification = environment.notification;
    let id = this.contractDetail._id;
    this.notification = {
      senderId: this.currentUser._id,
      receiverId: this.contractDetail.practiceId._id,
      message: notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#DATE',currentDate),
      redirectLink: notification[type].staffLink + jobId,
      type: notification[type].type,
      jobId: jobId,
      createdAt: currentTime,
      updatedAt: currentTime,
      status: environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
  }

  continueMarkAsPaid(){
    this.markAsPaidRequest = true;
  }

  openJobList(){
    this.jobsService.showLeftMenuForJobs = false;
    this.jobsService.fetchRoute = this.router.url;
  }

  showAndHideMarkAsPaid(){
      const jobDate = new Date(this.contractDetail.jobPostId.jobDate);
      const jobEndHours = new Date(this.contractDetail.offerSteps[this.contractDetail.offerStatus].endTime).getHours();
      const jobEndMinutes = new Date(this.contractDetail.offerSteps[this.contractDetail.offerStatus].endTime).getMinutes();
      const endDateWithHours = new Date(jobDate).setHours(jobEndHours);
      const endDate = new Date(endDateWithHours).setMinutes(jobEndMinutes)
      const jobEndDateTime = new Date(endDate);
      const currntDateTime = new Date(this.currnetDateTime._d);
           
      if(jobEndDateTime < currntDateTime){
        this.enableMarkAsPaid = true;
      }else{
        this.enableMarkAsPaid = false;
      }
  }
}
