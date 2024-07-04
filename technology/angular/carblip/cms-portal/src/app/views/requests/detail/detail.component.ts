import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, skip, takeUntil, tap } from 'rxjs/operators';

import { QUOTE } from 'app/core/errors';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { collapseSection, expandSection, formatLogMessage, formatPhoneNumber, setNameAsNAForDeals } from 'app/shared/helpers/utils';
import { getBoolColor, getUserFullName } from 'app/shared/helpers/utils';
import * as commonModels from 'app/shared/models/common.model';
import { Log, LogResponse } from 'app/shared/models/log.model';
import { Quote } from 'app/shared/models/quote.model';
import { Request, UpdateRequest } from 'app/shared/models/request.model';
import { QuoteService } from 'app/shared/services/apis/quotes.service';
import { RequestService } from 'app/shared/services/apis/requests.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { AppState } from 'app/store/';
import { AddError } from 'app/store/error/error.actions';
import * as quoteActions from 'app/store/quotes/quotes.actions';
import * as actions from 'app/store/requests/requests.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/requests/requests.selectors';
import { initialState } from 'app/store/requests/requests.states';
import { NgxRolesService } from 'ngx-permissions';
import { Location } from '@angular/common';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { GlobalService } from 'app/shared/services/apis/global.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DealStageService } from 'app/shared/services/apis/dealstage.service';

