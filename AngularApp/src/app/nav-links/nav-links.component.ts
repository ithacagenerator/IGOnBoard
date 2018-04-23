import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { MemberDataService } from '../services/member-data.service';
@Component({
  selector: 'app-nav-links',
  templateUrl: './nav-links.component.html',
  styleUrls: ['./nav-links.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavLinksComponent implements OnInit {

  showHamburger = false;

  constructor(public _memberdata: MemberDataService) { }

  toggleHamburger() {
    this.showHamburger = !this.showHamburger;
  }

  ngOnInit() {
  }

  membershipPoliciesDisabled() {
    return !this._memberdata.basicInformationComplete();
  }

  liabilityWaiverDisabled() {
    return !this._memberdata.membershipPoliciesComplete()
      || this.membershipPoliciesDisabled();
  }

  additionalInfoDisabled() {
    return !this._memberdata.liabilityWaverComplete()
      || this.liabilityWaiverDisabled();
  }

  paymentDisabled() {
    return !this._memberdata.additionalInfoComplete()
      || this.additionalInfoDisabled();
  }

}
