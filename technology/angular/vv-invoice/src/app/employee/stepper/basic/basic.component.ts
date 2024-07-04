import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DeleteDialogComponent } from 'src/app/shared/delete-dialog/delete-dialog.component';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss'],
})
export class BasicComponent implements OnInit {
  @Output() nextStep: EventEmitter<any> = new EventEmitter()
  basicComForm!: FormGroup;
  componentName: string = ''
  componentType: string = ''
  templatesType:any[]=[];
  addNewTemplateType:boolean = false;
  templateExist: boolean = false
  stopSelectionChangeEvent: boolean = false;
  page: number = 1;
  size: number = 5;
  sortBy: string = '';
  searchedKeyword: string = '';
  userId: any;

  constructor(
    private fb: FormBuilder,
    private _empSer: EmployeeService,
    private snackBar: MatSnackBar,
    private dialog:MatDialog,
    private router:Router,
    private _authSer:AuthService
  ){ this.getUserId() }

  ngOnInit(): void {
    this.initForm();
    this.getBasicData();
    this.getTemplatesType()
  }

  getUserId() {
    if(this._authSer.userId) {
      this.userId = this._authSer.userId;
    }else{
      this._authSer.tokenDecoder(null);
      this.userId = this._authSer.userId;
    }
  }

  checkTemplateNameExist(event: any) {
    let checkTemplateName = event.target.value
    if(this.userId && checkTemplateName !== '') {
      this._empSer.hideSpinnerSubject.next([true, checkTemplateName]);
      this._empSer.checkTemplateNameExist(this.userId ,checkTemplateName).subscribe((res => {
        if(res.status == 200) {
          this.templateExist = false;
        }else {
          this.templateExist = true;
          this.snackBar.open(res.message,'Cancel',{
            duration:2000,
            panelClass: 'error-snackbar'
          })
        }
      }))
    }
  }

  getTemplatesType() {
    this._empSer.getTemplatesType(this.userId).subscribe((res: any) => {
      if(res.status == 200) {
        let defaultTypes = res?.defaultTypes
        let newTypesAdded = res?.newTypesAdded
        this.templatesType = [...defaultTypes,...newTypesAdded]
      }
    })
  }

  onDeleteNewType(id: string) {
    let data = this._empSer.employeeData.filter(x => x.componentname)
    if(data.length >= 1) {
      this.stopSelectionChangeEvent = true;
      this.snackBar.open("Sorry won't perform this action right now, if components are there",'Cancel',{
        duration:3000,
        panelClass: 'error-snackbar'
      })
    }else {
      this.stopSelectionChangeEvent = true;
      this.dialog.open(DeleteDialogComponent,{
        width: '380px',
        height: 'auto',
        disableClose: true,
        data: 'template type',
        panelClass: 'confirm-dialog-container',
      }).afterClosed().subscribe(res => {
        if(res == true) {
          this._empSer.deleteAddedTemplateType(id).subscribe((res: any) => {
            if(res.status == 200) {
              this.snackBar.open(res.message,'Cancel',{
                duration:3000,
                panelClass: 'success-snackbar'
              })
              this.getTemplatesType()
              this.stopSelectionChangeEvent = false;
            }
          })
        }
        this.stopSelectionChangeEvent = false;
        const val = localStorage.getItem('templateType');
        this.basicComForm.patchValue({ templatetype: val })
      }) 
    }
  }

  onAddNewType() {
    this.addNewTemplateType = true
    this.basicComForm.patchValue({newtemplatetype: ''})
  }

