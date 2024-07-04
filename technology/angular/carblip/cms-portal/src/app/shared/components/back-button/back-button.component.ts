import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
})
export class BackButtonComponent implements OnInit {
  @Input('backRoute') backRoute = '';
  @Input('btnClass') btnClass: string;
  @Input('raised') raised = true;
  @Input('color') color: 'primary' | 'accent' | 'warn';

  constructor(private location$: Location) {}

  ngOnInit() {}

  goBack() {
    this.location$.back();
  }
}
