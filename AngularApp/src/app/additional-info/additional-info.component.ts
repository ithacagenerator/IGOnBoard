import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
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

    let illegalDate = false;
    if (!moment.isMoment(control.value)) {
      illegalDate = true; // it has to be a moment
    } else {
      if (!control.value.isValid()) {
        illegalDate = true; // it has to be a _valid_ moment
      } else {
        // sometimes moment lies... but we can use the _i state to learn more
        // we only care about the format 'M/D/YYYY'
        let somethingParsed = false;
        somethingParsed = somethingParsed || (moment(input, 'M/D/YYYY').format('M/D/YYYY') === input);
        if (!somethingParsed) {
          illegalDate = true;
        }
      }
    }
    // console.log(illegalDate, control.value, input);
    return illegalDate ? {'illegalDate': {value: control.value}} : null;
  };
}

@Component({
  selector: 'app-additional-info',
  templateUrl: './additional-info.component.html',
  styleUrls: ['./additional-info.component.scss']
})
export class AdditionalInfoComponent implements OnInit {

  schoolFormControl = new FormControl('', [Validators.required]);
  graduationFormControl = new FormControl('', [Validators.required, validDateValidator()]);
  studentForm: FormGroup = new FormGroup({});

  guardianFormControl = new FormControl('', [Validators.required]);
  guardianPhoneFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/(\(?[0-9]{3}\)?-?\s?[0-9]{3}-?[0-9]{4})/)
  ]);
  under18Form: FormGroup = new FormGroup({});

  interestsForm: FormGroup = new FormGroup({});
  interestFormCheckboxes: any = [
    {key: 'threedprinting', label: '3D Printing'},
    {key: 'ceramics', label: 'Ceramics'},
    {key: 'electronics', label: 'Electronics'},
    {key: 'jewelrymaking', label: 'Jewelry Making'},
    {key: 'lasercutting', label: 'Laser Cutting'},
    {key: 'metalworking', label: 'Metal Working'},
    {key: 'software', label: 'Software'},
    {key: 'woodworking', label: 'Wood Working'}
  ];
  otherInterestsControl = new FormControl('interests_other', []);

  constructor(
    private loaderService: LoaderService,
    public _memberdata: MemberDataService,
    private _api: ApiService,
    private _router: Router,
    private _snackBar: MatSnackBar,
    public _util: UtilService,
    private _cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    if (this._memberdata.student) {
      this.studentForm.addControl('school', this.schoolFormControl);
      this.studentForm.addControl('graduation', this.graduationFormControl);
    }

    if (!this._memberdata.over18) {
      this.under18Form.addControl('guardian', this.guardianFormControl);
      this.under18Form.addControl('guardian_phone', this.guardianPhoneFormControl);
    }

    this.interestFormCheckboxes.forEach(entry => {
      this[`${entry.key}FormControl`] = new FormControl('', []);
      this.interestsForm.addControl(entry.key, this[`${entry.key}FormControl`]);
      entry.value = this._memberdata.hasInterest(entry.key);
    });

    this._cd.detectChanges();
  }

  now() {
    return moment(moment().format('M/D/YYYY'), 'M/D/YYYY');
  }

  getRequiredStudentErrorMessage(field) {
    return this.studentForm.get(field).hasError('required') ? 'You must enter a value' : 'Invalid date';
  }

  getRequiredUnder18ErrorMessage(field) {
    return this.under18Form.get(field).hasError('required') ? 'You must enter a value' : 'Invalid date';
  }

  clearDefaultPhone() {
    if (this._memberdata.guardian_phone === '(xxx) xxx-xxxx') {
      this._memberdata.guardian_phone = '';
      this._cd.detectChanges();
    }
  }

  getPhoneErrorMessage() {
    return this.guardianPhoneFormControl.hasError('required') ? 'You must enter a value' :
      this.guardianPhoneFormControl.hasError('pattern') ? 'Format must be (xxx) xxx-xxxx' : '';
  }

  handleNextDisabled() {
    if (this._memberdata.student) {
      if (this.studentForm.invalid || !this._memberdata.studentid) {
        return true;
      }
    }

    if (this._memberdata.over18 === false) {
      if (this.under18Form.invalid) {
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

  getCbFormControl(key) {
    return this[`${key}FormControl`];
  }
}
