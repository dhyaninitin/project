import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface IMenuItem {
  type: string; // Possible values: link/dropDown/icon/separator/extLink
  name?: string; // Used as display text for item and title for separator type
  state?: string; // Router state
  icon?: string; // Material icon name
  tooltip?: string; // Tooltip text
  disabled?: boolean; // If true, item will not be appeared in sidenav.
  sub?: IChildItem[]; // Dropdown items
  badges?: IBadge[];
  role?: string[];
}
interface IChildItem {
  type?: string;
  name: string; // Display text
  state?: string; // Router state
  icon?: string;
  sub?: IChildItem[];
}

interface IBadge {
  color: string; // primary/accent/warn/hex color codes(#fff000)
  value: string; // Display text
}

@Injectable()
export class NavigationService {
  iconMenu: IMenuItem[] = [
    {
      type: 'separator',
      name: 'Users',
    },
    {
      name: 'REGISTEREDUSERS',
      type: 'link',
      tooltip: 'Contacts',
      icon: 'group',
      state: 'users',
    },
    {
      name: 'DEALS',
      type: 'link',
      tooltip: 'Deals',
      icon: 'work',
      state: 'Deals',
    },
    {
      name: 'INVENTORY',
      type: 'link',
      tooltip: 'inventories',
      icon: 'drive_eta',
      state: 'inventories',
    },
    {
      name: 'SUPPLIERS',
      type: 'link',
      tooltip: 'suppliers',
      icon: 'account_balance',
      state: 'suppliers',
    },
    {
      name: 'MPORTALDEALERS',
      type: 'link',
      tooltip: 'mdealers',
      icon: 'verified_user',
      state: 'mdealers',
    },
    {
      name: 'VENDORS',
      type: 'link',
      tooltip: 'vendors',
      icon: 'verified_user',
      state: 'vendors',
    },
    {
      name: 'QUOTES',
      type: 'link',
      tooltip: 'quotes',
      icon: 'format_quote',
      state: 'quotes',
    },
    {
      name: 'WHOLESALE QUOTES',
      type: 'link',
      tooltip: 'wholesalequote',
      icon: 'format_quote',
      state: 'wholesalequote',
    },
    {
      name: 'PURCHASEORDER',
      type: 'link',
      tooltip: 'purchaseorder',
      icon: 'local_car_wash',
      state: 'purchaseorder',
    },
    {
      name: 'CARSDIRECT',
      type: 'link',
      tooltip: 'carsdirect',
      icon: 'library_books',
      state: 'carsdirect',
    },
    {
      name: 'BLOCKLIST',
      type: 'link',
      tooltip: 'blocklist',
      icon: 'phonelink_erase',
      state: 'blocklist',
    },
    {
      name: 'REPORTS',
      type: 'link',
      tooltip: 'reports',
      icon: 'insert_chart',
      state: 'reports',
    },
    {
      name: 'Client Files',
      type: 'link',
      tooltip: 'clientfiles',
      icon: 'insert_drive_file',
      state: 'clientfiles',
    },
    {
      type: 'separator',
      name: 'Administration',
      role: ['superadmin', 'admin', 'manager'],
    },
    {
      name: 'USERS',
      type: 'link',
      tooltip: 'users',
      icon: 'supervised_user_circle',
      state: 'users',
      role: ['superadmin', 'admin', 'manager'],
    },
    {
      name: 'LOCATIONS',
      type: 'link',
      tooltip: 'locations',
      icon: 'add_location',
      state: 'locations',
      role: ['superadmin', 'admin'],
    },
    {
      name: 'DEALSTAGE',
      type: 'link',
      tooltip: 'dealstage',
      icon: 'format_list_numbered',
      state: 'dealstage',
      role: ['superadmin', 'admin'],
    },
  ];

