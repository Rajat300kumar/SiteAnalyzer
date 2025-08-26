import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ProjectsComponent } from './projects/projects.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot', component: ForgotPasswordComponent },
  { path: 'siteanalyzer', component: DashboardComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: '**', redirectTo: '/siteanalyzer' },//pvp
  // { path: '**', redirectTo: '/review' },//review
];
