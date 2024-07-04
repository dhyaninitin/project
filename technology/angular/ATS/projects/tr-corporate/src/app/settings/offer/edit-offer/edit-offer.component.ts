import { getBusinessVerticle } from "../../../utility/store/selectors/business-vertical.selector";
import { Store } from "@ngrx/store";
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { fadeAnimation } from "../../../animations";
import { ValidationConstants } from "../../../utility/configs/app.constants";
import { SnackBarService } from "../../../utility/services/snack-bar.service";
//import { UserService } from '../shared/services/user.service';
import { TemplateService } from "../shared/services/template.service";
import { State } from "../../../utility/store/reducers";
import { getDefaultAccountId } from "../../../utility/store/selectors/account.selector";
import { Irole } from "../../../utility/store/interfaces/role";
import { getRoles } from "../../../utility/store/selectors/roles.selector";
import { SETTINGS_LN } from "../../shared/settings.lang";
//import { GetUser_response } from './../shared/interfaces/get-user';
import { GetUser_response } from "../../permission/shared/interfaces/get-user";
import { Subscription } from "rxjs";

import { CountryCodes } from "../../../auth/register/countrycodes";
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { TemplateListService } from "../shared/services/template-list.service";
import { ComponentsElement } from "../shared/interfaces/offer-component";
import { v1 as uuidv1 } from 'uuid';
import { TEMPLATE_TYPE } from "../shared/enums/enums";
import { MatDialog } from "@angular/material/dialog";
import * as XLSX from 'xlsx';

@Component({
  selector: "app-edit-offer",
  templateUrl: "./edit-offer.component.html",
  styleUrls: ["./edit-offer.component.scss"],
})
export class EditOfferComponent implements OnInit ,OnDestroy{
  editOfferDetail!: FormGroup;
  editComponentDetail!: FormGroup;
  showUpdate: boolean = false;
  templateid : string ='';
  deleteComponents: Array<string> = [];
  onTemplateType: boolean = false;
  isEditView: any;
  editedComponents: any = [];
  newAddedComponents: Array<string> = [];
  
  @ViewChild("dialogRefs") dialogRefs!: TemplateRef<any>;
  editorOptions = {theme: 'vs-dark', language: 'javascript', automaticLayout: true};
  codeResult  = '';

  isEditEnable: boolean = true; // to show and hide the edit button
  form: FormGroup = this.fb.group({ dates: this.fb.array([]) });

  newUser!: any;
  isLoading = false;
  selected2 = "pankaj";
  roles: Irole[] = [];
  businessverticals!: any[];
  countrycodes = CountryCodes;
  rolesData: any;
  rolesArray: any;
  expandedElement: any;
  elementData:any = [ 
  ];
  components: ComponentsElement[] = [];
  dataSource = new MatTableDataSource(this.elementData);

  displayedColumns = [
    "Component",
    "typeOfComponent",
    "hideIfZero",
    "Rule",
    "action",
  ];
  @Input() edit: boolean = false;
  @Input() userEmail!: string;
  @Input() isOpen: boolean = false;
  @ViewChild("table") table!: MatTable<any>;


  @Output() offerUpdate = new EventEmitter();
  @Input() editOfferDetails: any;

  getaccountrole: any;
  user!: GetUser_response["data"] | null;
  accountID!: string;
  isCurrentUser!: boolean;

  ln = SETTINGS_LN;

  isDisabled = false;
  userAPISubscription!: Subscription;
  componentsToSelect: any;
  offercomponentid: any;
  offerVLookUpJSON = []
  //dataSource = new MatTableDataSource();

  get productControlArray() {
    return this.form.get("products") as FormArray;
  }
  constructor(
    private fb: FormBuilder,
    private userServ: TemplateService,
    private snackBar: SnackBarService,
    private store: Store<State>,
    private _cdr: ChangeDetectorRef,
    private templatelistService: TemplateListService,
    private templateService: TemplateService,
    public dialog: MatDialog,
  ) {
    this.initForm();
    this.initializeComponentsForm();
  }
  onCategorySelection(role: any) {
    this.getaccountrole = role;
  }

