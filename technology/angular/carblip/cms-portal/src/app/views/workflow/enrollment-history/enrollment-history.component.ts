import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { Observable, Subject, debounceTime, takeUntil, tap } from 'rxjs';
import * as commonModels from 'app/shared/models/common.model';
import { initialState } from 'app/store/enrollment-history/enrollment-history.states';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/enrollment-history/enrollment-history.selectors';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'underscore';
import * as deepEqual from 'deep-equal';
import * as enrollmentHistoryActions from 'app/store/enrollment-history/enrollment-history.actions';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { ENROLLMENTACTIONSTATUS, EVENTMASTERID } from 'app/shared/enums/enums';
import * as moment from 'moment';
import { textTruncate } from 'app/shared/helpers/utils';

@Component({
  selector: 'app-enrollment-history',
  templateUrl: './enrollment-history.component.html',
  styleUrls: ['./enrollment-history.component.scss'],
  animations: [fadeInUp400ms, stagger40ms]
})
export class EnrollmentHistoryComponent implements OnInit {
  
  @Input() columnHeaders: Array<any>;
  private onDestroy$ = new Subject<void>();
  public enrollmentHistory$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;

  public sortKey: string;
  public sortDirection: string;
  selectedRecordDetail: any;
  public enrollmentHistory: Array<any> = [];
  public meta: commonModels.Meta;
  public offset: number;
  public ENROLLMENTACTIONSTATUS = ENROLLMENTACTIONSTATUS;
  constructor(
    private store$: Store<AppState>,
    private changeDetectorRefs: ChangeDetectorRef,
  ) {

    this.enrollmentHistory$ = this.store$.select(dataSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.offset = 1;
  }

  ngOnInit() {
    this.store$.dispatch(new enrollmentHistoryActions.ClearDetail());
    this.enrollmentHistory$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(enrollmentHistory => {
          if (!deepEqual(this.enrollmentHistory, enrollmentHistory)) {
            this.enrollmentHistory = enrollmentHistory;
            this.refreshTable();
          }
        })
      )
      .subscribe();

    this.meta$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(meta => {
          this.meta = meta;
          this.offset = meta.from;
          this.refreshTable();
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.store$.dispatch(new enrollmentHistoryActions.ClearDetail());
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  getDisplayedColumns(): string[] {
    return this.columnHeaders.map((cd: any) => cd.key);
  }

  formatText(item, type?){
    if(type){
      return EVENTMASTERID[item.event_master_id];
    }
    return item.first_name + ' ' + item.last_name + ' ( ' + item.email_address + ' ) ';
  }

  formatDeal(item){
    return item.deal?.brand?.name + ' ' + item?.deal?.model?.name + ' ' + item?.deal?.trim;
  }

  textTruncate(text: string) {
    return textTruncate(text, 60);
  }
}
