import { Component, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { ROUTE_CONFIGS } from '../utility/configs/routerConfig';
import { fadeAnimation } from '../animations';
import { MFilterComponent } from './permission/m-filter/m-filter.component';
import { DesignService } from '../utility/services/design.service';
import { UtilityService } from '../utility/services/utility.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  showFiller = true;
  drawerMode: any;
  innerWidth: any;
  routerConfig = ROUTE_CONFIGS;
  drawerPosition: any = "start";
  currentUrlPath: string;
  ROUTE_CONFIGS = ROUTE_CONFIGS;
  isMobile = false;

  @ViewChild('drawer', { static: true }) drawer!: MatDrawer;

  constructor(
     private router: Router,
     private _bottomSheet: MatBottomSheet, 
     public designService: DesignService,
     public util: UtilityService) {

    this.currentUrlPath = router.url;
    router.events.subscribe(res => {
      this.currentUrlPath = router.url;
      if (this.currentUrlPath === ROUTE_CONFIGS.SETTINGS_DASHBOARD) {
        this.drawer.close()
      }
    })

  }

  ngOnInit(): void {
    this.drawerMode = 'side';
    this.drawerPosition = 'start';
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 767) {
      this.drawerMode = 'over';
      this.drawerPosition = 'end';
    }
    this.isMobile = this.util.isMobile();
  }
  openBottomSheet(): void {
    this._bottomSheet.open(MFilterComponent);
  }
}
