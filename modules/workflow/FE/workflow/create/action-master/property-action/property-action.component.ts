import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { Subject } from 'rxjs';
import { ActionModalComponent } from '../../action-modal/action-modal.component';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';

@Component({
  selector: 'app-property-action',
  templateUrl: './property-action.component.html',
  styleUrls: ['./property-action.component.scss', './../../create.component.scss']
})
export class PropertyActionComponent implements OnInit {
  @Input('data') data: any;
  @Input('id') id: any;
  output = new Subject<any>();
  @ViewChild('property_action', { read: ViewContainerRef }) property_action: ViewContainerRef;
  constructor(
    private dialog:MatDialog, 
    private confirmService$: AppConfirmService,
    public workFlowService$:WorkflowService
    ) { }

  ngOnInit(): void {
  }

  action(propertyData: any){
    let outputobj = {
      value:'add_action',
      data:null,
      container: this.property_action,
      action_id:this.id,
      sequence_id: propertyData.seq_id
    }
    this.output.next(outputobj)
  }

  deleteaction(propertyData: any){  
    let outputobj = {
      value: 'delete_action',
      data: null,
      container: this.property_action,
      action_id: this.id,
      sequence_id: propertyData.seq_id
    }
    this.output.next(outputobj)
  }

  // To delete property actions
  deletePropertyItem(propertyData: any, index: number) {
    if(propertyData.property.length == 1) {
      this.deleteaction(propertyData);
    } else {
      this.confirmService$
      .confirm({
        message: `Are you sure you wish to delete this update property? This is permanent and cannot be undone.`,
      })
      .subscribe((res: any) => {
        if (res) {
          propertyData.property.splice(index, 1);
          let outputobj = {
            value:'edit_action',
            data: propertyData,
            container: this.property_action,
            action_id: this.id,
            sequence_id: propertyData.seq_id
          }
          this.output.next(outputobj)
        }
      })
    }
  }

  // To add more property items in action
  addPropertyItem(propertyData: any) {
    const title = 'Add Property Action';
    const actionDialog = this.dialog.open(ActionModalComponent,  {
      width: '720px',
      disableClose: true,
      data: {title: title, data: propertyData, isEdit: false, isAdd: true},
    });
    actionDialog.afterClosed().subscribe(res => {
      if (res != null) {
        res.seq_id = propertyData.seq_id;
        let outputobj = {
          value:'edit_action',
          data:res,
          container: this.property_action,
          action_id: this.id,
          sequence_id: propertyData.seq_id
        }
        this.output.next(outputobj)
      }
    })
  }

  // To edit update property Item
  editPropertyItem(propertyData: any, index: number) {
    const title = 'Edit Property Action';
    const actionDialog = this.dialog.open(ActionModalComponent,  {
      width: '720px',
      disableClose: true,
      data: {title: title, data: propertyData, propertyIndex: index, isEdit: true, isAdd: false},
    });
    actionDialog.afterClosed().subscribe(res => {
      if (res != null) {
        res.seq_id = propertyData.seq_id;
        let outputobj = {
          value:'edit_action',
          data:res,
          container: this.property_action,
          action_id: this.id,
          sequence_id: propertyData.seq_id
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
