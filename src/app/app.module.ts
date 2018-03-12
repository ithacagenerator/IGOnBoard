import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import {
  MatButtonModule,
  MatCheckboxModule
} from '@angular/material';
import { OverlayContainer } from '@angular/cdk/overlay';

import { WelcomeComponent } from './welcome/welcome.component';
import { NavLinksComponent } from './nav-links/nav-links.component';
import { MembershipPoliciesComponent } from './membership-policies/membership-policies.component';
import { WaverComponent } from './waver/waver.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    NavLinksComponent,
    MembershipPoliciesComponent,
    WaverComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  providers: [OverlayContainer],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(overlayContainer: OverlayContainer) {
    overlayContainer.getContainerElement().classList.add('ig-theme');
  }
}
