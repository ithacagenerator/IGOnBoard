import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { MemberDataService } from '../services/member-data.service';
import { ApiService } from '../services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-thanks',
  templateUrl: './thanks.component.html',
  styleUrls: ['./thanks.component.scss']
})
export class ThanksComponent implements AfterViewInit {

  constructor(
    private loaderService: LoaderService,
    public _memberdata: MemberDataService,
    private _api: ApiService,
    private _router: Router,
    private _routeParams: ActivatedRoute,
    private _cd: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _util: UtilService) { }

  ngAfterViewInit() {
    this._routeParams.params.subscribe( params => {
      if (params['correlationId']) {
        this._memberdata.updateFields({correlationId: params['correlationId']});
        this.checkForRegistrationInProgress()
        .then(() => {
          this._cd.detectChanges();
        });
      }
    });
  }

  checkForRegistrationInProgress() {
    return this._api.loadMemberRecord()
    .then((member: any) => {
      this._memberdata.updateFields(member);
    });
  }
}
