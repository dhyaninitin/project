import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { currentUser } from '../../../../layouts/home-layout/user.model';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { environment } from '../../../../../environments/environment';
import { FavoriteService } from '../../../../shared-ui/service/favorite.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UsersService } from '../../../../shared-ui/service/users.service';
import { JobsService } from '../jobs/job-posts/jobs.service';
import { FirebaseService } from '../../../../shared-ui/service/firebase.service';
import { Notification } from '../../../../shared-ui/modal/notification.modal';
import { InviteOfferService } from '../../../../shared-ui/service/inviteOffer.service';
import { InviteOffer } from '../../../../shared-ui/modal/inviteOffer.modal';
import { OfferService } from '../../../../shared-ui//service/offer.service';
import { Offer } from '../../../../shared-ui/modal/offer.modal';
import { Common } from '../../../../shared-ui/service/common.service';
import { Router } from '@angular/router';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { PositionTypeService } from '../../../../shared-ui/service/positionType.service';
import * as moment from 'moment';

@Component({
  selector: 'app-staff-favourite',
  templateUrl: './staff-favourite.component.html',
  styleUrls: ['./staff-favourite.component.scss']
})
export class StaffFavouriteComponent implements OnInit {
  @ViewChild('sendInviteOfferModal', { static: false })
  public sendInviteOfferModal: ModalDirective;
  currentUser: currentUser = new currentUser();
  favoriteList: any = [];
  staffList: any = [];
  jobList: any = [];
  invitationList: any = [];
  jobPostId: any = '';
  reverse = false;
  itemsPerPage = 10;
  notification: any = new Notification();
  // selectJobValid = false;
  paymentMethod: any = environment.PAYEMENT_METHOD;

  inviteOfferDetails: InviteOffer = new InviteOffer();
  previousJobList: any = [];
  selOfferInvite: any = [];
  dropdownSettings2: any = {};
  currentStaffId: String = '';
  staffProfileInfo: any;
  staffDetails: any;
  sendOfferList: any = [];
  selectedJobList: any = [];
  tempAllRecipientValues: any = [];
  jobOfferIds: any = [];
  positionTypeName: any = '';


  constructor(
    private favoriteService: FavoriteService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private jobsService: JobsService,
    private jwtService: JwtService,
    private inviteOfferService: InviteOfferService,
    private firebaseService: FirebaseService,
    private offerService: OfferService,
    private globalService: GlobalService,
    private common : Common,
    private router : Router,
    private usersService: UsersService,
    private positionTypeService: PositionTypeService,
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
  }

  ngOnInit() {
    this.getAllMessageRecipients(); // !!! GET THE MESSAGE RECIPIENTS FROM FIREBASE DB !!!
    this.getFavoriteList();
    this.dropdownSettings2 = {
      singleSelection: false,
      idField: '_id',
      textField: 'jobTitle',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 1,
      closeDropDownOnSelection: false
    };
  }



  getFavoriteList() {
    this.spinner.show();
    const condition = {
      userId: this.currentUser._id,
      type: environment.FAVORITE_TYPE.STAFF
    };
    this.favoriteService.getFavorite({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          data.data.forEach(element => {
            // console.log(element.favoriteId._id);
            const condition = {
              _id: element.favoriteId._id,
              userType: environment.USER_TYPE.STAFF                
            };
            //get user info for expriri
            this.usersService.getUserInfoWithDetails(condition).subscribe(
                data => {
                  if (data.status === 200) {
                    element.staffInfo = data.data;
                    this.favoriteList.push(element);
                  }
                });
            if(element.favoriteId.positionType){
                let condition = {
                  _id: element.favoriteId.positionType
                };
                this.positionTypeService.getPositionType({condition}).subscribe(
                    data => {
                      if (data.status === 200) {
                        element.favoriteId.positionType = data.data[0].name;
                      }
                      this.spinner.hide();
                    },
                    error => {
                      this.globalService.error();
                    }
                  );
            }else{
              element.favoriteId.positionName = '';
            }

          });
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

  numToArrConverter(i: number) {
    return new Array(i);
  }

  showInviteOfferModal(staff: any) {
    this.staffDetails = staff.staffInfo;
    this.positionTypeName = staff.favoriteId.positionType;
     this.currentStaffId = staff.favoriteId._id;
     this.staffProfileInfo = staff.favoriteId;
     console.log(this.currentStaffId);
     console.log(this.staffProfileInfo);
     
     this.getSendJobOfferIds();
    //  this.getPreviousInviteOffer();
  }

  getSendJobOfferIds() {
    const condition = {
      staffId : this.staffProfileInfo._id,
    };
    console.log(condition);
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

  closeModel() {
    this.closeInvite();
    this.sendInviteOfferModal.hide();
  }

  closeInvite(){
    this.selOfferInvite = [];
  }

  getPreviousInviteOffer() {
    const condition = {
      sendOfferId : this.currentUser._id,
      receiveOfferId : this.currentStaffId
    };
    this.previousJobList = [];
    this.inviteOfferService.getInviteOffers({condition}).subscribe( async data =>{
      if(data.status === 200) {
        if(data.data.length > 0) {
          const self = this;
          await data.data.forEach( (offer, index) => {
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
       status : environment.JOB_STATUS.OPEN,
       _id : {'$nin' : this.previousJobList },
      draft: false,
      createdBy: this.jwtService.currentLoggedUserInfo._id
    };

    this.jobsService.getJobs({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          this.jobList = data.data;
          this.filterJobs();
          this.sendInviteOfferModal.show();
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
    this.inviteOfferDetails.receiveOfferId = [this.currentStaffId];
    this.inviteOfferService.sendInviteOffer(this.inviteOfferDetails).subscribe(
      data => {
        if (data.status === 200) {
          this.toastr.success('Invitation has been sent successfully.', 'Success');
          const self = this;
          this.jobList = this.jobList.filter( value => {
                    if(self.inviteOfferDetails.jobPostId.indexOf(value._id) === -1){
                      return true;
                    } else {
                      self.selectedJobList.push(value);
                      return false;
                    }
          });
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
      offerDetails.practiceName = this.inviteOfferDetails.jobPostId[i].practiceName;
      offerDetails.offerSteps.initial.startTime = this.selectedJobList[i].startTime;
      offerDetails.offerSteps.initial.endTime = this.selectedJobList[i].endTime;
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
        if(this.sendOfferList.length > 0){
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

  showStaffProfile(id) {
    this.router.navigate(['/staff-profile/',id]);
  }

//  async sendNotification() {
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
          redirectLink : notification[type].staffLink + id,
          type : notification[type].type,
          offerId : id,
          jobId : jobId,
          staff: {sentOffer: 0 , receivedOffer : 1, contract: 0 },
          practice: {sentOffer: 0 , receivedOffer : 0, contract: 0},
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
    this.closeInvite();
  }
  removeFavorite(favStaffDetail , index) {
    this.spinner.show();
    this.favoriteService.removeFavorite({ _id: favStaffDetail._id }).subscribe(
        data => {
          if (data.status === 200) {
            this.favoriteList.splice(index, 1);
            this.toastr.success('Staff has been removed.', 'Success');
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

  fetchRoute(){
    this.globalService.previousRoute = this.router.url;
  }
}
