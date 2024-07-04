import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ActionModalComponent } from '../../action-modal/action-modal.component';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';

@Component({
  selector: 'app-send-direct-email',
  templateUrl: './send-direct-email.component.html',
  styleUrls: ['./send-direct-email.component.scss', './../../create.component.scss']
})
export class SendDirectEmailComponent implements OnInit {
  @Input('data') data: any;
  @Input('id') id: any;
  output = new Subject<any>();
  @ViewChild('direct_email_action', { read: ViewContainerRef }) direct_email_action: ViewContainerRef;
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
      container: this.direct_email_action,
      action_id:this.id,
      sequence_id:$branchData.seq_id
    }
    this.output.next(outputobj)
  }

  deleteaction($branchData){  
    let outputobj = {
      value:'delete_action',
      data:null,
      container: this.direct_email_action,
      action_id:this.id,
      sequence_id:$branchData.seq_id
    }
    this.output.next(outputobj)
  }

  editAction(email: any) {
    const title = 'Edit Direct Email Action';
    const actionDialog = this.dialog.open(ActionModalComponent,  {
      width: '720px',
      disableClose: true,
      data: {title: title, data: email, isEdit: true},
    });
    actionDialog.afterClosed().subscribe(res => {
      if (res != null) {
        res.seq_id = email.seq_id;
        let outputobj = {
          value:'edit_action',
          data:res,
          container: this.direct_email_action,
          action_id: this.id,
          sequence_id: email.seq_id
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
