import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap';
import * as moment from 'moment';
import { differenceInHours, differenceInMinutes } from 'date-fns';
import { SimpleTimer } from 'ng2-simple-timer';
import { IDatePickerConfig } from 'ng2-date-picker/date-picker/date-picker-config.model';

import { environment } from '../../../../../../environments/environment';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { OfferService } from '../../../../../shared-ui/service/offer.service';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { TimesheetService } from '../../../../../shared-ui/service/timesheet.service';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';
import { WorkDiaryService } from '../../../../../shared-ui/service/workDiary.service';
import { JobsService } from '../../../dental-practice/jobs/job-posts/jobs.service';
import { AlertConfirmService } from '../../../../../shared-ui/service/alertConfirm.service';
import { currentUser } from '../../../../../layouts/home-layout/user.model';
import { savedFilters } from '../../../../../shared-ui/global/allFilters';
import { WorkDiary } from '../../../../../shared-ui/modal/work-diary.modal';
import { Timesheet } from '../../../../../shared-ui/modal/timesheet.modal';
import { Offer } from '../../../../../shared-ui/modal/offer.modal';
import { AlertConfirm } from '../../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { AssignmentFilter } from '../assignment-filter';

@Component({
  selector: 'app-assignment-list',
  templateUrl: './assignment-list.component.html',
  styleUrls: ['./assignment-list.component.scss'],
  //encapsulation: ViewEncapsulation.None
})

export class AssignmentListComponent implements OnInit {

  @ViewChild('viewTimesheet', { static: false }) viewTimesheet: ModalDirective;
  @ViewChild('cancelContractModal', { static: false }) cancelContractModal: ModalDirective;
  @ViewChild('addEditTimesheetModal', { static: false }) addEditTimesheetModal: ModalDirective;

  contractList: any = [];
  order: any = '';
  getPracticeTimesheet: any = [];
  reverse: Boolean = false;
  itemsPerPage = 5;
  totalItem = 0;
  p = 1;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  p5: number;
  contractStatus: any = environment.CONTRACT_STATUS;
  currentUser: currentUser = new currentUser;
  dataFilter: AssignmentFilter = new AssignmentFilter();
  setDataFilter: any;
  jobType = environment.JOB_TYPE;
  jobTypes: any = environment.JOB_TYPE;
  contractListStatus: any = environment.CONTRACT_LIST_STATUS;
  datePickerConfig: any = {
    allowMultiSelect: false,
    disableKeypress: true,
    format: 'MMM DD,YYYY'
  };
  counter1 = 0;
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
  timer1Id: string;
  timer1Name: string = '';
  cancelContractDetail: any = { reason: '', cancelTime: '', cancelBy: '' };
  timer1button = 'Clock In Now';
  totalTime = '';
  durations = '';
  getTime = '';
  totalSeconds: number = undefined;
  localTime: any;
  workDiary = new WorkDiary();
  timesheetEvent = new Timesheet();
  contractObj: any;
  contractDetail: any = new Offer();
  timesheet: any = [];
  startTime: any;
  copyContract: any;
  endTime: any;
  isTimesheetsubmitted: Boolean = false;
  alertDetails: AlertConfirm = new AlertConfirm();
  jobTabs: string[] = ['Upcoming', 'In progress', 'Awaiting Approval & Pay', 'Completed', 'All Assignments'];
  selectedJobTab = this.jobTabs[0];
  tempContractList: any;
  public isCollapsed = true;
  PositionTypeData: any = [];
  datePickerConfig2: IDatePickerConfig = {
    disableKeypress: true,
    min: moment(new Date()).format('MMM DD,YYYY'),
    max: moment(new Date()).format('MMM DD,YYYY'),
    format: 'MMM DD,YYYY'
  };
  breakTime = {
    hours: new Array(1),
    min: new Array(1)
  };
  contractInProgress: any;
  public dataFilterForOpen = {
    jobPostId: {
      jobType: [],
      positionType: [],
      jobDate: '',
      jobDateTo: ''
    },
    contractListStatus: 'upcoming',
    contractStatus: []
  }
  moreContractInProgress: boolean = false;
  isContractObjExist: boolean = true;
  contractListData: any = [];

  constructor(
    private globalService: GlobalService,
    private spinner: NgxSpinnerService,
    private offerService: OfferService,
    private toastr: ToastrService,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
    private timesheetService: TimesheetService,
    private st: SimpleTimer,
    private workDiaryService: WorkDiaryService,
    private jobsService: JobsService,
    private alertConfirmService: AlertConfirmService,
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    this.globalService.topscroll();
    this.setOrder('createdBy');
  }