  ngOnDestroy() {
    this.editOfferDetails = null
    this.showUpdate = false;
    this.editOfferDetail.reset();
    this.offerVLookUpJSON = [];
  }
  toggleRow(element: any) {
    this._cdr.detectChanges();
  
  }

  ngOnInit(): void {
    if(this.editOfferDetails){
      this.templateid = this.editOfferDetails.templateid;
      const payload = {
        templatename:this.editOfferDetails.templatename,
        description:this.editOfferDetails.description,
        sendoffer:this.editOfferDetails.sendoffer,
        templatetype:this.editOfferDetails.templatetype,
        componentType:this.editOfferDetails.componenttype
      }
      this.showUpdate = true;
      this.editOfferDetail.setValue(payload)
      this.loadOfferComponents();
      this.onTemplateType = this.editOfferDetails.templatetype === TEMPLATE_TYPE.BASED_ON_OFFER ? false : true;
      if(!this.onTemplateType) {
        this.displayedColumns = [
          "Component",
          "typeOfComponent",
          "hideIfZero",
          "action",
        ];
      }
    }else {
      this.editOfferDetail.reset();
      this.showUpdate = false;
    }
  }

  changeTemplateType($event: any) {
    this.onTemplateType = $event.value === TEMPLATE_TYPE.BASED_ON_OFFER ? false : true;
      if(!this.onTemplateType) {
        this.displayedColumns = [
          "Component",
          "typeOfComponent",
          "hideIfZero",
          "action",
        ];
      } else {
        this.displayedColumns = [
          "Component",
          "typeOfComponent",
          "hideIfZero",
          "Rule",
          "action",
        ];
      }
  }

  update(){
    if(this.editOfferDetail.valid){
      const { value } = this.editOfferDetail;
      const payload = {
        templateid: this.templateid, 
        templatename: value.templatename,
        description: value.description,
        sendoffer: value.sendoffer,
        templatetype: value.templatetype,
        componenttype: value.componenttype
      }
      this.templatelistService.updateTemplateById(payload).subscribe(res => {
        if (res.error) {
          this.snackBar.open(res.message);
          this.offerUpdate.emit(false);
        } else {
          this.removeComponents();
          this.updateComponents();
          this.deleteComponents = [];
          this.offerUpdate.emit(true);
        }
      });
      this.snackBar.open("Success !")
    }else{
      this.snackBar.open("Please fill all the details")
    }
  }

  initForm() {
    // Edit Offer
    this.editOfferDetail = this.fb.group({
      templatename: ['',[Validators.required],],
      description: ['',[Validators.required],],
      sendoffer: ['',[Validators.required],],
      templatetype: ['',[Validators.required],],
      componentType: ['',[Validators.required],],
    });
  }

  initializeComponentsForm() {
    // Form initialization
    this.editComponentDetail = this.fb.group({
      fieldname: [
        '',
        [
          Validators.required,
          Validators.minLength(ValidationConstants.userAccountStrategy.NAME_MIN_LENGTH),
          Validators.maxLength(ValidationConstants.userAccountStrategy.NAME_MAX_LENGTH)
        ],
      ],
      hideifzero: [false],
      // componentname: ['', [Validators.required]],
      componenttype: ['', [Validators.required]],
      selectedcomponent: [''],
      mathfunction: [''],
      operator: [''],
      rule: [''],
    });
  }

  get templatename(): AbstractControl {
    return this.editOfferDetail.get("templatename") as FormControl;
  }
  get description(): AbstractControl {
    return this.editOfferDetail.get("description") as FormControl;
  }
  get sendoffer(): AbstractControl {
    return this.editOfferDetail.get("sendoffer") as FormControl;
  }
  get templatetype(): AbstractControl {
    return this.editOfferDetail.get("templatetype") as FormControl;
  }
  get componentType(): AbstractControl {
    return this.editOfferDetail.get("componentType") as FormControl;
  }



