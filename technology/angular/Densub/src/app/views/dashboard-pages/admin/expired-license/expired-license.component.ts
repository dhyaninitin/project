import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap';
import { Users } from '../../../../shared-ui/modal/users.modal';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UsersService } from '../../../../shared-ui/service/users.service';
import { AlertService } from '../../../../shared-ui/alert/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expired-license',
  templateUrl: './expired-license.component.html',
  styleUrls: ['./expired-license.component.scss']
})
export class ExpiredLicenseComponent implements OnInit {
  @ViewChild('changeUserStatus', { static: false }) public changeUserStatus: ModalDirective;
  page: String = 'Users';
  userTypes: any = environment.USER_TYPE;
  usersList: any = [];
  currentUser: Users = new Users();
  order: String = 'createdBy';
  reverse: Boolean = false;
  sortedCollection: any[];
  itemsPerPage = 10;

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
    private usersService: UsersService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getUsersData();
  }

  getUsersData() {
    this.spinner.show();
    this.usersService.getExpiredLicense({}).subscribe(
      data => {
        if (data.status === 200) {
          this.usersList = data.data;
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

  showUserDetails(userId) {
    this.router.navigate(['/staff-profile', userId]);
  }

  showUserchange(currentUser: any) {
    this.currentUser = currentUser;
    this.changeUserStatus.show();
  }

  changeStatus() {
    this.spinner.show();
    const updateData = {
      _id: this.currentUser._id,
      status: this.currentUser.status === 1 ? 0 : 1
    };
    this.usersService.changeSatus(updateData).subscribe(
      data => {
        this.spinner.hide();
        this.changeUserStatus.hide();
        this.getUsersData();
        this.currentUser = new Users();
      },
      error => {
        this.toastr.error('There are server error in change property status');
      }
    );
  }



}
