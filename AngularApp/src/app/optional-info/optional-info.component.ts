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

  genderFormCheckboxes: any = [
    {key: 'female', label: 'Female'},
    {key: 'male', label: 'Male'}
  ];

  whenBornFormCheckboxes: any = [
    {key: 'after1995', label: 'After 1995'},
    {key: '_1980_1995', label: '1980 - 1995'},
    {key: '_1965_1979', label: '1965 - 1979'},
    {key: '_1945-1964', label: '1945 - 1964'},
    {key: 'before1945', label: 'Before 1945'}
  ];

  ownBusinessCheckboxes: any = [
    {key: true, label: 'Yes'},
    {key: false, label: 'No'}
  ];

  educationLevelCheckboxes: any = [
    {key: 'less_than_high_school', label: 'Less than high school degree'},
    {key: 'high_school_degree_or_equivalent', label: 'High school degree or equivalent (e.g., GED)'},
    {key: 'some_college_but_no_degree', label: 'Some college but no degree'},
    {key: 'associate_degree', label: 'Associate degree'},
    {key: 'bachelor_degree', label: 'Bachelor degree'},
    {key: 'graduate_degree', label: 'Graduate degree'}
  ];

  collegeAffiliationCheckboxes: any = [
    {key: 'cornell_university', label: 'Cornell University'},
    {key: 'ithaca_college', label: 'Ithaca College'},
    {key: 'tompkins_county_community_college', label: 'Tompkins County Community College'}
  ];

  employmentStatusCheckboxes: any = [
    {key: 'employed_atleast_35_hpw', label: 'Employed, working 35 or more hours per week'},
    {key: 'employed_under_35_hpw', label: 'Employed, working 1-34 hours per week'},
    {key: 'not_employed_looking', label: 'Not employed, looking for work'},
    {key: 'not_employed_not_looking', label: 'Not employed, NOT looking for work'},
    {key: 'retired', label: 'Retired'},
    {key: 'unable_to_work', label: 'Unable to work'}
  ];

  checkbox_member_map: any = [
    {member: 'gender', cb: this.genderFormCheckboxes},
    {member: 'collegeAffiliations', cb: this.collegeAffiliationCheckboxes, multiple: true},
    {member: 'educationLevel', cb: this.educationLevelCheckboxes},
    {member: 'ownBusiness', cb: this.ownBusinessCheckboxes},
    {member: 'whenBorn', cb: this.whenBornFormCheckboxes}
  ];

  constructor(
    private loaderService: LoaderService,
    public _memberdata: MemberDataService,
    private _api: ApiService,
    private _router: Router,
    private _snackBar: MatSnackBar,
    public _util: UtilService,
    private _cd: ChangeDetectorRef) { }


  ngOnInit() {

    this.checkbox_member_map.forEach(mm => {
      if (mm.multiple) {
        this.genderFormCheckboxes.forEach(entry => {
          entry.value = this._memberdata[mm.member].indexOf(entry.key) >= 0;
        });
      } else {
        this.genderFormCheckboxes.forEach(entry => {
          entry.value = this._memberdata[mm.member] === entry.key;
        });
      }
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
