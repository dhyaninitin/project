import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { UserFeedbackComponent } from '../../user-feedback/user-feedback.component';

@Component({
  selector: 'app-dashboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss'],
})
export class DashboardItemsComponent implements OnInit, OnDestroy{

  constructor
  (
    private dialog: MatDialog,
    private _empSer:EmployeeService
    ) {}

  ngOnInit(): void {
    this.reloadPage();
    this._empSer.navigationBtnsSubject.next(false);
  }

  reloadPage() {
    if (localStorage.getItem('reload')) {
      location.reload()
      localStorage.removeItem('reload')
    }
  }

  openFeedbackDialog() {
    this.dialog.open(UserFeedbackComponent, {
      width: '25rem',
      height: '645px',
      disableClose: true,
    });
  }

  ngOnDestroy(): void {
    this._empSer.navigationBtnsSubject.next(true);
  }
}
