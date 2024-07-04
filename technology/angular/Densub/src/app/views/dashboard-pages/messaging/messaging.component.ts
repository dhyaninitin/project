import { Component, OnInit, ViewEncapsulation, HostListener, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { FirebaseService } from './../../../shared-ui/service/firebase.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { JwtService } from './../../../shared-ui/service/jwt.service';
import { currentUser } from '../../../layouts/home-layout/user.model';
import { Lightbox } from 'ngx-lightbox';
import { AngularFireStorage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from '../../../shared-ui/service/global.service';
import { environment } from '../../../../environments/environment';
import { Notification } from './../../../shared-ui/modal/notification.modal';


@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss'],
  encapsulation: ViewEncapsulation.None
})
@HostListener('window:resize', ['$event'])
export class MessagingComponent implements OnInit ,AfterViewChecked{
  @ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;

  mobilesceen : any;
  users: any;
  filterUsers:any;
  messagesThread: any;
  startedDensub = false;
  currentUser: currentUser = new currentUser;
  currentThread: any;
  messageInInout: String = '';
  displayEmoji: false;
  cursorPosition: 0;
  partnerID: any = "";
  _album: any = [];
  currentUpdateMessage: any = {};
  currentTime: any = '';
  threadID: any = '';
  jobID: any = '';
  searchByName: any = '';
  userType:string = "";
  fileDetails = [];
  sendFile = false;
  notification= new Notification();
  i = 0; 
  constructor(
    private firebaseService: FirebaseService,
    private spinner: NgxSpinnerService,
    private jwtService: JwtService,
    private storage: AngularFireStorage,
    private _lightbox: Lightbox,
    private route: ActivatedRoute,
    private globalService: GlobalService,
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    // this.threadID = '5e427adc73a9266f468990cb';
    // this.jobID = '5ed7772fb353be29ac8145b0';
    this.route.params.subscribe(res => {
      this.threadID = res.threadID;
      this.jobID = res.jobID;
      this.getAllUsers();
    });
  }
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
  
  onResize(event) {
    this.mobileScreen();
  }
  ngOnInit() {
    this.mobileScreen();
    this.getUserType();
  }
 
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  // GET DATA LIST
  /* getAllUsers(){
    this.spinner.show();
    let s = this.firebaseService.GetDataList('UserMessageRecipient')
    s.snapshotChanges().subscribe(data => {
      this.users = [];
      data.forEach(item => {
        let a = item.payload.toJSON();
        if(a['status'] && a['status'] == 'active'){
          var keys = Object.keys(a['recipients']);
          if(keys[keys.indexOf(this.currentUser._id)] == this.currentUser._id){
            keys.splice(keys.indexOf(this.currentUser._id), 1);
            var partnerID = keys[0];
            a['$key'] = item.key;
            a['partnerData'] =  a['recipients'][partnerID];
            this.users.push(a);
            console.log(" ==== ", this.jobID, 'xxx', a['group']['group_id']);
            if(this.threadID == partnerID && this.jobID == a['group']['group_id']){
              this.getMessagesThread(a);
            }
          }
        }
      })
      this.spinner.hide();
    })
  }; */

  getAllUsers(){
    const self = this;
    self.spinner.show();
    let s = self.firebaseService.GetMessageRecipients('UserMessageRecipient','recipients/'+self.currentUser._id+'/id', self.currentUser._id);
    s.on('value', async function(snapshot) {
      if(snapshot.val()){
        const values = Object.values(snapshot.val());
        self.users = [];
        values.forEach((item, index) => {
          if(item['status'] && item['status'] == 'active'){
            var keys = Object.keys(item['recipients']);
            keys.splice(keys.indexOf(self.currentUser._id), 1);
            var partnerID = keys[0];
            item['$key'] = item['key'];
            item['partnerData'] =  item['recipients'][partnerID];
            self.users.push(item);
            if(self.threadID == partnerID && self.jobID == item['group']['group_id']){
              self.getMessagesThread(item);
            }
            if (index === (values.length - 1) ) {
              self.searchMessage();
            }
          }
        })
      }
    });
    this.spinner.hide();
  };

