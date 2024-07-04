import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import { ROLE_LIST } from 'app/core/constants';
import { PortalUser, UpdatePortalUser } from 'app/shared/models/portaluser.model';
import * as commonModels from 'app/shared/models/common.model';
import { Profile, User } from 'app/shared/models/user.model';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppState } from 'app/store/';
import { dataSelector as profileDataSelector } from 'app/store/auth/authentication.selector';
import * as actions from 'app/store/portalusers/portalusers.actions';
import {
  dataSelector,
  didFetchSelector,
  metaSelector,
} from 'app/store/portalusers/portalusers.selectors';
import { initialState } from 'app/store/portalusers/portalusers.states';
import { PortalUsersEditModalComponent } from './edit-modal/edit-modal.component';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FilterService } from 'app/shared/services/filter.service';

@Component({
  selector: 'app-portalusers-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.style.scss'],
  animations: [fadeInUp400ms, stagger40ms],
})
export class PortalUsersTableComponent implements OnInit, OnDestroy {

  @Input() columnHeaders: Array<{}>;

  private onDestroy$ = new Subject<void>();

  public portalusers$: Observable<any>;
  public meta$: Observable<any>;
  public didFetch$: Observable<any>;

  public portalusers: Array<PortalUser> = [];
  public meta: commonModels.Meta;
  public offset: number;
  public userProfile: Profile;
  public edit_delete_permission: boolean;
  public sortKey:string;
  public sortDirection:string;
  selectedRecordDetail: any;
  constructor(
    private store$: Store<AppState>,
    private changeDetectorRefs: ChangeDetectorRef,
    private dialog: MatDialog,
    private confirmService$: AppConfirmService,
    private service$: PortalUserService,
    private router$: Router,
    private snackBar$: MatSnackBar,
    private filterService:FilterService
  ) {
    this.portalusers$ = this.store$.select(dataSelector);
    this.meta$ = this.store$.select(metaSelector);
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.offset = 0;
    const filter = this.filterService.getSortingDirection('portalusers_common_filter')
    this.sortKey = filter?.order_by;
    this.sortDirection = filter?.order_dir;
  }
  
  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.store$
      .select(profileDataSelector)
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap((profile: Profile) => {
          this.userProfile = profile;
          this.setPermission(this.userProfile.roles[0]);
        })
      )
      .subscribe();

    this.portalusers$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(users => {
          if (!deepEqual(this.portalusers, users)) {
            this.portalusers = users;
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

  /** Handler when Edit icon in table row is clicked
   ** This function get portal user item as parameter, show modal to edit content,
   ** buid logic after modal is closed.
   * @param PortalUser item
   * @return
   **/

  sortData(event) {
    //set arrow direction in local storage

    const updated_filter = {
      order_by: event.active ? event.active : initialState.filter.order_by,
      order_dir: event.direction
        ? event.direction
        : initialState.filter.order_dir,
    };
    this.filterService.setCommonFilter('portalusers_common_filter',updated_filter)
    this.store$.dispatch(new actions.UpdateFilter(updated_filter));
  }

  /** Get Role Friendly Name from Role List
   * @param string name
   * @return string roleName
   **/

  getRoleName(name: string) {
    const obj = ROLE_LIST.find(item => item.name === name);
    return obj.label;
  }

  /** Handler when Edit icon in table row is clicked
   ** This function get portal user item as parameter, show modal to edit content,
   ** buid logic after modal is closed.
   * @param PortalUser item
   * @return
   **/

  onEdit(item: PortalUser) {
    const title = 'Edit CarBlip Team Member';
    const dialogRef: MatDialogRef<any> = this.dialog.open(
      PortalUsersEditModalComponent,
      {
        width: '720px',
        disableClose: false,
        data: { title: title, payload: item, type: 'edit' },
      }
    );
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        // If user press cancel
        this.service$.isRoundRobinAllow = false;
        return;
      }
      this.service$.isRoundRobinAllow = false;
      this.store$.dispatch(new actions.UpdateSuccess(res));
    });
  }

  /** Handler when Delete icon in table row is clicked
   ** This function gets portal user item as parameter, calll delete action with select row id.
   * @param PortalUser item
   * @return
   **/

  onDelete(item: PortalUser) {
    this.confirmService$
      .confirm({
        message: `Are you sure you want to delete the user '${item.first_name
          }'?`,
      })
      .subscribe(res => {
        if (res) {
          const payload = {
            id: item.id,
          };
          this.store$.dispatch(new actions.Delete(payload));
        }
      });
  }

  /** Check if action buttons need to be shown
   * @param PortalUser item
   * @return
   **/

  showAction(item: PortalUser) {
    if(item) {
      if (this.userProfile && item.roles) {
        const userRole = this.userProfile.roles[0].id;
        const itemRole = item.roles[0].id;
        return itemRole >= userRole;
      } else {
        return false;
      }
    }
  }

  showRRCheckbox(item) {
    return (
      item && item.roles && (item.roles[0].id === 4 || item.roles[0].id === 5)
    );
  }

  showToggle(item) {
    return (
      item && item.roles && item.roles[0].id != 1
    );
  }

  onRRApply(item) {
    let alertMsg = 'Are you sure you want to add this user to RoundRobin rule?';
    if (item.roundrobin) {
      alertMsg =
        'Are you sure you want to remove this user to RoundRobin rule?';
    }
    this.confirmService$
      .confirm({
        message: alertMsg,
      })
      .subscribe(res => {
        if (res) { 
          if(!item.roundrobin) {
            this.service$.isRoundRobinAllow = true; 
            // this.onEdit(item);
            this.router$.navigateByUrl('/users/'+item.id)
          } else {
            this.service$.isRoundRobinAllow = false;
            const payload = {
              id: item.id,
              status: !item.roundrobin,
            };
            this.store$.dispatch(new actions.UpdateRR(payload));
          }
        }
      });
    return false;
  }

  toggleIsUserActive(e, item: PortalUser) {
    const is_active = item.is_active
    if (is_active) {
      e.source.checked = true;
      this.confirmService$
        .confirm({
          message: `Are you sure you want to deactivate the user '${item.first_name
            }'?`,
        })
        .subscribe(res => {
          if (res) {
            this.toggleUser(item);
          }
        });
    } else {
      e.source.checked = false;
      this.toggleUser(item);
    }
  }

  toggleUser(item: PortalUser) {
    const is_active = !item.is_active
    const payload = {
      id: item.id,
      data: {
        is_active: is_active,
      },
    };

    this.store$.dispatch(new actions.Toggle(payload));
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  setPermission(role) {
    const { id } = role || { id: null }
    if (id == 1 || id == 2 || id == 4) {
      this.edit_delete_permission = true;
    }
    else {
      this.edit_delete_permission = false;
    }
  }

  getSelectedRecord(item: any) {
    this.selectedRecordDetail = item;
  }

  getDisplayedColumns(): string[] {
    return this.columnHeaders.filter((cd: any) => cd.visible).map((cd: any) => cd.key);
  }
  
  openDetailsPage(item: PortalUser) {
    if(this.showAction(item)) {
      this.router$.navigateByUrl('/users/'+item.id)
    } else {
      this.snackBar$.open("You don't have permission to view this page.", 'OK', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: ['snack-warning'],
      });
    }
  }

  getUserImage(item: any) {
    let result = '';
    if (item.first_name) {
      if (item.first_name)
        result = item.first_name.charAt(0);
      if (item.last_name)
        result += item.last_name.charAt(0);
    }
    return result?.toUpperCase();
  }

  locationName(item:any){
    return item.map((item: any) => item.name);
  }
}
