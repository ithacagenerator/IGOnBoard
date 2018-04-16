import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import {
  MatButtonModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatInputModule,
  MatSnackBarModule,
  MatDialogModule,
  MatProgressSpinnerModule
} from '@angular/material';
import { OverlayContainer } from '@angular/cdk/overlay';

import { WelcomeComponent } from './welcome/welcome.component';
import { NavLinksComponent } from './nav-links/nav-links.component';
import { MembershipPoliciesComponent } from './membership-policies/membership-policies.component';
import { WaiverComponent } from './waiver/waiver.component';
import { PaymentComponent } from './payment/payment.component';
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component';

import { MemberDataService } from './services/member-data.service';
import { ApiService } from './services/api.service';
import { ErrorSnackBarComponent } from './error-snack-bar/error-snack-bar.component';
import { LoaderService } from './services/loader.service';
import { AdditionalInfoComponent } from './additional-info/additional-info.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    NavLinksComponent,
    MembershipPoliciesComponent,
    WaiverComponent,
    PaymentComponent,
    EmailConfirmationComponent,
    ErrorSnackBarComponent,
    AdditionalInfoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  providers: [
    OverlayContainer,
    MemberDataService,
    ApiService,
    LoaderService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ErrorSnackBarComponent
  ]
})
export class AppModule {
  constructor(overlayContainer: OverlayContainer) {
    overlayContainer.getContainerElement().classList.add('ig-theme');
  }
}
