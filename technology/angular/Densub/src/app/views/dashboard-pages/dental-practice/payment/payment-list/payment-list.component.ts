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
    private jwtService: JwtService,

  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getpaymentList();
  }

  getpaymentList() {
    const condition = {
     // receiverUserId : this.currentUser._id,
     // actionStatus   : environment.PAYMENT_STATUS_TYPE.WORKDIARY
     payerUserId : this.currentUser._id,
      // actionStatus : {'$in' : [environment.PAYMENT_STATUS_TYPE.CONTRACT, environment.PAYMENT_STATUS_TYPE.POSTJOB]}
    };
    this.paymentService.getPaymentList({condition}).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.paymentList = data.data;
            this.paymentList = this.paymentList.map(payment => {
                if(payment.actionStatus === environment.PAYMENT_STATUS_TYPE.POSTJOB){
                  payment['actionStatus_New'] = 'Post Job';
                  payment['paidTo'] = 'Densub';
                } else if(payment.actionStatus === environment.PAYMENT_STATUS_TYPE.CONTRACT){
                  payment['actionStatus_New'] = 'Densub';
                  payment['paidTo'] = 'Densub';
                } else if(payment.actionStatus === environment.PAYMENT_STATUS_TYPE.WORKDIARY){
                  payment['actionStatus_New'] = payment['actionStatus'];
                  payment['paidTo'] = (!payment.receiverUserId) ? '' :
                    (payment.receiverUserId.firstName + ' ' + payment.receiverUserId.lastName);
                }

                return payment;
            });
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
}
