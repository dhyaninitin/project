import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AppState } from 'app/store/';
import * as actions from 'app/store/email-templates/email-templates.actions';
import { initialState } from "app/store/email-templates/email-templates.states";
import * as commonModels from 'app/shared/models/common.model';

@Component({
  selector: 'app-email-template-modal',
  templateUrl: './email-template-modal.component.html',
  styleUrls: ['./email-template-modal.component.css']
})
export class EmailTemplateModalComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  public filter: commonModels.Filter = initialState.filter;
  public emailTemplateForm: FormGroup;
  emailSenderList: Array<{}> = [
    { id: 1001, value: 'Carblip' },
    { id: 1002, value: 'Contact owner' },
  ];

  propertyValue: any = [];
  filteredProperties: any = [];
  public loadingProperty: boolean = true;
  propertyFilterCtrl: FormControl = new FormControl();
  messageValue: any;
  emailBody: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private service$: WorkflowService,
    public dialogRef: MatDialogRef<EmailTemplateModalComponent>,
    private loader$: AppLoaderService,
    private store$: Store<AppState>,
  ) { }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.getProperty();
    this.initform();

    if (this.data.isEdit) {
      const editEmailTemplate = this.data.data;
      this.emailTemplateForm.patchValue({
        title: editEmailTemplate.title,
        subject: editEmailTemplate.subject,
        body: editEmailTemplate.body,
      });
    }
  }

  initform() {
    this.emailTemplateForm = this.fb.group({
      title: ['', Validators.required],
      subject: ['', Validators.required],
      properties: [''],
      body: ['', Validators.required],
    });
    this.emailTemplateForm.get('properties').disable();
  }


  saveTemplateMessage() {
    const payload = this.emailTemplateForm.value;
    if(!this.data.isEdit) {
      this.service$.storeEmailTemplate(payload).subscribe((res: any) => {
        if (res) {
          this.loader$.close();
          this.dialogRef.close(true);
          this.loadData();
        }
      });
    } else {
      this.service$.updateEmailTemplate(payload, this.data.data.id).subscribe((res: any) => {
        if (res) {
          this.loader$.close();
          this.dialogRef.close(true);
          this.loadData();
        }
      });
    }
  }

  loadData() {
    var per_page_limit = localStorage.getItem('email_template_module_limit');
    var selected_order_dir = localStorage.getItem('email_template_module_order_dir');
    var selected_order_by = localStorage.getItem('email_template_module_order_by');
    var selected_page_no = localStorage.getItem('email_template_module_page_count');
    var search_keyword = localStorage.getItem('email_template_module_search_keyword');
    // Clone filter values
    this.filter = {...this.filter};
       //check base on previous select item
      {
      if(per_page_limit != undefined && per_page_limit != null){
        this.filter.per_page = Number(per_page_limit);
      }else{
        this.filter.per_page = 20;
      }
    
      if(selected_order_by != undefined && selected_order_by != null && selected_order_by != "" && selected_order_dir != undefined && selected_order_dir != null && selected_order_dir != ""){
        this.filter.order_dir = selected_order_dir;
        this.filter.order_by = selected_order_by;
      }else{
        this.filter.order_dir = "desc";
        this.filter.order_by = "created_at";
      }

      if(selected_page_no != undefined && selected_page_no != null){
        this.filter.page = Number(selected_page_no);
      }else{
        this.filter.page = 1;
      }

      if(search_keyword != undefined && search_keyword != null){
        this.filter.search = search_keyword;
      } else{
        this.filter.search = "";
      }
    }
    this.store$.dispatch(new actions.GetList(this.filter));
  }

  getProperty() {
    this.service$.getpropertyColumns().subscribe((res: any) => {
      if (res) {
        this.propertyValue = res.data;
        this.filteredProperties = res.data;
        this.emailTemplateForm.get('properties').enable();
        this.loadingProperty = false;
      }
    })
  }

  filterEmailProperty() {
    if (!this.propertyValue) {
      return;
    }
    //get the search keyword
    let search = this.propertyFilterCtrl.value;

    if (!search) {
      this.filteredProperties = this.propertyValue.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    //filter the banks
    this.filteredProperties = this.propertyValue.filter(
      item => item.fields.toLowerCase().indexOf(search) > -1
    );
  }

  onPropertieschange($value) {
    this.emailBody = this.emailTemplateForm.get('body').value;
    const stringArray = this.emailBody.split("</p>");

    const lastElementIndex = stringArray.length - 2;
    if (lastElementIndex >= 0) {
        const modifiedText = "{"+$value.field_name+"}"; 
        stringArray[lastElementIndex] += `${modifiedText}`;
    }

    const modifiedString = stringArray.join("</p>");
    this.emailTemplateForm.patchValue({ body: modifiedString });

  }

}
