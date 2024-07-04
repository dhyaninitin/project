import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LayoutService } from '@vex/services/layout.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs';
@UntilDestroy()
@Component({
  selector: 'vex-config-panel-toggle',
  templateUrl: './config-panel-toggle.component.html',
  styleUrls: ['./config-panel-toggle.component.scss']
})
export class ConfigPanelToggleComponent implements OnInit {

  @Output() openConfig = new EventEmitter();

  isDesktop$ = this.layoutService.isDesktop$;

  constructor(private layoutService: LayoutService) { }

  ngOnInit() {
    /**
     * Expand Sidenav when we switch from mobile to desktop view
    */
    this.isDesktop$.pipe(
      filter(matches => !matches),
      untilDestroyed(this)
    ).subscribe(() => this.layoutService.expandSidenav());
  }

  
  openHelp() {
    window.open('https://cbu.carblip.com', '_blank')
  }

}
