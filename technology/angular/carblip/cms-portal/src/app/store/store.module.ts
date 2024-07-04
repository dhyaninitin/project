import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import {
  RouterStateSerializer,
  StoreRouterConnectingModule,
} from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { effects, reducers, rootEffects, services } from 'app/store';
import { environment } from 'environments/environment';
import { CustomSerializer } from './router/router.state';

@NgModule({
  imports: [
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot(rootEffects),
    EffectsModule.forFeature(effects),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    StoreRouterConnectingModule,
  ],
  providers: [
    ...services,
    {
      provide: RouterStateSerializer,
      useClass: CustomSerializer,
    },
  ],
})
export class AppStoreModule {}
