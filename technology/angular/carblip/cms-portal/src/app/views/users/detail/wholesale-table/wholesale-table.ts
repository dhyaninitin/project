import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { WHOLESALEQUOTE } from 'app/core/errors';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { collapseSection, expandSection, getBoolColor } from 'app/shared/helpers/utils';
import { Request } from 'app/shared/models/request.model';
import { User } from 'app/shared/models/user.model';
import { Profile } from 'app/shared/models/user.model';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppState } from 'app/store/';
import { AddError } from 'app/store/error/error.actions';
import { dataSelector as profileDataSelector } from 'app/store/auth/authentication.selector';
import {
  didFetchSelector,
} from 'app/store/users/users.selectors';
import { initialState as initialLogState } from 'app/store/users/users.states';
import { initialState as initialReqState } from 'app/store/requests/requests.states';
import { NgxRolesService } from 'ngx-permissions';
import { WholesaleQuote } from 'app/shared/models/wholesale-quote.model';
import { WholesaleQuoteService } from 'app/shared/services/apis/wholesale-quote.service';
import * as wholesaleactions from 'app/store/wholesale-quote/wholesale-quote.actions';
import { TablePagination } from 'app/shared/models/common.model';
import { SelectionModel } from '@angular/cdk/collections';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { GlobalService } from 'app/shared/services/apis/global.service';

@Component({
  selector: 'app-wholesale-table',
  templateUrl: './wholesale-table.component.html',
  animations: [fadeInUp400ms, stagger40ms],
})
export class WholesaleTableComponent implements OnInit, OnDestroy {
  @ViewChild('TableWholesalePaginator') TableWholesalePaginator: MatPaginator;
  @ViewChild('TableWholesaleSort') TableWholesaleSort: MatSort;

  columnHeadersWholesale: Array<{}> = [
    { key: 'id', label: 'Id', visible: true},
    { key: 'wholesale_stock_no', label: 'Wholesale Stock No.', visible: true},
    { key: 'year', label: 'Year', visible: true},
    { key: 'make', label: 'Make', visible: true},
    { key: 'model', label: 'Model', visible: true},
    { key: 'created_at', label: 'Created At', visible: true},
    { key: 'updated_at', label: 'Updated At', visible: true},
    { key: 'actions', label: 'Actions', visible: true}
  ]

  public dataSource: any;
  public dataRequestSource: TablePagination = {
    length: initialReqState.meta.total,
    pageIndex: initialReqState.filter.page,
    pageSize: initialReqState.filter.per_page,
    previousPageIndex: 0,
  };
  public dataSourceWholesale: any;
  private onDestroy$ = new Subject<void>();

  public getBoolColor = getBoolColor;

  public userId: string;
  public isReady: boolean = false;
  public user: User;
  public quotes: Array<Request>;
  public wholesaleQuotes: Array<WholesaleQuote> = [];
  public didFetch$: Observable<any>;
  offset = 1;
  public userProfile: Profile;
  public quotePagination: TablePagination = {
    length: initialLogState.meta.total,
    pageIndex: initialLogState.filter.page,
    pageSize: initialLogState.filter.per_page,
    previousPageIndex: 0,
  };
  public showDatalastPage: boolean = true;
  public QupteParam: any = {
		order_by: 'created_at',
		order_dir: 'desc',
		page: 1,
		per_page: 10,
	};

  selectedRecordDetail: any;
  index: number = 0;
  selection = new SelectionModel<any>(true, []);
  private readonly sectionName: string = 'filter_register_user_wholesale_quote_page';
  timeout: any;

