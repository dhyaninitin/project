import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { PromoCode } from '../../../../shared-ui/modal/promoCode.modal';
import * as moment from 'moment';
import { UsersService } from '../../../../shared-ui/service/users.service';
import { PromoCodeService } from '../../../../shared-ui/service/promoCode.service';
import { environment } from '../../../../../environments/environment';
import { GlobalService } from '../../../../shared-ui/service/global.service';

@Component({
  selector: 'app-promo-code',
  templateUrl: './promo-code.component.html',
  styleUrls: ['./promo-code.component.scss']
})
export class PromoCodeComponent implements OnInit {
  @ViewChild('deleteModal', {static: false}) public deleteModal: ModalDirective;
  @ViewChild('addEditModal', {static: false}) public addEditModal: ModalDirective;
  order: any = '';
  reverse: Boolean = false;
  itemsPerPage = 10;
  promoCodeList: any = [];
  usersList: any = [];
  selUsersList: any = [];
  promoCodeDetails: any = new PromoCode();
  selectedIndex: Number = -1;
  datePickerConfig2: any = {
    disableKeypress: true,
    min: moment(new Date()).add(1, 'd').format('MMM DD,YYYY'),
    format: 'MMM DD,YYYY'
  };
  dropdownSettings2: any = {};
  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  constructor(
    private userService: UsersService,
    private promoCodeService: PromoCodeService,
    private toastr: ToastrService,
    private globalService: GlobalService,
  ) {
    this.globalService.topscroll();
  }

  ngOnInit() {
    this.getPromoCodeList();
    this.getUsersList();
    this.dropdownSettings2 = {
      singleSelection: false,
      data: this.usersList,
      idField: '_id',
      textField: 'fullName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      itemsShowLimit: 1,
      closeDropDownOnSelection: false
    };
  }

  getUsersList() {
   const condition = {
                       status : 1,
                       profileVerificationStatus: environment.PROFILE_STATUS.VERIFIED,
                       userType: environment.USER_TYPE.PRACTICE
                      };
    this.userService.getUsers({condition}).subscribe( data => {
      if (data.status === 200) {
        const filterUserList = [];
        data.data.map( value => {
          filterUserList.push({
            _id       :    value._id,
            fullName  :    value.firstName + ' ' + value.lastName,
            email     :     value.email,
          });
        });
          this.usersList = filterUserList;
      } else {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    }, error => {
      this.toastr.error(
        'There are some server Please check connection.',
        'Error'
      );
    });
  }

  getPromoCodeList() {
    const condition = {};
     this.promoCodeService.getPromoCodeList(condition).subscribe( data => {
       if (data.status === 200) {
         this.promoCodeList = data.data;
       } else {
         this.toastr.error(
           'There are some server Please check connection.',
           'Error'
         );
       }
     }, error => {
       this.toastr.error(
         'There are some server Please check connection.',
         'Error'
       );
     });
   }

  showModal(promoCodeDetails, modalName, index) {
    this.promoCodeDetails = promoCodeDetails;
    this.selectedIndex = index;
    this[modalName].show();
  }

  addPromoCode() {
    this.promoCodeDetails.sendUserIds = [];
    this.promoCodeDetails['userDetails'] = [];
    this.promoCodeDetails['emailList'] = [];
    this.selUsersList.map(value => {
      this.promoCodeDetails.sendUserIds.push(value._id);

      this.usersList.map( user => {
         if (user._id === value._id) {
          this.promoCodeDetails['userDetails'].push(user);
          this.promoCodeDetails['emailList'].push(user.email);
         }
      });

    });
    let promoCodeDetails = JSON.parse(JSON.stringify(this.promoCodeDetails));
    if(promoCodeDetails.expireDate){
      promoCodeDetails.expireDate = moment(promoCodeDetails.expireDate).toISOString();
    }
    this.promoCodeService.addPromocode(promoCodeDetails).subscribe( data => {
      if (data.status === 200) {
        this.promoCodeList.push(data.data);
        this.closeModal();
        this.promoCodeDetails = new PromoCode();
        this.selUsersList = [];
        this.toastr.success(
          'Promo code sent successfully.',
          'Success'
        );
      } else {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    }, error => {
      this.toastr.error(
        'There are some server Please check connection.',
        'Error'
      );
    });
    console.log(this.promoCodeDetails, this.selUsersList);
  }

  deletePromoCode() {
    this.promoCodeService.deletePromoCode({_id: this.promoCodeDetails._id}).subscribe( data => {
      if (data.status === 200) {
        this.closeModal();
        this.promoCodeDetails = new PromoCode();
        if (this.selectedIndex > -1) {
          this.promoCodeList.splice(this.selectedIndex, 1);
          this.selectedIndex = -1;
        }
        this.toastr.success(
          'Promo code deleted successfully.',
          'Success'
        );
      } else {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    }, error => {
      this.toastr.error(
        'There are some server Please check connection.',
        'Error'
      );
    });
  }

  isDisabled(){
    if(this.promoCodeDetails.percentage &&
       this.promoCodeDetails.expireDate &&
       this.selUsersList.length &&
       this.promoCodeDetails.title) {
        return false;
       } else {
         return true;
       }
  }
  closeModal() {
    this.deleteModal.hide();
    this.addEditModal.hide();
  }
}
