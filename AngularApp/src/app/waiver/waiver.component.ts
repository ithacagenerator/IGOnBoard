import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemberDataService } from '../services/member-data.service';
import { LoaderService } from '../services/loader.service';
import { ApiService } from '../services/api.service';
import { MatSnackBar } from '@angular/material';
import { ErrorSnackBarComponent } from '../error-snack-bar/error-snack-bar.component';

@Component({
  selector: 'app-waiver',
  templateUrl: './waiver.component.html',
  styleUrls: ['./waiver.component.scss']
})
export class WaiverComponent implements OnInit {

  set checked(value) {
    this._memberData.waiverAccepted = !!value;
  }
  get checked() {
    return this._memberData.waiverAccepted;
  }

  constructor(
    private _api: ApiService,
    private _loaderService: LoaderService,
    private _router: Router,
    private _memberData: MemberDataService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
  }

  handleNext() {
    this._router.navigate(['/additional-info']);
  }
}
