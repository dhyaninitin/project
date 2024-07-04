import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UserService } from 'app/shared/services/apis/users.service';
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import * as CryptoJS from 'crypto-js';
import { dropdownAnimation } from '@vex/animations/dropdown.animation';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';

@Component({
  selector: 'app-mail-thread',
  templateUrl: './mail-thread.component.html',
  styleUrls: ['./mail-thread.component.scss'],
  animations: [
    dropdownAnimation,
    fadeInUp400ms,
  ]
})
export class MailThreadComponent implements OnInit {
  @Output() openThreadItem = new EventEmitter<string>();
  @Input() mailId: number = 0;
  @Input() sendTo: string = '';
  @Input() userInfo: any ;
  zimbraMails: any = [];
  fileAttachment = [];
  panelState: number = 0;
  dropdownOpen = false;
  
  constructor
    (
      private service$: UserService,
      private _cdr: ChangeDetectorRef,
    ) { }

  ngOnInit() { 
    this.getThreads(this.mailId, this.sendTo); 
  }

  getThreads(id: number, email: string) {
    this.service$.getzimbraMails(id, email).subscribe((res) => {
      if (res.error) {
      } else {
        this.zimbraMails = res.data;
        this.zimbraMails = this.zimbraMails.map(mail=> {
          mail['display'] = true;
          return mail;
        })
        this._cdr.detectChanges();
      }
    });
  }

  fileUploadDetails($event: any) {
    this.fileAttachment = $event;
  }

  showThreadDetails(item:any, index: number) {
    this.dropdownOpen = false;
    this.service$.getMessageDetails(item.id).subscribe(res=> {
      if(res.data != null) {
        this.zimbraMails[index]['msg'] = res.data.msg;
        this.panelState = index;
        this.zimbraMails[index]['display'] = false;
        this._cdr.detectChanges();
          if(item.status == 0) {
            this.zimbraMails[index].status = 1;
            this.service$.changeMailStatus(item.id).subscribe(res=>{
            })
          }
      }
    })
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

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    this._cdr.markForCheck();
  }

  shortMessage(msg: string) {
    return " " + msg + "...";
  }

  openThreadEditor(thread: any) {
    this.openThreadItem.emit(thread);
  }
}
