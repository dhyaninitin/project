import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertService } from '../../../../shared-ui/alert/alert.service';
import { DisputeService } from '../../../../shared-ui/service/disputes.service';
import { FirebaseService } from '../../../../shared-ui/service/firebase.service';
import { currentUser } from '../../../../layouts/home-layout/user.model';

@Component({
  selector: 'app-disputes',
  templateUrl: './disputes.component.html',
  styleUrls: ['./disputes.component.scss']
})
export class DisputesComponent implements OnInit {
  @ViewChild('changeUserStatus', { static: false }) changeUserStatus: ModalDirective;
  order: String = 'disputedOn';
  reverse: Boolean = false;
  itemsPerPage = 10;
  disputeStatus = environment.DISPUTE_STATUS;
  jobLabel: any = environment.JOB_LABEL;
  disputeList: any = [];
  disputeDetail: any = {};
  disputeDetailIndex: any = -1;
  currentUser: currentUser = new currentUser;
  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private disputeService: DisputeService,
    private firebaseService: FirebaseService,
    private alertService: AlertService
  ) {
  }

  ngOnInit() {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    this.globalService.topscroll();
   // console.log(this.disputeStatus);
    this.getDisputes();
  }

  getDisputes() {
      this.disputeService.getDisputes({}).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.disputeList = data.data;
            this.getAllNotifications();
          } else {
            this.spinner.hide();
            this.toastr.warning('No Disputes Found.', 'Warning');
          }
        } else {
          this.spinner.hide();
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }



  updateDisputeStatus() {
    this.spinner.show();
    // this.disputeDetail.contractId = this.contractDetail._id;
    // this.disputeDetail.disputeUserId = this.contractDetail.jobPostId.createdBy._id;
    // this.disputeDetail.status = environment.DISPUTE_STATUS.NEW;
    this.disputeService.addDispute(this.disputeDetail).subscribe( data => {
      if ( this.disputeDetailIndex > -1) {
        this.disputeList[this.disputeDetailIndex] = this.disputeDetail;
      }
      this.changeUserStatus.hide();
      this.spinner.hide();
      if (data.status === 200) {
        this.toastr.success(
          'Status Updated Successfully',
          'Success'
        );
      } else {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
     }
    }, error => {
      this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
    });
  }

  showModal(dispute , index){
    this.disputeDetail = JSON.parse(JSON.stringify(dispute));
    this.disputeDetailIndex = index;
    this.changeUserStatus.show();
  }

  getAllNotifications() {
    const self = this;
    const notifications = this.firebaseService.getAllNotification();
    notifications.on('value', function(snapshot) {
       const values = snapshot.val();
       if (values) {
         let convertObjToArray = Object.entries(values);
         convertObjToArray.forEach((value) => {
             // -----  Count Unread Notification -------------------------------
             if (environment.notificationStatus.UNREAD === value[1]['status']
             && value[1][self.currentUser.userType]['disputes']) {
               const index = self.disputeList.findIndex( dispute => {
                  return (dispute.contractId.jobPostId && dispute.contractId.jobPostId._id === value[1]['jobId']);
                });
                console.log(index);
                if(index > -1) {
                  self.disputeList[index]['newDispute'] = true;
                  self.getAndUpdateJobNotification();
                }
             }
          })
            /* ------------------------------------------------------------ */
       }
     });
   }

   getAndUpdateJobNotification() {
    const self = this;
    setTimeout(function() {
         const status =  environment.notificationStatus.UNREAD;
         self.firebaseService.getAndUpdateAdminNotification(status,'adminDisputes');
         self.disputeList = self.disputeList.map( dispute => {
            if(dispute['newDispute']){
              delete dispute['newDispute'];
              return dispute;
            } else {
             return dispute;
            }
         });
    }, 5000);

  }
  // closeModal() {
  //   this.changeUserStatus.hide();
  // }
}
