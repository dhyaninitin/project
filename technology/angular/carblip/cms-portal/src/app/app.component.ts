import {
  Component,
  Inject,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { combineLatest, fromEvent, Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { AppState } from './store';

import { AppLoaderService } from './shared/services/app-loader/app-loader.service';
// import { LayoutService } from './shared/services/layout.service';
import { RoutePartsService } from './shared/services/route-parts.service';
import { processingSelector as authUserProcessingSelector, dataSelector as userDataSelector } from './store/auth/authentication.selector';
import { processingSelector as portaluserProcessingSelector } from './store/portalusers/portalusers.selectors';
import { processingSelector as dealerProcessingSelector } from './store/dealers/dealers.selectors';
import { ClearDetail as errorClearDetail } from './store/error/error.actions';
import { errorSelector } from './store/error/error.selectors';
import { processingSelector as locationsProcessingSelector } from './store/locations/locations.selectors';
import { processingSelector as quotesProcessingSelector } from './store/quotes/quotes.selectors';
import { processingSelector as requestsProcessingSelector } from './store/requests/requests.selectors';
import { processingSelector as usersProcessingSelector } from './store/users/users.selectors';
import { ConfigService } from '../@vex/config/config.service';
import { Settings } from 'luxon';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { NavigationService } from '../@vex/services/navigation.service';
import { LayoutService } from '../@vex/services/layout.service';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SplashScreenService } from '../@vex/services/splash-screen.service';
import { VexConfigName } from '../@vex/config/config-name.model';
import { ColorSchemeName } from '../@vex/config/colorSchemeName';
import { MatIconRegistry, SafeResourceUrlWithIconOptions } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ColorVariable, colorVariables } from '../@vex/components/config-panel/color-variables';
import { Profile } from './shared/models/user.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ResetRequiredComponent } from './views/profile/reset-required/reset-required.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  appTitle = 'Carblip Admin';
  pageTitle = '';
  userProfile: Profile;

  private onDestroy$ = new Subject<void>();
  authUserProcessing$: Observable<any>;
  userDataSelector$: Observable<any>;
  usersProcessing$: Observable<any>;
  locationsProcessing$: Observable<any>;
  portaluserProcessingSelector$: Observable<any>;
  requestsProcessingSelector$: Observable<any>;
  quotesProcessingSelector$: Observable<any>;
  dealerProcessingSelector$: Observable<any>;

  constructor(
    public title: Title,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private routePartsService: RoutePartsService,
    private loader$: AppLoaderService,
    private store$: Store<AppState>,
    private snack$: MatSnackBar,
    private configService: ConfigService,
    private renderer: Renderer2,
    private platform: Platform,
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCALE_ID) private localeId: string,
    private layoutService: LayoutService,
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private splashScreenService: SplashScreenService,
    private readonly matIconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer,
    private dialog: MatDialog
  ) {
    this.authUserProcessing$ = this.store$.select(authUserProcessingSelector);
    this.usersProcessing$ = this.store$.select(usersProcessingSelector);
    this.userDataSelector$ = this.store$.select(userDataSelector);
    this.locationsProcessing$ = this.store$.select(locationsProcessingSelector);
    this.portaluserProcessingSelector$ = this.store$.select(
      portaluserProcessingSelector
    );
    this.requestsProcessingSelector$ = this.store$.select(
      requestsProcessingSelector
    );
    this.quotesProcessingSelector$ = this.store$.select(
      quotesProcessingSelector
    );
    this.dealerProcessingSelector$ = this.store$.select(
      dealerProcessingSelector
    );

    Settings.defaultLocale = this.localeId;

if (this.platform.BLINK) {
this.renderer.addClass(this.document.body, 'is-blink');
}

this.matIconRegistry.addSvgIconResolver(
(
name: string,
namespace: string
): SafeResourceUrl | SafeResourceUrlWithIconOptions | null => {
switch (namespace) {
case 'mat':
  return this.domSanitizer.bypassSecurityTrustResourceUrl(
    `assets/img/icons/material-design-icons/two-tone/${name}.svg`
  );

case 'logo':
  return this.domSanitizer.bypassSecurityTrustResourceUrl(
    `assets/img/icons/logos/${name}.svg`
  );

case 'flag':
  return this.domSanitizer.bypassSecurityTrustResourceUrl(
    `assets/img/icons/flags/${name}.svg`
  );
}
}
);

/**
* Customize the template to your needs with the ConfigService
* Example:
*  this.configService.updateConfig({
*    sidenav: {
*      title: 'Custom App',
*      imageUrl: '//placehold.it/100x100',
*      showCollapsePin: false
*    },
*    footer: {
*      visible: false
*    }
*  });
*/

/**
* Config Related Subscriptions
* You can remove this if you don't need the functionality of being able to enable specific configs with queryParams
* Example: example.com/?layout=apollo&style=default
*/
this.route.queryParamMap.subscribe(queryParamMap => {
if (queryParamMap.has('layout')) {
this.configService.setConfig(queryParamMap.get('layout') as VexConfigName);
}

if (queryParamMap.has('style')) {
this.configService.updateConfig({
style: {
  colorScheme: queryParamMap.get('style') as ColorSchemeName
}
});
}

if (queryParamMap.has('primaryColor')) {
const color: ColorVariable = colorVariables[queryParamMap.get('primaryColor')];

if (color) {
this.configService.updateConfig({
  style: {
    colors: {
      primary: color
    }
  }
});
}
}

if (queryParamMap.has('rtl')) {
this.configService.updateConfig({
direction: coerceBooleanProperty(queryParamMap.get('rtl')) ? 'rtl' : 'ltr'
});
}
});

/**
* Add your own routes here
*/
this.navigationService.items = [
{
type: 'subheading',
label: 'Dashboards',
children: [
{
  type: 'link',
  label: 'Analytics',
  route: '/',
  icon: 'mat:insights',
  routerLinkActiveOptions: { exact: true }
}
]
}
];


  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
  
  ngOnInit() {
    this.changePageTitle();

    combineLatest(
      this.authUserProcessing$,
      this.usersProcessing$,
      this.locationsProcessing$,
      this.portaluserProcessingSelector$,
      this.requestsProcessingSelector$,
      this.quotesProcessingSelector$,
      this.dealerProcessingSelector$
    )
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(([p1, p2, p3, p4, p5, p6, p7]) => {
        if (p1 || p2 || p3 || p4 || p5 || p6 || p7) {
          this.loader$.open();
        } else {
          this.loader$.close();
        }
      });
    this.initErrorHandler();

    this.userDataSelector$.pipe(takeUntil(this.onDestroy$)).subscribe(res => {
      this.userProfile = res;
      if(this.userProfile.is_reset_password_required) {
        const dialogRef = this.dialog.open(ResetRequiredComponent, {
          width: '520px',
          disableClose: true
        });
      }
    })
  }

  initErrorHandler() {
    this.store$
      .select(errorSelector)
      .pipe(
        takeUntil(this.onDestroy$),
        tap(errors => {
          if (errors.length) {
            this.snack$.open(errors[0].message, 'OK', {
              duration: 4000,
              panelClass: ['snack-warning'],
              verticalPosition: 'top',
            });
            this.store$.dispatch(new errorClearDetail());
          }
        })
      )
      .subscribe();
  }

  changePageTitle() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(routeChange => {
        const routeParts = this.routePartsService.generateRouteParts(
          this.activeRoute.snapshot
        );
        if (!routeParts.length) {
          return this.title.setTitle(this.appTitle);
        }
        // Extract title from parts;
        this.pageTitle = routeParts
          .reverse()
          .map(part => part.title)
          .reduce((partA, partI) => {
            return `${partA} > ${partI}`;
          });
        this.pageTitle += ` | ${this.appTitle}`;
        this.title.setTitle(this.pageTitle);
      });
  }
}
