import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { OfferService } from '../../shared/services/offer.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet'; 
import { OfferBreakdownComponent } from '../offer-breakdown/offer-breakdown.component';
import {ICandidateDetails} from '../../shared/interfaces/candidate-details'
import { SnackBarService } from '../../../utility/services/snack-bar.service';
import { LibraryService } from '../../../settings/offer/shared/services/library.service';
@Component({
  selector: 'app-candidate-info',
  templateUrl: './candidate-info.component.html',
  styleUrls: ['./candidate-info.component.scss']
})
export class CandidateInfoComponent implements OnInit, OnChanges {
  @Input() salaryBreakdown: any;
  @Input() changeInSalary: number = 0;
  scrWidth: any;
  candidateInfo: ICandidateDetails = {};
  salary_breakdown : any = []; 
  totalSalary = 0;
  hikePercentage = 0;

  oldJson: any;

constructor(
  public offerService: OfferService, 
  private matbottomsheet: MatBottomSheet,
  private snackBar: SnackBarService,
  private libraryService: LibraryService
  ) {
  this.getScreenSize();
}
  ngOnChanges(changes: SimpleChanges): void {
    this.calculateSalary();
    if(this.changeInSalary != 0) {
      this.jobOfferCandidateDetails();
    }
    this.changeInSalary = 0;
  }

  calculateSalary() {
    this.salary_breakdown = []
    this.totalSalary = 0;
    if(this.salaryBreakdown?.structure != undefined && this.salaryBreakdown?.structure.length > 0) {
      this.salaryBreakdown.structure.map( (record: any, i: number) => {
       this.salary_breakdown.push({
         title: record.fieldname,
         amount: record.componentvalue,
         type: record.componenttype
       })
       this.calculateGrandTotalForOfferType(record,i);
      })
      this.totalSalary = this.grandTotal;
      this.offerService.totalSalary = this.totalSalary;
      let currentSalary = Number(this.candidateInfo.currentsalary)
      this.hikePercentage = ((this.totalSalary - currentSalary)/currentSalary)*100;
      this.salary_breakdown.map((offer: any) => {
        return offer['percentage'] = Math.round((offer.amount * 100)/this.grandTotal);
      })
      this.offerService.salaryBreakdown = [this.salary_breakdown, this.salaryBreakdown];
     }
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
      this.scrWidth = window.innerWidth;
        if( this.scrWidth >= 600){
          this.matbottomsheet.dismiss();
        } else {
          this.salaryBreakdown = this.offerService.salaryDetailsForMobile;
          this.calculateSalary()
        }
  }
  ngOnInit(): void {
    this.oldJson = this.offerService.oldJson;
    this.jobOfferCandidateDetails();
  }

  openDetailsDrawer() {
    this.offerService.count = 1;
    this.offerService.setOfferBreakdownDrawer(true);
  }

  openPreviewDrawer() {
    this.matbottomsheet.dismiss();
    this.offerService.setOpenPreviewDrawer(true);
  }

  openSalaryBreakdown(){
    this.offerService.count = 1;
    this.matbottomsheet.open(OfferBreakdownComponent);
  }

  jobOfferCandidateDetails(){
    const param = {
      jobid: this.offerService.jobid,
      email: this.offerService.email
    }

    this.offerService.jobOfferCandidateDetails(param).subscribe((res)=>{
      if(res.error) {
        this.snackBar.open(res.message);
      } else {
        this.snackBar.open(res.message);
        this.candidateInfo = res.data;
        this.offerService.candidateInfo = this.candidateInfo;
        let currentSalary = Number(this.candidateInfo.currentsalary)
        this.hikePercentage = ((this.totalSalary - currentSalary)/currentSalary)*100;
      }
    })
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

  generateOfferDocument(json: any) { 
    if(JSON.stringify(json) === JSON.stringify(this.oldJson) && this.offerService.offerUrl.length > 2) {
      this.offerService.equalJSON = true;
    } else {
      this.offerService.equalJSON = false;
      this.offerService.oldJson = json;
      this.offerService.generateOfferDocument(json).subscribe(res=> {
        if(res.error) {
          this.snackBar.open(res.message);
        } else {
          this.snackBar.open(res.message);
          const document = {
            path: res.path,
            fileName: res.fileName,
            extension: 'DOC',
            jobid: this.offerService.jobid,
            email: this.offerService.email
          }
          this.libraryService.download(document.path, document.fileName).subscribe(res=>{
            if(res.error){}
            else {
              const payload = {
                jobid: document.jobid,
                email: document.email,
                docUrl: res.data.url
              }
              // this.offerService.generateDocToPdf(payload).subscribe(res=> {
              //   if(res.error) {} else {
              //     this.libraryService.download(res.data.path, res.data.fileName).subscribe(res=>{ 
              //       if(res.error) {} else {
              //         this.offerService.offerUrl = res.data.url;
              //       }
              //     })
              //   }
              // })
            }
          })
        }
      })      
    }
  }
}
 

