import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MenuItem } from '../interfaces/menu-item.interface';
import { trackById } from '../../../../utils/track-by';
import { PopoverRef } from '../../../../components/popover/popover-ref';
import { debounceTime, Subject, takeUntil, tap } from 'rxjs';
import { Profile } from 'app/shared/models/user.model';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store';
import { dataSelector } from 'app/store/auth/authentication.selector';

export interface OnlineStatus {
  id: 'online' | 'away' | 'dnd' | 'offline';
  label: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'vex-toolbar-user-dropdown',
  templateUrl: './toolbar-user-dropdown.component.html',
  styleUrls: ['./toolbar-user-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarUserDropdownComponent implements OnInit {
  private onDestroy$ = new Subject<void>();
  public userProfile: Profile;
  
  items: MenuItem[] = [
    {
      id: '1',
      icon: 'mat:account_circle',
      label: 'My Profile',
      description: 'Personal Information',
      colorClass: 'text-teal',
      route: '/profile/overview'
    },
    // {
    //   id: '2',
    //   icon: 'mat:move_to_inbox',
    //   label: 'My Inbox',
    //   description: 'Messages & Latest News',
    //   colorClass: 'text-primary',
    //   route: '/apps/chat'
    // },
    // {
    //   id: '3',
    //   icon: 'mat:list_alt',
    //   label: 'My Projects',
    //   description: 'Tasks & Active Projects',
    //   colorClass: 'text-amber',
    //   route: '/apps/scrumboard'
    // },
    // {
    //   id: '4',
    //   icon: 'mat:table_chart',
    //   label: 'Billing Information',
    //   description: 'Pricing & Current Plan',
    //   colorClass: 'text-purple',
    //   route: '/pages/pricing'
    // }
  ];

  statuses: OnlineStatus[] = [
    {
      id: 'online',
      label: 'Online',
      icon: 'mat:check_circle',
      colorClass: 'text-green'
    },
    {
      id: 'away',
      label: 'Away',
      icon: 'mat:access_time',
      colorClass: 'text-orange'
    },
    {
      id: 'dnd',
      label: 'Do not disturb',
      icon: 'mat:do_not_disturb',
      colorClass: 'text-red'
    },
    {
      id: 'offline',
      label: 'Offline',
      icon: 'mat:offline_bolt',
      colorClass: 'text-gray'
    }
  ];

  activeStatus: OnlineStatus = this.statuses[0];

  trackById = trackById;

  constructor(private cd: ChangeDetectorRef,
              private popoverRef: PopoverRef<ToolbarUserDropdownComponent>,
              private store$: Store<AppState>) { }

  ngOnInit() {
    this.getUserInfo();
    const status = localStorage.getItem('userstatus') || 'online';
    const statusIndex = this.statuses.findIndex(obj => obj.id == status);
    this.activeStatus = this.statuses[statusIndex];
  }

  setStatus(status: OnlineStatus) {
    this.activeStatus = status;
    localStorage.setItem('userstatus', status.id);
    this.cd.markForCheck();
  }

  close() {
    this.popoverRef.close();
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
