import { Component, Inject, LOCALE_ID, OnInit, Renderer2 } from "@angular/core";
import { ConfigService } from "../@vex/config/config.service";
import { Settings } from "luxon";
import { DOCUMENT } from "@angular/common";
import { Platform } from "@angular/cdk/platform";
import { LayoutService } from "../@vex/services/layout.service";
import { ActivatedRoute } from "@angular/router";
import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { SplashScreenService } from "../@vex/services/splash-screen.service";
import { VexConfigName } from "../@vex/config/config-name.model";
import { ColorSchemeName } from "../@vex/config/colorSchemeName";
import {
  MatIconRegistry,
  SafeResourceUrlWithIconOptions,
} from "@angular/material/icon";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import {
  ColorVariable,
  colorVariables,
} from "../@vex/components/config-panel/color-variables";
import { NavigationService } from "src/@vex/services/navigation.service";

@Component({
  selector: "vex-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  role: any;
  constructor(
    private configService: ConfigService,
    private renderer: Renderer2,
    private platform: Platform,
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCALE_ID) private localeId: string,
    private layoutService: LayoutService,
    private route: ActivatedRoute,
    private splashScreenService: SplashScreenService,
    private readonly matIconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer,
    private navigationService: NavigationService
  ) {
    Settings.defaultLocale = this.localeId;

    if (this.platform.BLINK) {
      this.renderer.addClass(this.document.body, "is-blink");
    }

    this.matIconRegistry.addSvgIconResolver(
      (
        name: string,
        namespace: string
      ): SafeResourceUrl | SafeResourceUrlWithIconOptions | null => {
        switch (namespace) {
          case "mat":
            return this.domSanitizer.bypassSecurityTrustResourceUrl(
              `assets/img/icons/material-design-icons/two-tone/${name}.svg`
            );

          case "logo":
            return this.domSanitizer.bypassSecurityTrustResourceUrl(
              `assets/img/icons/logos/${name}.svg`
            );

          case "flag":
            return this.domSanitizer.bypassSecurityTrustResourceUrl(
              `assets/img/icons/flags/${name}.svg`
            );
        }
      }
    );

    this.route.queryParamMap.subscribe((queryParamMap) => {
      if (queryParamMap.has("layout")) {
        this.configService.setConfig(
          queryParamMap.get("layout") as VexConfigName
        );
      }

      if (queryParamMap.has("style")) {
        this.configService.updateConfig({
          style: {
            colorScheme: queryParamMap.get("style") as ColorSchemeName,
          },
        });
      }

      if (queryParamMap.has("primaryColor")) {
        const color: ColorVariable =
          colorVariables[queryParamMap.get("primaryColor")];

        if (color) {
          this.configService.updateConfig({
            style: {
              colors: {
                primary: color,
              },
            },
          });
        }
      }

      if (queryParamMap.has("rtl")) {
        this.configService.updateConfig({
          direction: coerceBooleanProperty(queryParamMap.get("rtl"))
            ? "rtl"
            : "ltr",
        });
      }
    });
  }

  ngOnInit() {
    let stringifiedItems: any;
    let parsedItems: any;
    stringifiedItems = localStorage.getItem("navigationItems");
    if (stringifiedItems) {
      parsedItems = JSON.parse(stringifiedItems);
      this.navigationService.items = parsedItems;
    }
  }
}
