import { Injectable } from '@angular/core';

@Injectable()
export class MemberDataService {

  private memberObj = { };

  constructor() { }

  updateFields(obj) {
    this.memberObj = Object.assign({}, this.memberObj, obj);
  }
}
