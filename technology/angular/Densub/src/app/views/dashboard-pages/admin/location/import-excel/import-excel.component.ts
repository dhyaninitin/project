import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../../../../environments/environment';
import * as XLSX from 'xlsx';
import { Zipcode } from '../zipcode/zipcode.modal';
import { Country } from '../country/country.modal';
import { State } from '../state/state.modal';
import { City } from '../city/city.modal';
import { CityService } from '../city/city.service';
import { ZipcodeService } from '../zipcode/zipcode.service';
import { StateService } from '../state/state.service';
import { CountryService } from '../country/country.service';
import { AlertConfirm } from '../../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { AlertConfirmService } from '../../../../../shared-ui/service/alertConfirm.service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-import-excel',
  templateUrl: './import-excel.component.html',
  styleUrls: ['./import-excel.component.scss']
})
export class ImportExcelComponent implements OnInit {
  @ViewChild('confirmModal',{static : false}) public confirmModal: ModalDirective;
  zipcodeList: Zipcode[] = [];
  countryList: Country[] = [];
  stateList: State[] = [];
  cityList: City[] = [];
  tableHeader: any[] = [];
  tableData: any = [];
  itemsPerPage = 10;
  p: number = 1;
  matchHeader = ['country', 'state' , 'city', 'zipcode'];
  alertDetails: AlertConfirm = new AlertConfirm();
  details = {
    alreadyExist: 0,
    invalidData: 0,
    saved: 0
  };
  count = 0;
  uploadingDetails = {
    country: '',
    state: '',
    city: ''
  };
  constructor(
    private toastr: ToastrService,
    private globalService: GlobalService,
    private spinner: NgxSpinnerService,
    private cityService: CityService,
    private zipcodeService: ZipcodeService,
    private stateService: StateService,
    private countryService: CountryService,
    private alertConfirmService: AlertConfirmService,
  ) { }

  ngOnInit() {
    console.log('I am here');
    this.getAllList();
  }

  async getAllList() {
    this.spinner.show();
    await this.getCountryList();
    await this.getStateList();
    await this.getCityList();
    await this.getZipcodeList();
    this.spinner.hide();
  }

  getCountryList() {
    this.countryService.getCountryList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.countryList = data.data;
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

  getZipcodeList() {
    this.zipcodeService.getZipcodeList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.zipcodeList = data.data;
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

  selectFiles(event): void {
    const file: File = event.srcElement.files[0];
    if (!file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      this.toastr.warning(
        'You can upload only xls or xlsx documents.',
        'Warning'
      );
      return;
    }
    this.readXlsxFile(event);
  }

  fileReset() {
    this.tableHeader = [];
    this.tableData = [];
    this.details = {
      alreadyExist: 0,
      invalidData: 0,
      saved: 0
    };
    this.count = 0;
    this.uploadingDetails = {
      country: '',
      state: '',
      city: ''
    };
  }

  readXlsxFile($event: any) {
    this.spinner.show();
    this.fileReset();
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = $event.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const keys = Object.keys(jsonData);
      for (let index = 0; index < keys.length; index++) {
        this.tableData = this.tableData.concat(jsonData[keys[index]]);
      }
      this.tableHeader = Object.keys(this.tableData[0]);
      const isMatched = this.matchHeader.every(value => this.tableHeader.includes(value));
      this.spinner.hide();
      if (!isMatched) {
        this.showMatchedModal();
        this.fileReset();
        return;
      }
    };
    reader.readAsBinaryString(file);
  }

  showMatchedModal() {
    this.alertDetails = {
                          title: 'Invalid Headers',
                          message: { show: true , message: 'Please check the header format (' + this.matchHeader + ')'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: false},
                        };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => { });
  }

  uploadLocations() {
    console.log(this.count, this.tableData.length);
    if((this.count) > (this.tableData.length - 1 )) {
      this.spinner.hide();
      this.confirmModal.show();
      console.log('Uploadig Done',this.details);
      return;
    }
    if (this.count === 0 ) {
      this.spinner.show();
    }
    this.globalService.setLoadingLabel('Please Wait. Location adding... Total : ' +
        this.tableData.length + ' Remaining Location :' + this.count);
    this.saveCountry();

  }

