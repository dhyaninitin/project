import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationConstants } from '../../../utility/configs/app.constants';
import { SnackBarService } from '../../../utility/services/snack-bar.service';
import { TemplateService } from '../shared/services/template.service';
import { v1 as uuidv1 } from 'uuid';
import { TEMPLATE_TYPE } from '../shared/enums/enums';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-add-component',
  templateUrl: './add-component.component.html',
  styleUrls: ['./add-component.component.scss'],
})
export class AddComponentComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() componentDetail: any;
  @Output() getAllComponents = new EventEmitter<boolean>();
  @ViewChild("dialogRefs") dialogRefs!: TemplateRef<any>;
  @Input() componentsToSelect: any;
  createComponent!: FormGroup;
  showUpdate: boolean = false;
  offercomponentid : string ='';
  onTemplateType:boolean = true;
  showAdvanceEditor: boolean = true;
  isCodeError: boolean = false;
  codeResult  = '';
  editorOptions = {theme: 'vs-dark', language: 'javascript', automaticLayout: true};

  constructor(
    private fb: FormBuilder,
    private templateService: TemplateService,
    private snackBar: SnackBarService,
    public dialog: MatDialog,
  ) {
    this.initialize();
  }
  ngOnDestroy(): void {
    this.componentDetail = null
    this.showUpdate = false;
    this.createComponent.reset();
  }

  ngOnInit(): void {
    this.templateService.firstForm.subscribe(res=> {
      const arr = Object.values(res);
      this.onTemplateType = arr[4] == TEMPLATE_TYPE.BASED_ON_OFFER ? false : true;  
    })
    if(this.componentDetail) {
      this.offercomponentid = this.componentDetail.offercomponentid;
      this.componentDetail.hideifzero = (this.componentDetail.hideifzero == 1) ? true: false;
      if(this.onTemplateType) {
         const payload = {
          fieldname: this.componentDetail.fieldname,
          hideifzero: this.componentDetail.hideifzero,
          componenttype: this.componentDetail.componenttype,
          selectedcomponent: this.componentDetail.selectedcomponent,
          mathfunction: this.componentDetail.mathfunction,
          operator: this.componentDetail.operator,
          rule: this.componentDetail.rule,
        }
        this.createComponent.setValue(payload);
      } else {
        this.createComponent.patchValue({
          fieldname: this.componentDetail.fieldname,
          hideifzero: this.componentDetail.hideifzero,
          componenttype: this.componentDetail.componenttype,
        });
      }
      this.showUpdate = true;
      this.filterComponents(true);
    } else {
      this.createComponent.reset();
      this.showUpdate = false;
      this.filterComponents(false);
    }
  }


  filterComponents(isEdit: boolean) {
    if(isEdit) {
      this.componentsToSelect = this.componentsToSelect.filter( (comp: any) => {
        return comp.offercomponentid !== this.componentDetail.offercomponentid;
      })
    }
  }


  initialize() {
    // Form initialization
    this.createComponent = this.fb.group({
      fieldname: [
        '',
        [
          Validators.required,
          Validators.minLength(ValidationConstants.userAccountStrategy.NAME_MIN_LENGTH),
          Validators.maxLength(ValidationConstants.userAccountStrategy.NAME_MAX_LENGTH)
        ],
      ],
      hideifzero: [false],
      componenttype: ['', [Validators.required]],
      selectedcomponent: [''],
      mathfunction: [''],
      operator: [''],
      rule: [''],
    });
  }

  get fieldname(): AbstractControl {
    return this.createComponent.get('fieldname') as FormControl;
  }
  get hideifzero(): AbstractControl {
    return this.createComponent.get('hideifzero') as FormControl;
  }

  get componenttype(): AbstractControl {
    return this.createComponent.get('componenttype') as FormControl;
  }
  get selectedcomponent(): AbstractControl {
    return this.createComponent.get('selectedcomponent') as FormControl;
  }
  get mathfunction(): AbstractControl {
    return this.createComponent.get('mathfunction') as FormControl;
  }
  get operator(): AbstractControl {
    return this.createComponent.get('operator') as FormControl;
  }
  get rule(): AbstractControl {
    return this.createComponent.get('rule') as FormControl;
  }

  closeDrawer() {
    this.createComponent.controls['fieldname'].setErrors(null);
    this.createComponent.controls['componenttype'].setErrors(null);
    this.createComponent.controls['selectedcomponent'].setErrors(null);
    this.createComponent.controls['mathfunction'].setErrors(null);
    this.createComponent.controls['operator'].setErrors(null);
    this.createComponent.controls['rule'].setErrors(null);
    this.getAllComponents.emit(false);
  }

  addComponent() {
    if(this.onTemplateType) {
      if(this.createComponent.status === "VALID") {
        const { value } = this.createComponent;
        value.hideifzero = (value.hideifzero == true) ? 1 : 0;
        if(this.templateService.uploadedExcelObject.length > 0) {
          value['codeEditor'] = 1;
        } else {
          value['codeEditor'] = 0;
        }
        value['offertemplateid'] = localStorage.getItem('templateid');
        value['ruleadded'] = value.rule ? 1 : 0;
        this.addorupdate(value);
      } else {
        this.snackBar.open("Please fill all the details");
      }
    } else {
      const { value } = this.createComponent
      if(value.fieldname && value.componenttype){
        value['offertemplateid'] = localStorage.getItem('templateid');
        const payload = {
          offertemplateid: value.offertemplateid,
          fieldname : value.fieldname,
          componenttype: value.componenttype,
          hideifzero: (value.hideifzero == true) ? 1 : 0
        }
        this.addorupdate(payload);
      } else {
        this.snackBar.open("Please fill all the details");
      }
    }
  }

  addorupdate(value: any) {
    if(!this.showUpdate) {
      value.offercomponentid = uuidv1();
      this.templateService.createComponentsByTempId(value).subscribe( res => {
        if(res.error){
          this.snackBar.open(res.message);
        } else {
          this.createComponent.reset();
          this.snackBar.open(res.message);
          this.getAllComponents.emit(true);
        }
      });
    } else {
      value['offercomponentid'] = this.offercomponentid;
      this.templateService.updateComponentsById(value).subscribe( res => {
        if(res.error){
          this.snackBar.open(res.message);
        } else {
          this.createComponent.reset();
          this.snackBar.open(res.message);
          this.getAllComponents.emit(true);
        }
      });
    }
  }

  previousSelectedComp = '';

  addSelectedComp(event: any) {
    if(!this.showAdvanceEditor) {
    let rule = this.createComponent.controls['rule'].value || '';
    rule = rule.replace(this.previousSelectedComp, "");
    let selectedcomponent = this.createComponent.controls['selectedcomponent'].value;
    this.previousSelectedComp = selectedcomponent;
    rule = rule + ' ' + selectedcomponent;
    this.createComponent.controls['rule'].patchValue(rule);
    } else {
      let addParentComp = this.componentsToSelect.filter( (comp: any) => {
        return comp.fieldname.toLowerCase() == event.value.toLowerCase();
      });
      if(addParentComp.length > 0) {
        this.addParentComponentsFunc(addParentComp[0].rule);
      }
    }
  }

  previousOperator = ''
  
  addOperator(event: any) {
    let rule = this.createComponent.controls['rule'].value || '';
    rule = rule.replace(this.previousOperator, "");
    let operator = this.createComponent.controls['operator'].value;
    this.previousOperator = operator;
    rule = rule + ' ' + operator;
    this.createComponent.controls['rule'].patchValue(rule);
  }

  previousMathFunction = ''

  addMathFunction(event: any) {
    let rule = this.createComponent.controls['rule'].value || '';
    rule = rule.replace(this.previousMathFunction, "");
    let mathFunction = this.createComponent.controls['mathfunction'].value;
    this.previousMathFunction = mathFunction;
    rule = rule + ' ' + mathFunction;
    this.createComponent.controls['rule'].patchValue(rule);
  }

  onCodeChanged() {
    let code = this.createComponent.controls['rule'].value;
    try {
      if(this.templateService.uploadedExcelObject.length > 0) {
      let filteredData =  this.templateService.uploadedExcelObject;
      let customFields = [ { 'State' : 'Gujrat' },{ 'Skill_Type' : 'Unskilled' } ]  // Need to remove this line
        customFields.map((object: any)=>{
          let keyName = Object.keys(object);
          filteredData = filteredData.filter((col:any) => {
            if(col[keyName[0]].toLowerCase() == object[keyName[0]].toLowerCase()){
              return col;
            }
          });
        });
      filteredData.map((val: any)=> {
        let keyName = Object.keys(val);
        keyName.map((key:any)=> {
          let changedVal: any = '' || 0;
          if(typeof val[key] == 'string') {
            changedVal = '"'+val[key]+'"';
          } else {
            changedVal = val[key];
          }
          code = this.replaceAll(code, '##'+key+'##', changedVal);
        })
      });
      }
      this.isCodeError = false;
      this.codeResult = eval(code);
    } catch(e) {
      this.isCodeError = true;
      this.codeResult = "Something is wrong!";
    }
  }

  replaceAll(str: string, find: string, replace: string) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  addParentComponentsFunc(value: string) {
    let previousRuleCode = this.createComponent.controls['rule'].value;
    let newRuleCode = previousRuleCode +'\n'+ value;
    this.createComponent.patchValue({ rule: newRuleCode });
  }

  openEditorPopup() {
    const myTempDialog = this.dialog.open(this.dialogRefs, {
      data: '',
      height: '85vh',
      width: '80vw'
    });

    myTempDialog.afterClosed().subscribe(result => {
      let value = this.createComponent.controls['rule'].value;
      this.createComponent.patchValue({rule: value})
    });
  }
}