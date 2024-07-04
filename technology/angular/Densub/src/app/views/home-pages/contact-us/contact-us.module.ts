import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';
import { ContactUsRoutingModule } from './contact-us-routing.module';
import { ContactUsComponent } from './contact-us.component';
import { AgmCoreModule } from '@agm/core';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    ContactUsRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyBIuweZ1ZG3J1slMo9sQAzEL4a-D4P76co",
      libraries: ["places"]
    }),
  ],
  declarations: [ContactUsComponent],
  providers: []
})
export class ContactUsModule { }
