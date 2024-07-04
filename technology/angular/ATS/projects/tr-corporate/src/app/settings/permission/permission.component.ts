import { Component, OnInit } from '@angular/core';
import { SETTINGS_LN } from '../shared/settings.lang';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})
export class PermissionComponent implements OnInit {

  ln = SETTINGS_LN;

  constructor() { }

  ngOnInit(): void {
  }

}
