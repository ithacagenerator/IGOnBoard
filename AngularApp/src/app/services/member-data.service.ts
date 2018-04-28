import { Injectable } from '@angular/core';

@Injectable()
export class MemberDataService {

  private memberObj: any = { };
  private basicInfoComplete = false;
  private _membershipPoliciesComplete = false;
  private _liabilityWaverComplete = false;
  private _additionalInfoComplete = false;

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
    return this.memberObj.phone || '(xxx) xxx-xxxx';
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
}
