import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store';
import { PopoverService } from '../../../components/popover/popover.service';
import { ToolbarUserDropdownComponent } from './toolbar-user-dropdown/toolbar-user-dropdown.component';
import { dataSelector } from 'app/store/auth/authentication.selector';
import { Profile } from 'app/shared/models/user.model';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'vex-toolbar-user',
  templateUrl: './toolbar-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarUserComponent implements OnInit {

  dropdownOpen: boolean;
  
  private onDestroy$ = new Subject<void>();
  public userProfile: Profile;

  constructor(private popover: PopoverService,
              private cd: ChangeDetectorRef,
              private store$: Store<AppState>) { }

  ngOnInit() {
    this.getUserInfo();
  }

  showPopover(originRef: HTMLElement) {
    this.dropdownOpen = true;
    this.cd.markForCheck();

    const popoverRef = this.popover.open({
      content: ToolbarUserDropdownComponent,
      origin: originRef,
      offsetY: 12,
      position: [
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom'
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
      ]
    });

    popoverRef.afterClosed$.subscribe(() => {
      this.dropdownOpen = false;
      this.cd.markForCheck();
    });
  }


  getUserInfo() {
    this.store$.select(dataSelector).pipe(debounceTime(10), 
    takeUntil(this.onDestroy$), tap((profile: Profile) => (this.userProfile = profile))).subscribe(res=> {
      if(res) {
        this.cd.detectChanges();
      }
    });
  }
}