  async ngOnInit() {
    setTimeout(() => { this.PositionTypeData = this.globalService.positionTypeData }, 2000);
    await this.getContracts();
    this.dataFilter.contractListStatus = this.contractListStatus.UPCOMING;
    if (savedFilters.staff.assginment) {
      this.dataFilter.contractListStatus = this.contractListStatus.UPCOMING;
      this.dataFilter = savedFilters.staff.assginment;
      this.dataFilter.jobPostId.jobDate = (this.dataFilter.jobPostId.jobDate) ?
        this.dataFilter.jobPostId.jobDate : (new AssignmentFilter()).jobPostId.jobDate;
      savedFilters.staff.assginment = this.dataFilter;
      this.setDataFilter = Object.assign({}, this.dataFilter);
    }
    this.getContractinProgress();
    
  }

  getTimesheetDetails(){
    const condition = { staffId: this.currentUser._id};
    this.workDiaryService.getworkDiary({condition}).subscribe(data => {
      if (data.status === 200) {
        this.getPracticeTimesheet = data.data;
        this.mergeTimesheetDetails();
      }else {
          this.toastr.error('There are some server Please check connection.', 'Error');
        }
      }, error => {
        this.toastr.error(
          'There are some server Please check connection.', 'Error');
    });
  }

  mergeTimesheetDetails(){
    this.getPracticeTimesheet.forEach(elementOfTimesheet => {
      this.contractListData.forEach(elementOfJob => {
        //old code backup
        // if(elementOfJob.contractListStatus === this.contractStatus.PAYTOACTIVATE && elementOfTimesheet.contractId.jobPostId == elementOfJob.jobPostId._id){
        //   elementOfJob.timeSheetDetails = elementOfTimesheet;
        // }

        if(elementOfJob.contractStatus === this.contractStatus.PAYTOACTIVATE && elementOfTimesheet.contractId.jobPostId == elementOfJob.jobPostId._id){
          elementOfJob.timeSheetDetails = elementOfTimesheet;
        }
      });
    });
  }

