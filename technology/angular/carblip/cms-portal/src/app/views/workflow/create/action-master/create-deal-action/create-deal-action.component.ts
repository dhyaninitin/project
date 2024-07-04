import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActionModalComponent } from '../../action-modal/action-modal.component';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';

@Component({
  selector: 'app-create-deal-action',
  templateUrl: './create-deal-action.component.html',
  styleUrls: ['./create-deal-action.component.css', './../../create.component.scss']
})
export class CreateDealActionComponent implements OnInit {
  @Input('data') data: any;
  @Input('id') id: any;
  output = new Subject<any>();
  @ViewChild('create_deal_action', { read: ViewContainerRef }) deal_action: ViewContainerRef;
  constructor(
    private dialog:MatDialog,
    public workFlowService$:WorkflowService
    ) { }

  ngOnInit() {
  }

  action($branchData){
    let outputobj = {
      value:'add_action',
      data:null,
      container: this.deal_action,
      action_id:this.id,
      sequence_id:$branchData.seq_id
    }
    this.output.next(outputobj)
  }

  deleteaction($branchData){  
    let outputobj = {
      value:'delete_action',
      data:null,
      container: this.deal_action,
      action_id:this.id,
      sequence_id:$branchData.seq_id
    }
    this.output.next(outputobj)
  }

  editAction(data: any) {
    const title = 'Edit Deal Action';
    const actionDialog = this.dialog.open(ActionModalComponent,  {
      width: '720px',
      disableClose: true,
      data: {title: title, data: data, isEdit: true},
    });
    actionDialog.afterClosed().subscribe(res => {
      if (res != null) {
        res.seq_id = data.seq_id;
        let outputobj = {
          value:'edit_action',
          data:res,
          container: this.deal_action,
          action_id: this.id,
          sequence_id: data.seq_id
        }
        this.output.next(outputobj)
      }
    })
  }

  formatProperty(value:any){
    const fieldsValues = value.map(item => item.fields);
    return fieldsValues.join(', ');
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
