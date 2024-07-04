import {
  Directive,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { MatSidenav } from '@angular/material/sidenav';
import { MatchMediaService } from 'app/shared/services/match-media.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EgretSidenavHelperService } from './egret-sidenav-helper.service';

@Directive({
  selector: '[appEgretSidenavHelper]',
})
export class EgretSidenavHelperDirective implements OnInit, OnDestroy {
  @HostBinding('class.is-open')
  isOpen: boolean;

  @Input('egretSidenavHelper')
  id: string;

  @Input('isOpen')
  isOpenBreakpoint: string;

  private unsubscribeAll: Subject<any>;
  watcher: Subscription

  constructor(
    private matchMediaService: MatchMediaService,
    private egretSidenavHelperService: EgretSidenavHelperService,
    private matSidenav: MatSidenav,
    private media: MediaObserver
  ) {
    // Set the default value
    this.isOpen = true;

    this.unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.egretSidenavHelperService.setSidenav(this.id, this.matSidenav);

    if (this.media.isActive(this.isOpenBreakpoint)) {
      this.isOpen = true;
      this.matSidenav.mode = 'side';
      this.matSidenav.toggle(true);
    } else {
      this.isOpen = false;
      this.matSidenav.mode = 'over';
      this.matSidenav.toggle(false);
    }

    this.watcher = this.matchMediaService.onMediaChange
      // .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(() => {
        if (this.media.isActive(this.isOpenBreakpoint)) {
          this.isOpen = true;
          this.matSidenav.mode = 'side';
          this.matSidenav.toggle(true);
        } else {
          this.isOpen = false;
          this.matSidenav.mode = 'over';
          this.matSidenav.toggle(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.watcher.unsubscribe();
    // this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }
}

@Directive({
  selector: '[appEgretSidenavToggler]',
})
export class EgretSidenavTogglerDirective {
  @Input('egretSidenavToggler')
  public id: any;

  constructor(private egretSidenavHelperService: EgretSidenavHelperService) {}

  @HostListener('click')
  onClick() {
    // console.log(this.egretSidenavHelperService.getSidenav(this.id))
    this.egretSidenavHelperService.getSidenav(this.id).toggle();
  }
}
