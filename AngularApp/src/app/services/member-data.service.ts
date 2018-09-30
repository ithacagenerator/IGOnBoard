import { Injectable } from '@angular/core';

@Injectable()
export class MemberDataService {

  private memberObj: any = { phone: '(xxx) xxx-xxxx' };
  private basicInfoComplete = false;
  private _membershipPoliciesComplete = false;
  private _liabilityWaverComplete = false;
  private _additionalInfoComplete = false;
  private _optionalInfoComplete = false;
  private _registrationComplete = false;

  constructor() { }

  set firstname(value) {
    this.memberObj.firstname = value;
  }
  get firstname() {
    return this.memberObj.firstname || '';
  }

  set lastname(value) {
    this.memberObj.lastname = value;
  }
  get lastname() {
    return this.memberObj.lastname || '';
  }

  set phone(value) {
    this.memberObj.phone = value;
  }
  get phone() {
    return this.memberObj.phone;
  }

  set email(value) {
    this.memberObj.email = value;
  }
  get email() {
    return this.memberObj.email || '';
  }

  set waiverAccepted(value) {
    this.memberObj.waiverAccepted = !!value;
  }
  get waiverAccepted() {
    return !!this.memberObj.waiverAccepted;
  }

  set membershipPoliciesAgreedTo(value) {
    this.memberObj.membershipPoliciesAgreedTo = !!value;
  }
  get membershipPoliciesAgreedTo() {
    return !!this.memberObj.membershipPoliciesAgreedTo;
  }

  set over18(value) {
    this.memberObj.over18 = value;
  }
  get over18() {
    return this.memberObj.over18; // don't force a boolean response
  }

  set requestFinancialAid(value) {
    this.memberObj.requestFinancialAid = value;
  }
  get requestFinancialAid() {
    return this.memberObj.requestFinancialAid; // don't force a boolean response
  }

  set student(value) {
    this.memberObj.student = !!value;
  }
  get student() {
    return !!this.memberObj.student;
  }

  set school(value) {
    this.memberObj.school = value;
  }
  get school() {
    return this.memberObj.school || '';
  }

  set graduation(value) {
    this.memberObj.graduation = value;
  }
  get graduation() {
    return this.memberObj.graduation || '';
  }

  set studentid(value) {
    this.memberObj.studentid = value._content;
  }
  get studentid() {
    return this.memberObj.studentid;
  }

  set guardian(value) {
    this.memberObj.guardian = value;
  }
  get guardian() {
    return this.memberObj.guardian || '';
  }

  set guardian_phone(value) {
    this.memberObj.guardian_phone = value;
  }
  get guardian_phone() {
    return this.memberObj.guardian_phone;
  }

  set interests_other(value) {
    this.memberObj.interests_other = value;
  }
  get interests_other() {
    return this.memberObj.interests_other || '';
  }

  setOptionalField(key, value) {
    if (!this.memberObj.optional) {
      this.memberObj.optional = {};
    }

    if (!value) {
      delete this.memberObj.optional[key];
    } else {
      this.memberObj.optional[key] = value;
    }
  }
  getOptionalField(key) {
    return this.memberObj && this.memberObj.optional ? this.memberObj.optional[key] : '';
  }

  set gender_other(value) {
    this.setOptionalField('gender_other', value);
  }
  get gender_other() {
    return this.getOptionalField('gender_other');
  }

  set gender(value) {
    this.setOptionalField('gender', value);
  }
  get gender() {
    return this.getOptionalField('gender');
  }

  set collegeAffiliations(value) {
    if (Array.isArray(value)) {
      this.setOptionalField('collegeAffiliations', value);
    } else {
      this.setOptionalField('collegeAffiliations', null);
    }
  }
  get collegeAffiliations() {
    const affiliation = this.getOptionalField('collegeAffiliations');
    if (Array.isArray(affiliation)) {
      return affiliation;
    } else {
      return [];
    }
  }

  set collegeAffiliation_other(value) {
    this.setOptionalField('collegeAffiliation_other', value);
  }
  get collegeAffiliation_other() {
    return this.getOptionalField('collegeAffiliation_other');
  }

  set educationLevel(value) {
    this.setOptionalField('educationLevel', value);
  }
  get educationLevel() {
    return this.getOptionalField('educationLevel');
  }

  set ownBusiness(value) {
    this.setOptionalField('ownBusiness', value);
  }
  get ownBusiness() {
    return this.getOptionalField('ownBusiness');
  }

  set whenBorn(value) {
    this.setOptionalField('whenBorn', value);
  }
  get whenBorn() {
    return this.getOptionalField('whenBorn');
  }

