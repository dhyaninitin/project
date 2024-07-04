import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatDrawer } from "@angular/material/sidenav";
import { AddCustomComponent } from "../add-custom/add-custom.component";
import { LibraryService } from "../shared/services/library.service";
@Component({
  selector: "app-config-dropdown",
  templateUrl: "./config-dropdown.component.html",
  styleUrls: ["./config-dropdown.component.scss"],
})
export class ConfigDropdownComponent implements OnInit {
  userForm: any;
  Case1!: FormGroup;
  Case3!: FormGroup;
  configDropdown: boolean = false;
  configText: boolean = false;
  currentLimit: number = 5;
  currentPage: number = 1;

  @Input() isOpen: boolean = false;
  @Input() showLayout: string = "";
  @Input() showLayout2: string = "";
  @Input() masterValues: any;
  @Output() onSave: EventEmitter<any> = new EventEmitter();
  @ViewChild(MatDrawer, { static: false }) drawer!: MatDrawer;
  @Output() loadAppCustom = new EventEmitter<boolean>();

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog) {
    this.InitializeFormCase2();
  }

  ngOnInit(): void {
    if (this.masterValues !== undefined) {
      this.InitializeFormCase3();
      let configurationForDropDown = this.masterValues.configuration;
      this.Case3.patchValue(configurationForDropDown);
    }
  }

  InitializeFormCase2() {
    this.buildForm();
    this.addUser();
  }

  InitializeFormCase3() {
    this.Case3 = this.formBuilder.group({
      parentValueField1: [""],
      parentValueField2: [""],
      parentValueField3: [""],
      parentValueField4: [""],
      masterValueField1: [""],
      masterValueField2: [""],
      masterValueField3: [""],
      masterValueField4: [""],
    });
  }
  onCancel() {
    this.loadAppCustom.emit(true);
  }

  onUpdate() {
    if (this.userForm.value != null) {
      const { value } = this.userForm;
      let arr: any = []
      value.users.map((formValue: any, i:number) => {
          arr.push({
            ["masterValueField"+(i+1)] : formValue
          })
      })
      const payload = arr.reduce(((r:any, c:any) => Object.assign(r, c)), {})
      this.loadAppCustom.emit(true);
      this.onSave.emit(payload);
    }
    if (this.Case3.value != null) {
      const { value } = this.Case3;
      const payload = {
        parentValueField1: value.parentValueField1,
        parentValueField2: value.parentValueField2,
        parentValueField3: value.parentValueField3,
        parentValueField4: value.parentValueField4,
        masterValueField1: value.masterValueField1,
        masterValueField2: value.masterValueField2,
        masterValueField3: value.masterValueField3,
        masterValueField4: value.masterValueField4,
      };
      this.loadAppCustom.emit(true);
      this.onSave.emit(payload);
    }
  }

  buildForm() {
    this.userForm = new FormGroup({
      users: new FormArray([]),
    });
  }
  dropIndex: number = 0
  addUser() {
    const add = this.userForm.get("users") as FormArray;
    add.push(new FormControl(""));
  }

  removeUser(i: any) {
    const remove = this.userForm.get("users") as FormArray;
    remove.removeAt(i);
  }
}
