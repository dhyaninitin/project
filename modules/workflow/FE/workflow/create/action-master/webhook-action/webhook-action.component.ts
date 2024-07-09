import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { ActionModalComponent } from '../../action-modal/action-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';

@Component({
  selector: 'app-webhook-action',
  templateUrl: './webhook-action.component.html',
  styleUrls: ['./webhook-action.component.scss', './../../create.component.scss']
})
export class WebhookActionComponent implements OnInit {
  @Input('data') data: any;
  @Input('id') id: any;
  output = new Subject<any>();
  @ViewChild('webhook_action', { read: ViewContainerRef }) webhook_action: ViewContainerRef;
  constructor(
    private dialog: MatDialog,
    public workFlowService$: WorkflowService) { }

  ngOnInit(): void {}

  action(webhookDetails){
    let outputobj = {
      value:'add_action',
      data:null,
      container: this.webhook_action,
      action_id: this.id,
      sequence_id: webhookDetails.seq_id
    }
    this.output.next(outputobj)
  }

  deleteaction(webhookDetails){  
    let outputobj = {
      value:'delete_action',
      data:null,
      container: this.webhook_action,
      action_id:this.id,
      sequence_id: webhookDetails.seq_id
    }
    this.output.next(outputobj)
  }

  editAction(webhook: any) {
    const title = 'Edit Send a Webhook Action';
    const actionDialog = this.dialog.open(ActionModalComponent,  {
      width: '720px',
      disableClose: true,
      data: {title: title, data: webhook, isEdit: true},
    });
    actionDialog.afterClosed().subscribe(res => {
      if (res != null) {
        res.seq_id = webhook.seq_id;
        let outputobj = {
          value:'edit_action',
          data:res,
          container: this.webhook_action,
          action_id: this.id,
          sequence_id: webhook.seq_id
        }
        this.output.next(outputobj)
      }
    })
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
