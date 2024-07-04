import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { StaffProfile, License, Education, Calendar } from '../../../../shared-ui/modal/staff-profile.modal';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UsersService } from '../../../../shared-ui/service/users.service';
import { AlertService } from '../../../../shared-ui/alert/alert.service';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { environment } from '../../../../../environments/environment';
import * as moment from 'moment';
import { PracticeService } from '../../admin/practice/practice.service';
import { SkillsService } from '../../admin/skills/skills/skills.service';
import { ModalDirective } from 'ngx-bootstrap';
import { CalendarView, CalendarEvent, CalendarMonthViewDay, DAYS_OF_WEEK } from 'angular-calendar';
import { startOfDay, addMonths, endOfDay, differenceInCalendarDays } from 'date-fns';
import { Subject } from 'rxjs';
import { NgxImageCompressService } from 'ngx-image-compress';
import { StripeService } from '../../../../shared-ui/service/stripe.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { FirebaseService } from './../../../../shared-ui/service/firebase.service';
import { Address } from '../../../../shared-ui/modal/address.modal';
import { Country } from '../../admin/location/country/country.modal';
import { State } from '../../admin/location/state/state.modal';
import { City } from '../../admin/location/city/city.modal';
import { Zipcode } from '../../admin/location/zipcode/zipcode.modal';
import { StateService } from '../../admin/location/state/state.service';
import { CountryService } from '../../admin/location/country/country.service';
import { CityService } from '../../admin/location/city/city.service';
import { ZipcodeService } from '../../admin/location/zipcode/zipcode.service';
import { AddressService } from '../../../../shared-ui/service/address.service';
import { AlertConfirmService } from '../../../../shared-ui/service/alertConfirm.service';
import { AlertConfirm } from '../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { Specialty } from '../../admin/specialties/specialties.modal';
import { Experience } from '../../admin/experience/experience.modal';
import { SpecialtyService } from '../../admin/specialties/specialties.service';
import { ExperienceService } from '../../admin/experience/experience.service';
import { LicenseType } from '../../admin/license-type/license-type.modal';
import { LicenseTypeService } from '../../admin/license-type/license-type.service';
import { Options, LabelType, ChangeContext } from 'ng5-slider';
import { CertificateType } from '../../admin/certificates/certificate-type/certificate-type.modal';
import { Certificate } from '../../admin/certificates/certificates/certificates.modal';
import { CertificateService } from '../../admin/certificates/certificates/certificates.service';
import { CertificateTypeService } from '../../admin/certificates/certificate-type/certificate-type.service';
import { SkillTypeService } from '../../admin/skills/skill-type/skill-type.service';
import { SkillType } from '../../admin/skills/skill-type/skill-type.modal';
import { Skill } from '../../admin/skills/skills/skills.modal';
import { UserCalendarService } from '../../../../shared-ui/service/userCalendar.service';
import { PositionType } from '../../../../shared-ui/modal/positionType.modal';
import { PositionTypeService } from '../../../../shared-ui/service/positionType.service';
import { of } from 'rxjs';
import { NgWizardConfig, NgWizardService, StepChangedArgs, StepValidationArgs, STEP_STATE, THEME } from 'ng-wizard';
import { HttpClient } from '@angular/common/http';

