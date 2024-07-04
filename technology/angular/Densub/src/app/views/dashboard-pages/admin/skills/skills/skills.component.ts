import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Skill} from './skills.modal';
import { SkillsService } from './skills.service';
import { SkillType } from '../skill-type/skill-type.modal';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { SkillTypeService } from '../skill-type/skill-type.service';
import { AlertConfirmService } from '../../../../../shared-ui/service/alertConfirm.service';
import { AlertConfirm } from '../../../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {
  @ViewChild('addEditSkill', { static: false }) addEditSkill: ModalDirective;
  @ViewChild('skillForm',{static:false}) skillForm: any;
  skillsList: any = [];
  currentSkill: Skill = new Skill();
  currentIndex: any = -1;
  setDataFilter: any;
  order = 'skill';
  reverse = false;
  itemsPerPage = 10;
  skillTypeList: SkillType[] = [];
  isAlreadyexists = false;
  otherText = ['others','other'];
  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private skillsService: SkillsService,
    private skillTypeService: SkillTypeService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private alertConfirmService: AlertConfirmService,
  ) {
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getSkillType();
    this.getSkills();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  getSkillType() {
    this.spinner.show();
    this.skillTypeService.getSkillTypeList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.skillTypeList = data.data;
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

  getSkills() {
    this.spinner.show();
    this.skillsService.getSkills({}).subscribe(
      data => {
        if (data.status === 200) {
          this.skillsList = data.data;
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

  checkAlreadyExists() {
    const index = this.skillsList.findIndex(skill => {
        return (skill.skillType === this.currentSkill.skillType &&
        skill.skill.toLowerCase() === this.currentSkill.skill.trim().toLowerCase() );
    });
    if (index > -1) {
      this.isAlreadyexists = true;
    } else {
      this.addEditSkill.hide();
      this.isAlreadyexists = false;
      this.saveSkillData();
      this.skillForm.resetForm({});
    }
    return false;
  }

  showSaveModal(skill: Skill = new Skill() ) {
    this.isAlreadyexists = false;
    this.currentSkill = {...skill};
    this.currentIndex = this.skillsList.indexOf(skill);
    this.addEditSkill.show();
  }

  showDeleteModal( skill) {
    const alertDetails: AlertConfirm = {
                          title: 'Delete Skill',
                          message: { show: true , message: 'Are you sure you delete Skill ?'} ,
                          cancelButton : { show: true, name: 'Close'},
                          confirmButton: { show: true, name: 'Delete'},
                        };
    this.alertConfirmService.openPopup(alertDetails).subscribe( data => {
      if (data) {
        this.currentSkill = skill;
        this.currentIndex = this.skillsList.indexOf(skill);
        this.deleteSkill();
      }
    });
  }

  deleteSkill() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    this.currentSkill.status = environment.STATUS.DELETE;
    // this.skillsService.deleteSkill({ _id: this.currentSkill._id }).subscribe(
      this.skillsService.saveSkill(this.currentSkill).subscribe(
        data => {
          this.spinner.hide();
          this.currentSkill = new Skill();
          if (data.status === 200) {
            if (this.currentIndex > -1 ) {
              this.skillsList.splice( this.currentIndex , 1);
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

  saveSkillData() {
    this.globalService.setLoadingLabel('Data submitting... Please Wait.');
    this.spinner.show();
    this.skillsService.saveSkill(this.currentSkill).subscribe(
      data => {
        this.spinner.hide();
      if (data.status === 200 ) {
        if (this.currentIndex > -1 ) {
          this.skillsList[this.currentIndex] = this.currentSkill;
          this.currentIndex = -1;
          this.toastr.success('Data updated successfully.', 'Success');
        } else {
          this.skillsList.push(data.data);
          this.toastr.success('Data saved successfully.', 'Success');
        }
      } else {
        this.globalService.error();
      }
      this.currentSkill = new Skill();
    }, error => {
      this.globalService.error();
    });
  }

  findSkillType(skillTypeId, i) {
    const found = this.skillTypeList.findIndex( value => value._id === skillTypeId);
    if ( found > -1) {
      this.skillsList[i]['skillTypeStr'] = this.skillTypeList[found].skillType;
      return this.skillTypeList[found].skillType;
    }
  }

}
