import {  Component, ViewChild} from '@angular/core';
import {  startOfDay, addMonths, differenceInCalendarDays} from 'date-fns';
import { Subject } from 'rxjs';
import { OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
// import { AvailabilityModule } from './availability.module';
import {CalendarView, CalendarMonthViewDay} from 'angular-calendar';
import * as moment from 'moment';
import { GlobalService } from '../../../shared-ui/service/global.service';
import { ActivatedRoute, Router} from '@angular/router';
import { UsersService } from '../../../shared-ui/service/users.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { StaffProfile } from '../../../shared-ui/modal/staff-profile.modal';
import { environment } from '../../../../environments/environment';
import { Location } from '@angular/common';
import { currentUser } from '../../../layouts/home-layout/user.model';
import { JwtService } from '../../../shared-ui/service/jwt.service';
import { Notification } from '../../../shared-ui/modal/notification.modal';
import { FirebaseService } from '../../../shared-ui/service/firebase.service';
import { JobsService } from '../../dashboard-pages/dental-practice/jobs/job-posts/jobs.service';
import { RatingService } from '../../../shared-ui/service/rating.service';
import { InviteOfferService } from '../../../shared-ui/service/inviteOffer.service';
import { InviteOffer } from '../../../shared-ui/modal/inviteOffer.modal';
import { OfferService } from '../../../shared-ui/service/offer.service';
import { Offer } from '../../../shared-ui/modal/offer.modal';
import { Favorite } from '../../../shared-ui/staff-list/favorite.model';
import { FavoriteService } from '../../../shared-ui/service/favorite.service';
import { Common } from '../../../shared-ui/service/common.service';
import { WorkDiaryService } from '../../../shared-ui/service/workDiary.service';
import { UserCalendarService } from '../../../shared-ui/service/userCalendar.service';
import { Address } from '../../../shared-ui/modal/address.modal';
import { AddressService } from '../../../shared-ui/service/address.service';
import { SkillType } from '../../dashboard-pages/admin/skills/skill-type/skill-type.modal';
import { CertificateType } from '../../dashboard-pages/admin/certificates/certificate-type/certificate-type.modal';
import { SkillTypeService } from '../../dashboard-pages/admin/skills/skill-type/skill-type.service';
import { CertificateTypeService } from '../../dashboard-pages/admin/certificates/certificate-type/certificate-type.service';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PositionTypeService } from '../../../shared-ui/service/positionType.service';



