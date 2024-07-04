import { Component, OnInit, ViewChild } from '@angular/core';
import { Experience } from './experience.modal';
import { ExperienceService } from './experience.service';
import { ModalDirective } from 'ngx-bootstrap';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertConfirmService } from '../../../../shared-ui/service/alertConfirm.service';
import { AlertConfirm } from '../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})

export class ExperienceComponent implements OnInit {

  @ViewChild('addEditModal', { static: false })  public addEditModal: ModalDirective;

  experienceList: Experience[] = [];
  p: any;
  reverse: Boolean = false;
  setDataFilter: any;
  order = 'experience';
  itemsPerPage = 10;
  validCheckAlreadyExitPracticeType: Boolean = true;
  currentExperience: Experience = new Experience();
  currentIndex: any = -1;
  alertDetails: AlertConfirm = new AlertConfirm();
  // experienceType = [
  //                     {
  //                       type : 'staff'
  //                     },
  //                     {
  //                       type : 'practice'
  //                     }
  //                  ];
  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private experienceService: ExperienceService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private alertConfirmService: AlertConfirmService,
  ) {
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getExperienceList();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  getExperienceList() {
    this.spinner.show();
    this.experienceService.getExperienceList({}).subscribe( data => {
      if (data.status === 200) {
        this.experienceList = data.data;
      }
      this.spinner.hide();
    }, error => {
      this.globalService.error();
    });
  }

  showSaveModal(experience: Experience = new Experience() ) {
    this.alertDetails = {
      title: (!experience._id) ? 'Add Experience' : 'Update Experience',
      message: { show: false },
      cancelButton : { show: true, name: 'Close'},
      confirmButton: {
                        show: true,
                        name: (!experience._id) ? 'Save' : 'Update'
                      },

      inputText: {
        show : true,
        label : 'Experience',
        placeholder : ' Please enter experience',
        name : 'experience',
        characterOnly: false
      },
      currentSelection : { ...experience },
      matchArray : this.experienceList,
      errorMsg: 'Already exist',

      selectInput: {
        show : true,
        label : 'Experience Type',
        placeholder : ' Please enter type',
        name : 'type',
        list: Object.values(environment.EXPERIENCE_TYPE),
        dropdownSettings: {
          selectSingle: false,
          idField: '_id',
          textField: 'type' ,
        }},
    };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
      if (data) {
        this.currentExperience = {...this.alertDetails.currentSelection };
        this.currentIndex = this.experienceList.indexOf(experience);
        this.saveExperienceData();
      }
    });

  }

  showDeleteModal( experience) {
    this.alertDetails = {
                          title: 'Delete Experience',
                          message: { show: true , message: 'Are you sure you delete experience ?'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: true, name: 'Delete'},
                        };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
      if (data) {
        this.currentExperience = experience;
        this.currentIndex = this.experienceList.indexOf(experience);
        this.deleteExperience();
      }
    });
  }


  deleteExperience() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.currentExperience.status = environment.STATUS.DELETE;
    // this.experienceService.deleteExperience({ _id: this.currentExperience._id }).subscribe( data => {
    this.experienceService.saveExperience(this.currentExperience).subscribe( data => {
          this.spinner.hide();
          this.currentExperience = new Experience();
          if (data.status === 200) {
            if (this.currentIndex > -1 ) {
              this.experienceList.splice( this.currentIndex , 1);
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

  saveExperienceData() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    this.experienceService.saveExperience(this.currentExperience).subscribe( data => {
      this.spinner.hide();
      this.currentExperience = new Experience();
      if (data.status === 200 ) {
        if (this.currentIndex > -1 ) {
          this.experienceList[this.currentIndex] = data.data;
          this.currentIndex = -1;
          this.toastr.success('Data updated successfully.', 'Success');
        } else {
          this.experienceList.push(data.data);
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
