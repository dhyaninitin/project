import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-trigger-master',
  templateUrl: './trigger-master.component.html',
  styleUrls: ['./trigger-master.component.scss', './../create.component.scss']
})
export class TriggerMasterComponent implements OnInit, OnDestroy {

  @Input('triggers') triggers: any;
  output = new Subject<any>();
  public showTriggerCondition: boolean[] = [];

  constructor(
    private confirmService$: AppConfirmService,
    public workFlowService$: WorkflowService
    ) { }

  ngOnDestroy(): void {
    this.workFlowService$.showGroupBoxCondition = true;
  }

  ngOnInit() {}

  action() {
    let outputobj = {
      value: 'add_action',
      data: null
    }
    this.output.next(outputobj)
  }

  onAddcondition($condition, triggerType, index) {
    let outputobj = {
      value: 'add_contidion',
      data: { condtion: $condition, triggertype: triggerType[0].type.id, arrayindex: index },
    }
    this.output.next(outputobj)
  }

  deleteTrigger(level: number, index: number) {
    let outputobj = {
      value: 'delete_condition',
      data: { level: level, index: index },
    }
    this.output.next(outputobj)
  }

  editTrigger(triggerCondition: any, level: number, index: number) {
    let outputobj = {
      value: 'edit_condition',
      data: { level: level, index: index, triggerCondition: triggerCondition }
    }
    this.output.next(outputobj)
  }

  showTriggerBox(event: any, state: boolean, index:number) {
    if (state) {
      this.showTriggerCondition[index] = false;
    } else {
      this.showTriggerCondition[index] = true;
    }
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

  crateTriggerString(data: any) {
    let conditionString = '';
    data.forEach((item, index) => {
      if (index > 0) {
        conditionString += ' ' + '<b>' + item.conditionname + '</b>' + ' ';
      }
      conditionString += this.removeUnderscores(item.property.value) + ' ' + this.getConditionValue(item.condition.value) +
        ' ' + item.condition_value;
    });
    return '<b>' + data[0].conditionname + '</b>' + ' { ' + conditionString + ' } ';
  }

  removeUnderscores(string: string): string {
    const tempStting = string.replace(/_/g, ' ');
    const tempArray = tempStting.split(" ");
    for (var i = 0; i < tempArray.length; i++) {
      tempArray[i] = tempArray[i].charAt(0).toUpperCase() + tempArray[i].slice(1);
    }
    return tempArray.join(" ");
  }

  formatGroupCondition(triggers: any) {
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

  showGroupBox(value:boolean) {
    this.workFlowService$.showGroupBoxCondition = value;
  }

  deleteGroup(index: number) {
      let outputobj = {
        value: 'delete_group',
        data: { index: index },
      }
      this.output.next(outputobj);
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
