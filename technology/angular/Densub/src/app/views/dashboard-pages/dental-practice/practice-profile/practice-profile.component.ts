import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxImageCompressService } from 'ngx-image-compress';

import { GlobalService } from '../../../../shared-ui/service/global.service';
import { UsersService } from '../../../../shared-ui/service/users.service';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { FirebaseService } from './../../../../shared-ui/service/firebase.service';
import { PaymentCardService } from '../../../../shared-ui/service/paymentCard.service';
import { AddressService } from '../../../../shared-ui/service/address.service';
import { AlertService } from '../../../../shared-ui/alert/alert.service';
import { PracticeService } from '../../admin/practice/practice.service';
import { StateService } from '../../admin/location/state/state.service';
import { CountryService } from '../../admin/location/country/country.service';
import { CityService } from '../../admin/location/city/city.service';
import { ZipcodeService } from '../../admin/location/zipcode/zipcode.service';
import { SkillsService } from '../../admin/skills/skills/skills.service';
import { AlertConfirmService } from '../../../../shared-ui/service/alertConfirm.service';
import { PracticeProfile } from '../../../../shared-ui/modal/practice-profile.modal';
import { PaymentProfile } from '../../../../shared-ui/modal/payment-profile.modal';
import { PaymentCard } from '../../../../shared-ui/modal/payment-card.modal';
import { AlertConfirm } from '../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { Address } from '../../../../shared-ui/modal/address.modal';
import { Zipcode } from '../../admin/location/zipcode/zipcode.modal';
import { Country } from '../../admin/location/country/country.modal';
import { State } from '../../admin/location/state/state.modal';
import { City } from '../../admin/location/city/city.modal';
import { Skill } from '../../admin/skills/skills/skills.modal';
import { environment } from '../../../../../environments/environment';
import { NgWizardConfig, NgWizardService, StepChangedArgs, StepValidationArgs, STEP_STATE, THEME } from 'ng-wizard';
import { of } from 'rxjs';

