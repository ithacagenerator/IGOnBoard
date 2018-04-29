import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MemberDataService } from '../services/member-data.service';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import * as moment from 'moment';

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
    private _router: Router,
    public _memberdata: MemberDataService) {
    this.studentForm = new FormGroup({
      school: this.schoolFormControl,
      graduation: this.graduationFormControl
    });
  }

  now() {
    return moment().format();
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
    this._memberdata.updateFields({additional_info_complete: true});
    this._memberdata.setAdditionalInfoComplete(true);

    // api stuff and fallback

    this._router.navigate(['/payment']);
  }
}
