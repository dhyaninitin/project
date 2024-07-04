import { Component, OnInit } from '@angular/core';
import { Certificate } from './certificates.modal';
import { CertificateType } from '../certificate-type/certificate-type.modal';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { CertificateService } from './certificates.service';
import { CertificateTypeService } from '../certificate-type/certificate-type.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertConfirmService } from '../../../../../shared-ui/service/alertConfirm.service';
import { AlertConfirm } from '../../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent implements OnInit {

  certificateList: any = [];
  currentCertificate: Certificate = new Certificate();
  currentIndex: any = -1;
  setDataFilter: any;
  order = 'certificate';
  reverse = false;
  itemsPerPage = 10;
  certificateTypeList: CertificateType[] = [];
  p: any;
  // validCheckAlreadyExitCertificate: boolean = true;
  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private certificateService: CertificateService,
    private certificateTypeService: CertificateTypeService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private alertConfirmService: AlertConfirmService,
  ) {
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getCertificateTypeList();
    this.getCertificateList();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  getCertificateTypeList() {
    this.spinner.show();
    this.certificateTypeService.getCertificateTypeList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.certificateTypeList = data.data;
          this.spinner.hide();
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  getCertificateList() {
    this.spinner.show();
    this.certificateService.getCertificateList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.certificateList = data.data;
        } else {
          this.globalService.error();
        }
        this.spinner.hide();
      },
      error => {
        this.globalService.error();
      }
    );
  }

  showSaveModal(certificate: Certificate = new Certificate() ) {
    const alertDetails: AlertConfirm = {
      title: (!certificate._id) ? 'Add Certificate' : 'Update Certificate',
      message: { show: false },
      cancelButton : { show: true, name: 'Close'},
      confirmButton: {
                        show: true,
                        name: (!certificate._id) ? 'Save' : 'Update'
                      },

      inputText: {
        show : true,
        label : 'Certificate',
        placeholder : ' Please enter certificate',
        name : 'certificate',
        characterOnly: true,
      },
      currentSelection : { ...certificate },
      matchArray : this.certificateList,
      errorMsg: 'Already exist',

      selectInput: {
        show : true,
        label : 'Certificate Type',
        placeholder : ' Please select type',
        name : 'certificateType',
        list: this.certificateTypeList,
        dropdownSettings: {
          selectSingle: true,
          idField: '_id',
          textField: 'certificateType',
        }
      }
    };
    this.alertConfirmService.openPopup(alertDetails).subscribe( data => {
      if (data) {
        this.currentCertificate = {...alertDetails.currentSelection };
        this.currentIndex = this.certificateList.indexOf(certificate);
        this.saveCertificateData();
      }
    });

  }

  showDeleteModal( certificate) {
    const alertDetails: AlertConfirm = {
                          title: 'Delete Certificate',
                          message: { show: true , message: 'Are you sure you delete Certificate ?'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: true, name: 'Delete'},
                        };
    this.alertConfirmService.openPopup(alertDetails).subscribe( data => {
      if (data) {
        this.currentCertificate = certificate;
        this.currentIndex = this.certificateList.indexOf(certificate);
        this.deleteCertificate();
      }
    });
  }

  deleteCertificate() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.currentCertificate.status = environment.STATUS.DELETE;
    // this.certificateService.deleteCertificate({ _id: this.currentCertificate._id }).subscribe(
      this.certificateService.saveCertificate(this.currentCertificate).subscribe(
        data => {
          this.spinner.hide();
          this.currentCertificate = new Certificate();
          if (data.status === 200) {
            if (this.currentIndex > -1 ) {
              this.certificateList.splice( this.currentIndex , 1);
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

  saveCertificateData() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    this.certificateService.saveCertificate(this.currentCertificate).subscribe(
      data => {
        this.spinner.hide();
      if (data.status === 200 ) {
        if (this.currentIndex > -1 ) {
          this.certificateList[this.currentIndex] = this.currentCertificate;
          this.currentIndex = -1;
          this.toastr.success('Data updated successfully.', 'Success');
        } else {
          this.certificateList.push(data.data);
          this.toastr.success('Data saved successfully.', 'Success');
        }
      } else {
        this.globalService.error();
      }
      this.currentCertificate = new Certificate();
    }, error => {
      this.globalService.error();
    });
  }

  findCertificateType(certificateTypeId, i) {
    const found = this.certificateTypeList.findIndex( value => value._id === certificateTypeId);
    if ( found > -1) {
      this.certificateList[i]['certificateTypeStr'] = this.certificateTypeList[found].certificateType;
      return this.certificateTypeList[found].certificateType;
    }
  }


}
