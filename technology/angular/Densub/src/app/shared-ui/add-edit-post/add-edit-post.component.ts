import { Component, OnInit, ViewChild, Output, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalDirective } from 'ngx-bootstrap';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { IPayPalConfig } from 'ngx-paypal';
import { StripeSource } from 'stripe-angular';
import { Location } from '@angular/common';

import { GlobalService } from '../service/global.service';
import { environment } from '../../../environments/environment';
import { JobNewPost } from '../modal/job.modal';
import { PaymentDetails } from '../modal/payment.modal';
import { AlertService } from '../alert/alert.service';
import { JwtService } from '../service/jwt.service';
import { SkillsService } from '../../views/dashboard-pages/admin/skills/skills/skills.service';
import { JobsService } from '../../views/dashboard-pages/dental-practice/jobs/job-posts/jobs.service';
import { PaymentCardService } from '../../shared-ui/service/paymentCard.service';
import { FavoriteService } from '../service/favorite.service';
import { currentUser } from '../../layouts/home-layout/user.model';
import { UsersService } from '../service/users.service';
import { InviteOffer } from '../modal/inviteOffer.modal';
import { Notification } from '../modal/notification.modal';
import { FirebaseService } from '../service/firebase.service';
import { PaymentService } from '../service/payment.service';
import { StripeService } from '../service/stripe.service';
import { InviteOfferService } from '../service/inviteOffer.service';
import { OfferService } from '../service/offer.service';
import { Offer } from '../modal/offer.modal';
import { Common } from '../service/common.service';
import { PromoCodeService } from '../service/promoCode.service';
import { AddressService } from '../service/address.service';
import { CertificateService } from '../../views/dashboard-pages/admin/certificates/certificates/certificates.service';
import { CertificateTypeService } from '../../views/dashboard-pages/admin/certificates/certificate-type/certificate-type.service';
import { SpecialtyService } from '../../views/dashboard-pages/admin/specialties/specialties.service';
import { CertificateType } from '../../views/dashboard-pages/admin/certificates/certificate-type/certificate-type.modal';
import { PositionTypeService } from '../service/positionType.service';
import { endOfDay, startOfDay } from 'date-fns';
import { LabelType, Options } from 'ng5-slider';
import { SkillTypeService } from '../../views/dashboard-pages/admin/skills/skill-type/skill-type.service';

@Component({
  selector: 'app-add-edit-post',
  templateUrl: './add-edit-post.component.html',
  styleUrls: ['./add-edit-post.component.scss'],
})

export class AddEditPostComponent implements OnInit {
  @ViewChild('staffOfferModal', { static: false }) public staffOfferModal: ModalDirective;
  @ViewChild('stripeModal', { static: false }) public stripeModal: ModalDirective;
  @ViewChild('cancelModal', { static: false }) public cancelModal: ModalDirective;
  date = new Date('21 July 1947 14:48 UTC');
  options: Options = {
    floor: startOfDay(new Date(this.date.getTime() + this.date.getTimezoneOffset() * 60000)).getTime(),
    ceil: endOfDay(new Date(this.date.getTime() + this.date.getTimezoneOffset() * 60000)).getTime(),
    step: 900000,
    translate: (value: number, label: LabelType): string => {
      return moment(value).format('hh:mm A'); // this will translate label to time stamp.
    }
  };
  @Output() dismiss = new EventEmitter();
  closeResult: string;
  confirmModal: NgbModalRef;
  confirmModal2: NgbModalRef;
  enabled: Boolean = true;
  tabType: any = environment.JOB_TYPE.TEMPORARY;
  jobTypes: any = environment.JOB_TYPE;
  jobStatus: any = environment.JOB_STATUS;
  baseUrl: any = environment.baseUrl;
  experienceData: any = environment.JOB_EXPERIENCE;
  selectedDate: any;
  jobVisibility: any = environment.JOB_VISIBILITY;
  paymentMethod: any = environment.PAYEMENT_METHOD;
  promoCodeStatus: any = environment.PROMO_CODE_STATUS;
  // salaryRate = 0;
  offerStatus = environment.OFFER_STATUS_NEW;
  newJob: JobNewPost = new JobNewPost();
  previousNewJob: JobNewPost = new JobNewPost();
  inviteOfferDetails: InviteOffer = new InviteOffer();
  selOfferInvite: any = [];
  payementDetails: PaymentDetails = new PaymentDetails();
  PositionTypeData: any = [];
  requiredSection: boolean = false;
  firstSection: boolean = false;
  // jobStatusData: any = [];
  checkSelectedDays: Boolean = true;
  modalType = {
    add: false,
    edit: false,
    draft: false,
    repost: false
  };
  // @ViewChild('confirmJobPostModal', { static: false })
  // public confirmJobPostModal: ModalDirective;
  // @ViewChild('deleteJobModal', { static: false })
  // public deleteJobModal: ModalDirective;
  // editorConfig: any = {
  //   editable: true,
  //   spellcheck: true,
  //   height: '200px',
  //   // width: '200px',
  //   translate: 'yes',
  //   enableToolbar: true,
  //   showToolbar: true,
  //   toolbar: [['bold', 'italic', 'underline', 'orderedList', 'unorderedList']]
  // };
  datePickerConfig: any = {
    allowMultiSelect: true,
    disableKeypress: true,
    min: moment(new Date()).format('MMM DD,YYYY'),
    format: 'MMM DD,YYYY'
  };
  datePickerConfig2: any = {
    disableKeypress: true,
    min: moment(new Date()).format('MMM DD,YYYY'),
    format: 'MMM DD,YYYY'
  };
  dropdownSettings: any = {};
  dropdownSettings2: any = {};
  closeDropdownSelection = false;
  disabled = false;
  preferredSkillsList: any = [];
  requiredSkillsList: any = [];
  jobList: any = [];
  order = 'jobDate';
  reverse = false;
  itemsPerPage = 10;
  /* Paid Amount for permanent */
  monthlyCharges = 50;
  // showPaidAmount = 50;
  /** Here is define common field validation fields for job post */
  requiredValidate: any = {
    jobTitle: '',
    positionType: '',
    jobType: '',
    experience: '',
    description: '',
    // skills: '',
    visibility: '',
    startTime: '',
    endTime: ''
  };
  redirectUrl: String;
  editJobLocation: String = '';
  /* temporaryAdd: any = ['jobDates', 'startTime', 'endTime'];
  temporaryEdit: any = ['jobDate', 'startTime', 'endTime'];
  permanentFullTime: any = ['jobDate', 'activeMonth'];
  permanentPartTime: any = ['jobDate', 'startTime', 'endTime', 'activeMonth']; */
  allDaysAvailable = true;
  temporaryAddValidate: any = ['jobDates', 'desiredHourlyRate'];
  temporaryEditValidate: any = ['jobDate', 'desiredHourlyRate'];
  permanentFullTimeValidate: any = ['jobDate', 'activeMonth', 'paymentMethod'];
  permanentPartTimeValidate: any = ['jobDate', 'activeMonth', 'paymentMethod'];
  addPromoCode = 0;
  promoCode: String = '';
  promoCodeDetails: any = {
    isApplied: false,
    status: '',
    code: '',
    discount: 0,
    usedUserIds: [],
  };
  jobPostingFee: any = {
    total: 0,
    discountAmt: 0,
  };
  public payPalConfig?: IPayPalConfig;
  favoriteList: any = [];
  currentUser: currentUser = new currentUser;
  staffList: any = [];
  notification: any = new Notification();
  paymentDetails: any = new PaymentDetails();
  previousStaffList: any = [];
  declineStaffList: any = [];
  sendOfferList: any = [];
  savedList = [];
  // userDetails: any = new Users();
  adminId: any;
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
  tempAllRecipientValues: any = [];
  selectedSkills: any[];
  address: any;
  addEditSkillsModal: any;
  paymentCardExists: boolean = false
  addressList: any = [];
  addressDetails: any = [];
  preferredSpecialtyList: any = [];
  requiredSpecialtyList: any = [];
  certificateTypeList: CertificateType[] = [];
  preferredCertificateList: any = [];
  requiredCertificateList: any = [];
  positionType: any = [];
  positionTypeId: String = '';
  showAccordian = [true,false,false];
  signOnBonus: boolean = false;
  flag = 0;
  benefitsList = [
    {_id:0, benefits:'Sign On Bonus'},
    {_id:1, benefits:'Dental Plan'},
    {_id:2, benefits:'Retirement/401K/ Profit Sharing'},
    {_id:3, benefits:'Health Insurance'},
    {_id:4, benefits:'PTO'},
    {_id:5, benefits:'Associate Partnership Opportunity'},
    {_id:6, benefits:'Associate Buyout Opportunity'},
    {_id:7, benefits:'Vacations'},
    {_id:8, benefits:'Sick Days'},
    {_id:9, benefits:'Relocation Assistance'},
    {_id:10, benefits:'Continuing Education'},
    {_id:11, benefits:'Uniform Allowance'},
    {_id:12, benefits: 'Remote Work'}
  ];
  otherLanguages = [
    {_id:0, language:'Arabic' },
    {_id:1, language:'Chinese' },
    {_id:2, language:'Farsi' },
    {_id:3, language:'French' },
    {_id:4, language:'German' },
    {_id:5, language:'Hebrew' },
    {_id:6, language:'Hindi' },
    {_id:7, language:'Italian' },
    {_id:8, language:'Korean' },
    {_id:9, language:'Polish' },
    {_id:10, language:'Russian' },
    {_id:11, language:'Spanish' },
    {_id:12, language:'Tagalog' },
    {_id:13, language:'Vietnamese' },
  ]
  payCycleData = ['Weekly', 'Bi-Weekly', 'Semi-Monthly','Monthly'];
  practiceName: any;
  specialty: any =[];
  skills: any = [];
  certificates: any = [];
  skillsTypeList: any = [];
  userInfo: any = [];
  pastTime: boolean = false;
  sameTime: boolean = false;
  title: string = 'Rate Per Hour';
  val: Number = this.newJob.desiredHourlyRate;
  notifyJobDate: any;
  isDraft: boolean = false;

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  constructor(
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private alertService: AlertService,
    private jwtService: JwtService,
    private favoriteService: FavoriteService,
    private inviteOfferService: InviteOfferService,
    private skillsService: SkillsService,
    private skillsTypeService: SkillTypeService,
    private jobsService: JobsService,
    private readonly activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private router: Router,
    private firebaseService: FirebaseService,
    private paymentService: PaymentService,
    private stripeService: StripeService,
    private offerService: OfferService,
    private common: Common,
    private usersService: UsersService,
    private promoCodeService: PromoCodeService,
    private PaymentCardService: PaymentCardService,
    private addressService: AddressService,
    private certificateService: CertificateService,
    private certificateTypeService: CertificateTypeService,
    private specialtyService: SpecialtyService,
    private positionTypeService: PositionTypeService,
    private _cdr: ChangeDetectorRef
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    this.globalService.topscroll();
    this.setOrder('jobDate');
  }

