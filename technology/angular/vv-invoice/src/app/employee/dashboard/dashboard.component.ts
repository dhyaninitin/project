import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LogoutDialogComponent } from 'src/app/shared/logout-dialog/logout-dialog.component';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { UserFeedbackComponent } from '../user-feedback/user-feedback.component';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  userName: any;
  showNavigationBtns: boolean = true;
  isSidenavOpen: boolean = true;

  constructor(
    private router: Router,
    private _empSer: EmployeeService,
    private dialog: MatDialog,
    private _authSer: AuthService
  ) {
    this.getUserName();
  }

  ngOnInit(): void {
    this._empSer.navigationBtnsSubject.subscribe((x) => {
      if (x == true) {
        this.showNavigationBtns = true;
      }
    });

    const savedSidenavState = localStorage.getItem('isSidenavOpen');
    if (savedSidenavState !== null) {
      this.isSidenavOpen = JSON.parse(savedSidenavState);
    }
  }

  onSidenavOpen() {
    localStorage.setItem('isSidenavOpen', 'true');
  }

  onSidenavClose() {
    localStorage.setItem('isSidenavOpen', 'false');
  }

  getUserName() {
    if (this._authSer.userName) {
      this.userName = this._authSer.userName;
    } else {
      this._authSer.tokenDecoder(null);
      this.userName = this._authSer.userName;
    }
  }

  ngAfterViewInit(): void {
    this._empSer.navigationBtnsSubject.subscribe((x) => {
      if (x == false) {
        Promise.resolve().then(() => (this.showNavigationBtns = false));
      }
    });
  }

  logout() {
    this.dialog
      .open(LogoutDialogComponent, {
        width: '350px',
        height: 'auto',
        disableClose: true,
        data: this.userName,
      })
      .afterClosed()
      .subscribe((x) => {
        if (x == true) {
          localStorage.clear();
          this.router.navigateByUrl('/auth/login');
          localStorage.setItem('reload', 'true');
        }
      });
  }

  onComponentChange() {
    this._empSer.employeeData = [];
    this._empSer.getComData = [];
    localStorage.removeItem('templateid');
    localStorage.removeItem('templateType');
  }

  openFeedbackDialog() {
    this.dialog.open(UserFeedbackComponent, {
      width: '25rem',
      height: '645px',
      disableClose: true,
    });
  }
}
