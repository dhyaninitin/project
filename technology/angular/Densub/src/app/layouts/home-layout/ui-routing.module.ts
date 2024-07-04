import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UiComponent } from './ui.component';
import { RouteGuard } from '../../shared-ui/guard/route.guard';

const routes: Routes = [
  {
    path: '',
    component: UiComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../../views/home-pages/home/home.module').then(mod => mod.HomeModule)
      },

      {
        path: 'privacy-policy',
        loadChildren: () => import('../../views/home-pages/privacy-policy/privacy-policy.module').then(mod => mod.PrivacyPolicyModule)
      },

      {
        path: 'dental-practices',
        // canActivateChild : [RouteGuard],
        loadChildren: () =>
        import('../../views/home-pages/dental-practice-list/dental-practice-list.module').then(mod => mod.DentalPracticeListModule)
      },
      {
        path: 'dental-staffs',
        // canActivateChild : [RouteGuard],
        loadChildren: () =>
        import('../../views/home-pages/dental-staff-list/dental-staff-list.module').then(mod => mod.DentalStaffListModule)
      },
      // {
      //   path: 'dental-staffs/:search',
      //   canActivateChild : [RouteGuard],
      //   loadChildren: () =>
      //   import('../../views/home-pages/dental-staff-list/dental-staff-list.module').then(mod => mod.DentalStaffListModule)
      // },
      {
        path: 'contact-us',
        loadChildren: () => import('../../views/home-pages/contact-us/contact-us.module').then(mod => mod.ContactUsModule)
      },
      {
        path: 'about-us',
        loadChildren: () => import('../../views/home-pages/about-us/about-us.module').then(mod => mod.AboutUsModule)
      },
      {
        path: 'staff-profile/:userId',
        // canActivateChild : [RouteGuard],
        loadChildren: () =>
        import('../../views/home-pages/staff-view-profile/staff-view-profile.module').then(mod => mod.StaffViewProfileModule)
      },
      /* RouteGuard */
      {
        path: 'practice-profile/:userId',
        canActivateChild : [],
        loadChildren: () =>
        import('../../views/home-pages/practice-view-profile/practice-view-profile.module').then(mod => mod.PracticeViewProfileModule)
      },
      {
        path: 'faq',
        loadChildren: () => import('../../views/home-pages/faq/faq.module').then(mod => mod.FaqModule)
      },

      {
        path: 'terms-of-use',
        loadChildren: () => import('../../views/home-pages/terms-of-use/terms-of-use.module').then(mod => mod.TermsOfUseModule)
      },

      {
        path: 'blogs',
        loadChildren: () => import('../../views/home-pages/blog/blogs/blogs.module').then(mod => mod.BlogsModule)
      },
      {
        path: 'blogs/:categoryId',
        loadChildren: () => import('../../views/home-pages/blog/blogs/blogs.module').then(mod => mod.BlogsModule)
      },

      {
        path: 'blogs/single-blog/:blogId',
        loadChildren: () => import('../../views/home-pages/blog/single-blog/single-blog.module').then(mod => mod.SingleBlogModule)
      },

      {
        path: 'blogs/blog-category',
        loadChildren: () => import('../../views/home-pages/blog/blog-category/blog-category.module').then(mod => mod.BlogCategoryModule)
      },

      {
        path: 'testimonials',
        loadChildren: () => import('../../views/home-pages/testimonials/testimonials.module').then(mod => mod.TestimonialsModule)
      },

      {
        path: 'job-listing',
        // canActivateChild : [RouteGuard],
        loadChildren: () => import('../../views/home-pages/job-listing/job-listing.module').then(mod => mod.JobListingModule)
      },
      {
        path: 'job-details/:jobId',
        // canActivateChild : [RouteGuard],
        loadChildren: () => import('../../views/home-pages/job-details/job-details.module').then(mod => mod.JobDetailsModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UiRoutingModule {}
