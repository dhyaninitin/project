import { Component, EventEmitter, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'm-stepper',
  templateUrl: './m-stepper.component.html',
  styleUrls: ['./m-stepper.component.scss']
})
export class MStepperComponent implements OnInit, OnChanges {
  @Input() activeStep : number = 0;
  @Input() itemList: String[] = []
  
  fillPercent = 0;
  steps = '';
  stepName: String = ''; 
  status = 'In progress';
  counterStep = 0;
  totalSteps = 1;

  constructor() { }
  
  ngOnChanges(changes: SimpleChanges): void {
    if( this.counterStep == 0 && this.activeStep == 0) {
      this.counterStep += 1;
      this.totalSteps = this.activeStep + 1;
      this.stepName = this.itemList[this.activeStep];
      this.steps = "" + (this.activeStep+1) + "/" + this.itemList.length; 
    } else if (this.counterStep == 0 && this.activeStep > 0) {
      this.counterStep += 1;
      this.totalSteps = this.activeStep;
      this.stepName = this.itemList[0];
      this.steps = "" + (this.activeStep) + "/" + this.itemList.length; 
    } else {
      this.counterStep += 1;
      this.totalSteps = this.activeStep + 1;
      this.stepName = this.itemList[this.activeStep];
      this.steps = "" + (this.activeStep+1) + "/" + this.itemList.length;
    }

    this.fillCircleArea();
  }

  ngOnInit(): void {
    
  }
  
  fillCircleArea() {
    const percent = Math.abs(100/this.itemList.length);
    this.fillPercent = 0;
      this.fillPercent = percent * this.totalSteps;
  }
}