  getMessagesThread(thread){
    this.spinner.show();
    this._album = [];
    this.currentThread = thread;
    var keys = Object.keys(this.currentThread.recipients);
    keys.splice(keys.indexOf(this.currentUser._id), 1);
    this.partnerID = keys[0];
    this.startedDensub = !(this.startedDensub);
    let s = this.firebaseService.GetData('UserMessage', thread.$key)
    s.snapshotChanges().subscribe(data => {
      this.messagesThread = [];
      data.forEach(item => {
        let a = item.payload.toJSON();
        a['$key'] = item.key;
        this.messagesThread.push(a);
      })
      this.spinner.hide();
    })
    this.updateReadStatus();
    this.scrollToBottom();
  }

  updateMessage(message){
    this.currentUpdateMessage = message;
    this.messageInInout = message.text.replace(/<br\s*\/?>/mg,"\n");
  }

  sendMessage() {
    this.updateCurrentThread();
    if(this.messageInInout != ""){
      this.messageInInout = this.messageInInout.replace(/\n/g, "<br />");
      if(this.currentUpdateMessage && this.currentUpdateMessage.$key){
        var updatePath = 'UserMessage/'+ this.currentThread.$key + '/' + this.currentUpdateMessage.$key;
        let postData = {
          text: this.messageInInout,
          updated_at: new Date().getTime(),
          is_attachment: false
        }
        this.firebaseService.UpdateSpecificKeyValue(updatePath, postData);
        let index = this.messagesThread.length-1;
        if(this.messagesThread[index].$key == this.currentUpdateMessage.$key){
          var updatePath1 = 'UserMessageRecipient/'+ this.currentThread.$key + '/message';
          let postData1 = {
            text: this.messageInInout,
            updated_at: new Date().getTime(),
            is_attachment: false
          }
          this.firebaseService.UpdateSpecificKeyValue(updatePath1, postData1);
        }
        this.currentUpdateMessage = {};
        this.messageInInout = '';
        this.sendNotification('editedChatMessage');
      }else{
        let postData = Object.assign({}, this.messagesThread[this.messagesThread.length-1]);
        let time = new Date().getTime();
        postData.text = this.messageInInout;
        postData.is_attachment = false;
        postData.is_docFile = false;
        postData.fileName = '';
        postData.created_at = time;
        postData.updated_at = time;
        postData.sender = this.currentUser._id;
        delete postData.$key;
        this.firebaseService.AddData('UserMessage', this.currentThread.$key, postData, time); // Submit data
        this.updateMessageRecipient();
        this.sendNotification('chatMessage');
      }
    }
  };

  updateMessageRecipient() {
    let postData = Object.assign({}, this.currentThread);
    delete postData['partnerData'];
    postData['updated_at'] = new Date().getTime();
    postData.message['updated_at'] = new Date().getTime();
    postData.message['created_at'] = new Date().getTime();
    postData.message['sender'] = this.currentUser._id;
    postData.message['text'] = this.messageInInout;
    postData['is_attachment'] = false;
    postData.recipients[this.partnerID].status = "unread";
    postData.recipients[this.partnerID].unread++;
    postData.recipients[this.currentUser._id].status = "read";
    postData.recipients[this.currentUser._id].unread = 0;
    postData.message.recipients[this.partnerID].status = "unread";
    postData.message.recipients[this.partnerID].unread++;
    postData.message.recipients[this.currentUser._id].status = "read";
    postData.message.recipients[this.currentUser._id].unread = 0;
    delete postData.$key;
    this.firebaseService.UpdateData('UserMessageRecipient', this.currentThread.$key, postData); // Update data
    this.messageInInout = "";
    this.scrollToBottom();
  }

  addEmoji($event){
    var emoji = $event.emoji.native;
    var a = this.messageInInout
    var b = emoji;
    if(!this.cursorPosition){
      this.cursorPosition = 0;
    }
    var position = this.cursorPosition;
    this.messageInInout = [a.slice(0, position), b, a.slice(position)].join('');
    this.cursorPosition++;
    this.cursorPosition++;
  }

