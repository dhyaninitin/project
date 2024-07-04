import { Component, OnDestroy, Inject, ViewEncapsulation, OnInit, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SimpleTimer } from 'ng2-simple-timer';
import { startOfDay, differenceInCalendarDays } from 'date-fns';
import * as moment from 'moment';

import { navItems, practiceNavItems, staffNavItems } from '../../_nav';
import { AlertService } from '../../shared-ui/alert/alert.service';
import { JwtService } from '../../shared-ui/service/jwt.service';
import { environment } from '../../../environments/environment';
import { FirebaseService } from '../../shared-ui/service/firebase.service';
import { Notification } from '../../shared-ui/modal/notification.modal';
import { UsersService } from '../../shared-ui/service/users.service';
import { WorkDiaryService } from '../../shared-ui/service/workDiary.service';
import { TimesheetService } from '../../shared-ui/service/timesheet.service';
import { AlertConfirmService } from '../../shared-ui/service/alertConfirm.service';
import { AlertConfirm } from '../../shared-ui/component/alert-confirm/alert-confirm.modal';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class DefaultLayoutComponent implements OnInit, OnDestroy {
  fullYear = new Date().getFullYear();
  notificationCount = 0;
  currentUser: any;
  public navItems = navItems;
  public previousNavItems = navItems;
  public sidebarMinimized = true;
  private changes: MutationObserver;
  public element: HTMLElement;
  notificationList: any = [];
  notificationStatus: any = environment.notificationStatus;
  sideNavCounts = {
    messageCount: 0,
    receivedOffer: 0,
    sentOffer: 0,
    contracts: 0,
    payments: 0,
    disputes: 0,
    users: 0
  };
  expiredLicense: any = [];
  profileStatus = environment.PROFILE_STATUS;
  showAlertMsg = false;
  alertMessage = '';
  workDiary: any = {};
  totalTime: any;
  alertDetails: AlertConfirm = new AlertConfirm();

  constructor(
    private st: SimpleTimer,
    private ngZone: NgZone,
    private router: Router,
    private toastr: ToastrService,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
    private usersService: UsersService,
    private workDiaryService: WorkDiaryService,
    private timesheetService: TimesheetService,
    private alertConfirmService: AlertConfirmService,
    private alertService: AlertService, @Inject(DOCUMENT) _document?: any,
  ) {
    // this.getNotifications();
    this.currentUser = this.jwtService.getCurrentUser();
    this.loadSideBar();
    this.changes = new MutationObserver((mutations) => {
      this.sidebarMinimized = _document.body.classList.contains('sidebar-minimized');
    });
    this.element = _document.body;
    this.changes.observe(<Element>this.element, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  ngOnInit() {
    // this.getNotifications();
    if(this.currentUser.profileVerificationStatus !== 'new'){
      this.getAllNotifications();
      this.getMessageCount();
    }
    
    if (this.currentUser.userType === environment.USER_TYPE.STAFF) {
      this.getUsersData();
    }
    // this.firebaseService.preLoadUnreadNotification();
    // this.firebaseService.changedNotification.subscribe( data => {
    //   this.notificationList = data['notificationList'];
    //   this.notificationCount = data['unreadNotification'];
    // });
  }

  loadSideBar() {
    if (this.currentUser.accessLevel && this.currentUser.accessLevel.length && this.currentUser.userType !== environment.USER_TYPE.ADMIN) {
      const levels = this.currentUser.accessLevel[0];
      let found = [];
      this.navItems = [];
      navItems.map((nav) => {
        found = levels.levelJson.filter((levels) => levels.menu === nav.name && levels.level[0].view);
        if (found.length) {
          this.navItems.push(nav);
          this.previousNavItems.push(nav);
        }
      });
    }
    if (this.currentUser.userType === environment.USER_TYPE.PRACTICE) {
      this.navItems = practiceNavItems;
      this.previousNavItems = practiceNavItems;
    }
    if (this.currentUser.userType === environment.USER_TYPE.STAFF) {
      this.navItems = staffNavItems;
      this.previousNavItems = staffNavItems;
    }
  }

  //getNotifications() {
  // const self = this;
  // this.firebaseService.getNotification( function(list, count) {
  //   self.ngZone.run(() => {
  //     self.notificationList = list ;
  //     self.notificationCount = count;
  //     // self.navItems = self.navItems.map( value => {
  //       // if (self.currentUser.userType === environment.USER_TYPE.PRACTICE) {
  //       //   self.navItems = practiceNavItems;
  //       // } else if (self.currentUser.userType === environment.USER_TYPE.STAFF) {
  //       //   self.navItems = staffNavItems;
  //       // } else{
  //       //  return value;
  //       // }
  //     //
  //     // })
  //   });
  // });
  // }

  stopTimerAlert() {
    this.alertDetails = {
      title: 'Alert',
      message: { show: true, message: 'Time tracker is running. Are you sure you want to logout?' },
      cancelButton: { show: true, name: 'Close' },
      confirmButton: { show: true, name: 'Confirm' },
    };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe(data => {
      if (data) {
        const value = JSON.parse(window.localStorage.getItem('timetracker'));
        this.st.unsubscribe(value.timer1Id);
        this.totalTime = new Date(value.seconds * 1000).toISOString().substr(11, 8);
        const object = { staffId: this.currentUser._id, date: moment(new Date()).toISOString(), clockInTime: '', clockOutTime: new Date().toLocaleTimeString(), timeDuration: this.totalTime, jobPostId: value.jobPostId };
        this.sendClockEvent();
        this.timesheetService.addTimesheet(object).subscribe(data => {
          if (data.status === 200) {
            window.localStorage.removeItem('timetracker');
            this.jwtService.destroyToken();
            this.toastr.success('You have logged out successfully.');
            this.router.navigate(['/login']);
          } else {
            this.toastr.error('There are some server Please check connection.', 'Error');
          }
        });
      }
      return false;
    });
  }

  logout() {
    const value = JSON.parse(window.localStorage.getItem('timetracker'));
    if (value && value.seconds) {
      this.stopTimerAlert();
    } else {
      this.jwtService.destroyToken();
      this.toastr.success('You have logged out successfully.');
      this.router.navigate(['/login']);
    }
  }

  sendClockEvent() {
    const value = JSON.parse(window.localStorage.getItem('timetracker'));
    if (this.workDiary.date) {
      this.workDiary.date = moment(this.workDiary.date).toISOString();
    }
    const temp = this.totalTime.split(':');
    const totalTimeObject = { hours: temp[0], minutes: temp[1] };
    this.workDiary.date = new Date(moment(new Date()).toISOString());
    value.timer1button = 'Clock In Now';
    this.workDiary.timeClockStatus = 'In progress - On break';
    this.workDiary.clockOutTime = new Date().toLocaleTimeString();
    this.workDiary.startTime = moment(new Date()).toISOString();
    this.workDiary.totalTime = totalTimeObject;
    this.workDiary.contractId = value.contractId;
    this.workDiary.practiceId = value.practiceId;
    this.workDiary.jobPostId = value.jobPostId;
    this.workDiary.staffId = this.currentUser._id;
    let workDiary = JSON.parse(JSON.stringify(this.workDiary));
    this.workDiaryService.addWork(workDiary).subscribe(data => {
      if (data.status === 200) {
        let message = 'Clock In/Out event is submitted to practice.';
        this.toastr.success(message, 'Success');
      } else {
        this.toastr.error('There are some server Please check connection.', 'Error');
      }
    }, error => {
      this.toastr.error('There are some server Please check connection.', 'Error');
    });
  }

  updateNotificationStatus(notification: Notification) {
    const redirectLink = notification.redirectLink.toString();
    if (notification.status === this.notificationStatus.UNREAD) {
      notification.status = this.notificationStatus.READ;
      this.firebaseService.updateNotification(notification);
    }
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.navigate([redirectLink]);
  }

  getAllNotifications() {
    const self = this;
    const notifications = this.firebaseService.getAllNotification();
    notifications.on('value', async function (snapshot) {
      const values = snapshot.val();
      if (values) {
        self.notificationList = [];
        self.notificationCount = 0;
        self.sideNavCounts = {
          messageCount: 0,
          receivedOffer: 0,
          sentOffer: 0,
          contracts: 0,
          payments: 0,
          disputes: 0,
          users: 0
        };
        let convertObjToArray = Object.entries(values);
        //  convertObjToArray;
        convertObjToArray.forEach((value, index) => {
          // --------- Skip the delete Notification -----------------------
          if (environment.notificationStatus.DELETE === value[1]['status']) {
            return false;
          }
          // -----  Count Unread Notification -------------------------------
          if (environment.notificationStatus.UNREAD === value[1]['status']) {

            if (self.currentUser.userType === environment.USER_TYPE.PRACTICE ||
              self.currentUser.userType === environment.USER_TYPE.STAFF) {

              self.notificationCount++;

              if (value[1][self.currentUser.userType] && value[1][self.currentUser.userType]['sentOffer']) {
                self.sideNavCounts.sentOffer += value[1][self.currentUser.userType]['sentOffer'];
              }
              if (value[1][self.currentUser.userType] && value[1][self.currentUser.userType]['receivedOffer']) {
                self.sideNavCounts.receivedOffer += value[1][self.currentUser.userType]['receivedOffer'];
              }
              if (value[1][self.currentUser.userType] && value[1][self.currentUser.userType]['contract']) {
                self.sideNavCounts.contracts += value[1][self.currentUser.userType]['contract'];
              }
            }

            if (self.currentUser.userType === environment.USER_TYPE.ADMIN) {
              self.notificationCount++;
              if (value[1][self.currentUser.userType] && value[1][self.currentUser.userType]['payment']) {
                self.sideNavCounts.payments += value[1][self.currentUser.userType]['payment'];
              }
              if (value[1][self.currentUser.userType] && value[1][self.currentUser.userType]['disputes']) {
                self.sideNavCounts.disputes += value[1][self.currentUser.userType]['disputes'];
              }

              if (value[1][self.currentUser.userType] && value[1][self.currentUser.userType]['users']) {
                self.sideNavCounts.users += value[1][self.currentUser.userType]['users'];
              }
            }
          }
          value[1]['id'] = value[0];
          self.notificationList.push(value[1]);
          /* --------------------- Updating Side Bar -------------------- */
          if (index === (convertObjToArray.length - 1)) {
            self.notificationList.reverse();
            // self.getMessageCount();
            self.updateSidebar();
          }
          /* ------------------------------------------------------------ */
        });
      }
    });
  }

  getMessageCount() {
    const self = this;
    let s = this.firebaseService.GetDataList('UserMessageRecipient');
    s.snapshotChanges().subscribe(data => {
      data.forEach((item, index) => {
        if (index === 0) {
          self.sideNavCounts.messageCount = 0;
        }
        const user = item.payload.toJSON();
        const keys = Object.keys(user['recipients']);
        if (keys[keys.indexOf(self.currentUser._id)] === self.currentUser._id) {
          keys.splice(keys.indexOf(self.currentUser._id), 1);
          const partnerID = keys[0];
          user['$key'] = item.key;
          user['partnerData'] = user['recipients'][partnerID];
          self.sideNavCounts.messageCount += user['message']['recipients'][self.currentUser._id]['unread'];
        }
        /* --------------------- Updating Side Bar -------------------- */
        if (index === (data.length - 1)) {
          self.updateSidebar();
        }
        /* ------------------------------------------------------------ */
      });
    });
  };

  updateSidebar() {
    if (!this.previousNavItems) {
      return false;
    }
    let navItems = JSON.parse(JSON.stringify(this.previousNavItems));
    navItems = navItems.map(value => {
      let badge = {
        variant: 'danger',
        text: ''
      };
      switch (value['name']) {
        case 'Messages':
          badge.text = (this.sideNavCounts.messageCount > 0) ? this.sideNavCounts.messageCount.toString() : '';
          break;
        case 'Offers':
          if (this.sideNavCounts.sentOffer > 0 || this.sideNavCounts.receivedOffer > 0) {
            badge.text = 'New';
            value.children.map(child => {
              if (child['name'] === 'Sent Offers' && this.sideNavCounts.sentOffer > 0) {
                child['badge'] = {
                  variant: 'danger',
                  text: this.sideNavCounts.sentOffer.toString()
                };
              }
              if (child['name'] === 'Received Offers' && this.sideNavCounts.receivedOffer > 0) {
                child['badge'] = {
                  variant: 'danger',
                  text: this.sideNavCounts.receivedOffer.toString()
                };
              }
            });
          } else {
            badge.text = '';
          }
          break;
        case 'My posted jobs':
          // this.sideNavCounts.sentOffer > 0 ||
          if (this.sideNavCounts.receivedOffer > 0) {
            badge.text = 'New';
            // badge.text =  'New';
          } else {
            badge.text = '';
          }
          break;
        case 'Contracts':
          badge.text = (this.sideNavCounts.contracts > 0) ? this.sideNavCounts.contracts.toString() : '';
          break;
        case 'Assignments':
          badge.text = (this.sideNavCounts.contracts > 0) ? this.sideNavCounts.contracts.toString() : '';
          break;
        case 'Payments':

          badge.text = (this.sideNavCounts.payments > 0 &&
            this.currentUser.userType === environment.USER_TYPE.ADMIN) ?
            this.sideNavCounts.payments.toString() : '';
          break;
        case 'Disputes':

          badge.text = (this.sideNavCounts.disputes > 0 &&
            this.currentUser.userType === environment.USER_TYPE.ADMIN) ?
            this.sideNavCounts.disputes.toString() : '';
          break;
        case 'Users':
          value.children.map(child => {
            if (child['name'] === 'Staff' && this.sideNavCounts.users > 0 &&
              this.currentUser.userType === environment.USER_TYPE.ADMIN) {
              child['badge'] = {
                variant: 'danger',
                text: this.sideNavCounts.users.toString()
              };
            }
          });
          // badge.text = (  this.sideNavCounts.users > 0 &&
          //                 this.currentUser.userType === environment.USER_TYPE.ADMIN) ?
          //                 this.sideNavCounts.users.toString() : '';
          break;
        default:
          return value;
      }
      value['badge'] = badge;
      return value;
    });
    this.ngZone.run(() => {
      this.navItems = navItems;
    });
  }

  clearNotifications() {
    if (this.notificationList.length > 0) {
      this.notificationList.forEach(notification => {
        notification.status = this.notificationStatus.DELETE;
        this.firebaseService.updateNotification(notification);
      });
    }
  }

  getUsersData() {
    this.usersService.getUserInfo({ _id: this.jwtService.currentLoggedUserInfo._id }).subscribe(
      data => {
        if (data.status === 200) {
          const userData = data.data;
          if (userData.profileVerificationStatus === this.profileStatus.VERIFIED) {
            this.expiredLicense = userData.licensesDetails.filter((license, index) => {
              const todayDate = startOfDay(new Date());
              const expireDate = startOfDay(license.expirationDate);
              const diffDay = differenceInCalendarDays(expireDate, todayDate);
              if (diffDay <= 45) {
                userData.licensesDetails[index]['diffDay'] = diffDay;
                return true;
              }
              return false;
            });
          } else if (userData.profileVerificationStatus === this.profileStatus.PENDING) {
            this.showAlertMsg = true;
            this.alertMessage = 'Your profile is pending approval by admin';
          }
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
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

  getExipredMessage() {
    let msg = 'Your dental license ';
    this.expiredLicense.map((license, index) => {
      if (license.diffDay < 0) {
        msg += (index > 0) ? ' and ' : '';
        msg += license.licenseNumber + ' is expired';
      } else if (license.diffDay === 0) {
        msg += (index > 0) ? ' and ' : '';
        msg += license.licenseNumber + ' will expire today';
      } else {
        msg += (index > 0) ? ' and ' : '';
        msg += license.licenseNumber + ' will expire in ' + license.diffDay + ' days';
      }
    });

    return msg + '.';
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }
}
