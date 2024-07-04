import { AngularFirestore } from '@angular/fire/firestore';
import { Notification } from '../modal/notification.modal';
import { Injectable, Query } from '@angular/core';
import { JwtService } from './jwt.service';
import { currentUser } from '../../layouts/home-layout/user.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})

export class FirestoreService {
     notification: Notification = new Notification();
    currentUser: currentUser = new currentUser;
  constructor(
               private firestore: AngularFirestore,
               private jwtService: JwtService,
              ) {
                this.currentUser = this.jwtService.currentLoggedUserInfo;
               }

  createNotification(notification: Notification) {
     return this.firestore.collection('notification').add({...notification});
  }

  getNotification() {
    /* .orderBy('createdAt', 'desc') */
    return this.firestore.collection('notification', ref =>
     ref.orderBy('createdAt', 'desc').where('receiverId', '==' , this.currentUser._id)
       .where('viewStatus', 'in', [environment.notificationStatus.READ,
        environment.notificationStatus.UNREAD]).limit(10) ).snapshotChanges();


    //  return this.firestore.collection('notification', ref =>
    //  ref.where('receiverId', '==' , this.currentUser._id)
    //  .where('viewStatus', 'in', [environment.notificationStatus.READ,
    //   environment.notificationStatus.UNREAD]).orderBy('createdAt', 'desc') ).snapshotChanges();
  }

  getAllNotification() {
     return this.firestore.collection('notification').snapshotChanges();
  }

  updateNotification(notification: Notification) {
     const notificationId = notification.id;
     delete notification.id;
     this.firestore.doc('notification/' + notificationId).update(notification);

  }

  deleteNotification(notificationId){
     this.firestore.doc('notification/' + notificationId).delete();
    }

}
