import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCandidateComponent } from './add-candidate/add-candidate.component';
import { CandidateComponent } from './candidate.component';
import { RouterModule } from '@angular/router';
import { CandidatedRoutingModule } from './candidate-routing.module';
import { MaterialModule } from '@tr';
import { LstorageService } from '@tr/src/app/utility/services/lstorage.service';
import { LSkeys } from '../utility/configs/app.constants';
import { McCoreModule, TranslatePipe } from '@cloudtalentrecruit/ng-core';



@NgModule({
  declarations: [
    AddCandidateComponent,
    CandidateComponent
  ],
  imports: [
    CommonModule,
    McCoreModule,
    CandidatedRoutingModule,
    MaterialModule
  ]
})
export class CandidateModule {
  constructor ( private lsServ: LstorageService ) {
    const languageData = this.lsServ.getItem(LSkeys.LANGUAGE);
    if(languageData) TranslatePipe.setLanguagePack(JSON.parse(languageData));
    TranslatePipe.setUserLanguage("EN-US")
  }
}