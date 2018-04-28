import { Injectable } from '@angular/core';
import { MemberDataService } from './member-data.service';

@Injectable()
export class UtilService {

  constructor(private _memberdata: MemberDataService) { }

  collapseFormGroup(fg) {
    const fields = {};
    Object.keys(fg.controls).forEach(k => {
      if (fg.controls[k].value === true ||
        fg.controls[k].value === false) {
        fields[k] = fg.controls[k].value;
      } else {
        fields[k] = `${fg.controls[k].value}`.trim();
      }
    });
    return fields;
  }

  navigateToLogicalNextStep(_router) {
    if (!this._memberdata.basicInformationComplete()) {
      _router.navigate(['/basic-info']);
    } else if (!this._memberdata.membershipPoliciesComplete()) {
      _router.navigate(['/membership-policies']);
    } else if (!this._memberdata.liabilityWaverComplete()) {
      _router.navigate(['/waiver']);
    } else if (!this._memberdata.additionalInfoComplete()) {
      _router.navigate(['/additional-info']);
    } else {
      _router.navigate(['/payment']);
    }
  }

  isBoolean(v) {
    return v === true || v === false;
  }
}
