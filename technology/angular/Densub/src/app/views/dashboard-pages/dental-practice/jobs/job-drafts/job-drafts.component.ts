import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
//import { JobsService } from './job-drafts.service';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { JobNewPost } from '../../../../../shared-ui/modal/job.modal';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AddEditPostComponent } from '../../../../../shared-ui/add-edit-post/add-edit-post.component';
import { environment } from '../../../../../../environments/environment';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { JobsService } from '../../../../dashboard-pages/dental-practice/jobs/job-posts/jobs.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-job-drafts',
  templateUrl: './job-drafts.component.html',
  styleUrls: ['./job-drafts.component.scss']
})
export class JobDraftsComponent implements OnInit {
  jobList: any = [];
  order = 'createdAt';
  reverse = false;
  itemsPerPage = 10;
  closeResult: String;
  newJob: JobNewPost = new JobNewPost();
  jobLabel: any = environment.JOB_LABEL;
  @ViewChild('deleteJobModal', { static: false })
  public deleteJobModal: ModalDirective;
  constructor(
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private jobsService: JobsService,
    private ngBoostrapModalService: NgbModal,
    private readonly activeModal: NgbActiveModal,
    private jwtService: JwtService,
    private router : Router
  ) {
    this.globalService.topscroll();
    this.setOrder('createdAt');
  }

  ngOnInit() {
    this.getJobs();
  }
  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  getJobs() {
    this.spinner.show();
    let condition = {};
    condition = {
      draft: true,
      createdBy : this.jwtService.currentLoggedUserInfo._id,
    };
    this.jobsService.getJobs({ condition: condition }).subscribe(
      data => {
         console.log('I am ==========', data.data);
        if (data.status === 200) {
          this.jobList = data.data;
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


  showNewJobModal(job?: any) {
    if (job) {
      /* if (!job.locationLatLng) {
        job.locationLatLng = new JobNewPost().locationLatLng;
      } */ 
      job.practiceName = job.practiceName._id;
      this.newJob = job;
    } else  {
      this.newJob = new JobNewPost();
    }
    const modalRef = this.ngBoostrapModalService.open(
      AddEditPostComponent,
      {centered: true, backdrop: true, keyboard: true},
    );
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.getJobs();
    });
    setTimeout(() => {
      modalRef.componentInstance.setData(JSON.stringify(this.newJob), '/practice/job-drafts');
    }, 200);
  }

  showDeletejobModal(job: any) {
    this.newJob = job;
    this.deleteJobModal.show();
  }

  deleteJobs() {
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
          this.toastr.success('Draft has been deleted.', 'Success');
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
  }

  closeModel() {
    this.deleteJobModal.hide();
  }

  openJobList(){
    this.jobsService.showLeftMenuForJobs = false;
    this.jobsService.fetchRoute = this.router.url;
  }

}
