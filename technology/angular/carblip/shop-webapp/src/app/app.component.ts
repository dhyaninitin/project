import { Component, Inject, OnDestroy, OnInit, Renderer } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ConnectionService } from 'ng-connection-service';
import { Subject, Subscription } from 'rxjs';

import { NavigationStart, Router } from '@angular/router';
import { NotificationService } from 'app/shared/services/notification.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import { environment } from 'environments/environment';
import { LANGUAGES } from './core/injection-tokens';
import { IStore } from './shared/interfaces/store.interface';
import * as UiActions from './shared/states/ui/ui.actions';

import { NOTIFICATION_LIST } from 'app/core/constant';
import { NO_INTERNET } from 'app/core/events';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  subscription: Subscription;
  isConnected = true;
  constructor(
    private translate: TranslateService,
    @Inject(LANGUAGES) public languages,
    private store$: Store<IStore>,
    private renderer: Renderer,
    router: Router,
    private connectionService: ConnectionService,
    private notificationService$: NotificationService,
    private segmentioService$: SegmentioService
  ) {
    this.subscription = router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.renderer.setElementClass(document.body, 'enable-scroll', true);
      }
    });

    // Check point if no internet, send event to segment
    this.connectionService.monitor().subscribe(isConnected => {
      this.isConnected = isConnected;
      if (!this.isConnected) {
        this.notificationService$.error(NOTIFICATION_LIST.noInternet);
        this.segmentioService$.track(
          NO_INTERNET.EVENT_NAME,
          NO_INTERNET.PROPERTY_NAME,
          NO_INTERNET.SCREEN_NAME,
          NO_INTERNET.ACTION_NAME
        );
      }
    });
  }

  ngOnInit() {
    const browserLanguage = this.translate.getBrowserLang();

    // if dev decided to use the browser language as default and if this language is handled by the app, use it
    const defaultLanguage =
      environment.useBrowserLanguageAsDefault &&
      this.languages.includes(browserLanguage)
        ? browserLanguage
        : this.languages[0];

    // default and fallback language
    // if a translation isn't found in a language,
    // it'll try to get it on the default language
    this.translate.setDefaultLang(defaultLanguage);
    this.store$.dispatch(
      new UiActions.SetLanguage({ language: defaultLanguage })
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
