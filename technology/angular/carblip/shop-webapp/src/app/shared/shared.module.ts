import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { Ng5SliderModule } from 'ng5-slider';
import {
  BsDatepickerModule,
  PopoverModule,
  TabsModule,
  TooltipModule,
} from 'ngx-bootstrap';
import { UiSwitchModule } from 'ngx-ui-switch';
import { UICarouselModule } from 'ui-carousel';

import { AppCustomOverlayComponent } from 'app/shared/component/custom-overlay/custom-overlay.component';
import { InitialLoaderComponent } from 'app/shared/component/initial-loader/initial-loader.component';
import { AppLoaderComponent } from 'app/shared/component/loader/loader.component';
/**
 * Ngrx Effects
 */

import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './states/auth/auth.effects';
import { AuthServiceImpl } from './states/auth/auth.service';
import { BrandsEffects } from './states/brands/brands.effects';
import { BrandsServiceImpl } from './states/brands/brands.service';
import { ConfigurationEffects } from './states/configuration/configuration.effects';
import { ConfigurationServiceImpl } from './states/configuration/configuration.service';
import { LeaseEffects } from './states/lease/lease.effects';
import { LeaseServiceImpl } from './states/lease/lease.service';
import { ModelsEffects } from './states/models/models.effects';
import { ModelsServiceImpl } from './states/models/models.service';
import { MyRequestEffects } from './states/my-request/myrequests.effects';
import { MyRequestServiceImpl } from './states/my-request/myrequests.service';
import { SearchEffects } from './states/search/search.effects';
import { SearchServiceImpl } from './states/search/search.service';
import { TrimEffects } from './states/trim/trim.effects';
import { TrimServiceImpl } from './states/trim/trim.service';

import { AutofocusDirective } from 'app/shared/directives/autofocus.directive';
import { CircleColorDirective } from './directives/circle-color.directive';
import { FocusFirstInvalidFieldDirective } from './directives/formfirstfocus.directive';
import { LazyloaderDirective } from './directives/lazyloader.directive';
import { NoRightClickDirective } from './directives/norightclick.directive';
import { NoSpaceDirective } from './directives/nospace.directive';
import { NoSpecialCharDirective } from './directives/nospecialchar.directive';
import { NoWhiteSpaceDirective } from './directives/nowhitespace.directive';
import { PhoneNumberDirective } from './directives/phonenumber.directive';
import { ShowpasswordDirective } from './directives/showpassword.directive';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { NgxPaginationModule } from 'ngx-pagination';
import { DigitOnlyDirective } from './directives/digitonly.directive';
import { ShortNumberPipe } from './pipes/short-number.pipe';

import { RecaptchaModule } from "ng-recaptcha";
import { PhonePipe } from './pipes/phone.pipe';

/**
 * Services
 */

/**
 * this module should be imported in every sub-modules
 * you can define here the modules, components, pipes that you want to re-use all over your app
 */
export const modules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  FlexLayoutModule,
  StoreModule,
  TranslateModule,
  TabsModule,
  NgSelectModule,
  BsDatepickerModule,
  FontAwesomeModule,
  TooltipModule,
  PopoverModule,
  NgxPaginationModule,
  CurrencyMaskModule,
  UICarouselModule,
  UiSwitchModule,
  Ng5SliderModule,
  OverlayModule,
  RecaptchaModule
];

export const declarations = [
  AppCustomOverlayComponent,
  AppLoaderComponent,
  InitialLoaderComponent,
  AutofocusDirective,
  LazyloaderDirective,
  NoWhiteSpaceDirective,
  FocusFirstInvalidFieldDirective,
  PhoneNumberDirective,
  NoSpecialCharDirective,
  NoSpaceDirective,
  PhoneNumberDirective,
  ShortNumberPipe,
  CircleColorDirective,
  ShowpasswordDirective,
  DigitOnlyDirective,
  NoRightClickDirective,
  PhonePipe
];

@NgModule({
  imports: [
    ...modules,
    UiSwitchModule.forRoot({
      size: 'medium',
      color: '#f59300',
    }),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    PopoverModule.forRoot(),
    BsDatepickerModule.forRoot(),
    EffectsModule.forFeature([
      AuthEffects,
      BrandsEffects,
      ModelsEffects,
      TrimEffects,
      ConfigurationEffects,
      MyRequestEffects,
      LeaseEffects,
      SearchEffects,
    ]),
  ],
  exports: [...modules, ...declarations],
  declarations,
  providers: [
    BrandsServiceImpl,
    ModelsServiceImpl,
    TrimServiceImpl,
    AuthServiceImpl,
    MyRequestServiceImpl,
    LeaseServiceImpl,
    ConfigurationServiceImpl,
    SearchServiceImpl,
  ],
  entryComponents: [AppCustomOverlayComponent],
})
export class SharedModule {
  constructor() {
    library.add(fas, far, fab);
  }
}
