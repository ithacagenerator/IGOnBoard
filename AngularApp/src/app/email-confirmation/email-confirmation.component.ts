import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

import * as promiseDoWhilst from 'promise-do-whilst';
import { MemberDataService } from '../services/member-data.service';

@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.css']
})
export class EmailConfirmationComponent {
  validated = false;

  constructor(
    private _api: ApiService,
    private _memberdata: MemberDataService,
    private _router: Router) {
    promiseDoWhilst(() => {
      return this._api.checkValidatedEmail()
      .then((v: any) => {
        this.validated = v;
        if (this.validated) {
          this._memberdata.updateFields(v);
        }
        return new Promise((resolve, reject) => {
          setTimeout(resolve, 1000);
        });
      });
    }, () => {
      return !this.validated;
    })
    .then(() => {
      this._router.navigate(['/basic-info']);
    })
    .catch((err) => {
      console.error(err.message);
    });
  }
}
