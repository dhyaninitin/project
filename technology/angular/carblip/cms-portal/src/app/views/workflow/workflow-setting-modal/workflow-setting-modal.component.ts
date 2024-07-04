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
        // { id: 2, title: 'Mon-Fri', value: '1,2,3,4,5' },
        // { id: 3, title: 'Sat-Sun', value: '6,0' },
        { id: 4, title: 'Monday', value: '1' },
        { id: 5, title: 'Tuesday', value: '2' },
        { id: 6, title: 'Wednesday', value: '3' },
        { id: 7, title: 'Thursday', value: '4' },
        { id: 8, title: 'Friday', value: '5' },
        { id: 9, title: 'Saturday', value: '6' },
        { id: 10, title: 'Sunday', value: '0' },
    ];

    // timeList: Array<{}> = [
    //     { id: 1, value: '12:00 AM' },
    //     { id: 2, value: '12:30 AM' },
    //     { id: 3, value: '01:00 AM' },
    //     { id: 4, value: '01:30 AM' },
    //     { id: 5, value: '02:00 AM' },
    //     { id: 6, value: '02:30 AM' },
    //     { id: 7, value: '03:00 AM' },
    //     { id: 8, value: '03:30 AM' },
    //     { id: 9, value: '04:00 AM' },
    //     { id: 10, value: '04:30 AM' },
    //     { id: 11, value: '05:00 AM' },
    //     { id: 12, value: '05:30 AM' },
    //     { id: 13, value: '06:00 AM' },
    //     { id: 14, value: '06:30 AM' },
    //     { id: 15, value: '07:00 AM' },
    //     { id: 16, value: '07:30 AM' },
    //     { id: 17, value: '08:00 AM' },
    //     { id: 18, value: '08:30 AM' },
    //     { id: 19, value: '09:00 AM' },
    //     { id: 20, value: '09:30 AM' },
    //     { id: 21, value: '10:00 AM' },
    //     { id: 22, value: '10:30 AM' },
    //     { id: 23, value: '11:00 AM' },
    //     { id: 24, value: '11:30 AM' },
    //     { id: 25, value: '12:00 PM' },
    //     { id: 26, value: '12:30 PM' },
    //     { id: 27, value: '01:00 PM' },
    //     { id: 28, value: '01:30 PM' },
    //     { id: 29, value: '02:00 PM' },
    //     { id: 30, value: '02:30 PM' },
    //     { id: 31, value: '03:00 PM' },
    //     { id: 32, value: '03:30 PM' },
    //     { id: 33, value: '04:00 PM' },
    //     { id: 34, value: '04:30 PM' },
    // ];
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