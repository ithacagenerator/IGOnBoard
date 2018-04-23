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

  getMember(omissions = null) {
    const m = Object.assign({}, {}, this.memberObj);
    omissions.forEach(k => {
      delete m[k];
    });
    return m;
  }

  updateFields(obj) {
    this.memberObj = Object.assign({}, this.memberObj, obj);
  }

  setBasicInformationComplete(status) {
    this.basicInfoComplete = !!status;
  }

  basicInformationComplete() {
    return this.basicInfoComplete;
  }

  seMembershipPoliciesComplete(status) {
    this._membershipPoliciesComplete = !!status;
  }

  membershipPoliciesComplete() {
    return this._membershipPoliciesComplete;
  }

  setLiabilityWaiverComplete(status) {
    this._liabilityWaverComplete = !!status;
  }

  liabilityWaverComplete() {
    return this._liabilityWaverComplete;
  }

  setAdditionalInfoComplete(status) {
    this._additionalInfoComplete = !!status;
  }

  additionalInfoComplete() {
    return this._additionalInfoComplete;
  }
}
