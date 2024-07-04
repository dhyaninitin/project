import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedModule } from 'app/shared/shared.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

// import { CommonDirectivesModule } from './sdirectives/common/common-directives.module';
import { QuoteComponent } from './quote/quote.component';
import { PrintsRoutes } from './prints.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    SharedMaterialModule,
    PerfectScrollbarModule,
    RouterModule.forChild(PrintsRoutes),
  ],
  declarations: [
    QuoteComponent,
  ],
})
export class PrintsModule {}
