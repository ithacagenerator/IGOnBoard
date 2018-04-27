import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ErrorSnackBarComponent } from '../error-snack-bar/error-snack-bar.component';

import { ErrorStateMatcher } from '@angular/material/core';
import { MemberDataService } from '../services/member-data.service';
import { ApiService } from '../services/api.service';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent {
  firstnameFormControl = new FormControl('', [Validators.required]);
  lastnameFormControl = new FormControl('', [Validators.required]);
  phoneFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/(\(?[0-9]{3}\)?-?\s?[0-9]{3}-?[0-9]{4})/)
  ]);
  // addressFormControl = new FormControl('', [Validators.required]);

  biodataForm: FormGroup;

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
      this.biodataForm = new FormGroup({
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
    return this._api.updateMemberRecord()
    .then((res: any) => {
      this.loaderService.display(false);
      this._memberdata.setBasicInformationComplete(true);
      const hasServerErrorMessage = (res && res.error && res.error.error);
      if (!hasServerErrorMessage) {
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
    })
    .catch(error => {
      this.loaderService.display(false);
      this._snackBar.openFromComponent(ErrorSnackBarComponent, {
        data: error && error.message ? error.message : `Unexpected Error Occurred`,
        duration: 2000
      });
    });
  }
}