  get fieldname(): AbstractControl {
    return this.editComponentDetail.get('fieldname') as FormControl;
  }
  get hideifzero(): AbstractControl {
    return this.editComponentDetail.get('hideifzero') as FormControl;
  }
  // get componentname(): AbstractControl {
  //   return this.editComponentDetail.get('componentname') as FormControl;
  // }
  get componenttype(): AbstractControl {
    return this.editComponentDetail.get('componenttype') as FormControl;
  }
  get selectedcomponent(): AbstractControl {
    return this.editComponentDetail.get('selectedcomponent') as FormControl;
  }
  get mathfunction(): AbstractControl {
    return this.editComponentDetail.get('mathfunction') as FormControl;
  }
  get operator(): AbstractControl {
    return this.editComponentDetail.get('operator') as FormControl;
  }
  get rule(): AbstractControl {
    return this.editComponentDetail.get('rule') as FormControl;
  }


  ngOnChanges(changes: SimpleChanges) {}

  prefillUser() {
    this.isDisabled = true;
  }

  editUser() {
    this.editOfferDetail.markAllAsTouched();
  }

  statusChanged(status: number) {}

  userUpdated() {}

  reloadForm() {
    this.editOfferDetail.reset();
    this.prefillUser();
  }
  onEdit() {
    this.isEditEnable = !this.isEditEnable;
    this._cdr.detectChanges();
  }
  
  onEditAndAdd() {
     this.addNewComponent();
  }

  addNewComponent() {
    const lastComp : any = this.components[this.components.length-1];
    lastComp.offercomponentid = uuidv1();
    this.newAddedComponents.push(lastComp.offercomponentid);
    lastComp.fieldname = "Edit Name";
    lastComp.componenttype = "";
    this.templateService.createComponentsByTempId(lastComp).subscribe( res => {
      if(res.error){
        this.snackBar.open(res.message);
      } else {
        this.snackBar.open(res.message);
        this.loadOfferComponents();
      }
    });
  }

  onDeleteComponent(offercomponentid:string) {
      this.components = this.components.filter( (component: any) => {
        if(component.offercomponentid !== offercomponentid) {
          return component;
        } else {
          this.deleteComponents.push(component.offercomponentid)
        }
      })
    this.editOfferDetail.markAsDirty();
  }

  removeComponents() {
    if(this.deleteComponents.length > 0) {
      this.deleteComponents.map( offercomponentid => {
        this.templateService.deleteComponentsById(offercomponentid).subscribe( res =>{
          if (res.error) {
            this.snackBar.open(res.message);
          } else {
          }
        })
      })
    } 
  }

  clearComponents() {
    this.deleteComponents = this.newAddedComponents;
    this.removeComponents();
    this.offerUpdate.emit(false);
  }

  onEditComponent(component: any) {
    // this.isEditEnable = !this.isEditEnable;
    this.offercomponentid = component.offercomponentid;
    this.isEditView = component;
    this._cdr.detectChanges();
    this.editComponentDetail.patchValue(component);
    this.filterComponents(true);
  }

  onCheck(offercomponentid: string) {
    const { value } = this.editComponentDetail;
    value['offercomponentid'] = offercomponentid;
    if(this.editComponentDetail.touched && this.editComponentDetail.valid && this.editComponentDetail.dirty) {
      const index = this.editedComponents.findIndex( (component: any) => { return component.offercomponentid == offercomponentid; });
      if(index !== -1) {
        this.editedComponents.splice(index,1);
      }
      this.editedComponents.push(value);

      const indexForExisting = this.components.findIndex( (component:any) => {
        return component.offercomponentid == offercomponentid;
      })
      const indexForChanged = this.editedComponents.findIndex( (component:any) => {
        return component.offercomponentid == offercomponentid;
      })
      if(indexForExisting !== -1 && indexForChanged !== -1) {
        this.components[indexForExisting] = this.editedComponents[indexForChanged];
        this.components = this.components.map( compo => {
          return compo;
        });
      }
      this.editOfferDetail.markAsDirty();
    } else {
      this.editComponentDetail.markAllAsTouched();
    }
    // this.isEditView = {};
  }

  updateComponentStatus() {
    const { value } = this.editComponentDetail;
    value.hideifzero = value.hideifzero ? 1 : 0;
  }

