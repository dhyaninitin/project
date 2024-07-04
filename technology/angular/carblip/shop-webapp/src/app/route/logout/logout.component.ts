import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthServiceImpl } from 'app/shared/states/auth/auth.service';

@Component({
  selector: 'app-log-out',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {
  constructor(private authService: AuthServiceImpl, private router: Router) {}

  ngOnInit() {
    this.router.navigate(['find-my-car']);
    this.authService.signOut();
  }
}
