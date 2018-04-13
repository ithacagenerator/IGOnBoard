import { Injectable } from '@angular/core';

@Injectable()
export class MemberDataService {

  private memberObj: any = { };
  private basicInfoComplete = false;

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

  getMember() {
    return this.memberObj;
  }

  updateFields(obj) {
    this.memberObj = Object.assign({}, this.memberObj, obj);
  }

  setBasicInformationComplete(status) {
    this.basicInfoComplete = status;
  }

  basicInformationComplete() {
    return this.basicInfoComplete;
  }
}
