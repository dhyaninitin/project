import { Component, ElementRef, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { OfferService } from './shared/services/offer.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet'; 
import { CandidateInfoComponent } from './components/candidate-info/candidate-info.component';
import {IJobOfferDetails} from './shared/interfaces/offer-details';
import { getUserDeatils } from '../utility/store/selectors/user.selector';
import { State } from '../utility/store/reducers';
import { SnackBarService } from '../utility/services/snack-bar.service';
 
@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss']
})
export class OfferComponent implements OnInit, OnDestroy {
  @ViewChild('offerBreakdownDrawer', { static: true }) public offerBreakdownDrawer!: MatDrawer;
  @ViewChild('previewDrawer', { static: true }) public previewDrawer!: MatDrawer;

  scrHeight:any;
  scrWidth:any;
  
  url: any;
  stepperPages: string[] = ['General info','Salary Structure','Approvals','OfferSendOut'];
  showMobileStepper = false;
  jobOfferInfo: IJobOfferDetails = {};
  userInfo: any = [];
  generaInfoDetails: any;
  salaryBreakdown: any;
  salaryUpdated: number = 0;

  constructor(
    private store: Store<State>, 
    public offerService: OfferService,  
    private matbottomsheet: MatBottomSheet,
    private snackBar: SnackBarService
    ) {}
  
  ngOnDestroy(): void {
   this.offerService.setOpenPreviewDrawer(false);
   this.offerService.setOfferBreakdownDrawer(false);
   this.offerService.generalInfoForm.next({});
   this.offerService.salaryStructureTemplate.next({});
   this.offerService.previewDrawer.next(false);
   this.offerService.offerBreakdownDrawer.next(false);
   this.offerService.salaryStructureCreated = false;
   this.offerService.offerJSON = [];
   this.offerService.equalJSON = false;
   this.offerService.oldJson = [];
   this.offerService.salaryDetailsForMobile = [];   
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
      this.scrWidth = window.innerWidth;
        if( this.scrWidth <= 600){
          this.showMobileStepper = true;
          this.offerBreakdownDrawer.close();
          this.previewDrawer.close();
        } else {
          this.showMobileStepper = false;
        }
  }

  ngOnInit(){
    this.loadUser();
    this.getScreenSize();
    this.jobDetailsForOfferById();
    this.offerService.step = 0;
    this.openPreviewDrawer();
    this.openOfferBreakdownDrawer();
    this.getOfferInfo(this.offerService.jobid, this.offerService.email);
  }

  
  loadUser() {
    this.store.select(getUserDeatils).subscribe(user => {
      this.url = user.profileimagepath;
      this.userInfo = user;
    });
  }

  openOfferBreakdownDrawer() {
    this.offerService.offerBreakdownDrawer.subscribe(res => {
      if(res)
      this.offerBreakdownDrawer.toggle();
    })
  }

  openPreviewDrawer()  {
    this.offerService.previewDrawer.subscribe(res => {
      if(res)
      this.previewDrawer.toggle();
    })
  }

  openOfferBreakdownBootomSheet(){
    this.matbottomsheet.open(CandidateInfoComponent);
  }

  jobDetailsForOfferById(){
    const param = {
      jobid: this.offerService.jobid
    }
    this.offerService.jobDetailsForOfferById(param).subscribe((res:any)=>{
      if(res.error) {
        this.snackBar.open(res.message);
      } else {
        this.snackBar.open(res.message);
        this.jobOfferInfo = res.data;
      }
    });
  }

  getOfferInfo(jobid: number, email: string) {
    const param = {
      jobid: jobid,
      email: email
    }
    this.offerService.getJobOfferDetails(param).subscribe(res=> {
      if(res.error) {
        this.snackBar.open(res.message);
      } else {
        this.snackBar.open(res.message);
        this.offerService.generalInfoForm.next(res.data.generalinfo);
        this.offerService.salaryStructureTemplate.next(res.data.salarystructure);
      }
    })
  }
  
  salaryStructure($event: any) {
      this.salaryBreakdown = $event;
      this.offerService.salaryDetailsForMobile = this.salaryBreakdown;
  }

  updateCurrentSalary($event: any) {
    this.salaryUpdated += 1;
  }

  reset() {
    this.offerService.count = 0;
    this.offerBreakdownDrawer.close();
  }
}


