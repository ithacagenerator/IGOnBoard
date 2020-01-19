import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MemberDataService } from './member-data.service';
import { timeout, tap } from 'rxjs/operators';

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
      .pipe(
        timeout(5000),
        tap(res => {
          this.sentValidationEmail = true;
        })
      )
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
      member.graduation = member.graduation.format('M/D/YYYY');
    }
    return this._http
    .put(`${this.baseUrl}/member-registration`,
      member
    )
    .pipe(timeout(5000))
    .toPromise();
  }

  // fetches the member associated with the email from the database
  // the result comes back 422 if the member already has an active
  // completed registration
  loadMemberRecord() {
    const email = this._member.getMember().email ||
      this._member.getMember().correlationId;
    return this._http
    .get(`${this.baseUrl}/member-registration/${email}`)
    .pipe(timeout(5000))
    .toPromise();
  }

  checkValidatedEmail() {
    if (this.sentValidationEmail) {
      return this._http
      .get(`${this.baseUrl}/email-validated/${this._member.email}`)
      .pipe(timeout(5000))
      .toPromise();
    }
    return Promise.reject(new Error('Validation email not yet sent'));
  }

}
