import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../../environments/environment';
import { AlertService } from '../../../../../shared-ui/alert/alert.service';
import { Users } from '../../../../../shared-ui/modal/users.modal';
import { AddressService } from '../../../../../shared-ui/service/address.service';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { UserCalendarService } from '../../../../../shared-ui/service/userCalendar.service';
import { UsersService } from '../../../../../shared-ui/service/users.service';
import { Filter } from './users-staff.filter';
import { AccessLevelService } from '../../access-level/access-level.service';
import { PositionTypeService } from '../../../../../shared-ui/service/positionType.service';
import { PositionType } from '../../../../../shared-ui/modal/positionType.modal';

@Component({
  selector: 'app-users-staff',
  templateUrl: './users-staff.component.html',
  styleUrls: ['./users-staff.component.scss']
})
export class UsersStaffComponent implements OnInit {
  @ViewChild('deleteUser', { static: false }) public deleteUser: ModalDirective;
  // @ViewChild('viewUser', { static: false }) public viewUser: ModalDirective;
  @ViewChild('addEditUser', { static: false }) public addEditUser: ModalDirective;
  @ViewChild('changeUserStatus', { static: false }) public changeUserStatus: ModalDirective;
  page: String = 'Practice Users';

  userTypes: any = environment.USER_TYPE;
  profileStatus: any = environment.PROFILE_STATUS;
  access: any = {
    view: true,
    add: true,
    edit: true,
    delete: true,
    status: true
  };

