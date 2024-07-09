import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';

@Component({
    selector: 'app-workflow-setting-modal',
    templateUrl: './workflow-setting-modal.component.html',
    styleUrls: ['./workflow-setting-modal.component.scss']
})

export class WorkflowSettingModalComponent implements OnInit {

    public settingForm: FormGroup;
    dayList: Array<{}> = [
        { id: 1, title: 'Every day', value: '0,1.2,3,4,5,6' },
        { id: 4, title: 'Monday', value: '1' },
        { id: 5, title: 'Tuesday', value: '2' },
        { id: 6, title: 'Wednesday', value: '3' },
        { id: 7, title: 'Thursday', value: '4' },
        { id: 8, title: 'Friday', value: '5' },
        { id: 9, title: 'Saturday', value: '6' },
        { id: 10, title: 'Sunday', value: '0' },
    ];

    schedule_time: Array<{}> = [];
    timeList: Array<{}> = [];
    public showScheduleList: Boolean = false;

    constructor
    (
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<WorkflowSettingModalComponent>,
        private service$: WorkflowService,
        private loader$: AppLoaderService,
    ) { 
        this.settingForm = this.fb.group({
            executionTime: ['', Validators.required],
            scheduleList: this.fb.array([])
          });
          this.addScheduler();
    }

    ngOnInit() {
        if(this.data.value.schedule_time != null){
            this.settingForm.patchValue({
              scheduleList: this.data.value.schedule_time,
              executionTime:this.data.value.execute_time,
            });
            
          }else{
            this.settingForm.patchValue({
              executionTime:this.data.value.execute_time,
            });
          }
          this.onExecutionTimeChange(this.data.value.execute_time);
          this.timeList = this.generateTimeSlots();
    }

    get schedule() {
        return this.settingForm.get("scheduleList") as FormArray;
    }
    
    addScheduler() {
    this.schedule.push(this.createScheduler());
    }
    
    removeScheduler(i) {
    this.schedule.removeAt(i);
    }

    createScheduler() {
    return this.fb.group({
        day: [],
        startTime: [],
        endTime: []
    });
    }

    onExecutionTimeChange($value: number) {
        if ($value == 1) {
            this.showScheduleList = true;
        }else{
            this.showScheduleList = false;
        }
    }

    updateWorkflowSettings() {
        this.loader$.open();
        let payload = {
            id: this.data.value.id,
            schedule_time: this.settingForm.value.scheduleList,
            workflow_execute_time: this.settingForm.value.executionTime
        }
        this.service$.updateWorkflowSchedule(payload).subscribe((res: any) => {
            if(res){
            this.dialogRef.close(res);
            this.loader$.close();
            }
        });
    }


    generateTimeSlots(): string[] {
        const start = new Date();
        start.setHours(0, 0, 0, 0); 

        const end = new Date();
        end.setHours(23, 30, 0, 0);

        const timeSlots: string[] = [];

        while (start <= end) {
            const hours = parseInt(start.getHours().toString(), 10); // convert string to number
            const minutes = start.getMinutes();
            const amPm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = (hours % 12) || 12;
      
          timeSlots.push(`${displayHours}:${minutes} ${amPm}`);
      
          start.setTime(start.getTime() + 30 * 60 * 1000); // increment time by 30 minutes
        }
        return timeSlots;
      }
      

}