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

}
