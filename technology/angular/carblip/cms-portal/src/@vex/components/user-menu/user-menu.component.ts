import { Component, OnInit } from '@angular/core';
import { ColorSchemeName } from '@vex/config/colorSchemeName';
import { ConfigService } from '@vex/config/config.service';
import { Carblip_logo, colorVariables } from '../config-panel/color-variables';
import { PopoverRef } from '../popover/popover-ref';

@Component({
  selector: 'vex-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {

  constructor(private readonly popoverRef: PopoverRef, private configService: ConfigService) { }
  isDark: boolean = false;

  ngOnInit(): void {
    const isDark = localStorage.getItem('portal-night-mode');
    this.isDark = isDark == '1'? true : false;
  }

  close(): void {
    /** Wait for animation to complete and then close */
    setTimeout(() => this.popoverRef.close(), 250);
  }

  enableDarkMode(): void {
    this.configService.updateConfig({
      style: {
        colorScheme: ColorSchemeName.dark,
        colors: {
          primary: {
            default: colorVariables.carblip_night.default,
            contrast: colorVariables.carblip_night.contrast
          }
        } 
      },
      sidenav: {
        imageUrl: Carblip_logo.logo_text_white
      }
    });
  }

  disableDarkMode(): void {
    this.configService.updateConfig({
      style: {
        colorScheme: ColorSchemeName.light,
        colors: {
          primary: {
            default: colorVariables.carblip_light.default,
            contrast: colorVariables.carblip_light.contrast
          }
        }
      },
      sidenav: {
        imageUrl: Carblip_logo.logo_text_dark
      }
    });
  }

  toggleNightMode() {
    this.isDark = !this.isDark;
    if(this.isDark) {
      this.enableDarkMode();
      localStorage.setItem('portal-night-mode', '1');
    } else {
      this.disableDarkMode();
      localStorage.setItem('portal-night-mode', '0');
    }
  }
}
