import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import * as _ from 'underscore';

import { egretAnimations } from 'app/shared/animations/egret-animations';

import { Profile } from 'app/shared/models/user.model';
import { AppState } from 'app/store/';
import * as actions from 'app/store/auth/authentication.action';
import {
  dataSelector,
  didFetchSelector,
  fetchingSelector,
} from 'app/store/auth/authentication.selector';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { scaleIn400ms } from '@vex/animations/scale-in.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProfileOverviewEditComponent } from '../overview-edit/overview-edit.component';
import { PhoneNumbersListService } from 'app/shared/services/apis/phone-numbers.service';

@Component({
  selector: 'app-profile-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  animations: [
    fadeInUp400ms,
    fadeInRight400ms,
    scaleIn400ms,
    stagger40ms
  ]
})

/**
 * Profile Overview Component
 * Show User Profile
 */
export class ProfileOverviewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public didFetch$: Observable<any>;
  public fetching$: Observable<any>;
  public userProfile: Profile;

  public search = '';

  carblipAssignedPhone: string = null;

  constructor(
    private store$: Store<AppState>,
    private changeDetectorRefs: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog,
    private service$: PhoneNumbersListService
  ) {
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.fetching$ = this.store$.select(fetchingSelector);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.getUserInfo();
  }

  /**
   * Get User Location
   * @param {}
   */

  getLocation() {
    let result = '';
    if (this.userProfile && this.userProfile.location) {
      result = this.userProfile.location.name;
    }
    return result;
  }

  /**
   * Get User Role
   * @param {}
   */

  getRole() {
    let role = '';
    if (this.userProfile && this.userProfile.roles) {
      role = this.userProfile.roles[0].name;
    }
    return role;
  }

  getUserInfo() {
    this.store$
      .select(dataSelector)
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap((profile: Profile) => {
          this.userProfile = profile;
          if(this.userProfile?.roles[0]?.id == 6) {
            this.getCarblipAssignedNumber();
          }
          this.changeDetectorRefs.detectChanges();
        })
      )
      .subscribe();
  }

  loadData() {
    this.store$.dispatch(new actions.GetUserInfo());
  }

  editProfile() {
    this.dialog.open(ProfileOverviewEditComponent, {
      width: '720px',
      disableClose: true,
      data: this.carblipAssignedPhone
    }).afterClosed().subscribe((userInfo: any) => {
      if (userInfo) {
        this.getUserInfo();
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  openSocialProfile(url: string) {
    window.open(url, '_blank');
  }

  getCarblipAssignedNumber() {
    this.service$.showAssignedNumber().subscribe(res => {
      if(res.data) {
        this.carblipAssignedPhone = res.data.phone;
        this.changeDetectorRefs.detectChanges();
      } else {
        this.carblipAssignedPhone = null;
      }
    })
  }

  locationName(item:any){
    if(item){
      return item.map((item: any) => item.name);
    }
    return '';
  }

}