  AddNewTemplateType() {
    if(this.basicComForm.value.newtemplatetype.length >= 1) {
    let data = this._empSer.employeeData.filter(x => x.componentname)
      if(data.length >= 1) {
        let answer = window.confirm('If Template Type changed then all the components of this template will be removed !');
        if(answer) {
          let newData = this._empSer.employeeData.filter((x) => { return !x.componentname });
          this._empSer.employeeData.splice(0, this._empSer.employeeData.length, ...newData);
          this._empSer.callTheOninitSubject.next('');
          this._empSer.delComDataFromTableSubject.next('');
  
          let templateid = localStorage.getItem('templateid');
          this._empSer
            .deleteEmployeeRelatedCom(templateid)
            .subscribe((res: any) => {
              if (res.status == 200) {
                this.snackBar.open('Components deleted & template type added', 'Cancel', {
                  duration: 3000,
                  panelClass: 'success-snackbar'
                });
              }
            });

            let newTemplateType = this.basicComForm.value.newtemplatetype
            this._empSer.addNewTemplateType(this.userId, newTemplateType).subscribe((res: any) => {
            if(res.status == 200) {
              this.basicComForm.patchValue({templatetype: this.basicComForm.value.newtemplatetype})
              localStorage.setItem('templateType', this.basicComForm.value.newtemplatetype)
              this.addNewTemplateType = false
              this.basicComForm.value.newtemplatetype = ''
              this.getTemplatesType()
            }else{
              this.snackBar.open(res.message, 'Cancel', {
                duration: 3000,
                panelClass: ['error-snackbar']
              })
            }
          })

        }else if (answer == false) {
          const val = localStorage.getItem('templateType');
          this.basicComForm.patchValue({ templatetype: val })
        }
      }else {
          let newTemplateType = this.basicComForm.value.newtemplatetype
          this._empSer.addNewTemplateType(this.userId, newTemplateType).subscribe((res: any) => {
          if(res.status == 200) {
            this.snackBar.open(res.message, 'Cancel', {
              duration: 3000,
              panelClass: ['success-snackbar']
            })
            this.basicComForm.patchValue({templatetype: this.basicComForm.value.newtemplatetype})
            localStorage.setItem('templateType', this.basicComForm.value.newtemplatetype)
            this.addNewTemplateType = false
            this.basicComForm.value.newtemplatetype = ''
            this.getTemplatesType()
          }else{
            this.snackBar.open(res.message, 'Cancel', {
              duration: 3000,
              panelClass: ['error-snackbar']
            })
          }
        })
      }
    }
  }
  
  onCancelNewTemplateType() {
    this.addNewTemplateType = false
    this.basicComForm.patchValue({newtemplatetype: ''})
  }

  getBasicData() {
    if (this._empSer.employeeData.length >= 1) {
      let basicComData = this._empSer.employeeData.filter((x) => {
        return x.templatename;
      });
        if (basicComData !== null) {
        this.basicComForm = this.fb.group({
          templatename: [basicComData[0].templatename],
          templatedescription: [basicComData[0].templatedescription],
          templatetype: [basicComData[0].templatetype],
          newtemplatetype: ['']
        });
      }
      localStorage.setItem('templateid', basicComData[0].templateid);
      localStorage.setItem('templateType', basicComData[0].templatetype);
    }
  }

  initForm() {
    this.basicComForm = this.fb.group({
      templatename: ['', Validators.required],
      templatedescription: ['', Validators.required],
      templatetype: ['', Validators.required],
      newtemplatetype: ['']
    });
  }

