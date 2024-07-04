import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatDrawer } from "@angular/material/sidenav";
import { LibraryService } from "../shared/services/library.service";

@Component({
  selector: "app-config-textbox",
  templateUrl: "./config-textbox.component.html",
  styleUrls: ["./config-textbox.component.scss"],
})
export class ConfigTextboxComponent implements OnInit {
  Case1!: FormGroup
  configText: boolean = false;
  @Input() isOpen: boolean = false;
  @Input() showLayout: string = '';
  @Output() loadAppCustom = new EventEmitter<boolean>();
  @Output() onSave:EventEmitter<any> = new EventEmitter() 
  @ViewChild(MatDrawer, { static: false }) drawer!: MatDrawer;



  constructor(
    private formBuilder:FormBuilder,
    public dialog: MatDialog,
    private libraryServ: LibraryService,
  ) {
    this.initForm();
  }

  ngOnInit(): void {}

  initForm() {
    console.log(this.showLayout)
    this.Case1 = this.formBuilder.group({
        placeholdertext: ['',[Validators.required]],
        errormessage: ['',[Validators.required]],
        fieldlength: ['',[Validators.required,Validators.maxLength(50)]],
        datatype: ['',[Validators.required]]
    })
  }

  get placeholdertext(): AbstractControl {
    return this.Case1.get('placeholdertext') as FormControl;
  }
  get errormessage(): AbstractControl {
    return this.Case1.get('errormessage') as FormControl;
  }
    get fieldlength(): AbstractControl {
    return this.Case1.get('fieldlength') as FormControl;
  } 
  get datatype(): AbstractControl {
    return this.Case1.get('datatype') as FormControl;
  }
  
  onUpdate() {
    this.Case1.markAllAsTouched()
    if(this.Case1.valid){
      const {value} = this.Case1
      const payload = {
        placeholdertext: value.placeholdertext,
        errormessage: value.errormessage,
        fieldlength: value.fieldlength,
        datatype: value.datatype
      }
      this.loadAppCustom.emit(true);
      this.onSave.emit(payload) 
     console.log(payload)
     }
  }

  onCancel() {
    this.loadAppCustom.emit(true);
  }
}