  saveCountry() {
    if (!this.tableData[this.count] || !this.tableData[this.count]['country']) {
      this.details.invalidData++;
      this.counter();
      return;
    }
    const self = this;
    const country = this.countryList.filter( value => ( self.tableData[self.count]['country'] &&
                                value.country.toLowerCase() === self.tableData[self.count]['country'].toLowerCase()
                                              ));
    if (country.length) {
      this.uploadingDetails.country = country[0]._id;
      this.saveState();
      return;
    }

    const currentCountry = {
        country : this.tableData[this.count]['country'],
        status : environment.STATUS.ACTIVE
    };
    console.log('country',currentCountry);
    this.countryService.saveCountry(currentCountry).subscribe( data => {
      if (data.status === 200 ) {
        this.countryList.push(data.data);
        this.uploadingDetails.country = data.data._id;
        this.saveState();
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }

  saveState() {
    if (!this.tableData[this.count] || !this.tableData[this.count]['state']) {
      this.details.invalidData++;
      this.counter();
      return;
    }
    const self = this;
    const state = this.stateList.filter( value => ( self.tableData[self.count]['state'] &&
                                value.state.toLowerCase() === self.tableData[self.count]['state'].toLowerCase()
                                                    ));
    if (state.length) {
      this.uploadingDetails.state = state[0]._id;
      this.saveCity();
      return;
    }
    const currentState = {
      countryId : this.uploadingDetails.country,
      state : this.tableData[this.count]['state'],
      status : environment.STATUS.ACTIVE
  };
    console.log('state',currentState);
    this.stateService.saveState(currentState).subscribe( data => {
      if (data.status === 200 ) {
        this.stateList.push(data.data);
        this.uploadingDetails.state = data.data._id;
        this.saveCity();
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }

  saveCity() {
    if (!this.tableData[this.count] || !this.tableData[this.count]['city']) {
      this.details.invalidData++;
      this.counter();
      return;
    }
    const self = this;
    const city = this.cityList.filter( value => ( self.tableData[self.count]['city'] &&
                                value.city.toLowerCase() === self.tableData[self.count]['city'].toLowerCase()
                                                  ));
    if (city.length) {
      this.uploadingDetails.city = city[0]._id;
      this.saveZipcode();
      return;
    }

    const currentCity = {
      countryId : this.uploadingDetails.country,
      stateId : this.uploadingDetails.state,
      city : this.tableData[this.count]['city'],
      status : environment.STATUS.ACTIVE
  };
    console.log('city', currentCity);
    this.cityService.saveCity(currentCity).subscribe( data => {
      if (data.status === 200 ) {
        this.cityList.push(data.data);
        this.uploadingDetails.city = data.data._id;
        this.saveZipcode();
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }

  saveZipcode() {
    if (!this.tableData[this.count] || !this.tableData[this.count]['zipcode'] || !Number.isInteger(this.tableData[this.count]['zipcode'])) {
      this.details.invalidData++;
      this.counter();
      return;
    }
    const self = this;
    const zipcode = this.zipcodeList.filter( value => {
      console.log(value.zipcode, self.tableData[self.count]['zipcode']);
      return self.tableData[self.count]['zipcode'] &&
                                Number(value.zipcode) === self.tableData[self.count]['zipcode']
    });
    if (zipcode.length) {
      this.details.alreadyExist++;
      this.counter();
      return;
    }

    const currentZipcode = {
      countryId : this.uploadingDetails.country,
      stateId : this.uploadingDetails.state,
      cityId : this.uploadingDetails.city,
      zipcode : this.tableData[this.count]['zipcode'],
      status : environment.STATUS.ACTIVE
  };
    this.zipcodeService.saveZipcode(currentZipcode).subscribe( data => {
      if (data.status === 200 ) {
        this.zipcodeList.push(data.data);
        this.details.saved++;
        this.counter();
        console.log(this.details);
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }

  counter() {
    this.count++;
    this.uploadLocations();
  }

}
