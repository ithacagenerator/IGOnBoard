import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MemberDataService } from './member-data.service';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/do';

@Injectable()
export class ApiService {
  baseUrl = 'https://ithacagenerator.org/onboard/v1';
  sentValidationEmail = false;
  public basePath = '/onboard';
  constructor(
    private _http: HttpClient,
    private _member: MemberDataService) { }

  requestEmailConfirmation(): Promise<any> {
    if (!this.sentValidationEmail) {
      return this._http
      .post(`${this.baseUrl}/test-email`,
        this._member.getMember()
      )
      .timeout(5000)
      .do(res => {
        this.sentValidationEmail = true;
      })
      .toPromise();
    }
    return Promise.resolve();
  }

  // updates the member record by email address
  // the result comes back 422 if the member already has an active
  // completed registration
  updateMemberRecord(omissions = ['membershipPoliciesAgreedTo', 'waiverAccepted']) {
    const member = this._member.getMember(omissions);
    if (member.graduation) {
      member.graduation = member.graduation.format();
    }
    return this._http
    .put(`${this.baseUrl}/member-registration`,
      member
    )
    .timeout(5000)
    .toPromise();
  }

  // fetches the member associated with the email from the database
  // the result comes back 422 if the member already has an active
  // completed registration
  loadMemberRecord() {
    return this._http
    .get(`${this.baseUrl}/member-registration/${this._member.getMember().email}`)
    .timeout(5000)
    .toPromise();
  }

  checkValidatedEmail() {
    if (this.sentValidationEmail) {
      return this._http
      .get(`${this.baseUrl}/email-validated/${this._member.email}`)
      .timeout(5000)
      .toPromise();
    }
    return Promise.reject(new Error('Validation email not yet sent'));
  }

}