@Component({
  selector: 'app-practice-profile',
  templateUrl: './practice-profile.component.html',
  styleUrls: ['./practice-profile.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

export class PracticeProfileComponent implements OnInit {
  nextTab: number = 0;
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

  @ViewChild('f', { static: false }) form: any;
  @ViewChild('p', { static: false }) PaymentForm: any;

  viewImage: String = '';
  practiceProfileInfo: PracticeProfile = new PracticeProfile();
  paymentProfileInfo: PaymentProfile = new PaymentProfile();
  recordMaintainedList: any[] = environment.RECORD_MAINTAINED;
  radiograph: any[] = environment.RADIOGRAPH;
  viewFileInfo: any = [];
  addressList: Address[] = [new Address()];
  cardsList: PaymentProfile[] = [new PaymentProfile()] || [];
  paymentCards = [PaymentCard] || [];
  minDate: String;
  getListOfYear: any = [];
  monthList: any = [];
  profilePaymentStatus = environment.PROFILE_STATUS;
  tabStep = 0;
  paymentCardExists: boolean = false
  softwareList: Skill[] = [];
  profileStatus = environment.PROFILE_STATUS;
  alertDetails: AlertConfirm = new AlertConfirm();
  // value: any = 0;
  // PositionTypeData: any = [];
  // licenses: any = [1];
  // editorConfig: any = {
  //   editable: true,
  //   spellcheck: true,
  //   height: '290px',
  //   // width: '200px',
  //   translate: 'yes',
  //   enableToolbar: true,
  //   showToolbar: true,
  //   toolbar: [['bold', 'italic', 'underline', 'orderedList', 'unorderedList']]
  // };
  // ckeConfig: any = {
  // forcePasteAsPlainText: true,
  // height: 200,
  // toolbarGroups: [
  //    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
  //    { name: 'paragraph', groups: ['list'] },
  // ],
  // removeButtons: 'Source,Save,NewPage,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Undo,Redo,Find,Replace,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Strike,Subscript,Superscript,CopyFormatting,RemoveFormat,Outdent,Indent,CreateDiv,Blockquote,BidiLtr,BidiRtl,Language,Unlink,Anchor,Image,Flash,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,Maximize,ShowBlocks,About',
  // };
  /*  requiredValidate: any = {
     name: {
       first: '',
       last: ''
     },
     email: '',
     phone: '',
     older: '',
     companyName: '',
     providedPPE: '',
     radiograph : '',
     recordMaintained : '',
     adultProphy: '',
     childProphy: '',
     leftHandedAccomodation: '',
     softwares : ''
   };
 
   addressValidation: any = {
     practiceName : '',
     practiceType : '',
     addressLine_1: '',
     country : '',
     state : '',
     city : '',
     zipcode : ''
   }; */

  otherText = ['other', 'others'];
  // datePickerConfig2: any = {
  //   disableKeypress: true,
  //   min: moment(new Date()).format('MMM DD,YYYY'),
  //   format: 'MMM DD,YYYY'
  // };

  images: any = []; // an array of valid images
  DeleteGalleryData: any = [];
  message: string = null; // a string to report the number of valid images
  uploadData: any = {
    profilePhoto: []
  };
  // editProfileAddress: String = '';
  // tslint:disable-next-line: member-ordering
  // @ViewChild('ViewImages', { static: false }) public ViewImages: ModalDirective;

  // tempStr: any = '';
  countryList: Country[] = [];
  stateList: State[] = [];
  cityList: City[] = [];
  zipcodeList: Zipcode[] = [];
  // selectedSoftwares: Skill[] = [];
  practiceType = [];
  practiceTypeList = [];
  othersId = {
    radiographId: '',
    softwareId: ''
  };
  dropdownSettings = {
    singleSelection: false,
    idField: '_id',
    textField: 'skill',
    selectAllText: 'Select All',
    enableCheckAll: false,
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: false,
    itemsShowLimit: 3,
    closeDropDownOnSelection: false
  };
  storedPreviousdata = {
    practiceProfileInfo: new PracticeProfile(),
    addressList: [new Address()],
    // softwares : []
  };
  ispreviewProfile = false;
  timeoutToHide = false;
  agencyPracticeType:boolean = false;
  dso:boolean = false;
  privatePractice:boolean = true;
  showAddMorePractice:boolean = false;
  childProphyTime = [
    {_id:1, time:'15 Minutes'},
    {_id:2, time:'30 Minutes'},
    {_id:3, time:'45 Minutes'}
  ]
  adultProphyTime = [
    {_id:1, time:'30 Minutes'},
    {_id:2, time:'45 Minutes'},
    {_id:3, time:'60 Minutes'},
    {_id:4, time:'75 Minutes'},
    {_id:5, time:'90 Minutes'}
  ]

  paymentCardAdded: boolean = false;

  //  filteredLocation = []
  constructor(
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private usersService: UsersService,
    private alertService: AlertService,
    private jwtService: JwtService,
    private practiceService: PracticeService,
    private imageCompress: NgxImageCompressService,
    private firebaseService: FirebaseService,
    private stateService: StateService,
    private countryService: CountryService,
    private cityService: CityService,
    private zipcodeService: ZipcodeService,
    private addressService: AddressService,
    private skillsService: SkillsService,
    private alertConfirmService: AlertConfirmService,
    private router: Router,
    private route: ActivatedRoute,
    private PaymentCardService: PaymentCardService,
    private ngWizardService: NgWizardService
  ) {
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getCountryListForNewUser();
    this.getPracticeData();
    this.getUsersData();
    const date = new Date();
    date.setDate(date.getDate() + 1).toString();
    var d = new Date(date),
      month = d.getMonth() + 1,
      day = d.getDate(),
      year = d.getFullYear();
    this.minDate = [year, month, day].join('-');
    for (let i = 0; i < 10; i++) {
      this.getListOfYear.push(date.getFullYear() + i);
    }
    for (let i = 1; i <= 12; i++) {
      this.monthList.push(String(i).padStart(2, '0'));
    }
    this.route.params.subscribe(res => {
      if(res.tabStep === '3'){
        this.tabStep = 2;
        this.config.selected = 2;
      }
    });
  }

  next(type: String) {
    $('html, body').animate({ scrollTop: 0 }, 600);
    if (type === 'back') {
      this.tabStep = this.tabStep - 1;
    } else {
      //this.tabStep = this.tabStep + 1;
    }
    //this.router.navigate(['practice/profile/' + (this.tabStep + 1)]);
  }

  async loadProfileData() {
    this.spinner.show();
    let customer = JSON.parse(localStorage.getItem('currentUser'));
    if(this.practiceProfileInfo.profileVerificationStatus === this.profileStatus.NEW){}else{
      await this.getPaymentCardDetail(customer.email);
    }
  }

  getPaymentCardDetail(email) {
    const dataArray = [];
    this.PaymentCardService.getPaymentCardDetail({ email }).subscribe(
      data => {
        if (data.status === 200) {
          data.data.map(card => {
            let obj = {
              cardNumber: `**** **** **** ${card.last4}`,
              month: String(card.exp_month).padStart(2, '0'),
              year: card.exp_year,
              setAsPrimaryCard: card.setAsPrimaryCard,
              CVV: '***',
              _id: card._id
            };
            dataArray.push(obj);
          });
          this.paymentCards = dataArray;
          if(this.paymentCards.length > 0){
            this.paymentCardAdded = true;
          }else{
            this.paymentCardAdded = false;
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

  storeRadiographOthersId() {
    const index = this.radiograph.findIndex(val => this.otherText.includes(val.name.toLowerCase()));
    if (index > -1) {
      this.othersId.radiographId = this.radiograph[index]._id;
    }
  }

  storeSoftwareOthersId() {
    const index = this.softwareList.findIndex(val => this.otherText.includes(val.skill.toLowerCase()));
    if (index > -1) {
      this.othersId.softwareId = this.softwareList[index]._id;
      const putOtherAtLast = { ...this.softwareList[index] };
      this.softwareList.splice(index, 1);
      this.softwareList.push(putOtherAtLast);
    }
  }

  getAddressList() {
    const condition = { userId: this.practiceProfileInfo._id };
    this.addressService.getAddressList({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            const addressData = data.data;
            const addressKeys = Object.keys(new Address());

            addressData.map(address => {
              addressKeys.map(key => {
                if (!Object.keys(address).includes(key)) {
                  address[key] = (new Address())[key];
                }
              });
            });
            this.addressList = addressData;
            if(this.addressList.length > 1){
              this.showAddMorePractice = true;
            }else{
              this.showAddMorePractice = false;
            }
            this.storedPreviousdata.addressList = JSON.parse(JSON.stringify(data.data));
            for(let i=0;i<this.addressList.length;i++){
              this.getCityList(i);
              this.getZipcodeList(i);
            }
          } else {
            this.addDefaultCountry(0);
          }
          this.spinner.hide();
        } else {
          this.globalService.error();
        }
      }, error => {
        this.globalService.error();
      });
  }

  addDefaultCountry(index) {
    this.countryList.map(country => {
      if (country.country === 'US') {
        this.addressList[index].country = country._id;
      }
    });
  }

  getUsersData() {
    const self = this;
    this.usersService.getUserInfo({ _id: this.jwtService.currentLoggedUserInfo._id }).subscribe(
      data => {
        if (data.status === 200) {
          const userData = data.data;
          const profileKeys = Object.keys(new PracticeProfile());
          profileKeys.map(key => {
            if (!Object.keys(userData).includes(key)) {
              userData[key] = (new PracticeProfile())[key];
            }
          });
          if (userData.profilePhoto && userData.profilePhoto.length) {
            userData.profilePhoto.map(function (file) {
              self.uploadData.profilePhoto.push({
                file: file,
                type: 'profilePhoto',
                name: file
              });
            });
          }
          // this.selectedSoftwares = this.softwareList.filter( software => userData.skill.ids.includes(software._id) );
          // this.softwareList.filter( software => userData.skill.ids.includes(software._id) );
          // console.log(this.selectedSoftwares);
          this.practiceProfileInfo = userData;
          this.loadProfileData();
          if(this.practiceProfileInfo.profileVerificationStatus === this.profileStatus.NEW){

          }else{
          //   ( function( $ ) {
          //     $( document ).ready( function(){
          //         $('.accordion-collapse').removeClass('show');
          //     });
          // })( jQuery );
        }
          this.getSkills();
          this.storeRadiographOthersId();
          this.getCountryList();

          if(this.practiceProfileInfo.accountType !== '' && this.practiceProfileInfo.accountType !== null){
          if(this.practiceProfileInfo.accountType === 'private practice'){
            this.privatePractice = true;
            this.dso = false;
            this.agencyPracticeType = false;
          }else if(this.practiceProfileInfo.accountType === 'dso'){
            this.dso = true;
            this.agencyPracticeType = false;
            this.privatePractice = false;
          }else if(this.practiceProfileInfo.accountType === 'agency'){
              this.agencyPracticeType = true;
              this.dso = false;
              this.privatePractice = false;
          }
        }
          this.storedPreviousdata.practiceProfileInfo = JSON.parse(JSON.stringify(userData));
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  validateForm(type) {
    if ((this.form && this.form.valid) || type === 'submit' || type === 'update') {
      /*  -- Steps for saving profile
      * Geocoding
      * Upload Photo
      * Update User
      * Save address
      */
      this.globalService.setLoadingLabel('Submitting... Please Wait.');
      this.spinner.show();
      //  const getSkillIds = this.selectedSoftwares.map( val => val._id );
      //  console.log(getSkillIds);
      console.log(this.storedPreviousdata.practiceProfileInfo, this.practiceProfileInfo);
      const isPreviousResultsEqual = (
        JSON.stringify(this.storedPreviousdata.practiceProfileInfo) ===
        JSON.stringify(this.practiceProfileInfo)) &&
        (
          JSON.stringify(this.storedPreviousdata.addressList) ===
          JSON.stringify(this.addressList)
        )
      /*  &&
      (
        JSON.stringify(this.practiceProfileInfo.skill.ids) ===
        JSON.stringify(getSkillIds)
      ); */
      if (isPreviousResultsEqual && this.images.length == 0) {
        this.spinner.hide();
        if (this.ispreviewProfile) {
          this.previewProfile();
        } else {
          if (type === 'update') {
            this.next('continue');
          } else {
            if(this.usersService.flag == 1){
              this.toastr.success('Your profile has been submitted to the admin for verification. This verification process may take up to 48 hours. We will send you an email confirmation when your profile has been verified.','Congratulations!',{timeOut : 600000});
              this.usersService.flag = 0;
            }
            this.router.navigate(['practice/dashboard']);
          }
          // this.toastr.warning(
          //   'Profile is already updated.',
          //   'Warning'
          // );
        }
        return false;
      }

      // if ( JSON.stringify(getSkillIds) !== JSON.stringify(this.selectedSoftwares) ) {
      //   this.practiceProfileInfo.skill.ids = getSkillIds;
      // }
      else if(this.tabStep > 1){
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

  previewProfile() {
    this.router.navigate(['/practice-profile', this.practiceProfileInfo._id]);
  }

  validatePaymentForm() {
    if (!this.PaymentForm.valid) {
      this.spinner.hide();
      this.toastr.warning(
        'Please check all the fields are filled.',
        'Warning'
      );
    }
  }

  savePaymentData(i) {
    if (!this.PaymentForm.valid) {
      this.spinner.hide();
      this.toastr.warning(
        'Please check all the fields are filled.',
        'Warning'
      );
    } else {
      this.globalService.setLoadingLabel('Data submitting... Please Wait.');
      this.spinner.show();
      let customer = JSON.parse(localStorage.getItem('currentUser'));
      if (this.paymentCards && this.paymentCards.length === 1) {
        this.paymentCards[0].setAsPrimaryCard = true
      }
      this.PaymentCardService.savePaymentCard({ data: this.paymentCards[i], email: customer.email })
        .subscribe(data => {
          this.spinner.hide();
          if (!data.data && data.status === 200) {
            this.toastr.success('Payment Card updated successfully.', 'Success');
          } else {
            if (data.status === 200) {
              this.paymentCards[i] = data.data;
              if(this.paymentCards.length > 0){
                this.paymentCardAdded = true;
              }
              this.toastr.success('Payment Card saved successfully.', 'Success');
              Object.keys(PaymentCard).forEach(k => {
                if (k === "cardNumber" || k === "CVV" || k === "month" || k === "year") {
                  PaymentCard[k] = ''
                }
                if (k === "setAsPrimaryCard") {
                  PaymentCard[k] = false
                }
              });
            } else {
              this.toastr.warning(data.message, 'Error');
              this.globalService.error();
            }
          }
        })
    }
  }

  removePaymentCard(index) {
    const card = this.paymentCards[index];
    card.paymentStatus = environment.STATUS.DELETE;
    this.PaymentCardService.deletePaymentCard({ _id: card._id }).subscribe(data => {
      if (data.status === 200) {
        this.paymentCards.splice(index, 1);
        if(this.paymentCards.length == 0){
          this.paymentCardAdded = false;
        }else{
          this.paymentCardAdded = true;
        }
        this.toastr.success(
          'Payment card deleted successfully.',
          'Success'
        );
        Object.keys(PaymentCard).forEach(k => {
          if (k === "cardNumber" || k === "CVV" || k === "month" || k === "year") {
            PaymentCard[k] = ''
          }
          if (k === "setAsPrimaryCard") {
            PaymentCard[k] = false
          }
        });
      } else {
        this.globalService.error();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    }, error => {
      this.globalService.error();
    });
  }

  removeMorePaymentCards(index) {
    console.log("index:::", index)
    if (!this.paymentCards[index]._id) {
      this.paymentCards.splice(index, 1);
    } else {
      this.removePaymentCardAlert(index);
    }
  }

  makeAsPrimaryCard(index) {
    console.log("mark======")
    if (this.paymentCards[index]._id) {
      let card = this.paymentCards.filter(list => list.setAsPrimaryCard === true);
      if (card.length) {
        if (card[0]._id !== this.paymentCards[index]._id) {
          card[0].setAsPrimaryCard = false;
          this.PaymentCardService.setCardAsPrimary(card[0]).subscribe(data => {
            const index = this.paymentCards.findIndex(card => card._id === data.data._id)
            this.paymentCards[index] = data.data;
          })
        }
      }
      this.paymentCards[index].setAsPrimaryCard = !this.paymentCards[index].setAsPrimaryCard;
      this.PaymentCardService.setCardAsPrimary(this.paymentCards[index]).subscribe(data => {
        this.paymentCards[index] = data.data;
        const lastDigitsOfCard = this.paymentCards[index].cardNumber.substring(this.paymentCards[index].cardNumber.length-4,this.paymentCards[index].cardNumber.length)
        if (data.status === 200) {
          //this.toastr.success('Set Payment Card as primary card successfully.', 'Success');
          if(this.paymentCards[index].setAsPrimaryCard){
            this.toastr.success('Credit card ending with '+ lastDigitsOfCard +' was set as the primary card.', 'Success'); 
          }else{
            this.toastr.success('Credit card ending with '+ lastDigitsOfCard +' is not the primary selected card.', 'Success'); 
          }
          
        }
      });
    }
  }

  addMoreCards() {
    this.paymentCards.push(PaymentCard);
    this.addDefaultCountry((this.paymentCards.length - 1));
  }

  removePaymentCardAlert(index) {
    let message = { show: true, message: 'Are you sure that you want to delete your card?' };
    if (this.paymentCards.length === 1) {
      message = { show: true, message: "A valid credit card must be provided in order to post a job on Densub's marketplace. Are you sure that you want to delete your card?" }
    }
    this.alertDetails = {
      title: 'Alert',
      message,
      cancelButton: { show: true, name: 'Close' },
      confirmButton: { show: true, name: 'Confirm' },
    };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe(data => {
      if (data) {
        this.removePaymentCard(index);
      }
      return false;
    });
  }

  geocodeAddress() {
    const self = this;
    let cityName = '';
    let zipCodeNumber = ''
    this.addressList.map((address, index) => {
      const addressLine2 = (address.addressLine_2) ? ',' + address.addressLine_1 : '';
      const country = this.countryList.filter(value => value._id === address.country);
      const state = this.stateList.filter(value => value._id === address.state);
      const city =  address.city;
      const zipcode = address.zipcode;
      const conditionCity = {
        countryId : address.country,
        stateId : address.state,
        _id: address.city,
        status : 'active'
      }
      this.cityService.getCityList(conditionCity).subscribe(res =>{
        if(res.status == 200){
          cityName = res.data[0].city;
          
          const conditionZip = {
            _id : address.zipcode,
            countryId : address.country,
            stateId : address.state,
            cityId : address.city,
            status : 'active'
          }
    
          this.zipcodeService.getZipcodeList(conditionZip).subscribe(
            data => {
              if (data.status === 200) {
                zipCodeNumber = data.data[0].zipcode;
             

      const formattedAddress = address.addressLine_1 + addressLine2 + ',' + cityName + ',' +
        state[0].state + ' ' + zipCodeNumber + ',' + country[0].country;
      console.log(formattedAddress);
      const geocodeUrl = environment.googleGeocodeUrl.replace('#ADDRESS', formattedAddress);
      self.usersService.geocodeAddress(geocodeUrl).subscribe(data => {
        if (data.results && data.results.length > 0) {
          this.addressList[index].location = data.results[0].geometry.location;
          if ((this.addressList.length - 1) === index) {
              this.uploadFile(); 
          }
        } else {
          this.spinner.hide();
          this.toastr.warning(
            'Unable to geocode.Please check internet connection or address.',
            'Warning'
          );
          return false;
        }
      });
    }
  })
}
})

    });


  }

  uploadFile() {
    const self = this;
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
                if (image.type === 'profilePhoto') {
                  const deletpreviousePhoto = JSON.parse(
                    JSON.stringify(self.practiceProfileInfo[image.type])
                  );
                  if (deletpreviousePhoto.length) {
                    self.DeleteGalleryData.push(deletpreviousePhoto[0]);
                  }
                  self.practiceProfileInfo[image.type] = [data.imgPath];
                } else {
                  self.practiceProfileInfo[image.type].push(data.imgPath);
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
      self.matchAndSave();
    }
  }

  matchAndSave() {
    this.createProfile();
    this.saveAddress();
  }

  createProfile() {
    let verifyMsg = 'Profile has been updated successfully.';
    if (this.practiceProfileInfo.profileVerificationStatus === this.profileStatus.NEW ||
      this.practiceProfileInfo.profileVerificationStatus === this.profileStatus.REJECTED) {
      this.usersService.flag = 1;
      verifyMsg = 'Congratulations! Your profile has been submitted to the admin for verification. This verification process may take up to 48 hours. We will send you an email confirmation when your profile has been verified.';
      this.practiceProfileInfo.profileVerificationStatus = this.profileStatus.PENDING;
    }

    const practiceProfileInfo = { ...this.practiceProfileInfo };
    if(this.privatePractice){
        practiceProfileInfo.accountType = "private practice";
    }
    else if(this.dso){
      practiceProfileInfo.accountType = "dso";
    }else if(this.agencyPracticeType){
      practiceProfileInfo.accountType = "agency";
    }
    // delete practiceProfileInfo['email'];
    this.usersService.saveUserData(practiceProfileInfo).subscribe(data => {
      if (data.status === 200) {
        // this.practiceProfileInfo = data.data;
        this.images = []; // an array of valid images
        // this.uploadData = {
        //   profilePhoto: [],
        //   docs: []
        // };
        this.storedPreviousdata.practiceProfileInfo = { ...data.data };
        if (this.DeleteGalleryData.length) {
          this.globalService.deleteGalleryFromS3bucket({
            galleryData: JSON.stringify(this.DeleteGalleryData)
          }).subscribe(newData => {
            this.spinner.hide();
            this.DeleteGalleryData = [];
            if (!this.ispreviewProfile) {
              this.toastr.success(verifyMsg, 'Success',{timeOut: 600000});
              this.router.navigate(['practice/dashboard']);
            }
          
          },
            error => {
              this.globalService.error();
            }
          );
        } else {
          this.spinner.hide();
          if (!this.ispreviewProfile && this.usersService.flag == 0) {
            this.toastr.success(verifyMsg, 'Success',{timeOut: 600000});
            this.router.navigate(['practice/dashboard']);
          }
          if(!this.ispreviewProfile && this.usersService.flag == 1){
            this.toastr.success('Your profile has been submitted to the admin for verification. This verification process may take up to 48 hours. We will send you an email confirmation when your profile has been verified.','Congratulations!',{timeOut : 600000});
            this.router.navigate(['practice/dashboard']);
            this.usersService.flag = 0;
          }
        }
        // this.router.navigate(["/login"]);
        this.updateUsersForChat(this.practiceProfileInfo._id, this.practiceProfileInfo);
        this.updateJWTServiceDetails();
        if (this.ispreviewProfile) {
          this.previewProfile();
        }
      }
    },
      error => {
        this.globalService.error();
      }
    );
  }

  updateUsersForChat(key, postData: any) {
    const updatePath = 'User/' + key;
    this.firebaseService.UpdateSpecificKeyValue(updatePath, postData);
  }

  saveAddress() {
    const self = this;
    this.addressList.map((singleAddress, index) => {
      const address = JSON.parse(JSON.stringify(singleAddress));
      address.userId = this.practiceProfileInfo._id;
      address.userType = this.practiceProfileInfo.userType;
      address.skill.ids = address.skill.ids.map(skill => skill._id);
      // console.log(address); return false;

      if(address.addressLine_1.length && address.addressLine_1.indexOf(',') != -1){
        address.addressLine_1 =  address.addressLine_1.replace(/,/g, '');
      }
      if(address.addressLine_2 !== undefined){
      if(address.addressLine_2.length && address.addressLine_2.indexOf(',') != -1){
        address.addressLine_2 =  address.addressLine_2.replace(/,/g, '');  
      }
    }
      
      this.addressService.saveAddress(address).subscribe(
        data => {
          if (data.status === 200) {
            data.data['skill'] = singleAddress['skill'];
            self.addressList[index] = data.data;
            self.storedPreviousdata.addressList[index] = JSON.parse(JSON.stringify(data.data));
          } else {
            self.globalService.error();
          }
        }, error => {
          self.globalService.error();
        });
    });
  }

  updateJWTServiceDetails() {
    const loggedUser = this.practiceProfileInfo;
    const usertDetails = {
      _id: loggedUser._id,
      firstName: loggedUser.firstName,
      middleName: loggedUser.middleName,
      lastName: loggedUser.lastName,
      email: loggedUser.email,
      profilePhoto: loggedUser.profilePhoto,
      userType: loggedUser.userType,
      profileVerificationStatus: loggedUser.profileVerificationStatus
    };
    this.jwtService.saveCurrentUser(JSON.stringify(usertDetails));
    this.jwtService.getCurrentUser();
  }

  removeAddress(index) {
    const address = this.addressList[index];
    address.status = environment.STATUS.DELETE;
    this.addressService.saveAddress(address).subscribe(
      data => {
        if (data.status === 200) {
          this.addressList.splice(index, 1);
        } else {
          this.globalService.error();
        }
      }, error => {
        this.globalService.error();
      });
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
      // if (type !== 'docs') {
      cb(true, null);
    } else {
      // tslint:disable-next-line: prefer-const
      let self = this;
      const imageFile = files;
      const fileReader = new FileReader();

      fileReader.onload = function (fileLoadedEvent: any) {
        // self.uploadData[type][index].name = files.name;
        // console.warn('Size in bytes was:', self.imageCompress.byteCount(fileLoadedEvent.target.result));
        self.imageCompress.compressFile(fileLoadedEvent.target.result, -1, 75, 50).then(result => {
          const base64 = result;
          const ImageData = base64;
          const block = ImageData.split(';');
          const contentType = block[0].split(':')[1];
          const realData = block[1].split(',')[1];
          const blob = self.b64toBlob([realData], contentType, '');
          const blobs = new File([blob], files.name, { type: files.type });
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
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  /**
   * Name: selectFiles():
   * Description: If any photo/video/doc selected then this method will store gallery data in array
   * and Here is define max photo/video/doc upload.
   */
  // profilePhoto:any = /\.(jpg|jpeg|png|gif)$/
  // docExpression:any  =   /\.(pdf|odt)$/
  selectFiles = (event, type) => {
    // image upload handler
    const files: FileList = event.target.files;
    let fileObj = {};
    let found = [];
    const self = this;
    for (let i = 0; i < files.length; i++) {
      if (type === 'profilePhoto' && !files.item(i).name.match(/\.(jpg|jpeg|png|gif)$/)) {
        this.toastr.warning(
          'You can upload only jpg, jpeg, png, gif image.',
          'Warning'
        );
        return false;
      }
      else if(files.item(i).size >= 3000000){
        this.toastr.warning(
          'Required image size should be upto 3MB.',
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
      if (!self.uploadData[type] && !self.uploadData[type].length && self.images.length) {
        found = self.images.filter(obj => {
          return obj.type === type;
        });
      } else {
        found = self.uploadData[type].filter(obj => {
          return obj.type === type;
        });
      }
      if (found.length <= 9) {
        if (type === 'profilePhoto') {
          self.uploadData[type] = [
            {
              file: '',
              uploadProgress: '0',
              type: type,
              status: 'new',
              fileObj: fileObj,
              id: fileId
            }
          ];
          self.encode(files.item(i), type, fileId);
          const profilefound = self.images.filter(obj => {
            return obj.type === type;
          });
          if (profilefound.length) {
            const index = self.images.indexOf(profilefound[0]);
            this.images[index] = fileObj;
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
    // console.log('this.images==',  this.images);
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
    console.log('encode', files, type, generateId);
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
      const index = self.practiceProfileInfo[type].indexOf(file.file);
      self.practiceProfileInfo[type].splice(index, 1);
      self.DeleteGalleryData.push(file.file);
    }
  }

  /*   showFullImage(image: any , type: any) {
      if (type === 'licensePhoto') {
        this.viewImage = image.licensePhoto;
      } else {
        this.viewImage = image.file;
      }
       this.showImageModal.show();
    } */

  /*  closeModel() {
     this.showImageModal.hide();
   } */

  /*   onEditorChange() {
      this.tempStr = this.practiceProfileInfo.bio;
      if ((this.tempStr===null) || (this.tempStr==='')){
        this.tempStr = this.tempStr.replace( '&nbsp;', '');
        return false;
      } else {
        this.tempStr = this.tempStr.toString();
        this.tempStr = this.tempStr.replace( /(<([^>]+)>)/ig, '');
        this.tempStr = this.tempStr.replace( '&nbsp;', '');
        if(this.tempStr.length > 1000 ){
          this.toastr.warning('You can not enter more then 1000 characters.', 'Warning' );
          this.tempStr = this.tempStr.slice(0, 1000);
          this.practiceProfileInfo.bio = this.tempStr;
          return false;
        }
      }
    } */

  removeMoreAddress(index) {
    if (!this.addressList[index]._id) {
      this.addressList.splice(index, 1);
    } else {
      this.removeAddressAlert(index);
    }
    // this.locationList.splice(index, 1);
  }

  addMoreAddress() {
    this.addressList.push(new Address());
    this.addDefaultCountry((this.addressList.length - 1));
    // this.locationList.push({...this.location});
  }

  getCountryList() {
    this.countryService.getCountryList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.countryList = data.data;
          this.getAddressList();
          this.getStateList();
          // this.location.country = data.data;
          // this.locationList[0].country = data.data;
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }


  getCountryListForNewUser() {
    this.countryService.getCountryList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.countryList = data.data;
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
    this.stateService.getStateList({}).subscribe(
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

  getCityList(index) {
    this.spinner.show();
    const condition = {
      countryId : this.addressList[index].country,
      stateId : this.addressList[index].state,
      status: 'active'
    }
    this.cityService.getCityList(condition).subscribe(
      data => {
        if (data.status === 200) {
          this.cityList[index] = data.data;
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

  getZipcodeList(index) {
    this.spinner.show();
    const condition = {
      countryId : this.addressList[index].country,
      stateId : this.addressList[index].state,
      cityId : this.addressList[index].city,
      status: 'active'
    }
    this.zipcodeService.getZipcodeList(condition).subscribe(
      data => {
        if (data.status === 200) {
          this.zipcodeList[index] = data.data;
          this.spinner.hide();
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
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

  getSkills() {
    this.skillsService.getSkillWithType({}).subscribe(
      data => {
        if (data.status === 200) {
          const self = this;
          this.softwareList = data.data.filter(skill => {
            if (skill.skillType.skillType &&
              ['software', 'softwares'].includes(skill.skillType.skillType.toLowerCase())) {
              self.othersId.softwareId = (this.otherText.includes(skill.skill.toLowerCase())) ? skill._id : '';
              return true;
            }
          });
          this.storeSoftwareOthersId();
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

  showOlderAlert() {
    if (this.practiceProfileInfo.isOlder) {
      return false;
    }
    if(this.practiceProfileInfo.profileVerificationStatus !== this.profileStatus.NEW){
    this.alertDetails = {
      title: 'Alert',
      message: { show: true, message: "You must be 18 years and older to create a profile and join Densub's marketplace." },
      cancelButton: { show: false, name: 'Close' },
      confirmButton: { show: true, name: 'Confirm' },
    };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe(data => { });
  }
  }

  removeAddressAlert(index) {
    this.alertDetails = {
      title: 'Alert',
      message: { show: true, message: 'Are you sure you want to remove practice ?' },
      cancelButton: { show: true, name: 'Close' },
      confirmButton: { show: true, name: 'Confirm' },
    };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe(data => {
      if (data) {
        this.removeAddress(index);
      }
      return false;
    });
  }

  showOtherSoftwares(softwareIndex) {
    const index = this.addressList[softwareIndex].skill.ids.findIndex(val => this.othersId.softwareId === val._id);
    return (index > -1);
  }
  /*   showOtherSoftwares() {
      // console.log(this.selectedSoftwares, this.othersId.softwareId);
      const index = this.selectedSoftwares.findIndex( val =>  this.othersId.softwareId === val._id );
      return (index > -1);
    } */

  filterState(index) {
    this.addressList[index].state = '';
    this.addressList[index].city = '';
    this.addressList[index].zipcode = '';

  }

  filterCity(index) {
    // this.addressList[index].city = '';
    // this.addressList[index].zipcode = '';
    this.getCityList(index)
  }

  filterZipcode(index) {
    // this.addressList[index].zipcode = '';
    this.getZipcodeList(index);
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
        || this.form.controls.phone.status === 'INVALID' || this.form.controls.email.status === 'INVALID' || this.form.controls.bio.status === 'INVALID') {
          this.toastr.success(
            'Please fill all the required fields.',
            'Alert'
          );
        } else {
        this.tabStep = 1;
        this.ngWizardService.next();
      }
    }else if(this.nextTab == 1){
      if (this.form.valid) {
        if(this.practiceProfileInfo.profileVerificationStatus === this.profileStatus.NEW){
          this.validateAddress();
        }else{
          this.validateAddress(); 
        }
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
    else if (this.nextTab > 1) {
      if (this.form.valid) {
        if(this.practiceProfileInfo.profileVerificationStatus === this.profileStatus.NEW){
          this.ngWizardService.next();
        }else{
          this.validateForm('submit');
          this.ngWizardService.next();
        }
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

  updateAccountType(event){
    if(event.target.id === 'privatePractice'){
      this.privatePractice = true;
      this.dso = false;
      this.showAddMorePractice = false;
      this.agencyPracticeType = false;
    }else if(event.target.id === 'agency'){
      this.agencyPracticeType = true;
      this.privatePractice = false;
      this.dso = false;
      this.showAddMorePractice = true;
    }else if(event.target.id === 'dso'){
      this.dso = true;
      this.agencyPracticeType = false;
      this.privatePractice = false;
      this.showAddMorePractice = true;
    }
  }

  selectPracticeFor(event){
    if(event.target.id === 'singlePractice'){
      this.showAddMorePractice = false;
    }else{
      this.showAddMorePractice = true;
    }
  }

  validateAddress(){
    let sameAddress = false;
    if(this.addressList.length > 1){
      this.practiceProfileInfo.practiceAccount = 'multi';
    for(let i=0;i<this.addressList.length-1;i++){
      for(let j=1;j<this.addressList.length;j++){
        if(this.addressList[i].addressLine_1 != this.addressList[j].addressLine_1){
            sameAddress = false;
        }else{
          sameAddress = true;
        }
      }
    }
    if(sameAddress){
      sameAddress = false
      this.toastr.warning('Multiple practices can not have the same physical address. In order to add multiple practices, please correct the address.', 'Error');
    }else{
            this.ngWizardService.next();
    }
  }else{
    this.practiceProfileInfo.practiceAccount = 'single';
    this.ngWizardService.next();
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

}


// Experience , Specialty
