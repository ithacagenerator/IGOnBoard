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

  heardAboutUsCheckboxes: any = [
    {key: 'recruted_by_member', label: 'A current member recruited me'},
    {key: 'walked_in', label: 'I walked in off the street and asked what IG was'},
    {key: 'active_seeker', label: 'I\'m new to the area and looked for the local makerspace'},
    {key: 'website_newsletter', label: 'I read about IG on the website or newsletter'},
    {key: 'print_media', label: 'I read about IG in the newspaper or a magazine'},
    {key: 'radio', label: 'I heard about it on the radio'},
    {key: 'television', label: 'I saw something about IG on television'}
  ];

  householdIncomeCheckboxes: any = [
    {key: 'less_than_10k', label: '$0 to $9,999'},
    {key: '_10k_to_25k', label: '$10,000 to $24,999'},
    {key: '_25k_to_50k', label: '$25,000 to $49,999'},
    {key: '_50k_to_75k', label: '$50,000 to $74,999'},
    {key: '_75k_to_100k', label: '$75,000 to $99,999'},
    {key: '_100k_to_125k', label: '$100,000 to $124,999'},
    {key: '_125k_to_150k', label: '$125,000 to $149,999'},
    {key: '_150k_to_175k', label: '$150,000 to $174,999'},
    {key: '_175k_to_200k', label: '$175,000 to $199,999'},
    {key: 'more_than_200k', label: '$200,000 and up'}
  ];

  stewardshipCheckboxes: any = [
    {key: 'environmental_responsibility', label: 'Environmental responsibility'},
    {key: 'social_justice', label: 'Social Justice'},
    {key: 'citizen_science', label: 'Citizen Science'},
    {key: 'steam', label: 'STEAM'},
    {key: 'children_youth', label: 'Children & Youth'},
    {key: 'education_literacy', label: 'Education & Literacy'},
    {key: 'senior_citizens', label: 'Seniors'},
    {key: 'arts_culture', label: 'Arts & Culture'}
  ];

  checkbox_member_map: any = [
    {member: 'gender', cb: this.genderFormCheckboxes},
    {member: 'collegeAffiliations', cb: this.collegeAffiliationCheckboxes, multiple: true},
    {member: 'educationLevel', cb: this.educationLevelCheckboxes},
    {member: 'ownBusiness', cb: this.ownBusinessCheckboxes},
    {member: 'whenBorn', cb: this.whenBornFormCheckboxes},
    {member: 'employmentStatus', cb: this.employmentStatusCheckboxes},
    {member: 'householdIncome', cb: this.householdIncomeCheckboxes},
    {member: 'stewardships', cb: this.stewardshipCheckboxes, multiple: true},
    {member: 'heardAboutVia', cb: this.heardAboutUsCheckboxes, multiple: true}
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
        mm.cb.forEach(entry => {
          entry.value = this._memberdata[mm.member].indexOf(entry.key) >= 0;
        });
      } else {
        mm.cb.forEach(entry => {
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
