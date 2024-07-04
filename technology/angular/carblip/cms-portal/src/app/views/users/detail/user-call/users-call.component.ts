import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger20ms } from '@vex/animations/stagger.animation';
import { ScrollbarComponent } from '@vex/components/scrollbar/scrollbar.component';
import { UserService } from 'app/shared/services/apis/users.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { Subject } from 'rxjs';
// declare const Twilio: any;

@Component({
    selector: 'app-users-call',
    templateUrl: './users-call.component.html',
    styleUrls: ['./users-call.component.scss'],
    animations: [
      fadeInUp400ms,
      stagger20ms
    ]
  })

export class UserscallComponent implements OnInit,OnDestroy {
  @Input() userInfo: any;
  private onDestroy$ = new Subject<void>();
  columnHeaders: Array<{}> = [
      { key: 'direction', label: 'Direction', visible: true},
      { key: 'status', label: 'Status', visible: true},
      { key: 'duration', label: 'Duration', visible: true},
      { key: 'call_record', label: 'Call Record', visible: true},
      { key: 'created_at', label: 'Created At', visible: true},
    ]

    public RequestParam: any = {
      order_by: 'created_at',
      order_dir: 'desc',
      page: 0,
      per_page: 5,
    };

    pageNumber = 1;
    limit = 5;
    twilioParam: any = {};
    public callData:Array<{}> = [];
    totalRecords: any;
    recordingUrl: any = '';
    playRecording: any = '';
    device: any;
    constructor(
        private service$: UserService,
        private loader$: AppLoaderService,          
        private _cdr: ChangeDetectorRef
    ) {}
    

    ngOnDestroy() {
      this.onDestroy$.next();
      this.onDestroy$.complete();
    }

    ngOnInit() {
      this.twilioParam = { To: this.userInfo.phone, callerId: "+15304571901", IsRecord: true };

      this.service$.getTwilioToken().subscribe((res: any) => {
        console.log(res.data);
        // Twilio.Device.setup(res.data, { 'debug': true, 'enableRingingState': true });
        // this.device = Twilio.Device.ready((device) => {
        // });
      });

      this.getSMSList();
    }

      

    getDisplayedColumns(): string[] {
        return this.columnHeaders.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
    }

    onLogPaginateChange(event: any) {
      this.pageNumber = event.pageIndex + 1;
      this.limit = event.pageSize;
      this.getPaginationData();
    }
  
    getPaginationData() {
      this.loader$.open();
      this.RequestParam.page = this.pageNumber;
      this.RequestParam.per_page = this.limit;
      this.getSMSList();
    }

    getSMSList() {
      Promise.all([
        this.service$.getOutGoingCallList(this.RequestParam, this.twilioParam.To),
        this.service$.getIncomingCallList(this.RequestParam, this.twilioParam.To)
      ]).then(res => {
        var result = res[0].data.concat(res[1].data);
        result = result.sort((a,b)=>Date.parse(b.start_time)-Date.parse(a.start_time));
        this.callData = result;
        this.totalRecords = result.length;
        this.loader$.close();
        this._cdr.detectChanges();
      })
    }

    playrecording(data:any){
    
      this.service$.getcallRecordUrl(data).subscribe((res: any) => {
        if(res.media_url) {
          this.playRecording = data;
          this.recordingUrl = res.media_url;
          this._cdr.detectChanges();
        }
  
      });
    }

    refresh(){

    }
  }
