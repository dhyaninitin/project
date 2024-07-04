import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { BranchActionComponent } from './action-master/branch-action/branch-action.component';
import { DelayActionComponent } from './action-master/delay-action/delay-action.component';
import { EmailActionComponent } from './action-master/email-action/email-action.component';
import { SmsActionComponent } from './action-master/sms-action/sms-action.component';
import { ActionModalComponent } from './action-modal/action-modal.component';
import { TriggerMasterComponent } from './trigger-master/trigger-master.component';
import { TriggerModalComponent } from './trigger-modal/trigger-modal.component';
import { PanZoomConfig, PanZoomAPI, PanZoomModel, PanZoomConfigOptions } from 'ngx-panzoom';
import { dataSelector as profileDataSelector } from 'app/store/auth/authentication.selector';
import { AppState } from 'app/store';
import { Store } from '@ngrx/store';
import { Profile } from 'app/shared/models/user.model';
import { diff } from 'deep-diff';
import { EnrollmentTriggerActionComponent } from './action-master/enrollment-trigger-action/enrollment-trigger-action.component';
import { PropertyActionComponent } from './action-master/property-action/property-action.component';
import { CreateDealActionComponent } from './action-master/create-deal-action/create-deal-action.component';
import { v4 as uuidv4 } from 'uuid';
import { WebhookActionComponent } from './action-master/webhook-action/webhook-action.component';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  panZoomConfig: PanZoomConfig = new PanZoomConfig({
    neutralZoomLevel: 2
  });
  public itemForm: FormGroup;
  actions:any = [];
  triggers = [];
  data: any;
  private _jsonURL = 'assets/workflow_data.json';
  counter: number = 0;
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

  obj = {
    triggers: [],
    actions: []
    // workflowname: null,
  };

  components = [];
  componentsJson = [];
  isEdit: boolean = false;
  workflowAction_olddata: Array<{}> = [];
  userProfile: Profile;
  workflowId: number;
  minWidth:number = 100;
  branchesList: any[];
  activeUrl: boolean = false;
  copyJson: any;
  cloneActionJson:any;
  isBranchAction: boolean = false;
  @Output() workflow_data: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private service$: WorkflowService,
    private dialog: MatDialog,
    private _cdr: ChangeDetectorRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private route: ActivatedRoute,
    private router: Router,
    private confirmService$: AppConfirmService,
    private loader$: AppLoaderService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>,
    private elementRef: ElementRef,
    public workFlowService$:WorkflowService
  ) {
    // service.addDynamicComponent()
    this.initform();
  }

  ngOnDestroy(): void {
    this.service$.setCloneWorkflowId = null;
  }

  ngOnInit() {
    if(this.workFlowService$.setCloneWorkflowId && !this.isEdit){
      this.isEdit = false;
      const id = this.workFlowService$.setCloneWorkflowId;
      this.getWorkFlow(id, 'clone');
    }

    this.route.params.subscribe(res => {
      if(res?.id) {
        this.activeUrl = true;
        this.getWorkFlow(res.id);
      }
    })
  }
  
  getEnrollmentCount(workflowId : number) {
    this.workFlowService$.getEnrollmentCount(workflowId).subscribe(res => {
      if(res && res?.data?.length){
        this.workFlowService$.enrollmentsCount.next(res.data);
        this._cdr.detectChanges();
      } else {
        this.workFlowService$.enrollmentsCount.next([]);
      }
    })
  }

  ngAfterContentInit() {
    
    this.workFlowService$.workflowCopyData.subscribe(
      (data: any) => {
        this.copyJson = {...data.container};
      }
    );
    this.workFlowService$.workflowCopyStatus.subscribe((data:any)=>{
      if(data && this.copyJson){
          this.copyJson.id = uuidv4();
          this.insertDataRecursive(this.actions, data.sequenceId, this.copyJson, data.value);
          this.obj.actions = this.actions;
          this.obj.triggers = this.triggers;
          this.obj.actions = this.actions;
          this.updateSequenceIds(this.obj.actions);
          this.generateWorkflow(this.obj);
          this.snack$.open("Action copied successfully", 'OK', {
            verticalPosition: 'top',
            panelClass: ['snack-success'],
            duration: 5000,
          });
          this._cdr.detectChanges();
      }else{
          this.snack$.open("First copy the action and then try again", 'OK', {
            verticalPosition: 'top',
            panelClass: ['snack-warning'],
            duration: 5000,
          });
      }
    });

    this.workFlowService$.workflowCloneData.subscribe((cloneData:any)=>{
      if(cloneData){
        if(cloneData.cloneStatus){
          this.cloneActionJson = cloneData.data;
          this.checkAndEnableAcionButton(this.actions,true);
        }else{
          this.cloneActionJson = this.getCloneJsonFromActionJson(this.actions, cloneData.sequenceId);
          this.checkAndEnableAcionButton(this.actions,false);
        }
      }
    });

    this.workFlowService$.workflowActionData.subscribe((data:any)=>{
      if(data && this.cloneActionJson){
        let cloneShallowCopy = null;
        let checkDataType = false;
        if (this.cloneActionJson !== null && typeof this.cloneActionJson === 'object' && !Array.isArray(this.cloneActionJson)) {
          cloneShallowCopy = {...this.cloneActionJson};
          cloneShallowCopy.id = uuidv4();
        }else if(Array.isArray(this.cloneActionJson)){
          cloneShallowCopy = JSON.parse(JSON.stringify(this.cloneActionJson));
          cloneShallowCopy.map(el=>{
            return el.id = uuidv4();
          })
          checkDataType = true;
        }
          this.insertJsonAtSeqId(this.actions, data.sequenceId, cloneShallowCopy, data.containerName);
          this.obj.triggers = this.triggers;
          this.obj.actions = this.actions;
          this.updateSequenceIds(this.obj.actions);
          this.generateWorkflow(this.obj);
          if (checkDataType) {
            this.resizeWorkflow("end");
            this.resetZoom();
          }
          this.service$.workflowCloneStatus = false;
          this.snack$.open("Action cloned successfully", 'OK', {
            verticalPosition: 'top',
            panelClass: ['snack-success'],
            duration: 3000,
          });
          this._cdr.detectChanges();
      }
    });

  }

  insertJsonAtSeqId(existingJson: any[], seqIdToInsert: number, jsonToInsert: any,actionStatus:any): boolean {

      const insertIndex = existingJson.findIndex(item => item.seq_id === seqIdToInsert);
      if(insertIndex === 0){
        this.addCloneJson(existingJson,jsonToInsert,seqIdToInsert,actionStatus,insertIndex);
        return true;
      }else if (insertIndex !== -1) {
        this.addCloneJson(existingJson,jsonToInsert,seqIdToInsert,actionStatus,insertIndex);
        return true;
      } else {
          for (const item of existingJson) {
              if (item.ifbranchdata) {
                  this.insertJsonAtSeqId(item.ifbranchdata, seqIdToInsert, jsonToInsert,actionStatus);
                  return true;
              }
              if (item.thenbranchdata) {
                  this.insertJsonAtSeqId(item.thenbranchdata, seqIdToInsert, jsonToInsert,actionStatus);
                  return true;
              }
          }
      }
      return true;
  }

  addCloneJson(existingJson:any[],jsonToInsert:any,seqIdToInsert:number,actionStatus:any,insertIndex){
      if (existingJson.some(item => item.ifbranchdata && item.seq_id === seqIdToInsert) && actionStatus === 0) {
        // If existingJson is a branch, add jsonToInsert under ifbranchdata
        const ifBranchItem = existingJson.find(item => item.ifbranchdata && item.seq_id === seqIdToInsert);
        if (jsonToInsert !== null && typeof jsonToInsert === 'object' && !Array.isArray(jsonToInsert)) {
          ifBranchItem.ifbranchdata.push(jsonToInsert);
        } else if (Array.isArray(jsonToInsert)) {
          ifBranchItem.ifbranchdata.push(...jsonToInsert);
        }
    }else if (existingJson.some(item => item.thenbranchdata && item.seq_id === seqIdToInsert) && actionStatus === 1) {
      // If existingJson is a branch, add jsonToInsert under ifbranchdata
      const thenBranchItem = existingJson.find(item => item.thenbranchdata && item.seq_id === seqIdToInsert);
      if (jsonToInsert !== null && typeof jsonToInsert === 'object' && !Array.isArray(jsonToInsert)) {
        thenBranchItem.thenbranchdata.push(jsonToInsert);
      } else if (Array.isArray(jsonToInsert)) {
        thenBranchItem.thenbranchdata.push(...jsonToInsert);
      }
    } else {
        // Insert at the beginning of the array
        if (jsonToInsert !== null && typeof jsonToInsert === 'object' && !Array.isArray(jsonToInsert)) {
          existingJson.splice(insertIndex + 1 , 0, jsonToInsert);
        } else if (Array.isArray(jsonToInsert)) {
          existingJson.splice(insertIndex + 1 , 0, ...jsonToInsert);
        }
    }
    return true;
  }


  checkAndEnableAcionButton(actions:any[],status:boolean){
    this.findLastSeqIdIndex(actions,status);
    this.obj.triggers = this.triggers;
    this.obj.actions = this.actions;
    this.generateWorkflow(this.obj);
    this._cdr.detectChanges();
    return true;
  }

  findLastSeqIdIndex(data: any[],status:boolean, lastIndex: number = -1, keyToAdd: string = 'cloneActionButtonStatus'): number {
    for (const item of data) {
      item.cloneActionButtonStatus = !status ? 0 : 1;

        if (item.seq_id && item.seq_id > lastIndex) {
            lastIndex = item.seq_id;
        }
        if (item.ifbranchdata) {
            lastIndex = this.findLastSeqIdIndex(item.ifbranchdata,status, lastIndex);
        }
        if (item.thenbranchdata) {
            lastIndex = this.findLastSeqIdIndex(item.thenbranchdata,status, lastIndex);
        }
    }
    if(!status){
      if (lastIndex !== -1 && keyToAdd !== null) {
          const lastItem = data.find(item => item.seq_id === lastIndex);
          if (lastItem) {
            lastItem[keyToAdd] = 1;
          }
      }
    }
    return lastIndex;
  }

  getCloneJsonFromActionJson(actionData:any[], sequenceId){
    const index = actionData.findIndex(actionItem => actionItem.seq_id === sequenceId);
    const clonedJsonArray = actionData.slice(index);
    return clonedJsonArray;
  }

  insertDataRecursive(data: any[], seqId: number, newData: any, insertAt: string): boolean {
    const shallowCopy = Object.assign({}, newData);
    const index = data.findIndex(item => item.seq_id === seqId);

    if (index !== -1 || seqId === null || seqId === undefined) {
      const insertIndex = index !== -1 ? (insertAt === 'after' ? index + 1 : index) : 0;
      data.splice(insertIndex, 0, shallowCopy);
      return true;
    }  

    for (const item of data) {
      if (item.ifbranchdata && item.ifbranchdata.length > 0) {
        if (this.insertDataRecursive(item.ifbranchdata, seqId, newData, insertAt)) {
          return true;
        }
      }
  
      if (item.thenbranchdata && item.ifbranchdata.length > 0) {
        if (this.insertDataRecursive(item.thenbranchdata, seqId, newData, insertAt)) {
          return true;
        }
      }
    }
  }

  getWorkFlow(id, type?){
    if (id) {
      this.loader$.open();
      if(!this.workFlowService$.setCloneWorkflowId){
        this.isEdit = true;
      }
      this.service$.getworkflow(id).subscribe((result: any) => {
        if (result) {
          if(!type){
            this.workflowId = result.data[0].id;
          }
          this.workflow_data.emit(result?.data[0]);
          let workflow_data = result.data[0].workflow_payload;
          this.triggers = workflow_data.triggers;
          this.actions = workflow_data.actions;

          if(this.isEdit) {
            this.getEnrollmentCount(this.workflowId);
          }
          // this.actions = this.dummyData;
          this.workflowAction_olddata = JSON.parse(JSON.stringify(workflow_data.actions));
          this.generateWorkflow(workflow_data);
          this.itemForm.patchValue({ name:result.data[0].title  })
          if(type){
            this.assignIdToCloneActions(this.actions)
            this.itemForm.patchValue({ name:'Clone - ' + result.data[0].title  });
            this.resetZoom();
            this.resizeWorkflow("start");
          }
          this.activeUrl = false;
          this.loader$.close();
          }
        });

        this.store$
          .select(profileDataSelector)
          .pipe(
            takeUntil(this.onDestroy$),
            tap((profile: Profile) => {
              this.userProfile = profile;
            })
          )
          .subscribe();
      }
  }

  assignIdToCloneActions(actions : any){
    actions.map(el =>{
      el.id = uuidv4();
      if(el.actionName == 'Branch'){
        this.assignIdToCloneActions(el.ifbranchdata);
        this.assignIdToCloneActions(el.thenbranchdata);
      }
    })
  }

  initform() {
    this.itemForm = this.fb.group({
      name: null,
    })
    this.itemForm.patchValue({ name: 'Unnamed workflow' })
  }

  addDelayAction(data: any, container: ViewContainerRef) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(DelayActionComponent)
    const componentRef = container.createComponent(componentFactory);
    // Push the component so that we can keep track of which components are created

    componentRef.instance.id = this.components.length + 1;
    componentRef.instance.data = data;
    this.components.push(componentRef);
    componentRef.instance.output.subscribe((results) => {

      switch (results.value) {
        case 'add_action':
          this.action(results.container, results.action_id, results.sequence_id, 'Delay');
          break;
        case 'delete_action':
            this.deleteAction(results.sequence_id);
          break;
        case 'edit_action':
            this.editAction(results.action_id,results.sequence_id, results.data,'Delay');
          break;

        default:
          break;
      }

    });
    this._cdr.detectChanges();
    return componentRef;
  }

  addBranchAction(data: any, container: any) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(BranchActionComponent)
    const componentRef = container.createComponent(componentFactory);

    // componentRef.instance.id = this.components.length + 1;
    componentRef.instance.data = data;
    this.components.push(componentRef);
    componentRef.instance.output.subscribe((results) => {

      switch (results.value) {
        case 'add_action':
          this.action(results.container, results.action_id, results.sequence_id, 'Branch', results.data);
          break;
        case 'delete_action':
            this.deleteAction(results.sequence_id);
          break;
        case 'edit_action':
            this.editAction(results.action_id,results.sequence_id, results.data,'Branch');
          break;
        case 'add_condition':
            this.branchTrigger(results.data.condtion, results.data, results.data.seq_id, results.data.arrayindex);
          break;

        case 'delete_condition':
            this.deleteBranchCondition(results.data.level, results.data.index, results.data.seq_id);
          break;

        case 'edit_condition':
            this.editBranchCondition(results.data.triggerCondition, results.data.level, results.data.seq_id, results.data.index)
            break;
          
        case 'delete_group':
            this.deleteBranchGroup(results.data.index, results.data.seq_id)

        default:
          break;
      }
    });
    this._cdr.detectChanges();
    return componentRef;
  }

  addemailAction(data: any, container: any) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(EmailActionComponent)
    const componentRef = container.createComponent(componentFactory);

    // this.components.push({data:data,parent:null});
    componentRef.instance.id = this.components.length + 1;
    componentRef.instance.data = data;
    this.components.push(componentRef);
    componentRef.instance.output.subscribe((results) => {
      switch (results.value) {
        case 'add_action':
          this.action(results.container, results.action_id, results.sequence_id, 'Send Marketing/Transactional Email');
          break;
        case 'delete_action':
            this.deleteAction(results.sequence_id);
          break;
        case 'edit_action':
            this.editAction(results.action_id,results.sequence_id, results.data,'Send Marketing/Transactional Email');
          break;

        default:
          break;
      }
    });
    this._cdr.detectChanges();
    return componentRef;
  }

  addDirectEmailAction(data: any, container: any) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(EmailActionComponent)
    const componentRef = container.createComponent(componentFactory);

    // this.components.push({data:data,parent:null});
    componentRef.instance.id = this.components.length + 1;
    componentRef.instance.data = data;
    this.components.push(componentRef);
    componentRef.instance.output.subscribe((results) => {
      switch (results.value) {
        case 'add_action':
          this.action(results.container, results.action_id, results.sequence_id, 'Send Direct Email');
          break;
        case 'delete_action':
            this.deleteAction(results.sequence_id);
          break;
        case 'edit_action':
            this.editAction(results.action_id,results.sequence_id, results.data,'Send Direct Email');
          break;

        default:
          break;
      }
    });
    this._cdr.detectChanges();
    return componentRef;
  }

  addsmsAction(data: any, container: any){
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(SmsActionComponent)
    const componentRef = container.createComponent(componentFactory);
    componentRef.instance.id = this.components.length + 1;
    componentRef.instance.data = data;
    this.components.push(componentRef);
    componentRef.instance.output.subscribe((results) => {
      switch (results.value) {
        case 'add_action':
          this.action(results.container, results.action_id, results.sequence_id, 'Send SMS');
          break;
        case 'delete_action':
            this.deleteAction(results.sequence_id);
          break;
        case 'edit_action':
            this.editAction(results.action_id,results.sequence_id, results.data,'Send SMS');
          break;

        default:
          break;
      }
    });
    this._cdr.detectChanges();
    return componentRef;
  }

  addEnrollmentTriggerAction(data: any, container: any){
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(EnrollmentTriggerActionComponent)
    const componentRef = container.createComponent(componentFactory);
    componentRef.instance.id = this.components.length + 1;
    componentRef.instance.data = data;
    this.components.push(componentRef);
    componentRef.instance.output.subscribe((results) => {
      switch (results.value) {
        case 'add_action':
          this.action(results.container, results.action_id, results.sequence_id, 'Enrollment');
          break;
        case 'delete_action':
          this.deleteAction(results.sequence_id);
          break;
        case 'edit_action':
          this.editAction(results.action_id,results.sequence_id, results.data,'Enrollment');
          break;
        case 'add_condition_action':
          this.addEditMultipleEnrollmentTriggerCondition(results, 1);
          break;
        case 'edit_condition_action':
          this.addEditMultipleEnrollmentTriggerCondition(results, 2);
          break
        default:
          break;
      }
    });
    this._cdr.detectChanges();
    return componentRef;
  }

  addPropertyAction(data: any, container: any){
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PropertyActionComponent)
    const componentRef = container.createComponent(componentFactory);
    componentRef.instance.id = this.components.length + 1;
    componentRef.instance.data = data;
    this.components.push(componentRef);
    componentRef.instance.output.subscribe((results) => {
      switch (results.value) {
        case 'add_action':
          this.action(results.container, results.action_id, results.sequence_id, 'Update Property');
          break;
        case 'delete_action':
            this.deleteAction(results.sequence_id);
          break;
        case 'edit_action':
            this.editAction(results.action_id,results.sequence_id, results.data, 'Update Property');
          break;

        default:
          break;
      }
    });
    this._cdr.detectChanges();
    return componentRef;
  }

  addTrigger(data: any) {  
    if (data.length > 0) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TriggerMasterComponent)
      let componentRef = this.container.createComponent(componentFactory);

      componentRef.instance.triggers = data;
      componentRef.instance.output.subscribe((results) => {
        switch (results.value) {
          case 'add_action':
            this.action(results.container, results.action_id, results.sequence_id, 'Trigger');
            break;

          case 'add_contidion':
            this.onAddcondition(results.data.condtion, results.data.triggertype, results.data.arrayindex);
            break;

          case 'delete_condition':
            this.deleteTriggerCondition(results.data.level, results.data.index);
            break;
          
          case 'edit_condition':
            this.editTriggerCondition(results.data.triggerCondition, results.data.level, results.data.index)
            break;
          
          case 'delete_group':
            this.deleteGroup(results.data.index)

          default:
            break;
        }

      });
      this._cdr.detectChanges();
      return componentRef;
    }
  }

  createDealAction(data: any, container: any) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(CreateDealActionComponent)
    const componentRef = container.createComponent(componentFactory);

    // this.components.push({data:data,parent:null});
    componentRef.instance.id = this.components.length + 1;
    componentRef.instance.data = data;
    this.components.push(componentRef);
    componentRef.instance.output.subscribe((results) => {
      switch (results.value) {
        case 'add_action':
          this.action(results.container, results.action_id, results.sequence_id, 'Create Deal');
          break;
        case 'delete_action':
            this.deleteAction(results.sequence_id);
          break;
        case 'edit_action':
            this.editAction(results.action_id,results.sequence_id, results.data,'Create Deal');
          break;

        default:
          break;
      }
    });
    this._cdr.detectChanges();
    return componentRef;
  }

  createSendWebhookAction(data: any, container: any) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(WebhookActionComponent)
    const componentRef = container.createComponent(componentFactory);

    // this.components.push({data:data,parent:null});
    componentRef.instance.id = this.components.length + 1;
    componentRef.instance.data = data;
    this.components.push(componentRef);
    componentRef.instance.output.subscribe((results) => {
      switch (results.value) {
        case 'add_action':
          this.action(results.container, results.action_id, results.sequence_id, 'Send a Webhook');
          break;
        case 'delete_action':
            this.deleteAction(results.sequence_id);
          break;
        case 'edit_action':
            this.editAction(results.action_id,results.sequence_id, results.data,'Send a Webhook');
          break;

        default:
          break;
      }
    });
    this._cdr.detectChanges();
    return componentRef;
  }

  trigger(conditions?, conditionval?, triggerindex?) {
    const title = 'Create Trigger';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      TriggerModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: { title: title, conditionval: conditionval, isEdit: false },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (res != null) {
        res.conditionname = 'AND';
        if (conditions == 'AND' || conditions == 'OR') {
          if(conditions == 'AND'){
            // if (this.triggers[triggerindex]['multivalue'].length >= 0) {
            //   res.conditionname = conditions;
            //   this.triggers[triggerindex]['multivalue'].push(res);
            // }
            this.triggers[triggerindex].push(res);
          }else{
            this.triggers.push([res]);
          }
        } else {
          this.triggers.push([res]);
          this.obj.triggers = this.triggers;
          this.generateWorkflow(this.obj);
        }

        this._cdr.detectChanges();
        return;
      }
    });
  }


  action(child_container?: any, response_parent?: any, sequence_id?: number, action_name?: string, child_containerName?: any) {

    const title = 'Choose an action';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      ActionModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: { title: title },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if(sequence_id == undefined) {
        this.counter = this.counter + 1;
      } else {
        this.counter = sequence_id + 1;
      }

      if (res != null) {
        if (res.actionName == 'Branch') {
          this.isBranchAction = true;
        } else {
          this.isBranchAction = false;
        }
        res.seq_id = this.counter;
        if(this.actions[this.actions.length -1]?.actionName == 'Branch') {
          if(child_containerName == 0) {
            const branchAction = this.actions[this.actions.length - 1];
            if(branchAction.thenbranchdata.length  > 0) {
              res.seq_id = res.seq_id + 1;
            }
          } else {
            const branchAction = this.actions[this.actions.length - 1];
            if(branchAction.ifbranchdata.length  > 0) {
              res.seq_id = res.seq_id + 1;
            }
          }
        }

        if (action_name == 'Trigger') {
          this.actions.unshift(res);
        } else {
          let arr = this.searchAndSaveActions(this.actions.slice(), res, action_name, sequence_id, child_containerName);
          this.actions = arr.slice();
        }
        this.obj.triggers = this.triggers;
        const filterActions = this.actions.slice()
        this.updateSequenceIds(filterActions)
        this.obj.actions = filterActions;
        this.generateWorkflow(this.obj);
        this._cdr.detectChanges();
        return;
      }
    });
  }

  updateSequenceIds(data: any[], currentSeqId: number = 1): number {
    let updatedSeqId = currentSeqId;
  
    for (const item of data) {
      if (item.seq_id !== undefined) {
        item.seq_id = updatedSeqId;
        updatedSeqId++;
        
        if (item.ifbranchdata && Array.isArray(item.ifbranchdata)) {
          updatedSeqId = this.updateSequenceIds(item.ifbranchdata, updatedSeqId);
        }
        if (item.thenbranchdata && Array.isArray(item.thenbranchdata)) {
          updatedSeqId = this.updateSequenceIds(item.thenbranchdata, updatedSeqId);
        }
      }
    }
  
    return updatedSeqId;
  }


    deleteAction(sequence_id?: number, action_name?: string) {
      this.confirmService$
        .confirm({
          message: `Are you sure you wish to delete this action? This is permanent and cannot be undone.`,
        })
        .subscribe(res => {
          if (res) {
            this.deleteActions(sequence_id)
            this.obj.actions = this.actions;
            this.generateWorkflow(this.obj);
          }
        });
    }

    deleteActions(sequence_id: number) {
      this.actions = this.searchAndUpdateActions(this.actions, null, sequence_id, 0, 'delete');
      this.actions = this.searchAndUpdateActions(this.actions, null, sequence_id, 1, 'delete');
      this.obj.actions = this.actions;
      this.obj.triggers = this.triggers;
      this.generateWorkflow(this.obj);
    }

    editAction(actionId: number,sequence_id:number, delayData: any, actionName:any,) {
      this.actions = this.searchAndUpdateActions(this.actions, delayData, sequence_id, 0, 'edit');
      this.actions = this.searchAndUpdateActions(this.actions, delayData, sequence_id, 1, 'edit');
      this.obj.actions = this.actions;
      this.obj.triggers = this.triggers;
      this.generateWorkflow(this.obj);
    }
  

  searchAndUpdateActions(actionsArray: any, data: any, sequence_id: number, branchType: number, opertaionType: string) {
      actionsArray.forEach(action => {
        if (action.actionName == 'Branch') {
          if (action.seq_id == sequence_id) {
            const search_index = actionsArray.findIndex(x => x.seq_id == sequence_id);
            if(search_index != -1) {
              if(opertaionType == 'edit') {
                actionsArray[search_index] = data;
              } else {
                actionsArray.splice(search_index, 1);
              }
            }
          } else {
            if(branchType == 0) {
              this.searchAndUpdateActions(action.ifbranchdata, data, sequence_id, branchType, opertaionType);
              this.searchAndUpdateActions(action.thenbranchdata, data, sequence_id, branchType, opertaionType);
            } else {
              this.searchAndUpdateActions(action.ifbranchdata, data, sequence_id, branchType, opertaionType);
              this.searchAndUpdateActions(action.thenbranchdata, data, sequence_id, branchType, opertaionType);
            }
          }
        } else {
          if (action.seq_id == sequence_id) {
            const search_index = actionsArray.findIndex(x => x.seq_id == sequence_id);
            if(search_index != -1) {
              if(opertaionType == 'edit') {
                actionsArray[search_index] = data;
              } else {
                actionsArray.splice(search_index, 1);
              }
            }
          }
        }
      });
      return actionsArray;
  }


  searchAndSaveActions(actionsArray, data, matchingTitle, sequence_id, child_containerName) {
    actionsArray.forEach(action => {
      if (action.actionName == 'Branch') {
        if (action.seq_id == sequence_id) {
          if (child_containerName == 0) {
            if (action.seq_id == sequence_id) {
              action.ifbranchdata.unshift(data);
            } else {
              const search_index = action.ifbranchdata.findIndex(x => x.seq_id == sequence_id);
              if (search_index == -1) {
                action.ifbranchdata.push(data)
              } else {
                action.ifbranchdata.splice(search_index + 1, 0, data);
              }
            }
          } else {
            if (action.seq_id == sequence_id) {
              action.thenbranchdata.unshift(data);
            } else {
              const search_index = action.thenbranchdata.findIndex(x => x.seq_id == sequence_id);
              if (search_index == -1) {
                action.thenbranchdata.push(data)
              } else {
                action.thenbranchdata.splice(search_index + 1, 0, data);
              }
            }
          }

        } else {
          this.searchAndSaveActions(action.ifbranchdata, data, "", sequence_id, child_containerName);
          this.searchAndSaveActions(action.thenbranchdata, data, "", sequence_id, child_containerName);
        }
      } else {
        if (action.seq_id == sequence_id) {
          const search_index = actionsArray.findIndex(x => x.seq_id == sequence_id);
          actionsArray.splice(search_index + 1, 0, data);
        }

      }

    });
    return actionsArray;
  }

  onAddcondition($event, typeval, index) {
    this.trigger($event, typeval, index);
  }


  generateWorkflow(jsonData: any) {
    this.container.clear();
    var actionContainerRef;
    var triggers = jsonData.triggers;
    var actions = jsonData.actions;
    if (triggers) {
      this.addTrigger(triggers);
    }
    if (actions) {
      actions.forEach(element => {

        actionContainerRef = this.renderActions(element, null);
      });
    }

    const branchObjects = this.getBranchObjects(actions, 'Branch');
    if(!this.isEdit) this.activeUrl = false;
    if(branchObjects && branchObjects.length){
      this.increaseWidth(branchObjects.length)
    }
  }

  renderActions(action: any, containerRef) {
    if (action.actionName == 'Delay') {

      this.addDelayAction(action, !containerRef ? this.container : containerRef);
      containerRef = null;
    }

    else if (action.actionName == 'Branch') {
      containerRef = this.addBranchAction(action, !containerRef ? this.container : containerRef);
      if (action.ifbranchdata) {

        action.ifbranchdata.forEach(element => {
          this.renderActions(element, containerRef.instance.branch_true)
        });

      } if (action.thenbranchdata) {
        action.thenbranchdata.forEach(element => {
          this.renderActions(element, containerRef.instance.branch_false)
        });

      }
    }

    else if (action.actionName == 'Send Marketing/Transactional Email') {
      this.addemailAction(action, !containerRef ? this.container : containerRef);
      containerRef = null;
    }

    else if (action.actionName == 'Send SMS') {
      this.addsmsAction(action, !containerRef ? this.container : containerRef);
      containerRef = null;
    }

    else if (action.actionName == 'Enrollment') {
      this.addEnrollmentTriggerAction(action, !containerRef ? this.container : containerRef);
      containerRef = null;
    }

    else if (action.actionName == 'Update Property') {
      this.addPropertyAction(action, !containerRef ? this.container : containerRef);
      containerRef = null;
    }

    else if (action.actionName == 'Send Direct Email') {
      this.addDirectEmailAction(action, !containerRef ? this.container : containerRef);
      containerRef = null;
    }

    else if (action.actionName == 'Create Deal') {
      this.createDealAction(action, !containerRef ? this.container : containerRef);
      containerRef = null;
    }

    else if (action.actionName == 'Send a Webhook') {
      this.createSendWebhookAction(action, !containerRef ? this.container : containerRef);
      containerRef = null;
    }

    this._cdr.detectChanges();
    return containerRef;
  }

  workflow() {
    let workflowObject = {
      workflowname: this.itemForm.value.name,
      trigger: this.triggers,
      action: this.actions,
      workflow_payload: null,
    };
    this.loader$.open();
    if(this.isEdit) {
      this.route.params.subscribe(res => {
        if (res.id) {
          this.service$.updateWorkflow(res.id , workflowObject).subscribe((res: any) => {
            if (res) {
              this.data = res.data;
              this.loader$.close();
              this.snack$.open(res.message, 'OK', {
                verticalPosition: 'top',
                panelClass: ['snack-success'],
                duration: 3000
              });
            }
          });
        }
      })
    } else {
      this.service$.storeWorkflow(workflowObject).subscribe((res: any) => {
        if (res) {
          this.data = res.data;
          this.loader$.close();
          this.snack$.open(res.message, 'OK', {
            verticalPosition: 'top',
            panelClass: ['snack-success'],
            duration: 3000
          });
          this.router.navigateByUrl('/workflows');
        }
      });
    }
  }

  editTriggerCondition(triggerCondition: any, level: number, index: number) {
    const title = 'Edit Trigger';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      TriggerModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: { title: title, data: triggerCondition, isEdit: true },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
  
      if (res != null) {
        this.triggers[level][index] = res;
        // if(level == 0) {
        //   res['multivalue'] = this.triggers[index].multivalue;
        //   this.triggers[index] = res;
        // } else {
        //   this.triggers[0].multivalue[index] = res;
        // }
        this.obj.triggers = this.triggers;
        this.obj.actions = this.actions;
        this.generateWorkflow(this.obj);
        this._cdr.detectChanges();
        return;
      }
    });
  }

  deleteTriggerCondition(level: number, index: number) {
    this.confirmService$
    .confirm({
      message: `Are you sure you wish to delete this trigger condition? This is permanent and cannot be undone.`,
    })
    .subscribe(res => {
      if (res) {
        // if(level == 0) {
        //   this.triggers.splice(index, 1);
        // } else {
        //   this.triggers[0].multivalue.splice(index, 1);
        // }\
        if (this.triggers.length === 1) {
          if (this.triggers[0].length === 1) {
            this.triggers.splice(index, 1);
            localStorage.removeItem('show_group_condition');
          } else {
            this.triggers[0].splice(index, 1);
          }
        } else if (this.triggers[0].length === 1) {
          this.triggers.splice(level, 1);
        } else {
          this.triggers[level].splice(index, 1);
        }

        if(this.triggers.length === 0){
          this.actions = [];
        }
        this.obj.triggers = this.triggers;
        this.obj.actions = this.actions;
        this.generateWorkflow(this.obj);
        
      }
    });
  }

  searchActionHistoryLog(oldValue, newValue,workflowObject) {
    oldValue.forEach(action => {
      if (action.actionName == 'Branch') {
        const search_index = newValue.findIndex(x => x.actionName == 'Branch');
        if (action.seq_id == newValue[search_index].seq_id) {
          let oldifBranchData: Array<{}> = action.ifbranchdata;
          let newifBranchData: Array<{}> = newValue[search_index].ifbranchdata;
          this.saveActionHistoryLog(oldifBranchData, newifBranchData,workflowObject);
        }
      } else {
        const searchActionLog_index = newValue.findIndex(x => x.actionName == action.actionName);
        if (searchActionLog_index == -1) {
          this.saveActionHistoryLog(action, newValue,workflowObject);
        } else if (action.seq_id == newValue[searchActionLog_index].seq_id) {
          let oldActionData: Array<{}> = action;
          let newActionData: Array<{}> = newValue[searchActionLog_index];
          this.saveActionHistoryLog(oldActionData, newActionData,workflowObject);
        }

      }
    });
  }

  saveActionHistoryLog(temp, workflow,workflowObject) {

    let editedData = diff(temp, workflow);
    if (editedData !== undefined) {
      const copyObj = {
        target_id: this.workflowId,
        target_type: 'App\\Model\\HubspotWorkFlows',
        content: '',
        action: 'updated',
        portal_user_id: 0,
        portal_user_name: '',
        category: 'workflow'
      };
      copyObj.portal_user_id = this.userProfile.id;
      copyObj.portal_user_name = this.userProfile.full_name;

      let logMsgArray = [];
      editedData.forEach((item: any) => {
        logMsgArray.push(this.generateLogMsg(item));
      });
      copyObj.content = logMsgArray.join(',');
      if(copyObj.content.length){
        workflowObject.workflow_payload = copyObj;
      }
      return copyObj;
    }
  }

  
  generateLogMsg(item) {
    if (item.kind == 'A') {
      if (item.item.kind == 'A') { }
      else if (item.item.kind == 'E') { }
      else if (item.item.kind == 'D') { 
        if(item.lhs != undefined){
          if(item.lhs['actionName'] == 'Send SMS'){
            return `Send SMS deleted`;
          }else if(item.lhs['actionName'] ==  'email'){
            return `Email Action deleted`;
          }else if(item.lhs['actionName'] ==  'delay'){
            return `Delay Action deleted`;
          }
        }
      }
    } else if (item.kind == 'E') {

      if (item.lhs && item.lhs) {
        if (Object.keys(item.lhs).length > 4) {
          // Delete Actions
          if (item.lhs.actionName == 'Delay' || item.lhs.actionName == 'Branch' || item.lhs.actionName == 'Send Marketing/Transactional Email' || item.lhs.actionName == 'Send SMS') {
            return `${item.lhs.actionName} deleted`;
          }else if (item.path[0] === 'email' && item.path[1] === 'value') {
            return `Send Email Action updated to ${item.rhs} `;
          } else if( item.path[1] == 'email' && item.path[2] == 'value'){
            return `Send Email Action updated to ${item.rhs} `;
          }else if (item.path[0] == 'smspayload' && item.path[1] == 'value' || item.path[1] == 'smspayload' && item.path[2] == 'value') {
            return `Send Sms Action updated to ${item.rhs} `;
          } else if (item.path[0] == 'condition_value' || item.path[1] == 'condition_value') {
            return `Branch Action updated to ${item.rhs} ${item.path[1]} `;
          }
        } 
      } else if (item.path[1] == 'days') {
        return `Delay Action updated to ${item.rhs} ${item.path[1]} `;
      } else if (item.path[0] == 'hours') {
        return `Delay Action updated to ${item.rhs} ${item.path[0]} `;
      } else if (item.path[0] == 'minutes') {
        return `Delay Action updated to ${item.rhs} ${item.path[0]} `;
      } else if (item.path[0] == 'seconds') {
        return `Delay Action updated to ${item.rhs} ${item.path[0]} `;
      } else if (item.path[0] == 'days'){
        return `Delay Action updated to ${item.rhs} ${item.path[0]} `;
      }

    } else if (item.kind == 'D') {
      if (item.path[1] == 'email' || item.path[1] == 'delay' || item.path[1] == 'Send SMS' ) {
        return `${item.path[1]} deleted`;
      }
      
    }
  }

  addEditMultipleEnrollmentTriggerCondition(triggerAction: any, type: number) {
    const enrollmentTrigger = this.actions[triggerAction.sequence_id-1];
    if(type == 1) {
      enrollmentTrigger.multivalue.push(triggerAction.data);
    } else if (type == 2) {
      enrollmentTrigger.multivalue = triggerAction.data.multivalue;
    }
    this.actions[triggerAction.sequence_id-1] = enrollmentTrigger;
    this.obj.triggers = this.triggers;
    this.obj.actions = this.actions;
    this.generateWorkflow(this.obj);
    this._cdr.detectChanges();
  }

  private zoomFactor = 1;
  private zoomWrapper: HTMLElement | null = null;
  private containerPosition = { top: 0, left: 0 };
  private boundaryElement: HTMLElement | null = null;
  private minZoomFactor = 0.5;
  private maxZoomFactor = 2;

  zoomIn (): void {
    if ( this.zoomFactor < this.maxZoomFactor ) {
      this.zoomFactor += 0.1;
      this.updateZoom();
    }
  }

  zoomOut (): void {
    if ( this.zoomFactor > this.minZoomFactor ) {
      this.zoomFactor -= 0.1;
      this.updateZoom();
    }
  }

  resetZoom (): void {
    this.zoomFactor = 1;
    this.updateZoom();
  }

  private updateZoom (): void {
    const container = this.elementRef.nativeElement.querySelector( '.example-boundary .cdkDrag' );
    if ( container instanceof HTMLElement ) {
      if ( !this.zoomWrapper ) {
        // Create a wrapper element if it doesn't exist
        this.zoomWrapper = document.createElement( 'div' );
        this.zoomWrapper.classList.add( 'zoom-wrapper' );
        container.parentNode.insertBefore( this.zoomWrapper, container );
        this.zoomWrapper.appendChild( container );
      }

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const scaledContainerWidth = containerWidth * this.zoomFactor;
      const scaledContainerHeight = containerHeight * this.zoomFactor;

      // Calculate the maximum top and left positions based on the boundary and zoom factor
      let maxTop = 0;
      let maxLeft = 0;

      if ( this.boundaryElement ) {
        maxTop = this.boundaryElement.clientHeight - scaledContainerHeight;
        maxLeft = this.boundaryElement.clientWidth - scaledContainerWidth;
      }

      // Adjust the container position based on the changes in dimensions after zooming
      this.containerPosition.top = Math.max( Math.min( this.containerPosition.top, 0 ), maxTop );
      this.containerPosition.left = Math.max( Math.min( this.containerPosition.left, 0 ), maxLeft );

      // Apply the updated container position and scale to the wrapper element
      this.zoomWrapper.style.top = `${ this.containerPosition.top }px`;
      this.zoomWrapper.style.left = `${ this.containerPosition.left }px`;
      this.zoomWrapper.style.transform = `scale(${ this.zoomFactor })`;
      this.zoomWrapper.style.transformOrigin = 'top center';
    }
  }

  getBranchObjects(data: any, targetBranch: string): any[] {
    const result: any[] = [];
  
    function traverse(obj: any) {
      for (const key in obj) {
        if (key === 'actionName' && obj[key] === targetBranch) {
          result.push(obj);
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key]);
        }
      }
    }
    traverse(data);
    this.branchesList = result;
    return result;
  }

  increaseWidth(value: number) {
    const divElement = this.elementRef.nativeElement.querySelector('.main-container');
    if (divElement) {
      const newWidth = this.minWidth + value * 100;
      divElement.style.width = newWidth + 'vw';
      if(this.activeUrl){
        this.resizeWorkflow("start");
      } else {
        if(this.isBranchAction) {
          this.resizeWorkflow("end");
        }
      }
      this.isBranchAction = false;
      this._cdr.detectChanges();
    }
  }

  deleteGroup(index:number){
    if(this.triggers.length === 1) {
      localStorage.removeItem('show_group_condition');
    }
    this.confirmService$
    .confirm({
      message: `Are you sure you wish to delete this group? This is permanent and cannot be undone.`,
    })
    .subscribe(res => {
      if (res) {
        this.triggers.splice(index, 1);
        this.obj.triggers = this.triggers;
        this.obj.actions = this.actions;
        this.generateWorkflow(this.obj);
      }
    });
  }

  // grouping in branches also
  branchTrigger(conditions?, conditionval?, seq_id?, triggerindex?) {
    const branch = this.branchesList.find(item => item.seq_id === seq_id);
    const title = 'Add Condition';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      TriggerModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: { title: title, conditionval: conditionval, isEdit: false },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (res != null) {
        res.conditionname = 'AND';
        if (conditions == 'AND') {
          branch.groupValues[triggerindex].push(res);
        } else {
          branch.groupValues.push([res]);
        }
        this.obj.triggers = this.triggers;
        this.obj.actions = this.actions;
        this.generateWorkflow(this.obj);
        this._cdr.detectChanges();
        return;
      }
    });
  }

  editBranchCondition(triggerCondition: any, level: number, seq_id, index: number) {
    const title = 'Edit Condition';
    const branch = this.branchesList.find(item => item.seq_id === seq_id);
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      TriggerModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: { title: title, data: triggerCondition, isEdit: true },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (res != null) {
        branch.groupValues[level][index] = res;
        this.obj.triggers = this.triggers;
        this.obj.actions = this.actions;
        this.generateWorkflow(this.obj);
        this._cdr.detectChanges();
        return;
      }
    });
  }

  deleteBranchCondition(level: number, index: number, seq_id: number) {
    let branch = this.branchesList.find(item => item.seq_id === seq_id);
    if (!branch) return;

    this.confirmService$.confirm({
      message: `Are you sure you wish to delete this condition? This is permanent and cannot be undone.`,
    }).subscribe((res) => {
      if (res) {
        if (branch.groupValues.length === 1) {
          if (branch.groupValues[level].length === 1) {
            this.deleteActions(seq_id);
            localStorage.removeItem(`${seq_id}`);
          } else {
            branch.groupValues[level].splice(index, 1);
          }
        } else if(branch.groupValues[level].length === 1) {
          branch.groupValues.splice(level, 1);
        } else {
          branch.groupValues[level].splice(index, 1);
        }
        this.obj.triggers = this.triggers;
        this.obj.actions = this.actions;
        this.generateWorkflow(this.obj);
      }
    });
  }

  deleteBranchGroup(index: number, seq_id: number) {
    let branch = this.branchesList.find(item => item.seq_id === seq_id);
    if (!branch) return;
    if (branch.groupValues.length === 1) {
      localStorage.removeItem(`${seq_id}`);
    }
    this.confirmService$
      .confirm({
        message: `Are you sure you wish to delete this group? This is permanent and cannot be undone.`,
      })
      .subscribe(res => {
        if (res) {
          if (branch.groupValues.length === 1) {
            localStorage.removeItem(`${seq_id}`);
            this.deleteActions(seq_id);
          } else {
            branch.groupValues.splice(index, 1);
          }
          this.obj.triggers = this.triggers;
          this.obj.actions = this.actions;
          this.generateWorkflow(this.obj);
        }
    });
  }

  resizeWorkflow(position){
    // document.getElementById("scrollingDiv").scrollIntoView({
    //   behavior: "smooth",
    //   block: position,
    //   inline: "center"
    // });
    const scrollingDiv = this.elementRef.nativeElement.querySelector('#scrollingDiv');
    if (scrollingDiv) {
      const zoomLevel = window.devicePixelRatio;
      const zoomThreshold = 0.95;
      const zoomThresholdLimit = 0.85;
      const adjustedBehavior = zoomLevel <= zoomThreshold && zoomLevel >= zoomThresholdLimit ? 'auto' : 'smooth';
      scrollingDiv.scrollIntoView({
        behavior: adjustedBehavior,
        block: position,
        inline: 'center'
      });
    }
    this._cdr.detectChanges();
  }
}

