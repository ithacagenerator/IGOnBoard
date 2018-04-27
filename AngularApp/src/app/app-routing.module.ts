
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WelcomeComponent } from './welcome/welcome.component';
import { MembershipPoliciesComponent } from './membership-policies/membership-policies.component';
import { WaiverComponent } from './waiver/waiver.component';
import { PaymentComponent } from './payment/payment.component';
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component';
import { AdditionalInfoComponent } from './additional-info/additional-info.component';
import { BasicInfoComponent } from './basic-info/basic-info.component';

const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'basic-info', component: BasicInfoComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'welcome/:email', component: WelcomeComponent },
  { path: 'membership-policies', component: MembershipPoliciesComponent },
  { path: 'waiver', component: WaiverComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'confirm-email', component: EmailConfirmationComponent },
  { path: 'additional-info', component: AdditionalInfoComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