  getContractinProgress() {
    this.spinner.show();
    // const options = {
    //   p,
    //   itemsPerPage
    //       };
    const condition = {
      status: environment.OFFER_STATUS_NEW.CONTRACT,
      staffId: this.currentUser._id,
      contractStatus: { $ne: this.contractStatus.REVOKE },
    };
    const sort = { contractStartTime: 1 };
    this.offerService.getAllOffers({ condition, sort}).subscribe(
      async data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.totalItem = data.count;
            const array = data.data.filter(arr => {

              if(arr.contractStatus == this.contractStatus.INPROGRESS){
                return arr;
              }

              // const t1 = new Date(arr.contractStartTime);
              // const d1 = t1.getFullYear() + '-' + (t1.getMonth() + 1) + '-' + t1.getDate();
              // const t2 = new Date(moment(new Date()).toISOString());
              // const d2 = t2.getFullYear() + '-' + (t2.getMonth() + 1) + '-' + t2.getDate();
              //return Date.parse(d1) === Date.parse(d2);
            });
            if (array && array.length && array.length > 0) {
              this.getDetails();
              this.getTimesheet();
            }
          }
        }
        this.spinner.hide();
      }
    );
  }

  getTimesheet() {
    if (this.contractObj && this.contractObj._id) {
      const condition = { contractId: this.contractObj._id };
      this.workDiaryService.getworkDiary({ condition }).subscribe(data => {
        if (data.status === 200 && data.data.length > 0) {
          if (data.data.length) {
            this.timesheet = data.data;
            const startTime = data.data[data.data.length - 1].startTime;
            this.startTime = moment(new Date(startTime)).toISOString();
            const check = data.data.filter(sheet => sheet.timeClockStatus === 'Submitted, pending Approval');
            if (check.length > 0) {
              this.isTimesheetsubmitted = true;
            }
          }
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error('There are some server. Please check connection.', 'Error');
      });
    }
  }

  getDetails() {
    // Get the time after last clock out after refresh
    const value = JSON.parse(window.localStorage.getItem('timetracker'));
    const value1 = JSON.parse(window.localStorage.getItem('jobPostId'));
    if (value && value.seconds) {
      if (this.contractInProgress && this.contractInProgress.length === 1 && this.contractInProgress[0].jobPostId._id) {
        if (value.jobPostId === this.contractInProgress[0].jobPostId._id) {
          this.localTime = value.seconds;
        }
      }
      else {
        if (value1) {
          if (value.jobPostId === value1.jobPostId) {
            this.localTime = value.seconds;
          }
        }
      }
    }
    this.timesheetService.getTimesheetDetails({ staffId: this.currentUser._id }).subscribe(data => {
      let ids: string[] = this.st.getSubscription();
      if (ids.length > 0) {
        this.st.unsubscribe(ids[0]);
      }
      const array = data.data.filter(arr => {
        const t1 = new Date(arr.date);
        const d1 = t1.getFullYear() + '-' + (t1.getMonth() + 1) + '-' + t1.getDate();
        const t2 = new Date(moment(new Date()).toISOString());
        const d2 = t2.getFullYear() + '-' + (t2.getMonth() + 1) + '-' + t2.getDate();
        if ((this.contractInProgress && this.contractInProgress.length === 1)) {
          return this.contractObj && this.contractObj.jobPostId  && arr.jobPostId === this.contractObj.jobPostId._id;
        } else {
          return value1  && arr.jobPostId === value1.jobPostId;
        }
      });
      // Check if any assignment is available today in timesheet. If available get the totalTime clocked till now
      if (array.length > 0) {
        this.durations = array && array.length && array.length > 0 && array[0].timeDuration;
        this.getTime = this.durations;
        var a = this.getTime.split(':');
        var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
        this.totalSeconds = seconds + 1;
        if (this.getTime !== "") {
          this.totalTime = this.getTime;
        }
      } else {
        this.totalTime = '00:00:00';
        this.startTime = moment(new Date()).toISOString();
      }
      if (this.localTime) {
        const tempArray = [new Date(this.localTime * 1000).toISOString().substr(11, 8)];
        const totalDurations = tempArray.slice(1).reduce((prev, cur) => moment.duration(cur).add(prev), moment.duration(tempArray[0]));
        this.totalTime = moment.utc(totalDurations.asMilliseconds()).format("HH:mm:ss");
        var a = this.totalTime.split(':');
        var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
        this.counter1 = seconds + 1;
        this.timer1Id = this.st.subscribe(this.timer1Name, () => this.timer1callback(''));
        this.timer1button = 'Clock Out Now';
        // this.st.newTimer(this.timer1Name, 2, true);
      } else {
        this.totalTime = this.durations;
      }
      this.st.newTimer(this.timer1Name, 1, true);
    });
    if (this.timer1button === 'Clock Out Now') {
      this.workDiary.timeClockStatus = 'In progress - Clocked In';
    }
    if (this.timer1button = 'Clock In Now') {
      this.workDiary.timeClockStatus = 'In progress - On break';
    }
  }

  clockInOutAlert(contract, status) {
    let message;
    if (this.timer1button === 'Clock In Now') {
      message = { show: true, message: 'Are you sure you want to Clock IN?' };
    } else {
      message = { show: true, message: 'Are you sure you want to Clock OUT?' };
    }
    this.alertDetails = {
      title: 'Alert',
      message,
      cancelButton: { show: true, name: 'Close' },
      confirmButton: { show: true, name: 'Confirm' },
    };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe(data => {
      if (data) {
        if (this.contractInProgress.length > 1) {
          window.localStorage.setItem('jobPostId', JSON.stringify({ jobPostId: contract.jobPostId._id }))
          this.contractObj = contract;
        }
        this.subscribeTimer(contract);
        if (status === this.contractListStatus.INPROGRESS) {
          // When staff clocks in when assignment is in upcoming, change the status to inprogress.
          this.changeJobStatus(this.contractListStatus.INPROGRESS, contract);
          contract && (contract['contractListStatus'] = this.contractListStatus.INPROGRESS);
          this.selectATab('In progress');
          this.contractInProgress = this.contractList.filter(arr => arr.contractStatus === this.contractListStatus.INPROGRESS);
        }
      }
      return false;
    });
  }

  cannotStartAlert() {
    let message = { show: true, message: "You should stop your previous assignment's time tracker and submit your time sheet to be able to clock In for this assignment" };
    this.alertDetails = {
      title: 'Alert',
      message,
      cancelButton: { show: true, name: 'Close' },
      confirmButton: { show: false, name: 'Confirm' },
    };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe(data => {
      if (data) { }
      return false;
    });
  }

  stopTimerAlert(jobPostId) {
    if (this.totalTime === '00:00:00' || !this.totalTime) {
      this.workDiary.date = moment(new Date()).format('MMM DD,YYYY');
      this.addEditTimesheetModal.show();
    } else {
      this.endTime = moment(new Date()).toISOString();
      if (this.workDiary.date) {
        this.workDiary.date = moment(this.workDiary.date).toISOString();
      }
      const temp = this.totalTime.split(':');
      const totalTimeObject = { hours: temp[0], minutes: temp[1] };
      this.workDiary.totalTime = totalTimeObject;
      this.workDiary.date = new Date(moment(new Date()).toISOString());
      this.workDiary.startTime = this.startTime;
      this.getTotalBreakTime();
      this.workDiary.endTime = this.endTime;
      this.workDiary.totalAmount = +(this.timesheetAmountCal(totalTimeObject));
      this.workDiary.contractId = this.contractObj && this.contractObj._id;
      this.workDiary.practiceId = this.contractObj && this.contractObj.practiceId && this.contractObj.practiceId._id;
      this.workDiary.staffId = this.contractObj && this.contractObj.staffId && this.contractObj.staffId._id;
      this.workDiary.jobPostId = jobPostId;
      delete this.workDiary.paymentDetails['paymentId'];
      this.viewTimesheet.show();
    }
  }

  submitTimesheet(isEdit, contract) {
    this.st.delTimer(this.timer1Name);
    const check = this.timesheet.filter(sheet => sheet.timeClockStatus === 'Submitted, pending Approval');
    if (check.length === 0) {
      this.isTimesheetsubmitted = true;
      this.submitWorkDiary(isEdit, contract);
    } else {
      this.toastr.error("Today's Timesheet is already submitted", 'Error');
    }
    this.viewTimesheet.hide();
  }

  subscribeTimer(contract) {
    this.workDiary.jobPostId = contract && contract.jobPostId && contract.jobPostId._id;
    this.timesheetEvent.staffId = this.currentUser._id;
    this.timesheetEvent.date = moment(new Date()).toISOString();
    this.timesheetEvent.timeDuration = this.totalTime;
    this.timesheetEvent.jobPostId = contract && contract.jobPostId && contract.jobPostId._id;
    if (this.timer1Id) {
      this.st.unsubscribe(this.timer1Id);
      window.localStorage.removeItem('timetracker');
      this.timer1Id = undefined;
      this.timer1button = 'Clock In Now';
      this.timesheetEvent.clockInTime = '';
      this.timesheetEvent.clockOutTime = new Date().toLocaleTimeString();
      this.sendClockEvent('In progress - On break', contract);
    } else {
      if (this.totalSeconds) {
        this.counter1 = this.totalSeconds;
      }
      if (this.totalTime === '00:00:00' || !this.totalTime) {
        this.startTime = moment(new Date()).toISOString();
      }
      this.timer1Id = this.st.subscribe(this.timer1Name, () => this.timer1callback(contract));
      this.timer1button = 'Clock Out Now';
      this.timesheetEvent.clockInTime = new Date().toLocaleTimeString();
      this.timesheetEvent.clockOutTime = '';
      this.sendClockEvent('In progress - Clocked In', contract);
    }
    // Make entry in timehseet table
    let timesheetEvent = JSON.parse(JSON.stringify(this.timesheetEvent));
    this.timesheetService.addTimesheet(timesheetEvent).subscribe(data => {
      this.durations = data.data.timeDuration;
      this.getTime = this.durations;
      var a = this.getTime.split(':');
      var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
      this.totalSeconds = seconds + 1;
      if (this.getTime !== "") {
        this.totalTime = this.getTime;
      }
      if (data.status === 200) {
      } else {
        this.toastr.error('There are some server. Please check connection.', 'Error');
      }
    });
  }

  timer1callback(contract): void {
    window.localStorage.setItem('timetracker', JSON.stringify({
      seconds: this.counter1,
      timer1Id: this.timer1Id,
      timer1button: this.timer1button,
      practiceId: (contract && contract.practiceId && contract.practiceId._id) || (this.contractObj && this.contractObj.practiceId && this.contractObj.practiceId._id),
      contractId: (contract && contract._id) || (this.contractObj && this.contractObj._id),
      jobPostId: (contract && contract.jobPostId && contract.jobPostId._id) || (this.contractObj && this.contractObj.jobPostId && this.contractObj.jobPostId._id)
    }));
    this.totalTime = new Date(this.counter1 * 1000).toISOString().substr(11, 8);
    this.counter1++;
  }

  timesheetAmountCal(time) {
    const minCal = this.contractObj && (time.hours > 0) ? (time.hours * this.contractObj.finalRate) : 0;
    const hourCal = this.contractObj && (time.minutes > 0) ? ((this.contractObj.finalRate * time.minutes) / 60) : 0;
    return ((minCal + hourCal).toFixed(2));
  }

  sendClockEvent(status, contract) {
    // Send timesheet to practice for all clock in/out events
    if (this.workDiary.date) {
      this.workDiary.date = moment(this.workDiary.date).toISOString();
    }
    const temp = this.totalTime.split(':');
    const totalTimeObject = { hours: temp[0], minutes: temp[1] };
    this.workDiary.date = new Date(moment(new Date()).toISOString());
    if (status === 'In progress - Clocked In') {
      this.workDiary.timeClockStatus = 'In progress - Clocked In';
      this.workDiary.clockInTime = new Date().toLocaleTimeString();
    }
    if (status === 'In progress - On break') {
      this.workDiary.timeClockStatus = 'In progress - On break';
      this.workDiary.clockOutTime = new Date().toLocaleTimeString();
    }
    this.workDiary.startTime = this.startTime;
    this.workDiary.totalTime = totalTimeObject;
    this.workDiary.contractId = contract && contract._id;
    this.workDiary.practiceId = contract && contract.practiceId && contract.practiceId._id;
    this.workDiary.staffId = contract && contract.staffId && contract.staffId._id;
    delete this.workDiary.paymentDetails['paymentId'];
    let workDiary = JSON.parse(JSON.stringify(this.workDiary));
    this.workDiaryService.addWork(workDiary).subscribe(data => {
      if (data.status === 200) {
        this.timesheet.push(data.data);
        let message = 'Clock In/Out event is submitted to practice.';
        this.toastr.success(message, 'Success');
      } else {
        this.toastr.error('There are some server. Please check connection.', 'Error');
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error('There are some server. Please check connection.', 'Error');
    });
  }

  getTotalBreakTime() {
    let diffTime = differenceInMinutes(this.endTime, this.startTime);
    const hours = Math.floor(diffTime / 60);
    const minutes = diffTime - (hours * 60);
    const totalTimeinSeconds = (hours * 60 * 60) + (minutes * 60);
    var a = this.totalTime.split(':');
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    if (totalTimeinSeconds > seconds) {
      let tempSeconds = totalTimeinSeconds - seconds;
      const hour = Math.floor(seconds / 3600);
      const minute = Math.floor(seconds / 60);
      this.workDiary.totalTime = { hours: hour, minutes: minute };

      const h1 = Math.floor(tempSeconds / 3600);
      tempSeconds %= 3600;
      const m1 = Math.floor(tempSeconds / 60);
      tempSeconds = tempSeconds % 60;
      const totalBreak = { hours: Math.abs(h1), minutes: Math.abs(m1) };
      this.workDiary.breakTime = totalBreak;
    }
  }

  submitWorkDiary(isEdit, contract) {
    this.getTotalBreakTime();
    this.workDiary.jobPostId = contract && contract.jobPostId._id;
    if (this.totalTime === '00:00:00' || !this.totalTime) {
      this.workDiary.contractId = contract && contract._id;
      this.workDiary.practiceId = contract && contract.practiceId && contract.practiceId._id;
      this.workDiary.staffId = contract && contract.staffId && contract.staffId._id;
      delete this.workDiary.paymentDetails['paymentId'];
    }
    this.workDiary.timeClockStatus = 'Submitted, pending Approval';
    let workDiary = JSON.parse(JSON.stringify(this.workDiary));
    this.workDiaryService.addWork(workDiary).subscribe(async data => {
      if (data.status === 200) {
        if (this.timer1button = 'Clock Out Now' && this.totalTime) {
          this.st.unsubscribe(this.timer1Id);
          this.timer1button = 'Clock In Now';
          window.localStorage.removeItem('timetracker');
          window.localStorage.removeItem('jobPostId');
          this.timesheetEvent.staffId = this.currentUser._id;
          this.timesheetEvent.date = moment(new Date()).toISOString();
          this.timesheetEvent.clockInTime = new Date().toLocaleTimeString();
          this.timesheetEvent.clockOutTime = '';
          this.timesheetEvent.timeDuration = this.totalTime;
          this.timesheetEvent.jobPostId = contract.jobPostId._id;
          let timesheetEvent = JSON.parse(JSON.stringify(this.timesheetEvent));
          this.timesheetService.addTimesheet(timesheetEvent).subscribe(data => {
            this.durations = data.data.timeDuration;
            this.getTime = this.durations;
            var a = this.getTime.split(':');
            var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
            this.totalSeconds = seconds + 1;
            if (this.getTime !== "") {
              this.totalTime = this.getTime;
            }
            if (data.status === 200) {
            } else {
              this.toastr.error('There are some server. Please check connection.', 'Error');
            }
          });
          this.timesheet.push(data.data);
        }
        await this.changeJobStatus(this.contractListStatus.PAYTOACTIVATE, contract);
        contract && (contract['contractListStatus'] = this.contractListStatus.PAYTOACTIVATE);
        this.selectATab('Approve & Pay');
        let message = '';
        if (isEdit === 'edit') {
          message = 'Timesheet has been updated.';
        } else {
          message = 'Timesheet has been submitted.';
        }
        this.toastr.success(message, 'Success');
      } else {
        this.toastr.error('There are some server. Please check connection.', 'Error');
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error('There are some server. Please check connection.', 'Error');
    });
    this.addEditTimesheetModal.hide();
  }

  openEditTimesheetModal() {
    this.workDiary.breakTime.hours = parseInt(this.workDiary.breakTime.hours);
    this.workDiary.breakTime.minutes = parseInt(this.workDiary.breakTime.minutes);
    this.workDiary.date = moment(new Date()).format('MMM DD,YYYY');
    this.addEditTimesheetModal.show();
  }

  timeValidation(type) {
    const otherType = (type === 'startTime') ? 'endTime' : 'startTime';
    if (this.workDiary.endTime && this.workDiary.startTime && (this.workDiary.endTime !== this.workDiary.startTime)) {
      if (this.workDiary.startTime < this.workDiary.endTime) {
      } else {
        if (type === 'startTime') {
          this.workDiary[otherType] = this.workDiary[type];
        } else {
          setTimeout(() => {
            this.workDiary[type] = this.workDiary[otherType];
          }, 100);
        }
      }
    } else {
      this.workDiary[otherType] = this.workDiary[type];
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

  changeJobStatus(status, contract) {
    this.spinner.show();
    const condition = {
      staffId: this.currentUser._id,
      jobPostId: (contract && contract.jobPostId._id) || (this.contractObj && this.contractObj.jobPostId._id)
    };
    this.offerService.getAllOffers({ condition }).subscribe(data => {
      if (data.status === 200) {
        if (status === 'cancelled') {
          contract && (contract['contractListStatus'] = this.contractListStatus.CANCELLED);
          this.selectATab('Upcoming');
        }
        const offer = data.data[0];
        if(status === 'cancelled'){
          offer.cancelContract.cancelTime = new Date();
          offer.cancelContract.cancelBy = 'staff'
          offer.cancelContract.reason = this.cancelContractDetail.reason;
        }
        offer.contractStatus = status;
        this.offerService.addOffer(offer).subscribe(data => {
          if (data.status === 200) {
            // this.toastr.success('Job status updated successfully', 'Success');
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

    // Also change job status
    if (status === 'inprogress' || status === 'upcoming') {
      const job = {
        staffId: this.currentUser._id,
        _id: (contract && contract.jobPostId._id) || (this.contractObj && this.contractObj.jobPostId._id),
        status: 'filled'
      };
      const condition1 = { staffId: this.currentUser._id, jobPostId: contract && contract.jobPostId._id };
      this.workDiaryService.getworkDiary({ condition1 }).subscribe(data => {
        if (data.status === 200) {
          if (data.data.length) {
            this.jobsService.saveJob(job).subscribe(data => {
              if (data.status === 200) { } else {
                this.toastr.error('There are some server. Please check connection.', 'Error');
              }
            })
          }
        }
      })
    }
    if (status === 'payToActivate' || status === 'completed' || status === 'cancelled') {
      const job = {
        staffId: this.currentUser._id,
        _id: (contract && contract.jobPostId._id) || (this.contractObj && this.contractObj.jobPostId._id),
        status: status
      };
      this.jobsService.saveJob(job).subscribe(data => {
        if (data.status === 200) { } else {
          this.toastr.error('There are some server. Please check connection.', 'Error');
        }
      })
    }
  }

  getDescription(description) {
    const desc = description && description.substring(description.indexOf(">") + 1, description.lastIndexOf("<"));
    return desc && desc.length > 25 ? desc.substr(0, 25 - 1) + '...' : desc;
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  async setFilter(filterFor) {
    if (filterFor == "upcoming") {
      savedFilters.staff.assginment = this.dataFilterForOpen;
      this.setDataFilter = Object.assign({}, this.dataFilterForOpen);
    } else if (filterFor == "inprogress") {
      this.dataFilterForOpen.contractListStatus = 'inprogress';
      savedFilters.staff.assginment = this.dataFilterForOpen;
      this.setDataFilter = Object.assign({}, this.dataFilterForOpen);
    } else if (filterFor == "payToActivate") {
      this.dataFilterForOpen.contractListStatus = 'payToActivate';
      savedFilters.staff.assginment = this.dataFilterForOpen;
      this.setDataFilter = Object.assign({}, this.dataFilterForOpen);
    } else if (filterFor == "completed") {
      this.dataFilterForOpen.contractListStatus = 'completed';
      savedFilters.staff.assginment = this.dataFilterForOpen;
      this.setDataFilter = Object.assign({}, this.dataFilterForOpen);
    } else {
      // savedFilters.staff.assginment = this.dataFilter;
      this.dataFilterForOpen.contractListStatus = '';
      savedFilters.staff.assginment = this.dataFilterForOpen;
      // this.setDataFilter = Object.assign({}, this.dataFilter);
      this.setDataFilter = Object.assign({}, this.dataFilterForOpen);
    }
  }

  /** This method will reset filter criteria*/
  async resetFilter() {
    savedFilters.staff.assginment = null;
    this.setDataFilter = this.dataFilter = new AssignmentFilter();
    this.setDataFilter.contractListStatus = this.dataFilterForOpen.contractListStatus
    let checkboxes = document.getElementsByTagName('input');
    for (let x = 0; x < checkboxes.length; x++) {
      checkboxes[x]["checked"] = false;
    }
    this.dataFilterForOpen = {
      jobPostId: {
        jobDate: '',
        jobDateTo: '',
        jobType: [],
        positionType: []
      },
      contractListStatus: '',
      contractStatus: []

    }
  }

  isTodaysAssignment(contract) {
    if (contract && contract.jobPostId) {
      const t1 = new Date(contract.jobPostId.startTime);
      const d1 = t1.getFullYear() + '-' + (t1.getMonth() + 1) + '-' + t1.getDate();
      const t2 = new Date(moment(new Date()).toISOString());
      const d2 = t2.getFullYear() + '-' + (t2.getMonth() + 1) + '-' + t2.getDate();
      if (Date.parse(d1) === Date.parse(d2)) {
        return true;
      }
    }
  }
  cancelContractByStaff(){
    this.changeJobStatus('cancelled', this.copyContract);
    this.cancelContractModal.hide();

  }

  showCancelContractModal(contract){
    this.cancelContractModal.show();
    this.copyContract = contract;
  }

  cancelContract(contract) {
    let message = { show: true, message: "Are you sure you want to cancel the assignment?" };
    this.alertDetails = {
      title: 'Alert',
      message,
      cancelButton: { show: true, name: 'Close' },
      confirmButton: { show: true, name: 'Confirm' },
    };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe(data => {
      if (data) {
        this.changeJobStatus('cancelled', contract);
      }
      return false;
    });
  }

  getContracts() {
    //this.spinner.show();
    // const options = {
    //   p,
    //   itemsPerPage
    // }
    const condition = {
      status: environment.OFFER_STATUS_NEW.CONTRACT,
      staffId: this.currentUser._id,
      contractStatus: { $ne: this.contractStatus.REVOKE }
    };
    let checkInProgress = [];
    const sort = { updatedAt: -1 };
    this.offerService.getAllOffers({ condition , sort}).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.contractListData = data.data;
            this.totalItem = data.count;
            this.getTimesheetDetails();
            let isReturn = false;
            // data.data.sort((a, b) => {
            //   return a.jobPostId && b.jobPostId && new Date(a.jobPostId.startTime).getTime() - new Date(b.jobPostId.startTime).getTime();
            // })
            this.contractList = data.data.map((contract, index) => {
              contract.jobPostId && (contract.jobPostId['duration'] = this.getContractDuration(contract));
              contract['isCollapsedMoreInfo'] = false;

              switch (contract.contractStatus) {
                case this.contractStatus.UPCOMING:
                  if (contract.jobPostId) {
                   
                    let t1 = new Date(contract.jobPostId.jobDate);
                    let d1 = t1.getFullYear() + '-' + (t1.getMonth() + 1) + '-' + t1.getDate();
                    let t2 = new Date(moment(new Date()).toISOString());
                    let d2 = t2.getFullYear() + '-' + (t2.getMonth() + 1) + '-' + t2.getDate();
                    
                    

                    if (Date.parse(d1) <= Date.parse(d2)) {
                      contract['contractListStatus'] = this.contractListStatus.INPROGRESS;
                      this.changeJobStatus(this.contractListStatus.INPROGRESS, contract);
                      // if (new Date().getTime() > new Date(contract.jobPostId.startTime).getTime()) {
                      // contract['contractListStatus'] = this.contractListStatus.INPROGRESS;
                      // this.changeJobStatus(this.contractListStatus.INPROGRESS, contract);
                      // } else {
                      //   contract['contractListStatus'] = this.contractListStatus.UPCOMING;
                      //   this.changeJobStatus(this.contractListStatus.UPCOMING, contract);
                      // }
                    }
                    if (Date.parse(d1) > Date.parse(d2)) {
                      contract['contractListStatus'] = this.contractListStatus.UPCOMING;
                      this.changeJobStatus(this.contractListStatus.UPCOMING, contract);
                    }
                  }
                  break;

                case this.contractStatus.INPROGRESS:
                  let t1 = new Date(contract.jobPostId.startTime);
                  let d1 = t1.getFullYear() + '-' + (t1.getMonth() + 1) + '-' + t1.getDate();
                  let t2 = new Date(moment(new Date()).toISOString());
                  let d2 = t2.getFullYear() + '-' + (t2.getMonth() + 1) + '-' + t2.getDate();
                  contract['contractListStatus'] = this.contractStatus.INPROGRESS;
                  
                  // if (Date.parse(d2) > Date.parse(d1)) {
                  //   // contract['contractListStatus'] = this.contractStatus.PAYTOACTIVATE;
                  //   // this.changeJobStatus(this.contractListStatus.PAYTOACTIVATE, contract);
                  // } else 
                  if (Date.parse(d1) > Date.parse(d2)) {
                    contract['contractListStatus'] = this.contractListStatus.UPCOMING;
                    this.changeJobStatus(this.contractListStatus.UPCOMING, contract);
                  } 
                  // else {
                  //   //contract['contractListStatus'] = this.contractStatus.INPROGRESS;
                  // }
                  break;

                case this.contractStatus.PAYTOACTIVATE:
                  contract['contractListStatus'] = this.contractStatus.PAYTOACTIVATE;
                  break;

                case this.contractStatus.COMPLETED:
                  contract['contractListStatus'] = this.contractStatus.COMPLETED;
                  break;

                case this.contractStatus.CANCELLED:
                  contract['contractListStatus'] = this.contractListStatus.CANCELLED;
                  break;

                case this.contractStatus.EXPIRED:
                  contract['contractListStatus'] = this.contractListStatus.EXPIRED;
                  break;
              }
              if (index === (data.data.length - 1)) {
                isReturn = true;
              }

              if (contract.jobPostId && contract.jobPostId._id) {
                const t1 = new Date(contract.jobPostId.jobDate);
                const d1 = t1.getFullYear() + '-' + (t1.getMonth() + 1) + '-' + t1.getDate();
                const t2 = new Date(moment(new Date()).toISOString());
                const d2 = t2.getFullYear() + '-' + (t2.getMonth() + 1) + '-' + t2.getDate();
                if (Date.parse(d1) === Date.parse(d2)) {
                  const start = new Date(contract.jobPostId.startTime).toLocaleTimeString();
                  const end = new Date(contract.jobPostId.endTime).toLocaleTimeString();
                  const now = new Date().toLocaleTimeString();
                  if (now > start && now < end) {
                    checkInProgress.push(contract);
                  }
                }
              }
              return contract;
            });
            if (isReturn) {
              this.getAllNotifications();
              this.setFilter("upcoming");
            }
          }
          this.contractInProgress = this.contractList.filter(arr => arr.contractStatus === this.contractListStatus.INPROGRESS);
          if (this.contractInProgress.length === 1) {
            this.contractObj = this.contractInProgress[0];
          }
        } else {
          this.toastr.error('There are some server. Please check connection.', 'Error');
        }
        this.tempContractList = this.contractList;
        this.contractList.map(contract => {
          if (contract.jobPostId) {
            const t1 = new Date(contract.jobPostId.jobDate);
            const t2 = new Date(moment(new Date()).toISOString());
            if (t1 < t2 && contract.contractListStatus === this.contractListStatus.INPROGRESS) {
             // this.changeJobStatus(this.contractStatus.COMPLETED, contract);
             // contract['contractListStatus'] = this.contractStatus.COMPLETED;
            }
          }
        });
        if (this.contractObj === undefined && this.contractInProgress.length > 1) {
          const value = JSON.parse(window.localStorage.getItem('jobPostId'));
          const temp = value && this.contractList.filter(contract => contract.jobPostId && contract.jobPostId._id === value.jobPostId);
          this.contractObj = temp && temp[0] || {};
          this.contractList.map(contract => {
            if (contract.jobPostId && value && (contract.jobPostId._id === value.jobPostId)) {
              this.isContractObjExist = false;
            }
          })
        }
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        this.toastr.error('There are some server. Please check connection.', 'Error');
      }
    );
  }

  getAllNotifications() {
    const self = this;
    const notifications = this.firebaseService.getAllNotification();
    notifications.on('value', (snapshot) => {
      const values = snapshot.val();
      if (values) {
        let convertObjToArray = Object.entries(values);
        convertObjToArray.forEach((value) => {
          // -----  Count Unread Notification -------------------------------
          if (environment.notificationStatus.UNREAD === value[1]['status']) {
            const index = self.contractList.findIndex(contract => {
              return (contract._id === value[1]['offerId'] && contract.practiceId._id === value[1]['senderId']
                && contract.staffId._id === value[1]['receiverId']);
            })
            if (index > -1) {
              self.contractList[index]['updatedOffer'] = true;
            }
          }
        })
      }
    });
  }

  getContractDuration(contract: any) {
    if (contract.jobPostId && contract.jobPostId.endTime) {
      const diffTime = differenceInHours(contract.jobPostId.endTime, contract.jobPostId.startTime);
      if (this.jobType.TEMPORARY !== contract.jobPostId.jobType) {
        const selectedDays = contract.jobPostId.availableDays.filter((day) => {
          return day.available;
        });
        return diffTime * selectedDays.length;
      } else {
        return diffTime;
      }
    }
  }

  selectATab(tabValue: string) {
    if (tabValue == this.jobTabs[0]) {
      this.dataFilter.contractListStatus = this.contractListStatus.UPCOMING;
      this.getContracts();
    } else if (tabValue == this.jobTabs[1]) {
      this.getContractinProgress();
      this.dataFilter.contractListStatus = this.contractListStatus.INPROGRESS;
    } else if (tabValue == this.jobTabs[2]) {
      this.dataFilter.contractListStatus = this.contractListStatus.PAYTOACTIVATE;
      this.contractList.sort((a, b) => {
        return a.updatedAt && b.updatedAt && new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
    } else if (tabValue == this.jobTabs[3]) {
      this.dataFilter.contractListStatus = this.contractListStatus.COMPLETED;
      this.contractList.sort((a, b) => {
        return a.updatedAt && b.updatedAt && new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
    } else if (tabValue == this.jobTabs[4]) {
      this.dataFilter.contractListStatus = '';
    }
    this.selectedJobTab = tabValue;
    savedFilters.staff.assginment = this.dataFilter;
    this.setDataFilter = Object.assign({}, this.dataFilter);
  }

  selectFilter(filterType, filter) {
    if (filterType == "position") {
      if (event.currentTarget["checked"]) {
        this.dataFilterForOpen.jobPostId.positionType.push(filter);
      } else {
        let index = this.dataFilterForOpen.jobPostId.positionType.indexOf(filter);
        this.dataFilterForOpen.jobPostId.positionType.splice(index, 1);
      }
    } else if (filterType == "jobTypes") {
      if (event.currentTarget["checked"]) {
        this.dataFilterForOpen.jobPostId.jobType.push(filter);
      } else {
        let index = this.dataFilterForOpen.jobPostId.jobType.indexOf(filter);
        this.dataFilterForOpen.jobPostId.jobType.splice(index, 1);
      }
    } else if (filterType === 'status') {
      if (event.currentTarget["checked"]) {
        this.dataFilterForOpen.contractStatus.push(filter);
      } else {
        let index = this.dataFilterForOpen.contractStatus.indexOf(filter);
        this.dataFilterForOpen.contractStatus.splice(index, 1);
      }
    }
  }
}