  onTemplateTypeChange(event: any) {
    if(this.stopSelectionChangeEvent == false) {
      this.addNewTemplateType = false
      let comData = this._empSer.employeeData.filter((x) => { return x.componentname });
      if (this._empSer.employeeData.length == 0) {
        localStorage.setItem('templateType', event.value)
        const val = localStorage.getItem('templateType');
        this.basicComForm.patchValue({ templatetype: val })
      }
      else if ((this._empSer.employeeData[0].templatetype !== null || undefined) && (comData.length >= 1)) {
        let answer = window.confirm('If you change the Template Type then all the components of this template will be removed !');
        if (answer) {
          this._empSer.employeeData[0].templatename = this.basicComForm.value.templatename;
          this._empSer.employeeData[0].templatedescription = this.basicComForm.value.templatedescription;
          this._empSer.employeeData[0].templatetype = event.value;
          localStorage.setItem('templateType', event.value);
          let newData = this._empSer.employeeData.filter((x) => { return !x.componentname });
          this._empSer.employeeData = []
          this._empSer.employeeData.splice(0, this._empSer.employeeData.length, ...newData);
          this._empSer.callTheOninitSubject.next('');
          this._empSer.delComDataFromTableSubject.next('');
  
          let templateid = localStorage.getItem('templateid');
          this._empSer
            .deleteEmployeeRelatedCom(templateid)
            .subscribe((res: any) => {
              if (res.status == 200) {
                this.snackBar.open(res.message, 'Cancel', {
                  duration: 3000,
                  panelClass: 'success-snackbar'
                });
              }
            });
        }
        if (answer == false) {
          const val = localStorage.getItem('templateType');
          this.basicComForm.patchValue({ templatetype: val })
        }
      }
    } else if (this.stopSelectionChangeEvent == true) {
      let templateType = localStorage.getItem('templateType')
      this.basicComForm.patchValue({templatetype: templateType})
      this.stopSelectionChangeEvent = false;
    }
  }

  onNext() {
    if(this.templateExist == true) {
      this.snackBar.open('Template name already exists. Please use a different name.','Cancel',{
        duration: 2000,
        panelClass: ['error-snackbar']
      })
    }else{
      if (this._empSer.employeeData.length <= 0) {
        this.basicComForm.value.templateid = uuidv4();
        this.basicComForm.value.stepName = 'basic';
        this.basicComForm.value.status = 1;
        this.basicComForm.value.userid = this.userId
        this._empSer.employeeData.push(this.basicComForm.value);
        localStorage.setItem('templateid', this.basicComForm.value.templateid);
        localStorage.setItem('templateType', this.basicComForm.value.templatetype);
        if (this.basicComForm.value.templatetype !== 'Based On Offer' && this.basicComForm.value.templatetype !=='Based On Total Compensation') {
          this.componentName = 'Field Name'
          this.componentType = 'Field Type'
        } else if (this.basicComForm.value.templatetype == 'Based On Offer' || this.basicComForm.value.templatetype =='Based On Total Compensation') {
          this.componentName = 'Component Name'
          this.componentType = 'Component Type'
        }
        const newTableName = {
          componentName: this.componentName,
          componentType: this.componentType
        }
        this._empSer.changeTableName.next(newTableName)
        this._empSer.callTheOninitSubject.next('');
      } else if (this._empSer.employeeData.length >= 1) {
        this._empSer.employeeData[0] = this.basicComForm.value;
        this._empSer.employeeData[0].stepName = 'basic';
        this._empSer.employeeData[0].templateid = localStorage.getItem('templateid');
        localStorage.setItem('templateType', this.basicComForm.value.templatetype);
        if (this.basicComForm.value.templatetype !== 'Based On Offer' && this.basicComForm.value.templatetype !=='Based On Total Compensation') {
          this.componentName = 'Field Name'
          this.componentType = 'Field Type'
        } else if (this.basicComForm.value.templatetype == 'Based On Offer' || this.basicComForm.value.templatetype =='Based On Total Compensation') {
          this.componentName = 'Component Name'
          this.componentType = 'Component Type'
        }
        const newTableName = {
          componentName: this.componentName,
          componentType: this.componentType
        }
        this._empSer.changeTableName.next(newTableName)
        this._empSer.callTheOninitSubject.next('');
      }
      if(this.basicComForm.dirty) {
        (<any>this._empSer.employeeData).disableButton = false;
      }
      this.nextStep.emit(true)
    }
  }

  onCancel() {
    this.page = this._empSer.templatePage;
    this.size = this._empSer.templateSize;
    this.searchedKeyword = this._empSer.templateSearchedKeyword;
    this.sortBy = this._empSer.templateSortBy;
    this._empSer.employeeData = [];
    this._empSer.getComData = [];
    localStorage.removeItem('templateid');
    localStorage.removeItem('templateType');
    this.router.navigateByUrl('/dashboard/my-templates');
  }
}
