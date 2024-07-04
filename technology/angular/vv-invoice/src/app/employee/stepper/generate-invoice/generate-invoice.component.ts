import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { MatDialog } from '@angular/material/dialog';
import { LibraryComponent } from '../../library/library.component';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CustomEditorComponent } from 'src/app/shared/custom-editor/custom-editor.component';

@Component({
  selector: 'app-generate-invoice',
  templateUrl: './generate-invoice.component.html',
  styleUrls: ['./generate-invoice.component.scss'],
})
export class GenerateInvoiceComponent implements OnInit {
  @ViewChild(CustomEditorComponent) customEditor! :CustomEditorComponent
  dropdownForm!: FormGroup;
  globalTemplateValue: string = '';
  placeholderValue: string = '';
  showUpdateBtn: boolean = false;
  templateData: any[] = [];
  EmployeehtmlText: any;
  componentData: any;
  code: any = '';
  disableButton: boolean = true;
  removeComponentFromEditor: any = [];
  userId: any;
  userEmail: any;
  selectedImage: any;
  imageToBase64: any = '';
  customEditorData: string = '';
  editorHasBeenEdited = false;

  total = 100;
  limit = 8;
  offset = 0;
  page = 1;
  options = new BehaviorSubject<any[]>([]);
  options$ = this.options.asObservable();
  isComplete$ = new BehaviorSubject<any>(false);

  constructor(
    private snackBar: MatSnackBar,
    private _empSer: EmployeeService,
    private router: Router,
    private fb: FormBuilder,
    private _authSer: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getUserDetails();
    this.initiateForm();
    this.getGlobalTemplates();
    this.getComponentsInDropdown();
    this.onBtnChange();
    this.checkButtonToEnable();
    this.refreshAddedComponentsArray();
  }

  getCustomEditorsData (event: any){
    this.customEditorData = event
    if(this.customEditorData) {
      this.editorHasBeenEdited = true;
    }else {
      this.editorHasBeenEdited = false;
    }
    this.disableButton = false;
  }

  getUserDetails() {
    if (this._authSer.userId && this._authSer.userEmail) {
      this.userId = this._authSer.userId;
      this.userEmail = this._authSer.userEmail;
    } else {
      this._authSer.tokenDecoder(null);
      this.userId = this._authSer.userId;
      this.userEmail = this._authSer.userEmail;
    }
  }

  refreshAddedComponentsArray() {
    this._empSer.removeComponentFromEditorSubject.subscribe((x) => {
      if (x !== null) {
        this.removeComponentFromEditor = x;
        let comName = this.removeComponentFromEditor.componentname;
        let lowerCaseVal = comName.toLowerCase();
        let removeSpaces = lowerCaseVal.replace(/\s/g, '');
        let finalName = '{{' + removeSpaces + '}}';
        this.customEditorData = this.customEditorData?.split(finalName)?.join('');
        this.customEditor.refreshEditor = this.customEditorData
      }
    });
  }

  checkButtonToEnable() {
    this._empSer.callTheOninitSubject.subscribe((x) => {
      this.disableButton = (<any>this._empSer.employeeData).disableButton;
      if (this.disableButton == undefined) {
        this.disableButton = true;
      }
    });
  }

  initiateForm() {
    this.dropdownForm = this.fb.group({
      select_global_template: [''],
      select_component: [''],
    });
  }

  browseTemplates() {
    const dialogRef = this.dialog.open(LibraryComponent, {
      width: '1100px',
      height: '650px',
      disableClose: true,
      data: {
        showCloseBtn: true,
        insert_padding: true,
      },
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.customEditor.refreshEditor = data
      }
    });
  }

  getComponentsInDropdown() {
    this._empSer.callTheOninitSubject.subscribe((x) => {
      let componentName = this._empSer.employeeData.filter((x) => {
        return x.componentid;
      });
      this.componentData = componentName.map((el: any) => {
        return el.componentname
          .split(' ')
          .join('_')
          .split('_')
          .join('')
          .toLowerCase();
      });
    });
  }

  getGlobalTemplates() {
    this._empSer
      .getGlobalTemplatesWhileScroll(this.userId, this.page, this.limit)
      .subscribe(
        (res: any) => {
          if (res && res.globalTemplatesData.length > 0) {
            this.options.next([
              ...this.options.getValue(),
              ...res.globalTemplatesData,
            ]);
            this.page++;
            this.offset += this.limit;
          } else {
            this.isComplete$.next(true);
          }
        },
        () => {
          this.isComplete$.next(true);
        }
      );
  }

  getNextBatch() {
    if (this.isComplete$.getValue()) {
      return;
    }
    this.getGlobalTemplates();
  }

  selectGlobalTemplate(event: any) {
    let valueString = event.value;
    this.globalTemplateValue = valueString
    this.customEditor.updateGlobalTemplateValue = this.globalTemplateValue;
    this.dropdownForm.patchValue({ select_global_template: '' });
  }

  placeholderChange(event: any) {
    const appendData = '{{' + event.value + '}}';
    this.placeholderValue = appendData
    this.customEditor.updatePlaceholderValue = this.placeholderValue;
    this.dropdownForm.patchValue({ select_component: '' });
  }

  onBtnChange() {
    this._empSer.changeSaveBtnToUpdate.subscribe((x) => {
      this.showUpdateBtn = x.updateBtn;
    });
  }

  onSaveTemplate() {
    if (this.customEditorData.length > 0) {
      let data = {
        templateData: this._empSer.employeeData,
        editorData: {
          userid: this.userId,
          templateid: localStorage.getItem('templateid'),
          templatetype: 'custom',
          category: 'User Created Templates',
          html: this.customEditorData,
          created_by: this.userEmail,
        },
      };
      this._empSer
        .createEmployeeTemplate(this.userId, data)
        .subscribe((res: any) => {
          if (res.status == 200) {
            this.router.navigateByUrl('/dashboard/my-templates');
            this._empSer.employeeData = [];
            this._empSer.getComData = [];
            localStorage.removeItem('templateid');
            localStorage.removeItem('templateType');
            this.snackBar.open(res.message, 'Cancel', {
              duration: 3000,
              panelClass: 'success-snackbar',
            });
          }
        });
    } else {
      this.snackBar.open('Editor cannot be empty', 'Cancel', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  onUpdateTemplate() {
    if (this.customEditorData.length > 0) {
      let data = {
        templateData: this._empSer.employeeData,
        editorData: {
          templateid: localStorage.getItem('templateid'),
          templatetype: 'custom',
          category: 'user-created-template',
          html: this.customEditorData,
          created_by: this.userEmail,
        },
      };
      this._empSer
        .updateEmployeeTemplate(localStorage.getItem('templateid'), data)
        .subscribe((res: any) => {
          if (res.status == 200) {
            this.router.navigateByUrl('/dashboard/my-templates');
            this._empSer.employeeData = [];
            this._empSer.getComData = [];
            this.snackBar.open(res.message, 'Cancel', {
              duration: 3000,
              panelClass: 'success-snackbar',
            });
          }
        });
    } else {
      this.snackBar.open('Editor cannot be empty', 'Cancel', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }
}
