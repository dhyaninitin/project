interface NavAttributes {
  [propName: string]: any;
}
interface NavWrapper {
  attributes: NavAttributes;
  element: string;
}
 export interface NavBadge {
  text: string;
  variant: string;
}
interface NavLabel {
  class ? : string;
  variant: string;
}

export interface NavData {
  name ? : string;
  url ? : string;
  icon ? : string;
  badge ? : NavBadge;
  title ? : boolean;
  children ? : NavData[];
  variant ? : string;
  attributes ? : NavAttributes;
  divider ? : boolean;
  class ? : string;
  label ? : NavLabel;
  wrapper ? : NavWrapper;
}

export const navItems: NavData[] = [{
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'fa fa-tachometer'
  },
  {
    name: 'Advertisement',
    url: '/advertisement',
    icon: 'fa fa-newspaper-o'
  },
  {
    name: 'Location',
    icon: 'fa fa-list',
    url: '/importExcel',
    children: [
      {
        name: 'Country',
        url: '/country',
        icon: 'fa fa-star-o'

      },
      {
        name: 'State',
        url: '/state',
        icon: 'fa fa-star-o'
      },
      {
        name: 'City',
        url: '/city',
        icon: 'fa fa-star-o'
      },
      {
        name: 'Zipcode',
        url: '/zipcode',
        icon: 'fa fa-star-o'
      },
      {
        name: 'Import Excel',
        url: '/importExcel',
        icon: 'fa fa-star-o'
      },
    ]
  },
  {
    name: 'Certificate',
    url: '/certificates',
    icon: 'fa fa-list',
    children: [
      {
        name: 'Certificate Type',
        url: '/certificateType',
        icon: 'fa fa-star-o'
      },
      {
        name: 'Certificate List',
        url: '/certificates',
        icon: 'fa fa-star-o'
      },
    ]
  },
  {
    name: 'Skills',
    url: '/skills',
    icon: 'fa fa-list',
    children: [
      {
        name: 'Skill Type',
        url: '/skillType',
        icon: 'fa fa-star-o'
      },
      {
        name: 'Skill List',
        url: '/skills',
        icon: 'fa fa-star-o'
      },
    ]
  },
  {
    name: 'Specialties',
    url: '/specialties',
    icon: 'fa fa-list'
  },
  {
    name: 'License Type',
    url: '/licenseType',
    icon: 'fa fa-list'
  },
  {
    name: 'Experience',
    url: '/experience',
    icon: 'fa fa-list'
  },
   /* {
    name: 'Blog',
    url: '/allblogs',
    icon: 'fa fa-search',
    children: [
      {
        name: 'All Blog',
        url: '/all-blogs',
        icon: 'fa fa-star-o'
      },
      {
      name: 'Add Blog',
      url: '/blog/add-blog',
      icon: 'fa fa-star-o'
    },
      {
        name: 'Create Category',
        url: '/blog/categories',
        icon: 'fa fa-star-o'
      }]
  }, */
  {
    name: 'Contracts',
    url: '/allContracts',
    icon: 'fa fa-connectdevelop',
  },
  {
    name: 'Disputes',
    url: '/disputes',
    icon: 'fa fa-list '
  },
  {
    name: 'Email Templates',
    url: '/email-templates/list',
    icon: 'fa fa-list',
    children: [
      {
        name: 'All Templates',
        url: '/email-templates/list',
        icon: 'fa fa-star-o'
      },
      {
        name: 'Create Template',
        url: '/email-templates/add',
        icon: 'fa fa-star-o'
      }
    ]
  },
  {
    name: 'Practice Type',
    url: '/practiceType',
    icon: 'fa fa-pencil-square-o'
  },
  {
    name: 'Position Type',
    url: '/positionType',
    icon: 'fa fa-list '
  },

  {
    name: 'Promo Code',
    url: '/promoCode',
    icon: 'fa fa-list '
  },

  {
    name: 'Access Level',
    url: '/accessLevel',
    icon: 'fa fa-key '
  },

  {
    name: 'Payments',
    url: '/paymentList',
    icon: 'fa fa-money'
  },
  {
    name: 'Users',
    url: '/users/subAdmin',
    icon: 'fa fa-users',
    children: [
      {
        name: 'Practice',
        url: '/users/practice',
        icon: 'fa fa-user'
      },
      {
        name: 'Staff',
        url: '/users/staff',
        icon: 'fa fa-user'
      },
      {
        name: 'Sub Admin',
        url: '/users/subAdmin',
        icon: 'fa fa-user'
      }
    ]
  },
  {
    name: 'Expired License',
    url: '/expiredLicense',
    icon: 'fa fa-users '
  },


  // {
  //   name: 'Reports & Statistics',
  //   url: '/ReportsStatistics',
  //   icon: 'fa fa-line-chart '
  // },
];


