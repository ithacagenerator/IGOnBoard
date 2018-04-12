import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import {
  MatButtonModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatInputModule
} from '@angular/material';
import { OverlayContainer } from '@angular/cdk/overlay';

import { WelcomeComponent } from './welcome/welcome.component';
import { NavLinksComponent } from './nav-links/nav-links.component';
import { MembershipPoliciesComponent } from './membership-policies/membership-policies.component';
import { WaverComponent } from './waver/waver.component';
import { PaymentComponent } from './payment/payment.component';
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component';

import { MemberDataService } from './services/member-data.service';
import { ApiService } from './services/api.service';


@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    NavLinksComponent,
    MembershipPoliciesComponent,
    WaverComponent,
    PaymentComponent,
    EmailConfirmationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    OverlayContainer,
    MemberDataService,
    ApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(overlayContainer: OverlayContainer) {
    overlayContainer.getContainerElement().classList.add('ig-theme');
  }
}
