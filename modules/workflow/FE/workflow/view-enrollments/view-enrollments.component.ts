import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { Subscription, debounceTime, distinctUntilChanged, filter, fromEvent, map } from 'rxjs';
import * as _ from 'underscore';

@Component({
  selector: 'app-view-enrollments',
  templateUrl: './view-enrollments.component.html',
  styleUrls: ['./view-enrollments.component.scss']
})

export class ViewEnrollmentsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() actionId: any;
  @ViewChild('searchInput') searchInput: ElementRef;

  displayedColumns: string[] = ['id', 'first_name', 'last_name', 'email_address'];
  dataSource: any;
  public search: string = '';
  page: number = 1;
  per_page: number = 15;
  enrollment: { action_uuid: string; event_master_id: number; is_open: boolean; total_enrollment: number; };
  private enrollmentsCountSubscription: Subscription;
  workflowId: number;
  contacts: { id: number, first_name: string, last_name: string, email_address: string }[] = [];
  loading: boolean = false;
  totalContacts: number = 0;
  isMenuOpen: boolean = true;
  isResponse: boolean = false;

  constructor(
    private workflowService: WorkflowService,
    private route: ActivatedRoute,
    private router: Router,
    private _cdr: ChangeDetectorRef
  ) { }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 1) {
      if (this.contacts.length != this.totalContacts && this.isMenuOpen) {
        this.page += 1;
        this.getContacts(this.enrollment?.action_uuid);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.enrollmentsCountSubscription) {
      this.enrollmentsCountSubscription.unsubscribe();
    }
    this.loading = false;
  }

  ngOnInit(): void {
    this.enrollmentsCountSubscription = this.workflowService.enrollmentsCount.subscribe(res => {
      if (res && res?.length) {
        this.enrollment = res.find(el => el.action_uuid === this.actionId);
        this._cdr.detectChanges();
      }
    });

    this.route.params.subscribe(val => {
      this.workflowId = val.id;
    })
  }

  ngAfterViewInit(): void {
    // this.initData();
  }

  initData() {

    fromEvent(this.searchInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => {
          return event.target.value;
        }),
        filter(res => res.length > 2 || !res.length),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((res) => {
        this.onSearchChange();
      });

  }

  onClearSearch($event: any) {
    if ($event == "") {
      this.onSearchChange();
    }
  }

  onSearchChange() {
    let data = {
      search: this.search,
    };
    if (this.search) {
      data = _.extend(data, {
        page: 1,
        per_page: 15
      });
    }
    this.updateSearched(data);
  }

  updateSearched(data: any) { }

  getContacts(actionId: string): void {
    this.loading = true;
    this.isResponse = false;
    let paramObj: any = {
      page: this.page.toString(),
      per_page: this.per_page.toString(),
      search: this.search,
      action_id: actionId
    };
    this.workflowService.getEnrolledContacts(paramObj, this.workflowId).subscribe(res => {
      if (res && res?.data.length) {
        this.totalContacts = res.meta.total;
        this.contacts = [...this.contacts, ...res.data];
        this.loading = false;
      } else {
        this.loading = false;
      }
      this.isResponse = true;
      this._cdr.detectChanges();
    })
  }

  onMenuClosed() {
    this.isMenuOpen = false;
    if (this.enrollmentsCountSubscription) {
      this.enrollmentsCountSubscription.unsubscribe();
    }
    this.loading = false;
    this.contacts = [];
    this.page = 1;
  }

  onMenuOpen() {
    this.isMenuOpen = true;
  }
}
