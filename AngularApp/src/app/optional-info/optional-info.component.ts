import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { MemberDataService } from '../services/member-data.service';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { UtilService } from '../services/util.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorSnackBarComponent } from '../error-snack-bar/error-snack-bar.component';

@Component({
  selector: 'app-optional-info',
  templateUrl: './optional-info.component.html',
  styleUrls: ['./optional-info.component.scss']
})
export class OptionalInfoComponent implements OnInit {

  optionalGenderForm: FormGroup = new FormGroup({});

  genderFormCheckboxes: any = [
    {key: 'female', label: 'Female'},
    {key: 'male', label: 'Male'}
  ];
  otherGenderControl = new FormControl('gender_other', []);


  constructor(
    private loaderService: LoaderService,
    public _memberdata: MemberDataService,
    private _api: ApiService,
    private _router: Router,
    private _snackBar: MatSnackBar,
    public _util: UtilService,
    private _cd: ChangeDetectorRef) { }


  ngOnInit() {

    this.genderFormCheckboxes.forEach(entry => {
      this[`${entry.key}FormControl`] = new FormControl('', []);
      this.optionalGenderForm.addControl(entry.key, this[`${entry.key}FormControl`]);
      entry.value = this._memberdata.gender === entry.key;
    });

    this._cd.detectChanges();
  }

  handleNextDisabled() {
    return false;
  }

  handleNext() {
    const fields: any = {};
    this.loaderService.display(true);

    fields.optional_info_complete = true;
    this._memberdata.updateFields(fields);
    return this._api.updateMemberRecord()
    .then((res: any) => {
      this.loaderService.display(false);
      this._memberdata.setOptionalInfoComplete(true);
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

  getCbFormControl(key) {
    return this[`${key}FormControl`];
  }

}