export const practiceNavItems: NavData[] = [{
    name: 'Dashboard',
    url: '/practice/dashboard',
    icon: 'fa fa-tachometer'
  },
  {
    name: 'Profile',
    url: '/practice/profile',
    icon: 'fa fa-user'
  },
  {
    // name: 'Search Staffs',
    name: 'Marketplace',
    url: '/dental-staffs',
    icon: 'fa fa-search',
    // children: [{
    //   name: 'Favorite Staffs',
    //   url: '/practice/favorites-staffs',
    //   icon: 'fa fa-star-o'
    // }]
  },
  {
    name: 'Favorite Staffs',
    url: '/practice/favorites-staffs',
    icon: 'fa fa-heart-o',
  },
  {
    name: 'Post a new job',
    url: '/jobs',
    icon: 'fa fa-plus',
    children:[{
      name: 'Post a new job',
      url: '/practice/post-job',
      icon: 'fa fa-plus'
    },
    {
      name: 'Draft jobs',
        url: '/practice/job-drafts',
        icon: 'fa fa-list'
    }]
  },
  {
    name: 'My Job Postings',
    url: '/practice/job-posts',
    icon: 'fa fa-list',

    // children: [{
    //     name: 'My posted jobs',
    //     url: '/practice/job-posts',
    //     icon: 'fa fa-list'
    //   },
      /* {
        name: 'Post a job',
        url: '/practice/post-job',
        icon: 'fa fa-plus'
      }, */
      /* {
        name: 'Draft jobs',
        url: '/practice/job-drafts',
        icon: 'fa fa-list'
      }, */
      /* {
        name: 'Offers sent',
        url: '/practice/sent-offers',
        icon: 'fa fa-handshake-o'
      }, */
      // {
      //   name: 'Invitation sent',
      //   url: '/practice/job-invites',
      //   icon: 'fa fa-list'
      // },
    // ]
  },
  // {
  //   name: 'Offers',
  //   url: '/offer',
  //   icon: 'fa fa-handshake-o',
  //   children: [{
  //       name: 'Invitations',
  //       url: '/practice/sent-offers',
  //       icon: 'fa fa-list'
  //     },
  //     {
  //       name: 'Applications',
  //       url: '/practice/received-offers',
  //       icon: 'fa fa-list'
  //     },
  //   ]
  // },
  {
    name: 'Invitations',
    url: '/practice/sent-offers',
    icon: 'fa fa-list'
  },
  {
    name: 'Applications',
    url: '/practice/received-offers',
    icon: 'fa fa-list'
  },
  // {
  //   name: 'Offers sent',
  //   url: '/practice/sent-offers',
  //   icon: 'fa fa-handshake-o'
  // },
  {
    name: 'Contracts',
    url: '/practice/contracts',
    icon: 'fa fa-connectdevelop',
  },
  {
    name: 'Messages',
    url: '/messaging',
    icon: 'fa fa-comment',
  },
  // {
  //   name: 'FAQ',
  //   url: '/practice/bided',
  //   icon: 'fa-question-circle-o',
  //   class: 'showHideNav',
  // },
  {
    name: 'Payments',
    url: '/practice/paymentList',
    icon: 'fa fa-money',
    // children: []
  },
  {
    name: 'Analytics',
    url: '/practice/analytics',
    icon: 'fa fa-line-chart',
  },
];
/* export const practiceNavItems: NavData[] = [
  {
    name: 'Dashboard',
    url: '/practice/dashboard',
    icon: 'fa fa-tachometer'
  },
  {
    name: 'Profile',
    url: '/practice/profile',
    icon: 'fa fa-user'
  },
  {
    name: 'Jobs',
    url: '/jobs',
    icon: 'fa fa-briefcase',
    children: [
      {
        name: 'Jobs Posts',
        url: '/practice/job-posts',
        icon: 'fa fa-list'
      },
      {
        name: 'Job Invites',
        url: '/practice/job-invites',
        icon: 'fa fa-envelope'
      },
      {
        name: 'Offers Pending',
        url: '/practice/offerPending',
        icon: 'fa fa-briefcase'
      },
      {
        name: 'Bids Received',
        url: '/practice/bided',
        icon: 'fa fa-handshake-o'
      },
    ]
  },
  {
    name: 'Staffs',
    url: '/staffs',
    icon: 'fa fa-users',
    children: [
      {
        name: 'Find Staffs',
        url: '/practice/staffs',
        icon: 'fa fa-user'
      },
      {
        name: 'Favorites Staffs',
        url: '/practice/favorites-staffs',
        icon: 'fa fa-star-o'
      },
      {
        name: 'Hired staffs',
        url: '/practice/hired-staffs',
        icon: 'fa fa-user'
      },
      {
        name: 'Message',
        url: '/practice/message',
        icon: 'fa fa-comment'
      },
    ]
  },
  {
    name: 'My Contracts',
    url: '/practice/contracts',
    icon: 'fa fa-connectdevelop'
  },
  {
    name: 'Payment',
    url: '/payment',
    icon: 'fa fa-money',
    children: [
      {
        name: 'Add Account',
        url: '/practice/payment/add-account',
        icon: 'fa fa-money'
      },
      {
        name: 'Pending payment',
        url: '/practice/pending-payment',
        icon: 'fa fa-money'
      },
      {
        name: 'Past Payment',
        url: '/practice/past-payment',
        icon: 'fa fa-money'
      },
      {
        name: 'Timesheet',
        url: '/staff/bided',
        icon: 'fa  fa-calendar-times-o'
      },
    ]
  },
  {
    name: 'Reports & Statistics',
    url: '/practice/bided',
    icon: 'fa fa-files-o'
  },
]; */


