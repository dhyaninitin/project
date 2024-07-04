import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import * as moment from 'moment';
import { GlobalService } from '../service/global.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { JobsService } from '../../views/dashboard-pages/dental-practice/jobs/job-posts/jobs.service';
import { environment } from '../../../environments/environment';
import { Filter } from './job-filter.model';
import { ToastrService } from 'ngx-toastr';
import { JwtService } from '../service/jwt.service';
import { currentUser } from '../../layouts/home-layout/user.model';
import { Favorite } from '../staff-list/favorite.model';
import { FavoriteService } from '../service/favorite.service';
import { ModalDirective } from 'ngx-bootstrap';
import { SortService } from '../service/sort.service';
import { OfferService } from '../service/offer.service';
import { map } from 'rxjs/operators';
import { savedFilters } from '../../shared-ui/global/allFilters';
import { SpecialtyService } from '../../views/dashboard-pages/admin/specialties/specialties.service';
import { CertificateService } from '../../views/dashboard-pages/admin/certificates/certificates/certificates.service';
import { PositionTypeService } from '../service/positionType.service';
import { SkillsService } from '../../views/dashboard-pages/admin/skills/skills/skills.service';
import { SkillTypeService } from '../../views/dashboard-pages/admin/skills/skill-type/skill-type.service';
import { PracticeService } from '../../views/dashboard-pages/admin/practice/practice.service';
import { EventEmitterService } from '../service/event-emitter.service';
import { NgxCarousel } from 'ngx-carousel';
import { Router } from '@angular/router';
import { UsersService } from '../service/users.service';
import { Common } from '../service/common.service';
import { CertificateTypeService } from '../../views/dashboard-pages/admin/certificates/certificate-type/certificate-type.service';
import { RatingService } from '../service/rating.service';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent implements OnInit {
  @ViewChild('emptyJobListModal', { static: false })
  public emptyJobListModal: ModalDirective;
  PositionTypeData: any = [];
  experienceData: any = environment.JOB_EXPERIENCE;
  milesData: any = [];
  startDate: any = '';
  enabled: any;
  jobList: any = [];
  jobTypes: any = environment.JOB_TYPE;
  paymentMethod: any = environment.PAYEMENT_METHOD;
  offerStatus: any = environment.OFFER_STATUS_NEW;
  userType: any = environment.USER_TYPE;
  profileStatus: any = environment.PROFILE_STATUS;
  viewChecked = {
    dashboardJobs: false,
    favoritesJobs: false,
    homeJobs: false,
  };
  viewProfileLink = '/#/staff/job-details';
  // formattedJobDates = [];
  datePickerConfig2: any = {
    allowMultiSelect: true,
    disableKeypress: true,
    format: 'MMM DD,YYYY'
  };
  sendOfferList: any = [];
  favoriteList: any = [];
  currentUser: currentUser = new currentUser;
  filterJobList: any = new Filter;
  favorite: Favorite = new Favorite();
  itemsPerPage = 9;
  rangeDatepickerConfig = {
                          rangeInputFormat : 'MMMM DD YYYY',
                          containerClass:    'theme-dark-blue',
                          isAnimated: true,
                          adaptivePosition: true
                           };
  today: Date;
  isCollapsed: boolean = true;
  isCollapse: boolean = true;
  isCollapseSort: boolean = true;
  isCollapseSpec: boolean = true;
  isCollapseEquip: boolean = true;
  isCollapseCompen: boolean = true;
  favorites: boolean = false;
  certificatesList: any = [];
  specialtyList: any = [];
  positionTypes: any = [];
  skillsList: any = [];
  skillTypeList: any = [];
  benefitsList = [
    {_id:0, benefits:'Sign on bonus'},
    {_id:1, benefits:'Dental plan'},
    {_id:2, benefits:'Retirement/401K/ profit sharing'},
    {_id:3, benefits:'Health Insurance'},
    {_id:4, benefits:'PTO'},
    {_id:5, benefits:'Associate Partnership Opportunity'},
    {_id:6, benefits:'Associate Buyout Opportunity'},
    {_id:7, benefits:'Vacations'},
    {_id:8, benefits:'Sick days'},
    {_id:9, benefits:'Relocation Assistance'},
    {_id:10, benefits:'Continuing Education'},
    {_id:11, benefits:'Uniform allowance'},
    {_id:12, benefits: 'Remote Work'}
  ];
  softwaresList: any = [];
  practiceTypeList: any = [];
  positionId: any = '';
  public carouselOne: NgxCarousel;
  url: any;
  staffPositionType: any;
  staffPositionId: any;
  certificateTypeList: any = [];
  declinedOffer: boolean = false;
  ratings: any = [];
  
  constructor(
    private globalService: GlobalService,
    private jobsService: JobsService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private jwtService: JwtService,
    private favoriteService: FavoriteService,
    private sortService: SortService,
    private offerService: OfferService,
    private specialtyService: SpecialtyService,
    private certificatesService: CertificateService,
    private positionTypeService: PositionTypeService,
    private skillTypeService: SkillTypeService,
    private skillsService: SkillsService,
    private practiceService: PracticeService,
    private eventEmitterService: EventEmitterService,
    private userService: UsersService,
    public common: Common,
    private router: Router,
    private certificateTypeService: CertificateTypeService,
    private ratingService: RatingService,
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    setTimeout(() => {
      this.PositionTypeData = this.globalService.positionTypeData;
      // this.experienceData = this.globalService.experienceData;
      this.milesData = this.globalService.milesData;
    }, 2000);
    if (window.location.href.includes('/job-listing')) {
      this.viewChecked.homeJobs = true;
      this.viewProfileLink = '/#/job-details';
    } else  if (window.location.href.includes('favorites-jobs')) {
      this.viewChecked.favoritesJobs = true;
    } else {
      this.viewChecked.dashboardJobs = true;
    }
  }

  ngOnInit() {
    this.filterJobList.address = (this.currentUser.address) ? this.currentUser.address : '';
    this.getAlloffers() ;
    // this.getFavoriteList('onload');
    setTimeout(() => {
      this.globalService.topscroll();
    }, 200);
    if ( savedFilters.jobList) {
      this.filterJobList = savedFilters.jobList;
    }
    if (this.currentUser.profileVerificationStatus !== undefined && this.currentUser.profileVerificationStatus !== this.profileStatus.VERIFIED ) {
      ($('#warningStaffVerificationModel') as any).modal('show');

    $(()=>{
      $('#warningStaffVerificationModel').focusout(function(){
        ($('#warningStaffVerificationModel') as any).modal('hide');
        const url = '/#/staff/dashboard';
        window.open(url,'_self');
      })
    })
  }
  
    this.getCurrentUserInfo();
    this.getPracticeData();
    this.getRatingsCount();
    this.getSkillTypeList();
    this.getPositionList();
    this.getSkillsData();

    //if (this.eventEmitterService.subsVar==undefined) {    
      this.eventEmitterService.subsVar = this.eventEmitterService.    
      invokeSearchJobsComponentFunction.subscribe((searchText) => { 
       this.searchJobsByNameOrPosition(searchText);
      })
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

  this.jobsService.showLeftMenuForJobs = true;
  this.jobsService.fetchRoute = this.router.url;
}

  public myfunc(event: Event) {
  }

  closeAndRedirect(){
    ($('#warningStaffVerificationModel') as any).modal('hide');
    this.router.navigate(['staff/dashboard']);
  }

  setDateRange() {
    if (this.filterJobList.jobType === this.jobTypes.TEMPORARY) {
      this.today = new Date();
    } else {
      this.today = null;
    }
  }

  // getJobs() {
  //   // this.closeModel();
  //   if (this.filterJobList.miles) {
  //     this.filterJobList.miles = 0;
  //   }
  //   this.spinner.show();
  //   const condition = {
  //                       $or: [
  //                             {status : environment.JOB_STATUS.OPEN},
  //                             {status : environment.JOB_STATUS.CLOSED}
  //                           ],
  //                       draft: false,
  //                       visibility : {$ne: environment.JOB_VISIBILITY.PRIVATE}
  //                     };
  //   this.jobsService.getJobs({ condition: condition }).subscribe(
  //     data => {

  //        if (data.status === 200) {
  //         this.jobList = data.data;
  //         const self = this;
  //          if (this.jobList.length && self.favoriteList.length) {
  //           this.jobList.forEach(function(staff) {
  //             const found =  self.favoriteList.filter((favorite) => {
  //                 return (self.currentUser._id === favorite.userId && favorite.favoriteId && favorite.favoriteId._id  === staff._id);
  //               });
  //               if (found.length) {
  //                     staff['favoriteInfo'] = found[0];
  //               }
  //             });
  //          }
  //       }
  //       this.spinner.hide();
  //     },
  //     error => {
  //       this.spinner.hide();
  //       // this.toastr.error(
  //       //   'There are some server Please check connection.',
  //       //   'Error'
  //       // );
  //     }
  //   );
  // }
  getAlloffers() {
    const condition = {
      staffId: this.currentUser._id,
      status      :  {
                        '$in' : [
                                  environment.OFFER_STATUS_NEW.OFFER,
                                  environment.OFFER_STATUS_NEW.DECLINE,
                                  environment.OFFER_STATUS_NEW.CONTRACT,
                                ]
                     },
    };

    this.offerService.getAllOffers({ condition}).subscribe( data => {
      if (data && data.status === 200) {
        // if (data.data.length > 0) {
          this.sendOfferList = data.data;         
           this.getFavoriteList();
          /* let isReturn = false;
          this.sendOfferList = data.data.map(  (offer, index) => {
            if (index === (data.data.length - 1)) {
              isReturn = true;
            };
            if(offer.jobPostId && offer.jobPostId._id) {
              return offer.jobPostId._id;
            }
          });
          if(isReturn) {
            this.getFavoriteList();
          }
        } else {
          this.getFavoriteList();
        } */
      } else {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    })
  }

  getFavoriteList(status?: String) {
    const condition = {
      userId : this.currentUser._id,
      type : environment.FAVORITE_TYPE.JOB,
    };
    this.favoriteService.getFavoriteJob({condition: condition}).subscribe(
      data => {
        if (data.status === 200) {
            this.favoriteList  = data.data;
            this.favoriteList = this.favoriteList.filter( value => {
              return (value.favoriteId);
            });
            // if (status) {
              this.filterJobs();
            // }
            // else {
            //   this.getJobs();
            // }
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

  addFavorite(jobDetail: any, index) {
    if (jobDetail.favoriteInfo) {
      this.removeFavorite(jobDetail, index);
      this.toastr.success('Job unsaved successfully.','Success');
      return false;
    }
    this.favorite.userId = this.currentUser._id;
    this.favorite.type = environment.FAVORITE_TYPE.JOB;
    this.favorite.favoriteId = jobDetail._id;
    this.favoriteService.addFavorite(this.favorite).subscribe(
      data => {
        if (data.status === 200) {
          const favoriteInfo = data.data;
          this.favoriteList.push(data.data);
          this.jobList[index]['favoriteInfo'] = favoriteInfo;
          this.toastr.success('Job saved successfully.','Success');
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

  removeFavorite(jobDetail, index) {
    this.favoriteService.removeFavorite({_id: jobDetail.favoriteInfo._id }).subscribe(
      data => {
        if (data.status === 200) {
          this.favoriteList = this.favoriteList.filter(function(favorite) {
            return favorite._id !== jobDetail.favoriteInfo._id;
          });
          console.log(this.favoriteList);
          delete this.jobList[index].favoriteInfo;
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

  sortJobs() {
    console.log('I am in sort Jobs','----------------------------------');
    if (this.jobList.length === 1) {
      this.spinner.hide();
      return false;
   }
    switch (this.filterJobList.sort) {
      case 'ascending':
        this.jobList = this.sortService.ascendingSort('jobTitle', this.jobList);
        this.spinner.hide();
        break;
      case 'descending':
        this.jobList = this.sortService.descendingSort('jobTitle', this.jobList);
        this.spinner.hide();
        break;
      case 'rate':
        this.rateSort();
        this.spinner.hide();
        break;
      case 'proximity':
        this.jobList = this.sortService.ascendingSort('distance', this.jobList);
        this.spinner.hide();
        break;
      case 'jobDate':
        this.upcomingDateSort();
        this.spinner.hide();
        break;
      default:
          this.jobList = this.sortService.descendingSort('createdAt', this.jobList, 'date');
          this.spinner.hide();
          break;

    }
  }

  rateSort() {
  let salariedJob = this.jobList.filter( job => {
                      return job.paymentMethod === this.paymentMethod.SALARY;
                  });
  let hourlyJob = this.jobList.filter( job => {
                      return job.paymentMethod === this.paymentMethod.HOURLY;
                  });
    salariedJob =  this.sortService.ascendingSort('desiredSalaryRate', salariedJob);
    hourlyJob =  this.sortService.ascendingSort('desiredHourlyRate', hourlyJob);

      this.jobList = [ ...hourlyJob, ...salariedJob];
  }

  upcomingDateSort() {
    const currentDate  =  new Date().getTime();
    let upcommingDates = this.jobList.filter( job => {
      const jobDate = new Date(job.jobDate).getTime();
        return currentDate < jobDate;
    });
    let pastDates = this.jobList.filter( job => {
      const jobDate = new Date(job.jobDate).getTime();
      return currentDate > jobDate;
    });
    upcommingDates =  this.sortService.ascendingSort('jobDate', upcommingDates, 'date');
    pastDates =  this.sortService.ascendingSort('jobDate', pastDates, 'date');
    this.jobList = [ ...upcommingDates, ...pastDates];
  }

  filterJobs() {
    this.filterJobList.miles = Number(this.filterJobList.miles);
    this.filterJobList['paymentMethod'] = environment.PAYEMENT_METHOD.HOURLY;
    // Default Lat & lng
    if (!(this.filterJobList.address && this.filterJobList.miles)) {
      this.filterJobList['location'] = this.jwtService.currentLoggedUserInfo.location;
      this.getSearchJobs();
      return false;
    }
    // ----------------------
    const geocodeUrl = environment.googleGeocodeUrl.replace('#ADDRESS',
                                            this.filterJobList.address.replace(/[^\w\s]/gi, '').trim()
                                          );
    this.jobsService.geocodeAddress(geocodeUrl).subscribe(
      data => {
       if (data.results && data.results.length > 0) {
         this.filterJobList['location'] = {
                   longitude : data.results[0].geometry.location.lng,
                   latitude  : data.results[0].geometry.location.lat
               };
               this.getSearchJobs();
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

  getSearchJobs() {
    this.isCollapsed = true;
    this.isCollapse = true;
    this.isCollapseSort = true;
    this.isCollapseSpec = true;
    this.isCollapseEquip = true;
    this.isCollapseCompen = true;
    if(this.filterJobList.jobdates) {
      console.log(this.filterJobList.jobdates[0]);
    }
    // return false;
    savedFilters.jobList = this.filterJobList;
    this.jobsService.searchJobs({filterJobList : this.filterJobList}).subscribe(
      data =>  {
        if (data.status === 200) {
          this.jobList = data.data;
          // if (status && this.jobList.length === 0) {
          //   this.emptyApplyJobMdal();
          // }
          const self = this;
          if (this.jobList.length) {
            this.jobList.forEach(function(job) {
              const offerIndex = self.sendOfferList.map( value => value.jobPostId._id).indexOf( job._id);
              if (offerIndex > -1) {
                // if ( self.sendOfferList[offerIndex].sendOfferByPractice &&
                //     self.sendOfferList[offerIndex].status === self.offerStatus.OFFER) {
                //       job['isApplied'] = '';
                if( (!self.sendOfferList[offerIndex].sendOfferByPractice) &&
                  self.sendOfferList[offerIndex].status === self.offerStatus.OFFER && self.sendOfferList[offerIndex].offerStatus !== 'recounter') {
                    job['isApplied'] = 'Applied';
                  }
                   /* else if(self.sendOfferList[offerIndex].status === self.offerStatus.CONTRACT) {
                    job['isApplied'] = 'Contract';
                  } */
                   else if(self.sendOfferList[offerIndex].status === self.offerStatus.DECLINE) {
                    job['isApplied'] = 'Declined';
                  }
                  else if  (self.sendOfferList[offerIndex].status === environment.OFFER_STATUS_NEW.OFFER &&
                    (self.sendOfferList[offerIndex].offerSteps.initial.offerBy === environment.USER_TYPE.PRACTICE)
                    && self.sendOfferList[offerIndex].sendOfferByPractice
                    && (environment.OFFER_TYPE.INITIAL === self.sendOfferList[offerIndex].offerStatus)
                    ){
                      job['isApplied'] = 'Invited'
                    }

                    else if(self.sendOfferList[offerIndex].sendOfferByPractice && 
                      self.sendOfferList[offerIndex].status === environment.OFFER_STATUS_NEW.OFFER &&
                      (self.sendOfferList[offerIndex].offerSteps.initial.offerBy === environment.USER_TYPE.STAFF)){
                        job['isApplied'] = 'Applied'
                      }
                      else if (self.sendOfferList[offerIndex].status === environment.OFFER_STATUS_NEW.OFFER
                        && (self.sendOfferList[offerIndex].offerSteps.initial.offerBy === environment.USER_TYPE.PRACTICE)){
                              job['isApplied'] = 'Final Offer Received'
                        }

                  if(self.sendOfferList[offerIndex].offerStatus === 'counter'){
                    job['negotiatedOffer'] = true;
                  }
                  if(self.sendOfferList[offerIndex].offerStatus === 'counter' && self.sendOfferList[offerIndex].status === self.offerStatus.DECLINE){
                    job['negotiatedOffer'] = false;
                    job['isApplied'] = 'Counter Offer Declined';
                  }
                  if(self.sendOfferList[offerIndex].offerStatus === 'recounter' && self.sendOfferList[offerIndex].status === self.offerStatus.DECLINE){
                    job['negotiatedOffer'] = false;
                    job['isApplied'] = 'Final Offer Declined';
                  }
                  if(self.sendOfferList[offerIndex].status === self.offerStatus.DECLINE)
                  {
                    job['declinedOffer'] = true;
                  }
                        
              }
              let totalApplications = self.sendOfferList.filter(offer => {
                if(job._id === offer.jobPostId._id){
                if((!offer.sendOfferByPractice) && offer.status === self.offerStatus.OFFER)
                {
                  return offer;
                }
              }
              })
              job['applications'] = totalApplications.length;
            //---- Used to calculate Distance
              job['distance'] = self.sortService.calulateDistance(self.filterJobList.location.lat,
                                                        self.filterJobList.location.lng,
                                                        job.locationLatLng.latitude,
                                                        job.locationLatLng.longitude,
                                                        'M'
                                                      );
              //------------------------------  UNCOMMENT THIS TRIPLE SLASH CODE

              // job['distance'] = self.sortService.calulateDistance(  self.sendOfferList[offerIndex].jobPostId.locationLatLng.latitude,
              //                                           self.sendOfferList[offerIndex].jobPostId.locationLatLng.longitude,
              //                                           job.locationLatLng.latitude,
              //                                           job.locationLatLng.longitude,
              //                                           'M'
              //                                         );
              const found =  self.favoriteList.filter((favorite) => {
                  return (self.currentUser._id === favorite.userId && favorite.favoriteId && favorite.favoriteId._id  === job._id);
                });
                if (found.length) {
                      job['favoriteInfo'] = found[0];
                }

              const totalRatingCount = self.ratings.filter( ratingUser => {
                if(ratingUser.practiceId === job.createdBy._id){
                  return ratingUser;
                }
              })  

              job['ratingCount'] = totalRatingCount.length;

              });
              if(this.filterJobList.accountType){
                this.jobList = this.jobList.filter(job =>{
                  if(job.createdBy.accountType.toLowerCase() === this.filterJobList.accountType.toLowerCase()){
                    return job;
                  }
                }) 
              }
              if(this.filterJobList.companyName){
                this.jobList = this.jobList.filter(job =>{
                  if(job.createdBy.practiceAccount === 'multi' && job.createdBy.companyName.toLowerCase().includes(this.filterJobList.companyName.toLowerCase())){
                    return job;
                  }
                }) 
              }
              if(this.favorites){
                this.jobList = this.jobList.filter(job =>{
                  if(job.favoriteInfo){
                    return job;
                  }
                })
              }
              //Qualification filters
              if(this.filterJobList.skills && this.filterJobList.skills.length > 0){
                let finalSkillsList = []
                this.jobList.map(job => {
                  let c = 0;
                  let skills = [];
                  let filterSkills = this.filterJobList.skills;
                  skills.push(job.requiredSkills)
                  skills.push(job.preferredSkills)
                  skills = [].concat(...skills);
                  skills.map(skill => {     
                    filterSkills.map( filterSkill => {
                      if(filterSkill._id === skill._id){
                        c=c+1;
                        if(filterSkills.length == c){ finalSkillsList.push(job); }
                      }})})})
                this.jobList = finalSkillsList;
              }
              if(this.filterJobList.specialty && this.filterJobList.specialty.length > 0){
                let finalSpecialtyList = []
                this.jobList.map(job => {
                  let c = 0;
                  let specialty = [];
                  let filterSpecialty = this.filterJobList.specialty;
                  specialty.push(job.requiredSpecialities)
                  specialty.push(job.preferredSpecialities)
                  specialty = [].concat(...specialty);
                  specialty.map(specialty => {     
                    filterSpecialty.map( filterSpecial => {
                      if(filterSpecial._id === specialty._id){
                        c=c+1;
                        if(filterSpecialty.length == c){ finalSpecialtyList.push(job); }
                      }})})})
                this.jobList = finalSpecialtyList;
              }
              if(this.filterJobList.certificates && this.filterJobList.certificates.length > 0){
                let finalCertificatesList = []
                this.jobList.map(job => {
                  let c = 0;
                  let certificates = [];
                  let filtercertificate = this.filterJobList.certificates;
                  certificates.push(job.requiredCertificates)
                  certificates.push(job.preferredCertificates)
                  certificates = [].concat(...certificates);
                  certificates.map(certificate => {     
                    filtercertificate.map( filterCertifi => {
                      if(filterCertifi._id === certificate._id){
                        c=c+1;
                        if(filtercertificate.length == c){ finalCertificatesList.push(job); }
                      }})})})
                this.jobList = finalCertificatesList;
              }
              this.sortJobs();
              return false;
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

  closeModel() {
    this.emptyJobListModal.hide();
  }

  clearFilters(){
    this. filterJobList = new Filter;
    this.favorites = false;
  }
  
  getPracticeData() {
    this.practiceService.getPractice({}).subscribe(
      data => {
        if (data.status === 200) {
          this.practiceTypeList = data.data;
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }
  
  getPositionList(){
    this.positionTypeService.getPositionType({}).subscribe(
      data => {
        if (data.status === 200) {
          this.positionTypes = data.data;
          this.positionId = this.positionTypes.filter(position =>{
            if(position.name.toLowerCase() === this.filterJobList.positionType.toLowerCase()){ return position._id}
          })
          this.getCertificateTypeList(this.positionId);
        }
        this.spinner.hide();
      },
      error => {
        this.globalService.error();
      }
    );
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
            this.softwaresList = this.skillsList.filter(val =>{
              if(val.skill != 'Other'){
                if(val.skillType == this.skillTypeList[0]._id){
                  return this.skillsList
                }
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

  getSkillTypeList(){
    this.skillTypeService.getSkillTypeList({}).subscribe(data=>{
      if(data.status == 200){
        this.skillTypeList = data.data;
        this.skillTypeList = this.skillTypeList.filter(skillType =>{ 
          if(skillType.skillType === 'Softwares'){
            return skillType;
          }
        })
      }
    },error =>{
      this.spinner.hide();
      this.toastr.error(
        'There are some server Please check connection.',
        'Error'
      );
    })
  }
  numToArrConverter(i: number) {
    return new Array(i);
  }

  calculateClosingJob(expireDate){
    const todayDate = new Date();  
    const startDate = new Date(expireDate);  
    return (Math.round((startDate.getTime() - todayDate.getTime())/(1000 * 60 * 60 * 24)));
  }

  
copyUrl(jobId){
  if(location.hostname === 'localhost'){
    this.url = location.hostname +':4200/#/job-details/'+ jobId;
  }else{
    this.url = location.hostname +'/#/job-details/'+ jobId;
  }
}

searchJobsByNameOrPosition(searchText){
  this.spinner.show();
  const condition = {
    text: searchText
  }
  if(searchText.length){
  this.jobsService.searchJobByPracticeNameAndPosition(condition).subscribe(data => {
    if(data.status == 200){
     this.jobList = data.data;
     this.filterSearch();
     setTimeout(() => {
      this.globalService.topscroll();
    }, 200);
    }
    this.spinner.hide();
  },error =>{
      this.spinner.hide();
      this.toastr.error(
        'There are some server Please check connection.',
        'Error'
      );
    })
  }else{
    setTimeout(() => {
      this.globalService.topscroll();
    }, 200);
    this.getSearchJobs();
  }
}

filterSearch(){
  const self = this;
  if (this.jobList.length) {
    this.jobList.forEach(function(job) {
      const offerIndex = self.sendOfferList.map( value => value.jobPostId._id).indexOf( job._id);
      if (offerIndex > -1) {
        if ( self.sendOfferList[offerIndex].sendOfferByPractice &&
            self.sendOfferList[offerIndex].status === self.offerStatus.OFFER) {
              job['isApplied'] = 'Received Offer';
        } else if( (!self.sendOfferList[offerIndex].sendOfferByPractice) &&
          self.sendOfferList[offerIndex].status === self.offerStatus.OFFER) {
            job['isApplied'] = 'Applied';
          }
           /* else if(self.sendOfferList[offerIndex].status === self.offerStatus.CONTRACT) {
            job['isApplied'] = 'Contract';
          } */
           else if(self.sendOfferList[offerIndex].status === self.offerStatus.DECLINE) {
            job['isApplied'] = 'Declined';
          }
      }
    //---- Used to calculate Distance
      job['distance'] = self.sortService.calulateDistance(self.filterJobList.location.lat,
                                                self.filterJobList.location.lng,
                                                job.locationLatLng.latitude,
                                                job.locationLatLng.longitude,
                                                'M'
                                              );
      //------------------------------  UNCOMMENT THIS TRIPLE SLASH CODE

      const found =  self.favoriteList.filter((favorite) => {
          return (self.currentUser._id === favorite.userId && favorite.favoriteId && favorite.favoriteId._id  === job._id);
        });
        if (found.length) {
              job['favoriteInfo'] = found[0];
        }

        const totalRatingCount = self.ratings.filter( ratingUser => {
          if(ratingUser.practiceId === job.createdBy._id){
            return ratingUser;
          }
        })  

        job['ratingCount'] = totalRatingCount.length;
      });
  }
  }

  getCurrentUserInfo() {
    const condition = {
                        _id : this.currentUser._id
                      };
    this.userService.getUserInfo(condition).subscribe( data => {
      if (data.status === 200) {
        if (data.data) {
          this.staffPositionId = data.data.positionType;
          this.getPositionType(this.staffPositionId)
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
      }
    });
  } 

  
getPositionType(positionId){
  const condition = {
    _id : positionId
  }
  this.positionTypeService.getPositionType({condition}).subscribe(data => {
    if(data.status == 200){
      this.staffPositionType = data.data[0].name;
    }
  })
}

  
showApplyButtonsOnPosition(offer){
  if(this.staffPositionType.toLowerCase().trim() === 'administration' && (offer.positionType.toLowerCase().trim() !== 'dentist' && offer.positionType.toLowerCase().trim() !== 'dental hygienist'))
  {
    return true;
  }
  else if(this.staffPositionType.toLowerCase().trim() === 'dental assistant' && (offer.positionType.toLowerCase().trim() !== 'dentist' && offer.positionType.toLowerCase().trim() !== 'dental hygienist')){
    return true;
  }
  else if(this.staffPositionType.toLowerCase().trim() === 'dental hygienist' && (offer.positionType.toLowerCase().trim() !== 'dentist')){
    return true;
  }
  else if(this.staffPositionType.toLowerCase().trim() === 'dentist'){
    return true;
  }
  else if(this.staffPositionType.toLowerCase().trim() === 'dentist certification'){
    return true;
  }
  else{
    return false;
  }
}

getTotalApplications(offer){
  //this.common.incDecJobCount(offer, 'sentStaffOffers', true);
  return 1;
}

closeAllDropdowns(){
    this.isCollapse = true;
    this.isCollapseSort = true;
    this.isCollapseSpec = true;
    this.isCollapseEquip = true;
    this.isCollapseCompen = true;
}

openSocialLink(id){
  if(id == 1){
    window.open("https://www.facebook.com/sharer/sharer.php?u=https://"+this.url, '_blank').focus();
  }
  if(id == 2){
    window.open("https://www.linkedin.com/sharing/share-offsite/?url=https://"+location.hostname, '_blank').focus();
  }
  if(id == 3){
    window.open("https://twitter.com/intent/tweet?url=https://"+this.url, '_blank').focus();
  }
}

shortCompanyName(cName){
  if(cName.length > 20){
    cName = cName.substr(0,19);
    cName = cName + '...';
    return cName
  }else{
    return cName;
  }
}
shortPracticeName(pName){
  if(pName.length > 20){
    pName = pName.substr(0,19);
    pName = pName + '...';
    return pName
  }else{
    return pName;
  }
}

checkCompanyAndPracticeName(type,cName,pName){
  if(type === 'multi' && cName.length && pName.length){
    let total = cName.length + pName.length;
    if(total > 18){
      return false;
    }else{  return true; }
  }
  else if(type === 'single'){
    if(pName.length > 18){
      return false;
    }else{ return false; }
  }else{
    return false;
  }
}

getRatingsCount() {
  var condition = {
   // practiceId : {$eq : this.jobDetail.createdBy._id},
    ratedBy : {$eq : environment.USER_TYPE.STAFF},
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
