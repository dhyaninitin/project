import { Component, OnInit } from '@angular/core';
import { LicenseType } from './license-type.modal';
// import { ModalDirective } from 'ngx-bootstrap';
import { AlertConfirm } from '../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { LicenseTypeService } from './license-type.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertConfirmService } from '../../../../shared-ui/service/alertConfirm.service';
import { environment } from '../../../../../environments/environment';
import { PositionType } from '../../../../shared-ui/modal/positionType.modal';
import { PositionTypeService } from '../../../../shared-ui/service/positionType.service';

@Component({
  selector: 'app-license-type',
  templateUrl: './license-type.component.html',
  styleUrls: ['./license-type.component.scss']
})
export class LicenseTypeComponent implements OnInit {

  // @ViewChild('addEditModal', { static: false })  public addEditModal: ModalDirective;

  licenseTypeList: LicenseType[] = [];
  p: any;
  reverse: Boolean = false;
  setDataFilter: any;
  order = 'licenseType';
  itemsPerPage = 10;
  validCheckAlreadyExitPracticeType: Boolean = true;
  currentLicenseType: LicenseType = new LicenseType();
  currentIndex: any = -1;
  alertDetails: AlertConfirm = new AlertConfirm();
  positionTypeList: PositionType[] = [];
  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private licenseTypeService: LicenseTypeService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private alertConfirmService: AlertConfirmService,
    private positionTypeService: PositionTypeService,
  ) {
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getLicenseTypeList();
    this.getPositionTypeList();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  getLicenseTypeList() {
    this.spinner.show();
    this.licenseTypeService.getLicenseTypeList({}).subscribe( data => {
      if (data.status === 200) {
        this.licenseTypeList = data.data;
        const licenseTypeKeys = Object.keys(new LicenseType());
        licenseTypeKeys.map( key => {
          if ( !Object.keys(this.licenseTypeList).includes(key) ) {
          this.licenseTypeList[key] = (new LicenseType())[key];
          }
        });
        this.spinner.hide();
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }

  getPositionTypeList() {
    this.spinner.show();
    this.positionTypeService.getPositionType({}).subscribe(
      data => {
        if (data.status === 200) {
          this.positionTypeList = data.data;
          console.log(this.positionTypeList);
        }
        this.spinner.hide();
      },
      error => {
        this.globalService.error();
      }
    );
  }

  showSaveModal(licenseType: LicenseType = new LicenseType()) {
    this.alertDetails = {
      title: (!licenseType._id) ? 'Add License Type' : 'Update License Type',
      message: { show: false },
      cancelButton : { show: true, name: 'Close'},
      confirmButton: {
                        show: true,
                        name: (!licenseType._id) ? 'Save' : 'Update'
                      },

      inputText: {
        show : true,
        label : 'License Type',
        placeholder : ' Please enter license type',
        name : 'licenseType',
        characterOnly: true,
      },
      currentSelection : { ...licenseType },
      matchArray : this.licenseTypeList,
      errorMsg: 'Already exist',

      selectInput: {
        show : true,
        label : 'Position Type',
        placeholder : ' Please select position type',
        name : 'positionType',
        list: this.positionTypeList,
        dropdownSettings: {
          selectSingle: true,
          idField: '_id',
          textField: 'name',
        }
      }
    };

    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
      if (data) {
        this.currentLicenseType = {...this.alertDetails.currentSelection };
        this.currentIndex = this.licenseTypeList.indexOf(licenseType);
        this.saveLicenseTypeData();
      }
    });

  }
  getPositionType(positionType) {
    if( !positionType ) {
      return '';
    }
    const selectedType =  this.positionTypeList.filter( type => type._id.toString() === positionType.toString());
    return selectedType[0].name;
  }

  showDeleteModal( licenseType) {
    this.alertDetails = {
                          title: 'Delete License Type',
                          message: { show: true , message: 'Are you sure you want to delete license type ?'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: true, name: 'Delete'},
                        };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
      if (data) {
        this.currentLicenseType = licenseType;
        this.currentIndex = this.licenseTypeList.indexOf(licenseType);
        this.deleteLicenseType();
      }
    });
  }


  deleteLicenseType() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.currentLicenseType.status = environment.STATUS.DELETE;
    // this.experienceService.deleteExperience({ _id: this.currentLicenseType._id }).subscribe( data => {
    this.licenseTypeService.saveLicenseType(this.currentLicenseType).subscribe( data => {
          this.spinner.hide();
          this.currentLicenseType = new LicenseType();
          if (data.status === 200) {
            if (this.currentIndex > -1 ) {
              this.licenseTypeList.splice( this.currentIndex , 1);
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

  saveLicenseTypeData() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    this.licenseTypeService.saveLicenseType(this.currentLicenseType).subscribe( data => {
      this.spinner.hide();
      this.currentLicenseType = new LicenseType();
      if (data.status === 200 ) {
        if (this.currentIndex > -1 ) {
          this.licenseTypeList[this.currentIndex] = data.data;
          this.currentIndex = -1;
          this.toastr.success('Data updated successfully.', 'Success');
        } else {
          this.licenseTypeList.push(data.data);
          this.toastr.success('Data saved successfully.', 'Success');
        }
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }
}