  /* uploadFile(event) {
    const file = event.target.files[0];
    const filePath = '/' + this.currentThread.$key + '/' + new Date().getTime() + '/' + file.name;
    var downloadUrl = this.firebaseService.uploadFile(filePath, file)
  } */
  uploadFileType: any = '';
  uploadFile(event) {
    this.sendFile = true;
    this.uploadFileType = '';
    const file = event.target.files[0];
    if (!file.name.match(/\.('jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|tif|TIF|tiff|TIFF|jfif|JFIF')$/)) {
      this.uploadFileType = 'doc';
    }
    this.fileDetails = [file,file.name];
  }

  updateFile(){
    const file = this.fileDetails[0];
    this.updateCurrentThread();
    this.spinner.show();
    this.currentTime = new Date().getTime();
    const filePath = '/' + this.currentThread.$key + '/' + this.currentTime + '/' + file.name;
    this.storage.upload(filePath, file).then(() => {
    const ref = this.storage.ref(filePath);
    this.spinner.hide();
    this.sendNotification('chatMessage');
    ref.getDownloadURL().subscribe(url => {
        this.fileDetails = [url,file.name];
        this.updateMessageAfterAttachment(url, file.name);
      })
    })  
    this.sendFile = false;
  }

  clearImage(){
    this.sendFile = false;
  }

  updateMessageAfterAttachment(url, fileName){
    let postData = Object.assign({}, this.messagesThread[this.messagesThread.length-1]);
    postData.created_at = this.currentTime;
    postData.is_attachment = true;
    postData.sender = this.currentUser._id;
    postData.text = url;
    postData.updated_at = this.currentTime;
    delete postData.$key;
    postData['is_docFile'] = false;
    if(this.uploadFileType == 'doc'){
      console.log("==============");
      postData['is_docFile'] = true;
    }
    postData['fileName'] = fileName;
    this.firebaseService.AddData('UserMessage', this.currentThread.$key, postData, this.currentTime);
    this.updateMessageRecipientAfterAttachment(url);
    this.currentTime = '';
  }

  updateMessageRecipientAfterAttachment(url){
    let postData = Object.assign({}, this.currentThread);
    delete postData['partnerData'];
    postData['updated_at'] = new Date().getTime();
    postData['is_attachment'] = true;
    postData.message['updated_at'] = new Date().getTime();
    postData.message['created_at'] = new Date().getTime();
    postData.message['sender'] = this.currentUser._id;
    postData.message['text'] = url;
    postData.recipients[this.partnerID].status = "unread";
    postData.recipients[this.partnerID].unread++;
    postData.message.recipients[this.partnerID].status = "unread";
    postData.message.recipients[this.partnerID].unread++;
    delete postData.$key;
    this.firebaseService.UpdateData('UserMessageRecipient', this.currentThread.$key, postData); // Update data
    //this.spinner.hide();
    this.scrollToBottom();
  }

  getCursorPosition() {
    var el = document.getElementById('messageInInout');
    var val = el['value'];
    this.cursorPosition = val.slice(0, el['selectionStart']).length;
  }

  updateReadStatus(){
    this.updateCurrentThread();
    let postData = {
      status: 'read',
      unread: 0
    };
    var updatePath = 'UserMessageRecipient/'+ this.currentThread.$key + '/recipients/' + this.currentUser._id;
    this.firebaseService.UpdateSpecificKeyValue(updatePath, postData);

    var updatePath = 'UserMessageRecipient/'+ this.currentThread.$key + '/message/recipients/' + this.currentUser._id;
    this.firebaseService.UpdateSpecificKeyValue(updatePath, postData);
  }

  updateCurrentThread() {
    this.users.forEach(element => {
      if (element.$key === this.currentThread.$key) {
        this.currentThread = element;
      }
    });
    this.scrollToBottom();

  }

