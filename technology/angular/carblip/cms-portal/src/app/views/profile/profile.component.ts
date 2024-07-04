import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
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
import { initialState } from 'app/store/auth/authentication.state';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { scaleIn400ms } from '@vex/animations/scale-in.animation';
import { Link } from '@vex/interfaces/link.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [
    fadeInRight400ms,
    scaleIn400ms,
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public didFetch$: Observable<any>;
  public fetching$: Observable<any>;
  public userProfile: Profile;

  public search = '';

  constructor(private store$: Store<AppState>,
    private _cdr: ChangeDetectorRef) {
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.fetching$ = this.store$.select(fetchingSelector);
  }

  links: Link[] = [
    {
      label: 'ABOUT',
      route: './',
      routerLinkActiveOptions: { exact: true }
    }
  ];

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.didFetch$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(didFetch => !didFetch && this.loadData())
      )
      .subscribe();

    this.store$
      .select(dataSelector)
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap((profile: Profile) => (this.userProfile = profile))
      )
      .subscribe((profile: Profile)=> {
        this.userProfile = profile;
        this._cdr.detectChanges();
      });
  }

  loadData() {
    this.store$.dispatch(new actions.GetUserInfo());
  }
}
