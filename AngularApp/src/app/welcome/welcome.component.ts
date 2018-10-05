import { Component, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ErrorSnackBarComponent } from '../error-snack-bar/error-snack-bar.component';

import { ErrorStateMatcher } from '@angular/material/core';
import { MemberDataService } from '../services/member-data.service';
import { ApiService } from '../services/api.service';
import { LoaderService } from '../services/loader.service';

import * as moment from 'moment';
import * as wildcard from './disposable-email-wildcard';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements AfterViewInit {
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
    private _cd: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _util: UtilService) {
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

    }

  handleNext() {
    const fields: any = this._util.collapseFormGroup(this.biodataForm);
    this.loaderService.display(true);
    this._memberdata.updateFields(fields);

    return this._api.requestEmailConfirmation()
    .then(res => {
      this.loaderService.display(false);
      this._router.navigate(['/confirm-email']);
    })
    .catch(res => {
      this.loaderService.display(false);
      const hasServerErrorMessage = (res.error && res.error.error);
      if (hasServerErrorMessage && (res.error.error === 'Member is already validated')) {
        this._util.navigateToLogicalNextStep(this._router);
      } else {
        this._snackBar.openFromComponent(ErrorSnackBarComponent, {
          data: this._util.errorMessage(res.error),
          duration: 2000
        });
      }
    });
  }

  checkForRegistrationInProgress($event) {
    return new Promise((r, j)  => {
      if (this.emailFormControl.valid) {
        this._api.loadMemberRecord()
        .then((member: any) => {
          if (member.graduation) {
            member.graduation = moment(member.graduation, 'M/D/YYYY');
          }
          this._memberdata.updateFields(member);
          r();
        })
        .catch(err => { r(); }); // swallow errors here
      } else {
        r();
      }
    });
  }

  ngAfterViewInit() {
    this._routeParams.params.subscribe( params => {
      if (params['email']) {
        this._memberdata.email = params['email'];
        this._cd.detectChanges();

        if (this.biodataForm.valid) {
          this.checkForRegistrationInProgress(null)
          .then(() => {
            this.handleNext();
          });
        }
      }
    });
  }
}