  separatorMenu: IMenuItem[] = [
    {
      name: 'REGISTEREDUSERS',
      type: 'link',
      tooltip: 'Contacts',
      icon: 'group',
    },
    {
      name: 'DEALS',
      type: 'link',
      tooltip: 'Deals',
      icon: 'work',
    },
    {
      name: 'INVENTORY',
      type: 'link',
      tooltip: 'inventories',
      icon: 'drive_eta',
      state: 'inventories',
    },
    {
      name: 'SUPPLIERS',
      type: 'link',
      tooltip: 'suppliers',
      icon: 'account_balance',
      state: 'suppliers',
    },
    {
      name: 'MPORTALDEALERS',
      type: 'link',
      tooltip: 'mdealers',
      icon: 'verified_user',
      state: 'mdealers',
    },
    {
      name: 'QUOTES',
      type: 'link',
      tooltip: 'quotes',
      icon: 'format_quote',
      state: 'quotes',
    },
    {
      name: 'REPORTS',
      type: 'link',
      tooltip: 'reports',
      icon: 'insert_chart',
      state: 'reports',
    },
    {
      name: 'USERS',
      type: 'link',
      tooltip: 'users',
      icon: 'supervised_user_circle',
      state: 'users',
      role: ['superadmin', 'admin', 'manager'],
    },
    {
      name: 'LOCATIONS',
      type: 'link',
      tooltip: 'locations',
      icon: 'add_location',
      state: 'locations',
      role: ['superadmin', 'admin'],
    },
    {
      name: 'DEALSTAGE',
      type: 'link',
      tooltip: 'dealstage',
      icon: 'format_list_numbered',
      state: 'dealstage',
      role: ['superadmin', 'admin'],
    },
  ];

  plainMenu: IMenuItem[] = [
    {
      name: 'REGISTEREDUSERS',
      type: 'link',
      tooltip: 'Contacts',
      icon: 'group',
      state: 'users',
    },
    {
      name: 'DEALS',
      type: 'link',
      tooltip: 'Deals',
      icon: 'work',
      state: 'deals',
    },
    {
      name: 'INVENTORY',
      type: 'link',
      tooltip: 'inventories',
      icon: 'drive_eta',
      state: 'inventories',
    },
    {
      name: 'SUPPLIERS',
      type: 'link',
      tooltip: 'suppliers',
      icon: 'account_balance',
      state: 'suppliers',
    },
    {
      name: 'MPORTALDEALERS',
      type: 'link',
      tooltip: 'mdealers',
      icon: 'verified_user',
      state: 'mdealers',
    },
    {
      name: 'QUOTES',
      type: 'link',
      tooltip: 'quotes',
      icon: 'format_quote',
      state: 'quotes',
    },
    {
      name: 'USERS',
      type: 'link',
      tooltip: 'users',
      icon: 'supervised_user_circle',
      state: 'users',
      role: ['superadmin', 'admin', 'manager'],
    },
    {
      name: 'LOCATIONS',
      type: 'link',
      tooltip: 'locations',
      icon: 'add_location',
      state: 'locations',
      role: ['superadmin', 'admin'],
    },
    {
      name: 'DEALSTAGE',
      type: 'link',
      tooltip: 'dealstage',
      icon: 'format_list_numbered',
      state: 'dealstage',
      role: ['superadmin', 'admin'],
    },
  ];

  // Icon menu TITLE at the very top of navigation.
  // This title will appear if any icon type item is present in menu.
  iconTypeMenuTitle = 'Frequently Accessed';
  // sets iconMenu as default;
  menuItems = new BehaviorSubject<IMenuItem[]>(this.iconMenu);
  // navigation component has subscribed to this Observable
  menuItems$ = this.menuItems.asObservable();
  constructor() { }

  // Customizer component uses this method to change menu.
  // You can remove this method and customizer component.
  // Or you can customize this method to supply different menu for
  // different user type.
  publishNavigationChange(menuType: string) {
    switch (menuType) {
      case 'separator-menu':
        this.menuItems.next(this.separatorMenu);
        break;
      case 'icon-menu':
        this.menuItems.next(this.iconMenu);
        break;
      default:
        this.menuItems.next(this.plainMenu);
    }
  }
}
