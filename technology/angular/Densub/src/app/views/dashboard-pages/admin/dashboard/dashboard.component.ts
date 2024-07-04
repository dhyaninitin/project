import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { UsersService } from '../../../../shared-ui/service/users.service';
import { AlertService } from '../../../../shared-ui/alert/alert.service';
import { environment } from '../../../../../environments/environment';
import { StaffProfile } from '../../../../shared-ui/modal/staff-profile.modal';
import { CalendarView, CalendarMonthViewDay} from 'angular-calendar';
import * as moment from 'moment';
import { startOfDay, addMonths, differenceInCalendarDays } from 'date-fns';
import { Address } from 'cluster';
import { AddressService } from '../../../../shared-ui/service/address.service';
import { UserCalendarService } from '../../../../shared-ui/service/userCalendar.service';
import { SkillType } from '../skills/skill-type/skill-type.modal';
import { SkillTypeService } from '../skills/skill-type/skill-type.service';
import { CertificateType } from '../certificates/certificate-type/certificate-type.modal';
import { CertificateTypeService } from '../certificates/certificate-type/certificate-type.service';
import { AlertConfirm } from '../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { AlertConfirmService } from '../../../../shared-ui/service/alertConfirm.service';


@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('viewUserList', { static: false })
  public viewUserList: ModalDirective;
  @ViewChild('viewPaymentList', { static: false })
  public viewPaymentList: ModalDirective;
  @ViewChild('viewContractList', { static: false })
  public viewContractList: ModalDirective;
  @ViewChild('viewprofileModal', { static: false })
  public viewprofileModal: ModalDirective;
  @ViewChild('ViewImages', { static: false }) public ViewImages: ModalDirective;
  viewFileInfo: any = [];
  usersList: any = [];
  profileStatus = environment.PROFILE_STATUS;
  practiceUsersList: any = [];
  staffUsersList: any = [];
  UsersProfileList: any = [];
  UsersVerifiedList: any = [];
  userTypes: any = environment.USER_TYPE;
  totalData: any = {};
  order: String = 'createdBy';
  reverse: Boolean = false;
  sortedCollection: any[];
  itemsPerPage = 10;
  currentUserList: any = [];
  TypeOfUser: any = '';
  paymentList: any = [];
  ContractList: any = [];
  customType: any = '';
  staffProfileInfo: StaffProfile;
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  todayDate: Date = startOfDay(new Date()); // Current Date
  futureDate: Date = startOfDay(addMonths(new Date(), 1)); // 1 month future date
  //Added one to add future date also
  showCalendarDate = (differenceInCalendarDays(this.futureDate, this.todayDate) + 1); //show custom Calendar dates;
  customCalendarDates: any = [];
  addressList: any = [];
  otherText = ['other', 'others'];
  skillTypeList: SkillType[] = [];
  certificateTypeList: CertificateType[] = [];
  calendarStatus = environment.CALENDAR_STATUS;
  calendarDateColor = environment.CALENDAR_DATE_COLOR;
  alertDetails: AlertConfirm = new AlertConfirm();

  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private usersService: UsersService,
    private alertService: AlertService,
    private addressService: AddressService,
    private userCalendarService: UserCalendarService,
    private skillTypeService: SkillTypeService,
    private certificateTypeService: CertificateTypeService,
    private alertConfirmService: AlertConfirmService,
  ) {
    this.globalService.topscroll();
  }

  ngOnInit() {
    this.getDashboardData();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  getDashboardData() {
    this.spinner.show();
    const condition = {
      userType: {$in : [environment.USER_TYPE.PRACTICE, environment.USER_TYPE.STAFF]}
    }
    this.usersService.getUsers({condition}).subscribe(
      data => {
        if (data.status === 200) {
          this.usersList = data.data;
          this.practiceUsersList = this.usersList.filter(obj => {
            return obj.userType === environment.USER_TYPE.PRACTICE;
          });
          this.staffUsersList = this.usersList.filter(obj => {
            return obj.userType === environment.USER_TYPE.STAFF;
          });
          this.UsersProfileList = this.usersList.filter(obj => {
            return obj.profileVerificationStatus === environment.PROFILE_STATUS.PENDING;
            // return obj;
          });
          /* this.UsersProfileList = this.usersList.filter(obj => {
            return obj.profileVerificationStatus === environment.PROFILE_STATUS.NEW;
            // return obj;
          }); */
          this.UsersVerifiedList = this.usersList.filter(obj => {
            return obj.profileVerificationStatus === environment.PROFILE_STATUS.VERIFIED;
            // return obj;
          });
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

  showUserViewListModal(list: any, type: any) {
    //this.closeModel();
     this.viewprofileModal.hide();
    this.TypeOfUser = type;
    this.currentUserList = list;
    this.viewUserList.show();
  }

  closeModel() {
    this.viewUserList.hide();
    this.viewPaymentList.hide();
    this.viewContractList.hide();
    this.viewprofileModal.hide();
  }


  showPaymentListListModal() {
    this.viewPaymentList.show();
  }


  showContractListListModal(type?: String) {
    this.customType = type;
    this.viewContractList.show();
  }

  viewProfile(user: any) {
    this.closeModel();
    this.staffProfileInfo = user;
    this.getAddressList();
    if(this.staffProfileInfo.userType === 'staff'){
      this.getUserProfile(user);
    }
    if (user.userType === environment.USER_TYPE.STAFF) {
        this.getCertificateTypeList();
        this.getUserCalendar();
        this.getSkillType();
    }
    this.viewprofileModal.show();
  }
  getUserProfile(user){
    const userId = user._id;
    const condition = {
      _id : userId
    }
    this.usersService.getUserById(condition).subscribe(data=>{
      if(data.status == 200){
        const positionType = data.data.positionType;
        this.staffProfileInfo.positionType = positionType;
      }
    })

  }

  getRadiograph() {
    this.addressList.map( address => {
      if (address.radiograph && address.radiograph.id) {
        const found =  environment.RADIOGRAPH.filter(val => val._id === address.radiograph.id );
        if (found) {
          address.radiograph.id = found[0];
        }
      }
    });
  }

/*   getRadiograph() {
    if (this.staffProfileInfo.radiograph) {
      const found =  environment.RADIOGRAPH.filter(val => val._id === this.staffProfileInfo.radiograph.id );
      if (found) {
        this.staffProfileInfo.radiograph.id = found[0];
      }
    }
    // console.log(this.staffProfileInfo.radiograph);
   } */

  getSpecialty(specialties) {
    const specialty = specialties.ids.map( val => {
                                     return ( !this.otherText.includes(val.specialty.toLowerCase()) ) ? val.specialty : specialties.other;
                                  });
    return specialty.join(', ');
    // ---------- specialty
  }

  getrecordMaintained() {
    this.addressList.map( address => {
      const found =  environment.RECORD_MAINTAINED.filter(
          val => val._id === address.recordMaintained );
      if (found) {
        address.recordMaintained = found[0];
      }
    });
  }

/*   getrecordMaintained() {
    const found =  environment.RECORD_MAINTAINED.filter(
        val => val._id === this.staffProfileInfo.recordMaintained );
    if (found) {
      this.staffProfileInfo.recordMaintained = found[0];
    }
  } */

  getAddressList() {
    const condition = {userId: this.staffProfileInfo._id };
    this.addressService.getAddressWithDetails({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.addressList = data.data;
            this.getrecordMaintained();
            this.getRadiograph();
          }
        } else {
          this.globalService.error();
        }
      }, error => {
        this.globalService.error();
      });
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
    console.log(this.staffProfileInfo.certifications);
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
    this.addressList[0].skill.ids.map( skill => {
      if ( skill.skillType === type._id ) {
        if ( this.otherText.includes(skill.skill.toLowerCase()) && type.skillType.toLowerCase() === 'clinical') {
          skillName.push(this.addressList[0].skill.clinicalOther);
        } else if ( this.otherText.includes(skill.skill.toLowerCase()) && type.skillType.toLowerCase() === 'administration') {
          skillName.push(this.addressList[0].skill.administrationOther);
        } else if ( this.otherText.includes(skill.skill.toLowerCase()) && type.skillType.toLowerCase() === 'softwares') {
          skillName.push(this.addressList[0].skill.softwaresOther);
        } else {
          skillName.push(skill.skill);
        }
      }
    });
    console.log(skillName);
    return skillName;
  }

/*   showSelectedSkill(type) {
    if (this.addressList.length === 0) {
      return false;
    }
    const skillName = [];
    this.addressList[0].skill.ids.map( skill => {
      if ( skill.skillType === type._id ) {
        if ( this.otherText.includes(skill.skill.toLowerCase()) && type.skillType.toLowerCase() === 'clinical') {
          skillName.push(this.addressList[0].skill.clinicalOther);
        } else if ( this.otherText.includes(skill.skill.toLowerCase()) && type.skillType.toLowerCase() === 'administration') {
          skillName.push(this.addressList[0].skill.administrationOther);
        } else if ( this.otherText.includes(skill.skill.toLowerCase()) && type.skillType.toLowerCase() === 'softwares') {
          skillName.push(this.addressList[0].skill.softwaresOther);
        } else {
          skillName.push(skill.skill);
        }
      }
    });
    return skillName;
  } */

  getUserCalendar() {
    const condition = {
      userId: this.staffProfileInfo._id,
      date: this.todayDate
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

  getCalendarTitle(day: any) {
    if (day && day.events.length) {
      const dateData = day.events[0];
      if  ( dateData.status === environment.CALENDAR_STATUS.AVAILABLE) {
          if (dateData.availableType === 'any') {
            return 'Available all time';
          } else {
            return moment(dateData.startTime).format('hh:mm A') + ' - ' + moment(dateData.endTime).format('hh:mm A');
          }
      } else {
        return 'Not Available';
      }
    } else {
      return '';
    }
  }

  checkAvailability(date: Date) {
    return this.customCalendarDates.findIndex((day) => {
      return (differenceInCalendarDays(day.start, startOfDay(date)) === 0) ? true : false;
    });
  }

  /* beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void { body.forEach(day => {
    if (this.dateIsValid(day.date)) {
        const customCalendarIndex = this.checkAvailability(day.date);
        if (customCalendarIndex > -1) {
          day.cssClass = environment.CALENDAR_DATE_COLOR[this.customCalendarDates[customCalendarIndex].status];
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

  showUpdatedProfilePopup(profileStatus) {
    this.viewprofileModal.hide();
    const msg = (this.profileStatus.VERIFIED === profileStatus) ? 'verify' : 'reject';
    this.alertDetails = {
      title: (this.profileStatus.VERIFIED === profileStatus) ? 'Verify Profile' : 'Reject Profile',
      message: { show: true , message:
        'Are you sure you want to ' + msg + ' this profile ?'} ,
      cancelButton : { show: true, name: 'Cancel'},
      confirmButton: { show: true, name: 'Confirm'},
    };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
      if ( data ) {
        this.verifyProfile(profileStatus);
      } else {
        this.viewprofileModal.show();
      }
    });
  }

  verifyProfile(profileStatus) {
    this.spinner.show();
    let alertMsg = '';
    this.staffProfileInfo.profileVerificationStatus = profileStatus;
    // if(this.staffProfileInfo.userType === 'staff'){
    //   this.staffProfileInfo.positionType = this.staffProfileInfo.specialty.ids[0].positionType[0];
    // }
    if (this.staffProfileInfo['profileVerificationStatus'] === this.profileStatus.VERIFIED ) {
      alertMsg = 'Profile has been verified.';
      this.staffProfileInfo['email_templateName'] = 'profile-approved';
    } else if (this.staffProfileInfo['profileVerificationStatus'] === this.profileStatus.REJECTED) {
      alertMsg = 'Profile has been rejected.';
      this.staffProfileInfo['email_templateName'] = 'profile-rejected';
    }

    // this.staffProfileInfo.profileVerificationStatus = profileStatus;
    // const updateData = {
    //   profileVerificationStatus: this.profileStatus.VERIFIED,
    //   _id: this.staffProfileInfo._id,
    //   approved: true
    // };
    // console.log(updateData);
    // this.staffProfileInfo['approved'] = true;
    // this.staffProfileInfo['profileVerificationStatus'] = profileStatus;
    this.usersService.saveUserData(this.staffProfileInfo).subscribe(
      data => {
        // delete this.staffProfileInfo['approved'];
        this.spinner.hide();
        this.UsersProfileList = this.UsersProfileList.filter(function(value) {
         return value._id !== data.data._id;
        });
        this.showUserViewListModal(this.UsersProfileList, 'Profile Verification Requests' );
        if (data.status === 200) {
          this.toastr.success(alertMsg, 'Success');
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


   /**
   * Name: viewDownload():
   * Description: This method will show popup/modal for view and Download image.
   * @param filData is a image info.
   */

  viewDownload(filData?: any) {
    this.viewFileInfo = filData;
    this.ViewImages.show();
  }
}
