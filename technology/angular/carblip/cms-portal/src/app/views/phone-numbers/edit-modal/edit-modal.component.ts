import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AppState } from 'app/store/';
import * as actions from 'app/store/phone-numbers/phone-numbers.actions';
import { initialState } from 'app/store/phone-numbers/phone-numbers.states';
import * as commonModels from 'app/shared/models/common.model';
import { PhoneNumbersListService } from 'app/shared/services/apis/phone-numbers.service';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';

@Component({
  selector: 'app-phonenumber-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss'],
})
export class EditModalComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  public filter: commonModels.Filter = initialState.filter;
  public phoneNumberForm: FormGroup;
  public isTypeEnabled: boolean = true;
  type: any;
  public showProperty: boolean = false;
  portalUsers: any = [];
  public loadingUsers: boolean = true;
  public portalUserId: number;
  smsTemplateEditMessage: any;
  portalUserFilterCtrl: FormControl = new FormControl();
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private service$: PhoneNumbersListService,
    public dialogRef: MatDialogRef<EditModalComponent>,
    private portalUserService$: PortalUserService,
    private loader$: AppLoaderService,
    private store$: Store<AppState>,
  ) {}

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.getUsers();
    this.initform();

    if (this.data.isEdit) {
      const editPhoneNumber = this.data.data;
      this.phoneNumberForm.patchValue({
        portalUser: editPhoneNumber.portalUser,
      });
    }

    //listen for search field value changes for portal user
    this.portalUserFilterCtrl.valueChanges
      .pipe(debounceTime(10), takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.filterPortalUsers();
      });
  }

  initform() {
    this.phoneNumberForm = this.fb.group({
      portalUser: ['', Validators.required],
    });
    this.phoneNumberForm.get('portalUser').disable();
  }

  getUsers() {
    this.portalUserService$
      .getListWithNoPhoneAssigned({
        order_by: 'created_at',
        order_dir: 'desc',
        page: 1,
        per_page: 500,
        search: ''
      })
      .subscribe((res: any) => {
        if (res) {
          this.portalUsers = res.data
          this.filteredPortalUsers = res.data
          this.phoneNumberForm.get('portalUser').enable();
          this.loadingUsers = false;
        }
      });
  }

  savePhoneNumber() {
    this.service$
      .update({ id: this.data.data.id, portalUserId: this.portalUserId })
      .subscribe((res: any) => {
        this.loader$.close();
        this.dialogRef.close(true);
        this.loadData();
      });
  }

  onPortalUserChange($value) {
    this.portalUserId = $value.id
  }

  filteredPortalUsers: any = [];

  /** Filter sms properties
   * @param smsTemplate item
   * @return
   **/

  filterPortalUsers() {
    if (!this.portalUsers) {
      return;
    }
    //get the search keyword
    let search = this.portalUserFilterCtrl.value;

    if (!search) {
      this.filteredPortalUsers = this.portalUsers.slice(0);
      return;
    } else {
      search = search.toLowerCase();
    }

    //filter the banks
    this.filteredPortalUsers = this.portalUsers.filter(
      (item) => `${item.first_name} ${item.last_name}`.toLowerCase().indexOf(search) > -1
    );
  }

  loadData() {
    this.store$.dispatch(new actions.GetList());
  }
}
