import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AppState } from 'app/store/';
import * as actions from 'app/store/sms-templates/sms-templates.actions';
import { initialState } from "app/store/sms-templates/sms-templates.states";
import * as commonModels from 'app/shared/models/common.model';

@Component({
  selector: 'app-smstemplate-modal',
  templateUrl: './sms-template-modal.component.html',
  styleUrls: ['./sms-template-modal.component.scss']
})
export class SmstemplateModalComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  public filter: commonModels.Filter = initialState.filter;
  public smsTemplateForm: FormGroup;
  public isTypeEnabled: boolean = true;
  type: any;
  public showProperty: boolean = false;
  propertyValue: any = [];
  public loadingProperty: boolean = true;
  messageLength: number = 159;
  msgCount: number = 0;
  segment: Array<{}> = [];
  messageValue: any;
  trimMessage: any;
  smsTemplateEditMessage: any;
  propertyFilterCtrl: FormControl = new FormControl();
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private service$: WorkflowService,
    public dialogRef: MatDialogRef<SmstemplateModalComponent>,
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
      const editSmsTemplate = this.data.data;
      let message = editSmsTemplate.message;
      this.charCount = message.join('').length;
      this.countSegment = message.length;
      this.smsTemplateForm.patchValue({
        templeteTitle: editSmsTemplate.title,
        smsMessage: message.join('\n'),
      });
    }

    //listen for search field value changes for portal user
    this.propertyFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterSmsProperty();
      });
  }

  initform() {
    this.smsTemplateForm = this.fb.group({
      templeteTitle: ['', Validators.required],
      properties: [''],
      smsMessage: ['', Validators.required],
    });
    this.smsTemplateForm.get('properties').disable();
  }

  getProperty() {
    this.service$.getpropertyColumns().subscribe((res: any) => {
      if (res) {
        this.propertyValue = res.data;
        this.filteredProperties = res.data;
        this.smsTemplateForm.get('properties').enable();
        this.loadingProperty = false;
      }
    })
  }

  onPropertieschange($value) {
    this.messageValue = this.smsTemplateForm.get('smsMessage').value + '{' + $value.field_name + '}'
    this.smsTemplateForm.patchValue({ smsMessage: this.messageValue });
    this.msgCount = this.messageValue.length;
  }

  saveTemplateMessage() {
    let message = this.smsTemplateForm.value.smsMessage;
    const segments = this.createMessageSegments(message);

    const payload = {
      title: this.smsTemplateForm.value.templeteTitle,
      message: segments,
    }

    if(!this.data.isEdit) {
      this.service$.storeSmsTemplate(payload).subscribe((res: any) => {
        if (res) {
          this.loader$.close();
          this.dialogRef.close(true);
          this.loadData();
        }
      });
    } else {
      payload['id'] = this.data.data.id;
      this.service$.updateSmsTemplate(payload).subscribe((res: any) => {
        if (res) {
          this.loader$.close();
          this.dialogRef.close(true);
          this.loadData();
        }
      });
    }
  }


  countSegment: number = 0;
  charCount: number = 0;
  messageCount(event: any) {
    let message = this.smsTemplateForm.value.smsMessage;
    const segments = this.createMessageSegments(message);
    this.segment = segments;
    this.charCount = segments.join('').length;
    let messageString = "";
    if(segments.length != 1 && this.countSegment+1 == segments.length) {
      segments.map((segment: any, index: number) => {
        if(index == this.countSegment) {
          messageString += "\n";
        }
        messageString += segment; 
      });
      this.smsTemplateForm.patchValue( {smsMessage: messageString })
    }
    this.countSegment = segments.length;
  }

  createMessageSegments(message: string): string[] {
    const maxLength = 160;
    const segmentLength = 153;
    const segments: string[] = [];
  
    if (message.length <= maxLength) {
      segments.push(message);
      return segments;
    }
  
    let i = 0;
    while (i < message.length) {
      const remainingChars = message.length - i;
      if (remainingChars <= 153) {
        segments.push(message.substr(i));
        break;
      }
      const segment = message.substr(i, segmentLength);
      segments.push(segment);
      i += segmentLength;
    }
    return segments;
  }
  

  filteredProperties: any = [];

  /** Filter sms properties
   * @param smsTemplate item
   * @return
   **/

  filterSmsProperty() {
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

  loadData() {
    var per_page_limit = localStorage.getItem('sms_template_module_limit');
    var selected_order_dir = localStorage.getItem('sms_template_module_order_dir');
    var selected_order_by = localStorage.getItem('sms_template_module_order_by');
    var selected_page_no = localStorage.getItem('sms_template_module_page_count');
    var search_keyword = localStorage.getItem('sms_template_module_search_keyword');
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

}
