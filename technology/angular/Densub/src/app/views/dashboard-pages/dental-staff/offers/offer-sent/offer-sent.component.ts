import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { currentUser } from '../../../../../layouts/home-layout/user.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Router, ActivatedRoute } from '@angular/router';
import { Offer } from '../../../../../shared-ui/modal/offer.modal';
import { Notification } from '../../../../../shared-ui/modal/notification.modal';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { JobNewPost } from '../../../../../shared-ui/modal/job.modal';
import { JobsService } from '../../../../dashboard-pages/dental-practice/jobs/job-posts/jobs.service';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { OfferService } from '../../../../../shared-ui/service/offer.service';
import { OfferFilter } from '../offer-filter';
import { AddressService } from '../../../../../shared-ui/service/address.service';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';
import { savedFilters } from '../../../../../shared-ui/global/allFilters';
import { PaymentCardService } from '../../../../../shared-ui/service/paymentCard.service';
import { StripeService } from '../../../../../shared-ui/service/stripe.service';
import { PaymentDetails } from '../../../../../shared-ui/modal/payment.modal';
import { PaymentService } from '../../../../../shared-ui/service/payment.service';
import * as moment from 'moment';
import { NgxCarousel } from 'ngx-carousel';
import { RatingService } from '../../../../../shared-ui/service/rating.service';
import { UsersService } from '../../../../../shared-ui/service/users.service';
import { differenceInCalendarDays, startOfDay } from 'date-fns';

@Component({
  selector: 'app-offer-sent',
  templateUrl: './offer-sent.component.html',
  styleUrls: ['./offer-sent.component.scss']
})
export class OfferSentComponent implements OnInit {
  offerViewLink = '#/staff/offer-details';
  @ViewChild('declineJobModal', { static: false })
  public declineJobModal: ModalDirective;
  @ViewChild('offerJobModal1', { static: false })
  public offerJobModal1: ModalDirective;
  @ViewChild('messageFromStaff', { static: false }) messageFromStaff: ModalDirective;
  offerList = [];
  public isCollapsed = false;
  jobDetails;
  declineStaffList: any = [];
  offerDetails: any = new Offer();
  contractDetail: any = new Offer();
  notification: any = new Notification();
  paymentDetails: any = new PaymentDetails();
  address;

  // jobDetail: any = new JobNewPost();
  reverse = false;
  itemsPerPage = 10;
  totalItem = 0;
  p = 1;
  jobLabel: any = environment.JOB_LABEL;
  jobTypes = environment.JOB_TYPE;
  declinedMessage = '';
  practicesIds: any = [];
  jobsCounts = 0;
  hiredCounts = 0;
  jobIds: any = [];
  offerStatus = environment.OFFER_STATUS_NEW;
  currentUser: currentUser = new currentUser;
  dataFilter: OfferFilter = new OfferFilter();
  setDataFilter: any;
  datePickerConfig: any = {
    allowMultiSelect: false,
    disableKeypress: true,
    // min: moment(new Date()).format('MMM DD,YYYY'),
    format: 'MMM DD,YYYY'
  };

  sendOffer = {
    amount: 0 ,
    message: '',
    startTime: '',
    endTime: ''
  };
  ratingCount: Number = 0;
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
  messageModalDetails = '';
  timeModalDetails: any;
  offerDecline: any = { reason: '', declineTime: '', cancelBy: '' };
  @ViewChild('viewInvitationDeclinedModal', { static: false }) public viewInvitationDeclinedModal: ModalDirective;
  public carouselOne: NgxCarousel;
  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private jwtService: JwtService,
    private offerService: OfferService,
    private firebaseService: FirebaseService,
    private router: Router,
    private globalService: GlobalService,
    private jobsService: JobsService,
    private PaymentCardService: PaymentCardService,
    private stripeService: StripeService,
    private paymentService: PaymentService,
    private addressService: AddressService,
    private ratingService: RatingService,
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    if (savedFilters.staff.offerSent) {
      this.dataFilter = savedFilters.staff.offerSent;
      this.dataFilter.jobPostId.jobDate = (this.dataFilter.jobPostId.jobDate) ?
        this.dataFilter.jobPostId.jobDate :
        (new OfferFilter()).jobPostId.jobDate;
    }
    this.getOfferList(this.p,this.itemsPerPage);

