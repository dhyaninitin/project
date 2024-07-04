import { Component, OnInit } from '@angular/core';
import { AlertConfirm } from '../../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { CountryService } from './country.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertConfirmService } from '../../../../../shared-ui/service/alertConfirm.service';
import { environment } from '../../../../../../environments/environment';
import { Country } from './country.modal';
import { StateService } from '../state/state.service';
import { CityService } from '../city/city.service';
import { ZipcodeService } from '../zipcode/zipcode.service';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit {
  countryList: Country[] = [];
  p: any;
  reverse: Boolean = false;
  setDataFilter: any;
  order = 'country';
  itemsPerPage = 10;
  currentCountry: Country = new Country();
  currentIndex: any = -1;
  alertDetails: AlertConfirm = new AlertConfirm();

  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private countryService: CountryService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private alertConfirmService: AlertConfirmService,
    private stateService: StateService,
    private cityService: CityService,
    private zipcodeService: ZipcodeService,
  ) { }

  ngOnInit() {
    this.globalService.topscroll();
    this.getCountryList();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  getCountryList() {
    this.spinner.show();
    this.countryService.getCountryList({}).subscribe( data => {
      if (data.status === 200) {
        this.countryList = data.data;
      }
      this.spinner.hide();
    }, error => {
      this.globalService.error();
    });
  }

  showSaveModal(country: Country = new Country() ) {
    this.alertDetails = {
      title: (!country._id) ? 'Add Country' : 'Update Country',
      message: { show: false },
      cancelButton : { show: true, name: 'Close'},
      confirmButton: {
                        show: true,
                        name: (!country._id) ? 'Save' : 'Update'
                      },

      inputText: {
        show : true,
        label : 'Country',
        placeholder : ' Please enter country',
        name : 'country',
        characterOnly: true,
      },
      currentSelection : { ...country },
      matchArray : this.countryList,
      errorMsg: 'Already exist'
    };

    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
      if (data) {
        this.currentCountry = {...this.alertDetails.currentSelection };
        this.currentIndex = this.countryList.indexOf(country);
        this.saveCountryData();
      }
    });

  }

  showDeleteModal( country) {
    this.alertDetails = {
                          title: 'Delete Country',
                          message: { show: true , message: 'Are you sure you want to delete country ?'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: true, name: 'Delete'},
                        };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
      if (data) {
        this.currentCountry = country;
        this.currentIndex = this.countryList.indexOf(country);
        this.deleteCountry();
      }
    });
  }


  deleteCountry() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.currentCountry.status = environment.STATUS.DELETE;
    this.countryService.saveCountry(this.currentCountry).subscribe( data => {
          if (data.status === 200) {
            this.deleteState();
            /* this.currentCountry = new Country();
            if (this.currentIndex > -1 ) {
              this.countryList.splice( this.currentIndex , 1);
              this.currentIndex = -1;
            }
            this.toastr.success('Record deleted successfully.', 'Success'); */
          } else {
            this.currentCountry = new Country();
            this.globalService.error();
          }
        },
        error => {
          this.globalService.error();
        }
      );
  }

  saveCountryData() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    this.countryService.saveCountry(this.currentCountry).subscribe( data => {
      this.spinner.hide();
      this.currentCountry = new Country();
      if (data.status === 200 ) {
        if (this.currentIndex > -1 ) {
          this.countryList[this.currentIndex] = data.data;
          this.currentIndex = -1;
          this.toastr.success('Data updated successfully.', 'Success');
        } else {
          this.countryList.push(data.data);
          this.toastr.success('Data saved successfully.', 'Success');
        }
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }

  deleteState() {
    const condition = {
      countryId: this.currentCountry._id
    };
    const updateData = { status : environment.STATUS.DELETE };
    this.stateService.updateManyState({condition, updateData}).subscribe(
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
      countryId: this.currentCountry._id
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
      countryId: this.currentCountry._id
    };
    const updateData = { status : environment.STATUS.DELETE };
    this.zipcodeService.updateManyZipcode({condition, updateData}).subscribe(
        data => {
          if (data.status === 200) {
            this.spinner.hide();
            this.currentCountry = new Country();
            if (this.currentIndex > -1 ) {
              this.countryList.splice( this.currentIndex , 1);
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