const colors: any = {
  red: {
    primary: '#1b4587',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: 'red',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

@Component({
  selector: 'app-staff-view-profile',
  templateUrl: './staff-view-profile.component.html',
  styleUrls: ['./staff-view-profile.component.scss']
})

export class StaffViewProfileComponent implements OnInit {
  @ViewChild('sendInviteOfferModal', { static: false }) public sendInviteOfferModal: ModalDirective;
  @ViewChild('confirmationModal', { static: false }) public confirmationModal: ModalDirective;
  staffProfileInfo: any = new StaffProfile();
  viewDate: Date = new Date();
  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Month;
  userId = '';
  similarStaffProfiles: any = [];
  currentUser: currentUser = new currentUser();
  notification: any = new Notification();
  confirmModal: NgbModalRef;
  closeResult: string;
  confirmationMessage: string;
  // newjoblist: any = [];
  jobList: any = [];
  // jobPostId: any = '';
  todayDate: Date = startOfDay(new Date()); // Current Date
  futureDate: Date = startOfDay(addMonths(new Date(), 1)); // 1 month future date
  //Added one to add future date also
  showCalendarDate = (differenceInCalendarDays(this.futureDate, this.todayDate) + 1); //show custom calendar dates;
  customCalendarDates: any = [];
  staffRatingList: any = [];
  overallRatingStaff: any = 0;
  previousJobList: any = [];
  sendOfferList: any = [];
  inviteOfferDetails: InviteOffer = new InviteOffer();
  favorite: Favorite = new Favorite();
  selOfferInvite: any = [];
  dropdownSettings2: any = {};
  isFavorite: Boolean = false;
  paymentMethod: any = environment.PAYEMENT_METHOD;
  userTypes: any = environment.USER_TYPE;
  selectedJobList: any = [];
  totalHoursWorked = 0;
  totalJobsWorked = 0;
  tempAllRecipientValues: any = [];
  ratingCount: Number = 0;
  jobOfferIds = [];
  positionTypeName:string = '';
  profileStatus = environment.PROFILE_STATUS;
  calendarStatus = environment.CALENDAR_STATUS;
  calendarDateColor = environment.CALENDAR_DATE_COLOR;
  address: any = new Address();
  otherText = ['other', 'others'];
  skillTypeList: SkillType[] = [];
  certificateTypeList: CertificateType[] = [];
  title: string;
  cancelledContract: number;
  constructor(
    private globalService: GlobalService,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private location: Location,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
    private jobsService: JobsService,
    private ratingService: RatingService,
    private inviteOfferService: InviteOfferService,
    private offerService: OfferService,
    private favoriteService: FavoriteService,
    private workDiaryService: WorkDiaryService,
    private common: Common,
    private skillTypeService: SkillTypeService,
    private certificateTypeService: CertificateTypeService,
    private modalService: NgbModal,
    private userCalendarService: UserCalendarService,
    private addressService: AddressService,
    private positionTypeService: PositionTypeService,
    private routes: Router
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    console.log(this.currentUser);
  }

  ngOnInit() {
    this.getAllMessageRecipients(); // !!! GET THE MESSAGE RECIPIENTS FROM FIREBASE DB !!!
    this.globalService.topscroll();
    console.log('Entered');
    this.route.params.subscribe(res => {
      this.userId = res.userId;
      this.getUsersData();
     

      this.globalService.topscroll();
    });
    this.dropdownSettings2 = {
      singleSelection: false,
      idField: '_id',
      textField: 'jobTitle',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 1,
      closeDropDownOnSelection: false,
      noDataAvailablePlaceholderText : 'Please create a job post'
    };
  }


  getAddressList() {
    const condition = {userId: this.staffProfileInfo._id };
    this.addressService.getAddressWithDetails({ condition  }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.address = data.data[0];
          }
        } else {
          this.globalService.error();
        }
      }, error => {
        this.globalService.error();
      });
  }

  getUserCalendar() {
    const condition = {
      userId: this.staffProfileInfo._id
    };
    this.userCalendarService.getUserCalendar({condition}).subscribe(
      data => {
        if (data.status === 200) {
          this.customCalendarDates = data.data;
          this.customCalendarDates.forEach( (day, index) => {
            this.customCalendarDates[index].start = startOfDay(day.start);
          });
        } else {
          this.globalService.error();
        }
        this.spinner.hide();
      },
      error => {
        this.globalService.error();
      }
    );
  }

  /* beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void { body.forEach(day => {
    if (this.dateIsValid(day.date)) {
        const customCalendarIndex = this.checkAvailability(day.date);
        if (customCalendarIndex > -1) {
          day.cssClass = this.calendarDateColor[this.customCalendarDates[customCalendarIndex].status];
        }
      }
    });
  } */

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void { body.forEach(day => {
    if (this.dateIsValid(day.date)) {
        const customCalendarIndex = this.checkAvailability(day.date);
        const customCalendarDates = this.customCalendarDates[customCalendarIndex];
        if (customCalendarIndex > -1) {
          if (customCalendarDates.status === this.calendarStatus.AVAILABLE ) {
            if (customCalendarDates.availableType === 'any') {
              day.cssClass = this.calendarDateColor[customCalendarDates.status];
            } else {
              day.cssClass = this.calendarDateColor['partialAvailable'];
            }
          } else {
            day.cssClass = this.calendarDateColor[customCalendarDates.status];
          }
        }
      }
    });
  }

  dateIsValid(date: Date): boolean {
    const lastLength = this.customCalendarDates.length - 1;
    return date >= this.todayDate && date <= this.customCalendarDates[lastLength].start;
  }

  checkAvailability(date: Date) {
    return this.customCalendarDates.findIndex((day) => {
      return (differenceInCalendarDays(day.start, startOfDay(date)) === 0) ? true : false;
    });
  }

  checkLicense(date) {
    return this.todayDate > startOfDay(date);
  }

  getCalendarTitle(day: any) {
    if (day && day.events.length) {
      const dateData = day.events[0];
      if  ( dateData.status === this.calendarStatus.AVAILABLE) {
          if (dateData.availableType === 'any') {
            return 'Available';
          } else {
            return "Available from " + moment(dateData.startTime).format('hh:mm A') + ' to ' + moment(dateData.endTime).format('hh:mm A');
          }
      } else {
        return 'Not Available';
      }
    } else {
      return '';
    }
  }

  getUsersData() {
    const self = this;
    this.spinner.show();
    const condition = {
      _id: this.userId,
      userType: environment.USER_TYPE.STAFF
    };
    this.usersService.getUserInfoWithDetails(condition).subscribe(
        data => {
          if (data.status === 200) {
            this.spinner.hide();
            delete data.data.password;
            this.staffProfileInfo = data.data;
            if(this.staffProfileInfo.covidVaccination && !this.staffProfileInfo.hepCVaccination){
              this.title = "Vaccinated for Covid 19";
            }else if(!this.staffProfileInfo.covidVaccination && this.staffProfileInfo.hepCVaccination){
              this.title = "Vaccinated for Hep B";
            }else if(this.staffProfileInfo.covidVaccination && this.staffProfileInfo.hepCVaccination){
              this.title = "Vaccinated for Covid 19 and Vaccinated for Hep B";
            }
            if (this.staffProfileInfo.availableDays && this.staffProfileInfo.availableDays.length){
              this.staffProfileInfo.availableDays.map(function(day) {
                day.start = startOfDay(day.start);
                return day;
              });
              this.selectCustomCalendarDates();
            }
            this.getTotalHoursWorked();
            this.getTotalJobsWorked();
            this.getFavoriteList();
            this.getSimilarStaffProfiles();
            // this.getPreviousInviteOffer();
            this.getRatingsCount();
            this.getSendJobOfferIds();
            // this.getRatingList();
            this.getPosition();
            this.getUserCalendar();
            this.getAddressList();
            this.getCertificateTypeList();
            this.getSkillType();
            this.getCancellation();
          } else {
            this.spinner.hide();
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

  getTotalHoursWorked() {
    const condition = {
      staffId : this.staffProfileInfo._id
    };
    this.workDiaryService.getTotalHours({condition}).subscribe(
      data => {
        if (data.status === 200) {
          this.totalHoursWorked = data.data;
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

  getTotalJobsWorked() {
    const condition = {
      staffId : this.staffProfileInfo._id,
      $or: [
        { contractStatus: environment.CONTRACT_STATUS.COMPLETED },
        { contractStatus: environment.CONTRACT_STATUS.MARKASPAIDSTAFF }
      ],
    };
      this.offerService.getTotal({condition}).subscribe(data => {
        if (data.status === 200) {
          if (data.data > 0) {
            this.totalJobsWorked = data.data;
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

/*   getTotalJobsWorked() {
    const condition = {
      staffId : this.staffProfileInfo._id,
      contractStatus : environment.CONTRACT_STATUS.COMPLETED
    };
      this.offerService.getAllOffers({condition}).subscribe(data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.totalJobsWorked = data.data.length;
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
  } */
  getSimilarStaffProfiles() {
    // const self = this;
    // this.spinner.show();
    const condition = {
      userType : environment.USER_TYPE.STAFF,
      profileVerificationStatus : environment.PROFILE_STATUS.VERIFIED ,
      status: 1,
      positionType : this.staffProfileInfo.positionType,
      _id : {$ne : this.userId}
    };
    this.usersService.getUsers({ condition: condition , limit : 5}).subscribe(
        data => {
          if (data.status === 200) {
            this.similarStaffProfiles = data.data;
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

  setView(view: CalendarView) {
    this.view = view;
  }

  goBack() {
    this.location.back();
  }

  showOfferModal() {
     this.sendInviteOfferModal.show();
  }

  closeModel() {
   // this.selOfferInvite = [];
    this.sendInviteOfferModal.hide();
  }

  getSendJobOfferIds() {
    const condition = {
      staffId : this.staffProfileInfo._id,
    };
    this.offerService.getJobOfferIds({condition}).subscribe( data => {
      if (data.status === 200) {
          this.jobOfferIds = data.data;
          this.getPreviousInviteOffer();
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

  getPreviousInviteOffer() {
    const condition = {
      sendOfferId : this.currentUser._id,
      receiveOfferId : this.staffProfileInfo._id
    };
    this.previousJobList = [];
    this.inviteOfferService.getInviteOffers({condition}).subscribe( async data => {
      if (data.status === 200) {
        if (data.data.length > 0) {
          const self = this;
          await data.data.forEach((offer, index) => {
              self.previousJobList.push(...offer.jobPostId);
              if ( (data.data.length - 1 ) === index ) {
                self.getJobs();
              }
            });
          } else {
            this.getJobs();
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

  getJobs() {
    this.previousJobList = [...this.previousJobList, ...this.jobOfferIds];
    const condition = {
        // visibility: {$ne: environment.JOB_VISIBILITY.PUBLIC},
        status : environment.JOB_STATUS.OPEN,
       _id : {'$nin' : this.previousJobList },
      draft: false,
      createdBy: this.jwtService.currentLoggedUserInfo._id
      // $or: [
      //   {status : environment.JOB_STATUS.OPEN},
      //   {status : environment.JOB_STATUS.CLOSED}
      // ],
    };

    this.jobsService.getJobs({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          this.jobList = data.data;
          this.filterJobs();
        //  this.getInviteList();
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

  filterJobs(){
    this.jobList.map(job => {
      job.jobTitle = job.jobTitle + " (Job Date: " + moment(job.jobDate).format('MMM DD,YYYY') + ")";
    })
  }


  async sendInviteOffer() {
    await this.selOfferInvite.forEach( value => {
      this.inviteOfferDetails.jobPostId.push(value._id);
    });
    this.inviteOfferDetails.sendOfferId = this.currentUser._id;
    this.inviteOfferDetails.receiveOfferId = [this.staffProfileInfo._id]
    this.inviteOfferService.sendInviteOffer(this.inviteOfferDetails).subscribe(
      data => {
        if (data.status === 200) {
          this.toastr.success('Invitation has been sent successfully.', 'Success');
          const self = this;
          this.jobList = this.jobList.filter( value => {
                    if (self.inviteOfferDetails.jobPostId.indexOf(value._id) === -1){
                      return true;
                    } else {
                      self.selectedJobList.push(value);
                      return false;
                    }
          });
          this.getSendJobOfferIds();
          this.createOfferList();
          this.closeModel();
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
      });
  }

  createOfferList() {
    for (let i = 0; i < this.inviteOfferDetails.jobPostId.length; i++ ) {
      const offerDetails: any = new Offer();
      offerDetails.jobPostId = this.inviteOfferDetails.jobPostId[i];
      offerDetails.practiceId = this.inviteOfferDetails.sendOfferId;
      offerDetails.status =  environment.OFFER_STATUS_NEW.OFFER;
      offerDetails.sendOfferByPractice = true;
      offerDetails.offerSteps.initial.offerTime = new Date();
      offerDetails.offerSteps.initial.offerBy = environment.USER_TYPE.PRACTICE;
      offerDetails.offerSteps.initial.startTime = this.selectedJobList[i].startTime;
      offerDetails.offerSteps.initial.endTime = this.selectedJobList[i].endTime;
      offerDetails.practiceName = this.selectedJobList[i].practiceName;
      const getAmount = (this.selectedJobList[i].paymentMethod === this.paymentMethod.HOURLY) ?
                        this.selectedJobList[i].desiredHourlyRate : this.selectedJobList[i].desiredSalaryRate;
      offerDetails.offerSteps.initial.amount =  getAmount;
      this.common.incDecJobCount(this.selectedJobList[i], 'sentPracticeOffers', true, this.inviteOfferDetails.receiveOfferId.length);
      for (let j = 0; j < this.inviteOfferDetails.receiveOfferId.length; j++ ) {
        offerDetails.staffId = this.inviteOfferDetails.receiveOfferId[j];
        this.sendOfferList.push({...offerDetails});
        if ( i === (this.inviteOfferDetails.jobPostId.length - 1 ) && j === (this.inviteOfferDetails.receiveOfferId.length - 1)) {
          this.sendAllOffers();
        }
      }
    }

  }

  sendAllOffers() {
    this.offerService.addMultipleOffer(this.sendOfferList).subscribe(
      data => {
        if (this.sendOfferList.length > 0) {
          this.sendOfferList = data.data;
          this.sendNotification('inviteStaff');
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

//  async sendNotification(){
//     if(this.sendOfferList.length > 0){
//       const self = this;
//       await this.sendOfferList.forEach(function(details , index) {
//         const name = self.currentUser.firstName + ' ' + self.currentUser.lastName ;
//         const jobTitle = self.selOfferInvite[index].jobTitle.toString();
//         self.notification.message = environment.notificationMessage.newPost.replace('#TITLE', jobTitle).replace('#NAME', name);
//         self.notification.redirectLink = environment.notificationLink.newPost + details._id;
//         self.notification.senderId = self.currentUser._id;
//         self.notification.receiverId = details.staffId;
//         self.firebaseService.createNotification(self.notification);
//         if((self.sendOfferList.length - 1) === index ) {
//           self.selOfferInvite = [];
//           self.inviteOfferDetails = new InviteOffer;
//           self.sendOfferList = [];
//         }
//        });

//     }
//   }
  sendNotification(type = '') {
    if (!type) {
      return false;
    }
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const message = '';
    const notification = environment.notification;
    const self = this;

    this.sendOfferList.forEach(function(details , index) {
      const currentTime = new Date().getTime();
      const title = self.globalService.titleCase(self.selOfferInvite[index].jobTitle.toString());
      const jobId = self.selOfferInvite[index]._id;
      const id = details._id;
      self.checkPreviousRecipents(title,jobId);
      self.notification = {
          senderId    : self.currentUser._id,
          receiverId  : details.staffId,
          message     : notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
          redirectLink : notification[type].staffLink + jobId,
          type : notification[type].type,
          offerId : id,
          jobId : jobId,
          createdAt: currentTime,
          updatedAt: currentTime,
          status : environment.notificationStatus.UNREAD
      };
      self.firebaseService.createNotification(self.notification);
      // ------ Reset Invite Offer List ---------------
      if ((self.sendOfferList.length - 1) === index ) {
          self.selOfferInvite = [];
          self.inviteOfferDetails = new InviteOffer;
          self.sendOfferList = [];
      }
    });
  }

  getAllMessageRecipients(){
    const self = this;
    self.spinner.show();
    let s = self.firebaseService.GetMessageRecipients('UserMessageRecipient','recipients/'+self.currentUser._id+'/id', self.currentUser._id);
    s.once('value', async function(snapshot) {
      if(snapshot.val()){
        const values = Object.values(snapshot.val());
        self.tempAllRecipientValues = values;
        return;
      }
    });
    self.spinner.hide();
  };

  checkPreviousRecipents(title = '',jobId) {
    const self = this;
    if(self.tempAllRecipientValues && self.tempAllRecipientValues.length){
      self.tempAllRecipientValues.forEach((item, index) => {
        let iscreateRecipient = false;
        const keys = Object.keys(item['recipients']);
        let partnerId = keys.indexOf(this.staffProfileInfo._id);
        if(
          item['group']['group_id'] !== jobId ||
          (item['group']['group_id'] === jobId && partnerId === -1)
        ){
          iscreateRecipient = true;
        }
        if((self.tempAllRecipientValues.length - 1) === index && iscreateRecipient) {
          self.createRecipents(title, jobId);
        }
      });
    }else{
      self.createRecipents(title, jobId);
    }
  }

  createRecipents(title = '',jobId = '') {
    const userMessageRecipient = this.firebaseService.createUserMessageRecipientModal(jobId, title, this.currentUser, this.staffProfileInfo);
    const userMessage = this.firebaseService.createUserMessageModal(this.currentUser, this.staffProfileInfo);

    const postData = {
      userMessageRecipient: userMessageRecipient,
      userMessage: userMessage
    };
    this.firebaseService.InsertUserMessageRecipient(postData); // Submit data
  }

  selectCustomCalendarDates() {
    let customCalStartIndex = 0;
    // find index of current Date in 365 days
    customCalStartIndex = this.staffProfileInfo.availableDays.findIndex((day) => {
      return (differenceInCalendarDays(day.start, this.todayDate) === 0 ) ? true : false;
    });
    // increase the indexing of removing data for future date
    this.showCalendarDate = this.showCalendarDate + customCalStartIndex;
    if ( customCalStartIndex > -1) {
      this.customCalendarDates = this.staffProfileInfo.availableDays.slice(customCalStartIndex, this.showCalendarDate);
    }
  }



  getFavoriteList() {
    const condition = {
      userId : this.currentUser._id,
      type : environment.FAVORITE_TYPE.STAFF,
      favoriteId : this.staffProfileInfo._id
    };
    this.favoriteService.getFavoriteJob({condition: condition}).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length) {
            this.favorite = data.data[0];
            this.isFavorite = true;
          } else{
            this.isFavorite = false;
          }
        }
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      });
  }

  showConfirmationModal() {
    // cancelModal
    this.addFavorite();
    // if(this.isFavorite){
    //   this.confirmationMessage = "Are you sure you want to remove from Favorite list";
    // }else{
    //   this.confirmationMessage ="Are you sure you want to add to Favorite list";
    // }
    //   if (this.confirmModal) {
    //     this.confirmModal.close();
    //   }
    //   this.confirmModal = this.modalService.open(this.confirmationModal, {
    //     ariaLabelledBy: 'modal-basic-title',
    //     centered: true, backdrop: 'static', keyboard: false
    //   });
    //   this.confirmModal.result.then((result) => {
    //     this.closeResult = `Closed with: ${result}`;
    //   }, (reason) => {
    //     if(reason === 'Cross click-Confirmation'){
          
    //     }
    //   });
  }

  addFavorite() {
    if (this.isFavorite) {
      this.removeFavorite();
      return false;
    }
    this.favorite.userId = this.currentUser._id;
    this.favorite.type = environment.FAVORITE_TYPE.STAFF;
    this.favorite.favoriteId = this.staffProfileInfo._id;
    this.favoriteService.addFavorite(this.favorite).subscribe(
      data => {
        if (data.status === 200) {
          this.favorite = data.data;
          this.isFavorite = true;
          this.toastr.success('Added to Favorites.','Success');
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

  removeFavorite() {
    this.favoriteService.removeFavorite({_id: this.favorite._id }).subscribe(
      data => {
        if (data.status === 200) {
          this.favorite = new Favorite();
          this.isFavorite = false;
          this.toastr.success('Removed from Favorites.','Success');
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



/*   getRatingList() {
    var condition = {
      staffId : {$eq : this.staffProfileInfo._id},
      ratedBy : {$eq : environment.USER_TYPE.PRACTICE},
      status  : environment.RATING_STATUS.DONE
    };

    this.ratingService.getRatings({condition: condition}).subscribe(async data => {
      if (data.status === 200) {
          if (data.data.length) {
            this.staffRatingList = data.data;
            // this.overallRatingStaff = await this.getAverage(this.staffRatingList);
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
  } */
  getRatingsCount() {
    var condition = {
      staffId : {$eq : this.staffProfileInfo._id},
      ratedBy : {$eq : environment.USER_TYPE.PRACTICE},
      status  : environment.RATING_STATUS.DONE
    };

    this.ratingService.getRatingsCount({condition: condition}).subscribe(async data => {
      if (data.status === 200) {
          if (data.data) {
            this.ratingCount = data.data;
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

  numToArrConverter(i: number) {
    return new Array(i);
  }


  getSpecialty(specialties) {
    const specialty = specialties.ids.map( val => {
                                     return ( !this.otherText.includes(val.specialty.toLowerCase()) ) ? val.specialty : specialties.other;
                                  });
    return specialty.join(', ');
    // ---------- specialty
  }

  getCertificateTypeList() {
    this.certificateTypeService.getCertificateTypeList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.certificateTypeList = data.data;
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  showSelectedCertificate(typeId) {
    const certificateName = [];
    this.staffProfileInfo.certifications.map( certificate => {
      if ( certificate.certificateType === typeId ) {
        certificateName.push(certificate.certificate);
      }
    });
    return certificateName;
    // return certificateName.join(', ');
  }

  getSkillType() {
    this.skillTypeService.getSkillTypeList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.skillTypeList = data.data;
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  showSelectedSkill(type) {
    const skillName = [];
    this.address.skill.ids.map( skill => {
      if ( skill.skillType === type._id ) {
        if ( this.otherText.includes(skill.skill.toLowerCase()) && type.skillType.toLowerCase() === 'clinical') {
          skillName.push(this.address.skill.clinicalOther);
        } else if ( this.otherText.includes(skill.skill.toLowerCase()) && type.skillType.toLowerCase() === 'administration') {
          skillName.push(this.address.skill.administrationOther);
        } else if ( this.otherText.includes(skill.skill.toLowerCase()) && type.skillType.toLowerCase() === 'softwares') {
          skillName.push(this.address.skill.softwaresOther);
        } else {
          skillName.push(skill.skill);
        }
      }
    });
    return skillName;
  }
/*   showSelectedSkill(type) {
    const skillName = [];
    this.staffProfileInfo.skill.ids.map( skill => {
      if ( skill.skillType === type._id ) {
        if ( this.otherText.includes(skill.skill.toLowerCase()) && type.skillType.toLowerCase() === 'clinical') {
          skillName.push(this.staffProfileInfo.skill.clinicalOther);
        } else if ( this.otherText.includes(skill.skill.toLowerCase()) && type.skillType.toLowerCase() === 'administration') {
          skillName.push(this.staffProfileInfo.skill.administrationOther);
        } else if ( this.otherText.includes(skill.skill.toLowerCase()) && type.skillType.toLowerCase() === 'softwares') {
          skillName.push(this.staffProfileInfo.skill.softwaresOther);
        } else {
          skillName.push(skill.skill);
        }
      }
    });
    return skillName;
  } */

  //Invite staff flow

  showInviteOfferModal(staff: any) {
    //this.currentStaffId = staff.favoriteId._id;
    //this.staffProfileInfo = staff.favoriteId;
    //console.log(staff);
    //console.log(this.staffProfileInfo);
    this.getSendJobOfferIds();
 }

 
 getPosition(){
  const condition ={
   _id: this.staffProfileInfo.positionType
  }
   this.positionTypeService.getPositionType({condition}).subscribe(
     data => {
       if (data.status === 200) {
          this.positionTypeName = data.data[0].name;
          }
        })
 }

 getCancellation(){
   const condition = {
    staffId :  this.staffProfileInfo._id,
   }
  this.offerService.getAllCancelledOffers(condition).subscribe(
    data => {
      if(data.status == 200){
        this.cancelledContract = data.data;
      }
    });
 }

 fetchRoute(){
  this.globalService.previousRoute = this.routes.url;
}

}