  usersList: any = [];
  currentUser: any = new Users();
  dataFilter: Filter = new Filter();
  setDataFilter: any;
  order: String = 'createdBy';
  reverse: Boolean = false;
  itemsPerPage = 10;
  accessLevelList: any = [];
  /** Here is define  priperty validation fields */
  requiredValidate: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    positionType: '',
    // password: '',
    // accessLevelId: ''
  };
  // validCheckAlreadyExitRole = true;
  validCheckAlreadyExitEmail = true;
  validEmail = true;
  profileVerificationStatus = Object.values(environment.PROFILE_STATUS);
  positionTypeList: PositionType[] = [];
  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private usersService: UsersService,
    private AccessLevelService: AccessLevelService,
    private alertService: AlertService,
    private userCalendarService: UserCalendarService,
    private addressService: AddressService,
    private router: Router,
    private firebaseService: FirebaseService,
    private positionTypeService: PositionTypeService,
  ) {
    var access = this.jwtService.getAccess(this.page);
    if (access.length) {
      access[0].level.map(action => {
        this.access[action.label] = action[action.label];
      });
    }
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getUsersData();
    this.getAcessLevelData();
    this.getPositionTypeList();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  /** This method will filter user behalf criteria */
  setFilter() {
    this.setDataFilter = Object.assign({}, this.dataFilter);
  }

  /** This method will reset filter criteria*/
  resetFilter() {
    this.dataFilter = new Filter();
    this.setDataFilter = { firstName: '' };
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

  getAcessLevelData() {
    this.spinner.show();
    this.AccessLevelService.getAccessLevels({}).subscribe(
      data => {
        if (data.status === 200) {
          this.accessLevelList = data.data;
        }
        this.spinner.hide();
      },
      error => {
        this.globalService.error();
      }
    );
  }

  getUsersData() {
    this.spinner.show();
    const condition = {
      userType: this.userTypes.STAFF
    };
    this.usersService.getUsers({condition}).subscribe(
      data => {
        if (data.status === 200) {
          /* var found = data.data.filter( (obj)=> {
            return obj.userType !== environment.USER_TYPE.practice && obj.userType !== environment.USER_TYPE.staff;
          }) */
          this.usersList = data.data;
          this.usersList = this.usersList.map( user => {
            if(user.positionType) {
              user.positionType = user.positionType._id;
            }
            return user;
          })
          if ( this.usersList.length > 0) {
            this.getAllNotifications();
          }
        }
        this.spinner.hide();
      },
      error => {
        this.globalService.error();
      }
    );
  }

  getAllNotifications() {
    const self = this;
    const notifications = this.firebaseService.getAllNotification();
    notifications.on('value', function(snapshot) {
       const values = snapshot.val();
       if (values) {
         const convertObjToArray = Object.entries(values);
         convertObjToArray.forEach((value) => {
             // -----  Count Unread Notification -------------------------------
             if (environment.notificationStatus.UNREAD === value[1]['status'] && value[1]['admin']['users']) {
               const index = self.usersList.findIndex( user => {
                  return (user._id.toString() === value[1]['senderId'].toString());
                });
                if(index > -1) {
                  self.usersList[index]['newUser'] = true;
                  self.getAndUpdateJobNotification();
                }
             }
          });
            /* ------------------------------------------------------------ */
       }
     });
   }

   getAndUpdateJobNotification() {
    const self = this;
    setTimeout(function() {
         const status =  environment.notificationStatus.UNREAD;
         self.firebaseService.getAndUpdateAdminNotification(status, 'changesInLicense');
         self.usersList = self.usersList.map( user => {
            if (user['newUser']) {
              delete user['newUser'];
              return user;
            } else {
             return user;
            }
         });
    }, 10000);

   }

  showSaveUserModal(user?: any) {
    if (
      (user && user._id && !this.access.edit) ||
      (!user && !this.access.add)
    ) {
      this.toastr.info(this.globalService.permissionMessage, 'Info');
      return;
    }
    if (user && user._id) {
      this.currentUser = Object.assign({}, user);
    } else {
      this.currentUser = new Users();
    }

    this.validCheckAlreadyExitEmail = true;
    // this.validCheckAlreadyExitRole = true;
    this.validEmail = true;
    this.addEditUser.show();
  }

  showDeleteUser(user: any) {
    if (!this.access.delete) {
      this.toastr.info(this.globalService.permissionMessage, 'Info');
      return;
    }
    this.currentUser = user;
    this.deleteUser.show();
  }

  deleteUserData() {
    this.accessLevelList.filter;
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.usersService.deleteUser({ _id: this.currentUser._id }).subscribe(
      data => {
        this.spinner.hide();
        this.deleteUser.hide();
        if (data.status === 200) {
          var found = this.usersList.filter(obj => {
            return obj._id == this.currentUser._id;
          });
          if (found.length) {
            var index = this.usersList.indexOf(found[0]);
            this.usersList.splice(index, 1);
          }
          this.deleteCalendarData(this.currentUser._id);
          this.deleteAddress(this.currentUser._id);
          this.toastr.success('Record deleted successfully.', 'Success');
        }
        this.currentUser = new Users();
      },
      error => {
        this.deleteUser.hide();
        this.globalService.error();
      }
    );
  }

  deleteCalendarData(userId) {
    this.userCalendarService.deleteUserCalendar({ userId: userId._id }).subscribe(
      data => {
      },
      error => {
        this.globalService.error();
      }
    );
  }

  deleteAddress(userId) {
    this.addressService.deleteAddress({ userId: userId._id }).subscribe(
      data => {
      },
      error => {
        this.globalService.error();
      }
    );
  }

/*   validateForm() {
    this.spinner.show();
    const self = this;
    const objecKeys = Object.keys(this.requiredValidate);
    const found2 = objecKeys.filter(function(obj) {
      return !self.currentUser[obj];
    });
    if (found2.length) {
      this.alertService.error('* Please fill all mandatory fields!');
      setTimeout(() => {
        this.alertService.clear();
      }, 5000);
      return false;
    } else {
      const condition = {
        email :  this.currentUser.email.toLowerCase()
      };

      this.usersService.getUsers({condition}).subscribe(
        data => {
          if (data.status === 200) {
              if (data.data.length) {
                if ( data.data[0]._id.toString() === this.currentUser._id.toString()) {
                  this.validCheckAlreadyExitEmail = true;
                  this.saveUserData();
                } else {
                  this.validCheckAlreadyExitEmail = false;
                  this.spinner.hide();
                }
            } else {
              this.validCheckAlreadyExitEmail = true;
              this.saveUserData();
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
  } */
  validateForm() {
    this.spinner.show();
    const self = this;
    const objecKeys = Object.keys(this.requiredValidate);
    const found2 = objecKeys.filter(function(obj) {
      return !self.currentUser[obj];
    });
    if (found2.length) {
      // console.log("I am here");
      this.spinner.hide();
      this.alertService.error('* Please fill all mandatory fields!');
      setTimeout(() => {
        this.alertService.clear();
      }, 5000);
      return false;
    } else {
      const condition = {
        email :  this.currentUser.email.toLowerCase()
      };

      this.usersService.getUsers({condition}).subscribe(
        data => {
          if (data.status === 200) {
              if (data.data.length) {
                if (!this.currentUser._id) {
                  // console.log("If");
                  this.validCheckAlreadyExitEmail = false;
                  this.spinner.hide();
                } else if (this.currentUser._id && data.data[0]._id.toString() === this.currentUser._id.toString()) {
                  // console.log("else if");
                  this.validCheckAlreadyExitEmail = true;
                  this.saveUserData();
                } else {
                  // console.log("else");
                  this.validCheckAlreadyExitEmail = false;
                  this.spinner.hide();
                }
            } else {
              this.validCheckAlreadyExitEmail = true;
              this.saveUserData();
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
  }

  saveUserData() {
    // console.log(this.currentUser);
    // return false;
    // var found = self.accessLevelList.filter(
    //   obj => obj._id === this.currentUser.accessLevelId
    // );
    /* ---------------------- */
    /* var self = this;
    const objecKeys = Object.keys(this.requiredValidate);
    var found2 = objecKeys.filter(function(obj) {
      return !self.currentUser[obj];
    });
    if (found2.length) {
      this.alertService.error('*Please fill all mandatory fields!');
      setTimeout(() => {
        this.alertService.clear();
      }, 5000);
      return false;
    } */
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    // this.spinner.show();
    if ( !this.currentUser._id) {
      this.currentUser.userType = this.userTypes.STAFF;
      this.currentUser.addUserByAdmin = true;
    }
    // this.currentUser.userType = found[0].role.userType;
    this.currentUser.createdBy = this.jwtService.currentLoggedUserInfo._id;
    console.log(this.currentUser);

    this.usersService.doSignup(this.currentUser).subscribe(
      data => {
        this.spinner.hide();
        this.resetFilter();
        this.spinner.hide();
        this.addEditUser.hide();
        if (data.status === 200) {
          if (this.currentUser._id) {
            const self = this;
            const index = self.usersList.findIndex(obj => {
              return obj._id == this.currentUser._id;
            });
            console.log(index);
            if (index > -1) {
              this.usersList[index] = data.data;
            }
          } else {
            this.usersList.push(data.data);
          }
          if (data.sendEmail && !this.currentUser._id) {
            this.toastr.success('User added successfully.', 'Success');
          } else if (!data.sendEmail && !this.currentUser._id) {
            this.toastr.warning('User added successfully but due to server error email not sends.', 'Warning');
          } else {
            this.toastr.success('User updated successfully', 'Success');
          }
          this.currentUser = new Users();
        } else {
          this.globalService.error();
        }
        // this.getUsersData();
      },
      error => {
        this.addEditUser.hide();
        this.globalService.error();
      }
    );
  }

  closeModel() {
    this.addEditUser.hide();
    this.deleteUser.hide();
    // this.viewUser.hide();
    this.currentUser = new Users();
  }


  // checkAlreadyExitRole(currentUser: any) {
  //   if (this.usersList.length) {
  //     var found = [];
  //     var self = this;
  //     if (currentUser._id) {
  //       found = self.usersList.filter(
  //         obj =>
  //           obj.accessLevelId === currentUser.accessLevelId &&
  //           obj._id !== currentUser._id
  //       );
  //     } else {
  //       found = self.usersList.filter(
  //         obj => obj.accessLevelId === currentUser.accessLevelId
  //       );
  //     }
  //     if (found.length) {
  //       this.validCheckAlreadyExitRole = false;
  //     } else {
  //       this.validCheckAlreadyExitRole = true;
  //     }
  //   } else {
  //     this.validCheckAlreadyExitRole = true;
  //   }
  // }



  checkAlreadyExitEmail(currentUser: any) {
    this.validEmail = this.globalService.ValidateEmail(currentUser.email)
    if(this.validEmail) {
      if (this.usersList.length) {
        var found = [];
        var self = this;
        if (currentUser._id) {
          found = self.usersList.filter(
            obj => obj.email === currentUser.email && obj._id !== currentUser._id
          );
        } else {
          found = self.usersList.filter(obj => obj.email === currentUser.email);
        }
        if (found.length) {
          this.validCheckAlreadyExitEmail = false;
        } else {
          this.validCheckAlreadyExitEmail = true;
        }
      } else {
        this.validCheckAlreadyExitEmail = true;
      }
    } else {
      this.validCheckAlreadyExitEmail = true;
      return this.validEmail;
    }
  }

  showUserchange(currentUser: any) {
    if (!this.access.status) {
      this.toastr.info(this.globalService.permissionMessage, 'Info');
      return;
    }
    this.currentUser = currentUser;
    this.changeUserStatus.show();
  }

  changeStatus() {
    this.spinner.show();
    this.currentUser.status = this.currentUser.status === 1 ? 0 : 1;
    if (this.currentUser.status) {
      this.currentUser['email_templateName'] = 'profile-active';
    } else {
      this.currentUser['email_templateName'] = 'profile-inactive';
    }
    this.usersService.changeSatus(this.currentUser).subscribe(
      data => {
        this.spinner.hide();
        this.toastr.success('Status change successfully.', 'Success');
        this.changeUserStatus.hide();
        this.deleteUser.hide();
        this.getUsersData();
        this.currentUser = new Users();
      },
      error => {
        this.toastr.error('There are server error in change property status');
      }
    );
  }

  showUserViewModal(user: any) {
    if (!this.access.view) {
      this.toastr.info(this.globalService.permissionMessage, 'Info');
      return;
    }
    this.router.navigate(['/staff-profile', user._id]);
    // if (user.profileVerificationStatus = environment.PROFILE_STATUS.PENDING || environment.PROFILE_STATUS.VERIFIED ){
      // if (user.userType === environment.USER_TYPE.PRACTICE) {
      //   this.router.navigate(['/practice-profile', user._id]);
      // } else {
      //   this.router.navigate(['/staff-profile', user._id]);
      // }
    // } else {
    //   this.currentUser = user;
    //   this.viewUser.show();
    // }
  }

  // AvoidSpace(event?: any) {
  //   var k = event ? event.which : event.keyCode;
  //   if (k == 32) return false;
  // }
}
