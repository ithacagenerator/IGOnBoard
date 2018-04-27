import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  biodataForm: FormGroup;

  getEmailErrorMessage() {
    return this.emailFormControl.hasError('required') ? 'You must enter a value' :
      this.emailFormControl.hasError('email') || this.emailFormControl.hasError('pattern') ?
        'Not a valid email' : '';
  }

  constructor(
    private loaderService: LoaderService,
    public _memberdata: MemberDataService,
    private _api: ApiService,
    private _router: Router,
    private _routeParams: ActivatedRoute,
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
        email: this.emailFormControl
      });

      this._routeParams.params.subscribe( params => {
        if (params['email']) {
          this._memberdata.email = params['email'];
          if (this.biodataForm.valid) {
            this.handleNext();
          }
        }
      });
    }

  handleNext() {
    const fields: any = {};
    this.loaderService.display(true);
    Object.keys(this.biodataForm.controls).forEach(k => {
      fields[k] = `${this.biodataForm.controls[k].value}`.trim();
    });

    this._memberdata.updateFields(fields);

    return this._api.requestEmailConfirmation()
    .then(res => {
      this.loaderService.display(false);
      this._router.navigate(['/confirm-email']);
    })
    .catch(res => {
      this.loaderService.display(false);
      const hasServerErrorMessage = (res && res.error && res.error.error);
      if (hasServerErrorMessage && (res.error.error === 'Member is already validated')) {
        if (!this._memberdata.membershipPoliciesComplete()) {
          this._router.navigate(['/membership-policies']);
        } else if (!this._memberdata.liabilityWaverComplete()) {
          this._router.navigate(['/waiver']);
        } else if (!this._memberdata.additionalInfoComplete()) {
          this._router.navigate(['/additional-info']);
        } else {
          this._router.navigate(['/payment']);
        }
      } else {
        this._snackBar.openFromComponent(ErrorSnackBarComponent, {
          data: hasServerErrorMessage ? res.error.error : `Unexpected Error Status Code ${res.status}`,
          duration: 2000
        });
      }
    });
  }

  checkForRegistrationInProgress($event) {
    if (this.emailFormControl.valid) {
      this._api.loadMemberRecord()
      .then(member => {
        this._memberdata.updateFields(member);
      })
      .catch(err => {}); // swallow errors here
    }
  }

}
