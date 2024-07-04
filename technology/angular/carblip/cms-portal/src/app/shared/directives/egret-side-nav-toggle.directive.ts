import {
  Directive,
  Host,
  OnDestroy,
  OnInit,
  Optional,
  Self,
} from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appEgretSideNavToggle]',
})
export class EgretSideNavToggleDirective implements OnInit, OnDestroy {
  isMobile;
  screenSizeWatcher: Subscription;
  constructor(
    private media: MediaObserver,
    @Host() @Self() @Optional() public sideNav: MatSidenav
  ) {}

  ngOnInit() {
    this.initSideNav();
  }

  ngOnDestroy() {
    if (this.screenSizeWatcher) {
      this.screenSizeWatcher.unsubscribe();
    }
  }

  updateSidenav() {
    const self = this;
    setTimeout(() => {
      self.sideNav.opened = !self.isMobile;
      self.sideNav.mode = self.isMobile ? 'over' : 'side';
    });
  }
  initSideNav() {
    this.isMobile = this.media.isActive('xs') || this.media.isActive('sm');
    // console.log(this.isMobile)
    this.updateSidenav();
    this.screenSizeWatcher = this.media.asObservable().subscribe((change: MediaChange[]) => {
      this.isMobile = change[0].mqAlias === 'xs' || change[0].mqAlias === 'sm';
      this.updateSidenav();
    });
  }
}
