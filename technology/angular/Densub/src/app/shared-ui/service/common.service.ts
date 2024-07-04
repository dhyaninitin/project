import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { JobsService } from '../../views/dashboard-pages/dental-practice/jobs/job-posts/jobs.service';
import { ToastrService } from 'ngx-toastr';
import { JobNewPost } from '../modal/job.modal';
import { Users } from '../modal/users.modal';
import { UsersService } from './users.service';
import { JwtService } from './jwt.service';
import { currentUser } from '../../layouts/home-layout/user.model';
import { PositionTypeService } from './positionType.service';
import { FavoriteService } from './favorite.service';
import { Notification } from '../modal/notification.modal';
import { GlobalService } from '../service/global.service';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class Common {
  notification: any = new Notification();
  currentUser: currentUser = new currentUser;
  constructor(
    private jobsService: JobsService,
    private toastr: ToastrService,
    // private userService: UsersService,
    private jwtService: JwtService,
    private favoriteService: FavoriteService,
    private globalService: GlobalService,
    private firebaseService: FirebaseService
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
  }

  /*
    Incease Count according to type field while updating the job
   */
  incDecOfferCount(jobDetail, fieldName = '' , increment = true, count = 1 ) {
    jobDetail['total'] = (jobDetail.total) ? jobDetail.total  : (new JobNewPost()).total;
     // tslint:disable-next-line: no-unused-expression
     jobDetail.total[fieldName] = (increment) ? (jobDetail.total[fieldName] + count) : (jobDetail.total[fieldName] - count);
     console.log(jobDetail.total[fieldName] + count, fieldName);
     this.jobsService.saveJob(jobDetail).subscribe(
      data => {
        if (data.status === 200) {
          console.log(data.data);
            return data.data;
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  incDecJobCount(jobDetail, fieldName = '' , increment = true, count = 1 ) {
    // jobDetail['total'] = (jobDetail.total) ? jobDetail.total  : (new JobNewPost()).total;
    //  // tslint:disable-next-line: no-unused-expression
    //  jobDetail.total[fieldName] = (increment) ? (jobDetail.total[fieldName] + count) : (jobDetail.total[fieldName] - count);
    //  console.log(jobDetail.total[fieldName] + count, fieldName);

    const condition = {
      _id: jobDetail._id
    };
    const key = 'total.' + fieldName;
     count = +count;
      const updateData = {
        '$inc': {
           [key]: (increment) ? count : -count
        }
      }
     this.jobsService.updateCounts({condition, updateData}).subscribe(
      data => {
        if (data.status === 200) {
          console.log(data.data);
            return data.data;
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  incDecJobCountFromInvitation(jobPostID, fieldName = '' , increment = true, count = 1 ) {
    // jobDetail['total'] = (jobDetail.total) ? jobDetail.total  : (new JobNewPost()).total;
    //  // tslint:disable-next-line: no-unused-expression
    //  jobDetail.total[fieldName] = (increment) ? (jobDetail.total[fieldName] + count) : (jobDetail.total[fieldName] - count);
    //  console.log(jobDetail.total[fieldName] + count, fieldName);

    const condition = {
      _id: jobPostID
    };
    const key = 'total.' + fieldName;
     count = +count;
      const updateData = {
        '$inc': {
           [key]: (increment) ? count : -count
        }
      }
     this.jobsService.updateCounts({condition, updateData}).subscribe(
      data => {
        if (data.status === 200) {
          console.log('I am in incDecJobCountFromInvitations');
          console.log(data.data);
            return data.data;
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }


  /*
    Incease Count according to type field while updating the users
   */
  // incDecUsersCount(userDetail, fieldName = '' , increment = true, value = 1) {
  //   console.log(userDetail, fieldName , increment, value)
  //    userDetail['total'] = (userDetail.total) ? userDetail.total  : (new Users()).total;
  //     if (fieldName === 'hours') {
  //       userDetail.total[fieldName] = (userDetail.total[fieldName]) ?  userDetail.total[fieldName] + value : value;
  //     } else {
  //       if(userDetail.total[fieldName]) {
  //         console.log(userDetail.total[fieldName],'========================',(increment),( userDetail.total[fieldName] - value));
  //         userDetail.total[fieldName] = (increment) ? (userDetail.total[fieldName] + value) : ( userDetail.total[fieldName] - value);
  //       } else {
  //         userDetail.total[fieldName] = value;
  //       }
  //     }
  //    this.userService.saveUserData(userDetail).subscribe(
  //     data => {
  //       if (data.status === 200) {
  //          return data.data;
  //       } else {
  //         this.toastr.error(
  //           'There are some server Please check connection.',
  //           'Error'
  //         );
  //       }
  //     },
  //     error => {
  //       this.toastr.error(
  //         'There are some server Please check connection.',
  //         'Error'
  //       );
  //     }
  //   );
  // }
  removeFavorite(favoriteId) {
    console.log(favoriteId,"This is my favorite job id");
    var condition = {favoriteId: favoriteId };
    this.favoriteService.removeAllFavorite({condition }).subscribe(
      data => {
        if (data.status === 200) {
        console.log('Removed from favorites.');
        }
      },
      error => {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  sendOfferDeleteNotification(type = '', staffId, jobTitle, jobId, offerId) {
    if (!type) {
      return false;
    }
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const title = this.globalService.titleCase(jobTitle);
    const currentTime = new Date().getTime();
    const notification = environment.notification;
    this.notification = {
            senderId    : this.currentUser._id,
            receiverId  : staffId,
            message     : notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName),
            redirectLink : notification[type].link,
            type : notification[type].type,
            offerId : offerId,
            jobId : jobId,
            staff:    {sentOffer: 0 , receivedOffer : 0, contract: 0},
            practice: {sentOffer: 0 , receivedOffer : 0, contract: 0},
            createdAt: currentTime,
            updatedAt: currentTime,
            status : environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
  }

}
