import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MStepperComponent } from './m-stepper.component';
import { NgCircleProgressModule } from 'ng-circle-progress';


@NgModule({
  declarations: [
    MStepperComponent
  ],
  imports: [
    CommonModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 30,
      outerStrokeWidth: 5,
      innerStrokeWidth: 0,
      outerStrokeColor: "#00A46C",
      innerStrokeColor: "#FFFFFF",
      showSubtitle: false,
      units: '',
      animationDuration: 300,
    })
  ],
  exports:[MStepperComponent]
})
export class StepperModule { }
