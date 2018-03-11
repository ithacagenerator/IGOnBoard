import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import {
  MatButtonModule,
  MatCheckboxModule
} from '@angular/material';

import { WelcomeComponent } from './welcome/welcome.component';
import { NavLinksComponent } from './nav-links/nav-links.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    NavLinksComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