export const staffNavItems: NavData[] = [{
    name: 'Dashboard',
    url: '/staff/dashboard',
    icon: 'fa fa-tachometer'
  },
  {
    name: 'Profile',
    url: '/staff/profile',
    icon: 'fa fa-user'
  },
  /*   {
      name: 'Bids',
      url: '/staff/bids',
      icon: 'fa fa-user',
      children: [{
          name: 'My Bids',
          url: '/staff/bids/mybids',
          icon: 'fa fa-list',
        },
        {
          name: 'Submitted',
          url: '/staff/bids/submitted',
          icon: 'fa fa-list',
        },
        {
          name: 'Active',
          url: '/staff/bids/active',
          icon: 'fa fa-list',
        },
        {
          name: 'Declined',
          url: '/staff/bids/declined',
          icon: 'fa fa-list',
        },
        {
          name: 'Offer Received',
          url: '/staff/bids/offer-received',
          icon: 'fa fa-list',
        },
        {
          name: 'Invitation Received',
          url: '/staff/bids/invitation-received',
          icon: 'fa fa-list',
        }
      ]
    }, */
  {
    // name: 'Search Jobs',
    name: 'Marketplace',
    url: '/job-listing',
    icon: 'fa fa-search',
    // children: [{
    //   name: 'Favorites',
    //   url: '/staff/favorites-jobs',
    //   icon: 'fa fa-star-o'
    // }]
  },
  {
      name: 'Favorites',
      url: '/staff/favorites-jobs',
      icon: 'fa fa-star-o'
  },
  // {
  //   name: 'Offers',
  //   url: '/offer',
  //   icon: 'fa fa-handshake-o',
  //   children: [
  //       {
  //         name: 'Invitations',
  //         url: '/staff/offer-received',
  //         icon: 'fa fa-list'
  //       },
  //       {
  //       name: 'Applications',
  //       url: '/staff/offer-sent',
  //       icon: 'fa fa-list'
  //     },
  //   ]
  // },
  // {
  //   name: 'Offer Received',
  //   url: '/staff/offer-received',
  //   icon: 'fa fa-list',
  // },
  
  {
    name: 'Invitations',
    url: '/staff/offer-received',
    icon: 'fa fa-list'
  },
  {
  name: 'Applications',
  url: '/staff/offer-sent',
  icon: 'fa fa-list'
  },
  {
    name: 'My Assignments',
    url: '/staff/assignments',
    icon: 'fa fa-tasks'
  },

  {
    name: 'Messages',
    url: '/messaging',
    icon: 'fa fa-comment'
  },
  // {
  //   name: 'FAQ',
  //   url: '/staff/all-contracts',
  //   icon: 'fa-question-circle-o'
  // },
  {
    name: 'Payments',
    url: '/staff/paymentList',
    icon: 'fa fa-money',
    // children: []
  },
  {
    name: 'Analytics',
    url: '/staff/analytics',
    icon: 'fa fa-line-chart'
  },
];
/* export const staffNavItems: NavData[] = [
  {
    name: 'Dashboard',
    url: '/staff/dashboard',
    icon: 'fa fa-tachometer'
  },
  {
    name: 'Profile',
    url: '/staff/profile',
    icon: 'fa fa-user'
  },
  {
    name: 'Jobs',
    url: '/jobs',
    icon: 'fa fa-briefcase',
    children: [
      {
        name: 'Search jobs',
        url: '/staff/Search-jobs',
        icon: 'fa fa-search'
      },
      {
        name: 'Favorites Jobs',
        url: '/staff/favorites-jobs',
        icon: 'fa fa-star-o'
      },
      {
        name: 'Offers Received',
        url: '/staff/job-posts',
        icon: 'fa fa-hourglass-end'
      },
      {
        name: 'Accepted Jobs',
        url: '/staff/offerPending',
        icon: 'fa fa-handshake-o'
      },
      {
        name: 'Past jobs',
        url: '/staff/past-Jobs',
        icon: 'fa fa-briefcase'
      },
    ]
  },
  {
    name: 'Message',
    url: '/staff/message',
    icon: 'fa fa-comment'
  },
  {
    name: 'My Contracts',
    url: '/staff/all-contracts',
    icon: 'fa fa-connectdevelop'
  },
  {
    name: 'Work Diary',
    url: '/staff/work-diary',
    icon: 'fa fa-file-text-o'
  },
  {
    name: 'Payment',
    url: '/payment',
    icon: 'fa fa-money',
    children: [
      {
        name: 'Pending payment',
        url: '/staff/pending-payment',
        icon: 'fa fa-money'
      },
      {
        name: 'Past Payment',
        url: '/staff/past-payment',
        icon: 'fa fa-money'
      },
      {
        name: 'Timesheet',
        url: '/staff/bided',
        icon: 'fa  fa-calendar-times-o'
      },
    ]
  },
  {
    name: 'Reports & Statistics',
    url: '/staff/bided',
    icon: 'fa fa-files-o'
  },
]; */
