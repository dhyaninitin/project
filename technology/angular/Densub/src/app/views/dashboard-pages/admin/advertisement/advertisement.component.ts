import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import { Advertisement } from './advertisement.modal';
import { AdvertisementService } from '../../../../shared-ui/service/advertisement.service';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { AlertConfirmService } from "../../../../shared-ui/service/alertConfirm.service";
import { AlertConfirm } from "../../../../shared-ui/component/alert-confirm/alert-confirm.modal";


@Component({
  selector: 'app-advertisement',
  templateUrl: './advertisement.component.html',
  styleUrls: ['./advertisement.component.scss']
})
export class AdvertisementComponent implements OnInit {
  page: String = 'Advertisement';

 /*  @ViewChild("deleteAdvertiseModal", { static: false })
  public deleteAdvertiseModal: ModalDirective; */
  @ViewChild('addEditAdvertise', { static: false }) public addEditAdvertise: ModalDirective;
  advertisementList: any = [];
  currentAdvertise: Advertisement = new Advertisement();

  setDataFilter: any;
  order: String = 'adtitle';
  reverse: Boolean = false;
  sortedCollection: any[];
  itemsPerPage = 10;
  practiceTypeList: any = [];
  alertDetails: AlertConfirm = new AlertConfirm();
  validLinkUrl: Boolean = true;

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  constructor(
    private router: Router,
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private advertisementService: AdvertisementService,
    private jwtService: JwtService,
    private alertConfirmService: AlertConfirmService,
  ) {
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getadvertisementData();
  }

  getadvertisementData() {
    this.spinner.show();
    this.advertisementService.getAdvertiseList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.advertisementList = data.data;
        }
        this.spinner.hide();
      },
      error => {
        this.globalService.error();
      }
    );
  }

  showSaveAdvertiseModal(advertise?: any) {
    if (advertise && advertise._id) {
      this.currentAdvertise = Object.assign({}, advertise);
    } else {
      this.currentAdvertise = new Advertisement();
      this.validLinkUrl = true;
    }
    this.addEditAdvertise.show();
  }


  showDeleteAdvertise(advertise: any) {
    this.alertDetails = {
      title: 'Delete Advertisement',
      message: { show: true , message: 'Are you sure want to delete this advertise ?'} ,
      cancelButton : { show: true, name: 'Close'},
      confirmButton: { show: true, name: 'Delete'},
    };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
    if (data) {
      this.currentAdvertise = advertise;
      this.deleteAdvertise();
    }
    });
  }

  deleteAdvertise() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.advertisementService.deleteAdvertise({ _id: this.currentAdvertise._id })
      .subscribe(
        data => {
          this.spinner.hide();
          if (data.status === 200) {
            var found = this.advertisementList.filter(obj => {
              return obj._id == this.currentAdvertise._id;
            });
            if (found.length) {
              var index = this.advertisementList.indexOf(found[0]);
              this.advertisementList.splice(index, 1);
            }
            this.toastr.success('Record deleted successfully.', 'Success');
          }
          this.currentAdvertise = new Advertisement();
        },
        error => {
          this.globalService.error();
        }
      );
  }

  saveAdvertiseData() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    this.currentAdvertise.createdBy = this.jwtService.currentLoggedUserInfo._id;
    this.advertisementService.saveAdvertise(this.currentAdvertise).subscribe(
      data => {
        this.spinner.hide();
        this.addEditAdvertise.hide();
        if (data.status === 200) {
          if (this.currentAdvertise._id) {
            var self = this;
            var found = self.advertisementList.filter(obj => {
              return obj._id == this.currentAdvertise._id;
            });
            if (found.length) {
              var index = this.advertisementList.indexOf(found[0]);
              this.advertisementList[index] = data.data;
            }
          } else {
            this.advertisementList.push(data.data);
          }
          this.toastr.success('Data saved successfully.', 'Success');
        }
        this.currentAdvertise = new Advertisement();
      },
      error => {
        this.addEditAdvertise.hide();
        this.globalService.error();
      }
    );
  }

  closeModel() {
    this.addEditAdvertise.hide();
    this.currentAdvertise = new Advertisement();
  }

  ValidURL(str: any) {
    var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    if(!regex .test(str)) {
      this.validLinkUrl = false;
    } else {
      this.validLinkUrl = true;
    }
  }
}
