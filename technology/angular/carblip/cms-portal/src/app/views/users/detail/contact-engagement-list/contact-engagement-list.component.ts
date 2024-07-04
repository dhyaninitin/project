import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { Subject, debounceTime } from 'rxjs';
import { textTruncate } from 'app/shared/helpers/utils';

@Component({
  selector: 'app-contact-engagement-list',
  templateUrl: './contact-engagement-list.component.html',
  styleUrls: ['./contact-engagement-list.component.scss']
})
export class ContactEngagementListComponent implements OnInit {
  @Input() userId: number;
  @Input() contactsEngagementCount: number;

  displayedColumns: string[] = ['id', 'name'];

  dataSource: { id: number, name: string };
  public search: string = '';
  page: number = 1;
  per_page: number = 15;
  workflowList: { id: number, name: string }[] = [];
  loading: boolean = false;
  totalWorkflows: number = 0;
  isMenuOpen: boolean = true;
  constructor(
    private workflowService: WorkflowService,
    private _cdr: ChangeDetectorRef
  ) { }

  private debounceSubject = new Subject<void>();
  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 1) {
      this.debounceSubject.next();
    }
  }

  ngOnDestroy(): void {
    this.loading = false;
  }

  ngOnInit(): void {
    this.debounceSubject.pipe(debounceTime(300)).subscribe(() => {
      if (this.workflowList.length != this.totalWorkflows && this.isMenuOpen) {
        this.page += 1;
        this.getWorkflowList(this.userId);
      }
    });
  }

  getWorkflowList(userId: any): void {
    this.loading = true;
    let paramObj: any = {
      page: this.page.toString(),
      per_page: this.per_page.toString(),
      search: this.search
    };
    this.workflowService.getContactEngagedWorkflowList(paramObj, userId).subscribe(res => {
      if (res && res?.data.length) {
        this.totalWorkflows = res.meta.total;
        this.workflowList = [...this.workflowList, ...res.data];
        this.loading = false;
        this._cdr.detectChanges();
      }
    })
  }
  
  onMenuClosed() {
    this.isMenuOpen = false;
    this.loading = false;
    this.workflowList = [];
    this.page = 1;
  }

  onMenuOpen() {
    this.isMenuOpen = true;
  }

  textTruncate(text: string) {
    return textTruncate(text, 40);
  }

}
