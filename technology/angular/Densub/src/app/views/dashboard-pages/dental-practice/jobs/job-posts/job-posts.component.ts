import { Component, OnInit, ViewChild, ComponentFactoryResolver, ApplicationRef, Injector } from '@angular/core';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UsersService } from '../../../../../shared-ui/service/users.service';
import { AlertService } from '../../../../../shared-ui/alert/alert.service';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { environment } from '../../../../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { JobNewPost } from '../../../../../shared-ui/modal/job.modal';
import * as moment from 'moment';
import { SkillsService } from '../../../admin/skills/skills/skills.service';
import { JobsService } from './jobs.service';
import { NgbModal, NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AddEditPostComponent } from '../../../../../shared-ui/add-edit-post/add-edit-post.component';
import { Filter } from './job-filter';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';
import { OfferService } from '../../../../../shared-ui/service/offer.service';
import { savedFilters } from '../../../../../shared-ui/global/allFilters';
import { Common } from '../../../../../shared-ui/service/common.service';
// import { Notification } from '../../../../../shared-ui/modal/notification.modal';
import { currentUser } from '../../../../../layouts/home-layout/user.model';
import { WorkDiaryService } from '../../../../../shared-ui/service/workDiary.service';
import { AngularFireDatabase } from '@angular/fire/database';


@Component({
  selector: 'app-job-posts',
  templateUrl: './job-posts.component.html',
  styleUrls: ['./job-posts.component.scss']
})
export class JobPostsComponent implements OnInit {
  tabType: any = environment.JOB_TYPE.TEMPORARY;
  jobTypes: any = environment.JOB_TYPE;
  jobStatus: any = environment.JOB_STATUS;
  jobStatusColor: any = environment.JOB_STATUS_COLOR;
  experienceData: any = [];
  getJobChatMessages:any = [];
  selectedDate: any;
  jobVisibility: any = environment.JOB_VISIBILITY;
  jobLabel: any = environment.JOB_LABEL;
  currentUser: currentUser = new currentUser;
  // notification: any = new Notification();
  newJob: JobNewPost = new JobNewPost();
  @ViewChild('deleteJobModal', { static: false })
  public deleteJobModal: ModalDirective;
  @ViewChild('closeJobModal', { static: false })
  public closeJobModal: ModalDirective;
  @ViewChild('reopenJobModal', { static: false })
  public reopenJobModal: ModalDirective;

  @ViewChild('contractModal', { static: false }) public contractModal: ModalDirective;
  @ViewChild('invitedListModal', { static: false }) public invitedListModal: ModalDirective;
  jobList: any = [];
  order = 'createdAt';
  viewProfileLink = '/#/staff-profile';
  reverse = false;
  itemsPerPage = 10;
  messageCount:number = 0;
  /* Paid Amount for permanent */
  monthlyCharges = 50;
  closeResult: String;
  postAjob: Boolean = false;
  setDataFilter: any;
  getPracticeTimesheet: any = [];
  dataFilter: Filter = new Filter();
  PositionTypeData: any = [];
  jobStatusArrray: any = Object.keys(environment.JOB_STATUS_COLOR);
  datePickerConfig: any = {
    allowMultiSelect: false,
    disableKeypress: true,
    // min: moment(new Date()).format('MMM DD,YYYY'),
    format: 'MMM DD,YYYY'
  };
  isDeleteWarningModal = false;
  tempJobList: any;

  jobTabs: string[] = ['Open', 'Filled','In Progress', 'Approve & Pay', 'Completed', 'All Jobs'];
  selectedJobTab = this.jobTabs[0];
  public isCollapsed = true;
  public isCollapsedMoreInfo = true;

  // filter object only for open tap
  public dataFilterForOpen = {
    jobTitle: "",
    jobType: [], // change data type string to array
    positionType: [], // change data type string to array
    changedJobStatus: '{"open"}',
    desiredHourlyRate: [],
    status: [],
    jobDate: '',
    jobDateTo: ''
  }
  public dataFilterForFilled = {
    jobTitle: "",
    jobType: [], // change data type string to array
    positionType: [], // change data type string to array
    changedJobStatus: 'filled',
    desiredHourlyRate: [],
    jobStatus: [],
    status: '',
    jobDate: '',
    jobDateTo: ''
  }
  invitationsList = [];
  invitedStaffList = [];
  currentIndex: any;

  constructor(
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private usersService: UsersService,
    private alertService: AlertService,
    private jwtService: JwtService,
    private skillsService: SkillsService,
    private jobsService: JobsService,
    private injector: Injector,
    private ngBoostrapModalService: NgbModal,
    private readonly activeModal: NgbActiveModal,
    private firebaseService: FirebaseService,
    private offerService: OfferService,
    private commonService: Common,
    private db: AngularFireDatabase,
    private workDiaryService: WorkDiaryService,
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    if (window.location.href.includes('post-job')) {
      this.postAjob = true;
    }
    this.globalService.topscroll();
    this.setOrder('createdAt');

    setTimeout(() => {
      this.experienceData = this.globalService.experienceData;
    }, 2000);
  }

