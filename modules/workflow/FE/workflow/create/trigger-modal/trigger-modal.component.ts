import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { ACTION, CONDITION, EMAILLIST, PROPERTY, TYPE } from 'app/shared/enums/enums';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-trigger-modal',
  templateUrl: './trigger-modal.component.html',
  styleUrls: ['./trigger-modal.component.scss']
})
export class TriggerModalComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  public triggerForm: FormGroup;
  type: any;
  propertyList: any;
  public isConditionEnable: Boolean = false;
  public loadingType: Boolean = true;
  public isTypeEnabled: Boolean = false;
  conditionList: Array<{}> = [
    {id: 1, value: 'Equals'},
    {id: 2, value: 'Does not equal'},
    {id: 3, value: 'known'},
    {id: 4, value: 'unknown'},
  ];

  // conditionSourceValueList: Array<{}> = [
  //   { id: 1, value: 'Web' },
  //   { id: 2, value: 'Mobile' },
  //   { id: 3, value: 'Direct' },
  //   { id: 4, value: 'CB2' },
  //   { id: 5, value: 'CB3' },
  //   { id: 6, value: 'CB2AZ' },
  //   { id: 7, value: 'Jotform' },
  //   { id: 8, value: 'Hubspot' },
  // ];

  
  conditionSourceValueList: Array<{}> = [];

  phonePreferredTimeValueList: Array<{}> = [
    { id: 1, value: 'Day' },
    { id: 2, value: 'Evening' },
  ];

  creditScoreValueList: Array<{}> = [
    { id: 1, value: 'Excellent' },
    { id: 2, value: 'Good' },
    { id: 3, value: 'Fair' },
    { id: 4, value: 'Poor' },
  ];

  public RequestParam: any = {
    order_by: 'created_at',
    order_dir: 'desc',
    page: 0,
    per_page: 500,
  };

  conditionValue: any;
    
  // this is used for type concierge
  typeValueList: Array<{}> = [
    { id: 0, value: '' },
    { id: 1, value: 'Concierge' },
    { id: 2, value: 'Concierge (Test)' }
  ];

  conciergeStateValueList: Array<{}> = [
    { id: 'CA', value: 'California' },
    { id: 'AZ', value: 'Arizona' }
  ];

  over18ValueList: Array<{}> = [
    { id: 1, value: 'Yes' },
    { id: 2, value: 'No' }
  ];

  propertyFilterCtrl: FormControl = new FormControl();
  filteredProperties:Array<{}> = [];

  public autoComplete: Boolean = false;
  public selectOption: Boolean = false;
  public textarea: Boolean = false;
  public dealstage: Boolean = false;
  public portaldealstage: Boolean = false;
  public propertyFieldValue:boolean = false;
  filteredConditionSelectOption: Array<{}> = [];
  
  conditionOptionValue: Array<{}> = [];
  dealStageValue: Array<{}> = [];
  portalDealStageValue: Array<{}> = [];
  autoCompleteValue: Array<{}> = [];
  propertyChnageId:number;
  propertyChnageValue: any;

  conditionSelectOptionFilterCtrl: FormControl = new FormControl();

  dealStageFilterCtrl: FormControl = new FormControl();
  
  filteredDealStageSelectOption: Array<{}> = [];
  triggerConditionBackendValue: any;
  triggerConditionValue: any;
  timeout: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb:FormBuilder,
    private service$: WorkflowService,
    public dialogRef: MatDialogRef<TriggerModalComponent>,
    private _cdr: ChangeDetectorRef,
  ) {
    this.initform();
   }

  ngOnDestroy(): void {
   this.onDestroy$.next();
   this.onDestroy$.complete();
  }

  ngOnInit() {
    this.getAllsource();
    this.propertyFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterSmsProperty();
      });

       // condition SelectOption filter control
    this.conditionSelectOptionFilterCtrl.valueChanges
    .pipe(
      debounceTime(10),
      takeUntil(this.onDestroy$)
    )
    .subscribe(() => {
      this.filterConditionSelectOption();
    });

    // Deal stage selectOption filter controls
    this.dealStageFilterCtrl.valueChanges
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.filterDealStageSelectOption();
      });
      
    if (this.data.isEdit) {
      const trigger = this.data.data;
      this.triggerForm.patchValue({
        condition: trigger.condition.id,
        conditionvalue: trigger.conditionvalue
      });
      
      this.onConditionchange(trigger.condition.id);
      this.isConditionEnable = true;
    }
  }

  initform() {
    this.triggerForm = this.fb.group({
      property: ['', Validators.required],
      condition: ['', Validators.required],
      conditionvalue: ['', Validators.required],
    });
    // if(this.data.conditionvalue != null) {
    //   this.triggerForm.patchValue({type: this.data.conditionvalue});
    // }
    this.getPropertyList();
  }



  getPropertyList() {
    this.loadingType = true;
    this.service$.getpropertyColumns().subscribe((res: any) => {
      if (res) {
        this.propertyList = res.data;
        this.filteredProperties = res.data;
        this.loadingType = false;
        if (this.data.isEdit) {
          this.triggerForm.patchValue({
            property: this.data.data.property.id
          })
          this.onPropertychange(this.data.data.property.id);
        }
      }
    })
  }

  filterSmsProperty() {
    if (!this.propertyList) {
      return;
    }
    //get the search keyword
    let search = this.propertyFilterCtrl.value;

    if (!search) {
      this.filteredProperties = this.propertyList.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    //filter the banks
    this.filteredProperties = this.propertyList.filter(
      item => item.fields.toLowerCase().indexOf(search) > -1
    );
  }

  filterConditionSelectOption() {
    if (!this.conditionOptionValue) {
      return;
    }
    //get the search keyword
    let search = this.conditionSelectOptionFilterCtrl.value;

    if (!search) {
      this.filteredConditionSelectOption = this.conditionOptionValue.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }
    //filter the banks
    this.filteredConditionSelectOption = this.conditionOptionValue.filter(
      (item: any) => item.value.toLowerCase().indexOf(search) > -1
    );
  }

  filterDealStageSelectOption() {
    if (!this.dealStageValue) {
      return;
    }
    //get the search keyword
    let search = this.dealStageFilterCtrl.value;

    if (!search) {
      this.filteredDealStageSelectOption = this.dealStageValue.slice(0);
      return;
    } else {
      // search = search.toLowerCase();
    }
    //filter the banks
    this.filteredDealStageSelectOption = this.dealStageValue.filter(
      (item: any) => item.label.toLowerCase().indexOf(search) > -1
    );
  }

  onPropertychange($event: any) {
    this.dealStageFilterCtrl.setValue([]);
    const property = this.propertyList.filter(property => property.field_id == this.triggerForm.value.property);
    if (property[0].field_type == "autoComplete") {
      if (this.propertyChnageId !== $event) {
        this.triggerForm.patchValue({
          condition: ''
        });
        this.conditionvaluenames = [];
      }
      this.propertyChnageValue = property[0].field_name;
      this.propertyChnageId = $event;

      this.autoComplete = true;
      this.selectOption = false;
      this.textarea = false;
      this.dealstage = false;
      this.portaldealstage = false;

    } else if (property[0].field_type == "selectOption") {
      this.propertyFieldValue = false;
      if (property[0].field_name == "source" || property[0].field_name == "source_utm") {
        this.filteredConditionSelectOption = this.conditionSourceValueList;
        this.conditionOptionValue = this.conditionSourceValueList;
        this.propertyFieldValue = true;
      } else if (property[0].field_name == "phone_preferred_time") {
        this.filteredConditionSelectOption = this.phonePreferredTimeValueList;
        this.conditionOptionValue = this.phonePreferredTimeValueList;
      } else if (property[0].field_name == "credit_score") {
        this.filteredConditionSelectOption = this.creditScoreValueList;
        this.conditionOptionValue = this.creditScoreValueList;
      } else if (property[0].field_name == "deal_stage") {
        this.service$.getDealStageList(this.RequestParam).subscribe((res: any) => {
          if (res) {
            this.autoComplete = false;
            this.selectOption = false;
            this.textarea = false;
            this.dealstage = true;
            this.portaldealstage = false;
            this.dealStageValue = res.data;
            this.filteredDealStageSelectOption = res.data;
            this._cdr.detectChanges();
          }
        });
      } else if (property[0].field_name == "portal_deal_stage") {
        this.service$.getPortalDealStageList(this.RequestParam).subscribe((res: any) => {
          if (res) {
            this.autoComplete = false;
            this.selectOption = false;
            this.textarea = false;
            this.dealstage = false;
            this.portaldealstage = true;
            this.dealStageValue = res.data;
            this.filteredDealStageSelectOption = res.data;
            this._cdr.detectChanges();
          }
        }); 
      } else if(property[0].field_name == "type") {
        this.filteredConditionSelectOption = this.typeValueList;
        this.conditionOptionValue = this.typeValueList;
      } else if(property[0].field_name == "concierge_state"){
        this.filteredConditionSelectOption = this.conciergeStateValueList;
        this.conditionOptionValue = this.conciergeStateValueList;
      }
      this.autoComplete = false;
      this.selectOption = true;
      this.textarea = false;
      this.dealstage = false;
      this.portaldealstage = false;
    } else {
      if(property[0].field_name == "over18") {
        this.filteredConditionSelectOption = this.over18ValueList;
        this.conditionOptionValue = this.over18ValueList;
        this.autoComplete = false;
        this.selectOption = true;
        this.textarea = false;
        this.dealstage = false;
        this.portaldealstage = false;
      }
      else {
        this.autoComplete = false;
        this.selectOption = false;
        this.textarea = true;
        this.dealstage = false;
        this.portaldealstage = false;
      }
    }

    if ($event != '') {
      this.isConditionEnable = true;
    }
  }


  // auto Complete Functions
  conditionvaluenames = [];

  removeChipValue(value: string): void {
    const index = this.conditionvaluenames.indexOf(value);
    if (index >= 0) {
      this.conditionvaluenames.splice(index, 1);
      this.triggerForm.patchValue({
        conditionvalue: JSON.stringify(this.conditionvaluenames)
      });
      if (this.conditionvaluenames.length == 0) {
        this.triggerForm.get('conditionvalue').setErrors({ incorrect: true });
      }
    }
    if (this.conditionvaluenames.length == 0) {
      this.triggerForm.patchValue({
        conditionvalue: ''
      });
    }
  }

  searchValueFunction(event: any) {
    const conditionvalue = event.target.value;
    if (this.propertyChnageValue == 'state' || this.propertyChnageValue == 'city' || this.propertyChnageValue == 'street_address' || this.propertyChnageValue == 'zip') {
      const payload = {
        field_name: this.propertyChnageValue,
        table_id: 1,
        inputValue: conditionvalue
      }
      clearTimeout(this.timeout);
      if(conditionvalue != "") {
        this.timeout = setTimeout(() => {
          this.service$.getPropertyAutoCompleteValue(payload).subscribe((res: any) => {
            if (res) {
              this.autoCompleteValue = res.data;
            }
          });
        }, 1000);
      }
    }
  }

  valueChangedFunction(value: any) {
    if (!this.conditionvaluenames.includes(value.field_name)) {
      this.conditionvaluenames.push(value.field_name);
      this.triggerForm.get('conditionvalue').setErrors(null);
      this.triggerForm.patchValue({
        conditionvalue: JSON.stringify(this.conditionvaluenames)
      });
    }
  }

  add(event: MatChipInputEvent): void {

    this.conditionvaluenames.push(event.value);
    this.triggerForm.patchValue({
      conditionvalue: JSON.stringify(this.conditionvaluenames)
    });
    
  }


  onConditionchange($event:any){
    this.conditionValue = $event;
  }

  saveTrigger() {
    const property = this.propertyList.filter(property => property.field_id == this.triggerForm.value.property);
    if(CONDITION[this.triggerForm.value.condition] != 'known' && CONDITION[this.triggerForm.value.condition] != 'unknown' ){
      if (property[0].field_name == "source" || property[0].field_name == "source_utm") {
        const sourceFilter: Array<any> = this.conditionSourceValueList.filter((s: { id: number, name: string }) => s.id == this.triggerForm.value.conditionvalue);
        this.triggerConditionValue = sourceFilter[0].name;
        this.triggerConditionBackendValue = sourceFilter[0].id;
      } else if (property[0].field_name == "phone_preferred_time") {
        const sourceFilter: Array<any> = this.phonePreferredTimeValueList.filter((s: { id: number, value: string }) => s.id == this.triggerForm.value.conditionvalue);
        this.triggerConditionValue = sourceFilter[0].value;
        this.triggerConditionBackendValue = sourceFilter[0].id;
      } else if (property[0].field_name == "credit_score") {
        const sourceFilter: Array<any> = this.creditScoreValueList.filter((s: { id: number, value: string }) => s.id == this.triggerForm.value.conditionvalue);
        this.triggerConditionValue = sourceFilter[0].value;
        this.triggerConditionBackendValue = sourceFilter[0].id;
      } else if (property[0].field_name == "deal_stage") {
        const filteredObjects:any = this.dealStageValue.filter((obj:any) => this.triggerForm.value.conditionvalue == obj.stage_id);
        if (filteredObjects) {
          this.triggerConditionValue = filteredObjects[0].label;
          this.triggerConditionBackendValue = filteredObjects[0].stage_id;
        }
      } else if (property[0].field_name == "portal_deal_stage") {
        const filteredObjects: any = this.dealStageValue.filter((obj:any) => this.triggerForm.value.conditionvalue == obj.id);
        if (filteredObjects) {
          this.triggerConditionValue = filteredObjects[0].label;
          this.triggerConditionBackendValue = filteredObjects[0].id;
        }
      } else if (property[0].field_name == 'state' || property[0].field_name == 'city' || property[0].field_name == 'street_address' || property[0].field_name == 'zip') {
        this.triggerConditionValue = (this.triggerForm.value.conditionvalue).replace(/[^,a-zA-Z0-9 ]/g, '');
        this.triggerConditionBackendValue = (this.triggerForm.value.conditionvalue).replace(/[^,a-zA-Z0-9 ]/g, '');
      }else if (property[0].field_name == "type"){
        const sourceFilter: Array<any> = this.typeValueList.filter((s: { id: number, value: string }) => s.id == this.triggerForm.value.conditionvalue);
        this.triggerConditionValue = sourceFilter[0].value;
        this.triggerConditionBackendValue = sourceFilter[0].id;
      }
      else {
        this.triggerConditionValue = this.triggerForm.value.conditionvalue;
        this.triggerConditionBackendValue = this.triggerForm.value.conditionvalue;
      }
    }else{
      this.triggerConditionValue = '';
      this.triggerConditionBackendValue = '';
    }
    
    let triggerObject = {};
    triggerObject = {
      type: {
        id: property[0].table_id,
        value: TYPE[property[0].table_id],
      },
      property: {
        id: property[0].field_id,
        title: (property[0].fields).replace(/[^\w\s]/gi, ""),
        value: property[0].field_name,
      },
      condition: {
        id: this.triggerForm.value.condition,
        value: CONDITION[this.triggerForm.value.condition],
      },
      conditionvalue: this.triggerConditionBackendValue,
      condition_value: this.triggerConditionValue,
      multivalue: [],
      event_master_id: 101
    }

    this.dialogRef.close(triggerObject);
  }

  close() {
    this.dialogRef.close(null);
  }

	/** get all Source
	* @param
	* @return
	**/
	getAllsource(){
		this.service$.getsource().subscribe((res:any)=>{
			if(res.statusCode == 200 && res.data) {
				this.conditionSourceValueList = res.data;
			}
		});
	}
}
