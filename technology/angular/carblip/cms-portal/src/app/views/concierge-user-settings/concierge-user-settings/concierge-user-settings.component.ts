import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, } from 'rxjs/operators';
import { ConciergeUserSettingsService } from 'app/shared/services/apis/concierge-user-settings.service';

import * as _ from 'underscore';

import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';

@Component({
  selector: 'app-concierge-user-settings',
  templateUrl: './concierge-user-settings.component.html',
  styleUrls: ['./concierge-user-settings.component.css'],
  animations: [fadeInUp400ms]
})
export class ConciergeUserSettingsComponent implements OnInit {

  private onDestroy$ = new Subject<void>();

  settingsForm: FormGroup;

  public filteredUsers: Array<any>;
  public owners: Array<any>;
  portalUsers = [];

  offset: number = 1;
  totalPages: number = 0;
  loading: boolean = false;

  public userFilterCtrl: FormControl = new FormControl();
  conciergeSettings: any;

  constructor(private fb: FormBuilder,
    private changeDetectorRefs: ChangeDetectorRef,
    private service$: ConciergeUserSettingsService,
    private snack$: MatSnackBar,) {
    
  }

  getNextBatch() {
    this.loading = true;
    this.offset = this.offset + 1;
  }


  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      portal_users: ['', Validators.required]
    });
    this.getConciergeSettings();
    this.filterUsers();

    this.userFilterCtrl.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.onDestroy$)
      )
      .subscribe(() => {
        this.offset = 1;
        this.portalUsers = [];
        this.filterUsers();
      });
  }

  getConciergeSettings() {
    this.service$.getPortalUsersList().subscribe(res => {
      this.conciergeSettings = res.data;
      if (this.conciergeSettings) {
        const formValue = {
          "portal_users": this.conciergeSettings.portal_users
        }
        this.settingsForm.patchValue(formValue);
      }
    })
  }

  refreshTable() {
    this.changeDetectorRefs.detectChanges();
  }

  save() {
    const payload = {
      portal_user_id: this.settingsForm.value.portal_users,
    }
    if (this.settingsForm.valid) {
      this.service$.saveConciergeSettings(payload).subscribe(res => {
        const message = 'Added';
        this.snack$.open(`${message} successfully`, 'OK', {
          duration: 2000,
          verticalPosition: 'top',
          panelClass: ['snack-success'],
        });
      }, err => {
        this.snack$.open('Something went wrong', 'OK', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: ['snack-warning'],
        });
      })
    }
  }

  filterUsers() {
    this.portalUsers = [];
    const search = this.userFilterCtrl.value || '';

    const ownerParam: any = {
      order_by: 'created_at',
      order_dir: 'desc',
      page: this.offset,
      per_page: 200,
      search,
    };

    this.service$.getList(ownerParam).subscribe(({ data, meta }) => {
      this.portalUsers.push(...data);
      this.owners = this.portalUsers;
      this.totalPages = meta.last_page;
      this.filteredUsers = this.owners.slice(0);
      this.loading = false;
      this.refreshTable();
    });
  }
}