    this.carouselOne = {
      grid: {xs: 2, sm: 2, md: 2, lg: 2, all: 0},
      slide: 2,
      speed: 400,
      interval: 4000,
      point: {
        visible: false,
      },
      load: 2,
      touch: true,
      loop: false,
      custom: 'banner'
    }
  }

  public myfunc(event: Event) {
  }

  mergeAddress(){
    this.offerList.forEach(elementOffer => {
      this.practicesIds.push(elementOffer.practiceId._id);
      this.address.forEach(elementAddress => {
        if(elementOffer.practiceName._id === elementAddress._id){
          elementOffer.practiceAddress = elementAddress;
        }
      });
    });
    this.practicesIds = this.practicesIds.filter((v, i, a) => a.indexOf(v) === i); 
    this.getJobDetails();
    this.getAlloffers();
  }


  /** This method will filter user behalf criteria */
  setFilter() {
    savedFilters.staff.offerSent = this.dataFilter;
    this.setDataFilter = Object.assign({}, this.dataFilter);
  }

  /** This method will reset filter criteria*/
  resetFilter() {
    savedFilters.staff.offerSent = null;
    this.setDataFilter = this.dataFilter = new OfferFilter();
    // this.setDataFilter = { firstName: '' };
  }
  counter(i: number) {
    return new Array(i);
  }

  reCounterOfferDecline(offer){
    this.declineJobModal.show();
    this.offerDetails = offer;
    // this.getJobDetails();
  }

  reCounterOfferAccept(offer){
    this.offerJobModal1.show();
    this.getRatingsCount(offer);
    this.offerDetails = offer;
    // this.getJobDetails();
  }

  getJobDetails() {
    this.spinner.show();
    const condition = {
      draft: false,
      createdBy: {$in : this.practicesIds}
    };
    this.jobsService.getJobsWithDetails({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.jobDetails = data.data;
            this.mergeJobCountDetails();
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
      }
    );
  }

  mergeJobCountDetails(){
    this.offerList.forEach(practice => {
     this.jobsCounts = 0;
      this.jobDetails.forEach(jobDetails => {
        if(practice.practiceId._id === jobDetails.createdBy._id){
          this.jobsCounts++;
        }
      });
      practice.jobsPosted = this.jobsCounts;
    });
  }

  getAlloffers() {
    this.offerList.forEach(practice => {
      const condition = { 
        practiceId :practice.practiceId._id,
        contractStatus: { $exists: true, $ne: 'revoke' },
      };
      this.offerService.getAllOffers({ condition}).subscribe( data => {
        if (data && data.status === 200) {
           practice.hiredCounts = data.data.length;
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      })
    })
  }

  declineOffer() {
    this.spinner.show();
    // ---- For Notification
    // if (this.offerDetails.offerSteps[this.offerDetails.offerStatus]['offerBy'] ===  this.userTypes.PRACTICE) {
    //   this.practiceNotification['sentOffer'] = 1;
    // } else {
    //   this.practiceNotification['receivedOffer'] = 1;
    // }
    this.offerDetails.status = environment.OFFER_STATUS_NEW.DECLINE;
    this.offerDetails.offerDecline = {
        declineTime  : new Date(),
        reason       : this.declinedMessage,
        declineBy    : environment.USER_TYPE.STAFF
    };
    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
        if (data.status === 200) {
          this.firebaseService.updateStatusInFBDB(this.currentUser._id, this.offerDetails.practiceId._id,
            this.offerDetails.jobPostId._id);
          // this.setButtonCondition();
          this.sendNotification('finalOfferDecline',this.offerDetails._id);
          this.declineJobModal.hide();
          this.toastr.success(
            'Counter offer was declined',
            'Success'
          );
          this.router.navigate(['/job-listing']);
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

  sendNotification(type = '', offerId: number) {
    if (!type) {
      return false;
    }
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const title = this.globalService.titleCase(this.offerDetails.jobPostId.jobTitle.toString());
    const message = '';
    const currentTime = new Date().getTime();
    const notification = environment.notification;
    const id = this.offerDetails.jobPostId._id;
    this.notification = {
            senderId    : this.currentUser._id,
            receiverId  : this.offerDetails.jobPostId.createdBy,
            message     : notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
            redirectLink : notification[type].practiceLink + id,
            type : notification[type].type,
            offerId : offerId,
            jobId : id,
            staff: {sentOffer: 0 , receivedOffer : 0, contract: 0},
            practice: {sentOffer: 0 , receivedOffer : 1, contract: 0},
            createdAt: currentTime,
            updatedAt: currentTime,
            status : environment.notificationStatus.UNREAD,
            isViewedByPractice : false
    };
    
    this.firebaseService.createNotification(this.notification);
  }

  getOfferList(p,itemsPerPage) {
    this.spinner.show();
    const options = {
      p,
      itemsPerPage
    }
    const condition = {
      $or: [
      {
      status: { $in: [environment.OFFER_STATUS_NEW.OFFER, environment.OFFER_STATUS_NEW.CONTRACT, environment.OFFER_STATUS_NEW.EXPIRED, environment.OFFER_STATUS_NEW.DECLINE] },
      staffId: this.currentUser._id,
      sendOfferByPractice: false,
      // contractStatus: { $exists: false }
      },
      {
      status: { $in: [environment.OFFER_STATUS_NEW.APPLYED, environment.OFFER_STATUS_NEW.CONTRACT, environment.OFFER_STATUS_NEW.EXPIRED, environment.OFFER_STATUS_NEW.DECLINE] },
      staffId: this.currentUser._id ,
      sendOfferByPractice: true,
      // contractStatus: { $exists: false }
      },
      {
        status: { $in: [environment.OFFER_STATUS_NEW.OFFER, environment.OFFER_STATUS_NEW.CONTRACT, environment.OFFER_STATUS_NEW.EXPIRED, environment.OFFER_STATUS_NEW.DECLINE] },
        staffId: this.currentUser._id ,
        offerStatus:{ $in: [environment.OFFER_TYPE.COUNTER,environment.OFFER_TYPE.RECOUNTER ]},
        sendOfferByPractice: true,
        // contractStatus: { $exists: false }
        }
      ]
    };

    // const sort = {
    //   updatedAt: -1
    // }; , sort

    this.offerService.getAllOffers({ condition, options }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.offerList = data.data;
            this.totalItem = data.count;
            this.addStatus();
            this.getAddressListForOffer();
            this.getAllNotifications();
            this.setFilter();
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

  addStatus(){
    this.offerList.forEach(offer=>{
      if(offer.finalRate !== undefined){
        offer.practiceId.tagStatus = 'hired';
      }else if(offer.status === environment.OFFER_STATUS_NEW.DECLINE){
        offer.practiceId.tagStatus = 'declined';
      }else if(offer.status === 'offer' && offer.offerStatus === 'recounter'){
        offer.practiceId.tagStatus = 'final-offer';
      }
      else{
        offer.practiceId.tagStatus = 'applied';
      }
    })
  }

  getAddressListForOffer() {
    // const condition = { userId: element.staffId._id };
    this.addressService.getAddressWithDetails({ }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.address = data.data;
            this.mergeAddress();
          }
        } else {
          this.globalService.error();
        }
      }, error => {
        this.globalService.error();
      });
  }

  closeModel() {
    this.declineJobModal.hide();
    this.offerJobModal1.hide();
  }

  getAllNotifications() {
    const self = this;
    const notifications = this.firebaseService.getAllNotification();
    notifications.on('value', function (snapshot) {
      const values = snapshot.val();
      if (values) {
        let convertObjToArray = Object.entries(values);
        //  convertObjToArray;
        convertObjToArray.forEach((value) => {
          // -----  Count Unread Notification -------------------------------
          if (environment.notificationStatus.UNREAD === value[1]['status']) {
            const index = self.offerList.findIndex(offer => {
              return (offer._id === value[1]['offerId'] && offer.practiceId._id === value[1]['senderId']
                && offer.staffId._id === value[1]['receiverId']);
            })
            if (index > -1) {
              self.offerList[index]['updatedOffer'] = true;
            }
          }
        })
        /* ------------------------------------------------------------ */
      }
    });
  }

  capitalizeWords(text){
    return text.replace(/(?:^|\s)\S/g,(res)=>{ return res.toUpperCase();})
  };

  getStatus(currentOffer) {
    if(currentOffer.finalRate != undefined && currentOffer.finalRate > -1){
      return '<span class="badge badge-success">Hired</span>';
    }
    else if (currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE) {
      return '<span class="badge badge-danger">Declined by '+ this.capitalizeWords(currentOffer.offerDecline.declineBy)+'</span>';
    }
    //  else if (currentOffer.jobPostId.status === environment.OFFER_STATUS_NEW.EXPIRED) {
    //   return '<span class="badge badge-secondary">Job is no longer available</span>';
    // }
    else if(currentOffer.contractStatus == 'cancelled'){
      const result = currentOffer.cancelContract.cancelBy =='staff' ? 'Cancelled By Staff':' Cancelled By Practice'
      return '<span class="badge badge-danger">'+ result +'</span>';
    } else {
      if(currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL && (currentOffer.status === environment.OFFER_STATUS_NEW.APPLYED || currentOffer.status === environment.OFFER_STATUS_NEW.CONTRACT )){
        return '<span class="badge badge-primary">Applied</span>';
      }
      if ((currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER || currentOffer.offerStatus === environment.OFFER_TYPE.COUNTER) &&  currentOffer.status === environment.OFFER_STATUS_NEW.CONTRACT) {
        return '<span class="badge badge-primary">Applied</span>';
      }
      if (currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL) {
        return '<span class="badge badge-primary">Applied</span>';
      } else if (currentOffer.offerStatus === environment.OFFER_TYPE.COUNTER) {
        return '<span class="badge badge-primary"><span class="fa fa-exchange mr-2 clr-orange"></span>Applied</span>';
      }else if (currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER) {
        return '<span class="badge badge-primary final-offer"><span class="fa fa-exchange mr-2 clr-orange"></span>Final offer received</span>';
      }
       else {
        return '<span class="badge badge-warning">Waiting for Approval</span>';
      }
    }
  }

  getConditionStatus(currentOffer) {
     if (currentOffer.jobPostId.status === environment.OFFER_STATUS_NEW.EXPIRED) {
      return '<span class="badge badge-secondary">Job is no longer available</span>';
    }
    else if(currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL && currentOffer.status === environment.OFFER_STATUS_NEW.APPLYED){
      return '<span class="badge badge-primary">Awaiting approval by practice</span>';
    }
    else if (currentOffer.offerStatus === environment.OFFER_TYPE.COUNTER && currentOffer.status === environment.OFFER_STATUS_NEW.OFFER) {
      return '<span class="badge badge-primary">Awaiting approval by practice</span>';
    }
    else if (currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER && currentOffer.status === environment.OFFER_STATUS_NEW.OFFER) {
      return '<span class="badge badge-primary">Awaiting your response </span>';
    }

  }

  acceptReCounterOffer() {
     //Get card from DB
     this.spinner.show();
     let stripeCustomerId:any;
    const email = this.offerDetails.practiceId.email;
    this.PaymentCardService.getPaymentCardDetail({ email }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            //if card info found
              const postObject = {
                cardId: data.data[0].cardId,
                customerId: data.data[0].customerId,
              };
              let postObjectNew = {};

              this.stripeService.retrieveCard(postObject).subscribe(
                async data => {
                  if (data['status'] === 200) {
                    //createCharge(); 
                    const currntYear  = new Date().getFullYear();
                    const currntMounth =  new Date().getMonth() + 1;
                    stripeCustomerId = data.data.customer;
                    // if(data.data.exp_year <= currntYear && currntMounth <= data.data.exp_month){
                    //   this.toastr.warning('You can not enter more then 1000 characters.', 'Warning' );
                    //   return 0;
                    // } 


                    // this.stripeService.createSource(postObjectForCreateSource).subscribe(
                    //   async data => {
                        postObjectNew = {
                          customer:stripeCustomerId,
                        };
                         
                        // For workDiary payment
                        const workdiaryAmount = this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount;
                        let amount = this.globalService.stripeTotalAmt(workdiaryAmount);
                       
                          // if (this.offerDetails.staffId.stripeId) {
                          //   postObjectNew['destination'] = this.offerDetails.staffId.stripeId;
                          // } else {
                          //   this.toastr.success('Please Check Connection.', 'Success');
                          //   return 0;
                          // }
                          postObjectNew['amount'] = amount;

                          this.stripeService.createAutoCharge(postObjectNew).subscribe(
                            async data => {
                              if (data['status'] === 200) {
                                this.paymentDetails.payerUserId = this.offerDetails.practiceId._id;
                                this.paymentDetails.transactionId = data['data']['balance_transaction'];
                                this.paymentDetails.amount = (data['data']['amount']) / 100;
                                this.paymentDetails.mode = data['data']['source.type '];
                                this.paymentDetails.status = data['data']['status'];
                                this.paymentDetails.destination = data['data']['transfer_data']['destination'];
                                this.paymentDetails.receiptURL = data['data']['receipt_url'];
                                this.paymentDetails.jobPostId = this.offerDetails.jobPostId._id;
                                
                                
                                this.paymentDetails.actionStatus = environment.PAYMENT_STATUS_TYPE.CONTRACT;
                                await this.addPaymentDetails();
                                //this.router.navigate(['staff/assignments/details',this.offerDetails._id]);
                                //this.openJobList();
                                //this.router.navigate(['job-details',this.offerDetails.jobPostId._id]);
                              }else if(data['status'] === 500){
                                this.toastr.warning('Sorry, We apologize for any inconvenience, Densub was not able to process this transaction due to practice’s account status. We have notified the practice of the issue. Once the practice has corrected the issue, this position may be reposted.','warning');
                                const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
                                const title = this.globalService.titleCase(this.offerDetails.jobPostId.jobTitle.toString());
                                const message = '';
                                const type = 'decline';
                                const currentTime = new Date().getTime();
                                const notification = environment.notification;
                                const id = this.offerDetails.jobPostId._id;
                                this.notification = {
                                        senderId    : this.currentUser._id,
                                        receiverId  : this.offerDetails.jobPostId.createdBy,
                                        message     : 'The applicant was not able to accept your counter offer because your credit card was not able to be processed. Please check and update your credit card information',
                                        redirectLink : notification[type].practiceLink + id,
                                        type : notification[type].type,
                                        offerId : this.offerDetails._id,
                                        jobId : id,
                                        staff: {sentOffer: 0 , receivedOffer : 0, contract: 0},
                                        practice: {sentOffer: 0 , receivedOffer : 1, contract: 0},
                                        createdAt: currentTime,
                                        updatedAt: currentTime,
                                        status : environment.notificationStatus.UNREAD,
                                        isViewedByPractice : false
                                       };
                                      console.log(this.notification)
                                      this.firebaseService.createNotification(this.notification);
                                      this.spinner.hide();
                              }
                              //this.spinner.hide();
                            }
                          );
                
                     // });
                    
                    //end
                    //this.toastr.success('Payment has been made.', 'Success');
                  }
                  //this.spinner.hide();
                }
              );
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

  addPaymentDetails() {
    this.paymentService.savePaymentDetails(this.paymentDetails).subscribe(async data => {
      if (data.status === 200) {        
          this.offerDetails['paymentId'] = data.data._id;
          this.offerDetails.contractStatus = this.offerDetails.INPROGRESS;
          
          //save final offer data
          const isofferType="final";
          this.offerDetails.offerSteps[isofferType].message = this.sendOffer.message;
          this.offerDetails.offerSteps[isofferType].amount =  this.sendOffer.amount;
          this.offerDetails.offerSteps[isofferType].startTime =  this.sendOffer.startTime;
          this.offerDetails.offerSteps[isofferType].endTime =  this.sendOffer.endTime;
          this.offerDetails.offerSteps[isofferType].offerTime =  new Date();
          this.offerDetails.offerSteps[isofferType].offerBy =  environment.USER_TYPE.PRACTICE;

          const updateDetails = {
            status: this.offerStatus.CONTRACT,
            contractStatus: environment.CONTRACT_STATUS.UPCOMING,
            finalRate: this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount,
            isApplyied:true,
            offerSteps:this.offerDetails.offerSteps,
            contractStartTime : new Date()
          };
          const condition = {
            _id: this.offerDetails._id,
            jobPostId: this.offerDetails.jobPostId._id
          };
          
          this.offerService.updateMultipleOffer({ condition, updateDetails }).subscribe(
            data => {
              if (data.status === 200) {
                const newJob = {
                  _id: this.offerDetails.jobPostId._id,
                  status: environment.JOB_STATUS.FILLED            
                };
                this.changeJobStatus(newJob);
                this.router.navigate(['staff/assignments/details',this.offerDetails._id]);
                this.closeModel();
                this.spinner.hide();
                // this.toastr.success('Offer accepted successfully.', 'Success');
                const condition1 = {
                  _id: { $ne: this.offerDetails._id },
                  jobPostId: this.offerDetails.jobPostId._id,
                  $or: [
                    { status: this.offerStatus.OFFER },
                    { status: this.offerStatus.CONTRACT },
                    { status: this.offerStatus.APPLYED}
                  ],
                };
                    this.offerService.getAllOffers({ condition1 }).subscribe(
                      data => {
                        if (data.status === 200) {
                          if (data.data.length > 0) {
                            this.declineStaffList = data.data;
                          }
                          //this.contractDetail = this.offerDetails;
                          this.declineOtherOffers(this.offerDetails);
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

  changeJobStatus(newJob) {
    this.jobsService.saveJob(newJob).subscribe(
      data => {
        if (data.status === 200) {
          // this.showButtonCond.acceptOffer = false;
          // this.showButtonCond.declineOffer = false;
          // this.staffNotification['contract'] = 1;
          this.sendNotification('finalOffer',0);
          this.toastr.success('Offer has been accepted successfully.', 'Success');
          this.spinner.hide();
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

  declineOtherOffers(offerDetails) {
    const offerDecline = {
      reason: 'Due to the job was filled',
      declineTime: moment().toISOString(),
      declineBy: environment.USER_TYPE.PRACTICE,
    };
    this.contractDetail = offerDetails;
    const updateDetails = {
      status: this.offerStatus.DECLINE,
      offerDecline: offerDecline
    };
    const condition = {
      _id: { $ne: this.contractDetail._id },
      $or: [
        { status: this.offerStatus.OFFER },
        { status: this.offerStatus.CONTRACT },
        { status: this.offerStatus.APPLYED },
      ],
      jobPostId: this.contractDetail.jobPostId._id
    };
    this.offerService.updateMultipleOffer({ condition, updateDetails }).subscribe(
      data => {
        if (data.status === 200) {
          this.sendDeclinedNotification('autodecline', offerDecline.reason);
          // this.common.incDecUsersCount(this.contractDetail.practiceId, 'staffHired', true);
          // this.common.incDecUsersCount(this.contractDetail.staffId, 'jobs', true);
         // this.updateOfferStatus('Contract has been activated.', 'activateContract');
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
        redirectLink: notification[type].staffLink,
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

  tempStr: any = '';
  onEditorChange() {
    this.tempStr = this.offerDetails.offerSteps.initial.message;
    if ((this.tempStr === null) || (this.tempStr === '')) {
      this.tempStr = this.tempStr.replace( '&nbsp;', '');
      return true;
    } else {
      this.tempStr = this.tempStr.toString();
      this.tempStr = this.tempStr.replace( /(<([^>]+)>)/ig, '');
      this.tempStr = this.tempStr.replace( '&nbsp;', '');
      if (this.tempStr.length > 1000 ) {
        this.toastr.warning('You can not enter more then 1000 characters.', 'Warning' );
        this.tempStr = this.tempStr.slice(0, 1000);
        this.offerDetails.offerSteps.initial.message = this.tempStr;
        return false;
      }
    }
  }

  viewReason(offer){
    this.offerDecline = offer.offerDecline;
    this.viewInvitationDeclinedModal.show();
  }
  
  messageFromStaffs(message, time=null){
    this.messageModalDetails = message;
    this.timeModalDetails = time;
    this.messageFromStaff.show();
  }

  getPage(page:number){
    this.p = page;
    this.getOfferList(this.p, this.itemsPerPage);
  }

  openJobList(){
    this.jobsService.showLeftMenuForJobs = false;
    this.jobsService.fetchRoute = this.router.url;
  }

  numToArrConverter(i: number) {
    return new Array(i);
  }  

  getRatingsCount(offer) {
    var condition = {
      practiceId : {$eq : offer.practiceId._id},
      ratedBy : {$eq : environment.USER_TYPE.STAFF},
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
}
