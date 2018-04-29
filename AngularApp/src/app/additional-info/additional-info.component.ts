import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MemberDataService } from '../services/member-data.service';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import * as moment from 'moment';
import { UtilService } from '../services/util.service';
import { MatSnackBar } from '@angular/material';
import { ApiService } from '../services/api.service';
import { LoaderService } from '../services/loader.service';
import { ErrorSnackBarComponent } from '../error-snack-bar/error-snack-bar.component';

export function validDateValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    let input = moment.isMoment(control.value) ? (<any> control.value)._i : null;
    if (input && (typeof input === 'object')) {
      input = `${input.month}/${input.date}/${input.year}`;
    }
    const illegalDate = !moment.isMoment(control.value) ||
      (moment.isMoment(control.value) &&
        (!control.value.isValid() ||
          !moment(input, 'M/D/YYYY').isValid() ||
          (moment(input, 'M/D/YYYY').format('M/D/YYYY') !== input)
        )
      );
    return illegalDate ? {'illegalDate': {value: control.value}} : null;
  };
}

@Component({
  selector: 'app-additional-info',
  templateUrl: './additional-info.component.html',
  styleUrls: ['./additional-info.component.scss']
})
export class AdditionalInfoComponent {

  schoolFormControl = new FormControl('', [Validators.required]);
  graduationFormControl = new FormControl('', [Validators.required, validDateValidator()]);
  studentForm: FormGroup;

  constructor(
    private loaderService: LoaderService,
    public _memberdata: MemberDataService,
    private _api: ApiService,
    private _router: Router,
    private _snackBar: MatSnackBar,
    public _util: UtilService) {
    this.studentForm = new FormGroup({
      school: this.schoolFormControl,
      graduation: this.graduationFormControl
    });
  }

  now() {
    return moment().format('M/D/YYYY');
  }

  getRequiredStudentErrorMessage(field) {
    return this.studentForm.get(field).hasError('required') ? 'You must enter a value' : 'Invalid date';
  }

  handleNextDisabled() {
    if (this._memberdata.student) {
      if (this.studentForm.invalid || !this._memberdata.studentid) {
        return true;
      }
    }
    return false;
  }

  handleNext() {
    let fields: any = {};
    fields = Object.assign({}, fields, this._util.collapseFormGroup(this.studentForm));
    this.loaderService.display(true);

    fields.additional_info_complete = true;
    delete fields.graduation;
    this._memberdata.updateFields(fields);
    return this._api.updateMemberRecord()
    .then((res: any) => {
      this.loaderService.display(false);
      this._memberdata.setAdditionalInfoComplete(true);
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
