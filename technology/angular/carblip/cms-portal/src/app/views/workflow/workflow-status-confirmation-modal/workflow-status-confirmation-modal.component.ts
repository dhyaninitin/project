import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { WorkflowEnrollWarningModalComponent } from 'app/views/workflow-settings/workflow-enroll-warning-modal/workflow-enroll-warning-modal.component';

@Component({
  selector: 'app-workflow-status-confirmation-modal',
  templateUrl: './workflow-status-confirmation-modal.component.html',
  styleUrls: ['./workflow-status-confirmation-modal.component.scss']
})
export class WorkflowStatusConfirmationModalComponent implements OnInit {
  public confirmForm: FormGroup;
  confirmList: string[] = ['All Records', 'Only records created after activation'];
  enrolledNumber: any;
  workflowSettings: any;
  isDisable: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb:FormBuilder,
    public dialogRef: MatDialogRef<WorkflowStatusConfirmationModalComponent>,
    private dialog: MatDialog,
    private cd:ChangeDetectorRef,
    private service$:WorkflowService
  ) { }

  ngOnInit() {
    this.initform();
    this.getWorkflowSettings();
  }

  initform() {
    this.confirmForm = this.fb.group({
      confirm:['', Validators.required],
    })
  }

  getWorkflowSettings(){
    this.service$.getWorkflowSettings().subscribe(res => {
      this.workflowSettings = res.data;
    })
  }

  onChange($event) {
    if($event.value === "1") {
      this.isDisable = true;
      this.service$.totalEnrollmentCount(this.data.workflowId).subscribe(res => {
      this.isDisable = false;
      this.enrolledNumber = res.data;
      if(this.enrolledNumber > this.workflowSettings.enrollment_number) {
        const dialogRef: MatDialogRef<any> = this.dialog.open(
          WorkflowEnrollWarningModalComponent,
          {
            width: '500px',
            disableClose: true,
            data: { title: 'Confirm', value: this.enrolledNumber , workflowId:this.data.workflowId},
          }
        );
        dialogRef.afterClosed().subscribe(res => {
          if(!res) {
            this.confirmForm.setValue({confirm:null})
            return;
          } else {
            dialogRef.close(res);
          }
        });
      }
    })
    }
  }

  UpdateWorkflowStatus() {
    const payload = {
        activation_for:this.confirmForm.value.confirm
    };

    this.dialogRef.close(payload);
    // this.workflowservice$.changeWorkflowStatus(payload).subscribe((res: any) => {
    //   if(res){
    //     this.dialogRef.close(true);
    //     this.loader$.close();
    //     // console.log(res);
    //   }
    // });
  }
  

}
