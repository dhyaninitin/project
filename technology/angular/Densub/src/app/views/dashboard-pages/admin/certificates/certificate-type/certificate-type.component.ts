import { Component, OnInit } from '@angular/core';
import { CertificateType } from './certificate-type.modal';
import { AlertConfirm } from '../../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { CertificateTypeService } from './certificate-type.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertConfirmService } from '../../../../../shared-ui/service/alertConfirm.service';
import { environment } from '../../../../../../environments/environment';
import { CertificateService } from '../certificates/certificates.service';

@Component({
  selector: 'app-certificate-type',
  templateUrl: './certificate-type.component.html',
  styleUrls: ['./certificate-type.component.scss']
})
export class CertificateTypeComponent implements OnInit {


  certificateTypeList: CertificateType[] = [];
  p: any;
  reverse: Boolean = false;
  setDataFilter: any;
  order = 'certificateType';
  itemsPerPage = 10;
  currentCertificateType: CertificateType = new CertificateType();
  currentIndex: any = -1;
  alertDetails: AlertConfirm = new AlertConfirm();

  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private certificateTypeService: CertificateTypeService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private alertConfirmService: AlertConfirmService,
    private certificateService: CertificateService,
  ) {
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getCertificateTypeList();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  getCertificateTypeList() {
    this.spinner.show();
    this.certificateTypeService.getCertificateTypeList({}).subscribe( data => {
      if (data.status === 200) {
        this.certificateTypeList = data.data;
      }
      this.spinner.hide();
    }, error => {
      this.globalService.error();
    });
  }

  showSaveModal(certificateType: CertificateType = new CertificateType() ) {
    this.alertDetails = {
      title: (!certificateType._id) ? 'Add Certificate Type' : 'Update Certificate Type',
      message: { show: false },
      cancelButton : { show: true, name: 'Close'},
      confirmButton: {
                        show: true,
                        name: (!certificateType._id) ? 'Save' : 'Update'
                      },

      inputText: {
        show : true,
        label : 'Certificate Type',
        characterOnly: true,
        placeholder : ' Please enter certificate type',
        name : 'certificateType'
      },
      currentSelection : { ...certificateType },
      matchArray : this.certificateTypeList,
      errorMsg: 'Already exist'
    };

    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
      if (data) {
        this.currentCertificateType = {...this.alertDetails.currentSelection };
        this.currentIndex = this.certificateTypeList.indexOf(certificateType);
        this.saveCertificateTypeData();
      }
    });

  }

  showDeleteModal( certificateType) {
    this.alertDetails = {
                          title: 'Delete Certificate Type',
                          message: { show: true , message: 'Are you sure you want to delete certificate type ?'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: true, name: 'Delete'},
                        };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
      if (data) {
        this.currentCertificateType = certificateType;
        this.currentIndex = this.certificateTypeList.indexOf(certificateType);
        this.deleteCertificateType();
      }
    });
  }


  deleteCertificateType() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.currentCertificateType.status = environment.STATUS.DELETE;
    // this.experienceService.deleteExperience({ _id: this.currentCertificateType._id }).subscribe( data => {
    this.certificateTypeService.saveCertificateType(this.currentCertificateType).subscribe( data => {
          if (data.status === 200) {
            this.deleteCertificate();
            /* this.currentCertificateType = new CertificateType();
            if (this.currentIndex > -1 ) {
              this.certificateTypeList.splice( this.currentIndex , 1);
              this.currentIndex = -1;
            }
            this.toastr.success('Record deleted successfully.', 'Success'); */
          } else {
            this.currentCertificateType = new CertificateType();
            this.globalService.error();
          }
        },
        error => {
          this.globalService.error();
        }
      );
  }

  saveCertificateTypeData() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    this.certificateTypeService.saveCertificateType(this.currentCertificateType).subscribe( data => {
      this.spinner.hide();
      this.currentCertificateType = new CertificateType();
      if (data.status === 200 ) {
        if (this.currentIndex > -1 ) {
          this.certificateTypeList[this.currentIndex] = data.data;
          this.currentIndex = -1;
          this.toastr.success('Data updated successfully.', 'Success');
        } else {
          this.certificateTypeList.push(data.data);
          this.toastr.success('Data saved successfully.', 'Success');
        }
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }

  deleteCertificate() {
    const condition = {
      certificateType: this.currentCertificateType._id
    };
    const updateData = { status : environment.STATUS.DELETE };
    // this.certificateService.deleteCertificate({ _id: this.currentCertificate._id }).subscribe(
      this.certificateService.updateManyCertificate({condition, updateData}).subscribe(
        data => {
          if (data.status === 200) {
            this.spinner.hide();
            this.currentCertificateType = new CertificateType();
            if (this.currentIndex > -1 ) {
              this.certificateTypeList.splice( this.currentIndex , 1);
              this.currentIndex = -1;
            }
            this.toastr.success('Record deleted successfully.', 'Success');
          } else {
            this.globalService.error();
          }
        },
        error => {
          this.globalService.error();
        }
      );
  }
}
