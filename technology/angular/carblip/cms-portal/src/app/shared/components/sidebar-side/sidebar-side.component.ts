import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Profile } from 'app/shared/models/user.model';
import { ILayoutConf, LayoutService } from 'app/shared/services/layout.service';
import { AppState } from 'app/store';
import { GetUserInfo } from 'app/store/auth/authentication.action';
import { dataSelector } from 'app/store/auth/authentication.selector';
import { deepEqual } from 'assert';
import { NgxRolesService } from 'ngx-permissions';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { NavigationService } from '../../../shared/services/navigation.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-sidebar-side',
  templateUrl: './sidebar-side.component.html',
})

/**
 * Sidebar Component
 * Component for website Sidebar
 * @type {component}
 */
export class SidebarSideComponent implements OnInit, OnDestroy, AfterViewInit {
  private onDestroy$ = new Subject<void>();

  public menuItems: any[];
  public hasIconTypeMenuItem: boolean;
  public iconTypeMenuTitle: string;
  private menuItemsSub: Subscription;
  public layoutConf: ILayoutConf;

  public userProfile: Profile;

  role: number;
  constructor(
    private store: Store<AppState>,
    private navService: NavigationService,
    public themeService: ThemeService,
    private layout: LayoutService,
    private rolesService$: NgxRolesService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.iconTypeMenuTitle = this.navService.iconTypeMenuTitle;

    this.layoutConf = this.layout.layoutConf;

    this.store
      .select(dataSelector)
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap((profile: Profile) => (this.userProfile = profile))
      )
      .subscribe();

    combineLatest(
      this.navService.menuItems$,
      this.store.select(state => state.authentication)
    )
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(([menuItem, userInfo]) => {
        /**
         * Filter out sidebar based on permission
         */
        this.menuItems = this.filterOut(menuItem);

        // Checks item list has any icon type.
        this.hasIconTypeMenuItem = !!this.menuItems.filter(
          item => item.type === 'icon'
        ).length;

        this.changeDetectorRefs.detectChanges();
      });
  }

  ngAfterViewInit() {}
  ngOnDestroy() {
    if (this.menuItemsSub) {
      this.menuItemsSub.unsubscribe();
    }
  }

  /**
   * Funtion to toggle sidebar
   * @param {}
   */

  toggleCollapse() {
    if (this.layoutConf.sidebarCompactToggle) {
      this.layout.publishLayoutChange({
        sidebarCompactToggle: false,
      });
    } else {
      this.layout.publishLayoutChange({
        // sidebarStyle: "compact",
        sidebarCompactToggle: true,
      });
    }
  }

  /**
   * Funtion to filter sidebar based on user role
   * @param menuItems menuItems
   */

  filterOut(menuItems) {
    const roles = this.rolesService$.getRoles();
    menuItems = menuItems.filter(item => {
      let show = true;
      if (item.role) {
        show = false;
        item.role.forEach(i => {
          if (roles[i]) {
            show = true;
          }
        });
      }
      return show;
    });
    return menuItems;
  }
}
