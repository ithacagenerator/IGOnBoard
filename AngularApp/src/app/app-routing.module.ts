
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WelcomeComponent } from './welcome/welcome.component';
import { MembershipPoliciesComponent } from './membership-policies/membership-policies.component';
import { WaverComponent } from './waver/waver.component';
import { PaymentComponent } from './payment/payment.component';
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component';

const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'membership-policies', component: MembershipPoliciesComponent },
  { path: 'waver', component: WaverComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'confirm-email', component: EmailConfirmationComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
