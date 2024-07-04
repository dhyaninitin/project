import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { PositionType } from '../../../../shared-ui/modal/positionType.modal';
import { PositionTypeService } from '../../../../shared-ui/service/positionType.service';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { AlertService } from '../../../../shared-ui/alert/alert.service';
import { AlertConfirmService } from '../../../../shared-ui/service/alertConfirm.service';
import { environment } from '../../../../../environments/environment';
import { AlertConfirm } from '../../../../shared-ui/component/alert-confirm/alert-confirm.modal';

@Component({
  selector: 'app-position-type',
  templateUrl: './position-type.component.html',
  styleUrls: ['./position-type.component.scss']
})
export class PositionTypeComponent implements OnInit {
  page: string = 'Position Type';
  /* access: any = {
    view: true,
    add: true,
    edit: true,
    delete: true
  } */
  // @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('addEditModal', { static: false }) public addEditModal: ModalDirective;
  positionTypeList: PositionType[] = [];
  selectedPositionType: PositionType = new PositionType();
  isInvalid = {
    isNameExist : false,
    isAmountZero : false,
  };
  isSelectedIndex = -1;
  // isAmountZero: Boolean = false;
  // validCheckAlreadyExitStaff: boolean = true;
  setDataFilter: any;
  order: string = 'practiceType';
  reverse: boolean = false;
  sortedCollection: any[];
  itemsPerPage = 10;
  // practiceTypeList: any = [];

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private positionTypeService: PositionTypeService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private alertService: AlertService,
    private alertConfirmService: AlertConfirmService,
  ) {
   /*  var access = this.jwtService.getAccess(this.page);
    if (access.length){
      access[0].level.map( (action) => {
        this.access[action.label] = action[action.label];
      })
    } */
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getPositionTypeList();
  }


  getPositionTypeList() {
    this.spinner.show();
    this.positionTypeService.getPositionType({}).subscribe(
      data => {
        if (data.status === 200) {
          this.positionTypeList = data.data;
        }
        this.spinner.hide();
      },
      error => {
        this.globalService.error();
      }
    );
  }

  showaddEditModal(positionType) {
    this.isSelectedIndex = this.positionTypeList.indexOf(positionType);
    if (positionType) {
      this.selectedPositionType = positionType;
    } else {
      this.selectedPositionType = new PositionType();
    }
    this.addEditModal.show();
  }


  showDeleteModal( positionType) {
    const alertDetails: AlertConfirm = {
                          title: 'Delete Position Type',
                          message: { show: true , message: 'Are you sure you delete position type?'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: true, name: 'Delete'},
                        };
    this.alertConfirmService.openPopup(alertDetails).subscribe( data => {
      if (data) {
        this.isSelectedIndex = this.positionTypeList.indexOf(positionType);
        this.selectedPositionType = positionType;
        this.deletePositionType();
      }
    });
  }

  checkPositionTypeExist() {
     let name = JSON.parse(JSON.stringify(this.selectedPositionType.name));
         name = name.toLowerCase().trim();
      const self = this;
   const found = this.positionTypeList.filter(type => {
     if (self.isSelectedIndex > -1) {
      return  type.name.toLowerCase() === name && (self.isSelectedIndex > -1 && self.selectedPositionType._id !== type._id);
     } else {
      return  type.name.toLowerCase() === name;
     }
    });

    if (found.length) {
      this.isInvalid.isNameExist =  true;
    } else {
      this.isInvalid.isNameExist = false;
    }
  }

  checkComissionAmount() {
    this.isInvalid.isAmountZero = (this.selectedPositionType.amount > 0) ? false : true;
  }

  savePositionTypeData() {
    /* ----------------------------------- Validation ----------------------------------------- */
    if ((!this.selectedPositionType.amount || this.isInvalid.isAmountZero) ||
       (!this.selectedPositionType.name || this.isInvalid.isNameExist) ) {
      this.alertService.clear();
        this.alertService.error(' Please fill valid details! ');
        setTimeout(() => {
          this.alertService.clear();
        }, 5000);
        return false;
    }
    /* ---------------------------------------------------------------------------------------- */
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    const intRegex = /^\d+$/;
    const floatRegex = /^((\d+(\.\d *)?)|((\d*\.)?\d+))$/;
    if (!intRegex.test(this.selectedPositionType.amount) || !floatRegex.test(this.selectedPositionType.amount)) {
      this.selectedPositionType.amount = Number(this.selectedPositionType.amount.replace(new RegExp(',', 'g'), ''));
    }
    this.positionTypeService.savePositionType(this.selectedPositionType).subscribe(
      data => {
        this.spinner.hide();
        this.addEditModal.hide();
        if (data.status === 200) {
          if (this.selectedPositionType._id) {
            if (this.isSelectedIndex > -1) {
              this.toastr.success('Position type updated successfully.', 'Success');
              this.positionTypeList[this.isSelectedIndex] = data.data;
              this.isSelectedIndex = -1;
            }
          } else {
            this.toastr.success('Position type saved successfully.', 'Success');
            this.positionTypeList.unshift(data.data);
          }
        }
        this.selectedPositionType = new PositionType();
      },
      error => {
        this.addEditModal.hide();
        this.globalService.error();
      }
    );
  }

  deletePositionType() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.selectedPositionType.status = environment.STATUS.DELETE;
    // this.positionTypeService.deletePositionType({ _id: this.selectedPositionType._id }).subscribe(
      this.positionTypeService.savePositionType(this.selectedPositionType).subscribe(
        data => {
          this.spinner.hide();
          // this.deleteModal.hide();
          if (data.status === 200) {
            if (this.isSelectedIndex > -1) {
              this.toastr.success('Position type updated successfully.', 'Success');
              this.positionTypeList.splice(this.isSelectedIndex, 1);
              this.isSelectedIndex = -1;
            }
            this.selectedPositionType = new PositionType();
          } else {
            // this.deleteModal.hide();
            this.globalService.error();
          }
        },
        error => {
          // this.deleteModal.hide();
          this.globalService.error();
        }
      );
  }

  closeModel() {
    this.addEditModal.hide();
    // this.deleteModal.hide();
    this.isSelectedIndex = -1;
    this.selectedPositionType = new PositionType();
  }

}
