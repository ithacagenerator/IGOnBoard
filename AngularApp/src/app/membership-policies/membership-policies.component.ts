import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemberDataService } from '../services/member-data.service';
import { LoaderService } from '../services/loader.service';
import { ApiService } from '../services/api.service';
import { MatSnackBar } from '@angular/material';
import { ErrorSnackBarComponent } from '../error-snack-bar/error-snack-bar.component';

@Component({
  selector: 'app-membership-policies',
  templateUrl: './membership-policies.component.html',
  styleUrls: ['./membership-policies.component.scss']
})
export class MembershipPoliciesComponent implements OnInit {

  set checked(value) {
    this._memberData.membershipPoliciesAgreedTo = !!value;
  }
  get checked() {
    return this._memberData.membershipPoliciesAgreedTo;
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
    this._loaderService.display(true);
    this._memberData.updateFields({membership_policies_complete: true});
    this._api.updateMemberRecord(['waiverAccepted'])
    .then(res => {
      this._loaderService.display(false);
      this._memberData.setMembershipPoliciesComplete(true);
      this._router.navigate(['/waiver']);
    })
    .catch(res => {
      this._memberData.updateFields({membership_policies_complete: true});
      this._loaderService.display(false);
      this._snackBar.openFromComponent(ErrorSnackBarComponent, {
        data: res && res.error && res.error.error ? res.error.error : `Unexpected Error Status Code ${res.status}`,
        duration: 2000
      });
    });
  }
}
