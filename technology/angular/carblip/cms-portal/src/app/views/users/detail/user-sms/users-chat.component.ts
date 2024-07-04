import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger20ms } from '@vex/animations/stagger.animation';
import { ScrollbarComponent } from '@vex/components/scrollbar/scrollbar.component';
import { UserService } from 'app/shared/services/apis/users.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';

@Component({
  selector: 'app-users-chat',
  templateUrl: './users-chat.component.html',
  styleUrls: ['./users-chat.component.scss'],
  animations: [
    fadeInUp400ms,
    stagger20ms
  ]
})
export class UsersChatComponent implements OnInit {
  @ViewChild(ScrollbarComponent, { static: true }) scrollbar: ScrollbarComponent;
  public smsForm:FormGroup;
 
  SmsData: Array<[]> = []; 

  @Input() userInfo: any ;
  public RequestParam: any = {
		order_by: 'created_at',
		order_dir: 'desc',
		page: 1,
		per_page: 10,
	};

  constructor(
    private fb:FormBuilder,
    private service$: UserService,
    private loader$: AppLoaderService,
    private snack$: MatSnackBar,              
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initform();
    this.getSMSList();
  }

  refresh() {
    this.getSMSList();
  }

  initform(){
    this.smsForm = this.fb.group({
      sent_to: this.userInfo.phone,
      message:['',Validators.required],
    })
  }

  getSMSList() {
    this.service$.getSMSList(this.RequestParam,this.userInfo.phone).subscribe((res: any) => {
      if(res.data.length > 0) {
        this.SmsData = res.data;
        this.SmsData = this.SmsData.sort((a: any, b: any) => {
          let d1 = new Date(a.created_at).getTime();
          let d2 = new Date(b.created_at).getTime()
          return d1 - d2;
        });
        this._cdr.detectChanges();
        this.scrollToBottom();
      } else {
        this.SmsData = [];
      }
    })
  }

  sendSms(){
    if(this.smsForm.valid) {
      this.loader$.open();
      this.service$.sendSMS(this.smsForm.value).subscribe((res: any) => {
        if(res) {
            this.loader$.close();
            this.snack$.open(res.data, 'OK', {
              verticalPosition: 'top',
              panelClass: ['snack-success'],
              duration: 3000,
            });
            this.getSMSList(); 
            // this.smsForm.reset();
            this.smsForm.get("message")?.reset()
        }
      }, error => {
        this.loader$.close();
      })
    }
  }

  scrollToBottom() {
    this.scrollbar.scrollbarRef.getScrollElement().scrollTo({
      behavior: 'smooth',
      top: this.scrollbar.scrollbarRef.getContentElement().clientHeight
    });
  }
}
