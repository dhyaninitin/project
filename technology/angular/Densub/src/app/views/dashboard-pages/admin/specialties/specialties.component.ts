import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Specialty } from './specialties.modal';
import { AlertConfirm } from '../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { SpecialtyService } from './specialties.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertConfirmService } from '../../../../shared-ui/service/alertConfirm.service';
import { PositionType } from '../../../../shared-ui/modal/positionType.modal';
import { environment } from '../../../../../environments/environment';
import { PositionTypeService } from '../../../../shared-ui/service/positionType.service';

@Component({
  selector: 'app-specialties',
  templateUrl: './specialties.component.html',
  styleUrls: ['./specialties.component.scss']
})
export class SpecialtiesComponent implements OnInit {

  specialtiesList: Specialty[] = [];
  p: number = 1;
  reverse: Boolean = false;
  setDataFilter: any;
  order = '';
  itemsPerPage = 10;
  currentSpecialty: Specialty = new Specialty();
  currentIndex: any = -1;
  alertDetails: AlertConfirm = new AlertConfirm();
  positionTypeList: PositionType[] = [];

  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private specialtyService: SpecialtyService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private alertConfirmService: AlertConfirmService,
    private positionTypeService: PositionTypeService,
  ) {
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getPositionType();
    this.getSpecialtyList();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  getPositionType() {
    this.spinner.show();
    this.positionTypeService.getPositionType({}).subscribe(
      data => {
        if (data.status === 200) {
          this.positionTypeList = data.data;
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

  getSpecialtyList() {
    this.spinner.show();
    this.specialtyService.getSpecialtyList({}).subscribe( data => {
      if (data.status === 200) {
        this.spinner.hide();
        this.specialtiesList = data.data;
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }

  showSaveModal(specialty: Specialty = new Specialty()) {
   const alertDetails: AlertConfirm = {
      title: (!specialty._id) ? 'Add Specialty' : 'Update Specialty',
      message: { show: false },
      cancelButton : { show: true, name: 'Close'},
      confirmButton: {
                        show: true,
                        name: (!specialty._id) ? 'Save' : 'Update'
                      },

      inputText: {
        show : true,
        label : 'Specialty',
        placeholder : ' Please enter specialty',
        name : 'specialty',
        characterOnly: true,
      },
      currentSelection : { ...specialty },
      matchArray : this.specialtiesList,
      errorMsg: 'Already exist',

      selectInput: {
        show : true,
        label : 'Position Type',
        placeholder : ' Please select type',
        name : 'positionType',
        list: this.positionTypeList,
        dropdownSettings: {
          selectSingle: false,
          idField: '_id',
          textField: 'name',
        }
      },
      // checkboxInput: {
      //   show : true,
      //   label : 'Show Input Box',
      //   name : 'showInput'
      // },
    };
    this.alertConfirmService.openPopup(alertDetails).subscribe( data => {
      if (data) {
        this.currentSpecialty = {...alertDetails.currentSelection };
        this.currentIndex = this.specialtiesList.indexOf(specialty);
        this.saveSpecialtyData();
      }
    });

  }

  showDeleteModal( specialty) {
    const alertDetails: AlertConfirm = {
                          title: 'Delete Specialty',
                          message: { show: true , message: 'Are you sure you delete specialty ?'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: true, name: 'Delete'},
                        };
    this.alertConfirmService.openPopup(alertDetails).subscribe( data => {
      if (data) {
        this.currentIndex = this.specialtiesList.indexOf(specialty);
        this.currentSpecialty = specialty;
        this.deleteSpecialty();
      }
    });
  }


  deleteSpecialty() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.currentSpecialty.status = environment.STATUS.DELETE;
    // this.specialtyService.deleteExperience({ _id: this.currentSpecialty._id }).subscribe( data => {
    this.specialtyService.saveSpecialty(this.currentSpecialty).subscribe( data => {
          this.spinner.hide();
          if (data.status === 200) {
            if (this.currentIndex > -1 ) {
              this.specialtiesList.splice(this.currentIndex , 1);
              this.currentIndex = -1;
             }
            this.currentSpecialty = new Specialty();
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

  saveSpecialtyData() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    const specailty = {... this.currentSpecialty};
    specailty.positionType = specailty.positionType.map(value => value['_id'] );
    this.specialtyService.saveSpecialty(specailty).subscribe( data => {
      this.spinner.hide();
      if (data.status === 200 ) {
        if (this.currentIndex > -1 ) {
          data.data['positionType'] = JSON.parse(JSON.stringify(this.currentSpecialty['positionType']));
          this.specialtiesList[this.currentIndex] = {...data.data};
          this.currentIndex = -1;
          this.toastr.success('Data updated successfully.', 'Success');
        } else {
          data.data['positionType'] = JSON.parse(JSON.stringify(this.currentSpecialty['positionType']));
          this.specialtiesList.push({...data.data});
          this.toastr.success('Data saved successfully.', 'Success');
        }
      } else {
        this.globalService.error();
      }
      this.currentSpecialty = new Specialty();
    }, error => {
      this.globalService.error();
    });
  }

  addStrPositionType(positionType, i) {
    const self = this;
    let str = '';
     str += positionType.map( value => value.name);
    this.specialtiesList[i]['positionTypeStr'] = str;
    return str;
  }
}
