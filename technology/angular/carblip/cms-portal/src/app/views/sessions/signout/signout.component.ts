import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Logout } from 'app/store/auth/authentication.action';

import { AppState } from 'app/store';

@Component({
  selector: 'app-signout',
  templateUrl: './signout.component.html',
  styleUrls: ['./signout.component.css'],
})
export class SignoutComponent implements OnInit {
  constructor(private store: Store<AppState>) {
    this.store.dispatch(new Logout());
  }

  ngOnInit() {}
}
