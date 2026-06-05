import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'tickets',
        loadComponent: () => import('./features/tickets/ticket-list.component').then(m => m.TicketListComponent) },
      { path: 'tickets/mine',
        canActivate: [roleGuard(['support_l1','support_l2','supervisor'])],
        loadComponent: () => import('./features/tickets/ticket-list.component').then(m => m.TicketListComponent) },
      { path: 'tickets/unassigned',
        canActivate: [roleGuard(['support_l1','support_l2','supervisor'])],
        loadComponent: () => import('./features/tickets/ticket-list.component').then(m => m.TicketListComponent) },
      { path: 'tickets/center',
        canActivate: [roleGuard(['supervisor'])],
        loadComponent: () => import('./features/tickets/ticket-list.component').then(m => m.TicketListComponent) },
      { path: 'tickets/:id',
        loadComponent: () => import('./features/tickets/ticket-detail.component').then(m => m.TicketDetailComponent) },
      { path: 'users',
        canActivate: [roleGuard(['supervisor'])],
        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent) },
      { path: 'companies',
        canActivate: [roleGuard(['supervisor'])],
        loadComponent: () => import('./features/companies/companies.component').then(m => m.CompaniesComponent) },
      { path: 'service-centers',
        canActivate: [roleGuard(['supervisor'])],
        loadComponent: () => import('./features/service-centers/service-centers.component').then(m => m.ServiceCentersComponent) },
      { path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'forbidden',
        loadComponent: () => import('./features/auth/forbidden.component').then(m => m.ForbiddenComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
