import { ChangeDetectorRef, Component, ComponentFactoryResolver, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ActionModalComponent } from '../../action-modal/action-modal.component';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';

@Component({
  selector: 'app-branch-action',
  templateUrl: './branch-action.component.html',
  styleUrls: ['./branch-action.component.scss', './../../create.component.scss']
})
export class BranchActionComponent implements OnInit, OnChanges {
  @Input('data') data: any;
  @Input('id') id: any;
  output = new Subject<any>();

  @ViewChild('branch_true', { read: ViewContainerRef }) branch_true: ViewContainerRef;
  @ViewChild('branch_false', { read: ViewContainerRef }) branch_false: ViewContainerRef;
  components = [];

  triggers = [];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver, 
    private dialog: MatDialog,
    private _cdr: ChangeDetectorRef,
    public workFlowService$:WorkflowService
    ) { }
  ngOnChanges(changes: SimpleChanges): void {
    
  }
  
  ngOnInit() {
    this.triggers = this.data.groupValues;
    this.data.showCondition = true;
    const seq_Id = localStorage.getItem(`${this.data.seq_id}`)
    if(seq_Id == this.data.seq_id){
      this.data.showCondition = false;
    }
  }

  action($event, $branchData) {

    let container_name;
    if ($event != null) {
      if ($event) {
        container_name = 0;
      } else {
        container_name = 1;
      }
    }

    let outputobj = {
      value: 'add_action',
      data: container_name,
      container: container_name == 0 ? this.branch_true : this.branch_false,
      action_id: this.id,
      sequence_id: $branchData.seq_id
    }
    this.output.next(outputobj)

  }

  editAction($branchData: any) {
    let container_name;
    const actionDialog = this.dialog.open(ActionModalComponent, {
      width: '720px',
      disableClose: true,
      data: { title: 'Edit Branch Action', data: $branchData, isEdit: true },
    });
    actionDialog.afterClosed().subscribe(res => {
      if (this.branch_true) {
        container_name = 0;
      } else {
        container_name = 1;
      }
      if (res != null) {
        res.ifbranchdata = $branchData.ifbranchdata;
        let outputobj = {
          value: 'edit_action',
          data: res,
          container: container_name == 0 ? this.branch_true : this.branch_false,
          action_id: this.id,
          sequence_id: $branchData.seq_id
        }
        this.output.next(outputobj)
      }
    })
  }

  deleteaction($branchData) {
    let outputobj = {
      value: 'delete_action',
      data: null,
      action_id: this.id,
      sequence_id: $branchData.seq_id
    }
    this.output.next(outputobj)
  }

  removeUnderscores(string: string): string {
    const tempStting = string.replace(/_/g, ' ');
    const tempArray = tempStting.split(" ");
    for (var i = 0; i < tempArray.length; i++) {
      tempArray[i] = tempArray[i].charAt(0).toUpperCase() + tempArray[i].slice(1);
    }
    return tempArray.join(" ");
  }

  getConditionValue(data: string) {
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

  // Grouping in branches

  onAddcondition($condition, triggerType, index) {
    let outputobj = {
      value: 'add_condition',
      data: { condtion: $condition, triggertype: triggerType[0].type.id, seq_id:this.data.seq_id, arrayindex: index },
    }
    this.output.next(outputobj)
  }

  deleteTrigger(level: number, index: number) {
    let outputobj = {
      value: 'delete_condition',
      data: { level: level, index: index, seq_id:this.data.seq_id },
    }
    this.output.next(outputobj)
  }

  
  editTrigger(triggerCondition: any, level: number, index: number) {
    let outputobj = {
      value: 'edit_condition',
      data: { level: level, index: index, triggerCondition: triggerCondition , seq_id:this.data.seq_id}
    }
    this.output.next(outputobj)
  }


  formatGroupCondition(triggers: any) {
    if(triggers){
      const conditionValueTextArray: string[] = [];
      triggers.forEach(obj => {
        if (obj.property) {
          conditionValueTextArray.push(`( ${this.removeUnderscores(obj.property.value)} ${this.getConditionValue(obj.condition.value)} ${(obj.condition_value)} )`)
        }
      });
      let resultString = '';
      for (const trigger of triggers) {
        let result = '';
  
        for (const item of trigger) {
          const value = item.condition_value;
          const conditionValue = this.getConditionValue(item.condition.value);
          const propertyValue = this.removeUnderscores(item.property.value);
          if (result !== '') {
            result += ' <b> AND </b> ';
          }
          result += ` ${propertyValue} ${conditionValue} ${value} `;
        }
  
        if (result.trim() !== '') {
          if (resultString !== '') {
            resultString += ' <b> OR </b> ';
          }
          resultString += ` ( ${result} ) `;
        }
      }
      return resultString.replace(/null/g, '');
    }
  }

  showGroupBox(value: boolean) {
    localStorage.setItem(`${this.data.seq_id}`, `${this.data.seq_id}`);
    this.data.showCondition = value ? 1 : 0;
    if (value) localStorage.removeItem(`${this.data.seq_id}`);

  }

  deleteGroup(index: number) {
    let outputobj = {
      value: 'delete_group',
      data: { index: index , seq_id:this.data.seq_id},
    }
    this.output.next(outputobj);
  }

  actionClone($event,item:any){
    let container_name;
    if ($event != null) {
      if ($event) {
        container_name = 0;
      } else {
        container_name = 1;
      }
    }
    let outputActionObject = {
      container: item,
      sequenceId:item.seq_id,
      value:'after',
      containerName:container_name
    }
    this.workFlowService$.workflowActionData.next(outputActionObject);
  }

}
