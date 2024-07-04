import { PlatformLocation } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-test-complete',
  templateUrl: './test-complete.component.html',
  styleUrls: ['./test-complete.component.scss']
})
export class TestCompleteComponent implements OnInit, OnDestroy {

  selectedRating: number;
  comment: string;
  feedbackSubmitted: boolean = false;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private commonService: CommonService,
    private snackbar: MatSnackBar,
    private platformLocation: PlatformLocation, 
  ) {
    history.pushState(null, '', location.href);
    this.platformLocation.onPopState(() => {
      history.pushState(null, '', location.href);
    })
    this.selectedRating = 0;
    this.comment = '';
  }
  ngOnDestroy(): void {
    this.commonService.logout();
  }

  ngOnInit() {
    if (localStorage.getItem('currentPage') == 'questions') {
      localStorage.setItem('currentPage', 'completed')
    } else {
      this.commonService.logout();
      this.router.navigateByUrl('/session-expired')
    }
  }

  // checkWindowReloaded() {
  //   const isLeaving = sessionStorage.getItem('isLeaving');
  //   if (isLeaving && window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
  //     sessionStorage.removeItem('isLeaving'); // Remove the flag
  //     this.router.navigateByUrl('/sign-up');
  //   }
  //   window.onbeforeunload = () => {
  //     sessionStorage.setItem('isLeaving', 'true');
  //   };
  // }

  // tabMinimizeAndRestored() {
  //   document.addEventListener('visibilitychange', () => {
  //     if (document.hidden) {
  //       console.log('Tab minimized');
  //     } else {
  //       console.log('Tab restored');
  //     }
  //   });
  // }

  sendFeedback() {
    let paylaod = {
      userId: this.commonService.getUserDetails().userId,
      comment: this.comment,
      feedbackRating: +this.selectedRating
    }
    this.authService.sendFeedback(paylaod).subscribe((res: any) => {
      if (res.status == 200) {
        this.feedbackSubmitted = true;
        this.snackbar.open(res.message, "Cancel", { duration: 3000, });
      }
    })
  }

}