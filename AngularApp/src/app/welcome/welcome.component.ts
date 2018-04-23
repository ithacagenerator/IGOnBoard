import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ErrorSnackBarComponent } from '../error-snack-bar/error-snack-bar.component';

import { ErrorStateMatcher } from '@angular/material/core';
import { MemberDataService } from '../services/member-data.service';
import { ApiService } from '../services/api.service';
import { LoaderService } from '../services/loader.service';

import * as wildcard from './disposable-email-wildcard';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
  emailFormControl;
  firstnameFormControl = new FormControl('', [Validators.required]);
  lastnameFormControl = new FormControl('', [Validators.required]);
  phoneFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/(\(?[0-9]{3}\)?-?\s?[0-9]{3}-?[0-9]{4})/)
  ]);
  // addressFormControl = new FormControl('', [Validators.required]);

  biodataForm: FormGroup;

  getEmailErrorMessage() {
    return this.emailFormControl.hasError('required') ? 'You must enter a value' :
      this.emailFormControl.hasError('email') || this.emailFormControl.hasError('pattern') ?
        'Not a valid email' : '';
  }
  getPhoneErrorMessage() {
    return this.phoneFormControl.hasError('required') ? 'You must enter a value' :
      this.phoneFormControl.hasError('pattern') ? 'Format must be (xxx) xxx-xxxx' : '';
  }
  getRequiredErrorMessage(field) {
    return this.biodataForm.get(field).hasError('required') ? 'You must enter a value' : '';
  }

  constructor(
    private loaderService: LoaderService,
    public _memberdata: MemberDataService,
    private _api: ApiService,
    private _router: Router,
    private _snackBar: MatSnackBar) {
      const patternList = wildcard.emails.map(v => v.replace('.', '\\.'));
      this.emailFormControl = new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern(
          new RegExp(`^(?!((.*${patternList.join(')|(.*')})))`))
        // pattern is the anti-set of known disposable email domains
      ]);

      this.biodataForm = new FormGroup({
        email: this.emailFormControl,
        firstname: this.firstnameFormControl,
        lastname: this.lastnameFormControl,
        phone: this.phoneFormControl
        // address: this.addressFormControl
      });
    }

  handleNext() {
    const fields: any = {};
    this.loaderService.display(true);
    Object.keys(this.biodataForm.controls).forEach(k => {
      fields[k] = `${this.biodataForm.controls[k].value}`.trim();
    });
    fields.basic_info_complete = true;
    this._memberdata.updateFields(fields);
    this._api.requestEmailConfirmation()
    .then(res => {
      this.loaderService.display(false);
      this._memberdata.setBasicInformationComplete(true);
      this._router.navigate(['/confirm-email']);
    })
    .catch(res => {
      this.loaderService.display(false);
      this._snackBar.openFromComponent(ErrorSnackBarComponent, {
        data: res && res.error && res.error.error ? res.error.error : `Unexpected Error Status Code ${res.status}`,
        duration: 2000
      });
    });
  }

  checkForRegistrationInProgress() {
    if (this.emailFormControl.valid) {
      this._api.loadMemberRecord()
      .then(member => {
        console.log(member);
      })
      .catch(err => {}); // swallow errors here
    }
  }

}