// const colors: any = {
//   red: {
//     primary: 'orange',
//     secondary: 'orange'
//   },
//   blue: {
//     primary: 'red',
//     secondary: '#D1E8FF'
//   },
//   yellow: {
//     primary: '#e3bc08',
//     secondary: '#FDF1BA'
//   },
// };
moment.updateLocale('en', {
  week: {
    dow: DAYS_OF_WEEK.SUNDAY,
    doy: 0,
  },
});
@Component({
  selector: 'app-staff-profile',
  templateUrl: './staff-profile.component.html',
  styleUrls: ['./staff-profile.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class StaffProfileComponent implements OnInit {

  stepStates = {
    normal: STEP_STATE.normal,
    disabled: STEP_STATE.disabled,
    error: STEP_STATE.error,
    hidden: STEP_STATE.hidden
  };

  config: NgWizardConfig = {
    selected: 0,
    theme: THEME.dots,
    toolbarSettings: {
      showNextButton: false,
      showPreviousButton: false,
      toolbarExtraButtons: [
        // { text: 'Finish', class: 'btn btn-info', event: () => { alert("Finished!!!"); } }
      ],
    }
  };
  typecertification: any = [];
  generalTypecertification: any = [];
  type = false;
  general = false;
  // @ViewChild('showImageModal', {static: false }) showImageModal: ModalDirective;
  @ViewChild('customCalPopup', { static: false }) customCalPopup: ModalDirective;
  @ViewChild('dayClickedPopup', { static: false }) dayClickedPopup: ModalDirective;
  // @ViewChild('stripeConfirmPopup', { static: false }) stripeConfirmPopup: ModalDirective;
  @ViewChild('addEditLicenseModal', { static: false }) addEditLicenseModal: ModalDirective;
  @ViewChild('addEditEducationModal', { static: false }) addEditEducationModal: ModalDirective;
  @ViewChild('addEditCertificationModal', { static: false }) addEditCertificationModal: ModalDirective;
  @ViewChild('addEditSkillsModal', { static: false }) addEditSkillsModal: ModalDirective;
  @ViewChild('addStripeAccountPopup', { static: false }) addStripeAccountPopup: ModalDirective;
  @ViewChild('licenseForm', { static: false }) licenseForm: any;   
  @ViewChild('educationForm', { static: false }) educationForm: any;
  @ViewChild('f', { static: false }) form: any;
  viewImage: String = '';
  nextTab: number = 0;
  previousTab: number = 0;
  stripePopupMsg: '';
  // availabilityInfo: any = {
  //   available: false,
  //   start: new Date(),
  //   _id: ''
  // };
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  modifiedDate:boolean;
  // modalData: {
  //   action: string;
  //   event: CalendarEvent;
  // };
  // event: CalendarEvent
  // refresh: Subject < any > = new Subject();
  // calendarDays: any = [];
  // generalCalendar: any = [];
  // isShow: Boolean = true;
  storePreviousProfileStatus;
  staffProfileInfo: StaffProfile = new StaffProfile();
  positionTypeList: PositionType[] = [];
  profileStatus = environment.PROFILE_STATUS;
  calendarStatus = environment.CALENDAR_STATUS;
  calendarDateColor = environment.CALENDAR_DATE_COLOR;
  stripeUrl = environment.STRIPE_URL;
  enabled: any;
  // experienceData: any = environment.STAFF_EXPERIENCE;
  // availableDayValidation: any = [];
  /** Here is define property description editor config*/
  // editorConfig: any = {
  //   editable: true,
  //   spellcheck: true,
  //   height: '290px',
  //   // width: '200px',
  //   translate: 'yes',
  //   enableToolbar: true,
  //   showToolbar: true,
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
  // ckeConfig: any = {
  //   forcePasteAsPlainText: true,
  //   height: 200,
  //   toolbarGroups: [
  //      { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
  //      { name: 'paragraph', groups: ['list'] }
  //   ],
  //   removeButtons: 'Source,Save,NewPage,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Undo,Redo,Find,Replace,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Strike,Subscript,Superscript,CopyFormatting,RemoveFormat,Outdent,Indent,CreateDiv,Blockquote,BidiLtr,BidiRtl,Language,Unlink,Anchor,Image,Flash,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,Maximize,ShowBlocks,About',
  // };
  // requiredValidate: any = {
  //   email: '',
  //   firstName: '',
  //   lastName: '',
  //   phone: '',
  //   positionType: '',
  //   address: '',
  //   experience: '',
  //   milesTravelRadius: '',
  //   desiredHourlyRate: '',
  // };
  // dropdownSettings: any = {};
  // closeDropdownSelection = false;
  // disabled = false;
  // datePickerConfig2: any = {
  //   disableKeypress: true,
  //   min: moment(new Date()).format('MMM DD,YYYY'),
  //   format: 'MMM DD,YYYY'
  // };
  tabStep = 0;
  images: any = []; // an array of valid images
  DeleteGalleryData: any = [];
  // message: string = null; // a string to report the number of valid images
  uploadData: any = {
    profilePhoto: [],
    // moreCertifications: [],
    // cprCertification: [],
    // proMalpracticeIns: [],
    resume: [],
  };
  // editProfileAddress: String = '';
  todayDate: Date = startOfDay(new Date()); // Current Date
  endDate: Date = endOfDay(new Date()); // Current Date
  // futureDate: Date = startOfDay(addMonths(new Date(), 1)); // 1 month future date
  //Added one to add future date also
  // showCalendarDate = (differenceInCalendarDays(this.futureDate, this.todayDate) + 1); //show custom calendar dates;
  // customCalendarDates: any = [];
  customCalStartIndex = 0;
  previousData = {
    userData: new StaffProfile(),
    generalCalendar: new StaffProfile().genCalAvailableDays,
    customCalendarDates: [],
    address: new Address(),
    license: [],
    uploadData: {
      profilePhoto: [],
      // proMalpracticeIns: [],
      resume: []
    },
  };
  // prevCalendarData = {
  //   generalCalendar: new StaffProfile().genCalAvailableDays,
  //   customCalendar: [],
  // };
  calendarPopupMessage = '';
  showPopup: any = {
    any: {
      message: 'Select this if you are available All Day.',
      status: false,
    },
    specify: {
      message: 'Select this to specify the hours of your general Availability.',
      status: false,
    },
    availability: {
      message: 'Limiting availability will decrease the chance of getting hired.',
      status: false,
    },
  };
  warningMessages: any = {
    any: 'Select this if you are available All Day.',
    specify: 'Select this to specify the hours of your general Availability.',
    connectWithStripe: "Your profile will be automatically saved and submitted to the admin for review and approval. By selecting “Ok” you will be redirected to Stripe's website to set up and connect your Stripe account to Densub’s platform",
    changeStripe : "You are about to leave Densub and connect to Stripe’s platform"
  }
  defaultTime = '00:00';
  isConnectToStripe: Boolean = false;
  // tempStr: any = '';

  otherText = ['other', 'others'];
  // storedPreviousdata = {
  //   practiceProfileInfo:  new StaffProfile(),
  //   address : new Address()
  // };
  ispreviewProfile = false;
  address: Address = new Address();
  countryList: Country[] = [];
  stateList: State[] = [];
  cityList: City[] = [];
  zipcodeList: Zipcode[] = [];
  licenseTypeList: LicenseType[] = [];
  alertDetails: AlertConfirm = new AlertConfirm();
  specialtyList: Specialty[] = [];
  experienceList: Experience[] = [];
  othersId = {
    clinicalOther: '',
    administrationOther: '',
    softwaresOther: '',
    specialty: '',
  };
  selectedSpecialty: Specialty[] = [];
  filteredSpecialtyList: Specialty[] = [];
  addNewLicense: License = new License();
  addNewEducation: Education = new Education();
  licenseStateList: State[] = [];
  graduationYearList: number[] = [];
  selectedIndex = -1;
  refresh: Subject<any> = new Subject();
  date = new Date('21 July 1947 14:48 UTC');
  
  startTime = startOfDay(new Date(this.date.getTime() + this.date.getTimezoneOffset() * 60000)).getTime();
  endTime = endOfDay(new Date(this.date.getTime() + this.date.getTimezoneOffset() * 60000)).getTime();
  customCalStartTime = startOfDay(new Date(this.date.getTime() + this.date.getTimezoneOffset() * 60000)).getTime();
  customCalEndTime = endOfDay(new Date(this.date.getTime() + this.date.getTimezoneOffset() * 60000)).getTime();

  options: Options = {
    floor: startOfDay(new Date(this.date.getTime() + this.date.getTimezoneOffset() * 60000)).getTime(),
    ceil: endOfDay(new Date(this.date.getTime() + this.date.getTimezoneOffset() * 60000)).getTime(),
    step: 900000,
    translate: (value: number, label: LabelType): string => {
      return moment(value).format('hh:mm A'); // this will translate label to time stamp.
    }
  };


  certificateTypeList: CertificateType[] = [];
  certificateList: Certificate[] = [];
  selectedCertificates = [];
  skillTypeList: SkillType[] = [];
  skillsList: Skill[] = [];
  selectedSkills = [];
  customCalendarDates: Calendar[] = [];
  selectedCustomCalDate: Calendar = new Calendar();
  showLicense = false;
  showHideLicenseSection = false;
  isDentalAssistant = false;
  assistNoShowSpecialty = ['general dentistry', 'prosthodontics', 'oral surgery', 'orthodontics', 'endodontics', 'pediatric dentistry', 'periodontics', 'other', 'others'];
  firstInvalidForm: boolean = true;
  recordList: any = [];
  stripeId = "";

  constructor(
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private usersService: UsersService,
    private alertService: AlertService,
    private jwtService: JwtService,
    private practiceService: PracticeService,
    private skillsService: SkillsService,
    private skillTypeService: SkillTypeService,
    private stripeService: StripeService,
    private imageCompress: NgxImageCompressService,
    private cookieService: CookieService,
    private router: Router,
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
    private stateService: StateService,
    private countryService: CountryService,
    private cityService: CityService,
    private zipcodeService: ZipcodeService,
    private addressService: AddressService,
    private alertConfirmService: AlertConfirmService,
    private specialtyService: SpecialtyService,
    private experienceService: ExperienceService,
    private licenseTypeService: LicenseTypeService,
    private certificateService: CertificateService,
    private certificateTypeService: CertificateTypeService,
    private userCalendarService: UserCalendarService,
    private positionTypeService: PositionTypeService,
    private ngWizardService: NgWizardService,
    private httpClient: HttpClient
  ) {
    // console.log(this.todayDate, this.endDate);
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getCountryList();
    this.getUsersData();
   // this.loadProfileData();
    this.route.params.subscribe(res => {
      if(res.tabStep == '2'){
        this.tabStep = res.tabStep-1; 
        this.config.selected = 1;
      }else if(res.tabStep == '5'){
        this.tabStep = res.tabStep; 
        this.config.selected = 4;
      }
      
     // this.ngWizardService.ActiveStepIndex = parseInt(res.tabStep);
    });
  
    this.globalService.topscroll();
   
  }


  saveStripeInfo(){
    this.route.queryParams.subscribe(res => {
      if(res.code !== undefined && res.code.length){
        this.stripeId = res.code;
        this.staffProfileInfo.stripeId = this.stripeId;
        this.createProfile();
      }
    }) 
  }

  stripeConfirmPopup(title) {
    // this.alertDetails = {
    //   title: 'Alert',
    //   message: { show: true, message: this.warningMessages[title] },
    //   cancelButton: { show: true, name: 'Cancel' },
    //   confirmButton: { show: true, name: 'Ok' },
    // };
    // this.alertConfirmService.openPopup(this.alertDetails).subscribe(data => { 
    //   if(data){
    //   this.connectStripe(true); 
    //   }
    // });
    this.stripePopupMsg = this.warningMessages[title];
    this.addStripeAccountPopup.show();
  }

  showLicenseSection() {
    if(!this.isDentalAssistant){
      this.showHideLicenseSection = true;  
    }
  }

  connectStripe(connectToStripe) {
    // this.stripeConfirmPopup.hide();
    this.isConnectToStripe = connectToStripe;
    if (connectToStripe) {
      this.validateForm();
    if(this.form.valid){
      window.open(this.stripeUrl, '_self');
    }
  }
  }

  updateGeneralToCustomCal(type = '') {
    const prevGeneralCalendar = this.previousData.generalCalendar;
    const generalCalendar = this.staffProfileInfo.genCalAvailableDays;
    const matchAllData = JSON.stringify(prevGeneralCalendar) === JSON.stringify(generalCalendar);
    if (matchAllData) {
      return false;
    }
    const changedDayIndexes = [];
    generalCalendar.forEach((value, index) => {
      if (JSON.stringify(value) !== JSON.stringify(prevGeneralCalendar[index])) {
        changedDayIndexes.push(index);
      }
    });

    if (this.customCalendarDates.length > 0 && changedDayIndexes.length > 0) {
      for (let index = 0; index < this.customCalendarDates.length; index++) {
        const day = this.customCalendarDates[index].day;
        if (changedDayIndexes.indexOf(day) > -1) {

          const startTime = this.mergeDateTime(this.customCalendarDates[index].start, generalCalendar[day].startTime);
          const endTime = this.mergeDateTime(this.customCalendarDates[index].start, generalCalendar[day].endTime);
          this.customCalendarDates[index].startTime = startTime;
          this.customCalendarDates[index].endTime = endTime;
          this.customCalendarDates[index].availableType = generalCalendar[day].availableType;
          this.customCalendarDates[index].status = (generalCalendar[day].available) ?
            this.calendarStatus.AVAILABLE : this.calendarStatus.UNAVAILABLE;
        }
        if ((this.customCalendarDates.length - 1) === index) {
          if (type === 'save') {
            this.saveCustomCalendar();
          } else {
            this.previousData.generalCalendar = JSON.parse(JSON.stringify(generalCalendar));
          }
        }
      }
    }
  }

  mergeDateTime(date, time) {
    const getDate = moment(date).format('MM/DD/YYYY');
    const getTime = moment(time).format('HH:mm:ss');
    return new Date(getDate + ' ' + getTime).getTime();
  }

  getCalendarTitle(day: any) {
    if (day && day.events.length) {
      const dateData = day.events[0];
      if (dateData.status === this.calendarStatus.AVAILABLE) {
        if (dateData.availableType === 'any') {
          return 'Available';
        } else {
          if(dateData.startTime == null){
            dateData.startTime = this.startTime;
          }
          if(dateData.endTime == null){
            dateData.endTime = this.endTime;
          }
          return moment(dateData.startTime).format('hh:mm A') + ' - ' + moment(dateData.endTime).format('hh:mm A');
        }
      } else {
        return 'Not Available';
      }
    } else {
      return '';
    }
  }


  dayClicked(event: any): void {
    // dayClicked(event: CalendarMonthViewDay): void {
    if (event && event.events.length && event.events[0].start && !this.dateIsValid(event.events[0].start)) {
      return;
    }
    if (event.events.length !== 0) {
      this.selectedCustomCalDate = event.events[0];
      if (this.selectedCustomCalDate.status === this.calendarStatus.AVAILABLE) {
        this.selectedCustomCalDate.toggleStatus = true;
      } else {
        this.selectedCustomCalDate.toggleStatus = false;
      }
      this.customCalStartTime = startOfDay(new Date(this.selectedCustomCalDate.start)).getTime();
      this.customCalEndTime = endOfDay(new Date(this.selectedCustomCalDate.start)).getTime();
      this.dayClickedPopup.show();
    }
  }

  dateIsValid(date: Date): boolean {
    // return date >= this.todayDate;
    const lastLength = this.customCalendarDates.length - 1;
    return date >= this.todayDate && date <= this.customCalendarDates[lastLength].start;
  }

  checkAvailability(date: Date) {
    return this.customCalendarDates.findIndex((day) => {
      return (differenceInCalendarDays(day.start, startOfDay(date)) === 0) ? true : false;
    });
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach(day => {
      if (this.dateIsValid(day.date)) {
        const customCalendarIndex = this.checkAvailability(day.date);
        const customCalendarDates = this.customCalendarDates[customCalendarIndex];
        if (customCalendarIndex > -1) {
          if (customCalendarDates.status === this.calendarStatus.AVAILABLE) {
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


  setView(view: CalendarView) {
    this.view = view;
  }

  getUsersData() {
    const self = this;
    // this.spinner.show();
    this.usersService.getUserInfo({ _id: this.jwtService.currentLoggedUserInfo._id }).subscribe(
      async data => {
        if (data.status === 200) {
          const userData = data.data;
          const profileKeys = Object.keys(new StaffProfile());
          profileKeys.map(key => {
            if (!Object.keys(userData).includes(key)) {
              userData[key] = (new StaffProfile())[key];
            }
          });

          this.cookieService.set('id', this.jwtService.currentLoggedUserInfo._id);

          if (userData.profilePhoto && userData.profilePhoto.length) {
            userData.profilePhoto.map(function (file) {
              const profilePhoto = {
                file: file,
                type: 'profilePhoto',
                name: file
              };
              self.uploadData.profilePhoto.push(profilePhoto);
              self.previousData.uploadData.profilePhoto.push(profilePhoto);
            });
          }


          if (userData.resume && userData.resume.length) {
            userData.resume.map(function (file) {
              const resume = {
                file: file,
                type: 'resume',
                name: file
              };
              self.uploadData.resume.push(resume);
              self.previousData.uploadData.resume.push(resume);
            });
          }
          if (userData.expMalpracticeInsDate) {
            userData.expMalpracticeInsDate = new Date(userData.expMalpracticeInsDate);
          }
          if (userData.licensesDetails.length) {
            userData.licensesDetails = userData.licensesDetails.map(license => {
              license.expirationDate = new Date(license.expirationDate);
              return license;
            });
          }
          userData.genCalAvailableDays.forEach((element,i) => {
            userData.genCalAvailableDays[i].startTime == null ? userData.genCalAvailableDays[i].startTime = this.startTime :userData.genCalAvailableDays[i].startTime = userData.genCalAvailableDays[i].startTime;
            userData.genCalAvailableDays[i].endTime == null ? userData.genCalAvailableDays[i].endTime = this.endTime : userData.genCalAvailableDays[i].endTime = userData.genCalAvailableDays[i].endTime;
          });
          this.staffProfileInfo = userData;
          if(this.staffProfileInfo.profileVerificationStatus === this.profileStatus.NEW){

          }else{
            ( function( $ ) {
              $( document ).ready( function(){
                  $('.accordion-collapse').removeClass('show');
              });
          })( jQuery );
          }
          
         
          this.getPositionTypeList();
          this.getCertificateList();
          this.getCertificateTypeList();
          this.getCountryList();
          this.getLicenseTypeList();
          this.getExperienceList();
          this.getSkillType();
          this.getUserCalendar();
          this.getAddressList();
          this.getSpecialtyList();
          this.saveStripeInfo();

          //--- selected Date for matching it with changed object
          this.previousData.generalCalendar = JSON.parse(JSON.stringify(userData.genCalAvailableDays));
          this.previousData.license = JSON.parse(JSON.stringify(userData.licensesDetails));
          this.previousData.userData = JSON.parse(JSON.stringify(userData));
          this.storePreviousProfileStatus = JSON.parse(JSON.stringify(userData.profileVerificationStatus));
          //----------------------------------------------------
          //this.spinner.hide();
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  checkShowLicense() {
    this.showHideLicenseSection = false;
    let stopLoop = false;
    // With no position Type Hide license
    const index = this.licenseTypeList.map((licenseType) => {
      return licenseType.positionType;
    }).indexOf(this.staffProfileInfo.positionType.toString());

    if (index === -1) {
      this.showHideLicenseSection = false;
    }
    this.positionTypeList.forEach(positionType => {
      // Check Dental Assistant Position
      if(!stopLoop){
      if ((positionType._id === this.staffProfileInfo.positionType && positionType.name.toLowerCase() === 'dental assistant')) {
        this.isDentalAssistant = true;
        stopLoop = true;
        // this.showLicense = true;
      }else if((positionType._id === this.staffProfileInfo.positionType && positionType.name.toLowerCase() === 'dental hygienist') || (positionType._id === this.staffProfileInfo.positionType && positionType.name.toLowerCase() === 'dentist')){
        this.showHideLicenseSection = true;
      }
      else{
        this.isDentalAssistant = false;
      }
    }
    });

    // Show licence to true when it is Administration
    if (!this.isDentalAssistant && this.showHideLicenseSection) {
      console.log("I am here to convert show license to true");
      this.staffProfileInfo.showLicense = true;
    }
    // setTimeout(() => {
    this.filteredSpecialty();
    this.getCertificateTypeList();
    // console.log(this.showHideLicenseSection, this.isDentalAssistant, '-----------------' );
  }

  filteredSpecialty(change = false) {
    if (this.isDentalAssistant) {
      if (this.staffProfileInfo.showLicense) {
        this.filteredSpecialtyList = this.specialtyList;
        console.log(this.filteredSpecialtyList, this.specialtyList);
      } else {
        this.filteredSpecialtyList = this.specialtyList.filter(specialty => {
          return this.assistNoShowSpecialty.indexOf(specialty.specialty.toString().toLowerCase()) > -1;
        });
      }
      if (change) {
        this.selectedSpecialty = [];
      }
    } else {
      this.filteredSpecialtyList = this.specialtyList;
    }
  }

  checkLicenseValid(): Boolean {
    const condition = (
      ((this.isDentalAssistant && this.staffProfileInfo.showLicense) || (!this.isDentalAssistant && this.showHideLicenseSection)) &&
      this.staffProfileInfo.licensesDetails.length > 0
    ) || !((this.isDentalAssistant && this.staffProfileInfo.showLicense) || (!this.isDentalAssistant && this.showHideLicenseSection));
    if (this.isDentalAssistant && !this.staffProfileInfo.showLicense) {
      // If assistant and selected no then empty license while saving
      this.staffProfileInfo.licensesDetails = (new StaffProfile()).licensesDetails;
    }
    return condition;
  }
  
  addMoreLicense() {
    this.staffProfileInfo.licensesDetails.push(
      new StaffProfile().licensesDetails[0]
    );
  }

  changeExpMalpracticeIns() {
    if (!this.staffProfileInfo.expMalpracticeIns) {
      this.staffProfileInfo.expMalpracticeInsDate = '';
    }
  }

  validateForm() {
    // this.staffProfileInfo.licensesDetails.length
    // console.log("I am in",this.checkLicenseValid());
    if (this.form.valid && this.checkLicenseValid()) {
      //  console.log("I am in");
      /*  -- Steps for saving profile
      * Geocoding
      * Upload Photo
      * Update User
      * Save address
      */

      const matchAllData = (
        JSON.stringify(this.staffProfileInfo) === JSON.stringify(this.previousData.userData) &&
        JSON.stringify(this.address) === JSON.stringify(this.previousData.address) &&
        JSON.stringify(this.customCalendarDates) === JSON.stringify(this.previousData.customCalendarDates)
        && JSON.stringify(this.uploadData) === JSON.stringify(this.previousData.uploadData)
      );
      console.log(matchAllData,)
      if (matchAllData && this.tabStep < 4) {
        this.next('next');
        return false;
      } else if (matchAllData && this.tabStep === 4) {
        if (this.ispreviewProfile) {
          this.previewProfile();
        } else if (this.isConnectToStripe) {
          window.open(this.stripeUrl, '_self');
          return false;
        } else {
          if(this.usersService.flag == 1){
            this.toastr.success('Your profile has been submitted to the admin for verification. This verification process may take up to 48 hours. We will send you an email confirmation when your profile has been verified.','Congratulations!',{timeOut : 600000});
            this.usersService.flag = 0;
          }
          this.router.navigate(['staff/dashboard']);
          return false;
        }
      } else {
        this.globalService.setLoadingLabel('Submitting... Please Wait.');
        this.spinner.show();
        this.staffProfileInfo.specialty.ids = this.selectedSpecialty.map(specialty => specialty._id);
        this.geocodeAddress();
      }

    } else {
      this.spinner.hide();
      this.toastr.warning(
        'Please check all the fields are filled.',
        'Warning'
      );
    }
  }

  async matchAndSave() {
    let count = 0;
    if (JSON.stringify(this.staffProfileInfo) !== JSON.stringify(this.previousData.userData) ||
      JSON.stringify(this.uploadData) !== JSON.stringify(this.previousData.uploadData)) {
      count++;
      await this.createProfile();
    }
    if (JSON.stringify(this.address) !== JSON.stringify(this.previousData.address)) {
      count++;
      await this.saveAddress();
    }
    if (
      JSON.stringify(this.customCalendarDates) !== JSON.stringify(this.previousData.customCalendarDates) ||
      JSON.stringify(this.previousData.generalCalendar) !== this.staffProfileInfo.genCalAvailableDays
    ) {
      count++;
      await this.saveCustomCalendarDates();
    }

    if (JSON.stringify(this.staffProfileInfo.licensesDetails) !== JSON.stringify(this.previousData.license) &&
      this.staffProfileInfo.profileVerificationStatus === environment.PROFILE_STATUS.VERIFIED
    ) {
      await this.sendNotificationToAdmin();
    }

    if (count) {
      let verifyMsg = 'Profile has been updated successfully.';
      if (this.staffProfileInfo.profileVerificationStatus === this.profileStatus.NEW ||
        this.staffProfileInfo.profileVerificationStatus === this.profileStatus.REJECTED) {
        this.usersService.flag = 1;   
        this.staffProfileInfo.profileVerificationStatus = this.profileStatus.PENDING;
      }

      if (this.storePreviousProfileStatus === this.profileStatus.NEW || this.storePreviousProfileStatus === this.profileStatus.REJECTED) {
        this.usersService.flag == 1; 
        verifyMsg = 'Your profile has been submitted to the admin for verification. This verification process may take up to 48 hours. We will send you an email confirmation when your profile has been verified.';
      }
      if (this.ispreviewProfile) {
        setTimeout(() => {
          this.spinner.hide();
          this.previewProfile();
        }, 1000);
        return false;
      }

      this.spinner.hide();
      if (this.tabStep < 5) {
        this.next('next');
        return false;
      } else {
        if (this.storePreviousProfileStatus === this.profileStatus.NEW || this.storePreviousProfileStatus === this.profileStatus.REJECTED){
          this.toastr.success(verifyMsg, 'Congratulations!', {timeOut:600000});
        }else{ 
          this.toastr.success(verifyMsg, 'Success');
        }
        if (this.isConnectToStripe) {
          window.open(this.stripeUrl, '_self');
          return false;
        } else {
          this.router.navigate(['staff/dashboard']);
          return false;
        }
      }

    } else {
      this.spinner.hide();
      if (this.ispreviewProfile) {
        this.previewProfile();
      } else {
        if (this.tabStep < 4) {
          this.next('next');
          return false;
        }
      }
    }
  }

  next(type: String) {
    if(this.nextTab != 2){
    $('html, body').animate({
      scrollTop: 0
    }, 600);
  }
    if (type === 'back') {
      this.tabStep = this.tabStep - 1;
    } else {
      //this.tabStep = this.tabStep + 1;
      // if (this.tabStep === 2) {

      // }
    }
  }

  uploadFile() {
    const self = this;
    // this.spinner.show();
    if (this.images.length) {
      let count = 0;
      this.images.map((image, index) => {
        self.compressFile(image.file, image.type, (err, resp) => {
          if (err) {
            resp = image.file;
          }
          self.globalService.uploadFile(resp).subscribe(
            (data: any) => {
              if (data.status === 200) {
                //|| image.type === 'cprCertification' || image.type === 'proMalpracticeIns'
                if (image.type === 'profilePhoto' || image.type === 'resume') {
                  self.staffProfileInfo[image.type] = (self.staffProfileInfo[image.type]) ?
                    self.staffProfileInfo[image.type] :
                    new StaffProfile()[image.type];
                  const deletpreviousePhoto = JSON.parse(
                    JSON.stringify(self.staffProfileInfo[image.type])
                  );
                  if (deletpreviousePhoto.length) {
                    self.DeleteGalleryData.push(deletpreviousePhoto[0]);
                  }
                  self.staffProfileInfo[image.type] = [data.imgPath];
                } else {
                  self.staffProfileInfo[image.type].push(data.imgPath);
                }
                count++;
                if (count === self.images.length) {
                  self.matchAndSave();
                }
              }
            },
            error => {
              self.globalService.error();
            }
          );
        });
      });
    } else {
      this.matchAndSave();
    }
  }

  geocodeAddress() {
    const addressLine2 = (this.address.addressLine_2) ? ',' + this.address.addressLine_1 : '';
    const country = this.countryList.filter(value => value._id === this.address.country);
    const state = this.stateList.filter(value => value._id === this.address.state);
    const city = this.cityList.filter(value => value._id === this.address.city);
    const zipcode = this.zipcodeList.filter(value => value._id === this.address.zipcode);
    const formattedAddress = this.address.addressLine_1 + addressLine2 + ',' + city[0].city + ',' +
      state[0].state + ' ' + zipcode[0].zipcode + ',' + country[0].country;
    const geocodeUrl = environment.googleGeocodeUrl.replace('#ADDRESS', formattedAddress);
    this.usersService.geocodeAddress(geocodeUrl).subscribe(data => {
      if (data.results && data.results.length > 0) {
        this.address.location = data.results[0].geometry.location;
        this.staffProfileInfo.location = data.results[0].geometry.location;
        this.uploadFile();
      } else {
        this.spinner.hide();
        this.toastr.warning(
          'Unable to geocode.Please check internet connection or address.',
          'Warning'
        );
        return false;
      }
    },
      error => {
        this.spinner.hide();
        this.toastr.warning(
          'Unable to geocode.Please check internet connection or address.',
          'Warning'
        );
        return false;
      }
    );
  }

  /**
   * Name: compressFile():
   * Description: This method will compress high quality image before upload.
   * @param files is file/video/doc info.
   * @param type is flag like photo/video/doc.
   * @param cb is a call back function.
   */
  compressFile(files?: any, type?: any, cb?: Function) {
    if (type) {
      // if (type !== 'moreCertifications') {
      cb(true, null);
    } else {
      // tslint:disable-next-line: prefer-const
      let self = this;
      const imageFile = files;
      const fileReader = new FileReader();

      fileReader.onload = function (fileLoadedEvent: any) {
        // self.uploadData[type][index].name = files.name;
        // console.warn('Size in bytes was:', self.imageCompress.byteCount(fileLoadedEvent.target.result));
        self.imageCompress
          .compressFile(fileLoadedEvent.target.result, -1, 75, 50)
          .then(result => {
            // console.warn('Size in bytes is now:', self.imageCompress.byteCount(result));
            const base64 = result;
            const ImageData = base64;
            const block = ImageData.split(';');
            const contentType = block[0].split(':')[1];
            const realData = block[1].split(',')[1];
            const blob = self.b64toBlob([realData], contentType, '');
            const blobs = new File([blob], files.name, {
              type: files.type
            });
            cb(false, blobs);
          });
      };
      fileReader.readAsDataURL(imageFile);
    }
  }

  /**
   * Name: b64toBlob():
   * Description: This method will change base64 image to blog image.
   * @param b64Data is image base64 data.
   * @param contentType is image type like jpg/png.
   * @param sliceSize is a image size
   * @return it will return blog image.
   */
  b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, {
      type: contentType
    });
    return blob;
  }

  /**
   * Name: selectFiles():
   * Description: If any photo/video/doc selected then this method will store gallery data in array
   * and Here is define max photo/video/doc upload.
   */
  selectFiles = (event, type) => {
    // image upload handler
    const files: FileList = event.target.files;
    let fileObj = {};
    let found = [];
    const self = this;
    for (let i = 0; i < files.length; i++) {
      if ((type === 'profilePhoto') && (!files.item(i).name.match(/\.(jpg|jpeg|png|gif)$/))) {
        this.toastr.warning(
          'You can upload only jpg, jpeg, png, gif image.',
          'Warning'
        );
        return false;
      } else if (type === 'resume' && !files.item(i).name.match(/\.(pdf|odt|doc|docx)$/)) {
        this.toastr.warning(
          'You can upload only pdf, odt, doc, docx.',
          'Warning'
        );
        return false;
      }else if(type === 'profilePhoto' && files.item(i).size >= 3000000){
        this.toastr.warning(
          'Required image size should be upto 3MB.',
          'Warning'
        );
        return false;
      }else if(type === 'resume' && files.item(i).size >= 5000000){
        this.toastr.warning(
          'Required document size should be upto 5MB.',
          'Warning'
        );
        return false;
      }
      const fileId = Math.random().toString(36).substring(7);
      fileObj = {
        file: files.item(i),
        uploadProgress: '0',
        type: type,
        id: fileId,
      };
      if (
        !self.uploadData[type] &&
        !self.uploadData[type].length &&
        self.images.length
      ) {
        found = self.images.filter(obj => {
          return obj.type === type;
        });
      } else {
        found = self.uploadData[type].filter(obj => {
          return obj.type === type;
        });
      }
      if (found.length <= 9) {
        //  || type === 'cprCertification' || type === 'proMalpracticeIns'
        if (type === 'profilePhoto' || type === 'resume') {
          self.uploadData[type] = [{
            file: '',
            uploadProgress: '0',
            type: type,
            status: 'new',
            fileObj: fileObj,
            id: fileId
          }];
          self.encode(files.item(i), type, fileId);
          const profilefound = self.images.filter(obj => {
            return obj.type === type;
          });
          if (profilefound.length) {
            if (profilefound.length) {
              // tslint:disable-next-line: prefer-const
              let index = self.images.indexOf(profilefound[0]);
              this.images[index] = fileObj;
            }
          } else {
            self.images.push(fileObj);
          }
        } else {
          self.uploadData[type].push({
            file: '',
            uploadProgress: '0',
            type: type,
            status: 'new',
            fileObj: fileObj,
            id: fileId
          });
          self.encode(files.item(i), type, fileId);
          self.images.push(fileObj);
        }
      } else {
        if (type === 'fileName') {
          self.toastr.warning('We can upload maximum 10 Photo.', 'Warning');
        } else if (type === 'videoName') {
          self.toastr.warning('We can upload maximum 10 Video.', 'Warning');
        } else {
          self.toastr.warning(
            'We can upload maximum 10 Documents.',
            'Warning'
          );
        }
        break;
      }
    }
    $('#' + type).val('');
  }


  /**
   * Name: encode():
   // tslint:disable-next-line: max-line-length
   * Description: This method will canvert
   blog image to base64 image this function called under selectFiles function and this method use only images .
   * @param files is file/video/doc info.
   * @param type is flag like photo/video/doc.
   * @param generateId is a selected image temp ID.
   */
  encode(files, type, generateId) {
    const self = this;
    const imageFile = files;
    const fileReader = new FileReader();
    const found = self.uploadData[type].filter(obj => {
      return obj.id === generateId;
    });
    const index = self.uploadData[type].indexOf(found[0]);
    if (files.type.includes('image')) {
      fileReader.onload = function (fileLoadedEvent: any) {
        self.uploadData[type][index].file = fileLoadedEvent.target.result;
        self.uploadData[type][index].name = files.name;
      };
      fileReader.readAsDataURL(imageFile);
    } else {
      self.uploadData[type][index].file = files;
      self.uploadData[type][index].name = files.name;
      self.uploadData[type][index].fileExtensonion = files.name;
    }
  }

  /**
   * Name: removeGallery():
   * Description: This method will remove photo/video/doc from gallery array.
   * @param files is file/video/doc info.
   * @param type is flag like photo/video/doc.
   *
   * ,
  CALENDAR_STATUS:{
    AVAILABLE: 'available',
    UNAVAILABLE: 'unavailable',
    BOOKED: 'booked',
  }
   */
  removeGallery(file?: any, type?: string) {
    const self = this;
    // tslint:disable-next-line: no-unused-expression
    self.uploadData[type];
    const index = self.uploadData[type].indexOf(file);
    self.uploadData[type].splice(index, 1);
    if (file.status) {
      // tslint:disable-next-line: no-shadowed-variable
      const index = self.images.indexOf(file.fileObj);
      self.images.splice(index, 1);
    } else {
      // tslint:disable-next-line: no-shadowed-variable
      const index = self.staffProfileInfo[type].indexOf(file.file);
      self.staffProfileInfo[type].splice(index, 1);
      self.DeleteGalleryData.push(file.file);
    }
  }


  removeError(id?: any) {
    let eleByClass: any;
    if (id) {
      const element = document.getElementById(id);
      eleByClass = element.getElementsByClassName('errorMsg');
    } else {
      // Remove All error message
      eleByClass = document.getElementsByClassName('errorMsg');
    }
    if (eleByClass.length > 0) {
      for (let i = 0; i < eleByClass.length; i++) {
        eleByClass[i].remove();
      }
    }
  }

  showError(id: any, message) {
    const element = document.getElementById(id);
    element.insertAdjacentHTML('beforeend', '<p style=\'color:red\' class=\'errorMsg\'>' + message + '</p>');
  }

  showFullImage(image: any, type: any = '') {
  
    image = (image.file) ? image.file : image;
    this.alertConfirmService.openImagePopup(image).subscribe(data => { });
  }

  getAddressList() {
    const condition = { userId: this.jwtService.currentLoggedUserInfo._id };
    this.addressService.getAddressList({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data && data.data.length > 0) {
            const addressData = data.data[0];
            const addressKeys = Object.keys(new Address());
            addressKeys.map(key => {
              if (!Object.keys(addressData).includes(key)) {
                addressData[key] = (new Address())[key];
              }
            });
            if (addressData.skill.ids.length > 0) {
              addressData.skill.ids = addressData.skill.ids.map(skill => skill._id);
            }
            this.address = addressData;
            this.previousData.address = JSON.parse(JSON.stringify(data.data[0]));
            this.getCountryList();
            this.getStateList();
            this.getCityList();
            this.getZipcodeList();
          } else {
            this.address = new Address();
            // Select default country
            this.countryList.map(country => {
              this.spinner.show();
              if (country.country === 'US') {
                this.address.country = country._id;
                this.getStateList();
                this.spinner.hide();
              }
            });
          }
        } else {
          this.globalService.error();
        }
      }, error => {
        this.globalService.error();
      });
  }

  getCountryList() {
    this.countryService.getCountryList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.countryList = data.data;
          //this.getStateList();
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  getStateList() {
    const condition = {
      countryId : this.address.country,
      status: 'active'
    }
    this.stateService.getStateList(condition).subscribe(
      data => {
        if (data.status === 200) {
          this.stateList = data.data;
          //this.getCityList();
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  getCityList() {
    this.spinner.show();
    const condition = {
      countryId : this.address.country,
      stateId : this.address.state,
      status: 'active'
    }
    this.cityService.getCityList(condition).subscribe(
      data => {
        if (data.status === 200) {
          this.cityList = data.data;
          this.spinner.hide();
          //this.getZipcodeList();
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  getZipcodeList() {
    this.spinner.show();
    const condition = {
      countryId : this.address.country,
      stateId : this.address.state,
      cityId : this.address.city,
      status: 'active'
    }
    this.zipcodeService.getZipcodeList(condition).subscribe(
      data => {
        if (data.status === 200) {
          this.zipcodeList = data.data;
          this.spinner.hide();
          //this.getUsersData();
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  showOlderAlert() {
    if (this.staffProfileInfo.isOlder) {
      return false;
    }
    if(this.staffProfileInfo.profileVerificationStatus !== this.profileStatus.NEW){
    this.alertDetails = {
      title: 'Alert',
      message: {
        show: true, message:
          "You must be 18 years and older to create a profile and join Densub's marketplace."
      },
      cancelButton: { show: false, name: 'Close' },
      confirmButton: { show: true, name: 'Okay' },
    };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe(data => { });
  }
  }

  showRemoveAlert(type = '', index) {
    this.alertDetails = {
      title: 'Alert',
      message: {
        show: true, message:
          'Are you sure you want to delete ' + type + ' ?'
      },
      cancelButton: { show: true, name: 'Cancel' },
      confirmButton: { show: true, name: 'Continue' },
    };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe(data => {
      if (data) {
        if (type === 'education') {
          this.removeEducation(index);
        } else if (type === 'license') {
          this.removeLicense(index);
        }
      }

    });
  }


  filterState() {
    this.address.state = '';
    this.address.city = '';
    this.address.zipcode = '';
  }

  filterCity() {
    this.address.city = '';
    this.address.zipcode = '';
  }

  filterZipcode() {
    this.address.zipcode = '';
  }

  getSpecialtyList() {
    if(this.staffProfileInfo.positionType){
    const condition = { positionType: this.staffProfileInfo.positionType };
    this.specialtyService.getSpecialtyList({ condition }).subscribe(data => {
      if (data.status === 200) {
        this.specialtyList = data.data;
        const index = this.specialtyList.findIndex(val => this.otherText.includes(val.specialty.toLowerCase()));
        if (index > -1) {
          this.othersId.specialty = this.specialtyList[index]._id;
          const putOtherAtLast = { ...this.specialtyList[index] };
          this.specialtyList.splice(index, 1);
          this.specialtyList.push(putOtherAtLast);
        }
        this.selectedSpecialty = this.specialtyList.filter(specialty => {
          return this.staffProfileInfo.specialty.ids.includes(specialty._id);
        });
        this.checkShowLicense();
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }else{
    this.showHideLicenseSection = false;
  }
  }

  getExperienceList() {
    const condition = { type: environment.USER_TYPE.STAFF };
    this.experienceService.getExperienceList({ condition }).subscribe(data => {
      if (data.status === 200) {
        this.experienceList = data.data;
      }
      this.spinner.hide();
    }, error => {
      this.globalService.error();
    });
  }

  getLicenseTypeList() {
    this.licenseTypeService.getLicenseTypeList({}).subscribe(data => {
      if (data.status === 200) {
        this.licenseTypeList = data.data;
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }



  showOtherSpecialty() {
    const index = this.selectedSpecialty.findIndex(val => this.othersId.specialty === val._id);
    return (index > -1);
  }

  showAddEditLicense(index = -1, license = new License()) {
    if (!this.address.country) {
      this.toastr.warning('Please select country from address.', 'Warning');
      return false;
    }
    const stateIds = this.staffProfileInfo.licensesDetails.map(val => {
      if (val.state !== license.state) {
        return val.state;
      }
    });
    this.licenseStateList = this.stateList.filter(state => {
      return (state.countryId === this.address.country && stateIds.indexOf(state._id) === -1);
    });
    if (index === -1) {
      const licneseTypeIndex = this.licenseTypeList.findIndex(type =>
        type.positionType.toString() === this.staffProfileInfo.positionType.toString());
      if (licneseTypeIndex > -1) {
        license.licenseType = this.licenseTypeList[licneseTypeIndex]._id.toString();
      }
      console.log("==================", license.licenseType, licneseTypeIndex)
    } else {
      license.expirationDate = new Date(license.expirationDate);
    }
    this.addNewLicense = { ...license };
    console.log(this.addNewLicense);
    this.selectedIndex = index;
    this.addEditLicenseModal.show();
  }

  removeLicense(index) {
    this.staffProfileInfo.licensesDetails.splice(index, 1);
  }

  saveLicense() {
    if (this.selectedIndex > -1) {
      this.staffProfileInfo.licensesDetails[this.selectedIndex] = { ...this.addNewLicense };
    } else {
      this.staffProfileInfo.licensesDetails.push({ ...this.addNewLicense });
    }
    this.addEditLicenseModal.hide();
    this.licenseForm.resetForm();
  }

  getLicenseType(licenseTypeId = '') {
    if (licenseTypeId && this.licenseTypeList.length > 0) {
      const found = this.licenseTypeList.filter(type => type._id === licenseTypeId);
      if (found.length > 0) {
        return found[0].licenseType;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  getState(stateId = '') {
    if (stateId && this.stateList.length > 0) {
      const found = this.stateList.filter(state => state._id === stateId);
      if (found.length > 0) {
        return found[0].state;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  showAddEditEducation(index = -1, education = new Education()) {
    this.createGraduationYear();
    this.addNewEducation = { ...education };
    this.selectedIndex = index;
    this.addEditEducationModal.show();
  }

  removeEducation(index) {
    this.staffProfileInfo.educationDetails.splice(index, 1);
  }

  createGraduationYear() {
    for (let i = 0; i <= 100; i++) {
      const year = (new Date()).getFullYear();
      this.graduationYearList.push(year - i);
    }
  }

  saveEducation() {
    if (this.selectedIndex > -1) {
      this.staffProfileInfo.educationDetails[this.selectedIndex] = { ...this.addNewEducation };
    } else {
      this.staffProfileInfo.educationDetails.push({ ...this.addNewEducation });
    }
    this.addEditEducationModal.hide();
    this.educationForm.resetForm();
  }

  getCertificateTypeList() {
    this.typecertification = [];
    this.generalTypecertification = [];
    this.type = false;
    this.general = false;
    this.certificateTypeService.getCertificateTypeList({}).subscribe(
      data1 => {
        if (data1.status === 200) {
          this.certificateTypeList = data1.data;
         if(this.positionTypeList.length !==0 && this.certificateTypeList.length !==0 && this.staffProfileInfo.positionType.length !==0){
         this.positionTypeList.forEach(positionType => {
            if(positionType._id === this.staffProfileInfo.positionType){
              this.certificateTypeList.forEach(element => {
                if(element.certificateType.toLowerCase() === positionType.name.toLowerCase()){
                  this.typecertification = element;
                  this.type = true;
                }else if(element.certificateType.toLowerCase()=== 'general'){
                  this.generalTypecertification = element;
                  this.general = true;
                }
              });
            }
         }); 
        }else{
          this.typecertification = this.certificateTypeList;
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

  getCertificateList() {
    this.certificateService.getCertificateList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.certificateList = data.data;
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

  getUserCalendar() {
    const condition = {
      userId: this.jwtService.currentLoggedUserInfo._id,
      // date: this.todayDate
    };
    this.userCalendarService.getUserCalendar({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          this.customCalendarDates = data.data;
          this.previousData.customCalendarDates = JSON.parse(JSON.stringify(data.data));
          // if (!this.customCalendarDates.length) {
          this.createDefaultCustomCalendar();
          // }
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

  createDefaultCustomCalendar() {
    if (this.customCalendarDates.length === 0) {
      for (let index = 0; index < 365; index++) {
        const date = moment().add(index, 'days').format('MM/DD/YYYY');
        const calendar = new Calendar();
        calendar.startTime = startOfDay(date).getTime();
        calendar.endTime = endOfDay(date).getTime();
        calendar.start = startOfDay(date);
        calendar.day = startOfDay(date).getDay(),
          calendar.status = this.calendarStatus.AVAILABLE,
          calendar.availableType = 'any',
          calendar.userId = this.jwtService.currentLoggedUserInfo._id;
        this.customCalendarDates.push(calendar);
        // this.previousData.customCalendar.push(calendar);
        // calendar.available
        // calendar.title = 'Available all time';   // 0 - Sunday to  6-Saturday day
      }
    } else {
      this.customCalendarDates.forEach((day, index) => {
        day.start = new Date(day.start);
        // var d = 60 * 60 * 24 * 1000;
        // day.start = new Date(date.getTime() + d);
        this.customCalendarDates[index].start = startOfDay(day.start);
        this.previousData.customCalendarDates[index].start = startOfDay(day.start);
      });
    }
  }

  updateCustomCalendardate() {
    const index = this.customCalendarDates.findIndex(date => date.start === this.selectedCustomCalDate.start);

    if (index > -1) {
      this.customCalendarDates[index] = { ...this.selectedCustomCalDate };
      this.selectedCustomCalDate = new Calendar();
    }
    console.log(this.customCalendarDates[index], this.previousData.customCalendarDates[index]);
    this.refresh.next();
    this.dayClickedPopup.hide();
  }

  showCertificatesModal() {
    this.selectedCertificates = [];
    this.selectedCertificates = JSON.parse(JSON.stringify(this.staffProfileInfo.certifications));
    console.log('Show certificate', this.selectedCertificates)
    this.addEditCertificationModal.show();
  }

  checkAlreadyExistsCertifiate(certificateId) {
    return this.selectedCertificates.includes(certificateId);
  }

  onChangeCertificate(certificateId, isChecked) {
    if (isChecked) {
      this.selectedCertificates.push(certificateId);
    } else {
      const index = this.selectedCertificates.indexOf(certificateId);
      if (index > -1) {
        this.selectedCertificates.splice(index, 1);
      }
    }
  }

  showSelectedCertificate(typeId) {
    const certificateName = [];
    this.certificateList.map(certificate => {
      if (certificate.certificateType === typeId && this.staffProfileInfo.certifications.includes(certificate._id)) {
        certificateName.push(certificate.certificate);
      }
    });
    return certificateName;
    // return certificateName.join(', ');
  }

  addCertificates() {
    this.staffProfileInfo.certifications = JSON.parse(JSON.stringify(this.selectedCertificates));
    this.addEditCertificationModal.hide();
  }

  showAddCertificateButton() {
    return JSON.stringify(this.staffProfileInfo.certifications) !== JSON.stringify(this.selectedCertificates);
  }

  getSkillType() {
    this.skillTypeService.getSkillTypeList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.skillTypeList = data.data;
          this.getSkills();
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }


  getSkills() {
    this.skillsService.getSkills({}).subscribe(
      data => {
        if (data.status === 200) {
          this.skillsList = data.data;
          this.showSkillsAtLast();
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

  getPositionTypeList() {
    this.positionTypeService.getPositionType({}).subscribe(
      data => {
        if (data.status === 200) {
          this.positionTypeList = data.data;
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  showSkillsAtLast() {
    const includesOther: Skill[] = this.skillsList.filter(val => this.otherText.includes(val.skill.toLowerCase()));
    const notIncludesOther: Skill[] = this.skillsList.filter(val => !this.otherText.includes(val.skill.toLowerCase()));
    this.skillsList = [...notIncludesOther, ...includesOther];
    const self = this;
    includesOther.map(skill => {
      self.skillTypeList.map(skillType => {
        if (skillType._id === skill.skillType && skillType.skillType.toLowerCase() === 'administration') {
          self.othersId.administrationOther = skill._id;
        } else if (skillType._id === skill.skillType && skillType.skillType.toLowerCase() === 'clinical') {
          self.othersId.clinicalOther = skill._id;
        } else if (skillType._id === skill.skillType && skillType.skillType.toLowerCase() === 'softwares') {
          self.othersId.softwaresOther = skill._id;
        }
      });
    });
  }

  showSkillsModal() {
    this.selectedSkills = [];
    this.selectedSkills = JSON.parse(JSON.stringify(this.address.skill.ids));
    this.addEditSkillsModal.show();
  }
  /* showSkillsModal() {
    this.selectedSkills = [];
    this.selectedSkills = JSON.parse(JSON.stringify(this.staffProfileInfo.skill.ids));
    this.addEditSkillsModal.show();
  } */

  checkAlreadyExistsSkill(skillId) {
    return this.selectedSkills.includes(skillId);
  }

  onChangeSkill(skillId, isChecked) {
    if (isChecked) {
      this.selectedSkills.push(skillId);
    } else {
      const index = this.selectedSkills.indexOf(skillId);
      if (index > -1) {
        this.selectedSkills.splice(index, 1);
      }
    }
  }

  showSelectedSkill(typeId) {
    const skillName = [];
    this.skillsList.map(skill => {
      if (skill.skillType === typeId && this.address.skill.ids.includes(skill._id)) {
        if (skill._id === this.othersId.clinicalOther) {
          skillName.push(this.address.skill.clinicalOther);
        } else if (skill._id === this.othersId.administrationOther) {
          skillName.push(this.address.skill.administrationOther);
        } else if (skill._id === this.othersId.softwaresOther) {
          skillName.push(this.address.skill.softwaresOther);
        } else {
          skillName.push(skill.skill);
        }
      }
    });
    return skillName;
    // return skillName.join(', ');
  }

  /*   showSelectedSkill(typeId) {
      const skillName = [];
      this.skillsList.map( skill => {
        if ( skill.skillType === typeId && this.staffProfileInfo.skill.ids.includes(skill._id) ) {
          if ( skill._id === this.othersId.clinicalOther) {
            skillName.push(this.staffProfileInfo.skill.clinicalOther);
          } else if ( skill._id === this.othersId.administrationOther) {
            skillName.push(this.staffProfileInfo.skill.administrationOther);
          } else if ( skill._id === this.othersId.softwaresOther) {
            skillName.push(this.staffProfileInfo.skill.softwaresOther);
          } else {
            skillName.push(skill.skill);
          }
        }
      });
      return skillName;
      // return skillName.join(', ');
    } */

  addSkills() {
    this.address.skill.ids = JSON.parse(JSON.stringify(this.selectedSkills));
    this.addEditSkillsModal.hide();
  }

  showAddSkillButton() {
    return JSON.stringify(this.address.skill.ids) !== JSON.stringify(this.selectedSkills);
  }

  createSliderLabel(value: number, label: LabelType): string {
    return moment(value).format('hh:mm A'); // this will translate label to time stamp.
  }

  updateGeneralCalDateTime(index) {
    this.staffProfileInfo.genCalAvailableDays[index].startTime = this.startTime;
    this.staffProfileInfo.genCalAvailableDays[index].endTime = this.endTime;
  }

  updateCustomCalDateTime() {
    this.selectedCustomCalDate.startTime = this.customCalStartTime;
    this.selectedCustomCalDate.endTime = this.customCalEndTime;
  }

  // ------ Save Functions -------
  saveAddress() {
    this.address.userId = this.staffProfileInfo._id;
    this.address.userType = this.staffProfileInfo.userType;
    delete this.address.practiceType;
    this.addressService.saveAddress(this.address).subscribe(
      data => {
        if (data.status === 200) {
          this.address = data.data;
          this.previousData.address = JSON.parse(JSON.stringify(data.data));
        } else {
          this.globalService.error();
        }
      }, error => {
        this.globalService.error();
      });
  }

  saveCustomCalendarDates() {
    const matchGeneralCal = JSON.stringify(this.previousData.generalCalendar) !== JSON.stringify(this.staffProfileInfo.genCalAvailableDays);
    console.log(matchGeneralCal);
    // return false;
    if (matchGeneralCal) {
      this.updateGeneralToCustomCal('save');
    } else {
      this.saveCustomCalendar();
    }

  }

  saveCustomCalendar() {
    const self = this;
    this.customCalendarDates.map((day, index) => {
      const matchDate = JSON.stringify(this.customCalendarDates[index]) === JSON.stringify(this.previousData.customCalendarDates[index]);
      if (matchDate) {
        return false;
      }
      let date = new Date(day.start);
      //date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      day.start = date;
      this.userCalendarService.saveUserCalendar(day).subscribe(
        data => {
          if (data.status === 200) {
            self.customCalendarDates[index] = data.data;
            self.customCalendarDates[index].start = startOfDay(data.data.start);
            self.previousData.customCalendarDates[index] = JSON.parse(JSON.stringify(data.data));
          } else {
            self.globalService.error();
          }
        }, error => {
          self.globalService.error();
        });
    });
  }

  createProfile() {
    // let verifyMsg = 'Your profile has been updated.';
    // if (this.staffProfileInfo.profileVerificationStatus !== this.profileStatus.VERIFIED) {
    //   verifyMsg = 'Your profile has been submitted for review.';
    //   this.staffProfileInfo.profileVerificationStatus = this.profileStatus.PENDING;
    // }
    // this.staffProfileInfo.availableDays = this.calendarDays;
    this.staffProfileInfo.milesTravelRadius = Number(this.staffProfileInfo.milesTravelRadius);

    // const staffProfile = JSON.parse(JSON.stringify(this.staffProfileInfo));
    // for (let i = 0; i < staffProfile.licensesDetails.length; i++) {
    //   const expirationDate = moment(staffProfile.licensesDetails[i].expirationDate).toISOString();
    //   staffProfile.licensesDetails[i].expirationDate = expirationDate;
    // }
    if (this.staffProfileInfo.expMalpracticeIns !== true) {
      this.staffProfileInfo.expMalpracticeInsDate = '';
    }
    this.usersService.saveUserData(this.staffProfileInfo).subscribe(
      data => {
        this.spinner.hide();
        if (data.status === 200) {
         
          // -----------------------------
          this.previousData.uploadData.resume.push(this.uploadData);
          this.previousData.generalCalendar = JSON.parse(JSON.stringify(data.data.genCalAvailableDays));
          this.previousData.license = JSON.parse(JSON.stringify(data.data.licensesDetails));
          this.previousData.userData = JSON.parse(JSON.stringify(data.data));
          //----------------------------
          this.previousData.address = JSON.parse(JSON.stringify(data.data));
          const loggedUser = data.data;
          const userDetails = {
            _id: loggedUser._id,
            firstName: loggedUser.firstName,
            lastName: loggedUser.lastName,
            email: loggedUser.email,
            phone: loggedUser.phone,
            profilePhoto: data.data.profilePhoto,
            userType: loggedUser.userType,
            accessLevel: loggedUser.accessLevelId,
            // location: loggedUser.location,
            // address: loggedUser.address,
            profileVerificationStatus: loggedUser.profileVerificationStatus,
          };
          this.jwtService.saveCurrentUser(JSON.stringify(userDetails));
          this.jwtService.getCurrentUser();
          // this.toastr.success(verifyMsg, 'Success');
          // this.router.navigate(["/login"]);
          this.updateUsersForChat(loggedUser._id, data.data);
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

  updateUsersForChat(key, postData: any) {
    const updatePath = 'User/' + key;
    this.firebaseService.UpdateSpecificKeyValue(updatePath, postData);
  }

  previewProfile() {
    this.router.navigate(['/staff-profile', this.staffProfileInfo._id]);
  }

  sendNotificationToAdmin() {
    const fullName = this.staffProfileInfo.firstName + ' ' + this.staffProfileInfo.lastName;
    const notificationDetails = environment.notification.changesInLicense;
    notificationDetails.msg = notificationDetails.msg.replace('#NAME', fullName);
    notificationDetails.admin = { payment: 0, disputes: 0, users: 1 };
    notificationDetails['senderId'] = this.staffProfileInfo._id;
    this.usersService.sendNotificationToAdmin({ notificationDetails }).subscribe(
      data => {
      });
  }


  showPreviousStep(event?: Event) {
    //this.ngWizardService.previous();
  }

  showNextStep(event?: Event) {
    //this.ngWizardService.next();
  }

  resetWizard(event?: Event) {
    this.ngWizardService.reset();
  }

  setTheme(theme: THEME) {
    this.ngWizardService.theme(theme);
  }

  stepChanged(args: StepChangedArgs) {
    this.nextTab = args.step.index;
    this.tabStep = this.nextTab;
  }

  isValidTypeBoolean: boolean = true;

  isValidFunctionReturnsBoolean(args: StepValidationArgs) {
    return true;
  }

  isValidFunctionReturnsObservable(args: StepValidationArgs) {
    return of(true);
  }

  gotToNextStep() {
    if (this.nextTab == 0) {
      if (this.form.controls.firstName.status === 'INVALID' || this.form.controls.middleName.status === 'INVALID' || this.form.controls.lastName.status === 'INVALID'
        || this.form.controls.phone.status === 'INVALID' || this.form.controls.email.status === 'INVALID' || this.form.controls.emergencyContactName.status === 'INVALID'
        || this.form.controls.emergencyContactName.status === 'INVALID' || this.form.controls.emergencyContactName.status === 'INVALID' || this.form.controls.emergencyContactNumber.status === 'INVALID'
        || this.form.controls.addressLine_1.status === 'INVALID' || this.form.controls.addressLine_2.status === 'INVALID' || this.form.controls.state.status === 'INVALID'
        || this.form.controls.city.status === 'INVALID' || this.form.controls.zipcode.status === 'INVALID' ||  this.form.controls.country.status === 'INVALID' ||  this.form.controls.bio.status === 'INVALID') {
          this.firstInvalidForm = false;
          this.toastr.success(
            'Please fill all the required fields.',
            'Alert'
          );
      } else {
        this.tabStep = 1;
        this.ngWizardService.next();
        $('html, body').animate({
          scrollTop: 0
        }, 600);
      }
    }
    else if (this.nextTab >= 1) {
     if(this.nextTab == 2){
       this.saveCustomCalendarDates();
     }
      if (this.form.valid && this.checkLicenseValid()) {
        this.isConnectToStripe = false;
         this.validateForm();
        this.ngWizardService.next();
      } else {
        this.toastr.success(
          'Please fill all the required fields.',
          'Alert'
        );
        $('html, body').animate({
          scrollTop: 0
        }, 600);
      }
    }
  }
  submitAll() {
    this.tabStep = 5;
  }

  onDayToggle(event) {
    if (event) {
      this.selectedCustomCalDate.status = this.calendarStatus.AVAILABLE;
    } else {
      this.selectedCustomCalDate.status = this.calendarStatus.UNAVAILABLE;
    }
  }

  canDeactivate():boolean{
    if(this.form === undefined){
      return false;
    }else{
    if(this.form.submitted){
      return false;
    }else{
      return this.form.touched;
    }
  }
  }

  refreshDataList(){
    this.staffProfileInfo.certifications = [];
    this.staffProfileInfo.licensesDetails = [];
    this.address.skill.ids = [];
  }
}
