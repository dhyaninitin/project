import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';
import * as commonModels from 'app/shared/models/common.model';
import { Quote } from 'app/shared/models/quote.model';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/quotes/quotes.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/quotes/quotes.selectors';
import { initialState } from 'app/store/quotes/quotes.states';
import { NgxRolesService } from 'ngx-permissions';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { FilterService } from 'app/shared/services/filter.service';
@Component({
  selector: 'app-quotes-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.style.scss'],
  animations: [fadeInUp400ms, stagger40ms],
})
export class QuotesTableComponent implements OnInit, OnDestroy {
  @Input() columnHeaders: Array<{}>;

  private onDestroy$ = new Subject<void>();

  public quotes$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;

  public quotes: Array<Quote> = [];
  public meta: commonModels.Meta;
  public offset: number;

  public sortKey:string;
  public sortDirection:string;
  selectedRecordDetail: any;
  constructor(
    private store$: Store<AppState>,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private confirmService$: AppConfirmService,
    private rolesService$: NgxRolesService,
    private loader$: AppLoaderService,
    private filterService:FilterService
  ) {
    this.quotes$ = this.store$.select(dataSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.offset = 1;
    const filter = this.filterService.getSortingDirection('quotes_common_filter')
    this.sortKey = filter?.order_by;
    this.sortDirection = filter?.order_dir;
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.quotes$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(quotes => {
          if (!deepEqual(this.quotes, quotes)) {
            this.quotes = quotes;
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

    this.didFetch$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(didFetch => !didFetch && this.loadData())
      )
      .subscribe();
  }

  loadData() {
    this.store$.dispatch(new actions.GetList());
  }

  sortData(event) {

    const updated_filter = {
      order_by: event.active ? event.active : initialState.filter.order_by,
      order_dir: event.direction
        ? event.direction
        : initialState.filter.order_dir,
    };
    this.filterService.setCommonFilter('quotes_common_filter',updated_filter)
    this.store$.dispatch(new actions.UpdateFilter(updated_filter));
  }

  // onEdit(item: Quote) {
  //   this.loader$.open();
  //   combineLatest(this.quoteService$.getById(item.id.toString()))
  //     .pipe(
  //       takeUntil(this.onDestroy$),
  //       map(result => result),
  //       catchError(err => {
  //         return of(err);
  //       })
  //     )
  //     .subscribe(([result]) => {
  //       this.loader$.close();
  //       const quoteItem = result.data;
  //       const title = 'Edit Quote';
  //       const dialogRef: MatDialogRef<any> = this.dialog.open(
  //         QuoteEditModalComponent,
  //         {
  //           width: '1024px',
  //           disableClose: false,
  //           data: { title: title, payload: quoteItem, type: 'edit' },
  //         }
  //       );
  //       dialogRef.afterClosed().subscribe(res => {
  //         if (!res) {
  //           // If user press cancel
  //           return;
  //         }

  //         this.store$.dispatch(new actions.ClearDetail());
  //       });
  //     });
  // }

  onDelete(item: Quote) {
    this.confirmService$
      .confirm({
        message: `Are you sure you want to delete Quote?`,
      })
      .subscribe(res => {
        if (res) {
          const payload = {
            id: item.id.toString(),
          };
          this.store$.dispatch(new actions.Delete(payload));
        }
      });
  }

  getSelectedRecord(item: any) {
    this.selectedRecordDetail = item;
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  getDisplayedColumns(): string[] {
    return this.columnHeaders.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }
}
