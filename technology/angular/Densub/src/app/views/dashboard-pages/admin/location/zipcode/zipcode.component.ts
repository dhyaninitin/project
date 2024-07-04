import { Component, OnInit, ViewChild } from '@angular/core';
import { Zipcode } from './zipcode.modal';
import { Country } from '../country/country.modal';
import { State } from '../state/state.modal';
import { City } from '../city/city.modal';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { StateService } from '../state/state.service';
import { CountryService } from '../country/country.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertConfirmService } from '../../../../../shared-ui/service/alertConfirm.service';
import { CityService } from '../city/city.service';
import { ZipcodeService } from './zipcode.service';
import { AlertConfirm } from '../../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { environment } from '../../../../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap';
import { ZipcodeFilter } from './zipcode-filter';

@Component({
  selector: 'app-zipcode',
  templateUrl: './zipcode.component.html',
  styleUrls: ['./zipcode.component.scss']
})
export class ZipcodeComponent implements OnInit {
  @ViewChild('addEditModal', { static: false }) addEditModal: ModalDirective;
  zipcodeList: Zipcode[] = [];
  currentZipcode: Zipcode = new Zipcode();
  currentIndex: any = -1;
  dataFilter: ZipcodeFilter = new ZipcodeFilter();
  setDataFilter: any;
  order = 'state';
  reverse = false;
  itemsPerPage = 10;
  countryList: Country[] = [];
  stateList: State[] = [];
  cityList: City[] = [];
  p: number = 1;
  isAlreadyExist = false;
  filteredState: State[] = [];
  filteredCity: City[] = [];

  constructor(
    private globalService: GlobalService,
    private stateService: StateService,
    private countryService: CountryService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private alertConfirmService: AlertConfirmService,
    private cityService: CityService,
    private zipcodeService: ZipcodeService,
  ) { }

  ngOnInit() {
    this.globalService.topscroll();
    this.getCountryList();
    this.getStateList();
    this.getCityList();
    this.getZipcodeList();
  }

  setFilter() {
    this.setDataFilter = Object.assign({}, this.dataFilter);
  }

  /** This method will reset filter criteria*/
  resetFilter() {
    this.setDataFilter = this.dataFilter = new ZipcodeFilter();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  getCountryList() {
    this.spinner.show();
    this.countryService.getCountryList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.countryList = data.data;
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

  getStateList() {
    this.spinner.show();
    this.stateService.getStateList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.stateList = data.data;
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

  getCityList() {
    this.spinner.show();
    this.cityService.getCityList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.cityList = data.data;
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

  getZipcodeList() {
    this.spinner.show();
    this.zipcodeService.getZipcodeList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.zipcodeList = data.data;
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

  showDeleteModal( zipcode) {
    const alertDetails: AlertConfirm = {
                          title: 'Delete State',
                          message: { show: true , message: 'Are you sure you delete zipcode ?'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: true, name: 'Delete'},
                        };
    this.alertConfirmService.openPopup(alertDetails).subscribe( data => {
      if (data) {
        this.currentZipcode = zipcode;
        this.currentIndex = this.zipcodeList.indexOf(zipcode);
        this.deleteZipcode();
      }
    });
  }

  showSaveModal(zipcode: Zipcode = new Zipcode() ) {
    this.currentZipcode = {...zipcode };
    this.currentIndex = this.zipcodeList.indexOf(zipcode);
    this.addEditModal.show();
    this.filterState();
    this.filterCity();
  }

  saveZipcode() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    this.zipcodeService.saveZipcode(this.currentZipcode).subscribe( data => {
      this.spinner.hide();
      this.currentZipcode = new Zipcode();
      if (data.status === 200 ) {
        if (this.currentIndex > -1 ) {
          this.zipcodeList[this.currentIndex] = data.data;
          this.currentIndex = -1;
          this.toastr.success('Data updated successfully.', 'Success');
        } else {
          this.zipcodeList.push(data.data);
          this.toastr.success('Data saved successfully.', 'Success');
        }
      } else {
        this.globalService.error();
      }
      this.closeModal();
    }, error => {
      this.globalService.error();
    });
  }

  checkIsAlreadyExit() {
    if (this.zipcodeList && this.zipcodeList.length) {
      let found = [];
      const self = this;
      if (this.currentZipcode._id) {
        found = this.zipcodeList.filter(
          obj => (String(obj['zipcode'])).toLowerCase() ===  self.currentZipcode['zipcode'].toLowerCase()
                 && obj['_id'] !== self.currentZipcode._id);
      } else {
        found = this.zipcodeList.filter (
          obj => (String(obj['zipcode'])).toLowerCase() === self.currentZipcode['zipcode'].toLowerCase()
          );
      }
      if (found.length) {
        this.isAlreadyExist = true;
      } else {
        this.isAlreadyExist = false;
      }

    } else {
      this.isAlreadyExist = false;
    }
  }

  showButton() {
    return this.currentZipcode.zipcode && this.currentZipcode.cityId && this.currentZipcode.stateId
            && this.currentZipcode.countryId && !this.isAlreadyExist;
  }

  closeModal() {
    this.addEditModal.hide();
  }

  filterState(type = '') {
    if (this.currentZipcode.countryId) {
      this.filteredState = this.stateList.filter(state => {
        return state.countryId === this.currentZipcode.countryId;
      });
      this.filteredCity = [];
      this.currentZipcode.cityId = (type === 'changed') ? '' : this.currentZipcode.cityId ;
    } else {
      this.filteredState = [];
      this.currentZipcode.stateId = '';
      this.filteredCity = [];
      this.currentZipcode.cityId = '';
    }
  }

  filterCity() {
    if (this.currentZipcode.stateId) {
      this.filteredCity = this.cityList.filter(state => {
        return state.stateId === this.currentZipcode.stateId;
      });
    } else {
      this.filteredCity = [];
      this.currentZipcode.cityId = '';
    }
  }

  deleteZipcode() {
    const condition = {
      _id: this.currentZipcode._id
    };
    const updateData = { status : environment.STATUS.DELETE };
    this.zipcodeService.updateManyZipcode({condition, updateData}).subscribe(
        data => {
          if (data.status === 200) {
            this.spinner.hide();
            this.currentZipcode = new Zipcode();
              if (this.currentIndex > -1 ) {
                this.zipcodeList.splice( this.currentIndex , 1);
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

  findCountry(countryId, i) {
    const found = this.countryList.findIndex( value => value._id === countryId);
    if ( found > -1) {
      this.zipcodeList[i]['countryStr'] = this.countryList[found].country;
      return this.countryList[found].country;
    }
  }

  findState(stateId, i) {
    const found = this.stateList.findIndex( value => value._id === stateId);
    if ( found > -1) {
      console.log(i);
      this.zipcodeList[i]['stateStr'] = this.stateList[found].state;
      return this.stateList[found].state;
    }
  }

  findCity(cityId, i) {
    const found = this.cityList.findIndex( value => value._id === cityId);
    if ( found > -1) {
      this.zipcodeList[i]['cityStr'] = this.cityList[found].city;
      return this.cityList[found].city;
    }
  }
}
