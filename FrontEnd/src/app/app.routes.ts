

import { Routes } from '@angular/router';

export const routes: Routes = [

  // =========================
  // PUBLIC ROUTES
  // =========================

  {
    path: '',
    loadComponent: () =>
      import('./features/public/pages/home/home')
        .then(m => m.Home)
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/public/pages/login/login')
        .then(m => m.Login)
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./features/public/pages/register/register')
        .then(m => m.Register)
  },


  // =========================
  // CANDIDATE ROUTES
  // =========================

  
{
  path: 'candidate',
  loadComponent: () =>
    import('./layouts/candidate-layout/candidate-layout')
      .then(m => m.CandidateLayout),

  children: [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
    {
      path: 'dashboard',
      loadComponent: () =>
        import('./features/candidate/pages/dashboard/dashboard')
          .then(m => m.Dashboard)
    },
    {
      path: 'profile',
      loadComponent: () =>
        import('./features/candidate/pages/profile/profile')
          .then(m => m.Profile)
    },
    {
      path: 'jobs',
      loadComponent: () =>
        import('./features/candidate/pages/job-search/job-search')
          .then(m => m.JobSearch)
    },
    {
      path: 'jobs/:id',
      loadComponent: () =>
        import('./features/candidate/pages/job-details/job-details')
          .then(m => m.JobDetails)
    },
    {
      path: 'jobs/:id/apply',
      loadComponent: () =>
        import('./features/candidate/pages/apply/apply')
          .then(m => m.Apply)
    },
    {
      path: 'applications',
      loadComponent: () =>
        import('./features/candidate/pages/applications/applications')
          .then(m => m.Applications)
    },
    {
      path: 'applications/:id',
      loadComponent: () =>
        import('./features/candidate/pages/application-details/application-details')
          .then(m => m.ApplicationDetails)
    }
  ]
},

  // =========================
  // COMPANY ROUTES
  // =========================

  
{
  path: 'company',
  loadComponent: () =>
    import('./layouts/company-layout')
      .then(m => m.CompanyLayout),

  children: [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
    {
      path: 'dashboard',
      loadComponent: () =>
        import('./features/company/pages/dashboard/dashboard')
          .then(m => m.Dashboard)
    },
    {
      path: 'jobs',
      loadComponent: () =>
        import('./features/company/pages/manage-jobs/manage-jobs')
          .then(m => m.ManageJobs)
    },
    {
      path: 'jobs/create',
      loadComponent: () =>
        import('./features/company/pages/post-job/post-job')
          .then(m => m.PostJob)
    },
    {
      path: 'jobs/:id',
      loadComponent: () =>
        import('./features/candidate/pages/job-details/job-details')
          .then(m => m.JobDetails)
    },
    {
      path: 'jobs/:id/applicants',
      loadComponent: () =>
        import('./features/company/pages/applicants/applicants')
          .then(m => m.Applicants)
    },
    {
      path: 'applicants',
      loadComponent: () =>
        import('./features/company/pages/applicants/applicants')
          .then(m => m.Applicants)
    },
    {
      path: 'applicants/:id',
      loadComponent: () =>
        import('./features/company/pages/applicant-details/applicant-details')
          .then(m => m.ApplicantDetails)
    }
  ]
},

      // {
      //   path: 'shortlisted',
      //   loadComponent: () =>
      //     import('./features/company/pages/shortlisted/shortlisted')
      //       .then(m => m.ShortlistedComponent)
      // },

      // {
      //   path: 'profile',
      //   loadComponent: () =>
      //     import('./features/company/pages/profile/profile')
      //       .then(m => m.Profile)
      // }

    
  


  // =========================
  // ADMIN ROUTES
  // =========================

  {
    path: 'admin',
    children: [

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/pages/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
  path: 'users',
  loadComponent: () =>
    import('./features/admin/pages/users/users')
      .then(m => m.Users)
},
{
  path: 'companies',
  loadComponent: () =>
    import('./features/admin/pages/company/company')
      .then(m => m.Company)
}
    ]
    },
]
