import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ErrorSnackBarComponent } from '../error-snack-bar/error-snack-bar.component';

import { ErrorStateMatcher } from '@angular/material/core';
import { MemberDataService } from '../services/member-data.service';
import { ApiService } from '../services/api.service';
import { LoaderService } from '../services/loader.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent implements OnDestroy {
  firstnameFormControl = new FormControl('', [Validators.required]);
  lastnameFormControl = new FormControl('', [Validators.required]);
  phoneFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/(\(?[0-9]{3}\)?-?\s?[0-9]{3}-?[0-9]{4})/)
  ]);
  // addressFormControl = new FormControl('', [Validators.required]);
  over18FormControl = new FormControl('', [Validators.required]);
  requestFinancialAidFormControl = new FormControl('', [Validators.required]);
  studentFormControl = new FormControl('', []);
  biodataForm: FormGroup;
  subscriptions = [];

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
    private _snackBar: MatSnackBar,
    private _util: UtilService) {
      this.biodataForm = new FormGroup({
        firstname: this.firstnameFormControl,
        lastname: this.lastnameFormControl,
        phone: this.phoneFormControl,
        over18: this.over18FormControl,
        requestFinancialAid: this.requestFinancialAidFormControl,
        student: this.studentFormControl
        // address: this.addressFormControl
      });

      this.subscriptions.push(this.biodataForm.statusChanges.subscribe((change) => {
        switch (change) {
          case 'INVALID':
            this._memberdata.setBasicInformationComplete(false);
            break;
          case 'VALID':
          this._memberdata.setBasicInformationComplete(true);
          break;
        }
      }));
    }

  handleNext() {
    const fields: any = this._util.collapseFormGroup(this.biodataForm);
    this.loaderService.display(true);

    fields.basic_info_complete = true;
    this._memberdata.updateFields(fields);
    return this._api.updateMemberRecord()
    .then((res: any) => {
      this.loaderService.display(false);
      this._memberdata.setBasicInformationComplete(true);
      const hasServerErrorMessage = (res && res.error && res.error.error);
      if (!hasServerErrorMessage) {
        this._util.navigateToLogicalNextStep(this._router);
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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
