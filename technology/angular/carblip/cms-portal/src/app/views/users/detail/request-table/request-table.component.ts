import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';

import { DEAL } from 'app/core/errors';
import { Log } from 'app/shared/models/log.model';
import { Request } from 'app/shared/models/request.model';
import { User } from 'app/shared/models/user.model';
import { Profile } from 'app/shared/models/user.model';
import { RequestService } from 'app/shared/services/apis/requests.service';
import { VehicleService } from 'app/shared/services/apis/vehicle.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppState } from 'app/store/';
import { AddError } from 'app/store/error/error.actions';
import * as requestActions from 'app/store/requests/requests.actions';
import { dataSelector as profileDataSelector } from 'app/store/auth/authentication.selector';
import {
  didFetchSelector,
} from 'app/store/users/users.selectors';
import { initialState as initialReqState } from 'app/store/requests/requests.states';
import { NgxRolesService } from 'ngx-permissions';
import { UsersRequestModalComponent } from '../request-modal/request-modal.component';
import { WholesaleQuote } from 'app/shared/models/wholesale-quote.model';
import { TablePagination } from 'app/shared/models/common.model';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { SelectionModel } from '@angular/cdk/collections';
import { GlobalService } from 'app/shared/services/apis/global.service';
import { collapseSection, expandSection, setNameAsNAForDeals } from 'app/shared/helpers/utils';

@Component({
  selector: 'app-request-table',
  templateUrl: './request-table.component.html',
  animations: [fadeInUp400ms, stagger40ms],
})
export class RequestTableComponent implements OnInit, OnDestroy {
 
  @ViewChild('TableRequestPaginator') TableRequestPaginator: MatPaginator;
  @ViewChild('TableRequestSort') TableRequestSort: MatSort;
  @Input() userInfo: any;
  columnHeaders: Array<{}> = [
    { key: 'year', label: 'Year', visible: true},
    { key: 'brand', label: 'Brand', visible: true},
    { key: 'model', label: 'Model', visible: true},
    { key: 'contact_owner', label: 'Contact Owner', visible: true},
    { key: 'referral_code', label: 'Referral Code', visible: true},
    { key: 'source', label: 'Source', visible: true},
    { key: 'created_at', label: 'Created At', visible: true},
    { key: 'actions', label: 'Actions', visible: true},
  ]
  

  public dataSource: any;
  public dataRequestSource: TablePagination = {
    length: initialReqState.meta.total,
    pageIndex: initialReqState.filter.page,
    pageSize: initialReqState.filter.per_page,
    previousPageIndex: 0,
  };
  private onDestroy$ = new Subject<void>();

  public userId: string;
  public isReady: boolean = false;
  public user: User;
  public logs: Array<Log>;
  public requests: Array<Request>;
  public quotes: Array<Request>;
  public wholesaleQuotes: Array<WholesaleQuote> = [];
  public didFetch$: Observable<any>;
  offset = 1;
  public userProfile: Profile;
 
  public showDatalastPage: boolean = true;
  public RequestParam: any = {
		order_by: 'created_at',
		order_dir: 'desc',
		page: 1,
		per_page: 10,
	};
  selectedRecordDetail: any;
  index: number = 0;
  selection = new SelectionModel<any>(true, []);
  private readonly sectionName: string = 'filter_register_user_request_page';
  timeout: any;

  public setNameAsNAForDeals = setNameAsNAForDeals;

  constructor(
    private store$: Store<AppState>,
    private route$: ActivatedRoute,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private loader$: AppLoaderService,
    private confirmService$: AppConfirmService,
    private vehicleService$: VehicleService,
    private rolesService$: NgxRolesService,
    private requestService$: RequestService,
    private router$: Router,
    private globalService$: GlobalService
  ) {
    // To fetch column filters values
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
    this.dataSource = new MatTableDataSource();
    // console.log('userInfo',this.userInfo)
  }