  updateComponents() {
    if(this.editedComponents.length > 0) {
      this.editedComponents.map( ( component :any) => {
        this.templateService.updateComponentsById(component).subscribe( res =>{
          if (res.error) {
            this.snackBar.open(res.message);
          } else {
            this.snackBar.open(res.message);
          }
        })
      })
    } 
  }

  onCancel() {
    this.isEditView = {};
  }
  
  loadOfferComponents(){
    this.templateService.getComponentsByTempId(this.templateid).subscribe( res => {
      if (res.error) {
        this.snackBar.open(res.message);
      } else {
        this.components = res.data;
      }
    })
  }

  filterComponents(isEdit: boolean) {
    if(isEdit) {
      this.componentsToSelect = this.components.filter( (comp: any) => {
        return comp.offercomponentid !== this.offercomponentid;
      })
    }
  }


  previousSelectedComp = '';

  addSelectedComp(event: any) {
    let rule = this.editComponentDetail.controls['rule'].value || '';
    rule = rule.replace(this.previousSelectedComp, "");
    let selectedcomponent = this.editComponentDetail.controls['selectedcomponent'].value;
    this.previousSelectedComp = selectedcomponent;
    rule = rule + ' ' + selectedcomponent;
    this.editComponentDetail.controls['rule'].patchValue(rule);
  }

  previousOperator = ''
  
  addOperator(event: any) {
    let rule = this.editComponentDetail.controls['rule'].value || '';
    rule = rule.replace(this.previousOperator, "");
    let operator = this.editComponentDetail.controls['operator'].value;
    this.previousOperator = operator;
    rule = rule + ' ' + operator;
    this.editComponentDetail.controls['rule'].patchValue(rule);
  }

  previousMathFunction = ''

  addMathFunction(event: any) {
    let rule = this.editComponentDetail.controls['rule'].value || '';
    rule = rule.replace(this.previousMathFunction, "");
    let mathFunction = this.editComponentDetail.controls['mathfunction'].value;
    this.previousMathFunction = mathFunction;
    rule = rule + ' ' + mathFunction;
    this.editComponentDetail.controls['rule'].patchValue(rule);
  }

  openEditorPopup() {
    const myTempDialog = this.dialog.open(this.dialogRefs, {
      data: '',
      height: '85vh',
      width: '80vw'
    });

    myTempDialog.afterClosed().subscribe(result => {
      let value = this.editComponentDetail.controls['rule'].value;
      this.editComponentDetail.patchValue({rule: value})
    });
  }

  onCodeChanged() {
    let code = this.editComponentDetail.controls['rule'].value;
    try {
    if(this.offerVLookUpJSON.length > 0) {
      let filteredData =  this.offerVLookUpJSON;
      let customFields = [ { 'State' : 'Gujrat' },{ 'Skill_Type' : 'Unskilled' } ]
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
      this.codeResult = eval(code);
    } catch(e) {
      this.codeResult = "Something is wrong!";
    }
  }

  replaceAll(str: string, find: string, replace: string) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  onFileChange(event: any) {
    let target: DataTransfer = (event.target) as DataTransfer;
    let file = event.target.files[0];
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    reader.onload = (e: any) => {
      // / create workbook /
      const binarystr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });
      // selected the first sheet 
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      this.updateVlookUpDocument(data);
    };
  }

  updateVlookUpDocument(data: any) {
    const payload = {
      offertemplateid: this.templateid,
      exceldata: data
    }

    this.templateService.updateVlookUpByTemplateId(payload).subscribe((res: any)=>{
      if(res.error) {
        this.snackBar.open(res.message);
      } else {
        this.editOfferDetail.markAsDirty();
        if(res.data.modifiedCount == 0 && data.length > 0) {
          this.saveOfferVLookUpdetails(this.templateid, data);
        } else {
          this.snackBar.open(res.message);
        }

      }
    })
  }


  saveOfferVLookUpdetails(templateid: string, data: any) {
    if(data.length > 0) {
      const payload = {
        offertemplateid: templateid,
        exceldata: data
      }
      this.templateService.createVlookUpDocRecord(payload).subscribe(res=> {
        if(res.error) {
          this.snackBar.open(res.message);
        } else {
          this.snackBar.open(res.message);
        }
      }) 
    }
  }

}
