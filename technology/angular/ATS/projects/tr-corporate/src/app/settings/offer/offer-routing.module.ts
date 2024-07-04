import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { GenericSettingsComponent } from "./generic-settings/generic-settings.component";
import { TemplateComponent } from "./template/template.component";
import { OfferLibraryComponent } from "./offer-library/offer-library.component";
import { CreateOfferFinalComponent } from "./create-offer-final/create-offer-final.component";
import { CreateOfferFirstComponent } from "./create-offer-first/create-offer-first.component";
import { CreateOfferSecondComponent } from "./create-offer-second/create-offer-second.component";
import { StepperComponent } from "./stepper/stepper.component";
import { VerifyOfferComponent } from "./verify-offer/verify-offer.component";
import { LibraryTemplateComponent } from "./library-template/library-template.component";

const routes: Routes = [
  {
    path: "template",
    component: TemplateComponent,
  },

  {
    path: "library",
    component: OfferLibraryComponent,
  },

  {
    path: "library/template",
    component: LibraryTemplateComponent,
  },
  {
    path: "generic-setting",
    component: GenericSettingsComponent,
  },
  {
    path: "create-offer",
    component: CreateOfferFinalComponent,
  },
  {
    path: "create-offer-first",
    component: CreateOfferFirstComponent,
  },
  {
    path: "step",
    component: StepperComponent,
  },
  {
    path: "create-offer-second",
    component: CreateOfferSecondComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OfferRoutingModule {}