  ngOnInit() {
    this.getAllMessageRecipients(); // !!! GET THE MESSAGE RECIPIENTS FROM FIREBASE DB !!!
    //this. getFavoriteList();
    this.getSkillsType();
    this.getUserAddresses();
    this.getCurrentUserDetails();
    // this.getStaffList();
    this.getAdminInfo();
    this.dropdownSettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'skill',
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      itemsShowLimit: 1,
      closeDropDownOnSelection: this.closeDropdownSelection
    };
    this.dropdownSettings2 = {
      singleSelection: false,
      idField: '_id',
      textField: 'fullName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 1,
      closeDropDownOnSelection: this.closeDropdownSelection
    };
    this.PositionTypeData = this.globalService.positionTypeData;
    // this.jobStatusData = this.globalService.jobStatusData;
    // this.experienceData = this.globalService.experienceData;
    let customer = JSON.parse(localStorage.getItem('currentUser'));
    this.getPaymentCardDetail(customer.email);
  }

  getCurrentUserDetails(){
    const condition = {
      _id : this.currentUser._id
    }
    this.usersService.getUserInfo(condition).subscribe(data => {
      if(data.status == 200){
        this.userInfo = data.data;
      }
    })
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

  showSkillsModal() {
    //this.selectedSkills = [];
    //this.selectedSkills = JSON.parse(JSON.stringify(this.currentUser.address.skill.ids));
    this.addEditSkillsModal.show();
  }

  timeValidation(type) {
    // let timeIsValid = false;
    const otherType = (type === 'startTime') ? 'endTime' : 'startTime';
    if (this.newJob.endTime && this.newJob.startTime && (this.newJob.endTime !== this.newJob.startTime)) {
      if (this.newJob.startTime < this.newJob.endTime) {
        //   timeIsValid = true;
      } else {
        if (type === 'startTime') {
          this.newJob[otherType] = this.newJob[type];
        } else {
          setTimeout(() => {
            this.newJob[type] = this.newJob[otherType];
          }, 100);
        }
        // timeIsValid = false;
      }
    } else {
      this.newJob[otherType] = this.newJob[type];
      //timeIsValid = false;
    }
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

  onStripeInvalid(error: Error) {
    console.log('Validation Error', error)
  }

  async setStripeSource(source: StripeSource) {
    if (this.confirmModal) {
      this.confirmModal.close();
    }
    this.spinner.show();
    let amount = +this.newJob.activeMonthRate;
    if (this.addPromoCode > 0) {
      amount = this.newJob.activeMonthRate - this.addPromoCode;
    };
    amount = await this.globalService.stripeTotalAmt(amount);
    let postObject = {
      source: source['id'],
      amount: amount
    }
    this.stripeService.createCharge(postObject).subscribe(
      async data => {
        if (data['status'] === 200) {
          this.paymentDetails.payerUserId = this.jwtService.currentLoggedUserInfo._id;
          if (this.adminId) {
            this.paymentDetails.receiverUserId = this.adminId;
          }
          this.paymentDetails.transactionId = data['data']['balance_transaction'];
          this.paymentDetails.amount = (data['data']['amount']) / 100;
          this.paymentDetails.mode = data['data']['source.type '];
          this.paymentDetails.status = data['data']['status'];
          this.paymentDetails.destination = data['data']['transfer_data']['destination'];
          this.paymentDetails.receiptURL = data['data']['receipt_url'];
          this.paymentDetails.actionStatus = environment.PAYMENT_STATUS_TYPE.POSTJOB;
          await this.addPaymentDetails();
          this.toastr.success('Payment has been processed and job has been posted successfully.', 'Success');
        }
        // this.spinner.hide();
      }
    );
  }

  onStripeError(error: Error) {
    // console.error('Stripe error', token)
  }

  geocodeAddress(draftStatus?: String) {
    this.spinner.show();
    // For draft
    if (draftStatus) {
      this.newJob.draft = true;
    } else {
      if(this.newJob.draft){
        this.newJob.draft = false;
        this.filterAddress(this.newJob.practiceName);
      }else{
        this.newJob.draft = false;
        if(this.addressList.length > 1){
          this.filterAddress(this.newJob.practiceName);
        }  
      }
    }


    // Convert desired Hourly rate from string to number
    /* if (this.newJob.desiredHourlyRate) {
      this.newJob.desiredHourlyRate = +this.newJob.desiredHourlyRate;
    } */
    // Geocode Location & save
    if(this.addressList.length == 1){
      this.newJob.practiceName = this.addressList[0]._id;
      this.newJob.location = this.addressList[0].addressLine_1 + ', ' + this.addressList[0].city.city + ', '+ this.addressList[0].state.state + ', '+ this.addressList[0].country.country +', ' +this.addressList[0].zipcode.zipcode;
    }
    const location = this.newJob.location.toString().replace(/[^\w\s]/gi, '').trim();
    // Add this condition in future for saving uncessary geocoding call
    // --- && location !== this.editJobLocation
    if (!this.newJob.draft) {
      const geocodeUrl = environment.googleGeocodeUrl.replace('#ADDRESS', location);
      this.jobsService.geocodeAddress(geocodeUrl).subscribe(
        data => {
          if (data.results && data.results.length > 0) {
            if (!this.newJob.locationLatLng) {
              this.newJob.locationLatLng = new JobNewPost().locationLatLng;
            }
            this.newJob.locationLatLng.longitude = data.results[0].geometry.location.lng;
            this.newJob.locationLatLng.latitude = data.results[0].geometry.location.lat;
            this.saveJob();
          } else {
            this.saveJob();
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(
            'There are some server error. Please check connection.',
            'Error'
          );
        }
      );
    } else {
      this.saveJob();
    }
  }

  /*   getCurrentUserDetails() {
      this.usersService.getUserInfo({_id: this.currentUser._id}).subscribe(
        data => {
          if (data.status === 200) {
              delete data.data.password;
              this.userDetails = data.data;
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
    } */

  async saveJob(jobStatus?: String) {
    let message = '';
    this.spinner.show();
    this.newJob.createdBy = this.jwtService.currentLoggedUserInfo._id;
    /* ------------------ DATE CONVERSION ------------------------------ */
    if (this.newJob.jobDate) {     
      //this.newJob.jobDate = moment(this.newJob.jobDate).endOf('d').toISOString();
      this.newJob.jobDate = moment(new Date(this.newJob.jobDate)).endOf('d').toISOString();
    }
    /* ----------------------------------------------------------------- */
    if (this.newJob.jobType === this.jobTypes.TEMPORARY) {
      message = 'Data submitting... Please Wait.';
      this.newJob.paymentMethod = this.paymentMethod.HOURLY;
      this.newJob.desiredSalaryRate = 0;
      if (this.newJob.jobDates) {
        this.newJob.jobDates = this.newJob.jobDates.map(date => {
          return this.globalService.mergejobDatestartTime(date,
            this.newJob.endTime).toISOString();
          //return moment(date).startOf('date').toISOString();
          //return moment(date).endOf('d').format('YYYY-MM-DD[T]HH:mm:ss.000[Z]').toString();
          // return moment(new Date(date)).endOf('date').toISOString();
          //return moment(date).endOf('date').toISOString();
        });
      }
      // Set Expiry Date + Merge start date and time with job date
      if (this.modalType.edit || this.modalType.repost) {
        this.newJob.startTime = await this.globalService.mergejobDatestartTime(this.newJob.jobDate,
          this.newJob.startTime).toISOString();
        this.newJob.endTime = await this.globalService.mergejobDatestartTime(this.newJob.jobDate,
          this.newJob.endTime).toISOString();
        this.newJob.expireDate = this.newJob.endTime;
      }
      // ---------------------------------------------------------
    } else {
      message = 'Payment is in process... Please Wait.';
    }
    this.globalService.setLoadingLabel(message);

    if (this.newJob.draft || (this.newJob.jobType === this.jobTypes.TEMPORARY)) {
      this.newJob['promocodeDiscount'] = 0;
    }
    this.spinner.hide();
    this.jobsService.saveJob(this.newJob).subscribe(
      data => {
        if (data.status === 200) {
          if (Array.isArray(data.data)) {
            this.savedList = data.data;
          } else {
            this.savedList.push(data.data);
          }
          // --- For updating Job Id ------
          if (this.paymentDetails._id) {
            // ---- Payment To admin --------
            this.paymentDetails.jobPostId = data.data._id;
            this.addPaymentDetails('update');
            this.sendNotificationToAdmin(data.data._id);
          }
          // -------------------------
          if (this.confirmModal) {
            this.confirmModal.close();
          }
          if (this.selOfferInvite.length && !this.newJob.draft && this.newJob.visibility !== this.jobVisibility.PUBLIC) {
            this.inviteOfferDetails.sendOfferId = this.currentUser._id;
            this.inviteOfferDetails.jobPostId = data.offerJobData;
            this.sendInviteOffer();
          }
          // job Count
          // if (!this.newJob._id) {
          //   this.common.incDecUsersCount(this.userDetails, 'jobs', true, data.offerJobData.length);
          // }
          if (this.newJob.jobType !== this.jobTypes.TEMPORARY && !this.newJob.draft) {

            if (this.promoCodeDetails.isApplied) {
              this.updatePromoCode();
            }
            // this.payementDetails.jobId = this.newJob._id;
            // this.payementDetails.payerUserId = this.jwtService.currentLoggedUserInfo._id;
            // this.savePayementDetails();
            this.spinner.hide();
          } else {
            this.spinner.hide();
            this.router.navigate([this.redirectUrl]);
            if (this.modalType.repost) {
              this.toastr.success('Job has been reposted.', 'Success');
            } else if(this.newJob.draft){ 
              this.toastr.success('Job has been successfully saved as draft.', 'Success');
            }else if(this.modalType.edit){
              this.toastr.success('Job has been updated successfully.', 'Success'); 
            }
            else{
              if(((this.newJob.jobDates === undefined || this.newJob.jobDates.length == 1) || (this.newJob.jobDate.length || this.newJob.jobDate.length == 1))){
              this.toastr.success('Job has been posted successfully.', 'Success');
            }else{
              this.toastr.success(this.newJob.jobDates.length +' jobs have been posted successfully.', 'Success');
            }
            if(this.globalService.previousRoute){
              let url = this.globalService.previousRoute;
              this.router.navigate([url]);
              this.globalService.previousRoute = '';
              this.removeScroll();
            }
            }
          }
          this.activeModal.dismiss();
        }
        // this.newJob = new JobNewPost();
      },
      error => {
        this.spinner.hide();
        this.activeModal.dismiss();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  sendInviteOffer() {
    this.inviteOfferService.sendInviteOffer(this.inviteOfferDetails).subscribe(
      data => {
        if (data.status === 200) {
          const self = this;
          // this.staffList = this.staffList.filter( value => {
          //   return  (self.inviteOfferDetails.receiveOfferId.indexOf(value._id) === -1);
          // })
          this.toastr.success('Invitation has been sent successfully. ', 'Success');
          this.createOfferList();
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
        this.spinner.hide();
        this.activeModal.dismiss();
      },
      error => {
        this.spinner.hide();
        this.activeModal.dismiss();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      });
  }

  createOfferList() {
    for (let i = 0; i < this.inviteOfferDetails.jobPostId.length; i++) {
      const offerDetails = new Offer();
      offerDetails.jobPostId = this.inviteOfferDetails.jobPostId[i];
      offerDetails.practiceId = this.inviteOfferDetails.sendOfferId;
      offerDetails.status = environment.OFFER_STATUS_NEW.OFFER;
      offerDetails.isApplyied = false;
      offerDetails.sendOfferByPractice = true;
      offerDetails.offerSteps.initial.offerTime = new Date();
      offerDetails.offerSteps.initial.offerBy = environment.USER_TYPE.PRACTICE;
      offerDetails.offerSteps.initial.startTime = this.savedList[i].startTime;
      offerDetails.offerSteps.initial.endTime = this.savedList[i].endTime;
      offerDetails.practiceName = this.newJob.practiceName;
      const getAmount = (this.savedList[i].paymentMethod === this.paymentMethod.HOURLY) ?
        this.savedList[i].desiredHourlyRate : this.savedList[i].desiredSalaryRate;
      offerDetails.offerSteps.initial.amount = getAmount;
      this.common.incDecJobCount(this.savedList[i], 'sentPracticeOffers', true, this.inviteOfferDetails.receiveOfferId.length);
      for (let j = 0; j < this.inviteOfferDetails.receiveOfferId.length; j++) {
        offerDetails.staffId = this.inviteOfferDetails.receiveOfferId[j];
        this.sendOfferList.push({ ...offerDetails });
        if (i === (this.inviteOfferDetails.jobPostId.length - 1) && j === (this.inviteOfferDetails.receiveOfferId.length - 1)) {
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


  sendNotification(type = '') {
    let ind = 0;
    let counter = 0;
    if (!type) {
      return false;
    }
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    let title = this.globalService.titleCase(this.newJob.jobTitle.toString());
    const message = '';
    const notification = environment.notification;
    const self = this;
      
    
    self.sendOfferList.forEach(function (details, index) {
      let jobTitle = title;
      counter = counter + 1;
      if(self.newJob.jobType === self.jobTypes.TEMPORARY && !self.isDraft){
        if((counter - 1 ) == (self.sendOfferList.length/self.notifyJobDate.length)){
          ind = ind + 1;
          counter =  1;
        }
        if((counter - 1 ) !== (self.sendOfferList.length/self.notifyJobDate.length)){
          let jobdate = moment(self.notifyJobDate[ind]._d).format('MMM DD,YYYY');
          jobTitle = jobTitle + " (Job Date: " + jobdate + ")";
        }
       
      }else{
        jobTitle = jobTitle +  " (Job Date: " +
         self.notifyJobDate + ")";
      }
      let notificationDetails ;
      if( self.inviteOfferDetails.receiveOfferId.length > 0){
        // notificationDetails = 'You have an invitation for a <strong>'+this.newJob.jobType+' job </strong> from <strong>'+fullName+'</strong>';
        notificationDetails = '<strong>'+jobTitle+'</strong> invitation received from <strong> '+ fullName+' </strong>';
       }else{
         notificationDetails = notification[type].msg.replace('#TITLE', jobTitle).replace('#NAME', fullName).replace('#MESSAGE', message)
       }

      // --- For Messaging -----------
      // ----------------------------
      const currentTime = new Date().getTime();
      const jobId = details.jobPostId;
      const id = details._id;
      //self.checkPreviousRecipents(details, title, jobId);
      self.notification = {
        senderId: self.currentUser._id,
        receiverId: details.staffId,
        message: notificationDetails,
        redirectLink: notification[type].staffLink + jobId,
        type: notification[type].type,
        staff: { sentOffer: 0, receivedOffer: 1, contract: 0 },
        practice: { sentOffer: 0, receivedOffer: 0, contract: 0 },
        offerId: id,
        jobId: jobId,
        createdAt: currentTime,
        updatedAt: currentTime,
        status: environment.notificationStatus.UNREAD
      };
      self.firebaseService.createNotification(self.notification);
      // ------ Reset Invite Offer List ---------------
      if ((self.sendOfferList.length - 1) === index) {
        self.selOfferInvite = [];
        self.inviteOfferDetails = new InviteOffer;
        self.sendOfferList = [];
      }
    });
  }

  sendNotificationToAdmin(jobId) {
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const notification = environment.notification;
    // ----------------------------
    const currentTime = new Date().getTime();
    this.notification = {
      senderId: this.currentUser._id,
      receiverId: this.adminId,
      message: notification['adminPayment'].msg.replace('#NAME', fullName),
      redirectLink: notification['adminPayment'].link,
      type: notification['adminPayment'].type,
      admin: { payment: 1, disputes: 0 },
      jobId: jobId,
      createdAt: currentTime,
      updatedAt: currentTime,
      status: environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
  }

  getAllMessageRecipients() {
    const self = this;
    self.spinner.show();
    let s = self.firebaseService.GetMessageRecipients('UserMessageRecipient', 'recipients/' + self.currentUser._id + '/id', self.currentUser._id);
    s.once('value', async function (snapshot) {
      if (snapshot.val()) {
        const values = Object.values(snapshot.val());
        self.tempAllRecipientValues = values;
        return;
      }
    });
    self.spinner.hide();
  };

  checkPreviousRecipents(offerDetails, title, jobId) {
    const self = this;
    if (self.tempAllRecipientValues && self.tempAllRecipientValues.length) {
      self.tempAllRecipientValues.forEach((item, index) => {
        let iscreateRecipient = false;
        const keys = Object.keys(item['recipients']);
        let partnerId = keys.indexOf(offerDetails.staffId);
        if (
          item['group']['group_id'] !== jobId ||
          (item['group']['group_id'] === jobId && partnerId === -1)
        ) {
          iscreateRecipient = true;
        }
        if ((self.tempAllRecipientValues.length - 1) === index && iscreateRecipient) {
          self.createRecipents(offerDetails, title, jobId);
        }
      });
    } else {
      self.createRecipents(offerDetails, title, jobId);
    }
  }

  createRecipents(offerDetails, title = '', jobId = '') {
    let staffDetails;
    const index = this.staffList.findIndex(staff => {
      return staff._id === offerDetails.staffId;
    });
    if (index > -1) {
      staffDetails = this.staffList[index];
    } else {
      return false;
    }
    const userMessageRecipient = this.firebaseService.createUserMessageRecipientModal(jobId, title, this.currentUser, staffDetails);
    const userMessage = this.firebaseService.createUserMessageModal(this.currentUser, staffDetails);
    const postData = {
      userMessageRecipient: userMessageRecipient,
      userMessage: userMessage
    };
    this.firebaseService.InsertUserMessageRecipient(postData); // Submit data
  }

  closeModel() {
    this.activeModal.dismiss();
    // this.location.back();
    if(this.globalService.previousRoute){
      let url = this.globalService.previousRoute;
      this.router.navigate([url]);
      this.globalService.previousRoute = '';
      this.removeScroll();
    }
    else if (this.modalType.draft) {
      this.router.navigate(['/practice/job-drafts']);
    } else {
      this.router.navigate(['/practice/job-posts']);
    }
  }

  confirmJobPostOpenModal(confrmModal) {
    //-----Check Changes when update
    if (this.newJob._id && !this.newJob.draft &&
      JSON.stringify(this.previousNewJob) === JSON.stringify(this.newJob)) {
      return false;
    }

    //  ----- Validation ------
    let checkRates = false;
    const objectKeys = Object.keys(this.requiredValidate);
    const self = this;
    // let checkValidDays = false;

    if (self.newJob.jobType === this.jobTypes.TEMPORARY) {
      if (this.newJob._id || this.modalType.repost) {
        objectKeys.push(...this.temporaryEditValidate);
      } else {
        objectKeys.push(...this.temporaryAddValidate);
      }
    } else if (self.newJob.jobType === this.jobTypes.PERMANENTFULLTIME) {
      objectKeys.push(...this.permanentFullTimeValidate);
    } else {
      objectKeys.push(...this.permanentPartTimeValidate);
      // const selectedDays = this.newJob.availableDays.filter(obj => {
      //   return obj && obj.available;
      // });
      // if (!self.checkSelectedDays) {
      //   checkValidDays = true;
      // }
    }
    const found = objectKeys.filter(function (obj) {
      return Array.isArray(self.newJob[obj])
        ? !self.newJob[obj].length
        : !self.newJob[obj];
    });
    if (self.newJob.jobType === this.jobTypes.PERMANENTFULLTIME || self.newJob.jobType === this.jobTypes.PERMANENTPARTTIME) {
      if (self.newJob.paymentMethod === this.paymentMethod.HOURLY) {
        checkRates = (Number(self.newJob.desiredHourlyRate) > 0) ? false : true;
      } else {
        checkRates = (Number(self.newJob.desiredSalaryRate) > 0) ? false : true;
      }
    }

    if (found.length || (self.newJob.jobType !== self.jobTypes.TEMPORARY && (!self.checkSelectedDays || checkRates))) {
      this.alertService.clear();
      this.openError();
      this.alertService.error(' Please fill all mandatory fields! ');
      setTimeout(() => {
        this.alertService.clear();
      }, 5000);
      return false;
    }
    //paymentCardExists validations
    if (this.paymentCardExists === false) {
      this.toastr.success('To post a job you must first complete the payment section of your profile', '');
      return false;
    }


    if ((!this.newJob._id || !this.modalType.edit) && this.inviteOfferDetails.receiveOfferId.length === 0 &&
      this.newJob.visibility === environment.JOB_VISIBILITY.PRIVATE) {
      // if ((!this.newJob._id) && this.selOfferInvite.length === 0 && this.newJob.visibility === environment.JOB_VISIBILITY.PRIVATE){
      this.toastr.success(
        'At least select one staff.',
        'Alert'
      );
      return false;
    }
    // -----------------------------------------------------------------------------------------------
    // --------------------------- Check Valid Time ----------------------------------------------------
    const isStartEndTime = this.checkStartEndTimeValid(this.newJob.startTime, this.newJob.endTime);

    if (!isStartEndTime.isValid) {
      this.alertService.clear();
      this.alertService.error(isStartEndTime.message);
      setTimeout(() => {
        this.alertService.clear();
      }, 5000);
      return false;
    }
    // -------------------------------------------------------------------------------------------------

    // --------------------------- Check Valid Date And Time -------------------------------------------
    const isDateTime = this.checkDateTimeValid();
    if (!isDateTime.isValid) {
      this.alertService.clear();
      this.alertService.error(isDateTime.message);
      setTimeout(() => {
        this.alertService.clear();
      }, 5000);
      return false;
    }
    // -------------------------------------------------------------------------------------------------

    /* if (this.newJob.jobType === this.jobTypes.TEMPORARY || this.newJob._id) {
        this.saveJob();
     } else { */
    
    if(this.newJob.jobType === this.jobTypes.TEMPORARY || this.modalType.edit || this.modalType.repost){  
    this.confirmModal = this.modalService.open(confrmModal, {
      ariaLabelledBy: 'modal-basic-title', centered: true,
      backdrop: 'static', keyboard: false
    });
    this.confirmModal.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
    });
    }
    else{
      this.confirmResult();
    }
  }

  checkDateTimeValid() {
    const currentDate = moment().format('MMM DD,YYYY');
    const startTime = moment(this.newJob.startTime);
    const currentTimezone = moment().set({
      'date': startTime.get('date'),
      'month': startTime.get('month'),
      'year': startTime.get('year')
    });
    const matchTime = startTime.isAfter(currentTimezone);
    if (this.newJob.jobType === this.jobTypes.PERMANENTFULLTIME ||
      this.newJob.jobType === this.jobTypes.PERMANENTPARTTIME ||
      !this.modalType.add
    ) {
      if (
        (this.newJob.jobDate !== currentDate) ||
        (this.newJob.jobDate === currentDate && matchTime)
      ) {
        this.pastTime = false;
        return { isValid: true, message: '' };
      } else {
        this.pastTime = true;
        return { isValid: false, message: 'Please check current date & time.' };
      }
    } else {
      const found = this.newJob.jobDates.filter(date => {
        return moment(date).format('MMM DD,YYYY') === currentDate;
      });
      if (found.length === 0 || (found.length > 0 && matchTime)) {
        this.pastTime = false;
        return { isValid: true, message: '' };
      } else {
        this.pastTime = true;
        return { isValid: false, message: 'Please check current date and time.' };
      }
    }
  }

  checkStartEndTimeValid(StartTime, EndTime) {
    const startTime = moment(StartTime).valueOf();
    const endTime = moment(EndTime).valueOf();
    if(startTime == EndTime){
      this.sameTime = true;
    }else{
      this.sameTime = false;
    }
    return { isValid: (startTime < endTime), message: 'Start time and end time should not be the same.' };
  }

  openStripeModal() {
    if (this.confirmModal) {
      this.confirmModal.close();
    }
    // this.initpayPalConfig();
    this.confirmModal = this.modalService.open(this.stripeModal, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true, backdrop: 'static', keyboard: false
    });
    this.confirmModal.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
    });
  }

  showAmount(month) {
    this.newJob.activeMonthRate = month * this.monthlyCharges;
    this.calDiscountAmt();
  }

  viewOffer(value: string) {
    if (value == 'both') {
      this.showOfferModal();
    }
  }

  showOfferModal() {
    this.toastr.clear();
  
      if (this.confirmModal2) {
        this.confirmModal2.close();
      }

      this.confirmModal2 = this.modalService.open(this.staffOfferModal, {
        ariaLabelledBy: 'modal-basic-title',
        centered: true, backdrop: 'static',
        keyboard: false
      }
      );
      this.confirmModal2.result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
      });
      // this.toastr.warning(
      //   message,
      //   'Warning'
      // );
    
  }
  

  confirmResult() {
    const self = this;
    this.isDraft = this.newJob.draft;
    if(this.newJob.jobType === this.jobTypes.TEMPORARY && !this.isDraft)
    {
      this.notifyJobDate = this.newJob.jobDates; 
    }else{
      this.notifyJobDate = this.newJob.jobDate;
    }
    if (this.confirmModal) {
      this.confirmModal.close();
    }
    if (this.newJob.jobType !== this.jobTypes.TEMPORARY) {
      if ((this.modalType.add || this.modalType.draft || (
        (this.modalType.edit || this.modalType.repost) && this.newJob.status === this.jobStatus.EXPIRED
      )
      ) && (
          !this.promoCodeDetails.isApplied ||
          (this.promoCodeDetails.isApplied && this.promoCodeDetails.discount < 100))
      ) {
        this.openStripeModal();
      } else {
        this.geocodeAddress();
      }

    } else {
      this.geocodeAddress();
    }
  }

  showCancelModal() {
    // cancelModal
    if (JSON.stringify(this.newJob) === JSON.stringify(this.previousNewJob)) {
      this.closeModel();
    } else {
      if (this.confirmModal) {
        this.confirmModal.close();
      }
      this.confirmModal = this.modalService.open(this.cancelModal, {
        ariaLabelledBy: 'modal-basic-title',
        centered: true, backdrop: 'static', keyboard: false
      });
      this.confirmModal.result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
      });
    }
  }

  setData(data: any, redirectUrl?: String, tabType?: String) {
    this.redirectUrl = redirectUrl;
    this.tabType = tabType;
    if (data) {
      // this.isEditmode = true;
      this.newJob = JSON.parse(data);
      this.changeSelectedDays();
      if (this.newJob.location) {
        this.editJobLocation = this.newJob.location;
      }
      /* -------------------------------------- Modal Type Start------------------------------------ */
      if (this.newJob._id && !this.newJob.draft && !this.newJob['repostJob']) {
        this.modalType.edit = true;
        this.calDiscountAmt();
        this.newJob.jobDate = moment(this.newJob.jobDate).format('MMM DD,YYYY');
        this.getInvitePreviousOffer();
      } else if (this.newJob._id && this.newJob.draft && !this.newJob['repostJob']) {
        this.modalType.draft = true;
        this.newJob.location = (this.newJob.location) ? this.newJob.location : this.currentUser.address;
        if (this.newJob.jobDate) {
          this.newJob.jobDate = moment(this.newJob.jobDate).format('MMM DD,YYYY');
        }
        this.getInvitePreviousOffer();
      } else if (this.newJob['repostJob']) {
        this.modalType.repost = true;
        const jobId = this.newJob._id;
        delete this.newJob._id;
        this.declinedContractList(jobId);
        if (this.newJob.jobDate) {
          this.newJob.jobDate = moment(this.newJob.jobDate).format('MMM DD,YYYY');
        }
      
      } else {
        this.modalType.add = true;
        this.newJob.location = this.currentUser.address;
        this.getInvitePreviousOffer();
      }

      /* -------------------------------------- Modal Type End------------------------------------ */
      this.previousNewJob = JSON.parse(JSON.stringify(this.newJob));
     
    }
  }

  declinedContractList(jobId) {
    this.spinner.show();
    const condition = {
      jobPostId: jobId,
      status: this.offerStatus.DECLINE,
    };
    this.offerService.getAllOffers({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.declineStaffList = data.data.map(value => value.staffId._id);
          }
          this.getInvitePreviousOffer();
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

  changeAllWeekDays() {
    this.newJob.availableDays = new JobNewPost().availableDays;
    this.checkSelectedDays = true;
    if (this.allDaysAvailable) {
      this.newJob.availableDays.forEach(function (day) {
        day.available = false;
      });
      this.checkSelectedDays = false;
    }
  }

  changeSelectedDays() {
    const self = this;
    let selectedDays = [];
    setTimeout(function () {
      selectedDays = self.newJob.availableDays.filter(obj => {
        return obj && obj.available;
      });
      if (selectedDays.length < 7) {
        self.allDaysAvailable = false;
      } else {
        self.allDaysAvailable = true;
      }
      self.checkSelectedDays = (!selectedDays.length) ? false : true;
    }, 200);
  }

  getFavoriteList() {
    //this.declineStaffList
    const condition = {
      userId: this.currentUser._id,
      type: environment.FAVORITE_TYPE.STAFF
    };
    this.favoriteService.getFavorite({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          this.favoriteList = data.data;
          this.favoriteList.forEach(value => {
            if (!value.favoriteId) {
              return false;
            }
            value.favoriteId['fullName'] = value.favoriteId['firstName'].toUpperCase() + ' ' + value.favoriteId['lastName'].toUpperCase();

            if (this.newJob._id) {
              if (this.previousStaffList.length > 0 && (this.previousStaffList.indexOf(value.favoriteId._id) === -1)) {
                this.staffList.push(value.favoriteId);
              } else if (this.previousStaffList.length === 0) {
                this.staffList.push(value.favoriteId);
              }
            } else {
              this.staffList.push(value.favoriteId);
            }
            // --- Selected for re job post when job is being cancelled
            if (this.declineStaffList.length > 0 && (this.declineStaffList.indexOf(value.favoriteId._id) > -1)) {
              this.selOfferInvite.push(value.favoriteId);
            }
          });
          //  if (this.favoriteList.length > 0) {
          //    this.getStaffList();
          //  }
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

getSkillsType(){
  this.preferredSkillsList = [];
  this.requiredSkillsList = [];
  this.skillsTypeService.getSkillTypeList({}).subscribe(data =>{
    if(data.status == 200){
      this.skillsTypeList = data.data;
      this.getSkillsData();
    }
  })
}

  getSkillsData() {
    // this.spinner.show();
    this.skillsService.getSkills({}).subscribe(
      data => {
        if (data.status === 200) {
          this.skills = data.data;
         this.skills = this.skills.filter(val =>{
          if(val.skill != 'Other'){
            return this.skills
          }  
          })

          this.filterSkills();
          
        }
        // this.spinner.hide();
      },
      error => {
        // this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  filterSkills(){
    if(this.newJob.positionType === 'Dentist'){
      this.skillsTypeList.splice(1,1);
    }
    if(this.newJob.positionType === 'Dental Hygienist' || this.newJob.positionType === 'Dental Assistant'){
      this.skillsTypeList.splice(2,1);
    }
    if(this.newJob.positionType === 'Administration'){
      this.skillsTypeList.splice(1,1); 
      this.skillsTypeList.splice(2,1);
    }
    for(let i=0;i<this.skillsTypeList.length;i++){
      for(let j=0;j<this.skills.length;j++){
        if(this.skills[j].skillType === this.skillsTypeList[i]._id){
          this.preferredSkillsList.push(this.skills[j]);
        }
      }
    }

    this.preferredSkillsList = [].concat(...this.preferredSkillsList);;
    this.requiredSkillsList = this.preferredSkillsList;
  }

  getInvitePreviousOffer() {
    const condition = {
      sendOfferId: this.currentUser._id,
      jobPostId: this.newJob._id
    };
    this.previousStaffList = [];
    if (!this.newJob._id) {
      this.getFavoriteList();
      return false;
    };
    this.inviteOfferService.getInviteOffers({ condition }).subscribe(async data => {
      if (data.status === 200) {
        if (data.data.length > 0) {
          const self = this;
          await data.data.forEach(offer => {
            self.previousStaffList.push(...offer.receiveOfferId);
          });
        }
        this.getFavoriteList();

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

  addPaymentDetails(type = '') {
    this.paymentService.savePaymentDetails(this.paymentDetails).subscribe(data => {
      if (data.status === 200) {
        if (!type) {
          this.newJob['paymentId'] = data.data._id;
          this.paymentDetails = data.data;
          this.newJob.expireDate = moment(new Date()).add(this.newJob.activeMonth, 'months').endOf('d').toISOString();
          this.geocodeAddress();
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

  closeOfferModal() {
    this.selOfferInvite = [];
    this.inviteOfferDetails.receiveOfferId = [];
    this.confirmModal2.close();
  }

  checkSelOffer() {
    if (this.selOfferInvite.length === 0 && (this.newJob.visibility === environment.JOB_VISIBILITY.PRIVATE
      || this.newJob.visibility === environment.JOB_VISIBILITY.BOTH)) {
      this.toastr.warning(
        'Please select at-least One Staff.',
        'Warning'
      );
    } else {
      this.inviteOfferDetails.receiveOfferId = [];
      this.selOfferInvite.forEach(value => {
        this.inviteOfferDetails.receiveOfferId.push(value._id);
      });
      this.confirmModal2.close();
    }
  }
  showPromoCodeModal(promoCodeModal) {
    this.confirmModal = this.modalService.open(promoCodeModal, {
      ariaLabelledBy: 'modal-basic-title', centered: true,
      backdrop: 'static', keyboard: false
    });
    this.confirmModal.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
    });
  }

  checkPromoCode() {
    this.spinner.show();
    const data = {
      id: this.currentUser._id,
      promoCode: this.promoCode
    };
    this.promoCodeService.checkPromoCode(data).subscribe(data => {
      if (data.status === 200) {
        if (data.data) {
          this.promoCodeDetails = data.data;
          this.promoCodeDetails['isApplied'] = false;
          if (this.promoCodeDetails.status === this.promoCodeStatus.VALID) {
            this.promoCodeDetails['isApplied'] = true;
            this.newJob['promocodeDiscount'] = Number(this.promoCodeDetails.discount);
            this.confirmModal.close();
            this.calDiscountAmt();
            this.toastr.success(
              'Promo code has been applied successfully.',
              'Success'
            );
          }
        } else {
          this.promoCodeDetails.status = this.promoCodeStatus.INVALID;
        }
        this.spinner.hide();
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

  updatePromoCode() {
    this.promoCodeDetails.usedUserIds.push(this.currentUser._id);
    const updateDetails = {
      usedUserIds: this.promoCodeDetails.usedUserIds,
      _id: this.promoCodeDetails._id
    };
    this.promoCodeService.addPromocode(updateDetails).subscribe(data => {
      if (data.status === 200) {
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

  calDiscountAmt() {
    // if ( (this.newJob['promocodeDiscount'] > 0) && (this.promoCodeDetails.status === this.promoCodeStatus.VALID) ) {
    if ((this.newJob['promocodeDiscount'] > 0)) {
      const discount = Number(this.newJob['promocodeDiscount']);
      this.addPromoCode = Number((this.newJob.activeMonthRate * (discount / 100)).toFixed(2));
    } else {
      this.addPromoCode = 0;
    }
  }

  tempStr: any = '';
  onEditorChange() {
    this.tempStr = this.newJob.description;
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
        this.newJob.description = this.tempStr;
        return false;
      }
    }
  }

  toggleAccordian(i,type){
    if(type == 0){
      this.next(i,1);
    }else if(type == 1){ 
    this.next(i,2);
    }else if(type == 2){
      this.prev(i)
    }else if(type == 3){
      this.prev(i)
    }
    this._cdr.detectChanges()
  }
  
  changeValues(){
  }

next(index,key){
  if(key == 1){
    if(index == 1){
      this.checkDateTimeValid();
      this.checkStartEndTimeValid(this.newJob.startTime, this.newJob.endTime); 
      if(((this.userInfo.practiceAccount==='multi' && this.newJob.practiceName) || (this.userInfo.practiceAccount==='single' && this.practiceName)) && this.newJob.jobTitle && this.newJob.positionType && this.newJob.description){
        if(this.newJob.desiredHourlyRate < 9999 && this.newJob.desiredHourlyRate !== null && this.newJob.desiredHourlyRate >= 10 && ((this.newJob.jobDates === undefined || this.newJob.jobDates.length) || (this.newJob.jobDate.length || this.newJob.jobDate.length))){
          if(!this.pastTime){
            if(!this.sameTime){
              if((this.newJob.offerBonus && this.newJob.bonusRate > 0) || (!this.newJob.offerBonus)){
              this.showAccordian[index] = !this.showAccordian[index];
              }else{
                this.toastr.success('Please fill all required fields.','Warning')
              }
            }else{
              this.toastr.success('Start time and end time can not be same.','Alert')
            }
          }else{
            this.toastr.success('Please do not select past date and times.','Alert')
          }
        }else{
          this.toastr.success('Please fill all required fields.','Warning')
        }
      }else{
        this.toastr.success('Please fill all required fields.','Warning')
      }
      }else if(!this.newJob.experience){
        this.requiredSection = !this.requiredSection;
        this.toastr.success('Please fill all required fields.','Warning')
      }else{
        this.showAccordian[index] = !this.showAccordian[index];
      }
  }else{
    if(index == 1){
      if(((this.userInfo.practiceAccount==='multi' && this.newJob.practiceName) || (this.userInfo.practiceAccount==='single' && this.practiceName)) && this.newJob.jobTitle && this.newJob.positionType  && this.newJob.jobDate && this.newJob.description){
        if((((this.newJob.desiredHourlyRate < 9999 && this.newJob.desiredHourlyRate !== null && this.newJob.desiredHourlyRate > 0) || (this.newJob.desiredSalaryRate !== null && this.newJob.desiredSalaryRate > 0)) && this.newJob.payCycle)){
          if(this.newJob.hoursPerWeek <= 100 && this.newJob.hoursPerWeek != null && this.newJob.hoursPerWeek > 0){
            if((this.signOnBonus && this.newJob.signOnBonus) || (!this.signOnBonus)){
            this.showAccordian[index] = !this.showAccordian[index];
            }else{
              this.toastr.success('Please fill all required fields.','Warning')
            }
          }
          else{
            this.toastr.success('Please fill all required fields.','Warning')  
          }
        }else{
          this.toastr.success('Please fill all required fields.','Warning')
        }
      }else{
        this.toastr.success('Please fill all required fields.','Warning')
      }
      }else if(!this.newJob.experience){
        this.requiredSection = !this.requiredSection;
        this.toastr.success('Please fill all required fields.','Warning')
      }else if(!this.newJob.activeMonth){
        this.toastr.success('Please fill all required fields.','Warning')
      }else{
        this.showAccordian[index] = !this.showAccordian[index];
      } 
  }
}

prev(index){
    this.showAccordian[index] = !this.showAccordian[index];
    this.showAccordian[index+1] = false;
}

check(event ,i){
this.showAccordian[i] = event;
}

clear(){
  let type = this.newJob.jobType;
  this.newJob = new JobNewPost();
  this.newJob.jobType = type;
  this.showAccordian = [true,false,false];
  this.getSkillsType();
}

getUserAddresses(){
  const condition = { 
    userId : this.currentUser._id,
  };
  this.addressService.getAddressWithDetails({condition}).subscribe(data =>{
    if(data.status == 200){
      this.addressList = data.data;
      if(this.addressList.length == 1){
        this.practiceName = this.addressList[0].practiceName;
        let practiceId = this.addressList[0]._id;
        this.filterAddress(practiceId);
      }
    }
  })
}

filterAddress(id){
  this.addressDetails = this.addressList.filter(val =>{ 
    if(val._id == id){
      return this.addressList;
    }
  }) 
  this.newJob.location = this.addressDetails[0].addressLine_1 + ', ' + this.addressDetails[0].city.city + ', '+ this.addressDetails[0].state.state + ', '+ this.addressDetails[0].country.country +', ' +this.addressDetails[0].zipcode.zipcode;
  this.newJob.practice = this.addressDetails[0].practiceName;
}

getPositionTypeList(){
  this.newJob.requiredSpecialities = [];
  this.newJob.preferredSpecialities = [];
  this.newJob.requiredCertificates = [];
  this.newJob.preferredCertificates = [];
  this.certificates = [];
  this.getSkillsType();
  const condition = {name : this.newJob.positionType}
  this.positionTypeService.getPositionType({condition}).subscribe(data=>{
    if(data.status == 200){
      this.positionType = data.data;
      this.positionTypeId = this.positionType[0]._id;
      this.getCertificateTypeList();
    }
  })
}

getCertificateTypeList() {
  let certificateTypeId;
  this.preferredCertificateList = [];
  this.requiredCertificateList = [];
  this.certificateTypeService.getCertificateTypeList({}).subscribe(
    data => {
      if (data.status === 200) {
        this.certificateTypeList = data.data;
        this.certificateTypeList.map(record =>{
          if(record.certificateType.toLowerCase() === this.newJob.positionType.toLowerCase() || record.certificateType.toLowerCase() === 'general'){
            certificateTypeId = record._id;
            this.getCertificateList(certificateTypeId);
          }
        })
        this.getSpecialtyList();
      } else {
        this.globalService.error();
      }
    },
    error => {
      this.globalService.error();
    }
  );
}

getCertificateList(certificateTypeId) {
  const condition = { certificateType : certificateTypeId}
  this.certificateService.getCertificateList({condition}).subscribe(
    data => {
      if (data.status === 200) {
        this.certificates.push(data.data);
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

getSpecialtyList() {
  this.preferredSpecialtyList = [];
  this.requiredSpecialtyList = [];
  const condition = { positionType: this.positionTypeId};
  this.specialtyService.getSpecialtyList({ condition }).subscribe(data => {
    if (data.status === 200) {
      this.specialty = data.data;
      this.specialty = this.specialty.filter(val =>{
        if(val.specialty != 'Other'){
          return this.specialty
        }  
        })
      this.preferredSpecialtyList = this.specialty;
      this.requiredSpecialtyList = this.specialty;
      this.preferredCertificateList = [].concat(...this.certificates);
      this.requiredCertificateList = this.preferredCertificateList;
    } else {
      this.globalService.error();
    }
  }, error => {
    this.globalService.error();
  });
}

filterAll(values, index){
  if(index == 1){
    this.requiredSpecialtyList = this.specialty;
    if(values.length > 0){
      this.requiredSpecialtyList = this.dataFilter(this.preferredSpecialtyList,values);
    }
  }else if(index == 2){
    this.requiredCertificateList = this.certificates;
    if(values.length > 0){
      this.requiredCertificateList = this.dataFilter(this.preferredCertificateList,values);
    }
  }else if(index == 3){
    this.requiredSkillsList = this.skills;
    if(values.length > 0){
      this.requiredSkillsList = this.dataFilter(this.preferredSkillsList,values);
    }
  }else if(index == 4){
    this.preferredSpecialtyList = this.specialty;
    if(values.length > 0){
      this.preferredSpecialtyList = this.dataFilter(this.requiredSpecialtyList,values);
    }
  }else if(index == 5){
    this.preferredCertificateList = this.certificates;
    if(values.length > 0){
      this.preferredCertificateList = this.dataFilter(this.requiredCertificateList,values);
    }
  }else if(index == 6){
    this.preferredSkillsList = this.skills;
    if(values.length > 0){
      this.preferredSkillsList = this.dataFilter(this.requiredSkillsList,values);
    }
  }
  }

dataFilter(arr,values){
  for(let i=0;i<values.length;i++){ 
    arr = arr.filter(val => {
          if(val._id !== values[i]._id) {
            return arr;
          }
     })
    }
    return arr;
}

checkLength(){
  if(this.newJob.desiredHourlyRate > 9999){
    this.toastr.success('Please enter hourly rate upto 4 digits only.','Warning')
  }
}


currentDateAndTime(){
  let inputDate = new Date(this.newJob.jobDates); 
  let currentDate = new Date();
  if(inputDate.setHours(0, 0, 0, 0) == currentDate.setHours(0, 0, 0, 0)){
    this.pastTime = true;
   this.toastr.success('Please check current date and time','Warning');
  }else{
    this.pastTime = false;
  }
}

openError(){
  if(this.newJob.jobType == this.jobTypes.TEMPORARY){
  if(!this.newJob.jobTitle || !this.newJob.positionType  || !this.newJob.desiredHourlyRate || !this.newJob.description){
    this.showAccordian[0] = !this.showAccordian[0];
  }else if(!this.newJob.experience){
    this.showAccordian[1] = !this.showAccordian[1];
  }
}else{
  if(!this.newJob.jobTitle || !this.newJob.positionType  || !this.newJob.jobDate || !this.newJob.desiredHourlyRate || !this.newJob.description){
    this.showAccordian[0] = !this.showAccordian[0];
  }else if(!this.newJob.experience){
    this.showAccordian[1] = !this.showAccordian[1];
  }else if(!this.newJob.activeMonth){
    this.showAccordian[2] = !this.showAccordian[2];
  }
}
}

changeText(){
  if(this.newJob.paymentMethod === "hourly"){
    this.title = "Rate Per Hour";
    this.val = this.newJob.desiredHourlyRate;
    this.newJob.desiredSalaryRate = null;
  }else{
    this.title = "Annual Salary";
    this.val = this.newJob.desiredSalaryRate;
    this.newJob.desiredHourlyRate = null;
  }
}

clearCompensation(){
  if(this.newJob.paymentMethod === 'hourly'){
    this.newJob.desiredSalaryRate = null;
  }else{
    this.newJob.desiredHourlyRate = null;
  }
}

signOnBonusShow(){
 this.flag = 0 
for(let i=0; i<this.newJob.benefits.length;i++){
    if(this.newJob.benefits[i].benefits === 'Sign On Bonus'){
     this.flag = 1;
    }
  }

  if(this.flag == 0){
    this.signOnBonus = false;
    this.newJob.signOnBonus = null;
  }else{
    this.signOnBonus = true;
  }
}

clearOfferBonus(){
  this.newJob.bonusRate = 0;
}


removeScroll()
{
  $('body').removeClass('noScroll'); 
}
}