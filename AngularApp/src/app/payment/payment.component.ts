import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { MemberDataService } from '../services/member-data.service';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { UtilService } from '../services/util.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  public selected_membership_level = 'basic';
  public paypal_buttons = [
    {
      key: 'basic',
      hosted_button_id: 'JLEYTS7HT7YJ6'
    },
    {
      key: 'basic-student',
      hosted_button_id: '9AP4PRYJ85F3A'
    },
    {
      key: 'standard',
      hosted_button_id: 'ZT7NW89KKSSZU'
    },
    {
      key: 'standard-student',
      hosted_button_id: '4V77DZH2QCKCJ'
    },
    {
      key: 'extra',
      hosted_button_id: 'BQSQHVL65WDLG'
    },
    {
      key: 'extra-student',
      hosted_button_id: '73BET883EJ8TC'
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
  }

  submitPaypalForm(formName) {
    const form = document.getElementById(formName);
    if (form) {
      this.loaderService.display(true);
      (<any> form).submit();
    }

  }
}
