import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { SnackBarService } from '../../../utility/services/snack-bar.service';
import { OfferService } from '../../shared/services/offer.service';

@Component({
  selector: 'offer-breakdown',
  templateUrl: './offer-breakdown.component.html',
  styleUrls: ['./offer-breakdown.component.scss']
})
export class OfferBreakdownComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter <boolean>();
  @Output() updateCurrentSalary = new EventEmitter <boolean>();
  salaryBreakdown: any;
  totalSalary: number = 0;
  constructor(public offerService: OfferService, private snackBar: SnackBarService) { }
  ngOnDestroy(): void {
    this.offerService.count = 0;
  }

  ngOnInit(): void {
  }

  closeDrawer() {
    this.offerService.count = 0;
    this.close.emit(false);
  }

  salaryStructure($event: any) {
    this.salaryBreakdown = $event;
    this.calculateSalary();
  }

  updateSalary() {
    this.updateCandidateCurrentSalary();
  }

  calculateSalary() {
    this.totalSalary = 0;
    if(this.salaryBreakdown?.structure != undefined && this.salaryBreakdown?.structure.length > 0) {
      this.salaryBreakdown.structure.map( (record: any, i: number) => {
       this.calculateGrandTotalForOfferType(record,i);
      })
      this.totalSalary = this.grandTotal;
     }
  }

  grandTotal = 0;
  tempArrPositive: Array<number> = [];
  tempArrNegative: Array<number> = [];
  calculateGrandTotalForOfferType(component: any, i: number) {
    if(component.componenttype === 'Positive') {
      let compValue = Number(component.componentvalue);
      this.tempArrPositive[i] = compValue;
    } else if(component.componenttype === 'Negative') {
      let compValue = Number(component.componentvalue);
      this.tempArrNegative[i] = compValue;
    }
    let totalSumOfPositive = 0
    let totalSumOfNegative = 0;
    if(this.tempArrPositive.length > 0) {
      totalSumOfPositive = this.tempArrPositive.reduce((a, b) => a + b, 0)
    }
    if(this.tempArrNegative.length > 0) {
      totalSumOfNegative = this.tempArrNegative.reduce((a, b) => a + b, 0)
    }
    this.grandTotal = totalSumOfPositive - totalSumOfNegative;
  }

  updateCandidateCurrentSalary() {
    if(this.totalSalary == 0) {
      this.snackBar.open("Please check salary details")
    } else {
      const payload = {
        email : this.offerService.email,
        salary: this.totalSalary
      }
      this.offerService.updateCandidateSalary(payload).subscribe(res=>{
        if(res.error) {
          this.snackBar.open(res.message);
        } else {
          this.snackBar.open("Salary updated");
          this.updateCurrentSalary.emit(true);
          this.closeDrawer();
        }
      })
    }
  }
}
