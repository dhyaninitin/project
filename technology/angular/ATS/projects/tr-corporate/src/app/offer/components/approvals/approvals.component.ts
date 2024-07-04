import { Component, OnInit } from '@angular/core';
import { SnackBarService } from '../../../utility/services/snack-bar.service';
import { OfferService } from '../../shared/services/offer.service';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss']
})
export class ApprovalsComponent implements OnInit {

  constructor(private offerService: OfferService, private snackBar: SnackBarService) { }

  ngOnInit(): void {
  }

  
  next(){
    const payload = {
      jobid: this.offerService.jobid,
      candidateEmail: this.offerService.email,
      status: 1,
      approvals : {
        email: ['test@gmail.com', 'test1@gmail.com'],
        info: ['Test Description']
      }
    }
    this.offerService.updateApprovals(payload).subscribe(res=> {
      if(res.error) {
        this.snackBar.open(res.message)
      } else {
        this.snackBar.open(res.message);
        this.offerService.step += 1;
      }
    })
  }

  previous() {
    this.offerService.step -= 1;
  }

}
