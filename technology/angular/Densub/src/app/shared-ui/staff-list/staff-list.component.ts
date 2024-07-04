import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap';
import { Router } from '@angular/router';
import { PracticeService } from '../../views/dashboard-pages/admin/practice/practice.service';
import { SkillsService } from '../../views/dashboard-pages/admin/skills/skills/skills.service';
import { PaymentCardService } from '../../shared-ui/service/paymentCard.service';
import { GlobalService } from '../service/global.service';
import { UsersService } from '../service/users.service';
import { FavoriteService } from '../service/favorite.service';
import { JwtService } from '../service/jwt.service';
import { SortService } from '../service/sort.service';
import { environment } from '../../../environments/environment';
import { Favorite } from './favorite.model';
import { currentUser } from '../../layouts/home-layout/user.model';
import { savedFilters } from '../../shared-ui/global/allFilters';
import { Filter } from './staff-filter';
import { ExperienceService } from '../service/experience.service';
import { PositionTypeService } from '../service/positionType.service';
import { AddressService } from '../service/address.service';
import { SpecialtyService } from '../../views/dashboard-pages/admin/specialties/specialties.service';
import { CertificateService } from '../../views/dashboard-pages/admin/certificates/certificates/certificates.service';
import { InviteOfferService } from '../service/inviteOffer.service';
import { InviteOffer } from '../modal/inviteOffer.modal';
import { JobsService } from '../../views/dashboard-pages/dental-practice/jobs/job-posts/jobs.service';
import * as moment from 'moment';
import { OfferService } from '../service/offer.service';
import { Offer } from '../modal/offer.modal';
import { Common } from '../service/common.service';
import { Notification } from '../../shared-ui/modal/notification.modal';
import { FirebaseService } from '../../shared-ui/service/firebase.service';
import { EventEmitterService } from '../service/event-emitter.service';
import { NgxCarousel } from 'ngx-carousel';
import { CertificateTypeService } from '../../views/dashboard-pages/admin/certificates/certificate-type/certificate-type.service';
import { RatingService } from '../service/rating.service';
declare var $: any;
@Component({
  selector: 'app-staff-list',
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.scss']
})
export class StaffListComponent implements OnInit {
  @ViewChild('emptyJobListModal', { static: false })
  @ViewChild('confirmationModal', { static: false }) public confirmationModal: ModalDirective;
  @ViewChild('sendInviteOfferModal', { static: false }) public sendInviteOfferModal: ModalDirective;
  public emptyJobListModal: ModalDirective;
  confirmModal: NgbModalRef;
  closeResult: string;
  confirmationMessage: string;
  PositionTypeData: any = [];
  experienceLists: any = [];
  positionTypes: any = [];
  skillsList: any = [];
  staffList: any = [];
  favoriteList: any = [];
  currentUser: currentUser = new currentUser;
  inviteOfferDetails: InviteOffer = new InviteOffer();
  paymentMethod: any = environment.PAYEMENT_METHOD;
  notification: any = new Notification();
  dropdownSettings2: any = {};
  sendOfferList: any = [];
  jobOfferIds = [];
  jobList: any = [];
  selectedJobList: any = [];
  selOfferInvite: any = [];
  favorite: Favorite = new Favorite();
  viewChecked = {
    dashboardStaff: false,
    favoritesStaff: false,
    homeStaff: false,
    hiredStaff: false,
  };
  FilterStaffList: Filter = new Filter;
  setDataFilter: any;
  viewProfileLink = '/#/practice/view-staff-profile';
  itemsPerPage = 25;
  staffPreview: any;
  today: Date = new Date();
  rangeDatepickerConfig = {
    rangeInputFormat: 'MMMM DD YYYY',
    containerClass: 'theme-dark-blue',
    isAnimated: true,
    adaptivePosition: true
  };
  experienceData: any = environment.STAFF_EXPERIENCE;
  profileStatus: any = environment.PROFILE_STATUS;
  paymentCardExists: boolean = false
  addressList: any = [];
  specialtyList: any = [];
  certificatesList: any = [];
  favorites: boolean = false;
  staffProfileInfo: any;
  previousJobList: any = [];
  totalJobsWorked: any = [];
  totalCancelled: any = [];
  hideSideNav: boolean = false;
  isCollapsed: boolean = true;
  isCollapse: boolean = true;
  isCollapseSort: boolean = true;
  locat: { longitude: any; latitude: any; };
  locationData = false;
  nameData:any = [];
  public carouselOne: NgxCarousel;
  senderName: string = '';
  receiverName: string = '';
  positionName: any = '';
  staffDetails: any = [];
  certificateTypeList: any = [];
  ratings: any = [];
  ratingCount: any;

