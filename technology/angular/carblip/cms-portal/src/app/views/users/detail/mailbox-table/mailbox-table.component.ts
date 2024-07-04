import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { UserService } from 'app/shared/services/apis/users.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { MatDialog } from '@angular/material/dialog';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { dropdownAnimation } from '@vex/animations/dropdown.animation';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as CryptoJS from 'crypto-js';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mailbox-table',
  templateUrl: './mailbox-table.component.html',
  styleUrls: ['./mailbox-table.component.scss'],
  animations: [
    fadeInUp400ms,
    dropdownAnimation,
    fadeInRight400ms
  ]
})
export class MailboxTableComponent implements OnInit, OnDestroy {
  @Input() userInfo: any ;

  public RequestParam: any = {
		order_by: 'created_at',
		order_dir: 'desc',
		page: 1,
		per_page: 10,
	};
  emails: any;
  offset: number = 1;
  totalRecords: number

  pageNumber = 1;
  limit = 5;
  intervalId: any;
  tableRefresh = true;
  sider: string = '0px';
  isOpenDrawer: number = 0;
  mailId: number = 0;
  sendTo: string = '';
  userdetails:any ;
  showEditor: number = 0;
  newEmail : boolean = false;
  public emailForm: FormGroup;
  header: number = -1;
  attachedFiles: any[] = [];
  originalMessageId: string = "";
  
  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog:MatDialog,
    private service$: UserService,
    private loader$: AppLoaderService,
    private _cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private snack$: MatSnackBar
  ) { 
    
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  ngOnInit() {
    this.initform();
    this.getMailList();
  }
  
  initform() {
    this.emailForm = this.fb.group({
      to: this.userInfo.email_address,
      thread_id: [null],
      addCc: [null],
      addBcc: [null],
      subject: ['',Validators.required],
      message:['',Validators.required],
      emailAttachments: [''],
      register_id: this.userInfo.id
    })
  }

  onPaginateChange(event: any) {
    this.pageNumber = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.RequestParam.page = this.pageNumber;
    this.RequestParam.per_page = this.limit;
    this.loader$.open();
    this.getMailList();
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  refreshMail() {
    this.startSync();
    this.getMailList();
  }

  getMailList(){
    this.service$.getMailList(this.RequestParam,this.userInfo.email_address).subscribe((res: any) => {
      if(res.data.length > 0) {
        this.emails = res.data;
        this.totalRecords = res.meta.total;
        this.loader$.close();
        this._cdr.detectChanges();
      }else{
        this.emails = [];
        this.loader$.close();
      }
    })
  }

  openThreadEditor($event: any) {
    this.emailForm.reset();
    this.emailForm.setValue({
      to: this.userInfo.email_address,
      thread_id: $event.cid || null,
      addCc: null,
      addBcc: null,
      subject: $event.subject,
      message: $event.msg,
      emailAttachments: [''],
      register_id: this.userInfo.id
    });
    this.showEditor = $event.id;
    this.toggleEditors(2);
  }

  //close the side dailouge
  openSider(cid: number, id: number) {
    this.showEditor = 0;
    this.emailForm.reset();
    this.isOpenDrawer = id;
    if(this.isOpenDrawer != 0) {
      this.mailId = cid;
      this.sendTo = this.userInfo.email_address;
    }
  }

  showEmailDetails(item:any, index: number) {
    this.service$.getMessageDetails(item.id).subscribe(res=> {
      if(res.data != null) {
        this.emails[index]['msg'] = res.data.msg;
        this.originalMessageId = res.data.originalMessageId;
        this._cdr.detectChanges();
          if(item.status == 0) {
            this.emails[index].status = 1;
            this.service$.changeMailStatus(item.id).subscribe(res=>{
            })
          }
      }
    })
  }

  dropdownOpen = false;
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    this._cdr.markForCheck();
  }

  shortMessage(msg: string) {
    return " " + msg + "...";
  }

  fileUploadDetails($event: any) {
    if($event.length > 0) {
      this.attachedFiles = $event;
    } else {
      this.attachedFiles = [];
    }
  }

  sendMail(mailType: number) {
    let data = this.emailForm.value
    if(this.emailForm.valid) {
      data['attachments'] = this.attachedFiles;
      this.loader$.open();
      if(mailType == 1) {
        this.service$.sendMail(data).subscribe((res: any) => {
          if(res) {
            this.loader$.close();
            this.snack$.open(res.data, 'OK', {
              verticalPosition: 'top',
              panelClass: ['snack-success'],
              duration: 3000,
            });
            setTimeout(() => {
              this.getMailList();
            }, 5000)
          }
        }, error => {
          this.loader$.close();
          this.snack$.open("Some error has occurred", 'OK', {
            verticalPosition: 'top',
            panelClass: ['snack-warning'],
            duration: 3000,
          });
        })  
      } else {
        data['originalMessageId'] = this.originalMessageId;
        this.service$.sendReply(data).subscribe((res: any) => {
          if(res) {
            this.loader$.close();
            this.snack$.open(res.data, 'OK', {
              verticalPosition: 'top',
              panelClass: ['snack-success'],
              duration: 3000,
            });
            setTimeout(() => {
              this.getMailList();
            }, 5000)
          }
        }, error => {
          this.loader$.close();
          this.snack$.open("Some error has occurred", 'OK', {
            verticalPosition: 'top',
            panelClass: ['snack-warning'],
            duration: 3000,
          });
        })  
      } 
    }
  }

  toggleEditors(index: number) {
    if(index == 1) {
      this.initform();
      this.newEmail = true;
      this.showEditor = 0;
    } else {
      this.newEmail = false;
    }
    this.scroll(index);
  }

  @ViewChildren('newEmailEditor') newEmailEditor: any;
  @ViewChildren('ThreadEditor') ThreadEditor: any;

  scroll(index: number) {
    switch(index) {
      case 1: 
        this.newEmailEditor.first.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        break;
      case 2: 
        this.ThreadEditor.first.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        break;
    }
  }

  toggleParentHeader(id: number) {
    if(this.header == id) {
      this.header = -1;
    } else {
      this.header = id;
    }
  } 

  onClickDownloadPdf(mailId: number,fileindex:number) {
    const payload = {
      mailid: Number(mailId),
      fileindex: Number(fileindex),
    }
    this.service$.getAttachment(payload).subscribe(res => {
      if(res.error) {

      } else {
        const fileInfo = res.data;
        const bytes  = CryptoJS.AES.decrypt(fileInfo.payload, fileInfo.token);
        const payloadBase64 = bytes.toString(CryptoJS.enc.Utf8);
        this.downloadPdf(payloadBase64, fileInfo.documentOriginalName, fileInfo);
      }
    })
  }

  downloadPdf(base64String, fileName,fileInfo: any) {
    const source = `data:${fileInfo.mime_type};base64,${base64String}`;
    const link = document.createElement("a");
    link.href = source;
    link.download = fileName
    link.click();
  }

  startSync() {
    this.syncMailInbox();
    this.syncMailSentBox();
  }

  syncMailInbox() {
    this.service$.syncMailInbox().subscribe(res => {
      if(res.error) {

      } else {
      }
    }, error => {
      console.log(error);
    })
  }

  syncMailSentBox() {
    this.service$.syncMailSentBox().subscribe(res => {
      if(res.error) {

      } else {
      }
    }, error => {
      console.log(error);
    })
  }
}
