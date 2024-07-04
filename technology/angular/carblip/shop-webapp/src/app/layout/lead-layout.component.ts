import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lead-layout',
  templateUrl: './lead-layout.component.html',
  styleUrls: ['./lead-layout.component.scss'],
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [animate(300)]),
      transition(':leave', [animate(500)]),
    ]),
  ],
})
export class LeadLayoutComponent implements OnInit {
  public showSubMenu: Boolean = true;
  public currentUrl: String;

  constructor(private router: Router, @Inject(DOCUMENT) document) {
    this.currentUrl = this.router.url;
  }

  ngOnInit() {}
}
