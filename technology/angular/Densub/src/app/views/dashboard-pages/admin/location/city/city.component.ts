import { Component, OnInit, ViewChild } from '@angular/core';
import { City } from './city.modal';
import { Country } from '../country/country.modal';
import { State } from '../state/state.modal';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { StateService } from '../state/state.service';
import { CountryService } from '../country/country.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertConfirmService } from '../../../../../shared-ui/service/alertConfirm.service';
import { CityService } from './city.service';
import { ZipcodeService } from '../zipcode/zipcode.service';
import { AlertConfirm } from '../../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { environment } from '../../../../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap';
import { CityFilter } from './city-filter';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit {
  @ViewChild('addEditModal', { static: false }) addEditModal: ModalDirective;
  cityList: any = [];
  currentCity: City = new City();
  currentIndex: any = -1;
  setDataFilter: any;
  order = 'state';
  reverse = false;
  itemsPerPage = 10;
  countryList: Country[] = [];
  stateList: State[] = [];
  p: number = 1;
  isAlreadyExist = false;
  filteredState: State[] = [];
  dataFilter: CityFilter = new CityFilter();

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
c
  ngOnInit() {
    this.globalService.topscroll();
    this.getCountryList();
    this.getStateList();
    this.getCityList();
  }

  setFilter() {
    this.setDataFilter = Object.assign({}, this.dataFilter);
  }

  /** This method will reset filter criteria*/
  resetFilter() {
    this.setDataFilter = this.dataFilter = new CityFilter();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  closeModal() {
    this.addEditModal.hide();
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

  getCityList() {
    this.spinner.show();
    this.cityService.getCityList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.cityList = data.data;
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

  showDeleteModal( city) {
    const alertDetails: AlertConfirm = {
                          title: 'Delete State',
                          message: { show: true , message: 'Are you sure you delete city ?'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: true, name: 'Delete'},
                        };
    this.alertConfirmService.openPopup(alertDetails).subscribe( data => {
      if (data) {
        this.currentCity = city;
        this.currentIndex = this.cityList.indexOf(city);
        this.deleteCity();
      }
    });
  }

  showSaveModal(city: City = new City()) {
    this.currentCity = {...city };
    this.currentIndex = this.cityList.indexOf(city);
    this.addEditModal.show();
    this.filterState();
  }

  saveCity() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    this.cityService.saveCity(this.currentCity).subscribe( data => {
      this.spinner.hide();
      this.currentCity = new City();
      if (data.status === 200 ) {
        if (this.currentIndex > -1 ) {
          this.cityList[this.currentIndex] = data.data;
          this.currentIndex = -1;
          this.toastr.success('Data updated successfully.', 'Success');
        } else {
          this.cityList.push(data.data);
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
    if (this.cityList && this.cityList.length) {
      let found = [];
      const self = this;
      if (this.currentCity._id) {
        found = this.cityList.filter(
          obj => (String(obj['city'])).toLowerCase() ===  self.currentCity['city'].toLowerCase()
                 && obj['_id'] !== self.currentCity._id);
      } else {
        found = this.cityList.filter (
          obj => (String(obj['city'])).toLowerCase() === self.currentCity['city'].toLowerCase()
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
    return this.currentCity.city && this.currentCity.stateId && this.currentCity.countryId && !this.isAlreadyExist;
  }

  filterState() {
    if (this.currentCity.countryId) {
      this.filteredState = this.stateList.filter(state => {
        return state.countryId === this.currentCity.countryId;
      });
    } else {
      this.filteredState = [];
      this.currentCity.stateId = '';
    }
  }

  deleteCity() {
    const condition = {
      cityId: this.currentCity._id
    };
    const updateData = { status : environment.STATUS.DELETE };
    this.cityService.updateManyCity({condition, updateData}).subscribe(
      data => {
        if (data.status === 200) {
          this.deleteZipcode();
          } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  deleteZipcode() {
    const condition = {
      cityId: this.currentCity._id
    };
    const updateData = { status : environment.STATUS.DELETE };
    this.zipcodeService.updateManyZipcode({condition, updateData}).subscribe(
        data => {
          if (data.status === 200) {
            this.spinner.hide();
            this.currentCity = new City();
              if (this.currentIndex > -1 ) {
                this.cityList.splice( this.currentIndex , 1);
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
      this.cityList[i]['countryStr'] = this.countryList[found].country;
      return this.countryList[found].country;
    }
  }

  findState(stateId, i) {
    const found = this.stateList.findIndex( value => value._id === stateId);
    if ( found > -1) {
      this.cityList[i]['stateStr'] = this.stateList[found].state;
      return this.stateList[found].state;
    }
  }
}
