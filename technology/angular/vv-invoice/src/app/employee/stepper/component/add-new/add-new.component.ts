import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-new',
  templateUrl: './add-new.component.html',
  styleUrls: ['./add-new.component.scss'],
})
export class AddNewComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() toggleDrawer: EventEmitter<any> = new EventEmitter();
  @Output() enableNextBtn: EventEmitter<any> = new EventEmitter();
  @Output() getAddNewData: EventEmitter<any> = new EventEmitter();
  @Input() componentState: String = '';
  @Output() disableButton: EventEmitter<any> = new EventEmitter();
  @Input() componentNames: any[] = [];

  templateType: any;
  basedOnOfferForm!: FormGroup;
  basedOnCompensationForm!: FormGroup;
  templateid: any;
  showUpdateBtn: boolean = false;
  componentid: string = ''
  whatIsTemplateType: any;
  addedComponents: any[] = [];
  showSelectComDropdown:boolean = false;
  userId: any;
  
  constructor(
    public _empSer: EmployeeService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private _authSer:AuthService,

  ) { this.getUserId() }

  componenttype = [
    { name: 'Positive' },
    { name: 'Negative' },
    { name: 'Informative' },
  ]

  field_type = [
    {name: 'String'},
    {name: 'Number'},
    {name: 'Boolean'},
    {name: 'Datetime'},
    {name: 'HTML'},
    {name: 'Buffer'},
    {name: 'Custom Rule'},
  ]

  mathoperator = [
    { name: '==' },
    { name: '!=' },
    { name: '>' },
    { name: '<' },
    { name: '>=' },
    { name: '<=' },
    { name: '*' },
    { name: '/' },
    { name: '+' },
    { name: '-' }
  ]

  getUserId() {
    if(this._authSer.userId) {
      this.userId = this._authSer.userId;
    }else{
      this._authSer.tokenDecoder(null);
      this.userId = this._authSer.userId;
    }
  }

  ngOnInit() {
    this.initForm();
    this.initTemplateTypeData();
    this.enableSelectBtnInDropdown();
    this.addedComponents = [...this.componentNames];
  }

  enableSelectBtnInDropdown() {
    this.showSelectComDropdown = this._empSer.showSelectComDropdown
  }

  initForm() {
    this.basedOnOfferForm = this.fb.group({
      componentname: ['', Validators.required],
      componenttype: ['', Validators.required],
      customrule: [''],
      hideifzero: [0],
      selectcomponent: ['']
    });
    this.basedOnCompensationForm = this.fb.group({
      componentname: ['', Validators.required],
      componenttype: ['', Validators.required],
      mathoperator: [''],
      rule: [''],
      hideifzero: [0],
      selectcomponent: ['']
    });
  }

  change(event: any) {
    let data = this.basedOnCompensationForm.controls['rule'].value
    if (data == null) {
      data = ''
    }
    data = data + event.value
    this.basedOnCompensationForm.patchValue({
      rule: data
    })
  }

  initTemplateTypeData() {
    this.whatIsTemplateType = localStorage.getItem('templateType')
    this._empSer.callTheOninitSubject.subscribe(x => {
      this.templateType = localStorage.getItem('templateType')
      this.templateid = localStorage.getItem('templateid')
      this.basedOnCompensationForm.reset()
      this.basedOnOfferForm.reset()
      this.showUpdateBtn = false;
    })
    this._empSer.sendEditDataSubject.subscribe(data => {
      if(data) {
        let tempType = localStorage.getItem('templateType')
        if (tempType === 'Based On Offer') {
          this.basedOnOfferForm = this.fb.group({
            componentname: [data.componentname],
            componenttype: [data.componenttype],
            status: [data.status],
            hideifzero: [data.hideifzero]
          })
          this.templateType = tempType
          this.componentid = data.componentid
          this.showUpdateBtn = true;
        }
        else if (tempType === 'Based On Total Compensation') { 
          this.basedOnCompensationForm = this.fb.group({
            componentname: [data.componentname],
            componenttype: [data.componenttype],
            mathoperator: [data.mathoperator],
            rule: [data.rule],
            status: [data.status],
            hideifzero: [data.hideifzero]
          })
          this.templateType = tempType
          this.componentid = data.componentid
          this.showUpdateBtn = true;
        }
        else if(tempType != 'Based On Offer' || 'Based On Total Compensation') {
          this.basedOnOfferForm = this.fb.group({
            componentname: [data.componentname],
            componenttype: [data.componenttype],
            customrule: [data.rule],
            status: [data.status],
          })
          this.templateType = tempType
          this.componentid = data.componentid
          this.showUpdateBtn = true;
        }
      }
    })
  }

  onCancel() {
    this.toggleDrawer.emit((this.isOpen = false));
    this.basedOnOfferForm.markAsUntouched();
    this.basedOnCompensationForm.markAsUntouched();
  }

  onUpdate() {
    if (this.templateType == 'Based On Offer') {
      const objWithIdIndex = this._empSer.employeeData.findIndex((obj) => obj.componentid === this.componentid);
      this._empSer.employeeData[objWithIdIndex].componentname = this.basedOnOfferForm.value.componentname
      this._empSer.employeeData[objWithIdIndex].componenttype = this.basedOnOfferForm.value.componenttype
      this._empSer.employeeData[objWithIdIndex].status = this.basedOnOfferForm.value.status
      this._empSer.employeeData[objWithIdIndex].hideifzero = this.basedOnOfferForm.value.hideifzero == true ? 1 : 0
      this._empSer.employeeData[objWithIdIndex].createdat = new Date().toISOString()

      this.toggleDrawer.emit(this.isOpen = false)
    } 
    else if (this.templateType == 'Based On Total Compensation') {
      const objWithIdIndex = this._empSer.employeeData.findIndex((obj) => obj.componentid === this.componentid);
      this._empSer.employeeData[objWithIdIndex].componentname = this.basedOnCompensationForm.value.componentname
      this._empSer.employeeData[objWithIdIndex].componenttype = this.basedOnCompensationForm.value.componenttype
      this._empSer.employeeData[objWithIdIndex].mathoperator = this.basedOnCompensationForm.value.mathoperator
      this._empSer.employeeData[objWithIdIndex].rule = this.basedOnCompensationForm.value.rule
      this._empSer.employeeData[objWithIdIndex].status = this.basedOnCompensationForm.value.status
      this._empSer.employeeData[objWithIdIndex].hideifzero = this.basedOnCompensationForm.value.hideifzero == true ? 1 : 0
      this._empSer.employeeData[objWithIdIndex].createdat = new Date().toISOString()

      this.toggleDrawer.emit(this.isOpen = false)
    }
    else if(this.templateType != 'Based On Offer' || 'Based On Total Compensation') {
      const objWithIdIndex = this._empSer.employeeData.findIndex((obj) => obj.componentid === this.componentid);
      this._empSer.employeeData[objWithIdIndex].componentname = this.basedOnOfferForm.value.componentname
      this._empSer.employeeData[objWithIdIndex].componenttype = this.basedOnOfferForm.value.componenttype
      this._empSer.employeeData[objWithIdIndex].status = this.basedOnOfferForm.value.status
      this._empSer.employeeData[objWithIdIndex].rule = this.basedOnOfferForm.value.customrule
      this._empSer.employeeData[objWithIdIndex].createdat = new Date().toISOString()

      this.toggleDrawer.emit(this.isOpen = false)
    }
    this.initForm();
    this.disableButton.emit(false);
    this._empSer.callTheOninitSubject.next(this._empSer.employeeData)
  }

  onSave() {
    if (this.templateType == 'Based On Offer') {
      this.basedOnOfferForm.markAllAsTouched();
      if (this.basedOnOfferForm.valid) {
        let employeeComponenetDataObj = {
          userid: this.userId,
          templateid: this.templateid,
          componentid: uuidv4(),
          stepName: 'component',
          componentname: this.basedOnOfferForm.value.componentname,
          componenttype: this.basedOnOfferForm.value.componenttype,
          hideifzero: this.basedOnOfferForm.value.hideifzero == null ? 0 : 1,
          status: 1
        }
        this._empSer.employeeData.push(employeeComponenetDataObj)
        this.getAddNewData.emit(employeeComponenetDataObj)
        this.basedOnOfferForm.reset();
        this.toggleDrawer.emit((this.isOpen = false));
        this._empSer.callTheOninitSubject.next('')
      } else {
        this.snackbar.open('Please fill the required fields', 'Cancel', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    }
    else if (this.templateType == 'Based On Total Compensation') {
      this.basedOnCompensationForm.markAllAsTouched();
      if (this.basedOnCompensationForm.valid) {
        let employeeComponenetDataObj = {
          userid: this.userId,
          templateid: this.templateid,
          componentid: uuidv4(),
          stepName: 'component',
          componentname: this.basedOnCompensationForm.value.componentname,
          componenttype: this.basedOnCompensationForm.value.componenttype,
          mathoperator: this.basedOnCompensationForm.value.mathoperator,
          rule: this.basedOnCompensationForm.value.rule,
          hideifzero: this.basedOnCompensationForm.value.hideifzero == null ? 0 : 1,
          status: 1
        }
        this._empSer.employeeData.push(employeeComponenetDataObj)
        this.getAddNewData.emit(employeeComponenetDataObj)
        this.basedOnCompensationForm.reset();
        this.toggleDrawer.emit((this.isOpen = false));
        this._empSer.callTheOninitSubject.next('');
      } else {
        this.snackbar.open('Please fill the required fields', 'Cancel', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    }
    else if(this.templateType != 'Based On Offer' || 'Based On Total Compensation') {
      this.basedOnOfferForm.markAllAsTouched();
      if (this.basedOnOfferForm.valid) {
        let employeeComponenetDataObj = {
          userid: this.userId,
          templateid: this.templateid,
          componentid: uuidv4(),
          stepName: 'component',
          rule: this.basedOnOfferForm.value.customrule,
          componentname: this.basedOnOfferForm.value.componentname,
          componenttype: this.basedOnOfferForm.value.componenttype,
          status: 1
        }
        this._empSer.employeeData.push(employeeComponenetDataObj)
        this.getAddNewData.emit(employeeComponenetDataObj)
        this.basedOnOfferForm.reset();
        this.toggleDrawer.emit((this.isOpen = false));
        this._empSer.callTheOninitSubject.next('');
      } else {
        this.snackbar.open('Please fill the required fields', 'Cancel', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    }
    if(this._empSer.employeeData) {
      let data = this._empSer.employeeData.filter(x => x.componentid)
      if(data.length >= 1) {
        this.showSelectComDropdown = true
        this._empSer.showSelectComDropdown = true
      }else {
        this.showSelectComDropdown = false;
        this._empSer.showSelectComDropdown = false
      }
    }
    this.disableButton.emit(false);
  }

  onSelectComponent(event: any) {
    let templateType = localStorage.getItem("templateType");
    let value = event.value.replace(/\s/g, '');
    let patchValue = value.toLowerCase();
  
    if (templateType === 'Based On Total Compensation') {
      let data = this.basedOnCompensationForm.controls['rule'].value
      if (data == null) {
        data = ''
       }
       data = data + patchValue
      this.basedOnCompensationForm?.patchValue({
        rule: data
      });
      this.basedOnCompensationForm?.patchValue({
        selectcomponent: ''
      });
    } else {
      let data = this.basedOnOfferForm.controls['customrule'].value
      if (data == null) {
        data = ''
       }
       data = data + patchValue
      this.basedOnOfferForm?.patchValue({
        customrule: data
      });
      this.basedOnOfferForm?.patchValue({
        selectcomponent: ''
      });
    }
  }
}