  constructor(
    private practiceService: PracticeService,
    private userService: UsersService,
    private favoriteService: FavoriteService,
    private globalService: GlobalService,
    private skillsService: SkillsService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private jwtService: JwtService,
    private sortService: SortService,
    private PaymentCardService: PaymentCardService,
    private router: Router,
    private modalService: NgbModal,
    private experienceService: ExperienceService,
    private positionTypeService: PositionTypeService,
    private addressService: AddressService,
    private specialtyService: SpecialtyService,
    private certificatesService: CertificateService,
    private inviteOfferService: InviteOfferService,
    private jobsService: JobsService,
    private offerService: OfferService,
    private common: Common,
    private firebaseService: FirebaseService,
    private eventEmitterService: EventEmitterService,
    private certificateTypeService: CertificateTypeService,
    private ratingService: RatingService
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    console.log(this.currentUser);
    if (window.location.href.includes('dental-staffs')) {
      this.viewChecked.homeStaff = true;
      this.viewProfileLink = '/#/staff-profile';
    } else if (window.location.href.includes('favorites-staffs')) {
      this.viewChecked.favoritesStaff = true;
    } else if (window.location.href.includes('hired-staffs')) {
      this.viewChecked.hiredStaff = true;
    } else {
      this.viewChecked.dashboardStaff = true;
    }
  }

