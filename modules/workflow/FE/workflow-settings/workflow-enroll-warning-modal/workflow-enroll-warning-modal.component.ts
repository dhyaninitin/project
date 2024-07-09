import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';

@Component({
  selector: 'app-workflow-enroll-warning-modal',
  templateUrl: './workflow-enroll-warning-modal.component.html',
  styleUrls: ['./workflow-enroll-warning-modal.component.scss']
})
export class WorkflowEnrollWarningModalComponent implements OnInit {
  showOtpInput: boolean = false;
  displayTime: string;
  timerOff: boolean= true;
  otp: any;
  disabledBtn:boolean = false;
  disableVerify:boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb:FormBuilder,
    public dialogRef: MatDialogRef<WorkflowEnrollWarningModalComponent>,
    private service$:WorkflowService,
    private cd:ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  accept(){
    const payload ={ 
      id:this.data.workflowId,
      otp:this.otp
     }
    if(this.showOtpInput){
      this.dialogRef.close(payload);
    } else {
      this.otpSend();
    }
  }

  onOtpChange(otp:any){
   this.otp = otp;
  }

  verifyOtp(){
    const payload ={ 
      id:this.data.workflowId,
      otp:this.otp
     }
    this.service$.verifyOtp(payload).subscribe(res => {
      console.log(res);
      this.disabledBtn = false;
      this.disableVerify = true;
    })

  }

   //@desc show timer
  countTime() {
    let hours = 6;
    let seconds: number = hours * 60 * 60;
    let textSec: any = "0";
    let statSec: number = 60;

    const timer = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      if (statSec < 10) textSec = "0" + statSec;
      else textSec = statSec;

      this.displayTime = `${Math.floor(seconds / 3600)}:${Math.floor((seconds % 3600) / 60)}:${textSec}`;

      if (seconds == 0) {
        this.timerOff = false;
        clearInterval(timer);
      }
      this.cd.detectChanges();
    }, 1000);
  }

  otpSend(){
    this.service$.sentOtp(this.data.workflowId).subscribe(res => {
      this.showOtpInput = true;
      this.disabledBtn = true;
      this.countTime();
    }, err => {
      this.showOtpInput = false;
      this.disabledBtn = false;
    })
  }

  resendOtp(){
    this.service$.sentOtp(this.data.workflowId).subscribe(res => 
      console.log(res)
    )
  }

}
