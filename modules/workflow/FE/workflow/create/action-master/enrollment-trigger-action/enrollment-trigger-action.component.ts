import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { Subject } from 'rxjs';
import { TriggerModalComponent } from '../../trigger-modal/trigger-modal.component';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';

@Component({
  selector: 'app-enrollment-trigger-action',
  templateUrl: './enrollment-trigger-action.component.html',
  styleUrls: ['./enrollment-trigger-action.component.scss', './../../create.component.scss']
})
export class EnrollmentTriggerActionComponent implements OnInit,OnChanges {

  @Input('data') data: any;
  @Input('id') id: any;
  output = new Subject<any>();
  constructor(
    private dialog: MatDialog,
    private confirmService$: AppConfirmService,
    public workFlowService$:WorkflowService
    ) { }
  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit() {
  }

  action(data){
    let outputobj = {
      value:'add_action',
      data:null,
      action_id:this.id,
      sequence_id:data.seq_id
    }
    this.output.next(outputobj)
  }
  
  onAddcondition(data: any, condition, triggerType, index){
    const title = 'Create Trigger Condition';
    const dialogRef = this.dialog.open(TriggerModalComponent,
      {
        width: '720px',
        disableClose: true,
        data:{ title: title, condtion: condition,triggertype: triggerType, arrayindex: index }
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (res != null) {
        res.seq_id = data.seq_id;
        res['conditionname'] = condition;
        let outputobj = {
          value:'add_condition_action',
          data: res,
          action_id: this.id,
          sequence_id: res.seq_id
        }

        this.output.next(outputobj)
      }
    });
  }

  deleteTriggerAction(data: any) {
    let outputobj = {
      value:'delete_action',
      data:null,
      action_id:this.id,
      sequence_id:data.seq_id
    }
    this.output.next(outputobj)
  }

  deleteTriggerCondition(data: any, index: number) {
    this.confirmService$
        .confirm({
          message: `Are you sure you wish to delete this action? This is permanent and cannot be undone.`,
        })
        .subscribe((res) => {
          if (res) {
            data.seq_id = data.seq_id;
            data.multivalue.splice(index, 1);
            const actionObject = {
              actionName: "Enrollment",
              action: {
                id: 5,
                value: "Enrollment",
              },
              parentContainer: null,
              event_master_id: 106,
              sequence_id: 0
            }
            let outputobj = {
              value:'edit_condition_action',
              data:{ ...actionObject, ...data },
              action_id: this.id,
              sequence_id: data.seq_id
            }
            
            this.output.next(outputobj)
          }
        });
  }

  editTrigger(trigger: any, level: number, index: number) {
    const title = 'Edit Enrollment Action';
    const dialogRef = this.dialog.open(TriggerModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: { title: title, data: trigger, isEdit: true },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (res != null) {
        res.seq_id = trigger.seq_id;
        res.multivalue = trigger?.multivalue;
        const actionObject = {
          actionName: "Enrollment",
          action: {
            id: 5,
            value: "Enrollment",
          },
          parentContainer: null,
          event_master_id: 106,
          sequence_id: 0
        }
        let outputobj = {
          value:'edit_action',
          data:{ ...actionObject, ...res },
          action_id: this.id,
          sequence_id: trigger.seq_id
        }
        
        this.output.next(outputobj)
      }
    });
  }

  editTriggerCondition(trigger: any, mutilvalue: any, index: number) {
    const title = 'Edit Enrollment Action';
    const dialogRef = this.dialog.open(TriggerModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: { title: title, data: mutilvalue, isEdit: true },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (res != null) {
        res.seq_id = trigger.seq_id;
        res['conditionname'] = mutilvalue.conditionname;
        trigger.multivalue[index] = res;
        let outputobj = {
          value:'edit_condition_action',
          data: trigger,
          action_id: this.id,
          sequence_id: trigger.seq_id
        }
        
        this.output.next(outputobj)
      }
    });
  }


  removeUnderscores(string: string): string {
    const tempStting =  string.replace(/_/g, ' ');
    const tempArray = tempStting.split(" ");
    for (var i = 0; i < tempArray.length; i++) {
     tempArray[i] = tempArray[i].charAt(0).toUpperCase() + tempArray[i].slice(1);
     } 
     return tempArray.join(" ");
  }

  getConditionValue(data:string){
    switch (data) {
      case 'Equals':
        return "=";
      case 'Does not equal':
        return "!=";
      case 'known':
        return "known";
      case 'unknown':
        return "unknown";
      default:
        return "";
    }
  }

  actionClone(item:any){
    let outputActionObject = {
      container: item,
      sequenceId:item.seq_id,
      value:'after'
    }
    this.workFlowService$.workflowActionData.next(outputActionObject);
  }

}
