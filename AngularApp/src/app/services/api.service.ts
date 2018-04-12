import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MemberDataService } from './member-data.service';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class ApiService {
  baseUrl = 'https://ithacagenerator.org/onboard/v1';
  sentValidationEmail = false;

  constructor(
    private _http: HttpClient,
    private _member: MemberDataService) { }

  requestEmailConfirmation() {
    if (!this.sentValidationEmail) {
      this.sentValidationEmail = true;
      return this._http.post(`${this.baseUrl}/test-email`, this._member.getMember()).toPromise();
    }
  }

}
