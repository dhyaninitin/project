import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from 'src/app/shared/services/employee.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DeleteDialogComponent } from 'src/app/shared/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CustomEditorComponent } from 'src/app/shared/custom-editor/custom-editor.component';

@Component({
  selector: 'app-add-global-template',
  templateUrl: './add-global-template.component.html',
  styleUrls: ['./add-global-template.component.scss'],
})
export class AddGlobalTemplateComponent implements OnInit, AfterViewInit {
  @ViewChild(CustomEditorComponent) customEditor!: CustomEditorComponent;
  globalTemplateForm!: FormGroup;
  showNewTemplateTypeField: boolean = false;
  globalPlaceholderTypes: any[] = [];
  code: any = '';
  showUpdateBtn: boolean = false;
  globalTemplateId: string = '';
  page: number = 1;
  size: number = 5;
  sortBy: string = '';
  searchedKeyword: string = '';
  stopSelectionChangeEvent: boolean = false;
  templateExist: boolean = false;
  templateExistErrMsg = 'Template name already exists. Please use a different name.'
  userId: any;
  customEditorData: string = '';
  disableUpdateBtn = false;
  editorHasBeenEdited = false;
  htmlData: any;

  constructor(
    private fb: FormBuilder,
    private _empSer: EmployeeService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog:MatDialog,
    private _authSer: AuthService
    ){ this.getUserId() }

  ngAfterViewInit(): void {
    this.editGlobalTemplate()
    this.updateGlobalTemplate();
  }

  ngOnInit(): void {
    this.initForm();
    this.editGlobalTemplate();
    this.getGlobalPlaceholderTypes();
  }

  getCustomEditorsData (event: any){
    this.customEditorData = event
    if(this.customEditorData) {
      this.editorHasBeenEdited = true;
    }else {
      this.editorHasBeenEdited = false;
    }
    this.disableUpdateBtn = false;
  }

  getUserId() {
    if(this._authSer.userId) {
      this.userId = this._authSer.userId;
    }else{
      this._authSer.tokenDecoder(null);
      this.userId = this._authSer.userId;
    }
  }

  private updateGlobalTemplate() {
    if (this.htmlData !== null && this.customEditor) {
      this.customEditor.refreshEditor = this.htmlData.html;
    }
  }

  editGlobalTemplate() {
    this._empSer.editGlobalTemplateSubject.subscribe((x) => {
      if(x !== null) {
        if(x.isEdit == false) {
          this.showUpdateBtn = x.isEdit;
        }else if(x.isEdit == true) {
          this.showUpdateBtn = x.isEdit;
          this.globalTemplateForm.patchValue({
            templatename: x.templatename,
            description: x.description,
            templatetype: x.templatetype
          });
          this.htmlData = x;
          this.globalTemplateId = x.id;
          this.disableUpdateBtn = true;
          sessionStorage.setItem('global-template-type', x.templatetype)
        }
      }
    });
  }

  initForm() {
    this.globalTemplateForm = this.fb.group({
      templatename: ['', Validators.required],
      description: ['', Validators.required],
      templatetype: ['', Validators.required],
      newglobaltemplatetype: ['']
    });
  }

  onDeleteGlobalPlaceholderType(id: string) {
    this.stopSelectionChangeEvent = true;
    this.dialog.open(DeleteDialogComponent,{
      width: '380px',
      height: 'auto',
      disableClose: true,
      data: 'template type',
      panelClass: 'confirm-dialog-container',
    }).afterClosed().subscribe(res => {
      if(res == true) {
        this._empSer.deleteGlobalPlaceholderType(id).subscribe((res: any) => {
          if(res.status == 200) {
            this.snackBar.open(res.message, 'Cancel', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.getGlobalPlaceholderTypes();
            this.stopSelectionChangeEvent = false;
          }
        })
      }else{
        this.stopSelectionChangeEvent = false;
      }
    }) 
  }

  onTemplateTypeChange(event: any) {
    if(this.stopSelectionChangeEvent == true) {
      let type = sessionStorage.getItem('global-template-type')
      this.globalTemplateForm.patchValue({templatetype: type})
    }else{
      this.globalTemplateForm.patchValue({templatetype: event.value})
      sessionStorage.setItem('global-template-type', event.value)
    }
  }

  onAddNewType() {
    this.showNewTemplateTypeField = true;
    this.globalTemplateForm.patchValue({newglobaltemplatetype: ''})
  }

  AddNewPlaceholderType() {
    const payload = {
      templatetype: this.globalTemplateForm.value.newglobaltemplatetype
    }
    this._empSer.createNewGlobalPlaceholderType(this.userId,payload).subscribe((res: any) => {
      if(res.status == 200) {
        this.snackBar.open(res.message, 'Cancel', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.globalTemplateForm.patchValue({templatetype: this.globalTemplateForm.value.newglobaltemplatetype})
        sessionStorage.setItem('global-template-type', this.globalTemplateForm.value.newglobaltemplatetype)
        this.showNewTemplateTypeField = false;
        this.getGlobalPlaceholderTypes();
      }
    })
  }

  checkTemplateNameExist(event: any) {
    let checkTemplateName = event.target.value
    if(this.userId && checkTemplateName !== '') {
      this._empSer.hideSpinnerSubject.next([true, checkTemplateName]);
      this._empSer.checkGlobalTemplateNameExist(this.userId, checkTemplateName).subscribe((res: any) => {
        if(res.status == 200) {
          this.templateExist = false;
        }else {
          this.templateExist = true;
          this.snackBar.open(res.message,'Cancel',{
            duration:2000,
            panelClass: 'error-snackbar'
          })
        }
      })
    }
  }

  getGlobalPlaceholderTypes() {
    this._empSer.getGlobalPlaceholderTypes(this.userId).subscribe((res: any) => {
      if(res.status == 200) {
        this.globalPlaceholderTypes = [...res.userAddedPlaceholderTypes]         
      }
    })
  }

  onCancelNewPlaceholderType() {
    this.showNewTemplateTypeField = false;
  }

  onCancel() {
    this.page = this._empSer.globalTemplatePage;
    this.size = this._empSer.globalTemplateSize;
    this.searchedKeyword = this._empSer.globalTemplateSearchedKeyword;
    this.sortBy = this._empSer.globalTemplateSortBy;
    this.showUpdateBtn = false;
  }

  onSaveGlobalTemplate() {
    if(this.templateExist == false) {
      let data = this.globalTemplateForm.value;
      data.html = this.customEditorData;
      this._empSer.createGlobalTemplate(this.userId, data).subscribe((res: any) => {
        if (res.status == 200) {
          this.router.navigateByUrl('/dashboard/global-templates');
          this.snackBar.open(res.message, 'Cancel', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        }
      });
    }else{
      this.snackBar.open(this.templateExistErrMsg, 'Cancel', {
        duration: 3000,
        panelClass: ['error-snackbar']
      })
    }
  }

  onUpdateGlobalTemplate() {
    if(this.templateExist == false) {
      let id = this.globalTemplateId;
      let data = this.globalTemplateForm.value;
      data.html = this.customEditorData;
      this._empSer.updateGlobalTemplate(id, data).subscribe((res: any) => {
        if (res) {
          this.router.navigateByUrl('/dashboard/global-templates');
          this.snackBar.open(res.message, 'Cancel', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.showUpdateBtn = false;
        }
      });
    }else{
      this.snackBar.open(this.templateExistErrMsg, 'Cancel', {
        duration: 3000,
        panelClass: ['error-snackbar']
      }) 
    }
  }
}
