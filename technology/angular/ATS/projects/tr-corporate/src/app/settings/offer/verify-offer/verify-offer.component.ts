import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from "@angular/core";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { TemplateService } from "../shared/services/template.service";
import { LibraryService } from "../shared/services/library.service";
import { SnackBarService } from "../../../utility/services/snack-bar.service";
import { ComponentPayload } from "../shared/interfaces/create-offer-component";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { TEMPLATE_TYPE } from "../shared/enums/enums";
import { TemplateListService } from "../shared/services/template-list.service";

@Component({
  selector: "app-verify-offer",
  templateUrl: "./verify-offer.component.html",
  styleUrls: ["./verify-offer.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class VerifyOfferComponent implements OnInit {
  @Output() close = new EventEmitter<boolean>(false);
  @Output() salaryBreakdown = new EventEmitter<any>();
  @Output() changeTimePeriod = new EventEmitter<any>();
  @Output() changeCurrencyType = new EventEmitter<any>();
  
  @Input() isOpen: boolean = false;
  @Input() verifyOfferDetails: any;
  textCustomField = '';
  totalSalary: number = 0;
  currencyType: string = '';
  timePeriod: string = '';
  TEMPLATE_TYPE = TEMPLATE_TYPE;

  templateName: string = ''
  customFields: any;
  offerComponents: ComponentPayload[] = [];
  offerVLookUpJSON: any = [];

  form = new FormGroup({})
  customFieldsForm:FormGroup = new FormGroup({})

  constructor(
    private templateService: TemplateService,
    private templateListService: TemplateListService,
    private libraryService: LibraryService,
    private snackBar: SnackBarService
    ) {}

  ngOnInit() {
    if(this.verifyOfferDetails !== undefined) {
      let offerTemplate = null;
      if(this.verifyOfferDetails?.salaryStructure !== undefined && this.verifyOfferDetails?.salaryStructure.length > 0) {
        this.getTemplateById(this.verifyOfferDetails.templateid);
      } else {
        offerTemplate = this.verifyOfferDetails;
        this.loadInfo(offerTemplate);
      }
    }
  }

  loadInfo(offerTemplate: any) {
    this.verifyOfferDetails = offerTemplate;
    if(offerTemplate.templatetype == TEMPLATE_TYPE.BASED_ON_COMPENSATION) {
      this.templateService.getOfferVLookInfo(offerTemplate.templateid).subscribe(res => {
        if(res.error) {
          this.snackBar.open(res.message)
        } else {
          if(res.data.length > 0) {
            this.offerVLookUpJSON = res.data[0].exceldata;
          }
        }
    })
  }

  this.timePeriod = offerTemplate.componenttype;
  this.templateName = offerTemplate.templatename;
  this.getCustomFields(offerTemplate.templateid);
  this.getOfferComponents(offerTemplate.templateid);
  }

  getTemplateById(templateId: string) {
    this.templateListService.getTemplateById(templateId).subscribe(res=>{
      if(res.error) {
        this.snackBar.open(res.message);
      } else {
        let template = res.data;
        this.loadInfo(template);
      }
    })
  }


  getCustomFields(templateid: string) {
    let tempForm: any = {};
    this.libraryService.getCustomFieldById(templateid).subscribe( res => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.customFields = res.data;
        this.customFields.map((customfield:any)=> {
          tempForm[customfield.customfieldid] = new FormControl('');
        })
        this.customFieldsForm = new FormGroup(tempForm);
        this.customFields.map((customfield:any)=> {
          if(customfield.ismandatory == 1) {
            this.customFieldsForm.controls[customfield.customfieldid].setValidators(Validators.required);
            this.customFieldsForm.controls[customfield.customfieldid].updateValueAndValidity();        
          }
        })
      }
    })
  }

  getOfferComponents(templateid: string) {
    this.templateService.getComponentsByTempId(templateid).subscribe( res => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.snackBar.open(res.message);
        this.offerComponents = res.data;
        if(this.offerComponents){
          this.offerComponents.forEach( (comp) => {
            this.form.addControl(comp.offercomponentid, new FormControl(''))
          })
          
        }
      }
    })
  }


  isNumber(evt: any)
	 {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true; 
  }

  calculate() {
    let obj: any = [];
    if(this.totalSalary.toString() !== "") {
      this.offerComponents.map((comp:any, i:number)=> {
        if(comp.codeEditor == 0 || this.offerVLookUpJSON.length == 0) {
          let rule = comp.rule;
          let customFieldsJson = this.convertToCustomFieldJson(this.customFields);
          customFieldsJson.map((val: any)=> {
            let keyName = Object.keys(val);
            keyName.map((key:any)=> {
              let changedVal: any = '' || 0;
              if(typeof val[key] == 'string') {
                changedVal = '"'+val[key]+'"';
              } else {
                changedVal = val[key];
              }
              rule = this.replaceAll(rule, '##'+key+'##', changedVal);
            })
          });
          if (rule.search(/##/gi) == -1 ) {
            let value = this.evalRule(rule, this.totalSalary, comp.fieldname);
            this.form.controls[comp.offercomponentid].patchValue(value);
            this.calculateGrandTotalForOfferType(comp,i);
            let compo = comp;
            compo['componentvalue'] = value;
            obj.push(compo);
          } else {
            this.snackBar.open("Please add custom field value in "+ comp.fieldname +" component");
          }
        } else {
          let rule = comp.rule.replace('Total', this.totalSalary);
          if(this.offerVLookUpJSON.length > 0) {
          if(this.customFieldsForm.valid) {
            let filteredData =  this.offerVLookUpJSON;
            let customFieldsJson = this.convertToCustomFieldJson(this.customFields);
            customFieldsJson.map((object: any)=>{
              let keyName = Object.keys(object);
              filteredData = filteredData.filter((col:any) => {
                let tempKey = keyName[0];
                tempKey = keyName[0].replace("_", " ");
                if(col[tempKey].toLowerCase() == object[keyName[0]].toLowerCase()){
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
              key = key.replace(" ", "_");
              rule = this.replaceAll(rule, '##'+key+'##', changedVal);
            })
          });
          if (rule.search(/##/gi) == -1 ) {
            try{
              let value = eval(rule);
              this.form.controls[comp.offercomponentid].patchValue(value);
              this.calculateGrandTotalForOfferType(comp,i);
              let compo = comp;
              compo['componentvalue'] = value;
              obj.push(compo);
            }catch(e) {
              this.snackBar.open("Something is wrong in "+ comp.fieldname +" component");
            }
          } else {
            this.snackBar.open("Custom fields values does not match with condition.");
          }
          } else {
            this.snackBar.open("Please fill custom fields");
          }
          } else {
            let rule = comp.rule;
            let customFieldsJson = this.convertToCustomFieldJson(this.customFields);
            customFieldsJson.map((val: any)=> {
              let keyName = Object.keys(val);
              keyName.map((key:any)=> {
                let changedVal: any = '' || 0;
                if(typeof val[key] == 'string') {
                  changedVal = '"'+val[key]+'"';
                } else {
                  changedVal = val[key];
                }
                rule = this.replaceAll(rule, '##'+key+'##', changedVal);
              })
            });
            if (rule.search(/##/gi) == -1 ) {
              try {
                let value = eval(rule);
                this.form.controls[comp.offercomponentid].patchValue(value);
                this.calculateGrandTotalForOfferType(comp,i);
                let compo = comp;
                compo['componentvalue'] = value;
                obj.push(compo);
              }catch(e) {
                this.snackBar.open("Something is wrong in "+ comp.fieldname +" component");
              }
            }else {
              this.snackBar.open("Please add custom field value in "+ comp.fieldname +" component");
            } 
          }
        }
      })
    } else {
      this.offerComponents.map((comp:any, i:number)=> {
        this.form.controls[comp.offercomponentid].patchValue(0);
        this.calculateGrandTotalForOfferType(comp,i);
      })
    }
    let customFieldsJson = this.convertToCustomFieldJson(this.customFields);
    const object = {
      structure: obj,
      customfields: customFieldsJson
    }
    this.salaryBreakdown.emit(object);
  }

  evalRule(rule: string, total: number, componentName: string) {
    if (rule.search(/##/gi) != -1) {
      let customFieldsJson = this.convertToCustomFieldJson(this.customFields);
        customFieldsJson.map((val: any)=> {
          let keyName = Object.keys(val);
            keyName.map((key:any)=> {
              let changedVal: any = '' || 0;
              if(typeof val[key] == 'string') {
                changedVal = '"'+val[key]+'"';
              } else {
                changedVal = val[key];
              }
              rule = this.replaceAll(rule, '##'+key+'##', changedVal);
            })
      });
    }
    let expression = rule;
    let splitUp = expression.match(/[^()*/%+-<<=>>===!=&|&&||]+/g);
    let listOfComp: any = [];
    splitUp?.map(value=> {
      value = value.replace(" ", '');
      value = value.trim();
      if (!/[^a-zA-Z_]/.test(value)) {
        if(!value.startsWith('var') && value.toLowerCase() !== componentName.toLowerCase()) {
          if(!value.startsWith('let') && value !== '" "' || value !== '""') {
            listOfComp.push({
              name: value,
              value: 0
            })
          }
        }
      } 
    });
    listOfComp.map( (comp:any) => {
      if( comp.name.toLowerCase() == 'total') {
        comp.value = total;
      } else {
        let newRule = '';
        this.offerComponents.map( dbComp => {
          let compName = dbComp.fieldname.replace(" ", '_');
          if(compName.toLowerCase().trim() == comp.name.toLowerCase().trim()) {
            newRule = dbComp.rule;
          }
        });
        if(newRule !== " ") {
          comp.value = this.evalRule(newRule, total, comp.name);
        } 
      }
    })
    listOfComp.map( (val:any) => {
      if(val.value == undefined) {
      } else {
        rule = this.replaceAll(rule, val.name, val.value.toString());
      }
    })
    let finalvalue = 0;
    try {
      finalvalue = eval(rule);
    }catch(e) {
      this.snackBar.open("Something is wrong in "+ componentName +" component");
    }
    return finalvalue
  }

   replaceAll(str: string, find: string, replace: string) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  grandTotal = 0;
  tempArrPositive: Array<number> = [];
  tempArrNegative: Array<number> = [];
  
  calculateGrandTotalForOfferType(component: any, i: number) {
    let obj: any = [];
    if(component.componenttype === 'Positive') {
      let compValue = Number(this.form.controls[component.offercomponentid].value);
      this.tempArrPositive[i] = compValue;
    } else if(component.componenttype === 'Negative') {
      let compValue = Number(this.form.controls[component.offercomponentid].value);
      this.tempArrNegative[i] = compValue;
    }
    let totalSumOfPositive = 0
    let totalSumOfNegative = 0;
    if(this.tempArrPositive.length > 0) {
      totalSumOfPositive = this.tempArrPositive.reduce((a, b) => a + b, 0)
    }
    if(this.tempArrNegative.length > 0) {
      totalSumOfNegative = this.tempArrNegative.reduce((a, b) => a + b, 0)
    }
  
    this.offerComponents.map((component: any) => {
      let compo = component;
      compo['componentvalue'] = this.form.controls[component.offercomponentid].value;
      obj.push(compo);
    });
    this.grandTotal = totalSumOfPositive - totalSumOfNegative;
    
    const object = {
      structure: obj,
      customfields: []
    }
    this.salaryBreakdown.emit(object);
  }

  getGrandTotal(grandTotal: number, totalSalary: number) {
    let total = Number(totalSalary);
    return grandTotal;
  }

  closeDrawer() {
    this.close.emit(true);
  }

  changeCurrencyTypeF($event: any) {
    this.changeCurrencyType.emit(this.currencyType);
  }

  convertToCustomFieldJson($event: any) {
    let customFieldJSON: any = [];
    const {value} = this.customFieldsForm;
    let keys = Object.keys(value);
    keys.map(key=>{
      let index  = $event.findIndex((field: any)=> {
        return field.customfieldid == key;
      })
      let name = $event[index].fieldname;
      name = name.replace(" ", "_");
      customFieldJSON[index] = { [name] : value[key] }
    })

    return customFieldJSON;
  }

  convertToArray(obj: any) {
    let arr = Object.values(obj);
    return arr;
  }
}