  ngOnInit() {
    this.FilterStaffList.address = (this.currentUser.address) ? this.currentUser.address : '';
    setTimeout(() => {
      this.globalService.topscroll();
      this.PositionTypeData = this.globalService.positionTypeData;
    }, 1000);

    if (this.currentUser.profileVerificationStatus !== undefined && this.currentUser.profileVerificationStatus !== this.profileStatus.VERIFIED ) {
      ($('#warningPracticeVerificationModel') as any).modal('show');   
    $(()=>{
      $('#warningPracticeVerificationModel').focusout(function(){
        ($('#warningPracticeVerificationModel') as any).modal('hide');
        const url = '/#/practice/dashboard';
        window.open(url,'_self');
      })
    })
    }


    this.getTotalJobsWorked();
    this.getRatingsCount();
    this.getCancelledJobs();
    this.getAddressesList();
    this.getPositionList();
    this.getFavoriteList('onload');
    this.getSkillsData();
    this.getExperienceList();
    if (savedFilters.staffList) {
      this.FilterStaffList = savedFilters.staffList;
    }
    let customer = JSON.parse(localStorage.getItem('currentUser'));
    this.getPaymentCardDetail(customer.email);

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

    // if (this.eventEmitterService.subsVar==undefined) {    
      this.eventEmitterService.subsVar = this.eventEmitterService.    
      invokeFirstComponentFunction.subscribe((name) => {   
        this.nameData = name;
        if((name[0].name === undefined || name[0].name === "") && (name[1].location === undefined || name[1].location === "")){
          this.getSearchStaff();
        }
        
        if(name[1].location !== undefined && name[1].location.length){
          this.locationData = true;
          //this.getSearchOnLocation(name[1].location);
          if(name[0].name === ''){
           // this.GetSearchOnLocation();
          }else{
            //this.getSearchResults(name[0].name);
          }
        }else{
          this.locationData = false;
        }
        if(name[0].name !== undefined && name[0].name.length && !this.locationData){
        this.getSearchResults(name[0].name);    
        }
      });    
    //} 

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

  closeAndRedirect(){
    ($('#warningPracticeVerificationModel') as any).modal('hide');
    this.router.navigate(['practice/dashboard']);
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

  getSkillsData() {
    this.spinner.show();
    this.skillsService.getSkills({}).subscribe(
      data => {
        if (data.status === 200) {
          this.skillsList = data.data;
          this.skillsList = this.skillsList.filter(val =>{
            if(val.skill != 'Other'){
              return this.skillsList
            }  
            })
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

  getStaffList() {
    // this.closeModel();
    if (this.FilterStaffList.miles) {
      this.FilterStaffList.miles = 0;
    }
    this.spinner.show();
    const condition = {
      userType: environment.USER_TYPE.STAFF,
      profileVerificationStatus: environment.PROFILE_STATUS.VERIFIED,
      status: 1,
      // ...searchondition
    };
    this.userService.getUsers({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          this.staffList = data.data;
          const self = this;
          if (this.staffList.length && self.favoriteList.length) {
            this.staffList.forEach(function (staff) {
              const found = self.favoriteList.filter((favorite) => {
                return (self.currentUser._id === favorite.userId && favorite.favoriteId._id === staff._id);
              });
              if (found.length) {
                staff['favoriteInfo'] = found[0];
              }
            });
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



  getFavoriteList(status?: String) {
    this.spinner.show();
    const condition = {
      userId: this.currentUser._id,
      type: environment.FAVORITE_TYPE.STAFF,
    };
    this.favoriteService.getFavorite({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          this.favoriteList = data.data;
          if (status) {
            this.searchStaff(status);
          } else {
            this.getStaffList();
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

  addFavorite(staffDetail: any, index) {
    if (staffDetail.favoriteInfo) {
      this.removeFavorite(staffDetail, index);
      this.toastr.success('Remove from Favorites.','Success');
      return false;
    }
    this.favorite.userId = this.currentUser._id;
    this.favorite.type = environment.FAVORITE_TYPE.STAFF;
    this.favorite.favoriteId = staffDetail._id;
    this.favoriteService.addFavorite(this.favorite).subscribe(
      data => {
        if (data.status === 200) {
          const favoriteInfo = data.data;
          this.favoriteList.push(data.data);
          this.staffList[index]['favoriteInfo'] = favoriteInfo;
          this.toastr.success('Added to Favorites.','Success');
          console.log(this.staffList);
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

  getExperienceList() {
    this.spinner.show();
    this.experienceService.getExperienceList({}).subscribe( data => {
      if (data.status === 200) {
        this.experienceLists = data.data;
      }
      this.spinner.hide();
    }, error => {
      this.globalService.error();
    });
  }

  getPositionList(){
    this.positionTypeService.getPositionType({}).subscribe(
      data => {
        if (data.status === 200) {
          this.positionTypes = data.data;
        }
        this.spinner.hide();
      },
      error => {
        this.globalService.error();
      }
    );
  }

  removeFavorite(staffDetail, index) {
    this.favoriteService.removeFavorite({ _id: staffDetail.favoriteInfo._id }).subscribe(
      data => {
        if (data.status === 200) {
          this.favoriteList = this.favoriteList.filter(function (favorite) {
            return favorite._id !== staffDetail.favoriteInfo._id;
          });
          delete this.staffList[index].favoriteInfo;
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

  searchStaff(status?: String) {
    this.isCollapsed = true;
    this.isCollapse = true;
    this.isCollapseSort = true;
    console.log(this.favoriteList)
    this.spinner.show();
    this.FilterStaffList.miles = Number(this.FilterStaffList.miles);

    // if (this.FilterStaffList.dates && this.FilterStaffList.dates.length) {
    // console.log(this.FilterStaffList.dates, '+++++++++++++++');
    // this.FilterStaffList.dates = this.FilterStaffList.dates.map(function (obj) {
    //   obj.start = startOfDay(obj.start);
    //   return obj;
    // });
    // }

    // Default Lat & lng
    if (!(this.FilterStaffList.address && this.FilterStaffList.miles)) {
      this.FilterStaffList['location'] = this.jwtService.currentLoggedUserInfo.location;
      this.getSearchStaff();
      return false;
    }
    // ----------------------
    const geocodeUrl = environment.googleGeocodeUrl.replace('#ADDRESS',
      this.FilterStaffList.address.replace(/[^\w\s]/gi, '').trim());
    this.userService.geocodeAddress(geocodeUrl).subscribe(
      data => {
        if (data.results && data.results.length > 0) {
          this.FilterStaffList['location'] = {
            longitude: data.results[0].geometry.location.lng,
            latitude: data.results[0].geometry.location.lat
          };
          this.getSearchStaff();
        } else {
          this.toastr.error(
            'Please enter a valid address.',
            'Error'
          );
          return false;
        }
      }
    );
  }

  showConfirmationModal(staffDetail: any, index) {
    // cancelModal
    // if(staffDetail.favoriteInfo){
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
          this.addFavorite(staffDetail, index);
      //   }
      // });
  }

  getSearchStaff() {
    this.spinner.show();
    let address = this.addressList;
    let totalJobs = this.totalJobsWorked;
    let totalcancelled = this.totalCancelled;
    savedFilters.staffList = this.FilterStaffList;
    this.userService.searchStaff({ filterStaffList: this.FilterStaffList }).subscribe(
      data => {
        this.staffList = data.data;
        if (status && this.staffList.length === 0) {
          this.emptyApplyJobMdal();
        }
        const self = this;
        if (this.staffList.length) {
           this.staffFilter(this.staffList);
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
    )
  }

  sortStaff() {
    if (this.staffList.length === 1) {
      this.spinner.hide();
      return false;
    }
    switch (this.FilterStaffList.sort) {
      case 'ascending':
        this.staffList = this.sortService.ascendingSort('firstName', this.staffList);
        this.spinner.hide();
        break;
      case 'descending':
        this.staffList = this.sortService.descendingSort('firstName', this.staffList);
        this.spinner.hide();
        break;
      case 'ratings':
        this.staffList = this.sortService.descendingSort('avgRating', this.staffList);
        this.spinner.hide();
        break;
      case 'proximity':
        this.staffList = this.sortService.ascendingSort('distance', this.staffList);
        this.spinner.hide();
        break;
      case 'price':
        this.staffList = this.sortService.ascendingSort('desiredHourlyRate', this.staffList);
        this.spinner.hide();
        break;
      default:
        this.staffList = this.sortService.descendingSort('createdAt', this.staffList, 'date');
        this.spinner.hide();
        break;

    }
  }

  closeModel() {
    this.sendInviteOfferModal.hide();
    this.emptyJobListModal.hide();
  }

  emptyApplyJobMdal() {
    this.getFavoriteList();

    this.toastr.warning(
      'No jobs available near your location.',
      'Warning'
    );
    // this.emptyJobListModal.show();
  }

  numToArrConverter(i: number) {
    return new Array(i);
  }

  getAddressesList(){
    const condition = {
      userType : 'staff',
      status : 'active'
    }
    this.addressService.getAddressWithDetails({condition}).subscribe(data =>{
      if(data.status == 200){
        if(data.data.length > 0 ){
          this.addressList = data.data;
        }
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }

  getPositionDetails(positionId){
    this.specialtyList = [];
    if(positionId.length){
    let positionTypeId = this.positionTypes.filter(pos => {
      if(pos._id === positionId){
        return pos;
      }
    })
    this.getCertificateTypeList(positionTypeId);
  }
}

getSpecialtyList(positionTypeId){
  if(positionTypeId.length){
  const condition = { 
    positionType: 
    {'$in':[positionTypeId[0]._id]}
  };
  this.specialtyService.getSpecialtyList({ condition }).subscribe(data => {
    if (data.status === 200) {
      this.specialtyList = data.data;
      this.certificatesList = [].concat(...this.certificatesList);
    } else {
      this.globalService.error();
    }
  }, error => {
    this.globalService.error();
  });
}
}


getCertificateTypeList(positionTypeId) {
this.certificatesList = [];
if(positionTypeId.length){
  let positionName = positionTypeId[0].name
let certificateTypeId;
this.certificateTypeService.getCertificateTypeList({}).subscribe(
  data => {
    if (data.status === 200) {
      this.certificateTypeList = data.data;
      this.certificateTypeList.map(record =>{
        if(record.certificateType.toLowerCase() === positionName.toLowerCase() || record.certificateType.toLowerCase() === 'general'){
          certificateTypeId = record._id;
          this.getCertificates(certificateTypeId);
        }
      })
      this.getSpecialtyList(positionTypeId);
    } else {
      this.globalService.error();
    }
  },
  error => {
    this.globalService.error();
  }
);
}
}


getCertificates(certificateTypeId){
  const condition = { certificateType : certificateTypeId}
  this.certificatesService.getCertificateList({condition}).subscribe(data => {
    if (data.status === 200) {
      this.certificatesList.push(data.data);
    } else {
      this.globalService.error();
    }
  }, error => {
    this.globalService.error();
  });
}
  
  clearFilters(){
    this.FilterStaffList = new Filter;
  }


  showOfferModal(staff) {
    this.staffProfileInfo = staff._id;
    this.staffDetails = staff;
    this.senderName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    this.ratingCount = staff.ratingCount;
    this.receiverName = staff.firstName + ' ' + staff.lastName.charAt(0);
    this.positionName = staff.positionType;
    this.getSendJobOfferIds();
    this.sendInviteOfferModal.show();
 }

 getPreviousInviteOffer() {
  const condition = {
    sendOfferId : this.currentUser._id,
    receiveOfferId : this.staffProfileInfo
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

getSendJobOfferIds() {
  const condition = {
    staffId : this.staffProfileInfo,
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
    this.inviteOfferDetails.receiveOfferId = [this.staffProfileInfo]
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
      //self.checkPreviousRecipents(title,jobId);
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
    this.closeInvite();
  }

  getTotalJobsWorked() {
    const condition = {
      $or: [
        { contractStatus: environment.CONTRACT_STATUS.COMPLETED },
        { contractStatus: environment.CONTRACT_STATUS.MARKASPAIDSTAFF }
      ],
    };
      this.offerService.getAllOffers({condition}).subscribe(data => {
        if (data.status === 200) {
            this.totalJobsWorked = data.data;
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

getCancelledJobs(){
  const condition = {
    contractStatus: environment.CONTRACT_STATUS.CANCELLED,
    updatedAt:{$gt:new Date(Date.now() - 24*60*60 * 1000)}
  };
    this.offerService.getAllOffers({condition}).subscribe(data => {
      if (data.status === 200) {
          this.totalCancelled = data.data;
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
openUrl(){
  let url = this.viewProfileLink+'/'+this.staffPreview;
  window.open(url,'_blank');
}

openPopup(id){
  this.staffPreview = id;
  this.getFavorite();
  this.hideSideNav = !this.hideSideNav;
  if(this.hideSideNav){ 
    $('body').addClass('noScroll')
}else{
    $('body').removeClass('noScroll')
}
}

closePopup(){
  this.hideSideNav = !this.hideSideNav;
  if(this.hideSideNav){ 
    $(()=>{
      $('body').css('overflow-y','hidden')
    })
  }else{
    $(()=>{
      $('body').css('overflow-y','scroll')
    })
  }
}

getFavorite(status?: String) {
  const condition = {
    userId: this.currentUser._id,
    type: environment.FAVORITE_TYPE.STAFF,
  };
  this.favoriteService.getFavorite({ condition: condition }).subscribe(
    data => {
      if (data.status === 200) {
        this.favoriteList = data.data;
        if(this.staffList.length){
        this.staffList.map(staff =>{
        if(this.favoriteList.length){
          const found = this.favoriteList.filter((favorite) => {
            return (this.currentUser._id === favorite.userId && favorite.favoriteId && favorite.favoriteId._id === staff._id);
          });
          if (found.length) {
            staff['favoriteInfo'] = found[0];
          }else if(found.length == 0){
            staff['favoriteInfo'] = [];
          }
        }else{
          staff['favoriteInfo'] = [];
        }
      })
    }
      }
    })
  }

  getSearchOnLocation(locationName){
    locationName = locationName.toLowerCase();
    const geocodeUrl = environment.googleGeocodeUrl.replace('#ADDRESS',
      locationName.replace(/[^\w\s]/gi, '').trim());
    this.userService.geocodeAddress(geocodeUrl).subscribe(
      data => {
        if (data.results && data.results.length > 0) {
            this.locat = {
            longitude: data.results[0].geometry.location.lng,
            latitude: data.results[0].geometry.location.lat
          };
          if(this.nameData[0].name === "" || this.nameData[0].name === undefined){
            this.GetSearchOnLocation();
          }else{
            this.getSearchResults(this.nameData[0].name);
          }
        } else {
          this.toastr.error(
            'Please enter a valid address.',
            'Error'
          );
          return false;
        }
      }
    );
  }

  getSearchResults(searchText){
    this.spinner.show();
    savedFilters.staffList = this.FilterStaffList;
    const condition = {
      text: searchText
    }
    this.userService.getSearchResults(condition).subscribe(data => {
      if(data.status == 200){
        this.staffList = data.data;
        this.staffFilter(this.staffList);
        this.spinner.hide();
      }else {
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

  GetSearchOnLocation(){
    let addressId = [];
    let userId = [];
    addressId = this.addressList.filter(add =>{
      if((add.location !== undefined && add.location.lat ==  this.locat.latitude) && (add.location !== undefined && add.location.lng ==  this.locat.longitude)){
        return add;
      }
    })
    addressId.map( user =>{
      userId.push(user.userId);
    })
    if(userId.length){
    const userCondition = {
      _id : { "$in": userId }
    }	
    this.userService.getUsersBasedOnLocation(userCondition).subscribe(data =>{
      if(data.status == 200){
          this.staffList = data.data;
          this.staffFilter(this.staffList);
      }else {
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
  }

  staffFilter(staffList){
    this.staffList = staffList;
    const self = this;
    let address = this.addressList;
    let totalJobs = this.totalJobsWorked;
    let totalcancelled = this.totalCancelled;
    if (this.staffList.length) {
      this.staffList.forEach(function (staff) {
        if(self.favoriteList.length){
        const found = self.favoriteList.filter((favorite) => {
          return (self.currentUser._id === favorite.userId && favorite.favoriteId && favorite.favoriteId._id === staff._id);
        });
        if (found.length) {
          staff['favoriteInfo'] = found[0];
        }
      }
        if(self.positionTypes.length){
          self.positionTypes.filter((positionType) => {
              if(positionType._id === staff.positionType){
                staff.positionType = positionType.name;
              }
          });
        }
        const foundExperience = self.experienceLists.filter((experience) => {
          return (staff.experience && experience._id === staff.experience[0]);
        });
        if (foundExperience.length) {
          staff.experience = foundExperience[0].experience;
        }
        if(address.length){
          staff['staffAddressInfo'] = address.filter( addr => {
            if(staff._id === addr.userId){
              staff['city'] = addr.city.city;
              staff['state'] = addr.state.state;
              staff['zipcode'] = addr.zipcode.zipcode;
              staff['skill'] = addr.skill;
              return addr;
            }
          })
        }
        if(totalJobs.length){
          let jobCount = totalJobs.filter( jobs => {
            if(jobs.staffId != null && jobs.staffId._id === staff._id){
                return jobs;
            }
          })
          staff['jobCount'] = jobCount.length;
        }
        if(totalcancelled.length){
          let cancelledJobs = totalcancelled.filter( jobs => {
            if(jobs.staffId != null && jobs.staffId._id === staff._id){
                return jobs;
            }
          })
          staff['cancelledJobs'] = cancelledJobs.length;
        }
        const totalRatingCount = self.ratings.filter( ratingUser => {
          if(ratingUser.staffId === staff._id){
            return ratingUser;
          }
        })  

        staff['ratingCount'] = totalRatingCount.length;
      });
      if(this.favorites){
              this.staffList =  this.staffList.filter(staff => {
              if(staff.favoriteInfo){
                return staff;
              }              
        });
      }
      if(this.FilterStaffList.skills && this.FilterStaffList.skills.length > 0){
        let p1 = this.FilterStaffList.skills;
        let finalStaffList = [];
        this.staffList = this.staffList.map(p2 => {
          let c = 0;
        const p = p1.map(val => {
          val = this.skillsList.filter(v=> v._id.includes(val._id));
          let w = p2.staffAddressInfo[0].skill.ids;
           w.map(staffSkills =>{
            if(staffSkills.skill === val[0].skill){
              c = c + 1;
              if(p1.length == c){
                finalStaffList.push(p2);
              }
            }
          })
        });
      })
      this.staffList = finalStaffList;
      }
     
      if(this.locationData){
        this.staffList = this.staffList.filter( staff =>{
          if(staff.staffAddressInfo !== undefined && staff.staffAddressInfo.length){
          if((staff.staffAddressInfo[0].location !== undefined && staff.staffAddressInfo[0].location.lat ==  this.locat.latitude) && (staff.staffAddressInfo[0].location !== undefined && staff.staffAddressInfo[0].location.lng ==  this.locat.longitude)){
            return staff;
          }
        }
        })
      }
      this.sortStaff();
      return false;
    }
  }

  closeInvite(){
    this.selOfferInvite = [];
  }

  fetchRoute(){
    this.globalService.previousRoute = this.router.url;
  }

  closeAllDropdowns(){
    this.isCollapse = true;
    this.isCollapseSort = true;
  }

  getRatingsCount() {
    var condition = {
      ratedBy : {$eq : environment.USER_TYPE.PRACTICE},
      status  : environment.RATING_STATUS.DONE
    };
  
    this.ratingService.getRatings({condition: condition}).subscribe(async data => {
      if (data.status === 200) {
          if (data.data) {
            this.ratings = data.data;
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