  ngOnInit() {
    setTimeout(() => {
      this.PositionTypeData = this.globalService.positionTypeData;
    }, 2000);
    if (savedFilters.practice.myPostedJobs) {
      this.dataFilter.changedJobStatus = 'open';
      this.dataFilter = savedFilters.practice.myPostedJobs;
      this.dataFilter.jobDate = (this.dataFilter.jobDate) ? this.dataFilter.jobDate : (new Filter()).jobDate;
      savedFilters.practice.myPostedJobs = this.dataFilter;
      this.setDataFilter = Object.assign({}, this.dataFilter);
    }
    this.modifyJobStatus(this.tabType);
    
    if (this.postAjob) {
      this.showNewJobModal();
    }
    this.getTimesheet();
    if(this.globalService.previousRoute){
        $('body').addClass('noScroll');
    }
  }

  getTimesheet(){
    this.workDiaryService.getworkDiaryDetailsForProduct({ practiceId: this.currentUser._id}).subscribe(data => {
      if (data.status === 200) {
        this.getPracticeTimesheet = data.data;
      }else {
          this.toastr.error('There are some server Please check connection.', 'Error');
        }
      }, error => {
        this.toastr.error(
          'There are some server Please check connection.', 'Error');
    });
  }

  getTimesheetDetails(){
    this.getPracticeTimesheet.forEach(elementOfTimesheet => {
      this.jobList.forEach(elementOfJob => {
        if(elementOfJob.changedJobStatus== this.jobStatus.CANCELLED){
        }
        if(elementOfJob.changedJobStatus === this.jobStatus.PAYTOACTIVATE && elementOfTimesheet.contractId.jobPostId == elementOfJob._id){
          elementOfJob.timeSheet = elementOfTimesheet;
        }
      });
    });
    console.log(this.jobList);
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  /** This method will filter user behalf criteria */
  setFilter(filterFor) {
    if (filterFor == "open") {
      savedFilters.practice.myPostedJobs = this.dataFilterForOpen;
      this.setDataFilter = Object.assign({}, this.dataFilterForOpen);
    } else if (filterFor == "filled") {
      this.dataFilterForOpen.changedJobStatus = 'filled';
      savedFilters.practice.myPostedJobs = this.dataFilterForOpen;
      this.setDataFilter = Object.assign({}, this.dataFilterForOpen);
    } else if (filterFor == "inProgress") {
      // this.dataFilterForOpen.changedJobStatus = 'payToActivate';
      savedFilters.practice.myPostedJobs = this.dataFilterForOpen;
      this.setDataFilter = Object.assign({}, this.dataFilterForOpen);
    }else if (filterFor == "payToActivate") {
      this.dataFilterForOpen.changedJobStatus = 'payToActivate';
      savedFilters.practice.myPostedJobs = this.dataFilterForOpen;
      this.setDataFilter = Object.assign({}, this.dataFilterForOpen);
    } else if (filterFor == "completed") {
      this.dataFilterForOpen.changedJobStatus = 'completed';
      savedFilters.practice.myPostedJobs = this.dataFilterForOpen;
      this.setDataFilter = Object.assign({}, this.dataFilterForOpen);
    } else if(filterFor == "all"){
      // this.dataFilterForOpen.changedJobStatus = 'completed';
      savedFilters.practice.myPostedJobs = this.dataFilterForOpen;
      this.setDataFilter = Object.assign({}, this.dataFilterForOpen);
    } else {
      // this.dataFilter.changedJobStatus = '{expired,cancelled}';
      this.dataFilter.changedJobStatus = '{}';
      savedFilters.practice.myPostedJobs = this.dataFilter;
      console.log(this.dataFilter);
      // this.dataFilter.jobDate = (this.dataFilter.jobDate) ?
      //                           moment(this.dataFilter.jobDate.toString()).format('MMM DD,YYYY') :
      //                           this.dataFilter.jobDate;
      this.setDataFilter = Object.assign({}, this.dataFilter);
    }
  }

  selectFilter(filterType, filter) {
    if (filterType == "position") {
      if (event.currentTarget["checked"]) {
        this.dataFilterForOpen.positionType.push(filter);
      } else {
        let index = this.dataFilterForOpen.positionType.indexOf(filter);
        this.dataFilterForOpen.positionType.splice(index, 1);
      }
    } else if (filterType == "jobTypes") {
      if (event.currentTarget["checked"]) {
        this.dataFilterForOpen.jobType.push(filter);
      } else {
        let index = this.dataFilterForOpen.jobType.indexOf(filter);
        this.dataFilterForOpen.jobType.splice(index, 1);
      }
    } else if(filterType == "status"){
      if (event.currentTarget["checked"]) {
        this.dataFilterForOpen.status.push(filter);
      } else {
        let index = this.dataFilterForOpen.status.indexOf(filter);
        this.dataFilterForOpen.status.splice(index, 1);
      }
    }
    else if(filterType == "desiredHourlyRate"){
      let ratePerHr = [];
      if(filter == "<$20"){
        for(let index = 0; index < 20; index++){
          ratePerHr[index] = index;
        }
        // ratePerHr = [...new Array(19)].map((_,i) => console.log('hi', i));
      }else if(filter == "$20-$50"){
        for(let index = 0; index < 31; index++){
          ratePerHr[index] = index + 20;
        }
        // ratePerHr = [...new Array(31)].map((_,i) => i+19);
      }else if(filter == "$51-$100"){
        for(let index = 0; index < 50; index++){
          ratePerHr[index] = index + 51;
        }
        // ratePerHr = [...new Array(51)].map((_,i) => i+51);
      }else if(filter == "$101-$500"){
        for(let index = 0; index < 400; index++){
          ratePerHr[index] = index + 101;
        }
        // ratePerHr = [...new Array(400)].map((_,i) => i+101);
      }
      if (event.currentTarget["checked"]) {
        this.dataFilterForOpen.desiredHourlyRate = this.dataFilterForOpen.desiredHourlyRate.concat(ratePerHr);
      } else {
        for(let indexOfRate = 0; indexOfRate < ratePerHr.length; indexOfRate++){
          let index = this.dataFilterForOpen.desiredHourlyRate.indexOf(ratePerHr[indexOfRate]);
          this.dataFilterForOpen.desiredHourlyRate.splice(index, 1);
        }
      }
    }
  }

  /** This method will reset filter criteria*/
  resetFilter() {
    savedFilters.practice.myPostedJobs = null;
    this.setDataFilter = this.dataFilter = new Filter();
    // this.setDataFilter = { firstName: '' };
    let checkboxes = document.getElementsByTagName('input');
    for (let x = 0; x < checkboxes.length; x++) {
      checkboxes[x]["checked"] = false;
    }
    this.dataFilterForOpen = {
      jobTitle: "",
      jobType: [],
      positionType: [],
      changedJobStatus: '',
      desiredHourlyRate: [],
      status: [],
      jobDate: '',
      jobDateTo: ''
    }
  }
  changeTab(tabType: String) {
    this.tabType = tabType;
    this.getJobs(this.tabType);
  }

  showNewJobModal(job?: any) {
    if (job) {
      // Contract Modal
      //const total = job.total.sentStaffOffers + job.total.sentPracticeOffers;
      const total =  job.total.sentStaffOffers;
      if (this.jobStatus.CONTRACT === job.status || this.jobStatus.COMPLETED === job.status ||
        this.jobStatus.CANCELLED === job.status || (
          (this.jobStatus.OPEN === job.status || this.jobStatus.CLOSED === job.status) && total > 0
        )
      ) {
        this.isDeleteWarningModal = false;
        this.contractModal.show();
        return false;
        /* || (job.total && job.total.sentStaffOffers) */
      } else {
        job.practiceName = job.practiceName._id;
        this.newJob = job;
        this.openJobModal();
        return false;
      }
      // For edit & draft
      // this.newJob = job;
      // this.checkJobOffer(job._id, 'edit');
    } else {
      this.newJob = new JobNewPost();
      this.openJobModal();
    }
  }

  closeModel() {
    this.deleteJobModal.hide();
    this.invitedListModal.hide();
    this.closeJobModal.hide();
    this.reopenJobModal.hide();
  }
  // New Lofic for job expired
  modifyJobStatus(tabType){
    //get jobs ids which needs to be expired
    console.log('in Modify Job Status');
    const jobEndTime = moment().toISOString();
    console.log(jobEndTime);
    const condition = {
      expireDate: { '$lt' : jobEndTime },
      status: { '$in': [environment.JOB_STATUS.OPEN, environment.JOB_STATUS.CLOSED] } 
    }
    this.jobsService.checkExpiration({condition:condition}).subscribe(
      data=>{
        if (data.status === 200) {         
          // if (data.data.length) {

          // }else{}
          this.getJobs(tabType);
        }else{
          this.getJobs(tabType);
        }
      }
    );
    
  }


  getJobs(tabType) {
    this.spinner.show();
    const condition = {
      draft: false,
      createdBy: this.jwtService.currentLoggedUserInfo._id,
    };
    this.jobsService.getJobsWithContractDetails({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {         
          if (data.data.length) {
            this.spinner.hide();
            this.jobList = data.data.map((job, index) => {
              job['changedJobStatus'] = job.status;
              job["isCollapsedMoreInfo"] = true;
              if (job['changedJobStatus'] === this.jobStatus.PAYTOACTIVATE) {
                job['changedJobStatus'] = 'payToActivate';

                const conditionNew = {
                  jobPostId: job._id,
                  status:environment.JOB_STATUS.CONTRACT
                };

                this.offerService.getOffer( { condition: conditionNew } ).subscribe(
                  data => {
                   // console.log(data);
                    if (data.status === 200) {
                      job.desiredHourlyRate = data.data.offerSteps[data.data.offerStatus].amount;
                      job.startTime = data.data.offerSteps[data.data.offerStatus].startTime;
                      job.endTime = data.data.offerSteps[data.data.offerStatus].endTime;
                      job.staffId = data.data.staffId;
                    }
                });

              }
              if (job['changedJobStatus'] === this.jobStatus.INPROGRESS) {
                job['changedJobStatus'] = 'inprogress';

                const conditionNew = {
                  jobPostId: job._id,
                  status:environment.JOB_STATUS.CONTRACT
                };

                this.offerService.getOffer( { condition: conditionNew } ).subscribe(
                  data => {
                    if (data.status === 200) {
                      //console.log(data);
                      job.desiredHourlyRate = data.data.offerSteps[data.data.offerStatus].amount;
                      job.startTime = data.data.offerSteps[data.data.offerStatus].startTime;
                      job.endTime = data.data.offerSteps[data.data.offerStatus].endTime;
                      job.staffId = data.data.staffId;
                    }
                });
              }
              if (job['changedJobStatus'] === this.jobStatus.COMPLETED) {
                job['changedJobStatus'] = 'completed';

                const conditionNew = {
                  jobPostId: job._id,
                  status:environment.JOB_STATUS.CONTRACT
                };

                this.offerService.getOffer( { condition: conditionNew } ).subscribe(
                  data => {
                    if (data.status === 200) {
                      //console.log(data);
                      job.desiredHourlyRate = data.data.offerSteps[data.data.offerStatus].amount;
                      job.startTime = data.data.offerSteps[data.data.offerStatus].startTime;
                      job.endTime = data.data.offerSteps[data.data.offerStatus].endTime;
                      job.staffId = data.data.staffId;
                    }
                });
              }
              if (job['changedJobStatus'] === this.jobStatus.FILLED) {
                job['changedJobStatus'] = 'filled';

                const conditionNew = {
                  jobPostId: job._id,
                  status:environment.JOB_STATUS.CONTRACT
                };
                
                this.offerService.getOffer( { condition: conditionNew } ).subscribe(
                  data => {
                    if (data.status === 200) {
                     // console.log(data);
                      job.desiredHourlyRate = data.data.offerSteps[data.data.offerStatus].amount;
                      job.startTime = data.data.offerSteps[data.data.offerStatus].startTime;
                      job.endTime = data.data.offerSteps[data.data.offerStatus].endTime;
                      job.staffId = data.data.staffId;
                     
                    }
                  });

              } else if (job['changedJobStatus'] === this.jobStatus.CANCELLED) {
                  const conditionNew = {
                    jobPostId: job._id
                  };
                  this.offerService.getOffer( { condition: conditionNew } ).subscribe(
                    data => {
                      if (data.status === 200) {
                        job.cancelContract = data.data.cancelContract;
                      }
                  });
                if(job['contractId']){
                  if (job['contractId'] && job['contractId']['contractStatus'] &&
                  job['contractId']['contractStatus'] === environment.CONTRACT_STATUS.REVOKE ||
                  job['contractId']['contractStatus'] === environment.CONTRACT_STATUS.CANCELLED
                ) {
                  if (job['contractId']['cancelContract'] &&
                    job['contractId']['cancelContract']['cancelBy'] === environment.USER_TYPE.PRACTICE) {
                    job['changedJobStatus'] = 'cancelledByPractice';
                  } else if (job['contractId']['cancelContract'] &&
                    job['contractId']['cancelContract']['cancelBy'] === environment.USER_TYPE.STAFF) {
                    job['changedJobStatus'] = 'cancelledByStaff';
                  }
                }
                }

              }
              // if (index === (data.data.length - 1)) {
              //   this.getAllNotifications();
              //   this.setFilter("open");
              // }
              return job;
            });
            if (this.jobList.length) {
                this.getAllNotifications();
                this.setFilter("open");
            }
          }
          this.tempJobList = this.jobList;
          this.getTimesheetDetails();
          this.spinner.hide();
        }
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  showChangedJobTitle(title = '') {
    if (title === 'cancelledByStaff') {
      return 'Cancelled By Staff';
    }
    if (title === 'cancelledByPractice') {
      return 'Cancelled By Practice';
    }
    return title;
  }

  getAllNotifications() {
    const self = this;
    const notifications = this.firebaseService.getAllNotification();
    notifications.on('value', function (snapshot) {
      const values = snapshot.val();
      console.log('Val',values.length, values)
      if (values) {
        self.getJobChatMessages = []
        let convertObjToArray = Object.entries(values);
        convertObjToArray.forEach((value) => {
          if(environment.notificationStatus.UNREAD === value[1]['status'] && 
          'chatMessage' === value[1]['type']){
              self.getJobChatMessages.push(value[1]);
          }
          else if (environment.notificationStatus.UNREAD === value[1]['status'] &&
            value[1][environment.USER_TYPE.PRACTICE] &&
            value[1][environment.USER_TYPE.PRACTICE]['receivedOffer'] > 0) {
            const index = self.jobList.findIndex(job => {
              let updateCount = 0;
              if(job.updatedOfferCount > 0){
                if((value[1]['isViewedByPractice'] == false) && (job._id === value[1]['jobId'])){
                  //updateCount =updateCount +1;
                  job.updatedOfferCount = job.updatedOfferCount + 1;
                }
              }else{
                job.updatedOfferCount = 0;
                if((value[1]['isViewedByPractice'] == false) && (job._id === value[1]['jobId'])){
                  //updateCount =updateCount +1;
                  job.updatedOfferCount = job.updatedOfferCount + 1;
                }
              }

              //job.updatedOfferCount = updateCount;
              return (job._id === value[1]['jobId'] && job.createdBy._id === value[1]['receiverId']);
            });

            if (index > -1) {
              self.jobList[index]['updatedOffer'] = true;
              //self.jobList[index]['updatedOfferCount'] = updateCount;
            }
          }
        })
        /* ------------------------------------------------------------ */
      }
    });
  }

  showDeletejobModal(job: any) {

    // const total = job.total.sentStaffOffers + job.total.sentPracticeOffers;
    // ||
    // ( (this.jobStatus.OPEN === job.status || this.jobStatus.CLOSED === job.status ) && total > 0 )
    if (this.jobStatus.CONTRACT === job.status || this.jobStatus.COMPLETED === job.status
    ) {
      this.isDeleteWarningModal = true;
      this.contractModal.show();
      return false;
    } else {
      this.newJob = job;
      this.isDeleteWarningModal = false;
      this.deleteJobModal.show();
      return false;
    }
    // this.newJob = job;
    // this.checkJobOffer(job._id, 'delete');
  }

  /*   deleteJobs() {
      this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
      this.spinner.show();
      this.jobsService.deleteJob({ _id: this.newJob._id }).subscribe(
        data => {
          this.spinner.hide();
          this.deleteJobModal.hide();
          if (data.status === 200) {
            const found = this.jobList.filter(obj => {
              return obj._id === this.newJob._id;
            });
            if (found.length) {
              const index = this.jobList.indexOf(found[0]);
              this.jobList.splice(index, 1);
            }
            this.toastr.success('Job has been deleted.', 'Success');
          }
          this.newJob = new JobNewPost();
        },
        error => {
          this.spinner.hide();
          this.deleteJobModal.hide();
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      );
    } */

  deleteJobOffers() {
    this.globalService.setLoadingLabel('Delete Processing... Please Wait.');
    this.spinner.show();
    const condition = {
      jobPostId: this.newJob._id
    };
    this.offerService.getAllOffers({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          const self = this;
          data.data.map(offer => {
            self.commonService.sendOfferDeleteNotification(
              'deleteOffer',
              offer.staffId._id,
              offer.jobPostId.jobTitle,
              offer.jobPostId._id,
              offer._id
            );
            self.firebaseService.deleteMessageCon(self.currentUser._id, offer.jobPostId._id);
          });
          this.deleteAllOffers(this.newJob._id);
          this.deleteJob();
          // this.toastr.success('Job has been deleted.', 'Success');
          // this.spinner.hide();
        } else {
          this.spinner.hide();
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      });
  }

  deleteJob() {
    const deleteJob = {
      _id: this.newJob._id,
      // status: this.jobStatus.DELETED
    };
    // .deleteJob({ _id: this.newJob._id })
    // this.jobsService.saveJob(deleteJob)
    this.jobsService.deleteJob(deleteJob).subscribe(
      data => {
        if (data.status === 200) {
          this.deleteJobModal.hide();
          this.commonService.removeFavorite(this.newJob._id);
          // this.firebaseService.getJobAndDeleteNotification(this.newJob._id);
          // if (this.newJob._id) {
          //   this.deleteOffers();
          // }
          this.newJob = new JobNewPost();
        }
      },
      error => {
        this.spinner.hide();
        this.deleteJobModal.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }


  deleteAllOffers(jobId) {
    const condition = {
      jobPostId: jobId
    };
    this.offerService.deleteAllOffer(condition).subscribe(
      data => {
        if (data.status === 200) {
          this.jobList = this.jobList.filter(obj => {
            return obj._id !== jobId;
          });
          this.toastr.success('Job has been deleted.', 'Success');
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      });
  }


  /*   checkJobOffer(jobId , type) {
      this.spinner.show();
      const condition = {
        jobPostId : jobId,
        status: {$in : [environment.OFFER_STATUS_NEW.OFFER] } ,
      };
      this.offerService.getTotal({condition}).subscribe( (data) => {
        if (data.status === 200) {
          this.spinner.hide();
          if (type === 'delete') {
            if (data.data === 0) {
              this.isDeleteWarningModal = false;
              this.deleteJobModal.show();
              return false;
            } else {
              this.isDeleteWarningModal = true;
              this.contractModal.show();
              return false;
            }
          };
          if(type === 'edit') {
              if (data.data === 0) {
                this.openJobModal();
              } else {
                this.isDeleteWarningModal = false;
                this.contractModal.show();
                return false;
              }
          }
        } else {
          this.spinner.hide();
            this.toastr.error(
              'There are some server Please check connection.',
              'Error'
            );
        }
      },
      (error) => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
      );

    } */

  openJobModal() {
    const modalRef = this.ngBoostrapModalService.open(
      AddEditPostComponent,
      { centered: true, backdrop: true, keyboard: true },
    );
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.getJobs(this.tabType);
    });
    setTimeout(() => {
      modalRef.componentInstance.setData(JSON.stringify(this.newJob), '/practice/job-posts', this.tabType);
    }, 200);
  }

  createRepostJobArray(jobDetail) {
    let jobDetails = { ...jobDetail };
    jobDetails['jobDates'] = [];
    // delete jobDetails._id;
    jobDetails.status = (new JobNewPost).status;
    jobDetails.visibility = (new JobNewPost).visibility;
    jobDetails.total = (new JobNewPost).total;
    // jobDetails.visibility = (new JobNewPost).expireDate;
    // jobDetails.offerCount = (new JobNewPost).offerCount;
    // jobDetails.createdBy = (new JobNewPost).createdBy;
    if (jobDetails.createdAt) {
      delete jobDetails.createdAt;
    }
    if (jobDetails.updatedAt) {
      delete jobDetails.updatedAt;
    }
    if (jobDetails.contractId) {
      delete jobDetails.contractId;
    }
    if (jobDetails.createdBy) {
      delete jobDetails.createdBy;
    }
    if (jobDetails.changedJobStatus) {
      delete jobDetails.changedJobStatus;
    }
    // jobDetails['declineStaffList'] = this.declineStaffList;
    const jobDate = moment(jobDetails.jobDate).endOf('d');
    if (moment().isAfter(jobDate)) {
      jobDetails.jobDate = '';
    }
    if (jobDetails.expireDate && moment().isSameOrAfter(jobDetails.expireDate)) {
      jobDetails.expireDate = (new JobNewPost).expireDate;
      jobDetails.paymentId = (new JobNewPost).paymentId;
      jobDetails.activeMonthRate = (new JobNewPost).activeMonthRate;
      // jobDetails.status = environment.JOB_STATUS.EXPIRED;
    }
    jobDetails.practiceName = jobDetails.practiceName._id;
    jobDetails['repostJob'] = true;
    return jobDetails;
  }

  repostJob(jobDetail) {
    const new_jobDetails = this.createRepostJobArray(jobDetail);
    const modalRef = this.ngBoostrapModalService.open(
      AddEditPostComponent,
      { centered: true, backdrop: true, keyboard: true },
    );
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
    });
    setTimeout(() => {
      modalRef.componentInstance.setData(JSON.stringify(new_jobDetails),
        '/practice/job-posts',
        new_jobDetails.jobType);
    }, 200);
  }

  tableSearch(value: string, tableValue: string) {
    console.log(this.order);
    console.log(value);
    console.log(this.jobList);
    console.log(this.tempJobList);
    console.log(tableValue);

    if (!value) {
      this.jobList = this.tempJobList;
    } else {
      const tableValueVar = tableValue;
      this.jobList = this.tempJobList.filter(x => x.tableValueVar.trim().toLowerCase().includes(value.trim().toLowerCase()));
      // this.jobList = this.tempJobList.filter(x =>  {
      //  const jobTitle = x.jobTitle.trim().toLowerCase().includes(value.trim().toLowerCase());
      //  const jobType = x.jobType.trim().toLowerCase().includes(value.trim().toLowerCase());
      //  const status = x.status.trim().toLowerCase().includes(value.trim().toLowerCase());
      //  return (jobTitle + jobType + status);
      // }
      //   );

    }
  }
  jobstatusSearch(value: string) {
    if (!value) {
      this.jobList = this.tempJobList;
    } else {
      this.jobList = this.tempJobList.filter(x => x.status.trim().toLowerCase().includes(value.trim().toLowerCase()));
    }
  }
  jobTitleSearch(value: string) {
    if (!value) {
      this.jobList = this.tempJobList;
    } else {
      this.jobList = this.tempJobList.filter(x => x.jobTitle.trim().toLowerCase().includes(value.trim().toLowerCase()));
    }
  }
  jobTypeSearch(value: string) {
    if (!value) {
      this.jobList = this.tempJobList;
    } else {
      this.jobList = this.tempJobList.filter(x => x.jobType.trim().toLowerCase().includes(value.trim().toLowerCase()));
    }
  }

  selectATab(tabValue: string) {
    if (tabValue == this.jobTabs[0]) {
      this.dataFilter.changedJobStatus = 'open';
    } else if (tabValue == this.jobTabs[1]) {
      this.dataFilter.changedJobStatus = 'filled';
    } else if (tabValue == this.jobTabs[3]) {
      this.dataFilter.changedJobStatus = 'payToActivate';
    } else if (tabValue == this.jobTabs[4]) {
      this.dataFilter.changedJobStatus = 'completed';
    } else if (tabValue == this.jobTabs[2]) {
      this.dataFilter.changedJobStatus = 'inprogress';
    } else if (tabValue == this.jobTabs[5]) {
     this.dataFilter.changedJobStatus = '{"open", "closed","cancelled","filled", "payToActivate", "completed", "inprogress", "expired" ,"Completed - Marked As Paid by Staff", "completed - Marked as paid by practice"}';
    }



    this.selectedJobTab = tabValue;

    savedFilters.practice.myPostedJobs = this.dataFilter;
    // this.dataFilter.jobDate = (this.dataFilter.jobDate) ?
    //                           moment(this.dataFilter.jobDate.toString()).format('MMM DD,YYYY') :
    //                           this.dataFilter.jobDate;
    this.setDataFilter = Object.assign({}, this.dataFilter);
  }





  showInvitedModal(jobId) {

    const condition = {
      jobPostId: jobId,
      sendOfferByPractice: true
    };
    const sort = {
      updatedAt: -1
    };
    this.offerService.getAllOffers({ condition, sort }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.invitationsList = data.data;
            this.getInvitationStatus(jobId, this.invitationsList);
          }
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
    console.log(jobId);
    this.invitedListModal.show();
  }

  getInvitationStatus(jobId, invitedList) {
    console.log(jobId);
    const returnValue: any = [];
    const self = this;

    this.db.database.ref('Notification').orderByChild('jobId').equalTo(jobId).once('value', function (snapshot) {
      snapshot.forEach(snapshotChild => {
        // const  value = snapshotChild.val();
        //returnValue.push(value);
        invitedList.forEach(list => {
          const value = snapshotChild.val();
          if (list.staffId._id === value.receiverId) {
            list.staffId.readStatus = value;
            returnValue.push(list);

          }
        });
      });
      self.saveReturnValue(returnValue);
    });
  }
  saveReturnValue(list) {
    // this.invitedStaffList = list;
    // console.log(this.invitedStaffList);
    this.invitedStaffList = list.filter(function(list, index, self) {
      return index === self.indexOf(list);
    })
  }

  getInvitedStatus(currentOffer) {
    if (currentOffer.staffId.readStatus.status === 'unread' && currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL && currentOffer.status === environment.OFFER_STATUS_NEW.OFFER) {
      return '<span class="badge badge-primary">Not Viewed</span>';
    } else if (currentOffer.staffId.readStatus.status === 'read' && currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL && currentOffer.status === environment.OFFER_STATUS_NEW.OFFER) {
      return '<span class="badge badge-success">Viewed</span>';
    } else if (currentOffer.status === environment.OFFER_STATUS_NEW.CONTRACT){
      return '<span class="badge badge-primary">Hired</span>';
    } else if (currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL && currentOffer.status === environment.OFFER_STATUS_NEW.CONTRACT) {
      return '<span class="badge badge-primary">Invited application Accepted</span>';
    } else if (currentOffer.status === environment.OFFER_STATUS_NEW.EXPIRED) {
      return '<span class="badge badge-secondary">Expired</span>';
    } else if (currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER && currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE) {
      return '<span class="badge badge-danger">Invitation Is Declined</span>';
    } else if (currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL && currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE) {
      let declineByName='';
        if(currentOffer.offerDecline.declineBy === environment.USER_TYPE.STAFF){
          declineByName = environment.NEW_USERS_NAME.STAFF;
        }else{
          declineByName = environment.NEW_USERS_NAME.PRACTICE;
        }
        return '<span class="badge badge-danger">Declined by '+ declineByName+'</span>';
    } else if (currentOffer.offerStatus === environment.OFFER_TYPE.COUNTER && currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE) {
      let declineByName='';
        if(currentOffer.offerDecline.declineBy === environment.USER_TYPE.STAFF){
          declineByName = environment.NEW_USERS_NAME.STAFF;
        }else{
          declineByName = environment.NEW_USERS_NAME.PRACTICE;
        }
        return '<span class="badge badge-danger">Declined by '+ declineByName+'</span>';
    } else if (currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER && currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE) {
      return '<span class="badge badge-danger">Invitation Is Declined</span>';
    } else if (currentOffer.status === environment.OFFER_STATUS_NEW.OFFER && currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER) {
      return '<span class="badge badge-success">Awaiting Response to your counter offer</span>';
    } else if (currentOffer.status === environment.OFFER_STATUS_NEW.CONTRACT && currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER) {
      return '<span class="badge badge-success">Hired</span>';
    } else {
      if (currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL) {
        return '<span class="badge badge-warning">Waiting for Approval</span>';
      } else if (currentOffer.offerStatus === environment.OFFER_TYPE.COUNTER) {
        return '<span class="badge badge-primary"><span class="fa fa-exchange clr-orange mr-2"></span>Counter Offer Received</span>';
      } else {
        return '<span class="badge badge-warning">Waiting for Approval</span>';
      }
    }
  }

  showClosejobModal(job: any, index: any) {
    if (this.jobStatus.CONTRACT === job.status || this.jobStatus.COMPLETED === job.status
    ) {
      this.isDeleteWarningModal = true;
      this.contractModal.show();
      return false;
    } else {
      this.currentIndex = index;
      this.newJob = job;
      this.isDeleteWarningModal = false;
      this.closeJobModal.show();
      return false;
    }
  }

  showOpenjobModal(job: any, index: any) {
    if (this.jobStatus.CONTRACT === job.status || this.jobStatus.COMPLETED === job.status
    ) {
      this.isDeleteWarningModal = true;
      this.contractModal.show();
      return false;
    } else {
      this.currentIndex = index;
      this.newJob = job;
      this.isDeleteWarningModal = false;
      this.reopenJobModal.show();
      return false;
    }
  }

  closeJobOffers(id) {
    this.globalService.setLoadingLabel('Close Job Processing... Please Wait.');
    this.spinner.show();
    const condition = {
      jobPostId: this.newJob._id
    };
    this.offerService.getAllOffers({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          const newJob = {
            _id: this.newJob._id,
            status: environment.JOB_STATUS.CLOSED
          };
          //this.removedChangeJobStatus();
          //---Removed to contract status 30 May
          const successMessage = 'Job is closed';
          this.changeJobStatus(newJob,successMessage);
          this.jobList = this.jobList.map((value, i) => {
            if (id == value._id) {
              value.status = environment.JOB_STATUS.CLOSED;
              value.changedJobStatus = environment.JOB_STATUS.CLOSED;
              return value;
            } else {
              return value;
            }
          });
          // const self = this;
          // data.data.map(offer => {
          //   self.commonService.sendOfferDeleteNotification(
          //     'deleteOffer',
          //     offer.staffId._id,
          //     offer.jobPostId.jobTitle,
          //     offer.jobPostId._id,
          //     offer._id
          //   );
          //   self.firebaseService.deleteMessageCon(self.currentUser._id, offer.jobPostId._id);
          // });
          // this.deleteAllOffers(this.newJob._id);
          // this.deleteJob();
          // this.toastr.success('Job has been deleted.', 'Success');
          // this.spinner.hide();
        } else {
          this.spinner.hide();
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      });
  }

  changeJobStatus(newJob, successMessage) {
    this.jobsService.saveJob(newJob).subscribe(
      data => {
        if (data.status === 200) {
          this.toastr.success(successMessage, 'Success');
          this.spinner.hide();
          this.closeModel();
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  openJobOffers(id) {
    this.globalService.setLoadingLabel('Open Job Processing... Please Wait.');
    this.spinner.show();
    const condition = {
      jobPostId: this.newJob._id
    };
    this.offerService.getAllOffers({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          const newJob = {
            _id: this.newJob._id,
            status: environment.JOB_STATUS.OPEN
          };
          const successMessage='Job is opened.';
          //this.removedChangeJobStatus();
          //---Removed to contract status 30 May
          this.changeJobStatus(newJob, successMessage);
          this.jobList = this.jobList.map((value, i) => {
            if (id == value._id) {
              value.status = environment.JOB_STATUS.OPEN;
              value.changedJobStatus = environment.JOB_STATUS.OPEN;
              return value;
            } else {
              return value;
            }
          });
        } else {
          this.spinner.hide();
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      });
  }

}



///   remaining sorting in get Jobs in temperory
