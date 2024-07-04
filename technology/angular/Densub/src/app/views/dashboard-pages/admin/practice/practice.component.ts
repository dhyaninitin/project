import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { PracticeService } from './practice.service';
import { Practice } from './practice.modal';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { environment } from '../../../../../environments/environment';
import { AlertConfirm } from '../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { AlertConfirmService } from '../../../../shared-ui/service/alertConfirm.service';

@Component({
  selector: 'app-practice',
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.scss']
})
export class PracticeComponent implements OnInit {
  @ViewChild('deletePracticeModal', { static: false }) public deletePracticeModal: ModalDirective;
  @ViewChild('addEditPracticeType', { static: false }) public addEditPracticeType: ModalDirective;

  practiceList: Practice[] = [];
  currentPractice: Practice = new Practice();
  current: Practice = new Practice();
  setDataFilter: any;
  order: string = 'practiceType';
  reverse: boolean = false;
  // sortedCollection: any[];
  itemsPerPage = 10;
  currentIndex: any = -1;
  alertDetails: AlertConfirm = new AlertConfirm();
  // validCheckAlreadyExitPracticeType: boolean = true;



  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private practiceService: PracticeService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private alertConfirmService: AlertConfirmService,
  ) {
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getPracticeData();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  getPracticeData() {
    this.spinner.show();
    this.practiceService.getPractice({}).subscribe(
      data => {
        if (data.status === 200) {
          this.practiceList = data.data;
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

  showSaveModal(practice: Practice = new Practice() ) {
    this.alertDetails = {
      title: (!practice._id) ? 'Add practice' : 'Update Practice',
      message: { show: false },
      cancelButton : { show: true, name: 'Close'},
      confirmButton: {
                        show: true,
                        name: (!practice._id) ? 'Save' : 'Update'
                      },

      inputText: {
        show : true,
        label : 'Practice Type',
        placeholder : ' Please enter practice type',
        name : 'practiceType',
        characterOnly: true,
      },
      currentSelection : { ...practice },
      matchArray : this.practiceList,
      errorMsg: 'Already exist'
    };

    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
      if (data) {
        this.currentPractice = {...this.alertDetails.currentSelection };
        this.currentIndex = this.practiceList.indexOf(practice);
        this.savePracticeData();
      }
    });

  }

  showDeleteModal( practice) {
    this.alertDetails = {
                          title: 'Delete Practice',
                          message: { show: true , message: 'Are you sure you want to delete practice ?'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: true, name: 'Delete'},
                        };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
      if (data) {
        this.currentPractice = practice;
        this.currentIndex = this.practiceList.indexOf(practice);
        this.deletePractice();
      }
    });
  }

  deletePractice() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.currentPractice.status = environment.STATUS.DELETE;
    this.practiceService.deletePractice({ _id: this.currentPractice._id }).subscribe( data => {
        this.spinner.hide();
        this.currentPractice = new Practice();
        if (data.status === 200) {
          if (this.currentIndex > -1 ) {
            this.practiceList.splice( this.currentIndex , 1);
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

  savePracticeData() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    this.practiceService.savePractice(this.currentPractice).subscribe(data => {
      this.spinner.hide();
      this.currentPractice = new Practice();
      if (data.status === 200 ) {
        if (this.currentIndex > -1 ) {
          this.practiceList[this.currentIndex] = data.data;
          this.currentIndex = -1;
          this.toastr.success('Data updated successfully.', 'Success');
        } else {
          this.practiceList.push(data.data);
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
