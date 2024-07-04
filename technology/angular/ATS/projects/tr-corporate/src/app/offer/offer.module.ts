import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OfferRoutingModule } from './offer-routing.module';
import { CandidateInfoComponent } from './components/candidate-info/candidate-info.component';
import { CreateOfferComponent } from './components/create-offer/create-offer.component';
import { GeneralInfoComponent } from './components/general-info/general-info.component';
import { SalaryStructureComponent } from './components/salary-structure/salary-structure.component';
import { ApprovalsComponent } from './components/approvals/approvals.component';
import { OfferSendOutComponent } from './components/offer-send-out/offer-send-out.component';
import { MaterialModule } from '@tr/src/app/material/material.module';
import { OfferComponent } from './offer.component';
import { McModule } from '@tr/src/app/mc/mc.module';
import { OfferLetterDialogComponent } from './components/candidate-info/offer-letter-dialog/offer-letter-dialog.component';
import { OfferBreakdownComponent } from './components/offer-breakdown/offer-breakdown.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet'; 
import { StepperModule } from '../stepper/stepper.module';
import { QuillModule } from 'ngx-quill';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { OfferModule } from '../settings/offer/offer.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [
    OfferComponent,
    CandidateInfoComponent,
    CreateOfferComponent,
    GeneralInfoComponent,
    SalaryStructureComponent,
    ApprovalsComponent,
    OfferSendOutComponent,
    OfferLetterDialogComponent,
    OfferBreakdownComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    OfferRoutingModule,
    MaterialModule,
    McModule,
    MatBottomSheetModule,
    StepperModule,
    ReactiveFormsModule,
    QuillModule.forRoot({
      modules: {
        syntax: true,
        toolbar:[]
      }
    }),
    OfferModule,
    PdfViewerModule
  ]
})
export class JobOfferModule { }
