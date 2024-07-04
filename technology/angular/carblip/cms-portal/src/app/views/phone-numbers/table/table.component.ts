import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import * as deepEqual from 'deep-equal';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import * as commonModels from 'app/shared/models/common.model';
import { PhoneNumbersList } from 'app/shared/models/phone-numbers.model';
import { AppState } from 'app/store/';
import * as actions from 'app/store/phone-numbers/phone-numbers.actions';
import { dataSelector, didFetchSelector, metaSelector } from 'app/store/phone-numbers/phone-numbers.selectors';
import { initialState } from 'app/store/phone-numbers/phone-numbers.states';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditModalComponent } from '../edit-modal/edit-modal.component';

@Component({
    selector: 'app-phone-numbers-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.style.scss'],
    animations: [fadeInUp400ms, stagger40ms],
})
export class PhoneNumbersTableComponent implements OnInit {
    @Output() selectedDetails = new EventEmitter<any>();
    @Input() columnHeaders: Array<{}>;

    private onDestroy$ = new Subject<void>();

    public requests$: Observable<any>;
    public meta$: Observable<any>;
    public didFetch$: Observable<any>;

    public requests: Array<PhoneNumbersList> = [];
    public meta: commonModels.Meta;
    public offset: number;

    public sortKey:string;
    public sortDirection:string;
    selectedRecordDetail: any;
    selection = new SelectionModel<any>(true, []);

    constructor(
        private store$: Store<AppState>,
        private confirmService$: AppConfirmService,
        private changeDetectorRefs: ChangeDetectorRef,
        private router$: Router,
        private dialog: MatDialog
        )  
    {
        this.requests$ = this.store$.select(dataSelector);
        this.meta$ = this.store$.select(metaSelector);
        this.didFetch$ = this.store$.select(didFetchSelector);
        this.offset = 1;
        this.sortKey = localStorage.getItem("phone_numbers_list_module_order_by");
        this.sortDirection=localStorage.getItem("phone_numbers_list_module_order_dir");
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    ngOnInit() {
        this.requests$
            .pipe(
                debounceTime(10),
                takeUntil(this.onDestroy$),
                tap(requests => {
                    if (!deepEqual(this.requests, requests)) {
                        this.requests = requests;
                        this.selection.clear();
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
                    /*  this.offset = meta.from; */
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
        //set arrow direction in localstorage
        localStorage.setItem("phone_numbers_list_module_order_by", event.active);
        localStorage.setItem("phone_numbers_list_module_order_dir", event.direction);
        
        const updated_filter = {
            order_by: event.active ? event.active : initialState.filter.order_by,
            order_dir: event.direction
                ? event.direction
                : initialState.filter.order_dir,
        };
        this.store$.dispatch(new actions.UpdateFilter(updated_filter));
    }


    onDelete(item: PhoneNumbersList) {
        this.confirmService$
            .confirm({
                message: `Are you sure you wish to delete this phone number '${item.phone
                    }'? This is permanent and cannot be undone.`,
            })
            .subscribe(res => {
                if (res) {
                    const payload = {
                        id: item.id,
                        phone: item.phone
                    };
                    this.store$.dispatch(new actions.Delete(payload));
                }
            });
    }

    onEdit($item){
        const dialogRef: MatDialogRef<any> = this.dialog.open(
            EditModalComponent,
          {
            width: '720px',
            disableClose: true,
            data: { title: 'Assign Phone Number', isEdit:true, data: $item },
          }
        );
        dialogRef.afterClosed().subscribe(res => {
          if (!res) {
            // If user press cancel
            return;
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
