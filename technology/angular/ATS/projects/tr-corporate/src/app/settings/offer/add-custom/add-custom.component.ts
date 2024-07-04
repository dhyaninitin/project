import { T } from "@angular/cdk/keycodes";
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDrawer } from "@angular/material/sidenav";
import { BehaviorSubject } from "rxjs";
import { DesignService } from "../../../utility/services/design.service";
import { SnackBarService } from "../../../utility/services/snack-bar.service";
import { Get_CustomFields_Response, Post_CustomFields } from "../shared/interfaces/custom-fields";
import { LibraryService } from "../shared/services/library.service";
import { TemplateListService } from "../shared/services/template-list.service";

@Component({
  selector: "app-add-custom",
  templateUrl: "./add-custom.component.html",
  styleUrls: ["./add-custom.component.scss"],
})
export class AddCustomComponent implements OnInit {
  templateList: any = [];
  isMandatory: boolean = false
  configurationList: any = [
    { placeholdertext: '' },
    { errormessage: ' ' },
    { fieldlength: '' },
    { datatype: ' ' }
  ]

  @Input() isOpen: boolean = false;
  @Input() customFields: any;
  @Output() loadCustomFields = new EventEmitter<boolean>();
  @ViewChild(MatDrawer, { static: false }) drawer!: MatDrawer;
  addCustomFields!: FormGroup
  currentLimit: number = 5;
  currentPage: number = 1;
  caseTitle: string = '';
  caseTitle2: string = '';
  data: any;
  configDropdown: boolean = false;
  configText: boolean = false;
  masterDropDownValues: any;

  constructor
    (
      public designService: DesignService,
      private fb: FormBuilder,
      private snackBar: SnackBarService,
      private libraryServ: LibraryService
    ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.customFields = this.customFields.filter((field:any)=>{
      return field.fieldtype !== 'Date-Picker';
    });
    this.libraryServ.templatesList.subscribe(res => {
      this.templateList = res;
    })
  }

  configure() {
    this.caseTitle = this.addCustomFields.controls.fieldtype.value;
    this.caseTitle2 = this.addCustomFields.controls.parentid.value;
    if (this.addCustomFields.controls.fieldtype.value == 'Text-Box') {
      this.drawer.open();
      this.configDropdown = false;
      this.configText = true;
      this.caseTitle = this.addCustomFields.controls.fieldtype.value;
    }
    else if (this.addCustomFields.controls.fieldtype.value == 'Drop-Down' && !this.addCustomFields.controls.parentid.value) {
      this.drawer.open();
      this.configDropdown = true;
      this.configText = false;
      this.caseTitle = this.addCustomFields.controls.fieldtype.value;
    }
    else if (this.addCustomFields.controls.fieldtype.value == 'Drop-Down' && this.addCustomFields.controls.parentid.value.length > 0) {
      this.drawer.open();
      this.configDropdown = true;
      this.configText = false;
      this.caseTitle = this.addCustomFields.controls.fieldtype.value;
      this.caseTitle2 = this.addCustomFields.controls.parentid.value;
    }
  }

  toggleSideMenu() {
    this.designService.setDrawerOpen(false);
  }

  initForm() {    
    this.addCustomFields = this.fb.group({
      fieldname: ['', [
        Validators.required
      ]],
      offertemplateid: ['', [
        Validators.required
      ]],
      fieldtype: ['', [
        Validators.required
      ]],
      parentid: [''],
      helptext: [''],
      configuration: [''],
      ismandatory: 0,
      isactive: 0,
    })
    // this.addCustomFields.get('ismandatory')?.valueChanges.subscribe((value) => {
    //   if (value) {
    //     this.addCustomFields.get('fieldname')?.setValidators(Validators.required)
    //     this.addCustomFields.get('fieldname')?.updateValueAndValidity();
    //     this.addCustomFields.get('offertemplateid')?.setValidators(Validators.required)
    //     this.addCustomFields.get('offertemplateid')?.updateValueAndValidity();
    //     this.addCustomFields.get('fieldtype')?.setValidators(Validators.required)
    //     this.addCustomFields.get('fieldtype')?.updateValueAndValidity();
    //     this.addCustomFields.markAllAsTouched();
    //     this.addCustomFields.markAsDirty();
    //   } else{
    //     this.addCustomFields.get('fieldname')?.clearValidators();
    //     this.addCustomFields.get('fieldname')?.updateValueAndValidity();
    //     this.addCustomFields.get('offertemplateid')?.clearValidators();
    //     this.addCustomFields.get('offertemplateid')?.updateValueAndValidity();
    //     this.addCustomFields.get('fieldtype')?.clearValidators();
    //     this.addCustomFields.get('fieldtype')?.updateValueAndValidity();
    //     this.addCustomFields.markAsUntouched();
    //   }
    // })
    // this.addCustomFields.get('fieldname')?.clearValidators();
    // this.addCustomFields.get('fieldname')?.updateValueAndValidity();
    // this.addCustomFields.get('offertemplateid')?.clearValidators();
    // this.addCustomFields.get('offertemplateid')?.updateValueAndValidity();
    // this.addCustomFields.get('fieldtype')?.clearValidators();
    // this.addCustomFields.get('fieldtype')?.updateValueAndValidity();
    // this.addCustomFields.markAsUntouched();
  }

  get fieldname(): AbstractControl {
    return this.addCustomFields.get('fieldname') as FormControl;
  }
  get offertemplateid(): AbstractControl {
    return this.addCustomFields.get('offertemplateid') as FormControl;
  }
  get fieldtype(): AbstractControl {
    return this.addCustomFields.get('fieldtype') as FormControl;
  }
  get ismandatory(): AbstractControl {
    return this.addCustomFields.get('ismandatory') as FormControl;
  }

  getConfigurationValues(data: any) {
    this.configDropdown = false;
    this.data = data
    this.drawer.close();
  }

  getConfigureMasterValues(data: any) {
    if(data.fieldtype == 'Drop-Down'){
      this.masterDropDownValues = data;
    } else {
      this.masterDropDownValues = undefined
    }
  }

  onCancel() {
    this.loadCustomFields.emit(false);
  }


  onSave() {    
      this.addCustomFields.markAllAsTouched();
      const { value } = this.addCustomFields
      const payload = {
        offertemplateid: value.offertemplateid,
        fieldname: value.fieldname,
        fieldtype: value.fieldtype,
        parentid: value.parentid,
        helptext: value.helptext,
        ismandatory: value.ismandatory ? 1 : 0,
        isactive: value.isactive ? 1 : 0,
        configuration: this.data == undefined ? {} : this.data
      }
      this.libraryServ.createCustomFields(payload).subscribe(res => {
        if (res.error) {
          this.snackBar.open(res.message)
        } else {
          this.snackBar.open(res.message)
          this.loadCustomFields.emit(true);
        }
      });
  }
}
