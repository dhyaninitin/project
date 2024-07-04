import { Component, OnInit } from '@angular/core';
import { State } from './state.modal';
import { Country } from '../country/country.modal';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { StateService } from './state.service';
import { CountryService } from '../country/country.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertConfirmService } from '../../../../../shared-ui/service/alertConfirm.service';
import { AlertConfirm } from '../../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { environment } from '../../../../../../environments/environment';
import { CityService } from '../city/city.service';
import { ZipcodeService } from '../zipcode/zipcode.service';
import { StateFilter } from './state-filter';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.scss']
})
export class StateComponent implements OnInit {
  stateList: any = [];
  currentState: State = new State();
  currentIndex: any = -1;
  setDataFilter: any;
  order = 'state';
  reverse = false;
  itemsPerPage = 10;
  countryList: Country[] = [];
  p: number = 1;
  dataFilter: StateFilter = new StateFilter();

  constructor(
    private jwtService: JwtService,
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
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  setFilter() {
    this.setDataFilter = Object.assign({}, this.dataFilter);
  }

  /** This method will reset filter criteria*/
  resetFilter() {
    this.setDataFilter = this.dataFilter = new StateFilter();
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

  showSaveModal(state: State = new State() ) {
    const alertDetails: AlertConfirm = {
      title: (!state._id) ? 'Add State' : 'Update State',
      message: { show: false },
      cancelButton : { show: true, name: 'Close'},
      confirmButton: {
                        show: true,
                        name: (!state._id) ? 'Save' : 'Update'
                      },

      inputText: {
        show : true,
        label : 'State',
        placeholder : ' Please enter state',
        name : 'state',
        characterOnly: true,
      },
      currentSelection : { ...state },
      matchArray : this.stateList,
      errorMsg: 'Already exist',

      selectInput: {
        show : true,
        label : 'State Type',
        placeholder : ' Please select type',
        name : 'countryId',
        list: this.countryList,
        dropdownSettings: {
          selectSingle: true,
          idField: '_id',
          textField: 'country',
        }
      }
    };
    this.alertConfirmService.openPopup(alertDetails).subscribe( data => {
      if (data) {
        this.currentState = {...alertDetails.currentSelection };
        this.currentIndex = this.stateList.indexOf(state);
        this.saveStateData();
      }
    });

  }

  showDeleteModal( state) {
    const alertDetails: AlertConfirm = {
                          title: 'Delete State',
                          message: { show: true , message: 'Are you sure you delete state ?'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: true, name: 'Delete'},
                        };
    this.alertConfirmService.openPopup(alertDetails).subscribe( data => {
      if (data) {
        this.currentState = state;
        this.currentIndex = this.stateList.indexOf(state);
        this.deleteState();
      }
    });
  }

  deleteState() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.currentState.status = environment.STATUS.DELETE;
      this.stateService.saveState(this.currentState).subscribe(
        data => {
           if (data.status === 200) {
             this.deleteCity();
          } else {
            this.globalService.error();
          }
        },
        error => {
          this.globalService.error();
        }
      );
  }

  deleteCity() {
    const condition = {
      stateId: this.currentState._id
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
      stateId: this.currentState._id
    };
    const updateData = { status : environment.STATUS.DELETE };
    this.zipcodeService.updateManyZipcode({condition, updateData}).subscribe(
        data => {
          if (data.status === 200) {
            this.spinner.hide();
            this.currentState = new State();
              if (this.currentIndex > -1 ) {
                this.stateList.splice( this.currentIndex , 1);
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

  saveStateData() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    this.stateService.saveState(this.currentState).subscribe(
      data => {
        this.spinner.hide();
      if (data.status === 200 ) {
        if (this.currentIndex > -1 ) {
          this.stateList[this.currentIndex] = this.currentState;
          this.currentIndex = -1;
          this.toastr.success('Data updated successfully.', 'Success');
        } else {
          this.stateList.push(data.data);
          this.toastr.success('Data saved successfully.', 'Success');
        }
      } else {
        this.globalService.error();
      }
      this.currentState = new State();
    }, error => {
      this.globalService.error();
    });
  }

  findCountry(countryId, i) {
    const found = this.countryList.findIndex( value => value._id === countryId);
    if ( found > -1) {
      this.stateList[i]['countryStr'] = this.countryList[found].country;
      return this.countryList[found].country;
    }
  }
}
