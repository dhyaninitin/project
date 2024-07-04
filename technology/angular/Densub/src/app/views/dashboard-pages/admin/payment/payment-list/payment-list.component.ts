import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { PaymentService } from '../../../../../shared-ui/service/payment.service';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { currentUser } from '../../../../../layouts/home-layout/user.model';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit {

  order: String = 'createdAt';
  reverse: Boolean = true;
  itemsPerPage = 10;
  paymentList: any = [];
  userType = environment.USER_TYPE;
  currentUser: currentUser = new currentUser;
  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  constructor(
    private globalService: GlobalService,
    private toastr: ToastrService,
    private paymentService: PaymentService,
    private spinner: NgxSpinnerService,
    private firebaseService: FirebaseService,
    private jwtService: JwtService
  ) {
  }
  
  ngOnInit() {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    this.globalService.topscroll();
    this.getpaymentList();
  }

  getpaymentList() {
    const condition = {
      actionStatus : {'$in' : [environment.PAYMENT_STATUS_TYPE.CONTRACT, environment.PAYMENT_STATUS_TYPE.POSTJOB]}
    };
    this.paymentService.getPaymentList({condition}).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.paymentList = data.data;
            this.getAllNotifications();
          } else {
            this.spinner.hide();
            // this.toastr.warning('No Disputes Found.', 'Warning');
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
             && value[1][self.currentUser.userType]['payment']
             ) {
               const index = self.paymentList.findIndex( payment => {
                  return (payment.jobPostId && payment.jobPostId._id === value[1]['jobId']);
                });
                console.log(index);
                if(index > -1) {
                  self.paymentList[index]['newPayment'] = true;
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
          self.firebaseService.getAndUpdateAdminNotification(status,'adminPayment');
          self.paymentList = self.paymentList.map( payment => {
             if(payment['newPayment']){
               delete payment['newPayment'];
               return payment;
             } else {
              return payment;
             }
          });
     }, 5000);

   }
}