@Component({
  selector: 'app-requests-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.style.scss'],
  animations: [
    fadeInUp400ms,
    fadeInRight400ms,
    stagger40ms
  ]
})
export class RequestsDetailComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public itemForm: FormGroup;
  private onDestroy$ = new Subject<void>();

  public requestId: string;
  public isReady: boolean;
  public request: Request;
  public logs: Array<Log>;

  public getBoolColor = getBoolColor;
  public formatLogMessage = formatLogMessage;

  columnHeaders: Array<{}> = [
    { key: 'stock_no', label: 'Stock #', visible: true },
    { key: 'first_name', label: 'First Name', visible: true },
    { key: 'last_name', label: 'Last Name', visible: true },
    { key: 'year', label: 'Year', visible: true },
    { key: 'make', label: 'Make', visible: true },
    { key: 'model', label: 'Model', visible: true },
    { key: 'drive_off', label: 'Drive Off', visible: true },
    { key: 'created_at', label: 'Created At', visible: true },
    { key: 'updated_at', label: 'Updated At', visible: true },
    { key: 'actions', label: 'Actions', visible: true },
  ]

  dataSource: any;

  public quotes: Array<Quote>;

  public quoteIds: number[] = [];
  public quoteLogs: any = [];
  public logMeta: any = [];
  selectedRecordDetail: any;
  index: number = 0;

  private readonly sectionName: string = 'filter_requests_quotes_page';
  isColumnAvailable: boolean = false;
  timeout: any;
  saving: boolean = false;

  public portalDealStagesOffset: number = 1;
  public totalPortalDealStagesPages: number = 0;
  public loadingPortalDealStages: boolean = false;
  public filteredPortalDealStages: Array<any> = [];
  public totalPortalDealStage = [];
  public portalDealStageList: any = [];

  public portalDealStageFilterCtrl: FormControl = new FormControl();

  public setNameAsNAForDeals = setNameAsNAForDeals;

  constructor(
    private store$: Store<AppState>,
    private route$: ActivatedRoute,
    private router$: Router,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private loader$: AppLoaderService,
    private confirmService$: AppConfirmService,
    private service$: RequestService,
    private quoteService$: QuoteService,
    private rolesService$: NgxRolesService,
    private location: Location,
    private globalService$: GlobalService,
    private snack$: MatSnackBar,
    private fb: FormBuilder,
    private dealStageService$: DealStageService,
  ) {
    // To fetch column filters values
    this.getFilteredColumns();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngAfterViewInit() {
    this.portalDealStageFilterCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        skip(1),
        takeUntil(this.onDestroy$))
      .subscribe(() => {
        // if (this.portalDealStageFilterCtrl.value != '') {
          this.portalDealStagesOffset = 1;
          this.totalPortalDealStage = [];
          this.filterportalDealStage();
        // }
      });
  }

  ngOnInit() {
    this.isReady = false;
    setTimeout(() => {
      this.loader$.open();
    }, 10);
    this.route$.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.requestId = params.get('id');
      this.initData();
    });

    this.dataSource = new MatTableDataSource();
  }

  initData() {
    combineLatest(
      this.service$.getById(this.requestId),
      this.service$.getLogsById(this.requestId)
    )
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(([result, logResonse]) => {
        this.loader$.close();
        if (result.data.length == 0) {
          this.snack$.open("This action is unauthorized", 'OK', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snack-warning'],
          });
          this.router$.navigateByUrl('/deals');
          return;
        }
        this.request = result.data;
        this.quotes = this.request ? this.request['quotes'] : [];
        if (this.quotes.length > 0) {
          this.quoteIds = this.quotes.map(quote => quote.id);
          this.getRequestDetailQuotesLogs(1, 20);
        }
        this.initTable();
        this.logs = logResonse.data;
        this.isReady = true;
        this.buildItemForm(this.request);
        this.filterportalDealStage();
        this.changeDetectorRefs.detectChanges();
      });
  }



  initTable() {
    this.dataSource.data = this.quotes;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  buildItemForm(item: Request) {
    const formFields = {
      deposit_status: [item.deposit_status || ''],
      credit_application_status: [item.credit_application_status || ''],
      insurance_status: [item.insurance_status || ''],
      send_tradein_form: [item.send_tradein_form || ''],
      tradein_acv: [item.tradein_acv || ''],
      portal_deal_stage: [Number(item.portal_deal_stage) || '']
    };
    this.itemForm = this.fb.group(formFields);
  }

  onAddQuote() {
    this.router$.navigate(['/quotes/' + this.requestId + '/add'], {});
  }

  onDelete(item: Quote, index: number) {
    this.confirmService$
      .confirm({
        message: `Are you sure you want to delete Quote?`,
      })
      .subscribe(res => {
        if (res) {
          this.loader$.open();
          this.quoteService$
            .delete(item.id.toString())
            .pipe(
              takeUntil(this.onDestroy$),
              map(result => result),
              catchError(err => {
                this.loader$.close();
                throw err;
              })
            )
            .subscribe(res1 => {
              this.loader$.close();
              this.store$.dispatch(new quoteActions.ClearDetail());
              if (res1) {
                this.quotes.splice(index, 1);
                this.initTable();
              }
            });
        }
      });
  }

  getRequestDetailQuotesLogs(page: number, per_page: number) {
    const payload = {
      page: page,
      per_page: per_page,
      targetIds: this.quoteIds
    }
    this.service$.getQuoteLogsByIds(payload).subscribe((res: any) => {
      if (res.error) {

      } else {
        this.quoteLogs = res.data;
        this.logMeta = res.meta;
        this.changeDetectorRefs.detectChanges();
        this.loader$.close();
      }
    })
  }

  onLogPaginateChange($event: any) {
    this.loader$.open();
    this.getRequestDetailQuotesLogs($event.pageIndex + 1, $event.pageSize);
  }

  getSelectedRecord(item: any, index: number) {
    this.selectedRecordDetail = item;
    this.index = index;
  }

  getDisplayedColumns(): string[] {
    if (this.isColumnAvailable) {
      return this.columnHeaders.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
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
    this.globalService$.getByIdAndName(this.sectionName).subscribe(res => {
      if (res.data.length > 0) {
        this.isColumnAvailable = true;
        if(this.columnHeaders.length == res.data[0].table_column.length) {
          this.columnHeaders = res.data[0].table_column;
        }
        this.changeDetectorRefs.detectChanges();
      } else {
        this.isColumnAvailable = true;
      }
    })
  }

  addOrUpdateColumnFilter() {
    const payload = {
      filter_section_name: this.sectionName,
      column: this.columnHeaders
    };
    this.globalService$.createAndUpdate(payload).pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe();
  }

  indirectDeleteDialogBox() {
    this.confirmService$
      .confirm({
        message: `Are you sure you want to delete this deal? This is permanent and cannot be undone.`,
      })
      .subscribe(res => {
        if (res) {
          const payload = {
            id: this.request.id,
          };
          this.store$.dispatch(new actions.Delete(payload));
          setTimeout(() => {
            this.router$.navigate(['/deals'])
          }, 1000)
        }
      });
  }

  submit() {
    if (this.itemForm.valid && !this.itemForm.pristine) {
      this.saving = true;
      const payload: UpdateRequest = {
        deposit_status: this.itemForm.value.deposit_status,
        credit_application_status: this.itemForm.value.credit_application_status,
        insurance_status: this.itemForm.value.insurance_status,
        send_tradein_form: this.itemForm.value.send_tradein_form,
        tradein_acv: this.itemForm.value.tradein_acv,
        portal_deal_stage:this.itemForm.value.portal_deal_stage
      };
      const dealid = this.request.id;
      this.service$
        .update(dealid, payload)
        .pipe(
          takeUntil(this.onDestroy$),
          map(result => result),
          catchError(err => {
            return of(err);
          })
        )
        .subscribe(res => {
          if (!res.error) {
            const { data } = res;
            this.store$.dispatch(new actions.UpdateSuccess(data));
            this.snack$.open('Deal Edited!', 'OK', {
              duration: 4000,
              verticalPosition: 'top',
              panelClass: ['snack-success'],
            });
            this.saving = false;
            this.initData();
          }
        });
    }
  }

  getNextBatchOfPortalDealStages() {
    this.loadingPortalDealStages = true;
    this.portalDealStagesOffset = this.portalDealStagesOffset + 1
    this.filterportalDealStage();
  }

  filterportalDealStage(newId = null) {
    this.portalDealStageList = [];
    let search = this.portalDealStageFilterCtrl.value || '';
    const portalDealStageId = this.itemForm?.value?.portal_deal_stage || null;
    const portalDealStageParam = {
      order_by: 'created_at',
      order_dir: 'desc',
      page: this.portalDealStagesOffset,
      per_page: 20,
      search,
    };

    this.dealStageService$.getDealStageList(portalDealStageParam, portalDealStageId).subscribe(({ data, meta }) => {
      this.totalPortalDealStage.push(...data);
      this.portalDealStageList = this.totalPortalDealStage;
      this.totalPortalDealStagesPages = meta.last_page;

      this.filteredPortalDealStages = this.portalDealStageList.slice(0);
      this.onPortalDealStageFilterChange(newId);
      this.loadingPortalDealStages = false;
    });
  }

  onPortalDealStageFilterChange(val) {
    if (val) {
      this.itemForm.patchValue({
        portalDealStage: val,
      });
    }
    this.changeDetectorRefs.detectChanges();
  }

  getHubspotDealStage(item){
    return `${item?.deal_stage} (${item?.hubspot_deal_stage_pipeline_name})`;

  }

  isCollapsedDealsSection: boolean = false;
  collapseDealsSection() {
    const dealsSection = document.getElementById('dealsSection');
    if (dealsSection && this.isCollapsedDealsSection) {
      collapseSection(dealsSection, 500);
    } else {
      expandSection(dealsSection, 500);
    }
  }

  isCollapsedDealsHistorySection: boolean = false;
  collapseDealsHistorySection() {
    const dealsHistorySection = document.getElementById('dealsHistorySection');
    if (dealsHistorySection && this.isCollapsedDealsHistorySection) {
      collapseSection(dealsHistorySection, 500);
    } else {
      expandSection(dealsHistorySection, 500);
    }
  }

  isCollapsedQuotesSection: boolean = false;
  collapseQuotesSection() {
    const quotesSection = document.getElementById('quotesSection');
    if (quotesSection && this.isCollapsedQuotesSection) {
      collapseSection(quotesSection, 500);
    } else {
      expandSection(quotesSection, 500);
    }
  }

  isCollapsedQuotesHistorySection: boolean = false;
  collapseQuotesHistorySection() {
    const quotesHistorySection = document.getElementById('quotesHistorySection');
    if (quotesHistorySection && this.isCollapsedQuotesHistorySection) {
      collapseSection(quotesHistorySection, 500);
    } else {
      expandSection(quotesHistorySection, 500);
    }
  }

  

}
