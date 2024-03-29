import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { MemberDataService } from '../services/member-data.service';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { UtilService } from '../services/util.service';
import { DOCUMENT } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorSnackBarComponent } from '../error-snack-bar/error-snack-bar.component';

import * as uuid from 'uuid';
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  public selected_membership_level = 'basic';
  public submit_clicked = false;
  public existingMember = false;
  public existingMemberForm: FormGroup = new FormGroup({});
  public notifyUrl;
  public returnUrl;
  private baseURL = 'https://ithacagenerator.org/onboard';

  existingMemberFormControl = new FormControl('', []);
  public paypal_buttons = [
    {
      key: 'basic',
      group: 'basic',
      hosted_button_id: 'JLEYTS7HT7YJ6',
      amount: 20
    },
    {
      key: 'basic-student',
      group: 'basic',
      hosted_button_id: '9AP4PRYJ85F3A',
      amount: 20 * 0.75
    },
    {
      key: 'standard',
      group: 'standard',
      hosted_button_id: 'ZT7NW89KKSSZU',
      amount: 35
    },
    {
      key: 'standard-student',
      group: 'standard',
      hosted_button_id: '4V77DZH2QCKCJ',
      amount: 35 * 0.75
    },
    {
      key: 'extra',
      group: 'extra',
      hosted_button_id: 'BQSQHVL65WDLG',
      amount: 75
    },
    {
      key: 'extra-student',
      group: 'extra',
      hosted_button_id: '73BET883EJ8TC',
      amount: 75 * 0.75
    },
  ];

  constructor(
    private loaderService: LoaderService,
    public _memberdata: MemberDataService,
    private _api: ApiService,
    private _router: Router,
    private _snackBar: MatSnackBar,
    public _util: UtilService,
    private _cd: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: any) { }

  ngOnInit() {
    this.selectLevel('standard');
  }

  submitPaypalForm(formName) {
    const correlationId = uuid.v4();
    const notifyId = uuid.v4();
    this.notifyUrl = `${this.baseURL}/notify/${notifyId}`;
    this.returnUrl = `${this.baseURL}/thanks/${correlationId}`;
    this._cd.detectChanges();
    const fields: any = { correlationId, notifyId };
    this.loaderService.display(true);
    this._memberdata.updateFields(fields);
    return this._api.updateMemberRecord()
    .then((res: any) => {
      this.loaderService.display(false);
      const hasServerErrorMessage = (res && res.error && res.error.error);
      if (!hasServerErrorMessage) {
        this.submit_clicked = true;
        const form = document.getElementById(formName);
        if (form) {
          this.loaderService.display(true);
          (form as any).submit();
        }
      } else {
        this._snackBar.openFromComponent(ErrorSnackBarComponent, {
          data: this._util.errorMessage(res.error),
          duration: 2000
        });
      }
    })
    .catch(error => {
      this.loaderService.display(false);
      this._snackBar.openFromComponent(ErrorSnackBarComponent, {
        data: this._util.errorMessage(error),
        duration: 2000
      });
    });
  }

  selectedForm() {
    return this.paypal_buttons.find(v => v.key === this.selected_membership_level);
  }

  selectLevel(level) {
    if (['basic', 'standard', 'extra'].indexOf(level) >= 0) {
      if (this._memberdata.student) {
        level = level + '-student';
      }
      this.selected_membership_level = level;
    }
  }

  specialCase() {
    if (this.existingMember) {
      return 'existing-member';
    }

    if (this._memberdata.requestFinancialAid) {
      return 'scholarship-request';
    }

    return '';
  }

  submitCompleteRegistration() {
    this.submit_clicked = true;
    const correlationId = uuid.v4();
    this._memberdata.updateFields({correlationId});
    this.handleNext();
  }


  handleNext() {
    const fields: any = {
      registrationComplete: true
    };
    this.loaderService.display(true);
    this._memberdata.updateFields(fields);
    return this._api.updateMemberRecord()
    .then((res: any) => {
      this.loaderService.display(false);
      const hasServerErrorMessage = (res && res.error && res.error.error);
      if (!hasServerErrorMessage) {
        this._util.navigateToLogicalNextStep(this._router);
      } else {
        this._snackBar.openFromComponent(ErrorSnackBarComponent, {
          data: this._util.errorMessage(res.error),
          duration: 2000
        });
      }
    })
    .catch(error => {
      this.loaderService.display(false);
      this._snackBar.openFromComponent(ErrorSnackBarComponent, {
        data: this._util.errorMessage(error),
        duration: 2000
      });
    });
  }
}