  searchMessage() {
    this.users.sort(this.custom_sort);
    if(this.i<=0){
      this.getMessagesThread(this.users[0]);
    }
    this.i = this.i + 1;
    const searchBy = this.searchByName;
    if (!searchBy) {
      this.filterUsers = this.users;
    } else {
      this.filterUsers = this.users.filter(user => {
        if (user.partnerData && user.partnerData.fullName) {
          return user.partnerData.fullName.toLowerCase().startsWith(searchBy.toLowerCase());
        } else {
          return false;
        }
      });
      this.filterUsers = [...this.filterUsers];
    }
    
  }
  
  deleteMessage(message){
    console.log(this.currentThread)
    if (window.confirm('Are you sure want to delete this message ?')) {
      let path = "UserMessage/"+this.currentThread.$key+'/'+message.$key;
      this.firebaseService.DeleteData(path);
      if(this.messagesThread[this.messagesThread.length-1].$key === message.$key){
        if(!this.messagesThread[this.messagesThread.length-2].is_attachment){
          const updateText = this.messagesThread[this.messagesThread.length-2].text;
          this.updateDeleteMessage(updateText);
          this.updateDeleteImage();
        }else{
          this.updateDeleteMessage('File');
          this.updateDeleteImage();
        }
      }
      if(message.is_attachment){
        this.deleteFile(message);
      }
    }
  }

  updateDeleteMessage(message){
      var updatePath = 'UserMessageRecipient/'+ this.currentThread.$key + '/message';
      let postData = {
        text: message,
        updated_at: new Date().getTime(),
        is_attachment: false
      }
      this.firebaseService.UpdateSpecificKeyValue(updatePath, postData);
  }

  updateDeleteImage(){
    var updatePath = 'UserMessageRecipient/'+ this.currentThread.$key;
    let postData = {
      updated_at: new Date().getTime(),
      is_attachment: false
    }
    this.firebaseService.UpdateSpecificKeyValue(updatePath, postData);
  }

  deleteFile(message){
    let path = this.currentThread.$key+'/'+message.$key;
    const storageRef = this.storage.ref(path);
    storageRef.child(message.fileName).delete();
  }

  /* To copy any Text */
  copyText(val: string){
    val = val.replace(/<br\s*\/?>/mg,"\n");
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }







  mobileScreen() {
    // console.log(event)
    let getScreenSize = 767.89;
    // console.log(window.screen.width)
    if (window.screen.width < getScreenSize) { // 768px portrait
      // this.getStartedDensub();
          // console.log('1')
      this.mobilesceen = window.screen.width;
    } else {

    }
  }

  getStartedDensub(){
    // console.log('2')
    this.startedDensub = !(this.startedDensub);
  }


  openLightBox(url): void {
    this._album = [];
    this._album.push({
      src: url,
      thumb: "thumb"
    })
    let found = this._album.filter(function(e){ return e.src == url; });
    this._lightbox.open(this._album, this._album.indexOf(found[0]));
  }

  close(): void {
    this._lightbox.close();
    this._album = [];
  }

  onClickedOutside(e: Event) {
    this.displayEmoji = false;
  }

  sendNotification(type = '') {
    if (!type) {
      return false;
    }
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const title = this.globalService.titleCase(this.currentThread.group.title);
    const currentTime = new Date().getTime();
    const notification = environment.notification;
    this.notification = {
      jobId:this.currentThread.group.group_id,
      senderId: this.currentUser._id,
      receiverId: this.currentThread.partnerData.id,
      message: notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName),
      redirectLink: notification[type].link,
      type: notification[type].type,
      createdAt: currentTime,
      updatedAt: currentTime,
      status: environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
  }

  custom_sort(a, b) {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  }

  clearSearch(){
    this.searchByName = '';
    this.searchMessage();
  }

  getUserType(){
  const userInfo = JSON.parse(localStorage.getItem("currentUser"));
  if(userInfo.userType === 'staff'){
    this.userType = "practice";
  }else{
    this.userType = "staff";
  }
}
}
