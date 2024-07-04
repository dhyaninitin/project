import { NavigationItem } from "@vex/interfaces/navigation-item.interface";

export const ROUTES: NavigationItem[] = [
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
        label: 'Inventories',
        icon: 'mat:drive_eta'
    },
    {
        type: 'link',
        route: 'suppliers',
        label: 'Suppliers',
        icon: 'mat:account_balance'
    },
    {
        type: 'link',
        route: 'mdealers',
        label: 'mPortal Dealers',
        icon: 'mat:verified_user'
    },
    {
        type: 'link',
        route: 'vendors',
        label: 'Vendors',
        icon: 'mat:verified_user'
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
        icon: 'mat:local_car_wash'
    },
    {
        type: 'link',
        route: 'carsdirect',
        label: 'CB2',
        icon: 'mat:library_books'
    },
    {
        type: 'link',
        route: 'blocklist',
        label: 'Block List',
        icon: 'mat:phonelink_erase'
    },
    {
        type: 'link',
        route: 'reports',
        label: 'Reports',
        icon: 'mat:insert_chart'
    },
    {
        type: 'link',
        route: 'clientfiles',
        label: 'Client Files',
        icon: 'mat:insert_drive_file'
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
                label: 'DealStage',
                icon: 'mat:format_list_numbered',
                role: ['superadmin', 'admin']
            }
        ]
    }
]