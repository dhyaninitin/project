// ANGULAR MODULES
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { Injectable } from '@angular/core';
// CUSTOM SERVICES
import { JwtService } from './jwt.service';
// MODALS
import { currentUser } from '../../layouts/home-layout/user.model';
import { Notification } from '../modal/notification.modal';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  notification: Notification = new Notification();
  currentUser: currentUser = new currentUser;
  dataRef: AngularFireList<any>;    // Reference to data list, its an Observable
  dataObjectRef: AngularFireObject<any>;   // Reference to object, its an Observable too
  notificationList = [];
  unReadNotificationList = [];
  unreadNotification: number = 0;
  changedNotification = new BehaviorSubject(null);
  notificationStatus = environment.notificationStatus;
  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private jwtService: JwtService,
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
  }

  createNotification(notification: Notification) {
    this.db.database.ref('Notification').child(notification.createdAt.toString()).set(notification);
  }

   getNotification(callback) {
   const self = this;
    this.db.database.ref('Notification').orderByChild('receiverId').equalTo(this.currentUser._id).on('value', function(snapshot) {
       let notificationList = [];
       let unreadNotification = 0;
      //  let offerReceived = false;
      //  let contractRe = false;
      //  let isReturn = false;
      // return snapshot.val();
      if (snapshot.val()) {
        const convertObjToArray = Object.entries(snapshot.val());
        convertObjToArray.map((val, index) =>  {
             // -----  Count Unread Notification ----
             if ( environment.notificationStatus.UNREAD === val[1]['status']) {
               unreadNotification++;
             }
             // ----- Skip the delete Notification
             if ( environment.notificationStatus.DELETE === val[1]['status']) {
               return false;
             }
             val[1]['id'] = val[0];
             notificationList.push(val[1]);
              // if(index === (convertObjToArray.length - 1)){
              //    isReturn = true;
              // }
         });
           notificationList.reverse();
          //  if(isReturn){
               callback(notificationList, unreadNotification);
            //}
      }
      });
  }

  //  preLoadUnreadNotification() {
  //  const self = this;
  //  let trigger = false;
  //   this.db.database.ref('Notification').orderByChild('receiverId').equalTo(this.currentUser._id).on('value', function(snapshot) {
  //     self.unReadNotificationList = [];
  //     if (snapshot.val()) {
  //       const convertObjToArray = Object.entries(snapshot.val());
  //       convertObjToArray.map((val, index) =>  {
  //            // -----  Count Unread Notification ----
  //            if ( environment.notificationStatus.UNREAD === val[1]['status']) {
  //             val[1]['id'] = val[0];
  //             self.unReadNotificationList.push(val[1]);
  //            }
  //            if(index === convertObjToArray.length - 1){
  //             trigger = true;
  //            }
  //       });
  //       self.unReadNotificationList.reverse();
  //       if(trigger){
  //         self.changedNotification.next(self.unReadNotificationList);
  //       }
  //     }
  //   });
  // }

  // updateUnReadNotificationStatus(notification: Notification) {
  //   if (notification.status === this.notificationStatus.UNREAD ) {
  //     notification.status = this.notificationStatus.READ;
  //     this.updateNotification(notification);
  //   }
  // }

   getAllNotification() {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    return this.db.database.ref('Notification').orderByChild('receiverId').equalTo(this.currentUser._id);
  }

  async getContractNotifications(offerId) {
    let data =new Array;
    this.db.database.ref('Notification').orderByChild('offerId').equalTo(offerId).once('value', function(snapshot){
    snapshot.forEach(snapshotChild => {      
      const  value = snapshotChild.val();
      const key = snapshotChild.key;
      if(value.type == 'workDiaryAdded'){
        data.push(value)
      }
      console.log(value);
    });
    console.log(data);
    return data;
  });
  
 }

  getAndDeleteNotification(senderId, receiverId, offerId, type) {
    const self = this;
    this.db.database.ref('Notification').orderByChild('offerId').equalTo(offerId).once('value', function(snapshot){
      snapshot.forEach(snapshotChild => {
        const  value = snapshotChild.val();
        const key = snapshotChild.key;
        if (value.senderId === senderId && value.receiverId === receiverId && value.type === type ) {
          self.deleteNotification(key);
        }
      });
    });
  }

  getJobAndDeleteNotification(jobId) {
    const self = this;
    this.db.database.ref('Notification').orderByChild('jobId').equalTo(jobId).once('value', function(snapshot){
      snapshot.forEach(snapshotChild => {
        const  value = snapshotChild.val();
        const key = snapshotChild.key;
        self.deleteNotification(key);
      });
    });
  }

  getAndUpdateNotification(senderId, receiverId, offerId, status) {
    const self = this;
    this.db.database.ref('Notification').orderByChild('offerId').equalTo(offerId).once('value', function(snapshot){
      snapshot.forEach(snapshotChild => {
        const  value = snapshotChild.val();
        const key = snapshotChild.key;
        //if (value.senderId === senderId && value.receiverId === receiverId && value.status === status && value.type !== 'adminPayment') {
        if (value.senderId === senderId && value.receiverId === receiverId && value.status === status && value.type ) {
          value.status = self.notificationStatus.READ;
          value['id'] = key;
          console.log('updateNotification', value);
          value[environment.USER_TYPE.STAFF] = {sentOffer: 0 , receivedOffer : 0, contract: 0 };
          value[environment.USER_TYPE.PRACTICE] = {sentOffer: 0 , receivedOffer : 0, contract: 0 };
          self.updateNotification(value);
        }
      });
    });
  }

  getAndUpdateAdminNotification(status, type) {
    const self = this;
    this.db.database.ref('Notification').orderByChild('receiverId').equalTo(this.currentUser._id).once('value', function(snapshot) {
      snapshot.forEach(snapshotChild => {
        const  value = snapshotChild.val();
        const key = snapshotChild.key;
        if (value.status === status && value.type === type) {
          value.status = self.notificationStatus.READ;
          value['id'] = key;
          value[environment.USER_TYPE.ADMIN] = {payment: 0, disputes: 0, users: 0 };
          self.updateNotification(value);
        }
      });
    });
  }

  getAndUpdateJobNotification(receiverId, jobId, status) {
    const self = this;
    this.db.database.ref('Notification').orderByChild('jobId').equalTo(jobId).once('value', function(snapshot) {
      snapshot.forEach(snapshotChild => {
        const  value = snapshotChild.val();
        // console.log(value);
        const key = snapshotChild.key;
        if ( value.receiverId === receiverId && value.status === status && value.type !== 'adminPayment') {
          value.status = self.notificationStatus.READ;
          value['id'] = key;
          value['isViewedByPractice'] = true;
          value[environment.USER_TYPE.STAFF] = {sentOffer: 0 , receivedOffer : 0, contract: 0 };
          value[environment.USER_TYPE.PRACTICE] = {sentOffer: 0 , receivedOffer : 0, contract: 0 };
          self.updateNotification(value);
        }
      });
    });
  }

  deleteNotification(notificationId) {
    this.db.database.ref('Notification/' + notificationId).remove();
  }

  updateNotification(notification: Notification) {

    const notificationId = notification.id;
    notification['updatedAt'] = new Date().getTime();
    delete notification.id;
    this.db.database.ref('Notification/' + notificationId).update(notification);
  }

  saveUser(postObject) {
    return this.db.database.ref('User').set(postObject);
  }










  // CREATE USER.
  CreateUser(key, postData: any) {
    var collectionName1 = "User";
    return this.db.database.ref(collectionName1).child(key).set(postData);
  }

  // INSERT USER MESSAGE RECIPIENT AT FIRST TIME
  InsertUserMessageRecipient(postData: any) {
    // CREATE USER MESSAGE RECEPIENT.
    var collectionName = "UserMessageRecipient";
    var newPostKey = this.db.database.ref().child(collectionName).push().key;
    var updates = {};
    updates['/' + collectionName + '/' + newPostKey] = postData.userMessageRecipient;
    updates['/' + collectionName + '/' + newPostKey]['key'] = newPostKey;
    this.db.database.ref().update(updates);

    // CREATE USER MESSAGE.
    var collectionName1 = "UserMessage";
    const createdAt = new Date().getTime();
    return this.db.database.ref(collectionName1 + '/' + newPostKey).child(createdAt.toString()).set(postData.userMessage);
  }

  GetMessageRecipients(collectionName, orderByChild, currentUserId){
    return this.db.database.ref(collectionName).orderByChild(orderByChild).equalTo(currentUserId);
  }

  // GET DATA LIST
  GetDataList(collectionName){
    this.dataRef = this.db.list(collectionName);
    return this.dataRef;
  }

  // GET SINGLE DATA
  GetData(collectionName, id){
    this.dataRef = this.db.list(collectionName + '/' + id);
    return this.dataRef;
  }

  // GET SINGLE DATA
  GetObject(collectionName, id){
    this.dataObjectRef = this.db.object(collectionName + '/' + id);
    return this.dataObjectRef;
  }

  // ADD DATA
  AddData(collectionName, key, postData: any, createdAt) {
    return this.db.database.ref(collectionName + '/' + key).child(createdAt.toString()).set(postData);
  }

  // UPLOAD FILE
  /* uploadFile(filePath, file){
    const ref = this.storage.ref(filePath);
    return ref.put(file);
  } */
  uploadFile(filePath, file){
    this.storage.upload(filePath, file).then(() => {
      const ref = this.storage.ref(filePath);
      ref.getDownloadURL().subscribe(url => {
        return url;
      })
    })
  }

  // UPDATE DATA
  UpdateData(collectionName, key, postData: any) {
    return this.db.database.ref(collectionName + '/' + key).update(postData);
  }

  // UPDATE SPECIFIC KEY'S VALUE
  UpdateSpecificKeyValue(updatePath, postData: any) {
    return this.db.database.ref(updatePath).update(postData);
  }

  // DELETE DATA
  DeleteData(path) {
    this.dataObjectRef = this.db.object(path);
    return this.dataObjectRef.remove();
  }
  deleteUserMessageRecipient(key) {
    this.dataObjectRef = this.db.object('UserMessageRecipient/' + key);
    return this.dataObjectRef.remove();
  }
  deleteUserMessage(key) {
    this.dataObjectRef = this.db.object('UserMessage/' + key);
    return this.dataObjectRef.remove();
  }

  /* updateStatusInFBDB(currentUserId, recipientId, jobID){
    let s = this.db.list('UserMessageRecipient');
    s.snapshotChanges().subscribe(data => {
      data.forEach(item => {
        let a = item.payload.toJSON();
        if(a['status'] && a['status'] == 'active'){
          if(a['group'] && a['group']['group_id'] && a['group']['group_id'] == jobID){
            var keys = Object.keys(a['recipients']);
            if(keys[keys.indexOf(currentUserId)] == currentUserId){
              keys.splice(keys.indexOf(currentUserId), 1);
              var partnerID = keys[0];
              if(partnerID == recipientId){
                let updatePath = 'UserMessageRecipient/'+a['key'];
                let postData = { status: 'inactive' };
                this.UpdateSpecificKeyValue(updatePath, postData);
              }
            }
          }
        }
      })
    })
  } */
  updateStatusInFBDB(currentUserId, recipientId, jobID, type = 'update'){
    const self = this;
    let s = this.db.database.ref('UserMessageRecipient').orderByChild('recipients/' + self.currentUser._id + '/id').equalTo(currentUserId).once('value', (snap) => {
      let value = Object.values(snap.val());
      value.forEach(a => {
        if (a['status'] && a['status'] == 'active') {
          if (a['group'] && a['group']['group_id'] && a['group']['group_id'] == jobID){
            var keys = Object.keys(a['recipients']);
            keys.splice(keys.indexOf(currentUserId), 1);
            var partnerID = keys[0];
            if (partnerID == recipientId) {
              let path = 'UserMessageRecipient/' + a['key'];
              if (type == 'update'){ // !!! UPDATE THE DATA WITH INACTIVE STATUS !!!
                let postData = { status: 'inactive' };
                this.UpdateSpecificKeyValue(path, postData);
              }else{ // DELETE PARMANENT THE DATA FROM FOREBASE DATABASE
                // this.DeleteData(path);
                this.deleteUserMessageRecipient(a['key']);
                this.deleteUserMessage(a['key']);
              }
            }
          }
        }
      })
    });
  }

  deleteMessageCon(practiceId, jobID) {
    const self = this;
    practiceId = practiceId.toString();
    jobID = jobID.toString();
    this.db.database.ref('UserMessageRecipient').orderByChild('recipients/' + self.currentUser._id + '/id').equalTo(practiceId).once('value', (snap) => {
      let value = Object.values(snap.val());
      value.forEach(a => {
          if (a['group'] && a['group']['group_id'] && a['group']['group_id'] === jobID) {
            // var keys = Object.keys(a['recipients']);
            self.deleteUserMessageRecipient(a['key']);
            self.deleteUserMessage(a['key']);
            // var partnerID = keys[0];
            // console.log(keys, '=============' ,partnerID);
            // if(partnerID == recipientId) {
                // deleteUserMessageRecipient(a['key']);
                // deleteUserMessage(a['key']);
            // }
          }
      })
    })
  };
  createUserMessageRecipientModal(jobId, title, senderDetails, recipientDetails){
    const userMessageRecipient = {
      created_at: new Date().getTime(),
      group: {
        group_id: jobId,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQEYoP0Qy_MnbnHVhnBDrQFarbKj6qDJj0FuI7pyOHL2V1Y-5_E&usqp=CAU',
        image_id: 1311,
        title: title
      },
      is_attachment: false,
      status: 'active',
      item: {
        item_id: jobId,
        module: 'common\\models\\UserService'
      },
      message: {
        created_at: new Date().getTime(),
        is_attachment: false,
        recipients: {
          [recipientDetails._id]: {
            id: recipientDetails._id,
            status: 'unread',
            unread: 0
          },
          [senderDetails._id]: {
            id: senderDetails._id,
            status: 'read',
            unread: 0
          }
        },
        sender: senderDetails._id,
        text: "Let's Start Chat on Densub!",
        updated_at: new Date().getTime()
      },
      recipients: {
        [recipientDetails._id]: {
          avatar: (recipientDetails['profilePhoto'].length) ? recipientDetails['profilePhoto'][0] : '',
          fullName: recipientDetails.firstName + ' ' + recipientDetails.lastName,
          id: recipientDetails._id,
          status: 'unread',
          unread: 0
        },
        [senderDetails._id]: {
          avatar: (senderDetails['profilePhoto'].length) ? senderDetails['profilePhoto'][0] : '',
          fullName: senderDetails.firstName + ' ' + senderDetails.lastName,
          id: senderDetails._id,
          status: 'read',
          unread: 0
        }
      },
      updated_at: new Date().getTime()
    };
    return userMessageRecipient;
  }

  createUserMessageModal(senderDetails, recipientDetails){
    const userMessage = {
      created_at: new Date().getTime(),
      is_attachment: false,
      recipients: {
        [recipientDetails._id]: {
          id: recipientDetails._id,
          status: 'read'
        },
        [senderDetails._id]: {
          id: senderDetails._id,
          status: 'read'
        }
      },
      sender: senderDetails._id,
      text: 'Let\'s Start Chat on Densub!',
      updated_at: new Date().getTime()
    }
    return userMessage;
  }

  getAndUpdateJobReadNotification(receiverId, jobId, flag) {
    const self = this;
    this.db.database.ref('Notification').orderByChild('jobId').equalTo(jobId).once('value', function(snapshot) {
      snapshot.forEach(snapshotChild => {
        const  value = snapshotChild.val();
        const key = snapshotChild.key;
        if ( value.receiverId === receiverId && value.status === status && value.type !== 'adminPayment') {
          value.status = self.notificationStatus.READ;
          value['id'] = key;
          value[environment.USER_TYPE.STAFF] = {sentOffer: 0 , receivedOffer : 0, contract: 0 };
          value[environment.USER_TYPE.PRACTICE] = {sentOffer: 0 , receivedOffer : 0, contract: 0 };
          self.updateNotification(value);
        }
      });
    });
  }
}
