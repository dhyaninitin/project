import { Component, Input, OnInit } from "@angular/core";
import { WorkflowService } from "app/shared/services/apis/workflow.service";

@Component({
    selector: 'app-clone-copy-action',
    templateUrl: './clone-copy-action.component.html',
    styleUrls: ['./clone-copy-action.component.scss',]
})

export class CloneCopyActionComponent implements OnInit {
    @Input() actionDetails: any;
    selectedActionDetail: any;
    @Input() actionName:string;

    constructor( public service$: WorkflowService) { }
    
    ngOnInit(): void {
        // throw new Error("Method not implemented.");
    }

    getSelectedActionData(item: any){
        this.selectedActionDetail = item;
    }

    copyAction(item:any){
        let outputobj = {
            value:'copy_action',
            data:null,
            container: item,
            action_id:item.action.id,
            sequence_id:item.seq_id
        }
        this.service$.workflowCopyData.next(outputobj);
    }

    copyBeforeAction(item:any){
        let outputobject = {
            value:'before',
            data:item,
            sequenceId:item.seq_id
        }
        this.service$.workflowCopyStatus.next(outputobject);
    }

    copyAfterAction(item:any){
        let outputobject = {
            value:'after',
            data:item,
            sequenceId:item?.seq_id
        }
        this.service$.workflowCopyStatus.next(outputobject);

    }

    cloneActions(item:any,status:boolean){
        let cloneActionObject = {
            value:'clone',
            data:status ? item : null,
            sequenceId:item?.seq_id,
            cloneStatus:status
        }
        this.service$.workflowCloneData.next(cloneActionObject);
        this.service$.workflowCloneStatus = true;
    }
}
