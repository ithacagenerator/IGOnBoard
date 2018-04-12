import { Injectable } from '@angular/core';

@Injectable()
export class MemberDataService {

  private memberObj = { };

  constructor() { }

  getMember() {
    return this.memberObj;
  }

  updateFields(obj) {
    this.memberObj = Object.assign({}, this.memberObj, obj);
  }
}
