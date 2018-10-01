
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WelcomeComponent } from './welcome/welcome.component';
import { MembershipPoliciesComponent } from './membership-policies/membership-policies.component';
import { WaiverComponent } from './waiver/waiver.component';
import { PaymentComponent } from './payment/payment.component';
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component';
import { AdditionalInfoComponent } from './additional-info/additional-info.component';
import { BasicInfoComponent } from './basic-info/basic-info.component';
import { OptionalInfoComponent } from './optional-info/optional-info.component';
import { ThanksComponent } from './thanks/thanks.component';

import { AuthGuard } from './services/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'basic-info', component: BasicInfoComponent, canActivate: [AuthGuard] },
  { path: 'welcome/:email', component: WelcomeComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'membership-policies', component: MembershipPoliciesComponent, canActivate: [AuthGuard] },
  { path: 'waiver', component: WaiverComponent, canActivate: [AuthGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard] },
  { path: 'confirm-email', component: EmailConfirmationComponent, canActivate: [AuthGuard] },
  { path: 'additional-info', component: AdditionalInfoComponent, canActivate: [AuthGuard] },
  { path: 'optional-info', component: OptionalInfoComponent, canActivate: [AuthGuard] },
  { path: 'thanks/:correlationId', component: ThanksComponent },
  { path: 'thanks', component: ThanksComponent },
  { path: '**', redirectTo: '/welcome' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
