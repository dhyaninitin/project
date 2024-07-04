import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { LayoutService } from '../../services/layout.service';
import { ConfigService } from '../../config/config.service';
import { debounceTime, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { NavigationLink } from '../../interfaces/navigation-item.interface';
import { PopoverService } from '../../components/popover/popover.service';
import { Observable, of, Subject } from 'rxjs';
import { UserMenuComponent } from '../../components/user-menu/user-menu.component';
import { MatDialog } from '@angular/material/dialog';
import { SearchModalComponent } from '../../components/search-modal/search-modal.component';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store';
import { dataSelector } from 'app/store/auth/authentication.selector';
import { Profile } from 'app/shared/models/user.model';
import { Carblip_logo } from '@vex/components/config-panel/color-variables';
import { Router } from '@angular/router';

@Component({
  selector: 'vex-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Input() collapsed: boolean;
  collapsedOpen$ = this.layoutService.sidenavCollapsedOpen$;
  title$ = this.configService.config$.pipe(map(config => config.sidenav.title));
  imageUrl$ = this.configService.config$.pipe(map(config => config.sidenav.imageUrl));
  showCollapsePin$ = this.configService.config$.pipe(map(config => config.sidenav.showCollapsePin));
  userVisible$ = this.configService.config$.pipe(map(config => config.sidenav.user.visible));
  searchVisible$ = this.configService.config$.pipe(map(config => config.sidenav.search.visible));

  userMenuOpen$: Observable<boolean> = of(false);

  items = this.navigationService.items;

  private onDestroy$ = new Subject<void>();
  public userProfile: Profile;

  imagePath: string = '';
  isSideNavCollapsed: boolean = false;

  constructor(
    private navigationService: NavigationService,
    private layoutService: LayoutService,
    private configService: ConfigService,
    private readonly popoverService: PopoverService,
    private readonly dialog: MatDialog,
    private store$: Store<AppState>,
    private _cdr: ChangeDetectorRef,
    private route: Router
  ) { }

  ngOnInit() {
    this.getUserInfo();
    this.showCollapsePin$.subscribe(res => {
      if (res) {
        this.isSideNavCollapsed = false;
      }
    })
  }

  collapseOpenSidenav() {
    const matNavbarElement = document.querySelector('mat-sidenav-content') as HTMLElement;
    if (this.collapsed) {
      if (this.route.url === '/mDesk') {
        this.sidenaveOpen();
      } else {
        this.sidenaveCollapsed();
      }
    }
    this.isSideNavCollapsed = false;
    this.layoutService.collapseOpenSidenav();

  }

  collapseCloseSidenav() {
    const matNavbarElement = document.querySelector('mat-sidenav-content') as HTMLElement;
    if (this.collapsed) {
      if (this.route.url === '/mDesk') {
        this.sidenaveCollapsed();
      } else {
        this.sidenaveCollapsed();
      }
      this.isSideNavCollapsed = true;
    } else {
      this.sidenaveOpen();
    }
    this.layoutService.collapseCloseSidenav();
  }

  toggleCollapse() {
    this.collapsed ? this.layoutService.expandSidenav() : this.layoutService.collapseSidenav();
    const isDark = localStorage.getItem('portal-night-mode');
    this.imagePath = (isDark == '1') ? Carblip_logo.logo_white : Carblip_logo.logo_dark;
  }

  trackByRoute(index: number, item: NavigationLink): string {
    return item.route;
  }

  openProfileMenu(origin: HTMLDivElement): void {
    this.userMenuOpen$ = of(
      this.popoverService.open({
        content: UserMenuComponent,
        origin,
        offsetY: -8,
        width: origin.clientWidth,
        position: [
          {
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom'
          }
        ]
      })
    ).pipe(
      switchMap(popoverRef => popoverRef.afterClosed$.pipe(map(() => false))),
      startWith(true),
    );
  }

  openSearch(): void {
    this.dialog.open(SearchModalComponent, {
      panelClass: 'vex-dialog-glossy',
      width: '100%',
      maxWidth: '600px'
    });
  }

  getUserInfo() {
    this.store$.select(dataSelector).pipe(debounceTime(10),
      takeUntil(this.onDestroy$), tap((profile: Profile) => (this.userProfile = profile))).subscribe((profile: Profile) => {
        this.userProfile = profile;
        this._cdr.detectChanges();
      });
  }

  sidenaveCollapsed() {
    const matNavbarElement = document.querySelector('mat-sidenav-content') as HTMLElement;
    if (matNavbarElement) {
      matNavbarElement.style.marginLeft = 'var(--sidenav-collapsed-width)';
      matNavbarElement.style.setProperty('margin-left', 'var(--sidenav-collapsed-width)', 'important');

    }

  }

  sidenaveOpen() {
    const matNavbarElement = document.querySelector('mat-sidenav-content') as HTMLElement;
    if (matNavbarElement) {
      matNavbarElement.style.marginLeft = 'var(--sidenav-width)';
      matNavbarElement.style.setProperty('margin-left', 'var(--sidenav-width)', 'important');
    }
  }
}