  onRequestPaginateChange(event) {
    this.showDatalastPage = !this.TableRequestPaginator.hasNextPage();
		this.RequestParam.page = event.pageIndex + 1;
		this.RequestParam.per_page = event.pageSize;
		/* if not use then comment this line */
		this.logRequestData(this.RequestParam);
		/* if not use then comment this line */
	} 
  // alluser_requests
  logRequestData(event) {
    setTimeout(() => {
      this.loader$.open();
    }, 10);

    combineLatest(
      this.vehicleService$.getListByUserid(this.userId,event)
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
      this.requests = logResonse ? logResonse.data : [];
      
      this.initRequestMeta(logResonse.meta);
      this.changeDetectorRefs.detectChanges();
    });
  }

  initData() {
    combineLatest(
      this.vehicleService$.getListByUserid(this.userId,this.RequestParam),
    )
      .pipe(
        takeUntil(this.onDestroy$),
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(([requestResponse]) => {
        this.requests = requestResponse ? requestResponse.data : [];

        this.initRequestMeta(requestResponse.meta);
        this.changeDetectorRefs.detectChanges();
      });
  }
  
  initRequestMeta(meta) {
    this.dataRequestSource.length = meta.total;
    this.dataRequestSource.pageIndex = meta.current_page - 1;
    this.dataRequestSource.pageSize = meta.per_page;
    
    

    this.dataSource.data = this.requests;
    this.dataSource.length = meta.total;
    this.dataSource.pageIndex = meta.current_page - 1;
    this.dataSource.pageSize = meta.per_page;
  }
  sortData(event) {
    let orderby = event.active ? event.active : this.RequestParam.order_by;
    if(event.active){
      if(event.active == 'source'){
        orderby = 'source_utm';
      }
    }
    this.RequestParam.order_by = orderby;
		this.RequestParam.order_dir = event.direction ? event.direction : this.RequestParam.order_dir,
		/* if not use then comment this line */
		this.logRequestData(this.RequestParam);
  }
  initTable() {
    this.dataSource.paginator = this.TableRequestPaginator;
    this.dataSource.sort = this.TableRequestSort;
  }

  showDeleteButton(item: Request) {
    const roles = this.rolesService$.getRoles();
    if (roles['admin'] || roles['superadmin']) {
      return true;
    } else {
      return false;
    }
  }

  onDelete(item: Request, index: number) {
    this.confirmService$
      .confirm({
        message: `Are you sure you want to delete deal?`,
      })
      .subscribe(res => {
        if (res) {
          this.loader$.open();
          this.requestService$
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
              this.store$.dispatch(new requestActions.ClearDetail());
              if (res1.error) {
                this.store$.dispatch(
                  new AddError({
                    type: DEAL.TYPE,
                    message: DEAL.DELETE_ERROR,
                  })
                );
              } else {
                this.requests.splice(index, 1);
                this.initTable();
              }
            });
        }
      });
  }

  onAddRequest() {
    const title = 'Add New Deal';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      UsersRequestModalComponent,
      {
        width: '720px',
        disableClose: true,
        data: {
          title: title,
          payload: {
            userId: this.userId,
            type:this.userInfo.type
          },
          type: 'add',
        },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        return;
      }
      this.store$.dispatch(new requestActions.ClearDetail());
      this.initData();
    });
  }

  indirectShowDeleteButton() {
    const roles = this.rolesService$.getRoles();
    if (roles['admin'] || roles['superadmin']) {
      return true;
    } else {
      return false;
    }
  }

  indirectShowEditButton() {
    const roles = this.rolesService$.getRoles();
    if (!roles['salesperson'] || !roles['concierge'] || this.user.contact_owner_email == this.userProfile.email) {
      return true;
    }
    else {
      return false;
    }
  }

     /** Whether the number of selected elements matches the total number of rows. */
     isAllSelected() {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.length;
      return numSelected === numRows;
    }
  
    masterToggle() {
      this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.filteredData.forEach(row => this.selection.select(row));
    }
  
    getSelectedRecord(item: any, index: number) {
      this.selectedRecordDetail = item;
      this.index = index;
    }

    getDisplayedColumns(): string[] {
      if(this.isReady) {
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
      this.globalService$.getByIdAndName(this.sectionName).subscribe(res=> {
        if(res.data.length > 0) {
          this.isReady = true;
          this.columnHeaders = res.data[0].table_column;
          this.changeDetectorRefs.detectChanges();
        } else {
          this.isReady = true;
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

    isCollapsedDealsSection: boolean = false;
    collapseDealsSection() {
      const dealsSection = document.getElementById('dealsSection');
      if (dealsSection && this.isCollapsedDealsSection) {
        collapseSection(dealsSection, 500);
      } else {
        expandSection(dealsSection, 500);
      }
    }
}

