import { NgModule } from '@angular/core';
import { PreloadAllModules, PreloadingStrategy, RouterModule, Routes } from '@angular/router';
import { DefaultLayoutComponent } from './default-layout.component';
import { AuthGuard } from '../../shared-ui/guard/auth.guard';
import { RouteGuard } from '../../shared-ui/guard/route.guard';
import { AdminRouteGuard } from '../../shared-ui/guard/adminRoute.guard';

const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      {
        path: 'dashboard',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/dashboard/dashboard.module'
          ).then(mod => mod.DashboardModule)
      },
      {
        path: 'practiceType',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/practice/practice.module'
          ).then(mod => mod.PracticeModule)
      },
      {
        path: 'skills',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/admin/skills/skills/skills.module').then(
            mod => mod.SkillsModule
          )
      },
      {
        path: 'positionType',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/position-type/position-type.module'
          ).then(mod => mod.PositionTypeModule)
      },
      {
        path: 'allContracts',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/all-contracts/all-contracts.module'
          ).then(mod => mod.AllContractsModule)
      },
      {
        path: 'expiredLicense',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/expired-license/expired-license.module'
          ).then(mod => mod.ExpiredLicenseModule)
      },
      {
        path: 'promoCode',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/promo-code/promo-code.module'
          ).then(mod => mod.PromoCodeModule)
      },
      {
        path: 'country',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/location/country/country.module'
          ).then(mod => mod.CountryModule)
      },
      {
        path: 'state',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/location/state/state.module'
          ).then(mod => mod.StateModule)
      },
      {
        path: 'city',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/location/city/city.module'
          ).then(mod => mod.CityModule)
      },
      {
        path: 'zipcode',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/location/zipcode/zipcode.module'
          ).then(mod => mod.ZipcodeModule)
      },
      {
        path: 'importExcel',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/location/import-excel/import-excel.module'
          ).then(mod => mod.ImportExcelModule)
      },
      {
        path: 'certificates',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/certificates/certificates/certificates.module'
          ).then(mod => mod.CertificatesModule)
      },
      {
        path: 'certificateType',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/certificates/certificate-type/certificate-type.module'
          ).then(mod => mod.CertificateTypeModule)
      },
      {
        path: 'skillType',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/skills/skill-type/skill-type.module'
          ).then(mod => mod.SkillTypeModule)
      },
      {
        path: 'certificates',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/certificates/certificates/certificates.module'
          ).then(mod => mod.CertificatesModule)
      },
      {
        path: 'experience',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/experience/experience.module'
          ).then(mod => mod.ExperienceModule)
      },
      {
        path: 'licenseType',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/license-type/license-type.module'
          ).then(mod => mod.LicenseTypeModule)
      },
      {
        path: 'specialties',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/specialties/specialties.module'
          ).then(mod => mod.SpecialtiesModule)
      },
      {
        path: 'advertisement',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/advertisement/advertisement.module'
          ).then(mod => mod.AdvertisementModule)
      },
      {
        path: 'paymentList',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/payment/payment-list/payment-list.module'
          ).then(mod => mod.PaymentListModule)
      },
      {
        path: 'accessLevel',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/admin/access-level/access-level.module'
          ).then(mod => mod.AccessLevelModule)
      },
      {
        path: 'users/practice',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/admin/users/users-practice/users-practice.module').then(
            mod => mod.UsersPracticeModule
          )
      },
      {
        path: 'users/staff',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/admin/users/users-staff/users-staff.module').then(
            mod => mod.UsersStaffModule
          )
      },
      {
        path: 'users/subAdmin',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/admin/users/users-admin/users-admin.module').then(
            mod => mod.UsersAdminModule
          )
      },
      /* {
        path: 'users',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/admin/users/users.module').then(
            mod => mod.UsersModule
          )
      }, */
      {
        path: 'disputes',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/admin/disputes/disputes.module').then(
            mod => mod.DisputesModule
          )
      },

      {
        path: 'all-blogs',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/admin/blogs/all-blogs/all-blogs.module').then(
            mod => mod.AllBlogsModule
          )
      },
      {
        path: 'blog/add-blog',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/admin/blogs/create-blog/create-blog.module').then(
            mod => mod.CreateBlogModule
          )
      },
      {
        path: 'blog/edit-blog/:id',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/admin/blogs/create-blog/create-blog.module').then(
            mod => mod.CreateBlogModule
          )
      },
      {
        path: 'blog/categories',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/admin/blogs/categories/categories.module').then(
            mod => mod.CategoriesModule
          )
      },
      {
        path: 'email-templates/list',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/admin/email-templates/template-list/template-list.module').then(
            mod => mod.TemplateListModule
          )
      },
      {
        path: 'email-templates/add',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/admin/email-templates/create-template/create-template.module').then(
            mod => mod.CreateTemplateModule
          )
      },
      {
        path: 'email-templates/edit/:id',
        canActivateChild: [AdminRouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/admin/email-templates/create-template/create-template.module').then(
            mod => mod.CreateTemplateModule
          )
      },


      // practice Routing
      {
        path: 'practice/dashboard',
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/practice-dashboard/practice-dashboard.module'
          ).then(mod => mod.PracticeDashboardModule)
      },
      {
        path: 'practice/profile',
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/practice-profile/practice-profile.module'
          ).then(mod => mod.PracticeProfileModule)
      },
      {
        path: 'practice/profile/:tabStep',
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/practice-profile/practice-profile.module'
          ).then(mod => mod.PracticeProfileModule)
      },
      {
        path: 'practice/job-posts',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/jobs/job-posts/job-posts.module'
          ).then(mod => mod.JobPostsModule)
      },
      {
        path: 'practice/sent-offers',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/offers/offer-sent/offer-sent.module'
          ).then(mod => mod.OfferSentModule)
      },
      {
        path: 'practice/received-offers',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/offers/offer-received/offer-received.module'
          ).then(mod => mod.OfferReceivedModule)
      },
      {
        path: 'practice/post-job',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/jobs/job-posts/job-posts.module'
          ).then(mod => mod.JobPostsModule)
      },
      {
        path: 'practice/job-drafts',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/jobs/job-drafts/job-drafts.module'
          ).then(mod => mod.JobDraftsModule)
      },
      {
        path: 'practice/paymentList',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/payment/payment-list/payment-list.module'
          ).then(mod => mod.PaymentListModule)
      },
      // {
      //   path: 'practice/job-invites',
      //   canActivateChild : [RouteGuard],
      //   loadChildren: () =>
      //     import(
      //       '../../views/dashboard-pages/dental-practice/jobs/job-invites/job-invites.module'
      //     ).then(mod => mod.JobInvitesModule)
      // },
      // {
      //   path: 'practice/payment/add-account',
      //   canActivateChild : [RouteGuard],
      //   loadChildren: () =>
      //     import(
      //       '../../views/dashboard-pages/dental-practice/payment/add-account/add-account.module'
      //     ).then(mod => mod.AddAccountModule)
      // },
      {
        path: 'practice/staffs',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/home-pages/dental-staff-list/dental-staff-list.module'
          ).then(mod => mod.DentalStaffListModule)
      },
      {
        path: 'practice/favorites-staffs',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/staff-favourite/staff-favourite.module'
          ).then(mod => mod.StaffFavouriteModule)
      },
      {
        path: 'practice/hired-staffs',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/home-pages/dental-staff-list/dental-staff-list.module'
          ).then(mod => mod.DentalStaffListModule)
      },
      {
        path: 'practice/view-staff-profile',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/home-pages/staff-view-profile/staff-view-profile.module'
          ).then(mod => mod.StaffViewProfileModule)
      },
      {
        path: 'practice/job-details/:jobId',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/jobs/job-details/job-details.module'
          ).then(mod => mod.JobDetailsModule)
      },
      {
        path: 'practice/offer-details/:offerId',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/offers/offer-details/offer-details.module'
          ).then(mod => mod.OfferDetailsModule)
      },
      {
        path: 'practice/analytics',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/analytics/analytics.module'
          ).then(mod => mod.AnalyticsModule)
      },
      /* {
        path: 'practice/messaging',
        canActivateChild : [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/messaging/messaging.module'
          ).then(mod => mod.MessagingModule)
      }, */
      {
        path: 'practice/contracts',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-practice/contracts/contracts.module'
          ).then(mod => mod.ContractsModule)
      },

      // staff Routing
      {
        path: 'staff/dashboard',
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-staff/staff-dashboard/staff-dashboard.module'
          ).then(mod => mod.StaffDashboardModule)
      },
      {
        path: 'staff/customize-availability',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-staff/availability/availability.module'
          ).then(mod => mod.AvailabilityModule)
      },
      {
        path: 'staff/profile',
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-staff/staff-profile/staff-profile.module'
          ).then(mod => mod.StaffProfileModule)
      },
      {
        path: 'staff/profile/:tabStep',
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-staff/staff-profile/staff-profile.module'
          ).then(mod => mod.StaffProfileModule)
      },

      {
        path: 'account-settings',
        // canActivateChild : [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/account-settings/account-settings.module'
          ).then(mod => mod.AccountSettingsModule)
      },
      {
        path: 'messaging',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/messaging/messaging.module'
          ).then(mod => mod.MessagingModule)
      },
      {
        path: 'messaging/:threadID/:jobID',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/messaging/messaging.module'
          ).then(mod => mod.MessagingModule)
      },
      {
        path: 'notifications',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/notifications/notifications.module'
          ).then(mod => mod.NotificationsModule)
      },
      {
        path: 'staff/Search-jobs',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import('../../views/home-pages/job-listing/job-listing.module').then(
            mod => mod.JobListingModule
          )
      },
      {
        path: 'staff/favorites-jobs',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import('../../views/dashboard-pages/dental-staff/favorite-jobs/favorite-jobs.module').then(
            mod => mod.FavoriteJobsModule
          )
      },
      {
        path: 'staff/job-details',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import('../../views/home-pages/job-details/job-details.module').then(
            mod => mod.JobDetailsModule
          )
      },
      {
        path: 'staff/paymentList',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-staff/payment/payment-list/payment-list.module'
          ).then(mod => mod.PaymentListModule)
      },
      {
        path: 'staff/offer-received',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-staff/offers/offer-received/offer-received.module'
          ).then(mod => mod.OfferReceivedModule)
      },
      {
        path: 'staff/offer-sent',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-staff/offers/offer-sent/offer-sent.module'
          ).then(mod => mod.OfferSentModule)
      },
      {
        path: 'staff/offer-details/:offerId',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-staff/offers/offer-details/offer-details.module'
          ).then(mod => mod.OfferDetailsModule)
      },
      {
        path: 'staff/assignments',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-staff/my-assignment/my-assignment.module'
          ).then(mod => mod.MyAssignmentModule)
      },
      {
        path: 'staff/work-diary',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            '../../views/dashboard-pages/dental-staff/work-diary/work-diary.module'
          ).then(mod => mod.WorkDiaryModule)
      },
      {
        path: 'staff/analytics',
        canActivateChild: [RouteGuard],
        loadChildren: () =>
          import(
            './../../views/dashboard-pages/dental-staff/analytics/analytics.module'
          ).then(mod => mod.AnalyticsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    {
      preloadingStrategy: PreloadAllModules
    }
    )],
  exports: [RouterModule]
})
export class DefaultRoutingModule { }
