import { Component, OnInit, NgZone } from '@angular/core';
import { FirebaseService } from '../../../shared-ui/service/firebase.service';
import { environment } from '../../../../environments/environment';
import { Notification } from '../../../shared-ui/modal/notification.modal';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  public notificationList: any = [];
  notificationStatus: any = environment.notificationStatus;
  constructor(
    private ngZone:NgZone,
    private firebaseService: FirebaseService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
  ) {
    // this.route.params.subscribe(res => {
    //   this.getNotifications();
    // });
   }

  ngOnInit() {
    this.getAllNotifications();
  }


  getAllNotifications() {
    const self = this;
    const notifications = this.firebaseService.getAllNotification();
    notifications.on('value', async function(snapshot) {
      const values = snapshot.val();
       if (values) {
           self.notificationList = [];
         const convertObjToArray = Object.entries(values);
        convertObjToArray.forEach((value, index) => {
             // --------- Skip the delete Notification -----------------------
             if ( environment.notificationStatus.DELETE === value[1]['status']) {
               return false;
             }
             // -----  Count Unread Notification -------------------------------
             value[1]['id'] = value[0];
             self.notificationList.push(value[1]);
             if (index === (convertObjToArray.length - 1) ) {
              self.notificationList.reverse();
             }
         });
       }
     });
   }

  updateNotificationStatus(notification: Notification) {
    console.log('I am in update Notification');
    const redirectLink = notification.redirectLink.toString();
    if (notification.status === this.notificationStatus.UNREAD ) {
      notification.status = this.notificationStatus.READ;
      this.firebaseService.updateNotification(notification);
    }
     this.router.navigateByUrl(redirectLink);
  }
}