  constructor(
    private store$: Store<AppState>,
    private route$: ActivatedRoute,
    private changeDetectorRefs: ChangeDetectorRef,
    private loader$: AppLoaderService,
    private confirmService$: AppConfirmService,
    private rolesService$: NgxRolesService,
    private wholesaleService$: WholesaleQuoteService,
    private router$: Router,
    private globalService$: GlobalService
  ) {
    this.getFilteredColumns();
    this.didFetch$ = this.store$.select(didFetchSelector);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.route$.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.userId = params.get('id');
      this.initData();
    });

    this.store$
      .select(profileDataSelector)
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap((profile: Profile) => {
          this.userProfile = profile;
        })
      )
      .subscribe();
    this.loader$.close();
    this.dataSourceWholesale = new MatTableDataSource();
  }
  
  onWholesalePaginateChange(event) {
    this.showDatalastPage = !this.TableWholesalePaginator.hasNextPage();
		this.QupteParam.page = event.pageIndex + 1;
		this.QupteParam.per_page = event.pageSize;
		/* if not use then comment this line */
		this.logsWholesaleQuotesData(this.QupteParam);
		/* if not use then comment this line */
	} 
  sortData(event) {
    let orderby = event.active ? event.active : this.QupteParam.order_by;
    if(event.active){
      if(event.active == 'source'){
        orderby = 'source_utm';
      }
    }
    this.QupteParam.order_by = orderby;
		this.QupteParam.order_dir = event.direction ? event.direction : this.QupteParam.order_dir,
		/* if not use then comment this line */
		this.logsWholesaleQuotesData(this.QupteParam);
  }
  // alluser_wholesale
  logsWholesaleQuotesData(event) {
    setTimeout(() => {
      this.loader$.open();
    }, 10);

    combineLatest(
      this.wholesaleService$.getListByUserid(this.userId,event)
    )
    .pipe(
      takeUntil(this.onDestroy$),
      map(result => result),
      catchError(err => {
        return of(err);
      })
    )
    .subscribe(([logResonse]) => {
      setTimeout(() => {
        this.loader$.close();
      }, 15);
      this.quotes = logResonse ? logResonse.data : [];
      
      this.initQuotesMeta(logResonse.meta);
      this.changeDetectorRefs.detectChanges();
    });
  }
  initQuotesMeta(meta) {
    this.quotePagination.length = meta.total;
    this.quotePagination.pageIndex = meta.current_page - 1;
    this.quotePagination.pageSize = meta.per_page;

    this.dataSourceWholesale.data = this.quotes;
    this.dataSourceWholesale.length = meta.total;
    this.dataSourceWholesale.pageIndex = meta.current_page - 1;
    this.dataSourceWholesale.pageSize = meta.per_page;
  }

  initData() {
    
    combineLatest(
      this.wholesaleService$.getListByUserid(this.userId,this.QupteParam)
    )
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(([quotesResponse]) => {
        this.wholesaleQuotes = quotesResponse ? quotesResponse.data : [];
        this.quotes = quotesResponse ? quotesResponse.data : [];
        this.initQuotesMeta(quotesResponse.meta);
        this.changeDetectorRefs.detectChanges();
      });
  }

  initTable() {
    this.dataSourceWholesale.data = this.wholesaleQuotes;
  }

  showDeleteButton(item: Request) {
    const roles = this.rolesService$.getRoles();
    if (roles['admin'] || roles['superadmin']) {
      return true;
    } else {
      return false;
    }
  }

  onWholesaleQuoteDelete(item: any, index: number) {
    this.confirmService$
      .confirm({
        message: `Are you sure you want to delete deal?`,
      })
      .subscribe(res => {
        if (res) {
          // this.loader$.open();
          this.wholesaleService$
            .delete(item.id)
            .pipe(
              takeUntil(this.onDestroy$),
              map(result => result),
              catchError(err => {
                return of(err);
              })
            )
            .subscribe(res1 => {
              this.loader$.close();
              this.store$.dispatch(new wholesaleactions.ClearDetail());
              if (res1.error) {
                this.store$.dispatch(
                  new AddError({
                    type: WHOLESALEQUOTE.TYPE,
                    message: WHOLESALEQUOTE.DELETE_ERROR,
                  })
                );
              } else {
                // this.wholesaleQuotes.splice(index, 1);
                this.initData();
              }
            });
        }
      });
  }

  onAddWholesaleQuote() {
    this.router$.navigate(['/wholesalequote/' + this.userId + '/add'], {});
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSourceWholesale.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSourceWholesale.filteredData.forEach(row => this.selection.select(row));
  }

  getSelectedRecord(item: any, index: number) {
    this.selectedRecordDetail = item;
    this.index = index;
  }

  getDisplayedColumns(): string[] {
    if(this.isReady) {
      return this.columnHeadersWholesale.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
    }
  }

  toggleColumnVisibility(column, event) {
    column.visible = !column.visible;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.addOrUpdateColumnFilter();
    }, 1000);
  }

  getFilteredColumns() {
    this.globalService$.getByIdAndName(this.sectionName).subscribe(res=> {
      if(res.data.length > 0) {
        this.isReady = true;
        this.columnHeadersWholesale = res.data[0].table_column;
        this.changeDetectorRefs.detectChanges();
      } else {
        this.isReady = true;
      }
    })
  }

  addOrUpdateColumnFilter() {
    const payload = {
      filter_section_name: this.sectionName,
      column: this.columnHeadersWholesale
    };
    this.globalService$.createAndUpdate(payload).pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe();
  }


  isCollapsedWholesaleQuotesSection: boolean = false;
  collapseWholesaleQuotesSection() {
    const wholesaleQuotesSection = document.getElementById('wholesaleQuotesSection');
    if (wholesaleQuotesSection && this.isCollapsedWholesaleQuotesSection) {
      collapseSection(wholesaleQuotesSection, 500);
    } else {
      expandSection(wholesaleQuotesSection, 500);
    }
  }
}