  set employmentStatus(value) {
    this.setOptionalField('employmentStatus', value);
  }
  get employmentStatus() {
    return this.getOptionalField('employmentStatus');
  }

  set householdIncome(value) {
    this.setOptionalField('householdIncome', value);
  }
  get householdIncome() {
    return this.getOptionalField('householdIncome');
  }

  set stewardships(value) {
    if (Array.isArray(value)) {
      this.setOptionalField('stewardships', value);
    } else {
      this.setOptionalField('stewardships', null);
    }
  }
  get stewardships() {
    const stewardship = this.getOptionalField('stewardships');
    if (Array.isArray(stewardship)) {
      return stewardship;
    } else {
      return [];
    }
  }

  set stewardships_other(value) {
    this.setOptionalField('stewardships_other', value);
  }
  get stewardships_other() {
    return this.getOptionalField('stewardships_other');
  }

  set heardAboutVia(value) {
    if (Array.isArray(value)) {
      this.setOptionalField('heard_about_via', value);
    } else {
      this.setOptionalField('heard_about_via', null);
    }
  }
  get heardAboutVia() {
    const heardAbout = this.getOptionalField('heard_about_via');
    if (Array.isArray(heardAbout)) {
      return heardAbout;
    } else {
      return [];
    }
  }

  set heardAboutVia_other(value) {
    this.setOptionalField('heard_about_via_other', value);
  }
  get heardAboutVia_other() {
    return this.getOptionalField('heard_about_via_other');
  }

  hasInterest(key) {
    if (Array.isArray(this.memberObj.interests)) {
      return this.memberObj.interests.indexOf(key) >= 0;
    }
    return false;
  }

  changeInterest($event, key) {
    const temp = new Set(this.memberObj.interests || []);
    if ($event.checked) {
      temp.add(key);
    } else {
      temp.delete(key);
    }
    this.memberObj.interests = Array.from(temp);
  }

  changeOptionalResponse($event, field, key, entries?, allowMultiple?) {
    if (allowMultiple) {
      let currentValues = this[field];
      if (!Array.isArray(currentValues)) {
        currentValues = [];
      }
      currentValues = new Set(currentValues);
      if ($event.checked) {
        currentValues.add(key);
      } else {
        currentValues.delete(key);
      }
      currentValues = Array.from(currentValues);
      this[field] = currentValues;
    } else {
      if ($event.checked) {
        if (entries) {
          if (!allowMultiple) {
            entries.forEach(entry => {
              entry.value = entry.key === key;
            });
          }
        }
        this[field] = key;
      } else {
        this[field] = null;
      }
    }
  }

  getMember(omissions = []) {
    const m = Object.assign({}, {}, this.memberObj);
    omissions.forEach(k => {
      delete m[k];
    });
    return m;
  }

  updateFields(obj) {
    this.memberObj = Object.assign({}, this.memberObj, obj);
    this.setBasicInformationComplete(this.memberObj.basic_info_complete);
    this.setLiabilityWaiverComplete(this.memberObj.waiver_complete);
    this.setMembershipPoliciesComplete(this.memberObj.membership_policies_complete);
    this.setAdditionalInfoComplete(this.memberObj.additional_info_complete);
    this.setOptionalInfoComplete(this.memberObj.optional_info_complete);
    this.setRegistrationComplete(this.memberObj.registrationComplete);
  }

  setBasicInformationComplete(status) {
    this.basicInfoComplete = !!status;
  }

  basicInformationComplete() {
    return this.basicInfoComplete;
  }

  setMembershipPoliciesComplete(status) {
    this._membershipPoliciesComplete = !!status;
  }

  membershipPoliciesComplete() {
    return this._membershipPoliciesComplete && !!this.memberObj.membershipPoliciesAgreedTo;
  }

  setLiabilityWaiverComplete(status) {
    this._liabilityWaverComplete = !!status;
  }

  liabilityWaverComplete() {
    return this._liabilityWaverComplete && !!this.memberObj.waiverAccepted;
  }

  setAdditionalInfoComplete(status) {
    this._additionalInfoComplete = !!status;
  }

  additionalInfoComplete() {
    return this._additionalInfoComplete;
  }

  setOptionalInfoComplete(status) {
    this._optionalInfoComplete = !!status;
  }

  optionalInfoComplete() {
    return this._optionalInfoComplete;
  }

  setRegistrationComplete(status) {
    this._registrationComplete = !!status;
  }

  registrationComplete() {
    return this._registrationComplete;
  }

}
