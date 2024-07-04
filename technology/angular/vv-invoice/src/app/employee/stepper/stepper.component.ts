import { Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
})
export class StepperComponent implements OnInit {
  @ViewChild('stepper') private stepper!: MatStepper;
  isLinear = false;

  constructor() {}

  ngOnInit(): void {}

  checkStep(event: any) {
    if (event == true) {
      this.stepper.next();
    }
  }
}
