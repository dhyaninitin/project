import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AccessLevel } from './access-level.modal';
import { AccessLevelService } from './access-level.service';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { UsersService } from '../../../../shared-ui/service/users.service';

@Component({
  selector: 'app-access-level',
  templateUrl: './access-level.component.html',
  styleUrls: ['./access-level.component.scss']
})
export class AccessLevelComponent implements OnInit {
  page: String = 'Access Level';
  access: any = {
    view: true,
    add: true,
    edit: true,
    delete: true
  }
  @ViewChild('deleteAccessLevelModal', { static: false })
  public deleteAccessLevelModal: ModalDirective;
  @ViewChild('addEditAccessLevelModal', { static: false })
  public addEditAccessLevelModal: ModalDirective;
  accessLevelList: any = [];
  currentAccessLevel: AccessLevel = new AccessLevel();
  setDataFilter: any;
  order: String = 'accessLevel';
  reverse: Boolean = false;
  sortedCollection: any[];
  itemsPerPage = 10;
  MenuData: any = []
  validCheckAlreadyExitLevel: any = true;

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private AccessLevelService: AccessLevelService,
    private usersService: UsersService
  ) {
    this.MenuData =  this.globalService.getMenuData;
    var access = this.jwtService.getAccess(this.page);
    if (access.length){
      access[0].level.map( (action) => {
        this.access[action.label] = action[action.label];
      })
    }
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getAcessLevelData();
    this.getRolesData();
    if (!this.MenuData.length) {
      setTimeout(() => {
        this.MenuData =  this.globalService.getMenuData;
      }, 1000);
    }
  }
  roleList: any = [];
  getRolesData() {
    this.spinner.show();
    this.usersService.getRoles({}).subscribe(
      data => {
        if (data.status === 200) {
          this.roleList = data.data;
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
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  selectedRole(item1: any, item2: any) {
    if (item2){
      return item1._id === item2._id;
    } else{
      return null;
    }
  }

  showSaveAccessLevelModal(accessLevel?: any) {
    if ((accessLevel && accessLevel._id && !this.access.edit) || (!accessLevel && !this.access.add)){
      this.toastr.info(this.globalService.permissionMessage, 'Info');
      return
    }
    if (accessLevel && accessLevel._id) {
      this.currentAccessLevel = Object.assign({}, accessLevel);
    } else {
      this.currentAccessLevel = new AccessLevel();
      this.currentAccessLevel.levelJson = this.MenuData;
    }
    this.validCheckAlreadyExitLevel = true;
    this.addEditAccessLevelModal.show();
  }

  showDeleteAccessLevel(accessLevel: any) {
    if (!this.access.delete){
      this.toastr.info(this.globalService.permissionMessage, 'Info');
      return
    }
    this.currentAccessLevel = accessLevel;
    this.deleteAccessLevelModal.show();
  }

  deleteAccessLevel() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.AccessLevelService
      .deleteAccessLevel({ _id: this.currentAccessLevel._id })
      .subscribe(
        data => {
          this.spinner.hide();
          this.deleteAccessLevelModal.hide();
          if (data.status === 200) {
            var found = this.accessLevelList.filter(obj => {
              return obj._id == this.currentAccessLevel._id;
            });
            if (found.length) {
              var index = this.accessLevelList.indexOf(found[0]);
              this.accessLevelList.splice(index, 1);
            }
            this.toastr.success('Record deleted successfully.', 'Success');
          }
          this.currentAccessLevel = new AccessLevel();
        },
        error => {
          this.spinner.hide();
          this.deleteAccessLevelModal.hide();
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      );
  }

  saveAccessLevelData() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    this.currentAccessLevel.createdBy = this.jwtService.currentLoggedUserInfo._id;
    this.AccessLevelService.saveAccessLevel(this.currentAccessLevel).subscribe(
      data => {
        this.spinner.hide();
        this.addEditAccessLevelModal.hide();
        if (data.status === 200) {
          if (this.currentAccessLevel._id) {
            var self = this;
            var found = self.accessLevelList.filter(obj => {
              return obj._id == this.currentAccessLevel._id;
            });
            if (found.length) {
              var index = this.accessLevelList.indexOf(found[0]);
              this.accessLevelList[index] = data.data;
            }
          } else {
            this.accessLevelList.push(data.data);
          }
          this.toastr.success('Data saved successfully.', 'Success');
        }
        this.currentAccessLevel = new AccessLevel();
      },
      error => {
        this.spinner.hide();
        this.addEditAccessLevelModal.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  closeModel() {
    this.addEditAccessLevelModal.hide();
    this.deleteAccessLevelModal.hide();
    this.currentAccessLevel = new AccessLevel();
  }

  checkAlreadyExitLevelType(currentType: any) {
    if (currentType.role !== 'null' && this.accessLevelList.length) {
      var found = [];
      var self = this;
      if (currentType._id){
        found = self.accessLevelList.filter( obj => obj.role.userType.toLowerCase() === currentType.role.userType.toLowerCase() && obj._id !== currentType._id);
      } else{
        found = self.accessLevelList.filter( obj => obj.role.userType.toLowerCase() === currentType.role.userType.toLowerCase());
      }
      if (found.length) {
        this.validCheckAlreadyExitLevel = false;
      } else{
        this.validCheckAlreadyExitLevel = true;
      }

    } else{
      this.validCheckAlreadyExitLevel = true;
    }
  }
}
