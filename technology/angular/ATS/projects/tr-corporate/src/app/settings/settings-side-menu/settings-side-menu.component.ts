import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TranslatePipe } from '@cloudtalentrecruit/ng-core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { fadeAnimation } from '../../animations';
import { SETTINGS_LN } from '../shared/settings.lang';

@Component({
  selector: 'app-settings-side-menu',
  templateUrl: './settings-side-menu.component.html',
  styleUrls: ['./settings-side-menu.component.scss'],
  animations: [fadeAnimation]
})

export class SettingsSideMenuComponent implements OnInit {

  ln = SETTINGS_LN;
  @Output() navigateEvent = new EventEmitter<any>();

  public config: PerfectScrollbarConfigInterface = {
    suppressScrollX: true
  };

  parents = [
    {
      name: this.ln.TXT_PERMISSIONS,
      link: "./permission",
      activeOption: false,
      child: [
        {
          name: this.ln.TXT_USER_MANAGEMENT,
          link: "./permission/users",
          // link: "routerConfig.SETTINGS_DASHBOARD",
        },
        {
          name: this.ln.TXT_ACCOUNT_ROLE,
          link: "./permission/roles",
        },
      ],
      icon: 'icon-mc mc-grading',
    },
    {
      name : "Offer",
      link: "./",
      activeOption: true,
      child:[
      {
        name : "Generic Setting",
        link : "./offer/generic-setting"
      },
      {
        name: "Template",
        link : "./offer/template"

      }],
      icon :""
    }

  ]

  panelOpenState = false;
  autoFocusVal = false;
  constructor() { }

  ngOnInit(): void {
  }

  onNavigate() {
    this.navigateEvent.emit()
  }
}
