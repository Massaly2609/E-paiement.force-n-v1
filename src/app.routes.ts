import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ValidationQueueComponent } from './components/validation/validation-queue.component';
import { PaymentGatewayComponent } from './components/payments/payment-gateway.component';
import { ReportListComponent } from './components/reports/report-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'validation', component: ValidationQueueComponent },
  { path: 'payments', component: PaymentGatewayComponent },
  { path: 'reports', component: ReportListComponent },
  { path: '**', redirectTo: 'login' }
];