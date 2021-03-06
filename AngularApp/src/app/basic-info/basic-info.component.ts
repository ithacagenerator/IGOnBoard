import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  giftCodeFormControl = new FormControl('', []);
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
    public _util: UtilService,
    private _cd: ChangeDetectorRef) {
    this.biodataForm = new FormGroup({
      firstname: this.firstnameFormControl,
      lastname: this.lastnameFormControl,
      phone: this.phoneFormControl,
      giftCode: this.giftCodeFormControl,
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

  clearDefaultPhone() {
    if (this._memberdata.phone === '(xxx) xxx-xxxx') {
      this._memberdata.phone = '';
      this._cd.detectChanges();
    }
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
          data: this._util.errorMessage(res.error),
          duration: 2000
        });
      }
    })
    .catch(error => {
      this.loaderService.display(false);
      this._snackBar.openFromComponent(ErrorSnackBarComponent, {
        data: this._util.errorMessage(error),
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
