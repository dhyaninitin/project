import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { environment } from '../../../../../../environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { OfferService } from '../../../../../shared-ui/service/offer.service';
import { ToastrService } from 'ngx-toastr';
import {  differenceInHours } from 'date-fns';
import { currentUser } from '../../../../../layouts/home-layout/user.model';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { ContractFilter } from '../contract-filter';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss']
})

export class ContractListComponent implements OnInit {
   contractList: any =[];
   order: any = '';
   reverse: Boolean = false;
   itemsPerPage = 10;
   contractStatus: any = environment.CONTRACT_STATUS;
  //  jobType = environment.JOB_TYPE;
   currentUser: currentUser = new currentUser;
   dataFilter: ContractFilter = new ContractFilter();
    setDataFilter: any;
    jobTypes: any = environment.JOB_TYPE;
    contractListStatus: any = environment.CONTRACT_LIST_STATUS;
    contractListStatusArr: any = Object.values(environment.CONTRACT_LIST_STATUS);
    contractListStatusColor: any = environment.CONTRACT_LIST_STATUS_COLOR;
    jobLabel: any = environment.JOB_LABEL;
    datePickerConfig: any = {
      allowMultiSelect: false,
      disableKeypress: true,
      // min: moment(new Date()).format('MMM DD,YYYY'),
      format: 'MMM DD,YYYY'
    };
  constructor(
    private globalService: GlobalService,
    private spinner: NgxSpinnerService,
    private offerService: OfferService,
    private toastr: ToastrService,
    private jwtService: JwtService
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    this.globalService.topscroll();
    this.setOrder('createdBy');
  }
  ngOnInit() {
    this.getContracts();
  }

  setOrder(value: string) {
    if (this.order === value) {
        this.reverse = !this.reverse;
    }
    this.order = value;
  }

  /** This method will filter user behalf criteria */
  setFilter() {
    this.setDataFilter = Object.assign({}, this.dataFilter);
  }

  /** This method will reset filter criteria*/
  resetFilter() {
    this.setDataFilter = this.dataFilter = new ContractFilter();
    // this.setDataFilter = { firstName: '' };
  }

  getContracts() {
    this.spinner.show();
    const condition = {
      status      : environment.OFFER_STATUS_NEW.CONTRACT,
      // practiceId  : this.currentUser._id,
       contractStatus : {$ne: this.contractStatus.REVOKE},
    };
    const sort = {
      updatedAt: -1
    };
    this.offerService.getAllOffers({ condition , sort }).pipe(map( contractList => {
      if(contractList.status === 200 && contractList.data.length > 0) {
      let isReturn = false;
      contractList.data =  contractList.data.map(  (contract, index) => {

        contract.jobPostId['duration'] = this.getContractDuration(contract);
              switch (contract.contractStatus) {
                case this.contractStatus.UPCOMING:
                  contract['contractListStatus'] = this.contractListStatus.PAYTOACTIVATE;
                    break;

                case this.contractStatus.INPROGRESS:
                      const startofToday = moment().startOf('day');
                      const endofToday = moment().endOf('day');
                      if(moment(contract.jobPostId.jobDate).isBefore(endofToday)) {
                        contract['contractListStatus'] = this.contractListStatus.INPROGRESS;
                      } else {
                        contract['contractListStatus'] = this.contractListStatus.UPCOMING;
                      }
                    break;

                case this.contractStatus.COMPLETED:
                  contract['contractListStatus'] = this.contractStatus.COMPLETED;
                  // contract['contractListStatus'] = this.contractListStatus.FILLED;
                    break;

                case this.contractStatus.CANCELLED:
                  contract['contractListStatus'] = this.contractListStatus.CANCELLED;
                    break;
              }
              if(index === (contractList.data.length -1)){
                isReturn = true;
              }
            return contract;
      });
      if(isReturn) {
        return contractList;
      }
    } else {
      return contractList;
    }

  })).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.contractList = data.data;
          }
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  getContractDuration(contract: any) {
    const diffTime = differenceInHours(contract.jobPostId.endTime , contract.jobPostId.startTime);
    if (this.jobTypes.TEMPORARY !== contract.jobPostId.jobType) {
      const selectedDays = contract.jobPostId.availableDays.filter((day) => {
        return day.available;
      });
      contract.jobPostId['duration'] = diffTime * selectedDays.length;
      return diffTime * selectedDays.length;
    } else {
      contract.jobPostId['duration'] = diffTime;
      return diffTime;
    }

  }

}
