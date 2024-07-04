import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TestStartConfirmationComponent } from '../test-start-confirmation/test-start-confirmation.component';
import { Renderer2 } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { CommonService } from 'src/app/shared/services/common.service';


@Component({
  selector: 'app-test-description',
  templateUrl: './test-description.component.html',
  styleUrls: ['./test-description.component.scss']
})
export class TestDescriptionComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private renderer: Renderer2,
    private commonService: CommonService,
    private platformLocation: PlatformLocation
  ) {
    history.pushState(null, '', location.href);
    this.platformLocation.onPopState(() => {
      history.pushState(null, '', location.href);
    });
  }

  ngOnInit(): void {
    document.documentElement.requestFullscreen();
    if (localStorage.getItem('currentPage') == 'signup') {
      localStorage.setItem('currentPage', 'description')
    } else {
      this.commonService.logout();
      this.router.navigateByUrl('/session-expired')
    }
  }

  startTest() {
    const dialogRef = this.dialog.open(TestStartConfirmationComponent, {
      width: 'fit-content',
      height: 'fit-content'
    });
    dialogRef.afterClosed().subscribe((res: boolean) => {
      if (res == true) {
        this.router.navigateByUrl('/test/test-questions');
      }
    })
  }

  tabMinimizeAndRestored() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('Tab minimized');
      } else {
        console.log('Tab restored');
      }
    });
  }

}
