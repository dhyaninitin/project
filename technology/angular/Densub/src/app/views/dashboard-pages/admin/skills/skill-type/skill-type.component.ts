import { Component, OnInit } from '@angular/core';
import { SkillType } from './skill-type.modal';
import { AlertConfirm } from '../../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertConfirmService } from '../../../../../shared-ui/service/alertConfirm.service';
import { environment } from '../../../../../../environments/environment';
import { SkillTypeService } from './skill-type.service';
import { SkillsService } from '../skills/skills.service';

@Component({
  selector: 'app-skill-type',
  templateUrl: './skill-type.component.html',
  styleUrls: ['./skill-type.component.scss']
})
export class SkillTypeComponent implements OnInit {


  skillTypeList: SkillType[] = [];
  p: any;
  reverse: Boolean = false;
  setDataFilter: any;
  order = 'skillType';
  itemsPerPage = 10;
  validCheckAlreadyExitPracticeType: Boolean = true;
  currentSkillType: SkillType = new SkillType();
  currentIndex: any = -1;
  alertDetails: AlertConfirm = new AlertConfirm();

  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private skillTypeService: SkillTypeService,
    private skillsService: SkillsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private alertConfirmService: AlertConfirmService,
  ) {
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getSkillTypeList();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  getSkillTypeList() {
    this.spinner.show();
    this.skillTypeService.getSkillTypeList({}).subscribe( data => {
      if (data.status === 200) {
        this.skillTypeList = data.data;
      }
      this.spinner.hide();
    }, error => {
      this.globalService.error();
    });
  }

  showSaveModal(skillType: SkillType = new SkillType()) {
    this.alertDetails = {
      title: (!skillType._id) ? 'Add Skill Type' : 'Update Skill Type',
      message: { show: false },
      cancelButton : { show: true, name: 'Close'},
      confirmButton: {
                        show: true,
                        name: (!skillType._id) ? 'Save' : 'Update'
                      },

      inputText: {
        show : true,
        label : 'Skill Type',
        placeholder : ' Please enter skill type',
        name : 'skillType',
        characterOnly: true,
      },
      currentSelection : { ...skillType },
      matchArray : this.skillTypeList,
      errorMsg: 'Already exist'
    };

    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
      if (data) {
        this.currentSkillType = {...this.alertDetails.currentSelection };
        this.currentIndex = this.skillTypeList.indexOf(skillType);
        this.saveSkillTypeData();
      }
    });

  }

  showDeleteModal( skillType) {
    this.alertDetails = {
                          title: 'Delete Skill Type',
                          message: { show: true , message: 'Are you sure you want to delete skill type ?'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: true, name: 'Delete'},
                        };
    this.alertConfirmService.openPopup(this.alertDetails).subscribe( data => {
      if (data) {
        this.currentSkillType = skillType;
        this.currentIndex = this.skillTypeList.indexOf(skillType);
        this.deleteSkillType();
      }
    });
  }


  deleteSkillType() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.currentSkillType.status = environment.STATUS.DELETE;
    // this.experienceService.deleteExperience({ _id: this.currentSkillType._id }).subscribe( data => {
    this.skillTypeService.saveSkillType(this.currentSkillType).subscribe( data => {
          if (data.status === 200) {
            this.deleteSkill();
            // if (this.currentIndex > -1 ) {
            //   this.skillTypeList.splice( this.currentIndex , 1);
            //   this.currentIndex = -1;
            // }
            // this.toastr.success('Record deleted successfully.', 'Success');
          } else {
            this.currentSkillType = new SkillType();
            this.globalService.error();
          }
        },
        error => {
          this.globalService.error();
        }
      );
  }

  saveSkillTypeData() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    this.skillTypeService.saveSkillType(this.currentSkillType).subscribe( data => {
      this.spinner.hide();
      this.currentSkillType = new SkillType();
      if (data.status === 200 ) {
        if (this.currentIndex > -1 ) {
          this.skillTypeList[this.currentIndex] = data.data;
          this.currentIndex = -1;
          this.toastr.success('Data updated successfully.', 'Success');
        } else {
          this.skillTypeList.push(data.data);
          this.toastr.success('Data saved successfully.', 'Success');
        }
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }


  deleteSkill() {
    const condition = {
      skillType: this.currentSkillType._id
    };
    const updateData = { status : environment.STATUS.DELETE };
    // this.skillsService.deleteSkill({ _id: this.currentSkill._id }).subscribe(
      this.skillsService.updateManySkill({condition, updateData}).subscribe( data => {
          if (data.status === 200) {
            this.spinner.hide();
            this.currentSkillType = new SkillType();
            if (this.currentIndex > -1 ) {
              this.skillTypeList.splice( this.currentIndex , 1);
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
