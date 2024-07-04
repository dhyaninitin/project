import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoginComponent } from 'app/shared/component/login/login.component';
import { SharedModule } from 'app/shared/shared.module';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { LayoutComponent } from './layout.component';
import { LeadLayoutComponent } from './lead-layout.component';
import { SubFooterComponent } from './sub-footer/sub-footer.component';
import { SubHeaderComponent } from './sub-header/sub-header.component';
import { PromoCodeComponent } from './promo/promo-code/promo-code.component';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [
    LayoutComponent,
    LeadLayoutComponent,
    HeaderComponent,
    SubHeaderComponent,
    FooterComponent,
    SubFooterComponent,
    LoginComponent,
    PromoCodeComponent,
  ],
  exports: [
    LayoutComponent,
    LeadLayoutComponent,
    HeaderComponent,
    SubHeaderComponent,
  ],
})
export class LayoutModule {}
