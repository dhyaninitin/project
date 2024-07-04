import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, map, startWith } from 'rxjs/operators';
import { ThemeService } from '../../../services/theme.service';
import { LayoutService } from '@vex/services/layout.service';
import { checkRouterChildsData } from '@vex/utils/check-router-childs-data';
import { ConfigService } from '@vex/config/config.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NavigationService } from '@vex/services/navigation.service';
import { NgxRolesService } from 'ngx-permissions';
import { NavigationItem } from '@vex/interfaces/navigation-item.interface';
import { ColorSchemeName } from '@vex/config/colorSchemeName';
import { Carblip_logo, colorVariables } from '@vex/components/config-panel/color-variables';

@UntilDestroy()
@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  public isModuleLoading: Boolean = false;

  public scrollConfig = {};
  public layoutConf: any = {};

  sidenavCollapsed$ = this.layoutService.sidenavCollapsed$;
  isFooterVisible$ = this.configService.config$.pipe(map(config => config.footer.visible));
  isDesktop$ = this.layoutService.isDesktop$;
  toolbarShadowEnabled$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    startWith(null),
    map(() => checkRouterChildsData(this.router.routerState.root.snapshot, data => data.toolbarShadowEnabled))
  );
  
  isDesktop: boolean = false;

  constructor(
    private router: Router,
    public translate: TranslateService,
    public themeService: ThemeService,
    private layoutService: LayoutService,
    private configService: ConfigService,
    private navigationService$: NavigationService,
    private rolesService$: NgxRolesService,
    private _cdr: ChangeDetectorRef
  ) {
    // Translator init
    const browserLang: string = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }

  ngOnInit() {
    // Load Night-Mode
    const isDark = localStorage.getItem('portal-night-mode');
    if(isDark == '1') {
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
        sidenav: { imageUrl: Carblip_logo.logo_text_white } 
      });
    } else {
      this.configService.updateConfig({ 
        style: { colorScheme: ColorSchemeName.light,
          colors: {
            primary: {
              default: colorVariables.carblip_light.default,
              contrast: colorVariables.carblip_light.contrast
            }
          } 
        }, 
        sidenav: { imageUrl: Carblip_logo.logo_text_dark } 
      });
    }

    // Here you can specify your routes for sidenav panel
    const ROUTES: NavigationItem[] = [
      {
          type: 'link',
          route: 'contacts',
          label: 'Contacts',
          icon: 'mat:group'
      },
      {
          type: 'link',
          route: 'deals',
          label: 'Deals',
          icon: 'mat:work'
      },
      {
          type: 'link',
          route: 'inventories',
          label: 'Inventory',
          icon: 'mat:drive_eta',
          role: ['superadmin', 'admin']
      },
      {
          type: 'link',
          route: 'suppliers',
          label: 'Suppliers',
          icon: 'mat:store',
          role: ['superadmin', 'admin', 'administrative', 'manager', 'salesperson']
      },
      {
          type: 'link',
          route: 'mdealers',
          label: 'mPortal Dealers',
          icon: 'mat:verified_user',
          role: ['superadmin', 'admin']
      },
      {
          type: 'link',
          route: 'vendors',
          label: 'Vendors',
          icon: 'mat:verified_user',
          role: ['superadmin', 'admin', 'administrative', 'manager', 'salesperson']
      },
      {
          type: 'link',
          route: 'quotes',
          label: 'Quotes',
          icon: 'mat:format_quote'
      },
      {
          type: 'link',
          route: 'wholesalequote',
          label: 'Wholesale Quote',
          icon: 'mat:format_quote'
      },
      {
          type: 'link',
          route: 'purchaseorder',
          label: 'Purchase Order',
          icon: 'mat:local_car_wash',
          role: ['superadmin', 'admin', 'administrative', 'manager', 'salesperson']
      },
      {
          type: 'link',
          route: 'carsdirect',
          label: 'CB2',
          icon: 'mat:library_books',
          role: ['superadmin', 'admin']
      },
      {
          type: 'link',
          route: 'blocklist',
          label: 'Block List',
          icon: 'mat:phonelink_erase',
          role: ['superadmin', 'admin']
      },
      {
          type: 'link',
          route: 'reports',
          label: 'Reports',
          icon: 'mat:insert_chart',
          role: ['superadmin', 'admin', 'administrative', 'manager', 'salesperson']
      },
      {
          type: 'link',
          route: 'clientfiles',
          label: 'Client Files',
          icon: 'mat:insert_drive_file'
      },
      {
        type: 'link',
        route: 'workflows',
        label: 'Workflows',
        icon: 'mat:perm_data_setting',
        role: ['superadmin', 'admin', 'manager']
      },
      {
        type: 'link',
        route: 'smstemplates',
        label: 'Sms Templates',
        icon: 'mat:textsms',
        role: ['superadmin', 'admin', 'manager']
      },
      {
        type: 'link',
        route: 'emailtemplates',
        label: 'Email Templates',
        icon: 'mat:email',
        role: ['superadmin', 'admin', 'manager']
      },
      {
        type: 'link',
        route: 'tasks',
        label: 'Tasks',
        icon: 'mat:list_alt'
      },
      {
        type: 'link',
        route: 'mDesk',
        label: 'mDesk',
        icon: 'mat:desk',
        role: ['superadmin', 'admin', 'manager', 'salesperson']
      },
      {
          type: 'subheading',
          label: 'Administration',
          children: [
              {
                  type: 'link',
                  route: 'users',
                  label: 'Users',
                  icon: 'mat:supervised_user_circle',
                  role: ['superadmin', 'admin', 'manager']
              },
              {
                  type: 'link',
                  route: 'locations',
                  label: 'Locations',
                  icon: 'mat:add_location',
                  role: ['superadmin', 'admin']
              },
              {
                  type: 'link',
                  route: 'dealstage',
                  label: 'Hubspot Deal Stages',
                  icon: 'mat:format_list_numbered',
                  role: ['superadmin', 'admin']
              },
              {
                type: 'link',
                route: 'phonenumbers',
                label: 'Phone Numbers',
                icon: 'mat:contact_phone',
                role: ['superadmin', 'admin']
              },
              {
                type: 'link',
                route: 'dealstages',
                label: 'Deal Stages',
                icon: 'mat:format_list_numbered',
                role: ['superadmin', 'admin']
              },
              {
                type: 'link',
                route: 'vehicledata',
                label: 'Vehicle Data',
                icon: 'mat:time_to_leave',
                role: ['superadmin', 'admin']
              },
          ]
      },
      {
        type: 'subheading',
        label: 'Settings',
        children: [
          {
            type: 'link',
            route: 'workflow-settings',
            label: 'Workflow Settings',
            icon: 'mat:settings',
            role: ['superadmin', 'admin']
          },
          {
            type: 'link',
            route: 'concierge-user-settings',
            label: 'Concierge Settings',
            icon: 'mat:accessibility_new',
            role: ['superadmin', 'admin']
          },
        ]
      }
    ];
    
    this.navigationService$.items = this.filterOut(ROUTES);
    this.isDesktop$.subscribe(res=> {
      this.isDesktop = res;
    });
  }

  filterOut(menuItems) {
    const roles = this.rolesService$.getRoles();
    menuItems = menuItems.filter(item => {
      let show = true;
      if (item.children) {
        item.children = item.children.filter((itemm: any, index: number) => {
          show = false;
          itemm.role.forEach(i => {
            if (roles[i]) {
              show = true;
            }
          });
          if(show) {
            return itemm;
          }
        })
        if(item.children.length > 0) {
          show = true;
          return item;
        }
      } else {
        if(item.role) {
          show = false;
          item.role.forEach(i => {
            if (roles[i]) {
              show = true;
            }
          });
          if(show) {
            return item;
          }
        }
        return show;
      }
    });
    return menuItems;
  }

  ngOnDestroy(): void {
    this.navigationService$.items = []
  }
}
